import { Link } from "react-router";
import Pill from "./Pill";
import Button from "./Button";
import type { Property } from "../types";
import {
  ArmchairIcon,
  CarIcon,
  HouseIcon,
  MapPin,
  PawPrintIcon,
} from "lucide-react";
import { formatParking, formatPrice } from "../utils/lib";
import { cityLabelByValue } from "../utils/filters";
import { getStorageImageUrl } from "../firebase/queries/storage";

interface PropertyOwnerCardPropsInterface {
  data: Property;
  onDelete: () => void;
}

const propertyTypeLabels: Record<Property["propertyType"], string> = {
  apartamento: "Apto.",
  casa: "Casa",
  habitacion: "Habitación",
  bodega: "Bodega",
};

export default function PropertyOwnerCard({
  data,
  onDelete,
}: PropertyOwnerCardPropsInterface) {
  const {
    id,
    photos,
    available,
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
    parking,
  } = data;

  const cover = photos[0] ? getStorageImageUrl(`casas/${id}/images/${photos[0]}`) : null;
  const parkingLabel = formatParking(parking);

  return (
    <article className="w-full h-126 md:h-137 bg-gray-99 border border-gray-91 rounded-3xl p-3 flex flex-col">
      <div className="relative h-60 md:h-56 shrink-0 rounded-2xl bg-gray-91 overflow-hidden flex items-center justify-center text-orange-42/50">
        {cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <HouseIcon className="w-8 h-8" />
        )}
        <div className="absolute top-3 right-3">
          <Pill variant={available ? "primary" : "secondary"}>
            {available ? "Disponible" : "No disponible"}
          </Pill>
        </div>
      </div>

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

      <p className="mt-2 text-sm text-orange-42 line-clamp-4">{description}</p>

      <p className="mt-2 text-xs text-orange-42 capitalize">
        {zone} · {neighborhood} · Piso {floor}
      </p>

      <div className="mt-auto flex flex-col gap-2">
        <div className="bg-gray-93 rounded-full py-2.5 text-center font-bold text-orange-18">
          {formatPrice(price)}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/property/${id}/edit`}
            className="flex-1 cursor-pointer py-3 px-6 rounded-full font-semibold text-sm flex items-center justify-center border-orange-47 border bg-transparent text-orange-47"
          >
            Editar
          </Link>
          <Button variant="danger" className="flex-1" handleClick={onDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  );
}
