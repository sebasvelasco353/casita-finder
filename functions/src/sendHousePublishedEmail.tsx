import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {defineSecret} from "firebase-functions/params";
import {getFirestore} from "firebase-admin/firestore";
import {render} from "react-email";
import {Resend} from "resend";
import {HousePublishedEmail} from "./emails/house-published";

export const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

const FROM_ADDRESS = "notificaciones@unacasitacolombia.com";
const APP_BASE_URL = "https://unacasitacolombia.com";
// Mismo bucket que VITE_FIREBASE_STORAGE_BUCKET en el cliente (.env). Fijo
// en vez de leerlo de getStorage().bucket() porque ese default solo se
// resuelve bien dentro de una invocación real de function (vía
// FIREBASE_CONFIG); no hay necesidad de esa indirección para un valor que
// no cambia.
const STORAGE_BUCKET = "una-casita.firebasestorage.app";
// ponytail: dirección de pruebas de Resend, siempre "entregada" sin tocar
// bandejas reales - evita espamear usuarios de seed/emulador.
const TEST_ADDRESS = "delivered@resend.dev";

const propertyTypeLabels: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  habitacion: "Habitación",
  bodega: "Bodega",
};

const zoneLabels: Record<string, string> = {
  norte: "Norte",
  sur: "Sur",
  centro: "Centro",
  oriente: "Oriente",
  occidente: "Occidente",
};

/**
 * Convierte un nombre de archivo en `photos[]` a la URL pública de descarga
 * en Storage. Espejo del `getStorageImageUrl` del cliente
 * (src/firebase/queries/storage.ts) — un correo no tiene JS que arme esto
 * en el navegador, así que hay que mandarlo ya resuelto.
 * @param {string} propertyId Id de la property dueña de la foto.
 * @param {string} fileName Nombre del archivo dentro de casas/{id}/images/.
 * @return {string} URL pública lista para usar en un <img src>.
 */
function toPublicImageUrl(propertyId: string, fileName: string): string {
  const path = `casas/${propertyId}/images/${fileName}`;
  const base =
    process.env.FUNCTIONS_EMULATOR === "true" ?
      "http://localhost:9199" :
      "https://firebasestorage.googleapis.com";
  const encodedPath = encodeURIComponent(path);
  return `${base}/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
}

/**
 * Formatea un precio en pesos colombianos, ej. "$ 1.200.000".
 * @param {number} price Precio crudo en COP.
 * @return {string} Precio formateado.
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Construye y envía el email "casita publicada" para una property dada.
 * Llamado una sola vez por casita: o bien de inmediato al crearla (si no
 * lleva fotos), o desde el pipeline de imágenes (functions/src/index.ts)
 * apenas terminó de procesar todas las fotos subidas al publicar — así la
 * portada del correo ya existe cuando se envía, en vez de llegar vacía.
 * @param {string} propertyId Id del documento en la colección "properties".
 * @param {FirebaseFirestore.DocumentData} property Datos de la property.
 */
export async function sendHousePublishedEmailFor(
  propertyId: string,
  property: FirebaseFirestore.DocumentData,
): Promise<void> {
  const ownerSnap = await getFirestore()
    .collection("users")
    .doc(property.ownerId)
    .get();
  const owner = ownerSnap.data();
  if (!owner?.email) return;

  const type =
    propertyTypeLabels[property.propertyType] ?? property.propertyType;
  const zone = zoneLabels[property.zone] ?? property.zone;
  const houseName = `${type} en ${zone}`;

  const html = await render(
    <HousePublishedEmail
      displayName={owner.displayName ?? owner.name ?? "vecino"}
      houseName={houseName}
      price={formatPrice(property.price)}
      houseImage={
        property.photos?.[0] ?
          toPublicImageUrl(propertyId, property.photos[0]) :
          undefined
      }
      publishedLink={`${APP_BASE_URL}/property/${propertyId}/edit`}
    />,
  );

  const to =
    process.env.FUNCTIONS_EMULATOR === "true" ? TEST_ADDRESS : owner.email;

  const resend = new Resend(RESEND_API_KEY.value());
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Tu casita ya está publicada",
    html,
  });
}

/**
 * Si la casita se publicó sin fotos (expectedPhotos <= 0), no hay pipeline
 * de imágenes que vaya a disparar el envío después, así que lo hace de una
 * vez. Si sí lleva fotos, se queda callado: el pipeline se encarga.
 */
export const sendHousePublishedEmail = onDocumentCreated(
  {document: "properties/{propertyId}", secrets: [RESEND_API_KEY]},
  async (event) => {
    const property = event.data?.data();
    if (!property) return;
    if ((property.expectedPhotos ?? 0) > 0) return;

    const propertyId = event.params.propertyId;
    const ref = getFirestore().collection("properties").doc(propertyId);
    const claimed = await getFirestore().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.data()?.emailSent) return false;
      tx.update(ref, {emailSent: true});
      return true;
    });
    if (!claimed) return;

    await sendHousePublishedEmailFor(propertyId, property);
  },
);
