import {onSchedule} from "firebase-functions/v2/scheduler";
import {getFirestore, FieldValue, Timestamp} from "firebase-admin/firestore";
import type {
  Firestore,
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase-admin/firestore";
import {render} from "react-email";
import {Resend} from "resend";
import {
  RESEND_API_KEY,
  FROM_ADDRESS,
  TEST_ADDRESS,
  APP_BASE_URL,
  formatHouseName,
  formatPrice,
  toPublicImageUrl,
  getActionUrl,
} from "./utils";
import {
  PropertyAvailabilityCheckEmail,
} from "./emails/property-availability-check";
import {PropertyAutoPausedEmail} from "./emails/property-auto-paused";

const MAX_REMINDERS = 3;
const PERIODICAL_NOTIFICATIONS_DAYS = 7;
const LIMIT_DAYS_MS = PERIODICAL_NOTIFICATIONS_DAYS * 24 * 60 * 60 * 1000;

interface PropertyEmailDetails {
  displayName: string;
  houseName: string;
  price?: string;
  houseImage?: string;
  recipientEmail: string;
}

/**
 * Queries all currently active property listings from Firestore.
 * @param {Firestore} db The Firestore database instance.
 * @return {Promise<QuerySnapshot<DocumentData>>} Snapshot of active properties.
 */
async function fetchActiveProperties(
  db: Firestore,
): Promise<QuerySnapshot<DocumentData>> {
  return db
    .collection("properties")
    .where("available", "==", true)
    .get();
}

/**
 * Checks whether a property is due for its limit-day availability verification.
 * Compares last check timestamp (or creation timestamp) against cutoff.
 * @param {DocumentData} property The property document data.
 * @param {number} cutoffTimestampMs Millisecond timestamp cutoff threshold.
 * @return {boolean} True if the property is due for an availability check.
 */
function isPropertyDueForAvailabilityCheck(
  property: DocumentData,
  cutoffTimestampMs: number,
): boolean {
  const lastCheck = property.lastAvailabilityCheckAt as Timestamp | undefined;
  const created = property.createdAt as Timestamp | undefined;

  const referenceTime = lastCheck ?
    lastCheck.toMillis() :
    (created ? created.toMillis() : 0);

  return referenceTime <= cutoffTimestampMs;
}

/**
 * Fetches the owner user record for a property from Firestore.
 * @param {Firestore} db The Firestore database instance.
 * @param {string} ownerId The user ID of the property owner.
 * @return {Promise<DocumentData | null>} Owner data or null if not found.
 */
async function fetchPropertyOwnerDetails(
  db: Firestore,
  ownerId: string,
): Promise<DocumentData | null> {
  const ownerSnap = await db.collection("users").doc(ownerId).get();
  return ownerSnap.data() ?? null;
}

/**
 * Resolves the destination email address for notifications.
 * Uses the test address in emulator mode or the owner's email address.
 * @param {DocumentData} owner The property owner document data.
 * @param {boolean} isEmulator Whether the function is running in an emulator.
 * @return {string | null} The resolved email address or null if none exists.
 */
function resolveRecipientEmailAddress(
  owner: DocumentData,
  isEmulator: boolean,
): string | null {
  if (!owner.email) return null;
  return isEmulator ? TEST_ADDRESS : owner.email;
}

/**
 * Formats and packages property and owner metadata needed for email templates.
 * @param {string} propertyId The ID of the property document.
 * @param {DocumentData} property The property document data.
 * @param {DocumentData} owner The owner user document data.
 * @param {string} recipientEmail The recipient email address.
 * @return {PropertyEmailDetails} Formatted details for email rendering.
 */
function buildPropertyEmailDetails(
  propertyId: string,
  property: DocumentData,
  owner: DocumentData,
  recipientEmail: string,
): PropertyEmailDetails {
  return {
    displayName: owner.displayName ?? owner.name ?? "vecino",
    houseName: formatHouseName(property.propertyType, property.zone),
    price: property.price ? formatPrice(property.price) : undefined,
    houseImage: property.photos?.[0] ?
      toPublicImageUrl(propertyId, property.photos[0]) :
      undefined,
    recipientEmail,
  };
}

/**
 * Evaluates whether property reached maximum allowed missed reminders.
 * @param {number} reminderCount Number of consecutive checks without response.
 * @return {boolean} True if maximum reminders have been reached or exceeded.
 */
function hasReachedMaximumReminders(reminderCount: number): boolean {
  return reminderCount >= MAX_REMINDERS;
}

/**
 * Auto-pauses a property listing in Firestore and notifies the owner by email.
 * Triggered when a property has 3 consecutive unanswered availability checks.
 * @param {DocumentReference} docRef Firestore document ref for the property.
 * @param {string} propertyId The property document ID.
 * @param {PropertyEmailDetails} details Formatted details for the email.
 * @param {Resend} resend The initialized Resend email client.
 * @param {number} reminderCount Total unanswered reminder count.
 * @return {Promise<void>}
 */
async function autoPausePropertyAndNotifyOwner(
  docRef: DocumentReference,
  propertyId: string,
  details: PropertyEmailDetails,
  resend: Resend,
  reminderCount: number,
): Promise<void> {
  await docRef.update({
    available: false,
    autoPausedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const html = await render(
    <PropertyAutoPausedEmail
      displayName={details.displayName}
      houseName={details.houseName}
      price={details.price}
      houseImage={details.houseImage}
      reactivateUrl={`${APP_BASE_URL}/perfil`}
    />,
  );

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: details.recipientEmail,
    subject: `Pausamos tu anuncio: ${details.houseName}`,
    html,
  });

  console.log(
    `checkPropertyAvailability: Auto-paused property ${propertyId} ` +
      `after ${reminderCount} checks.`,
  );
}

/**
 * Sends a limit-day availability verification reminder email to the owner.
 * Updates the check timestamp and increments reminder counter in Firestore.
 * @param {DocumentReference} docRef Firestore document ref for the property.
 * @param {string} propertyId The property document ID.
 * @param {string} ownerId The property owner user ID.
 * @param {PropertyEmailDetails} details Formatted details for the email.
 * @param {Resend} resend The initialized Resend email client.
 * @param {string} apiKey Resend API key for generating signed action URLs.
 * @param {number} reminderCount Current unanswered reminder count.
 * @return {Promise<void>}
 */
async function sendAvailabilityCheckReminderEmail(
  docRef: DocumentReference,
  propertyId: string,
  ownerId: string,
  details: PropertyEmailDetails,
  resend: Resend,
  apiKey: string,
  reminderCount: number,
): Promise<void> {
  const confirmAvailableUrl = getActionUrl(
    "available",
    propertyId,
    ownerId,
    apiKey,
  );
  const confirmRentedUrl = getActionUrl(
    "rented",
    propertyId,
    ownerId,
    apiKey,
  );

  const html = await render(
    <PropertyAvailabilityCheckEmail
      displayName={details.displayName}
      houseName={details.houseName}
      price={details.price}
      houseImage={details.houseImage}
      confirmAvailableUrl={confirmAvailableUrl}
      confirmRentedUrl={confirmRentedUrl}
    />,
  );

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: details.recipientEmail,
    subject: `¿Tu casita sigue disponible? (${details.houseName})`,
    html,
  });

  await docRef.update({
    lastAvailabilityCheckAt: FieldValue.serverTimestamp(),
    availabilityReminderCount: FieldValue.increment(1),
  });

  console.log(
    "checkPropertyAvailability: Sent check reminder " +
      `#${reminderCount + 1} for ${propertyId}.`,
  );
}

