import { useState } from "react";
import { Link } from "react-router";
import Container from "./Container";
import { useAuth } from "../providers/authFirebase";
import AuthModal from "./modals/AuthModal";

export default function Header() {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="bg-gray-98">
      <Container className="py-4 flex flex-row items-center justify-between">
        <span className="logo font-black text-orange-47">Una Casita</span>
        <nav className="flex items-center gap-2.5">
          <a className="py-1 px-3" href="/casitas">
            Casitas
          </a>
          {/* <a className="py-1 px-3" href="/bodegas">
            Bodegaje
          </a> */}
          {!loading &&
            (user ? (
              <Link
                to="/perfil"
                className="py-1 px-3 text-sm text-orange-42 hover:text-orange-18"
              >
                {user.displayName ?? user.email}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="cursor-pointer py-1 px-3 text-sm text-orange-42 hover:text-orange-18"
              >
                Iniciar sesión
              </button>
            ))}
        </nav>
      </Container>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}
