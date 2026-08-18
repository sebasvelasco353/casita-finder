import {
  deleteObject,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { storage, db } from "../config";

export function getStorageImageUrl(path: string) {
  const base = import.meta.env.DEV
    ? "http://localhost:9199"
    : "https://firebasestorage.googleapis.com";
  return `${base}/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(path)}?alt=media`;
}

// Las Storage Rules validan el ownerId leyendo el doc de Firestore recién
// creado (firestore.get, cross-service): esa lectura puede ir por detrás de
// la escritura unos segundos, así que reintentamos si llega "unauthorized".
async function uploadWithRetry(path: string, file: File, attempt = 0): Promise<void> {
  try {
    await uploadBytes(storageRef(storage, path), file);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== "storage/unauthorized" || attempt >= 3) throw err;
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    await uploadWithRetry(path, file, attempt + 1);
  }
}

// Sube al bucket de "uploads"; el pipeline (functions/src/index.ts) las
// redimensiona/convierte a webp y las agrega a properties/{id}.photos.
export async function uploadCasaImages(propertyId: string, files: File[]) {
  await Promise.all(
    files.map((file) =>
      uploadWithRetry(`casas/${propertyId}/uploads/${file.name}`, file),
    ),
  );
}

export async function deleteCasaImage(propertyId: string, fileName: string) {
  await deleteObject(
    storageRef(storage, `casas/${propertyId}/images/${fileName}`),
  );
  await updateDoc(doc(db, "properties", propertyId), {
    photos: arrayRemove(fileName),
  });
}
