import {onRequest} from "firebase-functions/v2/https";
import type {Request} from "firebase-functions/v2/https";
import type {Response} from "express";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import type {
  Firestore,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
} from "firebase-admin/firestore";
import {
  RESEND_API_KEY,
  APP_BASE_URL,
  formatHouseName,
  formatPrice,
  toPublicImageUrl,
  generateAvailabilitySignature,
} from "./utils";

type AvailabilityAction = "available" | "rented";

interface ParsedAvailabilityRequest {
  propertyId: string;
  action: AvailabilityAction;
  signature: string;
}

interface PropertyDisplayDetails {
  houseName: string;
  price?: string;
  imageUrl?: string;
}

interface InterstitialCardConfig {
  title: string;
  description: string;
  buttonText: string;
  buttonClass: string;
  propertyId: string;
  action: AvailabilityAction;
  sig: string;
  houseName: string;
  price?: string;
  imageUrl?: string;
}

/**
 * Extracts and validates confirmation parameters from the HTTP request.
 * Reads pid, action, and sig from the body (for POST) or query (for GET).
 * @param {Request} req The incoming HTTPS request object.
 * @return {ParsedAvailabilityRequest | null} Parsed params or null if invalid.
 */
function extractAvailabilityRequestParams(
  req: Request,
): ParsedAvailabilityRequest | null {
  const propertyId = ((req.method === "POST" ?
    req.body?.pid :
    req.query?.pid) || req.query?.pid) as string | undefined;

  const rawAction = ((req.method === "POST" ?
    req.body?.action :
    req.query?.action) || req.query?.action) as string | undefined;

  const signature = ((req.method === "POST" ?
    req.body?.sig :
    req.query?.sig) || req.query?.sig) as string | undefined;

  if (!propertyId || !rawAction || !signature) {
    return null;
  }

  if (rawAction !== "available" && rawAction !== "rented") {
    return null;
  }

  return {
    propertyId,
    action: rawAction,
    signature,
  };
}

/**
 * Fetches the property record from Firestore by property ID.
 * @param {Firestore} db The Firestore database instance.
 * @param {string} propertyId The ID of the property document.
 * @return {Promise<DocumentSnapshot<DocumentData>>} Firestore snapshot.
 */
async function fetchPropertyRecord(
  db: Firestore,
  propertyId: string,
): Promise<DocumentSnapshot<DocumentData>> {
  return db.collection("properties").doc(propertyId).get();
}

/**
 * Validates the HMAC signature to verify email link authenticity.
 * @param {string} propertyId The target property document ID.
 * @param {string} ownerId The property owner user ID.
 * @param {string} receivedSignature The signature received in the request.
 * @param {string} apiKey The secret API key used as HMAC secret.
 * @return {boolean} True if the signature matches expected signature.
 */
function isActionSignatureValid(
  propertyId: string,
  ownerId: string,
  receivedSignature: string,
  apiKey: string,
): boolean {
  const expectedSignature = generateAvailabilitySignature(
    propertyId,
    ownerId,
    apiKey,
  );
  return receivedSignature === expectedSignature;
}

/**
 * Formats property data into display attributes for the interstitial card.
 * @param {string} propertyId The target property document ID.
 * @param {DocumentData} property The Firestore property data.
 * @return {PropertyDisplayDetails} Formatted house name, price, and image URL.
 */
function buildPropertyDisplayDetails(
  propertyId: string,
  property: DocumentData,
): PropertyDisplayDetails {
  const houseName = formatHouseName(property.propertyType, property.zone);
  const price = property.price ? formatPrice(property.price) : undefined;
  const imageUrl = property.photos?.[0] ?
    toPublicImageUrl(propertyId, property.photos[0]) :
    undefined;

  return {
    houseName,
    price,
    imageUrl,
  };
}

/**
 * Builds configuration options for the interstitial confirmation card.
 * @param {ParsedAvailabilityRequest} params The parsed request parameters.
 * @param {PropertyDisplayDetails} details Display attributes of the property.
 * @return {InterstitialCardConfig} Options for rendering interstitial card.
 */
