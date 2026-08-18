import { useState } from "react";
import { Link, Navigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { HouseIcon } from "lucide-react";
import { toast } from "sonner";

import { getPropertiesByOwner } from "../firebase/queries/properties";
import { getStorageImageUrl } from "../firebase/queries/storage";
import { cityLabelByValue, zoneLabelByValue } from "../utils/filters";
import { formatPrice } from "../utils/lib";
import Layout from "../components/Layout";
import Container from "../components/Container";
import Button from "../components/Button";
import Pill from "../components/Pill";
import PublishPropertyModal from "../components/modals/PublishPropertyModal";
import casitaIcon from "../assets/casita_icon.svg";
import ProfileInfoTab from "./perfil/ProfileInfoTab";
import { useAuth } from "../providers/authFirebase";
import { logoutUser } from "../firebase/queries/auth";

const TABS = [
  { label: "Perfil", value: "info" },
  { label: "Mis casitas", value: "casas" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabValue>("info");
  const { user, loading } = useAuth();

  if (!loading && !user) return <Navigate to="/" replace />;

  return (
    <Layout>
      <Container className="py-10 flex-1">
        {loading || !user ? (
          <p className="text-orange-42">Cargando…</p>
        ) : (
          <div className="w-full">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-bold text-2xl text-orange-18">
                  {user.displayName ?? "Mi cuenta"}
                </h1>
                <p className="text-sm text-orange-42">{user.email}</p>
              </div>
              <Button
                variant="secondary"
                handleClick={() =>
                  void logoutUser().then(() => toast.success("Sesión cerrada."))
                }
              >
                Cerrar sesión
              </Button>
            </div>

            <div className="mt-8 border-b border-gray-91">
              <nav className="-mb-px flex gap-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`cursor-pointer border-b-2 px-1 py-3 text-sm font-medium ${
                      activeTab === tab.value
                        ? "border-orange-47 text-orange-18 font-semibold"
                        : "border-transparent text-orange-42 hover:border-gray-91 hover:text-orange-18"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="divide-y divide-gray-91">
              {activeTab === "info" ? (
                <ProfileInfoTab />
              ) : (
                <MyPropertiesTab ownerId={user.id} />
              )}
            </div>
          </div>
        )}
      </Container>
    </Layout>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 py-10 md:grid-cols-3">
      <div>
        <h2 className="text-base font-semibold text-orange-18">{title}</h2>
        <p className="mt-1 text-sm text-orange-42">{description}</p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function MyPropertiesTab({ ownerId }: { ownerId: string }) {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", "owner", ownerId],
    queryFn: () => getPropertiesByOwner(ownerId),
  });

  return (
    <SettingsSection
      title="Mis casitas"
      description="Administra las propiedades que has publicado."
    >
      <div className="flex flex-col gap-4">
        {isLoading && (
          <p className="text-sm text-orange-42">Cargando tus propiedades…</p>
        )}

        {!isLoading && properties?.length === 0 && (
          <p className="text-sm text-orange-42">
            Aún no has publicado ninguna propiedad.
          </p>
        )}

        {!isLoading && properties && properties.length > 0 && (
          <ul className="flex flex-col divide-y divide-gray-91 rounded-lg border border-gray-91 bg-gray-98">
            {properties.map((property) => (
              <li key={property.id}>
                <Link
                  to={`/property/${property.id}/edit`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-93"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-91 text-orange-42/70 overflow-hidden">
                    {property.photos[0] ? (
                      <img
                        src={getStorageImageUrl(
                          `casas/${property.id}/images/${property.photos[0]}`,
                        )}
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

        <Button
          variant="secondary"
          className="self-start"
          handleClick={() => setIsPublishModalOpen(true)}
        >
          <img src={casitaIcon} alt="" className="w-4 h-4" />
          Publicar casita
        </Button>

        <PublishPropertyModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
        />
      </div>
    </SettingsSection>
  );
}
