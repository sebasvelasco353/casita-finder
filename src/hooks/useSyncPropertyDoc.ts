import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { db } from "../firebase/config";
import type { Property } from "../types";

// El pipeline de imágenes (functions/src/index.ts) escribe `photos` unos
// segundos después de publicar/editar. Este listener mantiene la cache de
// React Query al día sin que el usuario tenga que recargar la página.
export function useSyncPropertyDoc(propertyId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!propertyId) return;

    return onSnapshot(doc(db, "properties", propertyId), (snap) => {
      if (!snap.exists()) return;
      queryClient.setQueryData(
        ["property", propertyId],
        { ...snap.data(), id: snap.id } as Property,
      );
    });
  }, [propertyId, queryClient]);
}
