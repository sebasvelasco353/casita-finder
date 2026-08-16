import { X } from "lucide-react";
import Pill from "./Pill";
import {
  FILTER_FIELD_LABELS,
  FILTER_FIELD_OPTIONS,
  type FiltersInterface,
} from "../utils/filters";

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
          FILTER_FIELD_OPTIONS[key].find((option) => option.value === value)
            ?.label ?? value;

        return (
          <Pill key={key} variant="secondary">
            {FILTER_FIELD_LABELS[key]}: {label}
            <button
              type="button"
              onClick={() => onFilterChange(key, "")}
              aria-label={`Quitar filtro ${FILTER_FIELD_LABELS[key]}`}
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
