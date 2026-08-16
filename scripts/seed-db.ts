// Escribe los datos de src/data/seed.ts en los emuladores locales de
// Firebase Auth + Firestore. Requiere que los emuladores ya estén
// corriendo (`pnpm run dev` los levanta, o `firebase emulators:start`).
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { users, properties } from "../src/data/seed";

process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";

const SEED_PASSWORD = "password123";

const app = initializeApp({ projectId: "una-casita" });
const auth = getAuth(app);
const db = getFirestore(app);

async function seedUser(user: (typeof users)[number]) {
  try {
    await auth.createUser({
      uid: user.id,
      email: user.email,
      password: SEED_PASSWORD,
      displayName: user.displayName,
    });
  } catch (err) {
    if ((err as { code?: string }).code !== "auth/uid-already-exists") throw err;
    await auth.updateUser(user.id, { email: user.email, displayName: user.displayName });
  }

  await db.collection("users").doc(user.id).set({
    email: user.email,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName ?? null,
    phone: user.phone,
    createdAt: Timestamp.now(),
  });
}

async function seedProperty(property: (typeof properties)[number]) {
  const now = Timestamp.now();
  await db.collection("properties").doc(property.id).set({
    ...property,
    createdAt: now,
    updatedAt: now,
  });
}

async function main() {
  await Promise.all(users.map(seedUser));
  await Promise.all(properties.map(seedProperty));
  console.log(`Seed listo: ${users.length} users, ${properties.length} properties.`);
  console.log(`Login de prueba: cualquier email del seed + contraseña "${SEED_PASSWORD}".`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
