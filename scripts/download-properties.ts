// Descarga properties/ de Firestore a properties.json — la fuente de
// verdad es producción, este archivo es una copia de trabajo local.
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { writeFileSync } from "fs";

const isProd = process.argv.includes("--prod");

if (!isProd) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";
}

const app = initializeApp({ projectId: "una-casita" });
const db = getFirestore(app);

function toPlain(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, toPlain(v)]),
    );
  }
  return value;
}

async function main() {
  const snap = await db.collection("properties").get();
  const properties = snap.docs.map((d) => toPlain(d.data()));

  writeFileSync("properties.json", JSON.stringify(properties, null, 2), "utf-8");
  console.log(`Target: ${isProd ? "PRODUCCIÓN (una-casita)" : "emulador local"}`);
  console.log(`${properties.length} properties escritas en properties.json`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
