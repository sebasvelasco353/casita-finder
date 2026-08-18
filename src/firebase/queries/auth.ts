import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { User } from "../../types";
import { auth, db } from "../config";
import { getUserById } from "./users";

type NewUser = Omit<User, "createdAt" | "updatedAt">;

export const createUser = async (user: NewUser): Promise<void> => {
  await setDoc(doc(db, "users", user.id), {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateUser = async (
  id: User["id"],
  updates: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  await updateDoc(doc(db, "users", id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const signInWithPassword = async (
  email: string,
  password: string,
): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

export interface SignUpDetails {
  name: string;
  lastName: string;
  phoneNumber?: string;
}

export const signUpWithPassword = async (
  email: string,
  password: string,
  details: SignUpDetails,
): Promise<void> => {
  const { user: firebaseUser } = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const displayName = [details.name, details.lastName]
    .filter(Boolean)
    .join(" ");
  await updateProfile(firebaseUser, { displayName });
  // ponytail: onAuthStateChanged can fire (and hydrate the provider) before this
  // Firestore write lands, briefly showing a signed-in-but-no-profile state.
  // Fix by refetching after createUser resolves if that gap ever bites.
  await createUser({
    id: firebaseUser.uid,
    name: details.name,
    lastName: details.lastName,
    displayName,
    email,
    ...(details.phoneNumber ? { phoneNumber: details.phoneNumber } : {}),
  });
};

export const signInWithGoogle = async (): Promise<void> => {
  const { user: firebaseUser } = await signInWithPopup(
    auth,
    new GoogleAuthProvider(),
  );
  if (await getUserById(firebaseUser.uid)) return;
  const [name = "", ...rest] = (firebaseUser.displayName ?? "").split(" ");
  await createUser({
    id: firebaseUser.uid,
    name,
    lastName: rest.join(" "),
    displayName: firebaseUser.displayName ?? "",
    email: firebaseUser.email ?? "",
    ...(firebaseUser.phoneNumber
      ? { phoneNumber: firebaseUser.phoneNumber }
      : {}),
  });
};

export const logoutUser = async (): Promise<void> => {
  await auth.signOut();
};
