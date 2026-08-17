// Sincroniza TODO properties.json a producción (.set() completo por doc,
// no solo el campo que se tocó última vez) — para cuando properties.json
// tiene ediciones manuales además de las hechas por script.
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import type { Property } from "../src/types";

const app = initializeApp({ projectId: "una-casita" });
const db = getFirestore(app);

function toTimestamps(property: Property): Property {
  const result = { ...property };
  for (const key of ["createdAt", "updatedAt"] as const) {
    if (typeof result[key] === "string") {
      (result as Record<string, unknown>)[key] = Timestamp.fromDate(new Date(result[key] as unknown as string));
    }
  }
  return result;
}

const properties: Property[] = JSON.parse(readFileSync("properties.json", "utf-8"));

async function main() {
  for (const property of properties) {
    await db.collection("properties").doc(property.id).set(toTimestamps(property));
  }
  console.log(`${properties.length} properties sincronizadas a producción (set completo).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
