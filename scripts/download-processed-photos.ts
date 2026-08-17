// Descarga de Storage prod las fotos ya procesadas (casas/{id}/images/*)
// referenciadas en properties.json, a una cache local — para poder
// sembrarlas después en el emulador sin re-procesarlas (seed-emulator.ts).
import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import type { Property } from "../src/types";

const CACHE_DIR = "processed-photos-cache";

const app = initializeApp({
  projectId: "una-casita",
  storageBucket: "una-casita.firebasestorage.app",
});
const bucket = getStorage(app).bucket();

const properties: Property[] = JSON.parse(readFileSync("properties.json", "utf-8"));

async function main() {
  let downloaded = 0;
  let skipped = 0;

  for (const property of properties) {
    for (const fileName of property.photos) {
      const remotePath = `casas/${property.id}/images/${fileName}`;
      const localPath = join(CACHE_DIR, property.id, fileName);

      if (existsSync(localPath)) {
        skipped++;
        continue;
      }

      mkdirSync(dirname(localPath), { recursive: true });
      const [buffer] = await bucket.file(remotePath).download();
      writeFileSync(localPath, buffer);
      downloaded++;
    }
  }

  console.log(`Descargadas: ${downloaded}`);
  console.log(`Ya en cache: ${skipped}`);
  console.log(`Cache en ${CACHE_DIR}/`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
