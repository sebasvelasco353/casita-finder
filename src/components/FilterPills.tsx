import { X } from "lucide-react";
import Pill from "./Pill";
import {
  cityOptions,
  propertyTypeOptions,
  zoneOptions,
  maxPriceOptions,
  furnishedOptions,
  petsOptions,
  type FiltersInterface,
} from "./FilterBar";

const FIELD_LABELS: Record<keyof FiltersInterface, string> = {
  city: "Ciudad",
  propertyType: "Tipo",
  zone: "Zona",
  maxPrice: "Precio máximo",
  furnished: "Amoblado",
  pets: "Mascotas",
};

const FIELD_OPTIONS: Record<
  keyof FiltersInterface,
  { label: string; value: string }[]
> = {
  city: cityOptions,
  propertyType: propertyTypeOptions,
  zone: zoneOptions,
  maxPrice: maxPriceOptions,
  furnished: furnishedOptions,
  pets: petsOptions,
};

interface FilterPillsPropsInterface {
  filters: FiltersInterface;
  onFilterChange: (key: keyof FiltersInterface, value: string) => void;
}

export default function FilterPills({
  filters,
  onFilterChange,
}: FilterPillsPropsInterface) {
  const activeKeys = (Object.keys(filters) as (keyof FiltersInterface)[]).filter(
    (key) => filters[key],
  );

  if (activeKeys.length === 0) return null;

  return (
    <div className="flex w-full gap-2 flex-wrap">
      {activeKeys.map((key) => {
        const value = filters[key]!;
        const label =
          FIELD_OPTIONS[key].find((option) => option.value === value)
            ?.label ?? value;

        return (
          <Pill key={key} variant="secondary">
            {FIELD_LABELS[key]}: {label}
            <button
              type="button"
              onClick={() => onFilterChange(key, "")}
              aria-label={`Quitar filtro ${FIELD_LABELS[key]}`}
              className="cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </Pill>
        );
      })}
    </div>
  );
}
