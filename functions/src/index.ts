import {setGlobalOptions} from "firebase-functions";
import {onObjectFinalized} from "firebase-functions/v2/storage";
import {initializeApp} from "firebase-admin/app";
import {getStorage} from "firebase-admin/storage";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import sharp from "sharp";

initializeApp();
setGlobalOptions({maxInstances: 10});

export {sendHousePublishedEmail} from "./sendHousePublishedEmail";

const MAX_DIMENSION = 1500;
const QUALITY = 70;
const UPLOAD_PATH = /^casas\/([^/]+)\/uploads\/(.+)$/;

export const processCasaImage = onObjectFinalized(async (event) => {
  const filePath = event.data.name;
  const match = filePath.match(UPLOAD_PATH);
  if (!match) return;
  const [, casaId, fileName] = match;

  const bucket = getStorage().bucket(event.data.bucket);
  const originalFile = bucket.file(filePath);
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
  const outputPath = `casas/${casaId}/images/${baseName}.webp`;
  await bucket.file(outputPath).save(processed, {
    contentType: "image/webp",
  });

  await getFirestore()
    .collection("properties")
    .doc(casaId)
    .update({photos: FieldValue.arrayUnion(`${baseName}.webp`)});

  await originalFile.delete();
});
