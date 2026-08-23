import crypto from "crypto";
import {defineSecret} from "firebase-functions/params";

export const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

export const FROM_ADDRESS = "notificaciones@unacasitacolombia.com";
export const APP_BASE_URL = "https://unacasitacolombia.com";

/* Mismo bucket que VITE_FIREBASE_STORAGE_BUCKET en el cliente (.env). Fijo
 * en vez de leerlo de getStorage().bucket() porque ese default solo se
 * resuelve bien dentro de una invocación real de function (vía
 * FIREBASE_CONFIG); no hay necesidad de esa indirección para un valor que
 * no cambia.
 * */
export const STORAGE_BUCKET = "una-casita.firebasestorage.app";

/*
 * ponytail: dirección de pruebas de Resend, siempre "entregada" sin tocar
 * bandejas reales - evita espamear usuarios de seed/emulador
 * */
export const TEST_ADDRESS = "delivered@resend.dev";

export const propertyTypeLabels: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  habitacion: "Habitación",
  bodega: "Bodega",
};

export const zoneLabels: Record<string, string> = {
  norte: "Norte",
  sur: "Sur",
  centro: "Centro",
  oriente: "Oriente",
  occidente: "Occidente",
};

/**
 * Formats a property type and zone into a human-readable title.
 * @param {string} [propertyType] The type of the property.
 * @param {string} [zone] The zone/locality of the property.
 * @return {string} Formatted label (e.g. "Casa en Norte").
 */
export function formatHouseName(propertyType?: string, zone?: string): string {
  const type = (propertyType && propertyTypeLabels[propertyType]) ||
    propertyType ||
    "Casita";
  const z = (zone && zoneLabels[zone]) || zone || "";
  return z ? `${type} en ${z}` : type;
}

/**
 * Converts a photo filename to its public Firebase Storage URL.
 * Mirrors 'getStorageImageUrl' in the client (src/firebase/queries/storage.ts)
 * An email do not have javascript to solve the url in the browser
 * so we need to send it resolved.
 *
 * @param {string} propertyId The ID of the property.
 * @param {string} fileName The filename inside Storage.
 * @return {string} The resolved public image URL.
 */
export function toPublicImageUrl(propertyId: string, fileName: string): string {
  const path = `casas/${propertyId}/images/${fileName}`;
  const base =
    process.env.FUNCTIONS_EMULATOR === "true" ?
      "http://localhost:9199" :
      "https://firebasestorage.googleapis.com";
  const encodedPath = encodeURIComponent(path);
  return `${base}/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
}

/**
 * Formats raw numeric price to Colombian Pesos string.
 * @param {number} price Raw price amount.
 * @return {string} Formatted currency string (e.g. "$ 1.200.000").
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Generates an HMAC-SHA256 signature for email action links.
 * @param {string} propertyId The property document ID.
 * @param {string} ownerId The user ID of the property owner.
 * @param {string} secret The signing secret key.
 * @return {string} 16-character hex signature.
 */
export function generateAvailabilitySignature(
  propertyId: string,
  ownerId: string,
  secret: string,
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${propertyId}:${ownerId}`)
    .digest("hex")
    .slice(0, 16);
}

/**
 * Generates the full signed confirmation URL for an email action.
 * @param {"available" | "rented"} action The action to perform.
 * @param {string} propertyId The property ID.
 * @param {string} ownerId The owner user ID.
 * @param {string} secret The signing secret.
 * @return {string} Full action URL.
 */
export function getActionUrl(
  action: "available" | "rented",
  propertyId: string,
  ownerId: string,
  secret: string,
): string {
  const sig = generateAvailabilitySignature(propertyId, ownerId, secret);
  const projectId =
    process.env.GCLOUD_PROJECT ||
    (process.env.FIREBASE_CONFIG &&
      JSON.parse(process.env.FIREBASE_CONFIG).projectId) ||
    "una-casita";

  const base =
    process.env.FUNCTIONS_EMULATOR === "true" ?
      `http://127.0.0.1:5001/${projectId}/us-central1/confirmAvailability` :
      `https://us-central1-${projectId}.cloudfunctions.net/confirmAvailability`;

  const pid = encodeURIComponent(propertyId);
  return `${base}?pid=${pid}&action=${action}&sig=${sig}`;
}
