import type { FiltersInterface } from "../components/FilterBar";
import type { PropertyDataInterface } from "../components/PropertyCard";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function filterProperties(
  properties: PropertyDataInterface[],
  filters: FiltersInterface,
) {
  return properties.filter((property) => {
    if (filters.city && normalize(property.city) !== filters.city) return false;
    if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
    if (filters.zone && normalize(property.zone) !== filters.zone) return false;
    if (filters.furnished && (filters.furnished === "si") !== property.furnished) return false;
    if (filters.pets && (filters.pets === "si") !== property.petsAllowed) return false;

    if (filters.maxPrice === "gratis" && property.price !== 0) return false;
    if (filters.maxPrice === "500000" && property.price > 500000) return false;
    if (filters.maxPrice === "1000000" && property.price > 1000000) return false;

    return true;
  });
}
