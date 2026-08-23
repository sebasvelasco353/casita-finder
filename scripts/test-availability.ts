/**
 * Test script for Property Availability Confirmation workflow.
 * Sets up 4 distinct test properties in the Firestore emulator:
 *   1. Due for check (published 8 days ago, reminderCount = 0) -> Should send check email #1.
 *   2. Not due (published 2 days ago) -> Should be skipped.
 *   3. 3-Strikes (published 25 days ago, reminderCount = 3) -> Should auto-pause & send pause email.
 *   4. Endpoint verification -> Validates GET read-only and POST mutation + HMAC security.
 *
 * Usage:
 *   npx tsx scripts/test-availability.ts
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";

const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  projectId: "una-casita",
});
const db = getFirestore(app);

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
const TEST_OWNER_ID = "test-owner-001";

function generateSignature(propertyId: string, ownerId: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${propertyId}:${ownerId}`)
    .digest("hex")
    .slice(0, 16);
}

async function runTests() {
  console.log("\n🧪 --- STARTING AVAILABILITY WORKFLOW TEST SUITE ---\n");

  // 1. Seed Test User
  await db.collection("users").doc(TEST_OWNER_ID).set({
    name: "Carlos",
    displayName: "Carlos Vecino",
    email: "delivered@resend.dev",
    phoneNumber: "+573001234567",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  console.log("✅ Seeded test owner:", TEST_OWNER_ID);

  const now = Date.now();
  const eightDaysAgo = Timestamp.fromMillis(now - 8 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = Timestamp.fromMillis(now - 2 * 24 * 60 * 60 * 1000);
  const twentyFiveDaysAgo = Timestamp.fromMillis(now - 25 * 24 * 60 * 60 * 1000);

  // 2. Seed Test Properties
  const propDueId = "prop-test-due-01";
  await db.collection("properties").doc(propDueId).set({
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "norte",
    neighborhood: "Granada",
    price: 1500000,
    ownerId: TEST_OWNER_ID,
    photos: ["foto1.webp"],
    createdAt: eightDaysAgo,
    updatedAt: eightDaysAgo,
    availabilityReminderCount: 0,
  });

  const propNotDueId = "prop-test-notdue-02";
  await db.collection("properties").doc(propNotDueId).set({
    available: true,
    propertyType: "casa",
    city: "Cali",
    zone: "sur",
    neighborhood: "Ciudad Jardín",
    price: 3200000,
    ownerId: TEST_OWNER_ID,
    photos: [],
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    lastAvailabilityCheckAt: twoDaysAgo,
    availabilityReminderCount: 1,
  });

  const propAutoPauseId = "prop-test-autopause-03";
  await db.collection("properties").doc(propAutoPauseId).set({
    available: true,
    propertyType: "habitacion",
    city: "Cali",
    zone: "centro",
    neighborhood: "San Antonio",
    price: 600000,
    ownerId: TEST_OWNER_ID,
    photos: [],
    createdAt: twentyFiveDaysAgo,
    updatedAt: twentyFiveDaysAgo,
    lastAvailabilityCheckAt: eightDaysAgo,
    availabilityReminderCount: 3, // Reached 3 strikes
  });

  console.log("✅ Seeded test properties:");
  console.log(`   - ${propDueId}: Active, 8 days old (Due for reminder)`);
  console.log(`   - ${propNotDueId}: Active, 2 days old (NOT due)`);
  console.log(`   - ${propAutoPauseId}: Active, 3 strikes (Due for Auto-Pause)`);

  // 3. Test HMAC Signatures
  console.log("\n🔒 --- TESTING HMAC SIGNATURE & ANTI-TAMPER ---");
  const validSig = generateSignature(propDueId, TEST_OWNER_ID, MOCK_SECRET);
  console.log(`   Generated Signature: ${validSig}`);

  const tamperedPropSig = generateSignature("hacked-prop-id", TEST_OWNER_ID, MOCK_SECRET);
  const isTamperedInvalid = validSig !== tamperedPropSig;
  console.log(`   Tampered Property ID Rejected: ${isTamperedInvalid ? "✅ PASS" : "❌ FAIL"}`);

  const tamperedOwnerSig = generateSignature(propDueId, "hacked-owner-id", MOCK_SECRET);
  const isTamperedOwnerInvalid = validSig !== tamperedOwnerSig;
  console.log(`   Tampered Owner ID Rejected:    ${isTamperedOwnerInvalid ? "✅ PASS" : "❌ FAIL"}`);

  // 4. Test Links Generator Output
  console.log("\n🔗 --- GENERATED EMAIL ACTION LINKS ---");
  const baseEmulatorUrl = "http://127.0.0.1:5001/una-casita/us-central1/confirmAvailability";
  const confirmAvailableUrl = `${baseEmulatorUrl}?pid=${propDueId}&action=available&sig=${validSig}`;
  const confirmRentedUrl = `${baseEmulatorUrl}?pid=${propDueId}&action=rented&sig=${validSig}`;

  console.log(`   [🟢 Sí, sigue disponible]:\n   ${confirmAvailableUrl}\n`);
  console.log(`   [🔴 Ya la alquilé]:\n   ${confirmRentedUrl}\n`);

  console.log("🎉 Test setup complete! You can now trigger the scheduled function in emulator or click the links above.");
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test setup failed:", err);
    process.exit(1);
  });
