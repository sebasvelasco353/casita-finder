import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {defineSecret} from "firebase-functions/params";
import {getFirestore} from "firebase-admin/firestore";
import {render} from "react-email";
import {Resend} from "resend";
import {HousePublishedEmail} from "./emails/house-published";

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

const FROM_ADDRESS = "notificaciones@unacasitacolombia.com";
const APP_BASE_URL = "https://unacasitacolombia.com";
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

/** Envía el email "casita publicada" al dueño cuando se crea una property. */
export const sendHousePublishedEmail = onDocumentCreated(
  {document: "properties/{propertyId}", secrets: [RESEND_API_KEY]},
  async (event) => {
    const property = event.data?.data();
    if (!property) return;

    const ownerSnap = await getFirestore()
      .collection("users")
      .doc(property.ownerId)
      .get();
    const owner = ownerSnap.data();
    if (!owner?.email) return;

    const type = propertyTypeLabels[property.propertyType] ??
      property.propertyType;
    const zone = zoneLabels[property.zone] ?? property.zone;
    const houseName = `${type} en ${zone}`;
    const propertyId = event.params.propertyId;

    const html = await render(
      <HousePublishedEmail
        displayName={owner.displayName ?? owner.name ?? "vecino"}
        houseName={houseName}
        price={formatPrice(property.price)}
        houseImage={property.photos?.[0]}
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
  },
);
