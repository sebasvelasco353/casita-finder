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
import type { Property } from "../../types";

const PAGE_SIZE = 20;

export async function getPaginatedProperties(
  cursor?: QueryDocumentSnapshot<DocumentData>,
) {
  const constraints: QueryConstraint[] = [
    where("available", "==", true),
    orderBy("updatedAt", "desc"),
    limit(PAGE_SIZE),
  ];
  if (cursor) constraints.push(startAfter(cursor));

  const snap = await getDocs(
    query(collection(db, "properties"), ...constraints),
  );

  const data = snap.docs.map((d) => d.data() as Property);
  return data;
}
