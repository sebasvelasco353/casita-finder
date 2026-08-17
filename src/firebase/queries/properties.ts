import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { auth, db } from "../config";
import type { Filters, Property } from "../../types";
import type { FiltersInterface } from "../../utils/filters";
import type { PublishPropertyFormDataInterface } from "../../components/modals/PublishPropertyModal";

const PAGE_SIZE = 12;

// FilterBar's dropdowns only speak strings ("si"/"no"/""); this is the one
// place that turns that UI shape into the typed shape Firestore needs.
function toQueryFilters(ui: FiltersInterface): Filters {
  return {
    city: ui.city || undefined,
    propertyType: (ui.propertyType || undefined) as
      | Property["propertyType"]
      | undefined,
    zone: ui.zone ? ui.zone.trim().toLowerCase() : undefined,
    maxPrice: ui.maxPrice || undefined,
    furnished: ui.furnished ? ui.furnished === "si" : undefined,
    pets: ui.pets ? ui.pets === "si" : undefined,
  };
}

// Constraints compartidas por getPaginatedProperties y getPropertiesCount
// (todo menos orderBy/limit/startAfter, que solo aplican a la paginación).
function buildFilterConstraints(filters: Filters): QueryConstraint[] {
  const constraints: QueryConstraint[] = [where("available", "==", true)];

  if (filters.city) constraints.push(where("city", "==", filters.city));
  if (filters.propertyType)
    constraints.push(where("propertyType", "==", filters.propertyType));
  if (filters.zone) constraints.push(where("zone", "==", filters.zone));
  if (filters.furnished !== undefined)
    constraints.push(where("furnished", "==", filters.furnished));
  if (filters.pets !== undefined)
    constraints.push(where("petsAllowed", "==", filters.pets));

  if (filters.maxPrice === "gratis") {
    constraints.push(where("price", "==", 0));
  } else if (filters.maxPrice) {
    constraints.push(where("price", "<=", Number(filters.maxPrice)));
  }

  return constraints;
}

export async function getPaginatedProperties(
  ui: FiltersInterface = {},
  cursor?: QueryDocumentSnapshot<DocumentData>,
) {
  const filters = toQueryFilters(ui);
  const constraints = buildFilterConstraints(filters);

  if (filters.maxPrice && filters.maxPrice !== "gratis") {
    // range filter on price forces Firestore's first orderBy onto price too
    constraints.push(orderBy("price", "asc"));
  } else {
    constraints.push(orderBy("updatedAt", "desc"));
  }

  constraints.push(limit(PAGE_SIZE));
  if (cursor) constraints.push(startAfter(cursor));

  const snap = await getDocs(
    query(collection(db, "properties"), ...constraints),
  );

  const items = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Property);
  const nextCursor =
    snap.docs.length === PAGE_SIZE
      ? snap.docs[snap.docs.length - 1]
      : undefined;

  return { items, nextCursor };
}

export async function getPropertiesCount(ui: FiltersInterface = {}) {
  const filters = toQueryFilters(ui);
  const constraints = buildFilterConstraints(filters);

  const snap = await getCountFromServer(
    query(collection(db, "properties"), ...constraints),
  );

  return snap.data().count;
}

function toContactNumber(formData: PublishPropertyFormDataInterface) {
  return `${formData.countryCode}${formData.phoneNumber}`.replace(
    /[^\d+]/g,
    "",
  );
}

function toPropertyDoc(formData: PublishPropertyFormDataInterface) {
  return {
    available: true,
    propertyType: formData.propertyType as Property["propertyType"],
    city: formData.city,
    zone: formData.zone,
    neighborhood: formData.neighborhood,
    floor: Number(formData.floor) || 0,
    price: Number(formData.price) || 0,
    bedrooms: formData.bedrooms === "4+" ? 4 : Number(formData.bedrooms),
    furnished: formData.furnished,
    petsAllowed: formData.petsAllowed,
    parkingType: formData.parkingType,
    description: formData.description || "",
    contact_number: toContactNumber(formData),
    cover: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export async function createProperty(
  formData: PublishPropertyFormDataInterface,
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Debes iniciar sesión");

  // TODO: Add images
  const propertyRef = doc(collection(db, "properties"));
  await setDoc(propertyRef, {
    ownerId: user.uid,
    ...toPropertyDoc(formData),
  });

  return propertyRef.id;
}

export async function getPropertyById(propertyId: string) {
  const snap = await getDoc(doc(db, "properties", propertyId));
  if (!snap.exists()) return undefined;
  return { ...snap.data(), id: snap.id } as Property;
}

export async function getPropertiesByOwner(ownerId: string) {
  const snap = await getDocs(
    query(collection(db, "properties"), where("ownerId", "==", ownerId)),
  );

  // sorted client-side to avoid needing a composite index (ownerId + updatedAt)
  const items = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Property);
  items.sort(
    (a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0),
  );
  return items;
}

export interface EditPropertyFormDataInterface {
  available: boolean;
  propertyType: string;
  city: string;
  zone: string;
  neighborhood: string;
  floor: string;
  price: string;
  bedrooms: "1" | "2" | "3" | "4+";
  furnished: boolean;
  petsAllowed: boolean;
  parkingType: "publico" | "privado" | "sin_parqueadero";
  description: string;
}

export async function updateProperty(
  propertyId: string,
  formData: EditPropertyFormDataInterface,
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Debes iniciar sesión");

  await updateDoc(doc(db, "properties", propertyId), {
    available: formData.available,
    propertyType: formData.propertyType as Property["propertyType"],
    city: formData.city,
    zone: formData.zone,
    neighborhood: formData.neighborhood,
    floor: Number(formData.floor) || 0,
    price: Number(formData.price) || 0,
    bedrooms: formData.bedrooms === "4+" ? 4 : Number(formData.bedrooms),
    furnished: formData.furnished,
    petsAllowed: formData.petsAllowed,
    parkingType: formData.parkingType,
    description: formData.description || "",
    updatedAt: serverTimestamp(),
  });
}
