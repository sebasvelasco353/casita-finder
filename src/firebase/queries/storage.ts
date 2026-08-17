import { storage } from "../config";

export function getStorageImageUrl(path: string) {
  const base = import.meta.env.DEV
    ? "http://localhost:9199"
    : "https://firebasestorage.googleapis.com";
  return `${base}/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(path)}?alt=media`;
}
