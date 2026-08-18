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

// Sube al bucket de "uploads"; el pipeline (functions/src/index.ts) las
// redimensiona/convierte a webp y las agrega a properties/{id}.photos.
export async function uploadCasaImages(propertyId: string, files: File[]) {
  await Promise.all(
    files.map((file) =>
      uploadBytes(
        storageRef(storage, `casas/${propertyId}/uploads/${file.name}`),
        file,
      ),
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
