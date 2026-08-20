import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, LoaderIcon, TriangleAlert } from "lucide-react";
import Layout from "../components/Layout";
import Container from "../components/Container";
import TextField from "../components/TextField";
import ToggleGroup from "../components/ToggleGroup";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import ImagePicker from "../components/ImagePicker";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../components/empty";
import {
  getPropertyById,
  updateProperty,
  type EditPropertyFormDataInterface,
} from "../firebase/queries/properties";
import { uploadCasaImages, deleteCasaImage } from "../firebase/queries/storage";
import type { Property } from "../types";
import { useAuth } from "../providers/authFirebase";
import { useSyncPropertyDoc } from "../hooks/useSyncPropertyDoc";
import { useDeleteProperty } from "../hooks/useDeleteProperty";
import { cityOptions as cityFilterOptions } from "../utils/filters";
import { formatNumberWithDots } from "../utils/lib";

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

const cityOptions = cityFilterOptions.filter((option) => option.value);

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

  useSyncPropertyDoc(id);

  const isOwner = !!user && !!property && property.ownerId === user.id;
  const showLoading = isLoading || authLoading;
  const showNotFound = !isLoading && (isError || !property);
  const showForbidden = !isLoading && !authLoading && property && !isOwner;

  return (
    <Layout>
      <Container className="items-start py-8 flex-1 w-full mx-auto max-w-xl">
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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<EditPropertyFormDataInterface>({
    defaultValues: toFormData(property),
  });

  const parkingType = watch("parkingType");

  const { requestDelete, modal: deleteModal } = useDeleteProperty(property, () =>
    navigate("/"),
  );

  function handleRemoveExistingPhoto(fileName: string) {
    deleteCasaImage(property.id, fileName).catch(() => {
      // el picker ya quitó la miniatura; si el borrado remoto falla el
      // usuario lo notará porque la foto sigue apareciendo tras recargar
    });
    queryClient.setQueryData(
      ["property", property.id],
      (current: Property | undefined) =>
        current && {
          ...current,
          photos: current.photos.filter((photo) => photo !== fileName),
        },
    );
  }

  function onInvalid() {
    toast.error("Te faltan campos por llenar.");
  }

  async function submit(formData: EditPropertyFormDataInterface) {
    setSaveError(null);
    try {
      await updateProperty(property.id, formData);
      if (selectedFiles.length) {
        await uploadCasaImages(property.id, selectedFiles);
      }
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
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(submit, onInvalid)(event)}
      className="w-full max-w-lg flex flex-col gap-4"
    >
      <h1 className="font-bold text-orange-18 text-2xl">Editar casita</h1>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">Estado</span>
        <Controller
          name="available"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              options={availabilityOptions}
              value={String(field.value)}
              onChange={(value) => field.onChange(value === "true")}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">
          Ciudad <span className="text-orange-47">*</span>
        </span>
        <Controller
          name="city"
          control={control}
          rules={{ required: "Selecciona una ciudad" }}
          render={({ field, fieldState: { error } }) => (
            <Dropdown
              variant="field"
              options={cityOptions}
              placeholder="Selecciona una ciudad"
              value={field.value}
              onChange={field.onChange}
              error={!!error}
              errorMessage={error?.message}
            />
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">
          Zona <span className="text-orange-47">*</span>
        </span>
        <Controller
          name="zone"
          control={control}
          rules={{ required: "Selecciona una zona" }}
          render={({ field, fieldState: { error } }) => (
            <Dropdown
              variant="field"
              options={zoneOptions}
              placeholder="Selecciona una zona"
              value={field.value}
              onChange={field.onChange}
              error={!!error}
              errorMessage={error?.message}
            />
          )}
        />
      </div>
      <Controller
        name="neighborhood"
        control={control}
        render={({ field }) => (
          <TextField label="Barrio (opcional)" {...field} />
        )}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">
          Tipo de lugar <span className="text-orange-47">*</span>
        </span>
        <Controller
          name="propertyType"
          control={control}
          rules={{ required: "Selecciona el tipo de inmueble" }}
          render={({ field, fieldState: { error } }) => (
            <Dropdown
              variant="field"
              options={propertyTypeOptions}
              placeholder="Selecciona el tipo de inmueble"
              value={field.value}
              onChange={field.onChange}
              error={!!error}
              errorMessage={error?.message}
            />
          )}
        />
      </div>
      <Controller
        name="floor"
        control={control}
        render={({ field }) => <TextField label="Piso (opcional)" {...field} />}
      />
      <Controller
        name="price"
        control={control}
        rules={{
          required: "Ingresa el precio del inmueble",
          validate: (val) => {
            const num = Number(val);
            if (isNaN(num) || num < 0) {
              return "Ingresa un precio válido";
            }
            return true;
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            label="Precio"
            required
            type="text"
            inputMode="numeric"
            prefix="$"
            suffix="COP"
            placeholder="Ej: 1.000.000"
            value={formatNumberWithDots(field.value)}
            onChange={(val) => {
              const raw = val.replace(/\D/g, "");
              field.onChange(raw);
            }}
            error={!!error}
            errorMessage={error?.message}
          />
        )}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">Habitaciones</span>
        <Controller
          name="bedrooms"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              options={bedroomOptions}
              value={field.value}
              onChange={(value) =>
                field.onChange(
                  value as EditPropertyFormDataInterface["bedrooms"],
                )
              }
            />
          )}
        />
      </div>
      <Controller
        name="petsAllowed"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-orange-18">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              className="h-4 w-4 accent-orange-47"
            />
            Mascotas permitidas
          </label>
        )}
      />
      <Controller
        name="furnished"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-orange-18">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
              className="h-4 w-4 accent-orange-47"
            />
            Amoblado
          </label>
        )}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">Parqueadero</span>
        <Controller
          name="parkingType"
          control={control}
          render={({ field }) => (
            <ToggleGroup
              options={parkingOptions}
              value={field.value}
              onChange={(value) =>
                field.onChange(
                  value as EditPropertyFormDataInterface["parkingType"],
                )
              }
            />
          )}
        />
      </div>
      {parkingType !== "sin_parqueadero" && (
        <Controller
          name="parkingSpots"
          control={control}
          render={({ field }) => (
            <TextField label="Cantidad de parqueaderos" {...field} />
          )}
        />
      )}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField label="Descripción (opcional)" as="textarea" {...field} />
        )}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-orange-18">Fotos</span>
        <ImagePicker
          propertyId={property.id}
          existingPhotos={property.photos}
          onFilesChange={setSelectedFiles}
          onRemoveExisting={handleRemoveExistingPhoto}
        />
      </div>

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <div className="flex flex-col gap-3 mt-2">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          handleClick={() => {}}
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          disabled={isSubmitting}
          handleClick={() => navigate(`/property/${property.id}/view`)}
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          className="w-full"
          disabled={isSubmitting}
          handleClick={requestDelete}
        >
          Eliminar casita
        </Button>
      </div>
      {deleteModal}
    </form>
  );
}
