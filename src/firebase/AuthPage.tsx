import { useState, type FormEvent } from "react";
import { useAuth } from "./auth";

type Mode = "login" | "signup" | "forgot" | "email-link";

const INPUT =
  "w-full rounded-lg border border-gray-91 bg-white px-4 py-2.5 text-sm text-orange-18 placeholder:text-orange-42/60 focus:outline-none focus:ring-2 focus:ring-orange-47";
const BTN_PRIMARY =
  "cursor-pointer rounded-full bg-orange-47 px-6 py-3 text-sm font-semibold text-gray-99 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const BTN_SECONDARY =
  "mt-2.5 w-full cursor-pointer rounded-full border border-orange-47 bg-transparent px-6 py-3 text-sm font-semibold text-orange-47 hover:bg-orange-91 disabled:cursor-not-allowed disabled:opacity-50";
const LINK_BTN = "cursor-pointer text-sm text-orange-47 underline hover:opacity-80";

export function AuthPage() {
  const {
    pendingEmailLink,
    signUpWithPassword,
    signInWithPassword,
    resetPassword,
    sendEmailLink,
    completeEmailLinkSignIn,
    signInWithGoogle,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("email-link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>, successMessage?: string) {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await action();
      if (successMessage) setMessage(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "login") {
      void run(() => signInWithPassword(email, password));
    } else if (mode === "signup") {
      void run(() =>
        signUpWithPassword(email, password, {
          firstName,
          lastName: lastName || undefined,
          phone,
        }),
      );
    } else if (mode === "forgot") {
      void run(
        () => resetPassword(email),
        "Revisa tu correo para restablecer tu contraseña.",
      );
    } else {
      void run(
        () => sendEmailLink(email),
        "Te enviamos un enlace de acceso a tu correo.",
      );
    }
  }

  if (pendingEmailLink) {
    return (
      <div className="mx-auto my-12 w-full max-w-sm rounded-lg border border-orange-86 bg-gray-98 p-6 text-left">
        <h2 className="mb-4 text-xl font-bold text-orange-18">Confirma tu correo</h2>
        <p className="text-sm text-orange-42">
          Ingresa tu correo para completar el inicio de sesión.
        </p>
        <form
          className="mt-4 flex flex-col gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => completeEmailLinkSignIn(email));
          }}
        >
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={INPUT}
          />
          <button type="submit" disabled={busy} className={BTN_PRIMARY}>
            Confirmar
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto my-12 w-full max-w-sm rounded-lg border border-orange-86 bg-gray-98 p-6 text-left">
      <h2 className="mb-4 text-xl font-bold text-orange-18">
        {mode === "login" && "Iniciar sesión"}
        {mode === "signup" && "Crear cuenta"}
        {mode === "forgot" && "Recuperar contraseña"}
        {mode === "email-link" && "Acceder sin contraseña"}
      </h2>

      <button
        type="button"
        disabled={busy}
        onClick={() => void run(signInWithGoogle)}
        className={BTN_SECONDARY}
      >
        Continuar con Google
      </button>

      <form className="mt-4 flex flex-col gap-2.5" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <>
            <input
              type="text"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={INPUT}
            />
            <input
              type="text"
              placeholder="Apellido (opcional)"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={INPUT}
            />
          </>
        )}
        <input
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={INPUT}
        />
        {mode === "signup" && (
          <input
            type="tel"
            placeholder="Número de teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={INPUT}
          />
        )}
        {(mode === "login" || mode === "signup") && (
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={INPUT}
          />
        )}
        <button type="submit" disabled={busy} className={BTN_PRIMARY}>
          {mode === "login" && "Entrar"}
          {mode === "signup" && "Registrarme"}
          {mode === "forgot" && "Enviar enlace de recuperación"}
          {mode === "email-link" && "Enviar enlace de acceso"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-orange-47">{message}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        {mode !== "email-link" && (
          <button type="button" className={LINK_BTN} onClick={() => setMode("email-link")}>
            Acceder sin contraseña
          </button>
        )}
        {mode !== "login" && (
          <button type="button" className={LINK_BTN} onClick={() => setMode("login")}>
            Usar contraseña
          </button>
        )}
        {mode !== "signup" && (
          <button type="button" className={LINK_BTN} onClick={() => setMode("signup")}>
            Crear cuenta
          </button>
        )}
        {mode !== "forgot" && (
          <button type="button" className={LINK_BTN} onClick={() => setMode("forgot")}>
            Olvidé mi contraseña
          </button>
        )}
      </div>
    </div>
  );
}
