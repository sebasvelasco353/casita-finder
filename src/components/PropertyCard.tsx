import { Link } from "react-router";
import Pill from "./Pill";
import type { Property } from "../types";
import {
  ArmchairIcon,
  CarIcon,
  HouseIcon,
  MapPin,
  MessageCircleIcon,
  PawPrintIcon,
} from "lucide-react";
import { formatDistance, formatParking, formatPrice } from "../utils/lib";
import { cityLabelByValue } from "../utils/filters";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../firebase/queries/users";
import { getStorageImageUrl } from "../firebase/queries/storage";

interface PropertyCardPropsInterface {
  data: Property;
}

const propertyTypeLabels: Record<Property["propertyType"], string> = {
  apartamento: "Apto.",
  casa: "Casa",
  habitacion: "Habitación",
  bodega: "Bodega",
};

export default function PropertyCard({ data }: PropertyCardPropsInterface) {
  const {
    id,
    photos,
    propertyType,
    city,
    zone,
    neighborhood,
    floor,
    bedrooms,
    furnished,
    petsAllowed,
    price,
    description,
    updatedAt,
    ownerId,
    parking,
  } = data;

  const cover = photos[0] ? getStorageImageUrl(`casas/${id}/images/${photos[0]}`) : null;
  const parkingLabel = formatParking(parking);

  const { data: owner } = useQuery({
    queryKey: ["user", ownerId],
    queryFn: () => getUserById(ownerId),
    enabled: !!ownerId,
  });

  const whatsappHref = `https://wa.me/${owner?.phoneNumber}?text=Hola%20${owner?.displayName}%20quisiera%20informacion%20sobre%20la%20vivienda%20al%20${zone}%20de%20${city}`;

  return (
    <article className="w-full h-126 md:h-137 bg-gray-99 border border-gray-91 rounded-3xl p-3 flex flex-col">
      <Link
        to={`/property/${id}/view`}
        className="relative h-60 md:h-56 shrink-0 rounded-2xl bg-gray-91 overflow-hidden flex items-center justify-center text-orange-42/50"
      >
        {cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <HouseIcon className="w-8 h-8" />
        )}
        <span className="absolute top-3 left-3 py-0.5 px-1.5 rounded-full text-xs font-medium bg-gray-93 text-orange-18 capitalize">
          {formatDistance(updatedAt.toDate())}
        </span>
      </Link>

      <Link to={`/property/${id}/view`}>
        <div className="flex flex-wrap gap-2 mt-2">
          <Pill variant="primary">{propertyTypeLabels[propertyType]}</Pill>
          <Pill variant="secondary">{cityLabelByValue[city] ?? city}</Pill>
          {zone && (
            <Pill variant="secondary">
              <MapPin className="w-3 h-3" />
              {zone}
            </Pill>
          )}
          {bedrooms && <Pill variant="secondary">{bedrooms} hab.</Pill>}
          {furnished && (
            <Pill variant="tertiary">
              <ArmchairIcon className="w-3 h-3" />
              Amoblado
            </Pill>
          )}
          {petsAllowed && (
            <Pill variant="tertiary">
              <PawPrintIcon className="w-3 h-3" />
              Mascotas
            </Pill>
          )}
          {parkingLabel && (
            <Pill variant="tertiary">
              <CarIcon className="w-3 h-3" />
              {parkingLabel}
            </Pill>
          )}
        </div>

        <p className="mt-2 text-sm text-orange-42 line-clamp-4">
          {description}
        </p>

        <p className="mt-2 text-xs text-orange-42 capitalize">
          {zone} · {neighborhood} · Piso {floor}
        </p>
      </Link>

      <div className="mt-auto flex flex-col gap-2">
        <div className="bg-gray-93 rounded-full py-2.5 text-center font-bold text-orange-18">
          {formatPrice(price)}
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-orange-47 text-gray-99 rounded-full py-2.5 PX-2 text-sm"
        >
          <MessageCircleIcon className="w-4 h-4" />
          Contactar por WhatsApp
        </a>
      </div>
    </article>
  );
}
