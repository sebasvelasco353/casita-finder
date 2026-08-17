// Parche: create-owner-users.ts creó los docs de users/{uid} sin el campo
// `id` en el body (solo quedó como key del doc). getUserById filtra por
// where("id","==", uid), así que sin esto nunca resuelve. Este script le
// agrega `id: uid` a cada doc de users/ que le falte.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const isProd = process.argv.includes("--prod");

if (!isProd) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";
}

const app = initializeApp({ projectId: "una-casita" });
const db = getFirestore(app);

async function main() {
  const snap = await db.collection("users").get();

  let patched = 0;
  let alreadyOk = 0;

  for (const doc of snap.docs) {
    if (doc.data().id === doc.id) {
      alreadyOk++;
      continue;
    }
    await doc.ref.update({ id: doc.id });
    patched++;
  }

  console.log(`\nTarget: ${isProd ? "PRODUCCIÓN (una-casita)" : "emulador local"}`);
  console.log(`Total users: ${snap.size}`);
  console.log(`Parchados (id agregado): ${patched}`);
  console.log(`Ya tenían id correcto: ${alreadyOk}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
