import {setGlobalOptions} from "firebase-functions";
import {onObjectFinalized} from "firebase-functions/v2/storage";
import {initializeApp} from "firebase-admin/app";
import {getStorage} from "firebase-admin/storage";
import {getFirestore} from "firebase-admin/firestore";
import sharp from "sharp";
import {
  RESEND_API_KEY,
  sendHousePublishedEmailFor,
} from "./sendHousePublishedEmail";

initializeApp();
setGlobalOptions({maxInstances: 10});

export {sendHousePublishedEmail} from "./sendHousePublishedEmail";

const MAX_DIMENSION = 1500;
const QUALITY = 70;
const UPLOAD_PATH = /^casas\/([^/]+)\/uploads\/(.+)$/;

/**
 * Registra que se terminó de intentar procesar una foto (haya salido bien o
 * no) y, si con esta ya se procesaron todas las que se esperaban y el correo
 * de "casita publicada" todavía no se envió, lo envía — así llega con la
 * portada ya disponible en vez de dispararse apenas se crea la property.
 * @param {string} propertyId Id de la property dueña de la foto.
 * @param {string | null} webpFileName Nombre del .webp generado, o null si
 * el procesamiento de esta foto falló.
 */
async function recordPhotoProcessed(
  propertyId: string,
  webpFileName: string | null,
): Promise<void> {
  const ref = getFirestore().collection("properties").doc(propertyId);
  let property: FirebaseFirestore.DocumentData | undefined;

  await getFirestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const data = snap.data() as FirebaseFirestore.DocumentData;

    const photos = webpFileName ?
      [...(data.photos ?? []), webpFileName] :
      (data.photos ?? []);
    const processedPhotos = (data.processedPhotos ?? 0) + 1;
    const expectedPhotos = data.expectedPhotos ?? 0;

    const update: Record<string, unknown> = {photos, processedPhotos};
    if (!data.emailSent && processedPhotos >= expectedPhotos) {
      update.emailSent = true;
      property = {...data, photos};
    }
    tx.update(ref, update);
  });

  if (property) await sendHousePublishedEmailFor(propertyId, property);
}

export const processCasaImage = onObjectFinalized(
  {secrets: [RESEND_API_KEY]},
  async (event) => {
    const filePath = event.data.name;
    const match = filePath.match(UPLOAD_PATH);
    if (!match) return;
    const [, casaId, fileName] = match;

    const bucket = getStorage().bucket(event.data.bucket);
    const originalFile = bucket.file(filePath);

    let webpFileName: string | null = null;
    try {
      const [buffer] = await originalFile.download();

      const processed = await sharp(buffer)
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({quality: QUALITY})
        .toBuffer();

      const baseName = fileName.replace(/\.[^./]+$/, "");
      webpFileName = `${baseName}.webp`;
      await bucket.file(`casas/${casaId}/images/${webpFileName}`).save(
        processed,
        {contentType: "image/webp"},
      );
      await originalFile.delete();
    } catch (err) {
      // No relanzamos: aunque falle esta foto, el conteo de abajo debe
      // seguir avanzando para que el correo no se quede esperando para
      // siempre a una foto que nunca va a terminar de procesarse.
      console.error(`processCasaImage: fallo procesando ${filePath}`, err);
    }

    await recordPhotoProcessed(casaId, webpFileName);
  },
);
