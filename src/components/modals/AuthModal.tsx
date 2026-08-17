import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { HouseIcon } from "lucide-react";
import { RecaptchaVerifier } from "firebase/auth";
import { useAuth } from "../../firebase/auth";
import { auth } from "../../firebase/config";
import Modal from "./Modal";
import Button from "../Button";
import Pill from "../Pill";
import { getPropertiesByOwner } from "../../firebase/queries/properties";
import { cityLabelByValue, zoneLabelByValue } from "../../utils/filters";
import { formatPrice } from "../../utils/lib";
import { getStorageImageUrl } from "../../firebase/queries/storage";

interface AuthModalPropsInterface {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
}: AuthModalPropsInterface) {
  const { user, loading, signOut } = useAuth();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Mi cuenta" : undefined}
      className="max-w-sm"
    >
      {loading ? (
        <p className="py-4 text-center text-orange-42">Cargando…</p>
      ) : user ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-orange-42">
            Sesión iniciada como{" "}
            <span className="font-semibold text-orange-18">
              {user.displayName ?? user.email}
            </span>
          </p>
          <MyProperties ownerId={user.uid} onNavigate={onClose} />
          <Button
            variant="secondary"
            handleClick={() => void signOut().then(onClose)}
          >
            Cerrar sesión
          </Button>
        </div>
      ) : (
        <AuthForm />
      )}
    </Modal>
  );
}

