import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { ConfirmationResult, RecaptchaVerifier, User } from 'firebase/auth'
import * as authService from './queries/auth'
import type { SignUpDetails } from './queries/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  pendingEmailLink: boolean
  phoneCodeSent: boolean
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
  sendPhoneCode: (
    phoneNumber: string,
    verifier: RecaptchaVerifier,
  ) => Promise<void>
  confirmPhoneCode: (code: string) => Promise<void>
  cancelPhoneCode: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingEmailLink, setPendingEmailLink] = useState(false)
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null)

  useEffect(() => {
    return authService.subscribeToAuthState((nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const { isEmailLink, storedEmail } = authService.checkPendingEmailLink()
    if (!isEmailLink) return

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
    await authService.signUpWithPassword(email, password, details)
  }

  async function signInWithPassword(email: string, password: string) {
    await authService.signInWithPassword(email, password)
  }

  async function resetPassword(email: string) {
    await authService.resetPassword(email)
  }

  async function sendEmailLink(email: string) {
    await authService.sendEmailLink(email)
  }

  async function completeEmailLinkSignIn(email: string) {
    await authService.completeEmailLinkSignIn(email)
    setPendingEmailLink(false)
  }

  async function signInWithGoogle() {
    await authService.signInWithGoogle()
  }

  async function sendPhoneCode(phoneNumber: string, verifier: RecaptchaVerifier) {
    const result = await authService.sendPhoneCode(phoneNumber, verifier)
    setConfirmationResult(result)
  }

  async function confirmPhoneCode(code: string) {
    if (!confirmationResult) {
      throw new Error('No hay un código pendiente de confirmación')
    }
    await authService.confirmPhoneCode(confirmationResult, code)
    setConfirmationResult(null)
  }

  function cancelPhoneCode() {
    setConfirmationResult(null)
  }

  async function signOut() {
    await authService.signOutUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pendingEmailLink,
        phoneCodeSent: confirmationResult !== null,
        signUpWithPassword,
        signInWithPassword,
        resetPassword,
        sendEmailLink,
        completeEmailLinkSignIn,
        signInWithGoogle,
        sendPhoneCode,
        confirmPhoneCode,
        cancelPhoneCode,
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
