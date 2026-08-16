import type { Timestamp } from "firebase/firestore";

export type Property = {
  id: string;
  cover?: string | null;
  available: boolean;
  propertyType: "apartamento" | "casa" | "habitacion" | "bodega";
  city: string;
  zone: string;
  neighborhood: string;
  floor: number;
  bedrooms: number;
  furnished: boolean;
  petsAllowed: boolean;
  price: number;
  ownerId: string;
  address?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  description?: string;
};
