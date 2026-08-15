import Dropdown from "./Dropdown";

const cityOptions = [
  { label: "Todas", value: "" },
  { label: "Bogotá", value: "bogota" },
  { label: "Medellín", value: "medellin" },
  { label: "Cali", value: "cali" },
  { label: "Armenia", value: "armenia" },
];

const propertyTypeOptions = [
  { label: "Todos", value: "" },
  { label: "Casa", value: "casa" },
  { label: "Apartamento", value: "apartamento" },
  { label: "Habitación", value: "habitacion" },
  { label: "Bodega", value: "bodega" },
];

const zoneOptions = [
  { label: "Todas", value: "" },
  { label: "Norte", value: "norte" },
  { label: "Sur", value: "sur" },
  { label: "Centro", value: "centro" },
  { label: "Oriente", value: "oriente" },
  { label: "Occidente", value: "occidente" },
];

const maxPriceOptions = [
  { label: "Sin límite", value: "" },
  { label: "Gratis", value: "gratis" },
  { label: "Hasta $500.000", value: "500000" },
  { label: "Hasta $1.000.000", value: "1000000" },
];

const furnishedOptions = [
  { label: "Todos", value: "" },
  { label: "Sí", value: "si" },
  { label: "No", value: "no" },
];

const petsOptions = [
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
    <div className="flex flex-wrap gap-2.5">
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
