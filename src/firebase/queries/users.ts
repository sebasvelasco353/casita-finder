import { doc, getDoc } from "firebase/firestore";
import { db } from "../config";
import type { User } from "../../types";

export async function getUserById(userId: string) {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? (snap.data() as User) : undefined;
}