/**
 * Processes availability verification for a single property document.
 * Checks eligibility, resolves owner information, and dispatches either
 * an auto-pause action or an availability reminder.
 * @param {QueryDocumentSnapshot<DocumentData>} doc Property document snapshot.
 * @param {Firestore} db The Firestore database instance.
 * @param {Resend} resend The initialized Resend email client.
 * @param {string} resendApiKey Resend API key used for signed URLs.
 * @param {number} cutoffTimestampMs Cutoff timestamp for limit-day checks.
 * @param {boolean} isEmulator Whether the function is running in an emulator.
 * @return {Promise<void>}
 */
async function processSinglePropertyAvailability(
  doc: QueryDocumentSnapshot<DocumentData>,
  db: Firestore,
  resend: Resend,
  resendApiKey: string,
  cutoffTimestampMs: number,
  isEmulator: boolean,
): Promise<void> {
  const property = doc.data();
  const propertyId = doc.id;

  try {
    const isDue = isPropertyDueForAvailabilityCheck(
      property,
      cutoffTimestampMs,
    );
    if (!isDue) return;

    if (!property.ownerId) return;

    const owner = await fetchPropertyOwnerDetails(db, property.ownerId);
    if (!owner) return;

    const recipientEmail = resolveRecipientEmailAddress(owner, isEmulator);
    if (!recipientEmail) return;

    const emailDetails = buildPropertyEmailDetails(
      propertyId,
      property,
      owner,
      recipientEmail,
    );

    const reminderCount = property.availabilityReminderCount ?? 0;

    if (hasReachedMaximumReminders(reminderCount)) {
      await autoPausePropertyAndNotifyOwner(
        doc.ref,
        propertyId,
        emailDetails,
        resend,
        reminderCount,
      );
    } else {
      await sendAvailabilityCheckReminderEmail(
        doc.ref,
        propertyId,
        property.ownerId,
        emailDetails,
        resend,
        resendApiKey,
        reminderCount,
      );
    }
  } catch (err) {
    console.error(
      `checkPropertyAvailability: Error on property ${propertyId}:`,
      err,
    );
  }
}

/**
 * Iterates through all active properties and orchestrates availability checks.
 * @param {Firestore} db The Firestore database instance.
 * @param {Resend} resend The initialized Resend email client.
 * @param {string} resendApiKey Resend API key for signing verification links.
 * @param {boolean} isEmulator Whether the function is running in an emulator.
 * @return {Promise<void>}
 */
async function processAllActivePropertiesAvailability(
  db: Firestore,
  resend: Resend,
  resendApiKey: string,
  isEmulator: boolean,
): Promise<void> {
  const cutoffTimestampMs = Date.now() - LIMIT_DAYS_MS;
  const snapshot = await fetchActiveProperties(db);

  if (snapshot.empty) {
    console.log("checkPropertyAvailability: No active properties found.");
    return;
  }

  for (const doc of snapshot.docs) {
    await processSinglePropertyAvailability(
      doc,
      db,
      resend,
      resendApiKey,
      cutoffTimestampMs,
      isEmulator,
    );
  }
}

/**
 * Scheduled Cloud Function running daily at 09:00 AM America/Bogota.
 * Scans active listings to verify availability after the limit-day period,
 * and auto-pauses listings after consecutive unanswered checks.
 */
export const checkPropertyAvailability = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "America/Bogota",
    secrets: [RESEND_API_KEY],
  },
  async () => {
    const db = getFirestore();
    const resendApiKey = RESEND_API_KEY.value();
    const resend = new Resend(resendApiKey);
    const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

    await processAllActivePropertiesAvailability(
      db,
      resend,
      resendApiKey,
      isEmulator,
    );
  },
);
