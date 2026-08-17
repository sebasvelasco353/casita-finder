// Estandariza owner.phone (y ownerId) a solo dígitos con código de país,
// sin espacios ni "+", listo para wa.me/<phone>. Números de 10 dígitos que
// empiezan en 3 se asumen colombianos y se les antepone 57; todo lo demás
// se deja como venga (ya trae su propio código de país) salvo que sea
// claramente inválido, en cuyo caso se reporta en vez de adivinar.
import { readFileSync, writeFileSync } from "fs";
import type { Property } from "../src/types";

const FILE = process.argv[2] ?? "properties.json";

type Issue = { id: string; original: string; reason: string };

function standardize(raw: string): { phone: string; issue?: string } {
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10 && digits.startsWith("3")) {
    return { phone: `57${digits}` };
  }
  if (digits.length === 12 && digits.startsWith("57")) {
    return { phone: digits };
  }
  if (digits.length < 10) {
    return { phone: digits, issue: "muy corto, no se puede completar sin más datos" };
  }
  if (digits.length > 13) {
    return { phone: digits, issue: "parecen dos números pegados" };
  }
  // ya trae código de país reconocible (+52, +34, +1, etc.), solo se limpia el formato
  return { phone: digits };
}

const properties: Property[] = JSON.parse(readFileSync(FILE, "utf-8"));
const issues: Issue[] = [];

for (const property of properties) {
  const { phone, issue } = standardize(property.owner.phone);
  if (issue) issues.push({ id: property.id, original: property.owner.phone, reason: issue });
  property.owner.phone = phone;
  property.ownerId = phone;
}

writeFileSync(FILE, JSON.stringify(properties, null, 2), "utf-8");
console.log(`${properties.length} properties actualizadas en ${FILE}`);
if (issues.length) {
  console.log(`\n${issues.length} con algo que revisar a mano:`);
  for (const i of issues) console.log(`  ${i.id} | ${i.original} -> ${i.reason}`);
}
