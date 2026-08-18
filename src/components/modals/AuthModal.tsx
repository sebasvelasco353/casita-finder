import { FirebaseError } from "firebase/app";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, HomeIcon, LoaderIcon, TriangleAlert } from "lucide-react";
import Button from "../Button";
import TextField from "../TextField";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from "../../firebase/queries/auth";
import { useAuth } from "../../providers/authFirebase";
import Modal from "./Modal";

interface AuthModalPropsInterface {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = "login" | "signup";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "Correo o contraseña incorrectos.",
  "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/popup-closed-by-user":
    "Se cerró la ventana de Google antes de completar el inicio de sesión.",
  "auth/network-request-failed": "Problema de conexión. Inténtalo de nuevo.",
};
const FALLBACK_ERROR = "Algo salió mal. Inténtalo de nuevo.";

const SUBTITLES: Record<Mode, string> = {
  login: "Ingresa para gestionar tus casitas.",
  signup: "Únete y encuentra o publica tu próxima casita.",
};

function getAuthErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    return ERROR_MESSAGES[err.code] ?? FALLBACK_ERROR;
  }
  return FALLBACK_ERROR;
}

export default function AuthModal({ isOpen, onClose }: AuthModalPropsInterface) {
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleModeSwitch = () => {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setError(null);
  };

  const handleGoogleClick = async () => {
    setGoogleSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      await refreshUser();
      toast.success("Sesión iniciada correctamente.");
      onClose();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "login") {
        await signInWithPassword(email, password);
      } else {
        await signUpWithPassword(email, password, { name, lastName });
      }
      await refreshUser();
      toast.success(
        mode === "login"
          ? "Sesión iniciada correctamente."
          : "Cuenta creada correctamente.",
      );
      onClose();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      className="max-w-sm"
    >
      <div className="flex items-center gap-3 -mt-2 mb-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-86 text-orange-47">
          <HomeIcon className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm text-orange-42">{SUBTITLES[mode]}</p>
      </div>

      <Button
        variant="secondary"
        handleClick={() => void handleGoogleClick()}
        disabled={googleSubmitting || submitting}
        className="w-full"
      >
        {googleSubmitting ? (
          <LoaderIcon className="w-5 h-5 animate-spin" aria-hidden="true" />
        ) : (
          <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
        )}
        {googleSubmitting ? "Conectando..." : "Continuar con Google"}
      </Button>

      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-gray-91" />
        <span className="text-xs text-orange-42">o</span>
        <div className="h-px flex-1 bg-gray-91" />
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
        {mode === "signup" && (
          <>
            <TextField
              label="Nombre"
              required
              autoComplete="given-name"
              value={name}
              onChange={setName}
            />
            <TextField
              label="Apellido"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={setLastName}
            />
          </>
        )}
        <TextField
          label="Correo electrónico"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">
            Contraseña <span className="text-orange-47">*</span>
          </span>
          <span className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-91 bg-gray-98 px-4 py-2.5 pr-11 text-sm text-orange-18 placeholder:text-orange-42/60 focus:outline-none focus:ring-2 focus:ring-orange-47"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-orange-42 hover:text-orange-18"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </span>
        </label>
        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600"
          >
            <TriangleAlert className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          handleClick={() => {}}
          disabled={submitting}
          className="w-full"
        >
          {submitting && <LoaderIcon className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {submitting
            ? "Cargando..."
            : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
        </Button>
      </form>

      <button
        type="button"
        onClick={handleModeSwitch}
        className="cursor-pointer mt-4 w-full text-center text-sm text-orange-42 hover:text-orange-18"
      >
        {mode === "login"
          ? "¿No tienes cuenta? Crear cuenta"
          : "¿Ya tienes cuenta? Iniciar sesión"}
      </button>
    </Modal>
  );
}
