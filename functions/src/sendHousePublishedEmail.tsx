import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {getFirestore} from "firebase-admin/firestore";
import {render} from "react-email";
import {Resend} from "resend";
import {HousePublishedEmail} from "./emails/house-published";
import {
  RESEND_API_KEY,
  FROM_ADDRESS,
  APP_BASE_URL,
  TEST_ADDRESS,
  formatHouseName,
  formatPrice,
  toPublicImageUrl,
} from "./utils";

export {RESEND_API_KEY};

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

  const houseName = formatHouseName(property.propertyType, property.zone);

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
