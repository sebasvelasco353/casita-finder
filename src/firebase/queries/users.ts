import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../config";
import type { User } from "../../types";

export async function getUserById(userId: string) {
  const snap = await getDocs(
    query(collection(db, "users"), where("id", "==", userId), limit(1)),
  );

  const data = snap.docs.map((d) => d.data()) as User[];
  return data[0];
}
