// Procesa las fotos referenciadas en properties.json (resize + webp, mismo
// pipeline que functions/src/index.ts -> processCasaImage) y las sube a
// prod en casas/{propertyId}/images/{baseName}.webp — mismo sistema de
// carpetas que ya usa esa Cloud Function, solo que acá casaId = property.id
// porque no existe un doc casas/{id} real para properties migradas (y no
// hace falta: esa regla de storage.rules ya es de lectura pública sin
// firestore.get() de por medio).
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import type { Property } from "../src/types";

const isProd = process.argv.includes("--prod");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : undefined;
const SOURCE_DIR = "bucket-casas-files";
const CONCURRENCY = 8;
const MAX_DIMENSION = 1500;
const QUALITY = 70;

if (!isProd) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= "localhost:9199";
}

const app = initializeApp({
  projectId: "una-casita",
  storageBucket: "una-casita.firebasestorage.app",
});
const db = getFirestore(app);
const bucket = getStorage(app).bucket();

const properties: Property[] = JSON.parse(readFileSync("properties.json", "utf-8"));

let bytesBefore = 0;
let bytesAfter = 0;
let processed = 0;
const failed: { file: string; propertyId: string; reason: string }[] = [];

async function processPhoto(propertyId: string, fileName: string): Promise<string | null> {
  const localPath = join(SOURCE_DIR, fileName);
  if (!existsSync(localPath)) {
    failed.push({ file: fileName, propertyId, reason: "no existe en bucket-casas-files/" });
    return null;
  }

  try {
    const original = readFileSync(localPath);
    const processedBuffer = await sharp(original)
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    const baseName = fileName.replace(/\.[^./]+$/, "");
    const newFileName = `${baseName}.webp`;
    const destination = `casas/${propertyId}/images/${newFileName}`;

    await bucket.file(destination).save(processedBuffer, {
      contentType: "image/webp",
    });

    bytesBefore += original.length;
    bytesAfter += processedBuffer.length;
    processed++;
    return newFileName;
  } catch (err) {
    failed.push({ file: fileName, propertyId, reason: (err as Error).message });
    return null;
  }
}

async function runBatched<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

async function processProperty(property: Property) {
  const newPhotos = (
    await runBatched(property.photos, (fileName) => processPhoto(property.id, fileName))
  ).filter((f): f is string => f !== null);

  if (newPhotos.length === 0 && property.photos.length > 0) return property;

  await db
    .collection("properties")
    .doc(property.id)
    .update({ photos: newPhotos, cover: FieldValue.delete() });

  const { cover: _cover, ...rest } = property as Property & { cover?: unknown };
  return { ...rest, photos: newPhotos };
}

async function main() {
  const toProcess = LIMIT ? properties.slice(0, LIMIT) : properties;
  const processedIds = new Set(toProcess.map((p) => p.id));

  const updatedById = new Map<string, Property>();
  for (const property of toProcess) {
    updatedById.set(property.id, (await processProperty(property)) as Property);
  }

  const merged = properties.map((p) => updatedById.get(p.id) ?? p);
  writeFileSync("properties.json", JSON.stringify(merged, null, 2), "utf-8");

  if (LIMIT) console.log(`(--limit=${LIMIT}, procesadas: ${[...processedIds].join(", ")})`);

  console.log(`\nTarget: ${isProd ? "PRODUCCIÓN (una-casita)" : "emulador local"}`);
  console.log(`Fotos procesadas: ${processed}`);
  console.log(`Tamaño antes: ${(bytesBefore / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Tamaño después: ${(bytesAfter / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Fallidas: ${failed.length}`);
  if (failed.length) failed.forEach((f) => console.log(`  ${f.propertyId}/${f.file} -> ${f.reason}`));
  console.log(`\nproperties.json actualizado con los nuevos filenames .webp.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
