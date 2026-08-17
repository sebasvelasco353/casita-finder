// Extrae los owners únicos de properties.json (dedupe por teléfono
// normalizado, porque el mismo número aparece con/sin +57 o espacios) y los
// escribe con el shape de User (src/types/index.ts). Todavía no hay cuentas
// reales para estos owners: id = phone, displayName = name, el resto queda
// en null hasta que se creen las cuentas de verdad.
import { readFileSync, writeFileSync } from "fs";
import type { Property } from "../src/types";

const INPUT = process.argv[2] ?? "properties.json";
const OUTPUT = process.argv[3] ?? "owners.json";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/\p{L}+/gu, (word) => word[0].toUpperCase() + word.slice(1));
}

// No son nombres reales, no tiene sentido partirlos en name/lastName.
const PLACEHOLDER_NAMES = new Set(["Desconocido", "Anuncio", "Sin contacto"]);

// name = primera palabra, lastName = el resto (aproximación; nombres
// compuestos como "Luz Marina Restrepo" quedan name="Luz" lastName="Marina
// Restrepo", hay que revisarlos a mano si el split exacto importa).
function splitName(displayName: string): { name: string | null; lastName: string | null } {
  const cleaned = displayName.replace(/\s*[-,]?\s*@\S+$/, "").replace(/,\s*$/, "").trim();
  if (!cleaned || PLACEHOLDER_NAMES.has(cleaned)) return { name: cleaned || null, lastName: null };

  const words = cleaned.split(/\s+/);
  if (words.length === 1) return { name: words[0], lastName: null };
  return { name: words[0], lastName: words.slice(1).join(" ") };
}

const properties: Property[] = JSON.parse(readFileSync(INPUT, "utf-8"));

const owners = new Map<string, Record<string, unknown>>();
for (const property of properties) {
  const key = normalizePhone(property.owner.phone);
  if (!key || owners.has(key)) continue;
  const { name, lastName } = splitName(property.owner.name);
  owners.set(key, {
    id: property.owner.phone,
    name: name ? titleCase(name) : null,
    lastName,
    displayName: titleCase(property.owner.name),
    email: null,
    phoneNumber: property.owner.phone,
    createdAt: null,
    updatedAt: null,
  });
}

const result = [...owners.values()];
writeFileSync(OUTPUT, JSON.stringify(result, null, 2), "utf-8");
console.log(`${result.length} owners únicos escritos en ${OUTPUT} (de ${properties.length} properties)`);
