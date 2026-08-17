import type { Timestamp } from "firebase/firestore";

export type Property = {
  id: string;
  photos: string[];
  available: boolean;
  propertyType: "apartamento" | "casa" | "habitacion" | "bodega";
  city: string;
  zone: string;
  neighborhood: string;
  buildingName?: string | null;
  apartmentNumber?: string | null;
  floor?: number | null;
  bedrooms?: number | null;
  furnished: boolean;
  petsAllowed: boolean;
  parking?: {
    type: "publico" | "privado" | "sin_parqueadero";
    spots: number | null;
  } | null;
  price: number;
  ownerId: string;
  address?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  description?: string | null;
};

export type Filters = {
  city?: Property["city"];
  propertyType?: Property["propertyType"];
  zone?: Property["zone"];
  maxPrice?: string;
  furnished?: Property["furnished"];
  pets?: Property["petsAllowed"];
};

export type User = {
  id: string;
  name: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