function MyProperties({
  ownerId,
  onNavigate,
}: {
  ownerId: string;
  onNavigate: () => void;
}) {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", "owner", ownerId],
    queryFn: () => getPropertiesByOwner(ownerId),
  });

  return (
    <div className="w-full text-left">
      <h3 className="font-bold text-orange-18">Mis propiedades</h3>

      {isLoading && (
        <p className="mt-2 text-sm text-orange-42">Cargando tus propiedades…</p>
      )}

      {!isLoading && properties?.length === 0 && (
        <p className="mt-2 text-sm text-orange-42">
          Aún no has publicado ninguna propiedad.
        </p>
      )}

      {!isLoading && properties && properties.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {properties.map((property) => (
            <li key={property.id}>
              <Link
                to={`/property/${property.id}/edit`}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-lg border border-gray-91 bg-gray-98 p-3 hover:bg-gray-93"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-91 text-orange-42/70 overflow-hidden">
                  {property.photos[0] ? (
                    <img
                      src={getStorageImageUrl(`casas/${property.id}/images/${property.photos[0]}`)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <HouseIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-orange-18">
                    {cityLabelByValue[property.city] ?? property.city} ·{" "}
                    {zoneLabelByValue[property.zone] ?? property.zone}
                  </p>
                  <p className="text-xs text-orange-42">
                    {formatPrice(property.price)}
                  </p>
                </div>
                <Pill variant={property.available ? "primary" : "secondary"}>
                  {property.available ? "Disponible" : "No disponible"}
                </Pill>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Mode = "passwordless" | "login" | "signup" | "forgot";
type PasswordlessTab = "email" | "sms";

const INPUT =
  "w-full rounded-lg border border-gray-91 bg-white px-4 py-2.5 text-sm text-orange-18 placeholder:text-orange-42/60 focus:outline-none focus:ring-2 focus:ring-orange-47";
const BTN_PRIMARY =
  "cursor-pointer rounded-full bg-orange-47 px-6 py-3 text-sm font-semibold text-gray-99 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const BTN_SECONDARY =
  "mt-2.5 w-full cursor-pointer rounded-full border border-orange-47 bg-transparent px-6 py-3 text-sm font-semibold text-orange-47 hover:bg-orange-91 disabled:cursor-not-allowed disabled:opacity-50";
const LINK_BTN = "cursor-pointer text-sm text-orange-47 underline hover:opacity-80";
const TAB = "pb-2 text-sm font-semibold";
const TAB_ACTIVE = "border-b-2 border-orange-47 text-orange-47";
const TAB_INACTIVE = "text-orange-42";

function AuthForm() {
  const {
    pendingEmailLink,
    phoneCodeSent,
    signUpWithPassword,
    signInWithPassword,
    resetPassword,
    sendEmailLink,
    completeEmailLinkSignIn,
    signInWithGoogle,
    sendPhoneCode,
    confirmPhoneCode,
    cancelPhoneCode,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("passwordless");
  const [passwordlessTab, setPasswordlessTab] = useState<PasswordlessTab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
      cancelPhoneCode();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getVerifier() {
    if (!verifierRef.current) {
      verifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
        size: "invisible",
      });
    }
    return verifierRef.current;
  }

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

  function switchPasswordlessTab(tab: PasswordlessTab) {
    setPasswordlessTab(tab);
    setError(null);
    setMessage(null);
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
    } else if (passwordlessTab === "sms") {
      void run(() => sendPhoneCode(phone, getVerifier()));
    } else {
      void run(
        () => sendEmailLink(email),
        "Te enviamos un enlace de acceso a tu correo.",
      );
    }
  }

  const recaptchaContainer = <div ref={recaptchaContainerRef} />;

  if (pendingEmailLink) {
    return (
      <>
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
      {recaptchaContainer}
      </>
    );
  }

  if (phoneCodeSent) {
    return (
      <>
      <div className="mx-auto my-12 w-full max-w-sm rounded-lg border border-orange-86 bg-gray-98 p-6 text-left">
        <h2 className="mb-4 text-xl font-bold text-orange-18">Confirma tu número</h2>
        <p className="text-sm text-orange-42">
          Ingresa el código de 6 dígitos que enviamos por SMS.
        </p>
        <form
          className="mt-4 flex flex-col gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => confirmPhoneCode(code));
          }}
        >
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className={INPUT}
          />
          <button type="submit" disabled={busy} className={BTN_PRIMARY}>
            Confirmar
          </button>
        </form>
        <button
          type="button"
          className={`${LINK_BTN} mt-3`}
          onClick={() => {
            cancelPhoneCode();
            setCode("");
            setError(null);
          }}
        >
          Usar otro número
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
      {recaptchaContainer}
      </>
    );
  }

  return (
    <>
    <div className="mx-auto my-12 w-full max-w-sm rounded-lg border border-orange-86 bg-gray-98 p-6 text-left">
      <h2 className="mb-4 text-xl font-bold text-orange-18">
        {mode === "passwordless" && "Acceder sin contraseña"}
        {mode === "login" && "Iniciar sesión"}
        {mode === "signup" && "Crear cuenta"}
        {mode === "forgot" && "Recuperar contraseña"}
      </h2>

      <button
        type="button"
        disabled={busy}
        onClick={() => void run(signInWithGoogle)}
        className={BTN_SECONDARY}
      >
        Continuar con Google
      </button>

      {mode === "passwordless" && (
        <div className="mb-1 mt-4 flex gap-4 border-b border-gray-91">
          <button
            type="button"
            className={`${TAB} ${passwordlessTab === "email" ? TAB_ACTIVE : TAB_INACTIVE}`}
            onClick={() => switchPasswordlessTab("email")}
          >
            Correo
          </button>
          <button
            type="button"
            className={`${TAB} ${passwordlessTab === "sms" ? TAB_ACTIVE : TAB_INACTIVE}`}
            onClick={() => switchPasswordlessTab("sms")}
          >
            SMS
          </button>
        </div>
      )}

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
        {!(mode === "passwordless" && passwordlessTab === "sms") && (
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={INPUT}
          />
        )}
        {mode === "passwordless" && passwordlessTab === "sms" && (
          <input
            type="tel"
            placeholder="+506 8888 8888"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            pattern="^\+[1-9]\d{6,14}$"
            className={INPUT}
          />
        )}
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
          {mode === "passwordless" && passwordlessTab === "email" && "Enviar enlace de acceso"}
          {mode === "passwordless" && passwordlessTab === "sms" && "Enviar código"}
          {mode === "login" && "Entrar"}
          {mode === "signup" && "Registrarme"}
          {mode === "forgot" && "Enviar enlace de recuperación"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-orange-47">{message}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        {mode === "passwordless" && (
          <button type="button" className={LINK_BTN} onClick={() => setMode("login")}>
            Usar contraseña
          </button>
        )}
        {mode !== "passwordless" && (
          <button type="button" className={LINK_BTN} onClick={() => setMode("passwordless")}>
            Acceder sin contraseña
          </button>
        )}
        {mode !== "passwordless" && mode !== "login" && (
          <button type="button" className={LINK_BTN} onClick={() => setMode("login")}>
            Iniciar sesión
          </button>
        )}
        {mode !== "passwordless" && mode !== "signup" && (
          <button type="button" className={LINK_BTN} onClick={() => setMode("signup")}>
            Crear cuenta
          </button>
        )}
        {mode !== "passwordless" && mode !== "forgot" && (
          <button type="button" className={LINK_BTN} onClick={() => setMode("forgot")}>
            Olvidé mi contraseña
          </button>
        )}
      </div>
    </div>
    {recaptchaContainer}
    </>
  );
}
