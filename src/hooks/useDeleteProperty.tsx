import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ConfirmModal from "../components/modals/ConfirmModal";
import { deleteProperty } from "../firebase/queries/properties";
import { cityLabelByValue, zoneLabelByValue } from "../utils/filters";
import type { Property } from "../types";

export function useDeleteProperty(property: Property, onDeleted?: () => void) {
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteProperty(property.id);
      // removeQueries, no invalidate: la propiedad ya no existe, así que un
      // refetch de ["property", id] volvería undefined mientras la query
      // sigue montada en esta misma pantalla (CasitaView/EditProperty), y
      // React Query no permite que un queryFn devuelva undefined.
      queryClient.removeQueries({ queryKey: ["property", property.id] });
      // "properties" sin filtros invalida también ["properties", filters]
      // (Home, cualquier combinación) y ["properties", "owner", uid] a la vez.
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      await queryClient.invalidateQueries({ queryKey: ["properties-count"] });
      await queryClient.invalidateQueries({
        queryKey: ["properties-new-count"],
      });
      toast.success("Propiedad eliminada.");
      setIsConfirmOpen(false);
      onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setDeleting(false);
    }
  }

  const modal = (
    <ConfirmModal
      isOpen={isConfirmOpen}
      onClose={() => {
        if (deleting) return;
        setIsConfirmOpen(false);
        setError(null);
      }}
      onConfirm={() => void confirmDelete()}
      title="Eliminar propiedad"
      message={`¿Seguro que quieres eliminar la propiedad en ${
        cityLabelByValue[property.city] ?? property.city
      } · ${
        zoneLabelByValue[property.zone] ?? property.zone
      }? Esta acción no se puede deshacer.`}
      confirming={deleting}
      error={error}
    />
  );

  return { requestDelete: () => setIsConfirmOpen(true), modal };
}
