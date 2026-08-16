import { useAuth } from "../../firebase/auth";
import { AuthPage } from "../../firebase/AuthPage";
import Modal from "./Modal";
import Button from "../Button";

interface AuthModalPropsInterface {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalPropsInterface) {
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
          <Button variant="secondary" handleClick={() => void signOut().then(onClose)}>
            Cerrar sesión
          </Button>
        </div>
      ) : (
        <AuthPage />
      )}
    </Modal>
  );
}
