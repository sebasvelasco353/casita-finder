import { useState } from "react";
import Modal from "./Modal";
import TextField from "../TextField";
import ToggleGroup from "../ToggleGroup";
import Dropdown from "../Dropdown";
import Checkbox from "../Checkbox";
import StepHeader from "../StepHeader";
import Button from "../Button";

interface WantToRentFormDataInterface {
  firstName: string;
  lastName: string;
  email: string;
  contactMethod: "telefono" | "whatsapp";
  countryCode: string;
  phoneNumber: string;
  city: string;
  zone: string;
  neighborhood: string;
  propertyType: "cualquiera" | "apartamento" | "casa";
  peopleCount: string;
  budget: string;
  bedrooms: "indiferente" | "1" | "2" | "3" | "4+";
  petsRequired: boolean;
  furnished: "indiferente" | "si" | "no";
  parkingType: "indiferente" | "publico" | "privado" | "sin_parqueadero";
  additionalNotes: string;
}

const initialFormData: WantToRentFormDataInterface = {
  firstName: "",
  lastName: "",
  email: "",
  contactMethod: "telefono",
  countryCode: "+57",
  phoneNumber: "",
  city: "",
  zone: "",
  neighborhood: "",
  propertyType: "cualquiera",
  peopleCount: "1",
  budget: "",
  bedrooms: "indiferente",
  petsRequired: false,
  furnished: "indiferente",
  parkingType: "indiferente",
  additionalNotes: "",
};

const contactMethodOptions = [
  { label: "Teléfono", value: "telefono" },
  { label: "WhatsApp", value: "whatsapp" },
];

const zoneOptions = [
  { label: "Norte", value: "norte" },
  { label: "Sur", value: "sur" },
  { label: "Centro", value: "centro" },
  { label: "Oriente", value: "oriente" },
  { label: "Occidente", value: "occidente" },
];

const propertyTypeOptions = [
  { label: "Cualquiera", value: "cualquiera" },
  { label: "Apartamento", value: "apartamento" },
  { label: "Casa", value: "casa" },
];

const bedroomOptions = [
  { label: "Indiferente", value: "indiferente" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4+", value: "4+" },
];

const furnishedOptions = [
  { label: "Indiferente", value: "indiferente" },
  { label: "Sí", value: "si" },
  { label: "No", value: "no" },
];

const parkingOptions = [
  { label: "Indiferente", value: "indiferente" },
  { label: "Público", value: "publico" },
  { label: "Privado", value: "privado" },
  { label: "Sin parqueadero", value: "sin_parqueadero" },
];

interface WantToRentModalPropsInterface {
  isOpen: boolean;
  onClose: () => void;
}

export default function WantToRentModal({ isOpen, onClose }: WantToRentModalPropsInterface) {
  const [formData, setFormData] = useState<WantToRentFormDataInterface>(initialFormData);
  const [step, setStep] = useState<"form" | "confirm">("form");

  function updateField<K extends keyof WantToRentFormDataInterface>(
    key: K,
    value: WantToRentFormDataInterface[K]
  ) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  function handleContinue(event: React.FormEvent) {
    event.preventDefault();
    setStep("confirm");
  }

  function handleBackToEdit() {
    setStep("form");
  }

  function handleConfirmPublish() {
    console.log(formData);
    setFormData(initialFormData);
    setStep("form");
    onClose();
  }

  function handleCancel() {
    setFormData(initialFormData);
    setStep("form");
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Quiero arrendar" className="max-w-lg">
      <p className="text-sm text-orange-42 -mt-2 mb-6">
        Cuéntanos qué casita buscas para cruzarla con los anuncios publicados. Tus datos de
        contacto son privados.
      </p>
      {step === "confirm" ? (
        <div className="flex flex-col gap-4">
          <StepHeader step={4} title="Confirmación" />
          <div className="rounded-2xl bg-orange-77 p-5 text-sm text-orange-24">
            Antes de publicar, recibirás un enlace por correo electrónico. Cualquier cambio a
            esta solicitud, incluyendo actualizar su estado, se hará a través de ese enlace.
          </div>
          <p className="text-sm text-orange-42">
            Tu solicitud se publicará con el estado <span className="font-semibold">Buscando</span>.
          </p>
          <div className="flex flex-col gap-3 mt-2">
            <Button className="w-full" handleClick={handleConfirmPublish}>
              Confirmar y publicar
            </Button>
            <Button variant="secondary" className="w-full" handleClick={handleBackToEdit}>
              Volver a editar
            </Button>
          </div>
        </div>
      ) : (
      <form onSubmit={handleContinue} className="flex flex-col gap-4">
        <StepHeader step={1} title="Detalles de quien busca" />
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
          helperText="Este correo es privado y no aparecerá en la solicitud."
          value={formData.email}
          onChange={(value) => updateField("email", value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">Forma de contacto</span>
          <ToggleGroup
            options={contactMethodOptions}
            value={formData.contactMethod}
            onChange={(value) => updateField("contactMethod", value as WantToRentFormDataInterface["contactMethod"])}
          />
          <span className="text-xs text-orange-42">
            Solo se usará para que te contacten; no aparecerá en la solicitud.
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

        <hr className="border-gray-91 my-6" />

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

        <hr className="border-gray-91 my-6" />

        <StepHeader step={3} title="Qué buscas" />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">Tipo de lugar</span>
          <ToggleGroup
            options={propertyTypeOptions}
            value={formData.propertyType}
            onChange={(value) => updateField("propertyType", value as WantToRentFormDataInterface["propertyType"])}
          />
        </div>
        <TextField
          label="Número de personas"
          type="number"
          value={formData.peopleCount}
          onChange={(value) => updateField("peopleCount", value)}
        />
        <TextField
          label="Presupuesto mensual (opcional)"
          placeholder="Sin definir"
          value={formData.budget}
          onChange={(value) => updateField("budget", value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">Habitaciones necesarias</span>
          <ToggleGroup
            options={bedroomOptions}
            value={formData.bedrooms}
            onChange={(value) => updateField("bedrooms", value as WantToRentFormDataInterface["bedrooms"])}
          />
        </div>
        <Checkbox
          label="Necesito que acepten mascotas"
          checked={formData.petsRequired}
          onChange={(checked) => updateField("petsRequired", checked)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">¿Amoblado?</span>
          <ToggleGroup
            options={furnishedOptions}
            value={formData.furnished}
            onChange={(value) => updateField("furnished", value as WantToRentFormDataInterface["furnished"])}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-orange-18">Parqueadero</span>
          <ToggleGroup
            options={parkingOptions}
            value={formData.parkingType}
            onChange={(value) => updateField("parkingType", value as WantToRentFormDataInterface["parkingType"])}
          />
        </div>
        <TextField
          label="Algo más que debamos saber (opcional)"
          as="textarea"
          value={formData.additionalNotes}
          onChange={(value) => updateField("additionalNotes", value)}
        />

        <div className="flex flex-col gap-3 mt-2">
          <Button type="submit" className="w-full" handleClick={() => {}}>
            Revisar y continuar
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
