import type { PropertyDataInterface } from "../components/PropertyCard";

// Mismo esquema que crea ensureUserProfile en src/firebase/auth.tsx al
// registrarse; el id del seed es el uid con el que se crea el usuario real
// en el Auth emulator, para que login + estos datos siempre coincidan.
export interface SeedUser {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName?: string;
  phone: string;
}

export type SeedProperty = Omit<PropertyDataInterface, "contactName" | "whatsappNumber"> & {
  ownerId: string;
};

export const users: SeedUser[] = [
  {
    id: "seed-nicolas",
    email: "nicolas@example.com",
    displayName: "Nicolas",
    firstName: "Nicolas",
    phone: "573001234567",
  },
  {
    id: "seed-camila",
    email: "camila@example.com",
    displayName: "Camila",
    firstName: "Camila",
    phone: "573109876543",
  },
  {
    id: "seed-andres",
    email: "andres@example.com",
    displayName: "Andrés",
    firstName: "Andrés",
    phone: "573112345678",
  },
];

export const properties: SeedProperty[] = [
  {
    id: "3Jc8xQmZ1k3r3t3fdf32P0aVh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ingenio",
    floor: 2,
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    ownerId: "seed-nicolas",
    price: 1500000,
  },
  {
    id: "3Jc8xQmZ1k3r3t3fdf3muytrt42P0aVh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ciudad Jardin",
    floor: 2,
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    ownerId: "seed-nicolas",
    price: 15900000,
  },
  {
    id: "3Jc8xQmZ1k3r3t322evbrtfdf32P0aVh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ingenio",
    floor: 2,
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    ownerId: "seed-nicolas",
    price: 150000,
  },
  {
    id: "7Rt4vLpX9mef2ghtnbefvW3cYd6Q1sK",
    imageUrl: null,
    available: true,
    propertyType: "casa",
    city: "Medellín",
    zone: "Occidente",
    neighborhood: "Laureles",
    floor: 1,
    bedrooms: 3,
    furnished: false,
    petsAllowed: false,
    ownerId: "seed-camila",
    price: 0,
  },
  {
    id: "9FgH2nJk5pL8x2efqfwZv0mQ3e",
    imageUrl: null,
    available: false,
    propertyType: "habitacion",
    city: "Bogotá",
    zone: "Centro",
    neighborhood: "La Candelaria",
    floor: 3,
    bedrooms: 1,
    furnished: true,
    petsAllowed: false,
    ownerId: "seed-andres",
    price: 600000,
  },
  {
    id: "3Jc8xQmZ1kP0aVwrntfh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ingenio",
    floor: 2,
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    ownerId: "seed-nicolas",
    price: 1500000,
  },
  {
    id: "7Rt4vLpX9mW3cYefsrd6Q1sK",
    imageUrl: null,
    available: true,
    propertyType: "casa",
    city: "Medellín",
    zone: "Occidente",
    neighborhood: "Laureles",
    floor: 1,
    bedrooms: 3,
    furnished: false,
    petsAllowed: false,
    ownerId: "seed-camila",
    price: 2200000,
  },
  {
    id: "9FgH2nJk5pL8xZvbrsw0mQ3e",
    imageUrl: null,
    available: false,
    propertyType: "habitacion",
    city: "Bogotá",
    zone: "Centro",
    neighborhood: "La Candelaria",
    floor: 3,
    bedrooms: 1,
    furnished: true,
    petsAllowed: false,
    ownerId: "seed-andres",
    price: 600000,
  },
  {
    id: "3Jc8xQmZ1kP0aVh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ingenio",
    floor: 2,
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    ownerId: "seed-nicolas",
    price: 1500000,
  },
  {
    id: "7Rt4vLpX9mW324fdwcYd6Q1sK",
    imageUrl: null,
    available: true,
    propertyType: "casa",
    city: "Medellín",
    zone: "Occidente",
    neighborhood: "Laureles",
    floor: 1,
    bedrooms: 3,
    furnished: false,
    petsAllowed: false,
    ownerId: "seed-camila",
    price: 2200000,
  },
  {
    id: "9FgH2nJk5pL8xZh52wfwhv0mQ3e",
    imageUrl: null,
    available: false,
    propertyType: "habitacion",
    city: "Bogotá",
    zone: "Centro",
    neighborhood: "La Candelaria",
    floor: 3,
    bedrooms: 1,
    furnished: true,
    petsAllowed: false,
    ownerId: "seed-andres",
    price: 600000,
  },
];

const usersById = new Map(users.map((user) => [user.id, user]));

// Usado por Home.tsx: hasta que "properties" viva de verdad en Firestore,
// las tarjetas se arman resolviendo el owner aquí mismo, en memoria.
export function resolveProperties(): PropertyDataInterface[] {
  return properties.map(({ ownerId, ...property }) => {
    const user = usersById.get(ownerId);
    if (!user) throw new Error(`Seed property ${property.id} references unknown user ${ownerId}`);
    return { ...property, contactName: user.displayName, whatsappNumber: user.phone };
  });
}
