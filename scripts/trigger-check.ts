/**
 * Script to trigger the availability check directly against the local Firestore emulator.
 * Bypasses the need for `firebase login` or `firebase functions:shell`.
 *
 * Usage:
 *   npx tsx scripts/trigger-check.ts
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

import { readFileSync, existsSync } from "fs";
import { join } from "path";

process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_REMINDERS = 3;

function getSecret(): string {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  const secretPath = join(process.cwd(), "functions/.secret.local");
  if (existsSync(secretPath)) {
    const match = readFileSync(secretPath, "utf-8").match(/RESEND_API_KEY=(.+)/);
    if (match) return match[1].trim();
  }
  return "re_test_key_for_local_emulator";
}

const MOCK_SECRET = getSecret();

const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  projectId: "una-casita",
});
const db = getFirestore(app);

function generateAvailabilitySignature(propertyId: string, ownerId: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${propertyId}:${ownerId}`)
    .digest("hex")
    .slice(0, 16);
}

function getActionUrl(action: "available" | "rented", propertyId: string, ownerId: string, secret: string): string {
  const sig = generateAvailabilitySignature(propertyId, ownerId, secret);
  const base = "http://127.0.0.1:5001/una-casita/us-central1/confirmAvailability";
  return `${base}?pid=${encodeURIComponent(propertyId)}&action=${action}&sig=${sig}`;
}

async function runCheck() {
  console.log("🚀 Running availability check against local emulator (localhost:8080)...\n");
  const now = Date.now();
  const sevenDaysAgo = now - SEVEN_DAYS_MS;

  const snap = await db.collection("properties").where("available", "==", true).get();

  if (snap.empty) {
    console.log("ℹ️ No active properties found in Firestore emulator.");
    console.log("💡 Run `npx tsx scripts/test-availability.ts` first to seed test properties.\n");
    return;
  }

  for (const doc of snap.docs) {
    const property = doc.data();
    const propertyId = doc.id;

    try {
      const lastCheck = property.lastAvailabilityCheckAt as Timestamp | undefined;
      const created = property.createdAt as Timestamp | undefined;
      const referenceTime = lastCheck ? lastCheck.toMillis() : (created ? created.toMillis() : 0);

      if (referenceTime > sevenDaysAgo) {
        console.log(`⏩ [SKIPPED] ${propertyId}: Checked recently (< 7 days ago).`);
        continue;
      }

      if (!property.ownerId) continue;

      const ownerSnap = await db.collection("users").doc(property.ownerId).get();
      const owner = ownerSnap.data();
      if (!owner?.email) continue;

      const reminderCount = property.availabilityReminderCount ?? 0;

      if (reminderCount >= MAX_REMINDERS) {
        // Auto-pause listing after 3 missed reminders
        await doc.ref.update({
          available: false,
          autoPausedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(`🔴 [AUTO-PAUSED] ${propertyId}: Exceeded 3 reminders. Listing marked as available: false.`);
        console.log(`   📧 Notification sent to: ${owner.email}`);
      } else {
        // Update reminder count & check timestamp
        const confirmAvailableUrl = getActionUrl("available", propertyId, property.ownerId, MOCK_SECRET);
        const confirmRentedUrl = getActionUrl("rented", propertyId, property.ownerId, MOCK_SECRET);

        await doc.ref.update({
          lastAvailabilityCheckAt: FieldValue.serverTimestamp(),
          availabilityReminderCount: FieldValue.increment(1),
        });

        console.log(`🟢 [REMINDER SENT] ${propertyId}: Reminder #${reminderCount + 1} dispatched.`);
        console.log(`   📧 Sent to: ${owner.email}`);
        console.log(`   🔗 [Sí, sigue disponible]: ${confirmAvailableUrl}`);
        console.log(`   🔗 [Ya la alquilé]:        ${confirmRentedUrl}`);
      }
    } catch (err) {
      console.error(`❌ Error on property ${propertyId}:`, err);
    }
  }

  console.log("\n✨ Availability check execution finished.");
}

runCheck()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
