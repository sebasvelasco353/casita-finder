import { useState, type ReactNode } from "react";
import Modal from "./Modal";
import TextField from "../TextField";
import ToggleGroup from "../ToggleGroup";
import Dropdown from "../Dropdown";
import Button from "../Button";
import { createProperty } from "../../firebase/queries/properties";

export interface PublishPropertyFormDataInterface {
  firstName: string;
  lastName: string;
  email: string;
  contactMethod: "whatsapp";
  countryCode: string;
  phoneNumber: string;
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
  description: string;
}

const initialFormData: PublishPropertyFormDataInterface = {
  firstName: "",
  lastName: "",
  email: "",
  contactMethod: "whatsapp",
  countryCode: "+57",
  phoneNumber: "",
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
  description: "",
};

const contactMethodOptions = [
  { label: "WhatsApp", value: "whatsapp" },
];

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

interface PublishPropertyModalPropsInterface {
  isOpen: boolean;
  onClose: () => void;
}

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

function Divider(): ReactNode {
  return <hr className="border-gray-91 my-6" />;
}

export default function PublishPropertyModal({ isOpen, onClose }: PublishPropertyModalPropsInterface) {
  const [formData, setFormData] = useState<PublishPropertyFormDataInterface>(initialFormData);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  function updateField<K extends keyof PublishPropertyFormDataInterface>(
    key: K,
    value: PublishPropertyFormDataInterface[K]
  ) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function handleContinue(event: React.FormEvent) {
    event.preventDefault();
    setStep("confirm");
  }

  function handleBackToEdit() {
    setPublishError(null);
    setStep("form");
  }

  async function handleConfirmPublish() {
    setPublishError(null);
    setIsPublishing(true);
    try {
      await createProperty(formData);
      setFormData(initialFormData);
      setStep("form");
      onClose();
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setIsPublishing(false);
    }
  }

  function handleCancel() {
    setFormData(initialFormData);
    setStep("form");
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Publicar casa en alquiler" className="max-w-lg">
      <p className="text-sm text-orange-42 -mt-2 mb-6">
        Tus datos de contacto son privados: quienes te escriban lo harán por el canal que elijas.
      </p>
      {step === "confirm" ? (
        <div className="flex flex-col gap-4">
          <StepHeader step={4} title="Confirmación" />
          <div className="rounded-2xl bg-orange-77 p-5 text-sm text-orange-24">
            Antes de publicar, recibirás un enlace por correo electrónico. Cualquier cambio a
            este anuncio, incluyendo actualizar su estado, se hará a través de ese enlace.
          </div>
          <p className="text-sm text-orange-42">
            Tu anuncio se publicará con el estado <span className="font-semibold">Disponible</span>.
          </p>
          {publishError && (
            <p className="text-sm text-red-600">{publishError}</p>
          )}
          <div className="flex flex-col gap-3 mt-2">
            <Button className="w-full" disabled={isPublishing} handleClick={handleConfirmPublish}>
              {isPublishing ? "Publicando..." : "Confirmar y publicar"}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={isPublishing}
              handleClick={handleBackToEdit}
            >
              Volver a editar
            </Button>
          </div>
        </div>
      ) : (
      <form onSubmit={handleContinue} className="flex flex-col gap-4">
        <StepHeader step={1} title="Detalles del arrendador" />
        <TextField
          label="Nombre"
          required
          value={formData.firstName}
          onChange={(value) => updateField("firstName", value)}
        />
        <TextField
          label="Apellido (opcional)"
          value={formData.lastName}
          onChange={(value) => updateField("lastName", value)}
        />
        <TextField
          label="Correo electrónico"
          type="email"
          required
          helperText="Este correo es privado y no aparecerá en el anuncio."
          value={formData.email}
          onChange={(value) => updateField("email", value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">Forma de contacto</span>
          <ToggleGroup
            options={contactMethodOptions}
            value={formData.contactMethod}
            onChange={(value) => updateField("contactMethod", value as PublishPropertyFormDataInterface["contactMethod"])}
          />
          <span className="text-xs text-orange-42">
            Solo se usará para que los interesados te contacten; no aparecerá en el anuncio.
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">
            Número de teléfono <span className="text-orange-47">*</span>
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={formData.countryCode}
              onChange={(event) => updateField("countryCode", event.target.value)}
              className="w-16 rounded-lg border border-gray-91 bg-gray-98 px-3 py-2.5 text-sm text-orange-18 focus:outline-none focus:ring-2 focus:ring-orange-47"
            />
            <input
              type="tel"
              required
              placeholder="310 123 4567"
              value={formData.phoneNumber}
              onChange={(event) => updateField("phoneNumber", event.target.value)}
              className="flex-1 rounded-lg border border-gray-91 bg-gray-98 px-4 py-2.5 text-sm text-orange-18 placeholder:text-orange-42/60 focus:outline-none focus:ring-2 focus:ring-orange-47"
            />
          </div>
        </div>

        <Divider />

        <StepHeader step={2} title="Localización" />
        <TextField
          label="Ciudad"
          placeholder="Cali"
          value={formData.city}
          onChange={(value) => updateField("city", value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">Zona</span>
          <Dropdown
            variant="field"
            options={zoneOptions}
            placeholder="Norte"
            value={formData.zone}
            onChange={(value) => updateField("zone", value)}
          />
        </div>
        <TextField
          label="Barrio (opcional)"
          value={formData.neighborhood}
          onChange={(value) => updateField("neighborhood", value)}
        />

        <Divider />

        <StepHeader step={3} title="Inmueble" />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">Tipo de lugar</span>
          <Dropdown
            variant="field"
            options={propertyTypeOptions}
            placeholder="Apartamento"
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
          label="Precio (opcional)"
          value={formData.price}
          onChange={(value) => updateField("price", value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">Habitaciones</span>
          <ToggleGroup
            options={bedroomOptions}
            value={formData.bedrooms}
            onChange={(value) => updateField("bedrooms", value as PublishPropertyFormDataInterface["bedrooms"])}
          />
        </div>
        <Checkbox
          label="Mascotas permitidas"
          checked={formData.petsAllowed}
          onChange={(checked) => updateField("petsAllowed", checked)}
        />
        <Checkbox
          label="Amoblado"
          checked={formData.furnished}
          onChange={(checked) => updateField("furnished", checked)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">Parqueadero</span>
          <ToggleGroup
            options={parkingOptions}
            value={formData.parkingType}
            onChange={(value) => updateField("parkingType", value as PublishPropertyFormDataInterface["parkingType"])}
          />
        </div>
        <TextField
          label="Descripción (opcional)"
          as="textarea"
          value={formData.description}
          onChange={(value) => updateField("description", value)}
        />

        <div className="flex flex-col gap-3 mt-2">
          <Button type="submit" className="w-full" handleClick={() => {}}>
            Continuar
          </Button>
          <Button variant="secondary" className="w-full" handleClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </form>
      )}
    </Modal>
  );
}
