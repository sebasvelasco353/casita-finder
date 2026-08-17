// Convierte el export crudo (listings-export-*.json) al shape Property[]
// de src/types/index.ts. createdAt/updatedAt salen como ISO string porque
// este es un archivo JSON plano; conviértelos con Timestamp.fromDate() al
// importarlos a Firestore (ver scripts/seed-db.ts).
import { readFileSync, writeFileSync } from "fs";

const INPUT = process.argv[2] ?? "listings-export-2026-08-16_13-30-59.json";
const OUTPUT = process.argv[3] ?? "properties.json";

type RawListing = {
  id: string;
  owner_name: string;
  phone: string;
  property_type: string;
  building_name: string;
  apartment_number: string;
  address: string;
  zone: string;
  furnished: boolean;
  price: number | null;
  notes: string;
  photos: string[];
  created_at: string;
  city: string;
};

const VALID_TYPES = ["apartamento", "casa", "habitacion", "bodega"] as const;
type PropertyType = (typeof VALID_TYPES)[number];

function toPropertyType(raw: string): PropertyType {
  const normalized = raw.trim().toLowerCase();
  return (VALID_TYPES as readonly string[]).includes(normalized)
    ? (normalized as PropertyType)
    : "apartamento";
}

// Solo mira "N habitaciones/alcobas" en las notes; sin match queda
// undefined (no se inventa un número de habitaciones).
function guessBedrooms(notes: string): number | undefined {
  const match = notes.match(/(\d+)\s*(habitaci|alcoba)/i);
  return match ? Number(match[1]) : undefined;
}

const FLOOR_ORDINALS: Record<string, number> = {
  primer: 1,
  primero: 1,
  segundo: 2,
  tercer: 3,
  tercero: 3,
  cuarto: 4,
  quinto: 5,
  sexto: 6,
  septimo: 7,
  séptimo: 7,
  octavo: 8,
  noveno: 9,
  decimo: 10,
  décimo: 10,
};
const ORDINAL_PATTERN = Object.keys(FLOOR_ORDINALS).join("|");

// No hay campo "floor" en el CSV; se busca "piso N" / "Nto piso" / ordinal +
// "piso" en las notes. Sin match queda null (no se inventa un piso).
function guessFloor(notes: string): number | null {
  let match = notes.match(/piso\s*[:\-]?\s*(\d{1,2})\b/i);
  if (match) return Number(match[1]);

  match = notes.match(/(\d{1,2})\s*(?:er|do|to|vo|mo|°)?\.?\s*piso/i);
  if (match) return Number(match[1]);

  const ordinalRegex = new RegExp(
    `\\b(?:(${ORDINAL_PATTERN})\\s+piso|piso\\s+(${ORDINAL_PATTERN}))\\b`,
    "i",
  );
  match = notes.match(ordinalRegex);
  if (match) return FLOOR_ORDINALS[(match[1] ?? match[2]).toLowerCase()];

  return null;
}

function toOwnerId(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

const raw: RawListing[] = JSON.parse(readFileSync(INPUT, "utf-8"));

const properties = raw.map((row) => ({
  id: row.id,
  photos: row.photos,
  available: true,
  propertyType: toPropertyType(row.property_type),
  city: row.city.trim().toLowerCase(),
  zone: row.zone.trim().toLowerCase(),
  neighborhood: row.building_name.trim() || row.address.trim(),
  buildingName: row.building_name.trim() || null,
  apartmentNumber: row.apartment_number.trim() || null,
  floor: guessFloor(row.notes),
  bedrooms: guessBedrooms(row.notes) ?? null,
  furnished: row.furnished,
  petsAllowed: false, // ponytail: no viene en el CSV, default conservador
  price: row.price ?? 0,
  ownerId: toOwnerId(row.phone),
  owner: { name: row.owner_name.trim(), phone: row.phone.trim() },
  address: row.address || null,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.created_at).toISOString(),
  description: row.notes || null,
}));

writeFileSync(OUTPUT, JSON.stringify(properties, null, 2), "utf-8");
console.log(`${properties.length} properties escritas en ${OUTPUT}`);
