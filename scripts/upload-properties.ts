// Sube properties.json a Firestore: sin el campo owner (el owner real ya
// vive en users/{uid}), con ownerId reemplazado por el uid real (matcheado
// por teléfono contra owners-uid-map.json, generado por create-owner-users.ts).
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync, writeFileSync } from "fs";
import type { Property } from "../src/types";

const isProd = process.argv.includes("--prod");

if (!isProd) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";
}

const app = initializeApp({ projectId: "una-casita" });
const db = getFirestore(app);

const properties: Property[] = JSON.parse(readFileSync("properties.json", "utf-8"));
const uidMap: Record<string, { uid: string; displayName: string }> = JSON.parse(
  readFileSync("owners-uid-map.json", "utf-8"),
);

const skipped: { id: string; reason: string }[] = [];
const uploaded: Record<string, unknown>[] = [];

async function processProperty(property: Property) {
  const owner = uidMap[property.ownerId];
  if (!owner) {
    skipped.push({ id: property.id, reason: `sin match de owner para ownerId=${property.ownerId}` });
    return;
  }

  const { owner: _owner, ...rest } = property;
  const doc = {
    ...rest,
    ownerId: owner.uid,
    createdAt: Timestamp.fromDate(new Date(property.createdAt as unknown as string)),
    updatedAt: Timestamp.fromDate(new Date(property.updatedAt as unknown as string)),
  };

  await db.collection("properties").doc(property.id).set(doc);
  uploaded.push({ ...rest, ownerId: owner.uid });
}

async function main() {
  for (const property of properties) {
    await processProperty(property);
  }

  writeFileSync("properties-uploaded.json", JSON.stringify(uploaded, null, 2), "utf-8");

  console.log(`\nTarget: ${isProd ? "PRODUCCIÓN (una-casita)" : "emulador local"}`);
  console.log(`Subidas: ${uploaded.length}`);
  console.log(`Saltadas: ${skipped.length}`);
  if (skipped.length) {
    for (const s of skipped) console.log(`  ${s.id} -> ${s.reason}`);
  }
  console.log(`\nproperties-uploaded.json escrito con lo efectivamente subido.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
