import Pill from "./Pill";
import houseIcon from "../assets/house_icon.svg";
import locationIcon from "../assets/ubicacion_icon.svg"
import mascotasIcon from "../assets/mascotas_icon.svg"
import amobladoIcon from "../assets/amoblado_icon.svg"

export interface PropertyDataInterface {
  id: string;
  imageUrl: string | null;
  available: boolean;
  propertyType: "apartamento" | "casa" | "habitacion" | "bodega";
  city: string;
  zone: string;
  neighborhood: string;
  floor: string;
  bedrooms: number;
  furnished: boolean;
  petsAllowed: boolean;
  contactName: string;
  whatsappNumber: string;
  price: number;
}

interface PropertyCardPropsInterface {
  propertyData: PropertyDataInterface;
}

const propertyTypeLabels: Record<PropertyDataInterface["propertyType"], string> = {
  apartamento: "Apto.",
  casa: "Casa",
  habitacion: "Habitación",
  bodega: "Bodega",
};

function ChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M10 2a8 8 0 0 0-6.9 12.1L2 18l3.9-1.1A8 8 0 1 0 10 2Z" />
    </svg>
  );
}

export default function PropertyCard({ propertyData }: PropertyCardPropsInterface) {
  const {
    imageUrl,
    available,
    propertyType,
    city,
    zone,
    neighborhood,
    floor,
    bedrooms,
    furnished,
    petsAllowed,
    contactName,
    whatsappNumber,
    price,
  } = propertyData;

  const formattedPrice = `$${new Intl.NumberFormat("es-CO").format(price)}`;
  const whatsappHref = `https://wa.me/${whatsappNumber}`;

  return (
    <article className="w-full h-126 md:h-137 bg-gray-99 border border-gray-91 rounded-3xl p-3 flex flex-col">
      <div className="relative h-60 md:h-56 shrink-0 rounded-2xl bg-gray-91 overflow-hidden flex items-center justify-center text-orange-42/50">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <img src={houseIcon} alt="" className="w-8 h-8" />
        )}
        <span
          className={`absolute top-3 left-3 py-1.5 px-3 rounded-full text-sm font-medium ${
            available ? "bg-emerald-100 text-emerald-800" : "bg-gray-91 text-orange-42"
          }`}
        >
          {available ? "Disponible" : "No disponible"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <Pill variant="primary">{propertyTypeLabels[propertyType]}</Pill>
        <Pill variant="secondary">{city}</Pill>
        <Pill variant="secondary">
          <img src={locationIcon} alt="" className="w-3 h-3" />
          {zone}
        </Pill>
        <Pill variant="secondary">{bedrooms} hab.</Pill>
        {furnished && (
          <Pill variant="tertiary">
          <img src={amobladoIcon} alt="" className="w-3 h-3" />
            Amoblado
          </Pill>
        )}
        {petsAllowed && (
          <Pill variant="tertiary">
          <img src={mascotasIcon} alt="" className="w-3 h-3" />
            Mascotas
          </Pill>
        )}
      </div>

      <p className="mt-2 text-sm text-orange-42 truncate">
        {zone} · {neighborhood} · Piso {floor} · {contactName}
      </p>

      <div className="mt-auto flex flex-col gap-2">
        <div className="bg-gray-93 rounded-full py-2.5 text-center font-bold text-orange-18">
          {formattedPrice}
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-orange-47 text-gray-99 rounded-full py-2.5 font-semibold text-sm"
        >
          <ChatIcon />
          Contactar por WhatsApp
        </a>
      </div>
    </article>
  );
}
