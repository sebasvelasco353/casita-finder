// Siembra el emulador local (Firestore + Storage) con el estado actual de
// prod: properties.json + owners.json (ya descargados de prod) y las fotos
// procesadas cacheadas por download-processed-photos.ts. Sin esto, `pnpm
// dev` muestra datos viejos porque el emulador nunca se actualiza solo.
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { Property, User } from "../src/types";

process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";
process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= "localhost:9199";

const CACHE_DIR = "processed-photos-cache";

const app = initializeApp({
  projectId: "una-casita",
  storageBucket: "una-casita.firebasestorage.app",
});
const db = getFirestore(app);
const bucket = getStorage(app).bucket();

function toTimestamps<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of ["createdAt", "updatedAt"] as const) {
    if (typeof result[key] === "string") {
      (result as Record<string, unknown>)[key] = Timestamp.fromDate(new Date(result[key] as string));
    }
  }
  return result;
}

async function seedFirestore() {
  const properties: Property[] = JSON.parse(readFileSync("properties.json", "utf-8"));
  const users: User[] = JSON.parse(readFileSync("owners.json", "utf-8"));

  for (const property of properties) {
    await db.collection("properties").doc(property.id).set(toTimestamps(property));
  }
  for (const user of users) {
    await db.collection("users").doc(user.id).set(toTimestamps(user));
  }

  console.log(`Firestore emulador: ${properties.length} properties, ${users.length} users`);
}

async function seedStorage() {
  let uploaded = 0;
  const propertyDirs = readdirSync(CACHE_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());

  for (const dir of propertyDirs) {
    const files = readdirSync(join(CACHE_DIR, dir.name));
    for (const fileName of files) {
      const localPath = join(CACHE_DIR, dir.name, fileName);
      const destination = `casas/${dir.name}/images/${fileName}`;
      await bucket.upload(localPath, { destination, metadata: { contentType: "image/webp" } });
      uploaded++;
    }
  }

  console.log(`Storage emulador: ${uploaded} fotos subidas`);
}

async function main() {
  await seedFirestore();
  await seedStorage();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
