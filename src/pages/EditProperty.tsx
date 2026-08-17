import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, LoaderIcon, TriangleAlert } from "lucide-react";
import Layout from "../components/Layout";
import Container from "../components/Container";
import TextField from "../components/TextField";
import ToggleGroup from "../components/ToggleGroup";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../components/empty";
import { useAuth } from "../firebase/auth";
import {
  getPropertyById,
  updateProperty,
  type EditPropertyFormDataInterface,
} from "../firebase/queries/properties";
import type { Property } from "../types";

const bedroomOptions = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4+", value: "4+" },
];

const parkingOptions = [
  { label: "Público", value: "publico" },
  { label: "Privado", value: "privado" },
  { label: "Sin parqueadero", value: "sin_parqueadero" },
];

const zoneOptions = [
  { label: "Norte", value: "norte" },
  { label: "Sur", value: "sur" },
  { label: "Centro", value: "centro" },
  { label: "Oriente", value: "oriente" },
  { label: "Occidente", value: "occidente" },
];

const propertyTypeOptions = [
  { label: "Casa", value: "casa" },
  { label: "Apartamento", value: "apartamento" },
  { label: "Habitación", value: "habitacion" },
  { label: "Bodega", value: "bodega" },
];

const availabilityOptions = [
  { label: "Disponible", value: "true" },
  { label: "No disponible", value: "false" },
];

function toFormData(property: Property): EditPropertyFormDataInterface {
  return {
    available: property.available,
    propertyType: property.propertyType,
    city: property.city,
    zone: property.zone,
    neighborhood: property.neighborhood,
    floor: String(property.floor ?? ""),
    price: String(property.price ?? ""),
    bedrooms:
      (property.bedrooms ?? 0) >= 4
        ? "4+"
        : (String(
            property.bedrooms ?? "",
          ) as EditPropertyFormDataInterface["bedrooms"]),
    furnished: property.furnished,
    petsAllowed: property.petsAllowed,
    parkingType: property.parking?.type ?? "sin_parqueadero",
    parkingSpots: String(property.parking?.spots ?? ""),
    description: property.description ?? "",
  };
}

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();

  const {
    data: property,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getPropertyById(id as string),
    enabled: !!id,
  });

  const isOwner = !!user && !!property && property.ownerId === user.uid;
  const showLoading = isLoading || authLoading;
  const showNotFound = !isLoading && (isError || !property);
  const showForbidden = !isLoading && !authLoading && property && !isOwner;

  return (
    <Layout>
      <Container className="items-start py-8">
        <a
          href="/"
          className="flex items-center gap-1 text-sm text-orange-42 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a casitas
        </a>

        {showLoading && (
          <Empty className="border border-zinc-300 border-dashed bg-white w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LoaderIcon className="animate-spin" />
              </EmptyMedia>
              <EmptyTitle>Cargando</EmptyTitle>
              <EmptyDescription>
                Espera unos segundos mientras cargamos los detalles de esta
                casita.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {showNotFound && (
          <Empty className="border border-red-300 border-dashed bg-white w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-red-100">
                <TriangleAlert className="text-red-500" />
              </EmptyMedia>
              <EmptyTitle>No encontramos esta casita</EmptyTitle>
              <EmptyDescription>
                Es posible que ya no esté disponible o que el enlace sea
                incorrecto.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {showForbidden && (
          <Empty className="border border-red-300 border-dashed bg-white w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-red-100">
                <TriangleAlert className="text-red-500" />
              </EmptyMedia>
              <EmptyTitle>No tienes acceso a esta casita</EmptyTitle>
              <EmptyDescription>
                Solo el propietario de este anuncio puede editarlo.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!showLoading && !showNotFound && !showForbidden && property && (
          <EditPropertyForm key={property.id} property={property} />
        )}
      </Container>
    </Layout>
  );
}

function EditPropertyForm({ property }: { property: Property }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EditPropertyFormDataInterface>(() =>
    toFormData(property),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateField<K extends keyof EditPropertyFormDataInterface>(
    key: K,
    value: EditPropertyFormDataInterface[K],
  ) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setSaveError(null);
    setIsSaving(true);
    try {
      await updateProperty(property.id, formData);
      await queryClient.invalidateQueries({
        queryKey: ["property", property.id],
      });
      // "properties" sin filtros invalida también ["properties", filters]
      // (Home, cualquier combinación) y ["properties", "owner", uid] a la vez.
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      await queryClient.invalidateQueries({ queryKey: ["properties-count"] });
      await queryClient.invalidateQueries({
        queryKey: ["properties-new-count"],
      });
      navigate(`/property/${property.id}/view`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg flex flex-col gap-4"
    >
      <h1 className="font-bold text-orange-18 text-2xl">Editar casita</h1>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">Estado</span>
        <ToggleGroup
          options={availabilityOptions}
          value={String(formData.available)}
          onChange={(value) => updateField("available", value === "true")}
        />
      </div>

      <TextField
        label="Ciudad"
        value={formData.city}
        onChange={(value) => updateField("city", value)}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">Zona</span>
        <Dropdown
          variant="field"
          options={zoneOptions}
          value={formData.zone}
          onChange={(value) => updateField("zone", value)}
        />
      </div>
      <TextField
        label="Barrio (opcional)"
        value={formData.neighborhood}
        onChange={(value) => updateField("neighborhood", value)}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">
          Tipo de lugar
        </span>
        <Dropdown
          variant="field"
          options={propertyTypeOptions}
          value={formData.propertyType}
          onChange={(value) => updateField("propertyType", value)}
        />
      </div>
      <TextField
        label="Piso (opcional)"
        value={formData.floor}
        onChange={(value) => updateField("floor", value)}
      />
      <TextField
        label="Precio"
        value={formData.price}
        onChange={(value) => updateField("price", value)}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">Habitaciones</span>
        <ToggleGroup
          options={bedroomOptions}
          value={formData.bedrooms}
          onChange={(value) =>
            updateField(
              "bedrooms",
              value as EditPropertyFormDataInterface["bedrooms"],
            )
          }
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-orange-18">
        <input
          type="checkbox"
          checked={formData.petsAllowed}
          onChange={(event) => updateField("petsAllowed", event.target.checked)}
          className="h-4 w-4 accent-orange-47"
        />
        Mascotas permitidas
      </label>
      <label className="flex items-center gap-2 text-sm text-orange-18">
        <input
          type="checkbox"
          checked={formData.furnished}
          onChange={(event) => updateField("furnished", event.target.checked)}
          className="h-4 w-4 accent-orange-47"
        />
        Amoblado
      </label>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">Parqueadero</span>
        <ToggleGroup
          options={parkingOptions}
          value={formData.parkingType}
          onChange={(value) =>
            updateField(
              "parkingType",
              value as EditPropertyFormDataInterface["parkingType"],
            )
          }
        />
      </div>
      {formData.parkingType !== "sin_parqueadero" && (
        <TextField
          label="Cantidad de parqueaderos"
          value={formData.parkingSpots}
          onChange={(value) => updateField("parkingSpots", value)}
        />
      )}
      <TextField
        label="Descripción (opcional)"
        as="textarea"
        value={formData.description}
        onChange={(value) => updateField("description", value)}
      />

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="flex flex-col gap-3 mt-2">
        <Button
          type="submit"
          className="w-full"
          disabled={isSaving}
          handleClick={() => {}}
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          disabled={isSaving}
          handleClick={() => navigate(`/property/${property.id}/view`)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
