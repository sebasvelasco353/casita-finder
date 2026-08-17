import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { HouseIcon } from "lucide-react";
import { useAuth } from "../../firebase/auth";
import { AuthPage } from "../../firebase/AuthPage";
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
        <AuthPage />
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
