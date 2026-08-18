export interface FiltersInterface {
  city?: string;
  propertyType?: string;
  zone?: string;
  maxPrice?: string;
  furnished?: string;
  pets?: string;
}

export const cityOptions = [
  { label: "Todas", value: "" },
  { label: "Cali", value: "Cali" },
  { label: "Manizales", value: "Manizales" },
  { label: "Pereira", value: "Pereira" },
  { label: "Armenia", value: "Armenia" },
  { label: "Buenaventura", value: "Buenaventura" },
  { label: "Quibdó", value: "Quibdó" },
  { label: "Istmina", value: "Istmina" },
];

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

function toLabelMap(options: { label: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(
    options.filter((option) => option.value).map((option) => [option.value, option.label]),
  );
}

// value -> label, reusable fuera del filtro (ej. PropertyCard) para mostrar
// el nombre lindo en vez del value crudo del dropdown.
export const cityLabelByValue = toLabelMap(cityOptions);
export const propertyTypeLabelByValue = toLabelMap(propertyTypeOptions);
export const zoneLabelByValue = toLabelMap(zoneOptions);
export const maxPriceLabelByValue = toLabelMap(maxPriceOptions);
export const furnishedLabelByValue = toLabelMap(furnishedOptions);
export const petsLabelByValue = toLabelMap(petsOptions);

export const FILTER_FIELD_LABELS: Record<keyof FiltersInterface, string> = {
  city: "Ciudad",
  propertyType: "Tipo",
  zone: "Zona",
  maxPrice: "Precio máximo",
  furnished: "Amoblado",
  pets: "Mascotas",
};

export const FILTER_FIELD_OPTIONS: Record<
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
