import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { Property } from "../../types";
import {
  deleteProperty,
  getPropertiesByOwner,
} from "../../firebase/queries/properties";
import SettingsSection from "../../components/SettingsSection";
import PropertyOwnerCard from "../../components/PropertyOwnerCard";
import Button from "../../components/Button";
import { HomeIcon } from "lucide-react";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { cityLabelByValue, zoneLabelByValue } from "../../utils/filters";
import { toast } from "sonner";

function MyPropertiesTab({ ownerId }: { ownerId: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [propertyPendingDelete, setPropertyPendingDelete] =
    useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", "owner", ownerId],
    queryFn: () => getPropertiesByOwner(ownerId),
  });

  async function handleConfirmDelete() {
    if (!propertyPendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProperty(propertyPendingDelete.id);
      // removeQueries, no invalidate: la propiedad ya no existe, así que un
      // refetch de ["property", id] volvería undefined si esa query está
      // montada en otra pantalla (CasitaView/EditProperty), y React Query no
      // permite que un queryFn devuelva undefined.
      queryClient.removeQueries({
        queryKey: ["property", propertyPendingDelete.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      await queryClient.invalidateQueries({ queryKey: ["properties-count"] });
      await queryClient.invalidateQueries({
        queryKey: ["properties-new-count"],
      });
      toast.success("Propiedad eliminada.");
      setPropertyPendingDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setDeleting(false);
    }
  }

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
          <p className="text-sm text-orange-42 text-center">
            Aún no has publicado ninguna propiedad.
          </p>
        )}

        {!isLoading && properties && properties.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyOwnerCard
                key={property.id}
                data={property}
                onDelete={() => setPropertyPendingDelete(property)}
              />
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          className="self-start mx-auto"
          handleClick={() => navigate("/property/new")}
        >
          <HomeIcon className="w-4 h-4 mr-2" />
          Publicar casita
        </Button>

        <ConfirmModal
          isOpen={!!propertyPendingDelete}
          onClose={() => {
            if (deleting) return;
            setPropertyPendingDelete(null);
            setDeleteError(null);
          }}
          onConfirm={() => void handleConfirmDelete()}
          title="Eliminar propiedad"
          message={
            propertyPendingDelete
              ? `¿Seguro que quieres eliminar la propiedad en ${
                  cityLabelByValue[propertyPendingDelete.city] ??
                  propertyPendingDelete.city
                } · ${
                  zoneLabelByValue[propertyPendingDelete.zone] ??
                  propertyPendingDelete.zone
                }? Esta acción no se puede deshacer.`
              : ""
          }
          confirming={deleting}
          error={deleteError}
        />
      </div>
    </SettingsSection>
  );
}

export default MyPropertiesTab;
