import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../config";
import type { Filters, Property } from "../../types";
import type { FiltersInterface } from "../../components/FilterBar";

const PAGE_SIZE = 2;

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

export async function getPaginatedProperties(
  ui: FiltersInterface = {},
  cursor?: QueryDocumentSnapshot<DocumentData>,
) {
  const filters = toQueryFilters(ui);
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
    constraints.push(orderBy("updatedAt", "desc"));
  } else if (filters.maxPrice) {
    // range filter on price forces Firestore's first orderBy onto price too
    constraints.push(where("price", "<=", Number(filters.maxPrice)));
    constraints.push(orderBy("price", "asc"));
  } else {
    constraints.push(orderBy("updatedAt", "desc"));
  }

  constraints.push(limit(PAGE_SIZE));
  if (cursor) constraints.push(startAfter(cursor));

  const snap = await getDocs(
    query(collection(db, "properties"), ...constraints),
  );

  const items = snap.docs.map((d) => d.data() as Property);
  const nextCursor =
    snap.docs.length === PAGE_SIZE
      ? snap.docs[snap.docs.length - 1]
      : undefined;

  return { items, nextCursor };
}
