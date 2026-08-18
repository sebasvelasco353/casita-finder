import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserById } from "../firebase/queries/users";

interface AuthContextValue {
  user?: User;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const hydrateUser = async (firebaseUser: typeof auth.currentUser) => {
    if (!firebaseUser) {
      setCurrentUser(undefined);
      return;
    }
    try {
      const dbUser = await getUserById(firebaseUser.uid);
      setCurrentUser(dbUser ?? undefined);
    } catch (error) {
      console.error(error);
      setCurrentUser(undefined);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await hydrateUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        loading,
        refreshUser: () => hydrateUser(auth.currentUser),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
