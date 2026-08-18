import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

import Layout from "../components/Layout";
import Container from "../components/Container";
import Button from "../components/Button";
import ProfileInfoTab from "./perfil/ProfileInfoTab";
import { useAuth } from "../providers/authFirebase";
import { logoutUser } from "../firebase/queries/auth";
import MyPropertiesTab from "./perfil/MyPropertiesTab";

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