function buildInterstitialCardConfig(
  params: ParsedAvailabilityRequest,
  details: PropertyDisplayDetails,
): InterstitialCardConfig {
  if (params.action === "available") {
    return {
      title: "¿Tu casita sigue disponible?",
      description:
        "Haz clic en el botón para confirmar que tu casita sigue " +
        "en alquiler y mantenerla visible en las búsquedas.",
      buttonText: "Sí, confirmar disponibilidad",
      buttonClass: "btn-primary",
      propertyId: params.propertyId,
      action: params.action,
      sig: params.signature,
      houseName: details.houseName,
      price: details.price,
      imageUrl: details.imageUrl,
    };
  }

  return {
    title: "¿Confirmas que ya la alquilaste?",
    description:
      "Al confirmar, marcaremos tu casita como no disponible " +
      "para que no recibas más mensajes de familias interesadas.",
    buttonText: "Sí, marcar como alquilada",
    buttonClass: "btn-danger",
    propertyId: params.propertyId,
    action: params.action,
    sig: params.signature,
    houseName: details.houseName,
    price: details.price,
    imageUrl: details.imageUrl,
  };
}

/**
 * Renders the full HTML document for the anti-crawler confirmation card.
 * @param {InterstitialCardConfig} options Card configuration parameters.
 * @return {string} Full HTML document string.
 */
