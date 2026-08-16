import Dropdown from "./Dropdown";
import {
  cityOptions,
  propertyTypeOptions,
  zoneOptions,
  maxPriceOptions,
  furnishedOptions,
  petsOptions,
  type FiltersInterface,
} from "../utils/filters";

interface FilterBarPropsInterface {
  filters: FiltersInterface;
  onFilterChange: (key: keyof FiltersInterface, value: string) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarPropsInterface) {
  return (
    <div className="flex w-full gap-2.5 box-border overflow-x-auto [&>*]:shrink-0">
      <Dropdown
        placeholder="Ciudad"
        options={cityOptions}
        value={filters.city}
        onChange={(value) => onFilterChange("city", value)}
      />
      <Dropdown
        placeholder="Tipo"
        options={propertyTypeOptions}
        value={filters.propertyType}
        onChange={(value) => onFilterChange("propertyType", value)}
      />
      <Dropdown
        placeholder="Zona"
        options={zoneOptions}
        value={filters.zone}
        onChange={(value) => onFilterChange("zone", value)}
      />
      <Dropdown
        placeholder="Precio máximo"
        options={maxPriceOptions}
        value={filters.maxPrice}
        onChange={(value) => onFilterChange("maxPrice", value)}
      />
      <Dropdown
        placeholder="Amoblado"
        options={furnishedOptions}
        value={filters.furnished}
        onChange={(value) => onFilterChange("furnished", value)}
      />
      <Dropdown
        placeholder="Mascotas"
        options={petsOptions}
        value={filters.pets}
        onChange={(value) => onFilterChange("pets", value)}
      />
    </div>
  );
}
