import Dropdown from "./Dropdown";

export const cityOptions = [
  { label: "Todas", value: "" },
  { label: "Bogotá", value: "bogota" },
  { label: "Medellín", value: "medellin" },
  { label: "Cali", value: "cali" },
  { label: "Armenia", value: "armenia" },
];

// value (slug del dropdown) -> label (nombre como se guarda/muestra), ej. "medellin" -> "Medellín"
export const cityLabelByValue: Record<string, string> = Object.fromEntries(
  cityOptions.filter((option) => option.value).map((option) => [option.value, option.label]),
);

export const propertyTypeOptions = [
  { label: "Todos", value: "" },
  { label: "Casa", value: "casa" },
  { label: "Apartamento", value: "apartamento" },
  { label: "Habitación", value: "habitacion" },
  { label: "Bodega", value: "bodega" },
];

export const zoneOptions = [
  { label: "Todas", value: "" },
  { label: "Norte", value: "norte" },
  { label: "Sur", value: "sur" },
  { label: "Centro", value: "centro" },
  { label: "Oriente", value: "oriente" },
  { label: "Occidente", value: "occidente" },
];

export const maxPriceOptions = [
  { label: "Sin límite", value: "" },
  { label: "Gratis", value: "gratis" },
  { label: "Hasta $500.000", value: "500000" },
  { label: "Hasta $1.000.000", value: "1000000" },
  { label: "Hasta $2.000.000", value: "2000000" },
  { label: "Hasta $3.000.000", value: "3000000" },
  { label: "Hasta $5.000.000", value: "5000000" },
];

export const furnishedOptions = [
  { label: "Todos", value: "" },
  { label: "Sí", value: "si" },
  { label: "No", value: "no" },
];

export const petsOptions = [
  { label: "Todos", value: "" },
  { label: "Sí", value: "si" },
  { label: "No", value: "no" },
];

export interface FiltersInterface {
  city?: string;
  propertyType?: string;
  zone?: string;
  maxPrice?: string;
  furnished?: string;
  pets?: string;
}

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
