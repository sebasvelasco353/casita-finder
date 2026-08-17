// Crea un usuario de Firebase Auth (login por teléfono) por cada owner de
// owners.json, y su doc en users/{uid} (uid real de Auth, no el teléfono).
// Idempotente: si el teléfono ya tiene cuenta, reusa el uid en vez de
// crear uno nuevo. Sin --prod corre contra el emulador local.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync, writeFileSync } from "fs";
import type { User } from "../src/types";

const isProd = process.argv.includes("--prod");

if (!isProd) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";
}

const app = initializeApp({ projectId: "una-casita" });
const auth = getAuth(app);
const db = getFirestore(app);

type Owner = Omit<User, "createdAt" | "updatedAt"> & { createdAt: null; updatedAt: null };

const owners: Owner[] = JSON.parse(readFileSync("owners.json", "utf-8"));

const skipped: { phoneNumber: string; displayName: string; reason: string }[] = [];
const uidMap: Record<string, { uid: string; displayName: string }> = {};
let created = 0;
let reused = 0;

async function getOrCreateAuthUser(owner: Owner, e164: string) {
  try {
    const existing = await auth.getUserByPhoneNumber(e164);
    reused++;
    return existing.uid;
  } catch (err) {
    if ((err as { code?: string }).code !== "auth/user-not-found") throw err;
  }

  const user = await auth.createUser({ phoneNumber: e164, displayName: owner.displayName });
  created++;
  return user.uid;
}

async function processOwner(owner: Owner) {
  const e164 = `+${owner.phoneNumber}`;
  try {
    const uid = await getOrCreateAuthUser(owner, e164);
    uidMap[owner.phoneNumber] = { uid, displayName: owner.displayName };

    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        name: owner.name,
        lastName: owner.lastName,
        displayName: owner.displayName,
        email: owner.email,
        phoneNumber: e164,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (err) {
    skipped.push({
      phoneNumber: owner.phoneNumber,
      displayName: owner.displayName,
      reason: (err as { code?: string; message?: string }).code ?? (err as Error).message,
    });
  }
}

async function main() {
  for (const owner of owners) {
    await processOwner(owner);
  }

  writeFileSync("owners-uid-map.json", JSON.stringify(uidMap, null, 2), "utf-8");

  console.log(`\nTarget: ${isProd ? "PRODUCCIÓN (una-casita)" : "emulador local"}`);
  console.log(`Creados: ${created}`);
  console.log(`Reusados (ya existían): ${reused}`);
  console.log(`Saltados: ${skipped.length}`);
  if (skipped.length) {
    for (const s of skipped) console.log(`  ${s.phoneNumber} (${s.displayName}) -> ${s.reason}`);
  }
  console.log(`\nMapeo teléfono -> uid escrito en owners-uid-map.json`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
