import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import Layout from "../components/Layout";
import Container from "../components/Container";
import TextField from "../components/TextField";
import ToggleGroup from "../components/ToggleGroup";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import ImagePicker from "../components/ImagePicker";
import { createProperty } from "../firebase/queries/properties";
import { uploadCasaImages } from "../firebase/queries/storage";
import { useAuth } from "../providers/authFirebase";

export interface PublishPropertyFormDataInterface {
  city: string;
  zone: string;
  neighborhood: string;
  propertyType: string;
  floor: string;
  price: string;
  bedrooms: "1" | "2" | "3" | "4+";
  petsAllowed: boolean;
  furnished: boolean;
  parkingType: "publico" | "privado" | "sin_parqueadero";
  parkingSpots: string;
  description: string;
}

const defaultValues: PublishPropertyFormDataInterface = {
  city: "",
  zone: "",
  neighborhood: "",
  propertyType: "",
  floor: "",
  price: "",
  bedrooms: "1",
  petsAllowed: false,
  furnished: false,
  parkingType: "sin_parqueadero",
  parkingSpots: "",
  description: "",
};

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

function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-wide text-orange-47">
        Paso {step}
      </span>
      <h3 className="text-lg font-bold text-orange-18">{title}</h3>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-orange-18">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-orange-47"
      />
      {label}
    </label>
  );
}

function Divider() {
  return <hr className="border-gray-91 my-6" />;
}

export default function PublishProperty() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<PublishPropertyFormDataInterface>({ defaultValues });

  const parkingType = watch("parkingType");

  async function submit(formData: PublishPropertyFormDataInterface) {
    setPublishError(null);
    if (!user?.phoneNumber) {
      setPublishError(
        "Agrega tu número de teléfono en tu perfil antes de publicar.",
      );
      return;
    }
    try {
      const propertyId = await createProperty(formData, user.phoneNumber);
      if (selectedFiles.length) {
        await uploadCasaImages(propertyId, selectedFiles);
      }
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      await queryClient.invalidateQueries({ queryKey: ["properties-count"] });
      await queryClient.invalidateQueries({
        queryKey: ["properties-new-count"],
      });
      toast.success("Casita publicada correctamente.");
      navigate(`/property/${propertyId}/view`);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Algo salió mal");
    }
  }

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

        <form
          onSubmit={(event) => void handleSubmit(submit)(event)}
          className="w-full max-w-lg flex flex-col gap-4"
        >
          <h1 className="font-bold text-orange-18 text-2xl">
            Publicar casa en alquiler
          </h1>
          <p className="text-sm text-orange-42 -mt-2 mb-2">
            Quienes se interesen te escribirán al WhatsApp de tu perfil (
            {user?.phoneNumber ?? "agrégalo en tu perfil"}).
          </p>

          <StepHeader step={1} title="Localización" />
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <TextField label="Ciudad" placeholder="Cali" {...field} />
            )}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-orange-18">Zona</span>
            <Controller
              name="zone"
              control={control}
              render={({ field }) => (
                <Dropdown
                  variant="field"
                  options={zoneOptions}
                  placeholder="Norte"
                  value={field.value}
                  onChange={field.onChange}
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

          <Divider />

          <StepHeader step={2} title="Inmueble" />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-orange-18">
              Tipo de lugar
            </span>
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <Dropdown
                  variant="field"
                  options={propertyTypeOptions}
                  placeholder="Apartamento"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <Controller
            name="floor"
            control={control}
            render={({ field }) => (
              <TextField label="Piso (opcional)" {...field} />
            )}
          />
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField label="Precio (opcional)" {...field} />
            )}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-orange-18">
              Habitaciones
            </span>
            <Controller
              name="bedrooms"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  options={bedroomOptions}
                  value={field.value}
                  onChange={(value) =>
                    field.onChange(
                      value as PublishPropertyFormDataInterface["bedrooms"],
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
              <Checkbox
                label="Mascotas permitidas"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="furnished"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Amoblado"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-orange-18">
              Parqueadero
            </span>
            <Controller
              name="parkingType"
              control={control}
              render={({ field }) => (
                <ToggleGroup
                  options={parkingOptions}
                  value={field.value}
                  onChange={(value) =>
                    field.onChange(
                      value as PublishPropertyFormDataInterface["parkingType"],
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

          <Divider />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-orange-18">Fotos</span>
            <ImagePicker onFilesChange={setSelectedFiles} />
          </div>

          {publishError && (
            <p className="text-sm text-red-600">{publishError}</p>
          )}

          <div className="flex flex-col gap-3 mt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              handleClick={() => {}}
            >
              {isSubmitting ? "Publicando..." : "Publicar casita"}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={isSubmitting}
              handleClick={() => navigate("/")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Container>
    </Layout>
  );
}
