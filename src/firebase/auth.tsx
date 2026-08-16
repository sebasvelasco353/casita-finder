import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './config'

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn'

interface SignUpDetails {
  firstName: string
  lastName?: string
  phone: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  pendingEmailLink: boolean
  signUpWithPassword: (
    email: string,
    password: string,
    details: SignUpDetails,
  ) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  sendEmailLink: (email: string) => Promise<void>
  completeEmailLinkSignIn: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function ensureUserProfile(user: User, details?: SignUpDetails) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName ?? null,
      firstName: details?.firstName ?? null,
      lastName: details?.lastName ?? null,
      phone: details?.phone ?? null,
      createdAt: serverTimestamp(),
    })
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingEmailLink, setPendingEmailLink] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return

    const storedEmail = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY)
    if (storedEmail) {
      void completeEmailLinkSignIn(storedEmail)
    } else {
      setPendingEmailLink(true)
    }
  }, [])

  async function signUpWithPassword(
    email: string,
    password: string,
    details: SignUpDetails,
  ) {
    const { user: newUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    )
    const displayName = [details.firstName, details.lastName]
      .filter(Boolean)
      .join(' ')
    await updateProfile(newUser, { displayName })
    await ensureUserProfile(newUser, details)
  }

  async function signInWithPassword(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email)
  }

  async function sendEmailLink(email: string) {
    await sendSignInLinkToEmail(auth, email, {
      url: window.location.origin + '/',
      handleCodeInApp: true,
    })
    window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email)
  }

  async function completeEmailLinkSignIn(email: string) {
    const { user: newUser } = await signInWithEmailLink(
      auth,
      email,
      window.location.href,
    )
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY)
    setPendingEmailLink(false)
    window.history.replaceState(null, '', window.location.pathname)
    await ensureUserProfile(newUser)
  }

  async function signInWithGoogle() {
    const { user: newUser } = await signInWithPopup(
      auth,
      new GoogleAuthProvider(),
    )
    await ensureUserProfile(newUser)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pendingEmailLink,
        signUpWithPassword,
        signInWithPassword,
        resetPassword,
        sendEmailLink,
        completeEmailLinkSignIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
