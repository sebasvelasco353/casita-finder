import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updateProfile,
  type ConfirmationResult,
  type RecaptchaVerifier,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../config";

const EMAIL_FOR_SIGN_IN_KEY = "emailForSignIn";

export interface SignUpDetails {
  firstName: string;
  lastName?: string;
  phone: string;
}

async function ensureUserProfile(user: User, details?: SignUpDetails) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName ?? null,
      firstName: details?.firstName ?? null,
      lastName: details?.lastName ?? null,
      phone: details?.phone ?? null,
      createdAt: serverTimestamp(),
    });
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function checkPendingEmailLink() {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return { isEmailLink: false as const, storedEmail: null };
  }
  return {
    isEmailLink: true as const,
    storedEmail: window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY),
  };
}

export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
  await ensureUserProfile(user);
}

export async function signInWithPassword(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithPassword(
  email: string,
  password: string,
  details: SignUpDetails,
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  const displayName = [details.firstName, details.lastName]
    .filter(Boolean)
    .join(" ");
  await updateProfile(user, { displayName });
  await ensureUserProfile(user, details);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function sendEmailLink(email: string) {
  await sendSignInLinkToEmail(auth, email, {
    url: window.location.origin + "/",
    handleCodeInApp: true,
  });
  window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
}

export async function completeEmailLinkSignIn(email: string) {
  const { user } = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
  window.history.replaceState(null, "", window.location.pathname);
  await ensureUserProfile(user);
}

export async function sendPhoneCode(
  phoneNumber: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
}

export async function confirmPhoneCode(
  confirmationResult: ConfirmationResult,
  code: string,
) {
  const { user } = await confirmationResult.confirm(code);
  await ensureUserProfile(user);
}

export async function signOutUser() {
  await signOut(auth);
}