function renderInterstitialHtml(options: InterstitialCardConfig): string {
  const {
    title,
    description,
    buttonText,
    buttonClass,
    propertyId,
    action,
    sig,
    houseName,
    price,
    imageUrl,
  } = options;

  const imageHtml = imageUrl ?
    `<img src="${imageUrl}" alt="${houseName}" class="property-img" />` :
    "";
  const priceHtml = price ?
    `<div class="property-price">${price}</div>` :
    "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Una Casita</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Helvetica, Arial, sans-serif;
      background-color: #fcfaf8;
      color: #1e1e1e;
      margin: 0;
      padding: 24px 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
    }
    .card {
      background: #ffffff;
      border: 1px solid #f0e6dc;
      border-radius: 16px;
      padding: 32px 24px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    .logo {
      font-size: 20px;
      font-weight: 800;
      color: #d9532f;
      margin-bottom: 20px;
      display: inline-block;
      text-decoration: none;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #2b231d;
    }
    p {
      font-size: 14px;
      color: #716a64;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }
    .property-preview {
      background: #fcf8f5;
      border: 1px solid #f0e6dc;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: left;
    }
    .property-img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .property-name {
      font-size: 16px;
      font-weight: 700;
      color: #2b231d;
      margin: 0 0 4px 0;
    }
    .property-price {
      font-size: 15px;
      font-weight: 600;
      color: #d9532f;
      margin: 0;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 14px;
      border-radius: 9999px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      box-sizing: border-box;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .btn-primary {
      background-color: #d9532f;
      color: #ffffff;
    }
    .btn-danger {
      background-color: #4a423d;
      color: #ffffff;
    }
    .cancel-link {
      display: block;
      margin-top: 16px;
      font-size: 13px;
      color: #928a83;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <a href="${APP_BASE_URL}" class="logo">Una Casita</a>
    <h1>${title}</h1>
    <p>${description}</p>

    <div class="property-preview">
      ${imageHtml}
      <div class="property-name">${houseName}</div>
      ${priceHtml}
    </div>

    <form method="POST" action="">
      <input type="hidden" name="pid" value="${propertyId}" />
      <input type="hidden" name="action" value="${action}" />
      <input type="hidden" name="sig" value="${sig}" />
      <button type="submit" class="btn ${buttonClass}">
        ${buttonText}
      </button>
    </form>

    <a href="${APP_BASE_URL}" class="cancel-link">Volver al inicio</a>
  </div>
</body>
</html>`;
}

/**
 * Handles GET preview requests by returning the anti-crawler interstitial card.
 * @param {Response} res The outgoing HTTPS response object.
 * @param {ParsedAvailabilityRequest} params The parsed request parameters.
 * @param {PropertyDisplayDetails} details Display attributes of the property.
 */
function handleInterstitialPreviewResponse(
  res: Response,
  params: ParsedAvailabilityRequest,
  details: PropertyDisplayDetails,
): void {
  const cardConfig = buildInterstitialCardConfig(params, details);
  const html = renderInterstitialHtml(cardConfig);
  res.status(200).send(html);
}

/**
 * Updates Firestore property state to mark it confirmed as available.
 * Resets the reminder counter and refreshes confirmation timestamp.
 * @param {DocumentReference} propRef Firestore reference for the property.
 * @return {Promise<void>}
 */
async function confirmPropertyAsAvailable(
  propRef: DocumentReference,
): Promise<void> {
  await propRef.update({
    available: true,
    lastAvailabilityConfirmedAt: FieldValue.serverTimestamp(),
    availabilityReminderCount: 0,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Updates Firestore property state to mark it as rented (inactive).
 * @param {DocumentReference} propRef Firestore reference for the property.
 * @return {Promise<void>}
 */
async function confirmPropertyAsRented(
  propRef: DocumentReference,
): Promise<void> {
  await propRef.update({
    available: false,
    lastAvailabilityConfirmedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Executes Firestore mutation for confirmed action and redirects user.
 * @param {Response} res The outgoing HTTPS response object.
 * @param {DocumentReference} propRef Firestore reference for the property.
 * @param {string} propertyId The ID of the confirmed property.
 * @param {AvailabilityAction} action The user action ("available" | "rented").
 * @return {Promise<void>}
 */
async function executeAvailabilityConfirmationAndRedirect(
  res: Response,
  propRef: DocumentReference,
  propertyId: string,
  action: AvailabilityAction,
): Promise<void> {
  if (action === "available") {
    await confirmPropertyAsAvailable(propRef);
    const destination =
      `${APP_BASE_URL}/property/${propertyId}/view?availabilityConfirmed=true`;
    res.redirect(302, destination);
    return;
  }

  await confirmPropertyAsRented(propRef);
  res.redirect(302, `${APP_BASE_URL}/perfil?status=rented`);
}

/**
 * Orchestrates the full HTTP lifecycle for email confirmation links.
 * Handles parameter parsing, signature check, preview cards, and mutations.
 * @param {Request} req The incoming HTTPS request object.
 * @param {Response} res The outgoing HTTPS response object.
 * @param {string} apiKey Secret API key used for HMAC signature validation.
 * @return {Promise<void>}
 */
async function handleAvailabilityRequest(
  req: Request,
  res: Response,
  apiKey: string,
): Promise<void> {
  const params = extractAvailabilityRequestParams(req);
  if (!params) {
    res.status(400).send("Enlace incompleto o parámetros inválidos.");
    return;
  }

  const db = getFirestore();
  const propRef = db.collection("properties").doc(params.propertyId);
  const propSnap = await fetchPropertyRecord(db, params.propertyId);

  if (!propSnap.exists) {
    res.status(404).send("La propiedad no fue encontrada.");
    return;
  }

  const property = propSnap.data();
  if (!property?.ownerId) {
    res.status(400).send("Datos de propiedad inválidos.");
    return;
  }

  const isSignatureValid = isActionSignatureValid(
    params.propertyId,
    property.ownerId,
    params.signature,
    apiKey,
  );

  if (!isSignatureValid) {
    res.status(403).send("Firma inválida o enlace no autorizado.");
    return;
  }

  const displayDetails = buildPropertyDisplayDetails(
    params.propertyId,
    property,
  );

  // GET Request: Strictly read-only preview card (Anti-Crawler Shield)
  if (req.method === "GET") {
    handleInterstitialPreviewResponse(res, params, displayDetails);
    return;
  }

  // POST Request: Human confirmed action -> Mutate Firestore state
  if (req.method === "POST") {
    await executeAvailabilityConfirmationAndRedirect(
      res,
      propRef,
      params.propertyId,
      params.action,
    );
    return;
  }

  res.status(405).send("Método no permitido.");
}

/**
 * HTTPS endpoint handling passwordless confirmation actions from email.
 * - GET: Safe read-only rendering of confirmation card (shields crawlers).
 * - POST: Executes Firestore update and redirects to target frontend view.
 */
export const confirmAvailability = onRequest(
  {secrets: [RESEND_API_KEY]},
  async (req, res) => {
    await handleAvailabilityRequest(req, res, RESEND_API_KEY.value());
  },
);
