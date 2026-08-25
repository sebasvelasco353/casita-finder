import {onDocumentDeleted} from "firebase-functions/v2/firestore";
import {getStorage} from "firebase-admin/storage";

// El cliente no puede borrar las fotos: las Storage Rules niegan write en
// casas/{id}/images/** y, para casas/{id}/uploads/**, exigen leer el doc de
// la property que ya se acaba de borrar. Se limpia acá con el Admin SDK.
export const deleteCasaImages = onDocumentDeleted(
  "properties/{propertyId}",
  async (event) => {
    const {propertyId} = event.params;
    await getStorage().bucket().deleteFiles({
      prefix: `casas/${propertyId}/`,
    });
  },
);
