// Retire only this project's deployed functions. Firestore data is preserved.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../node_modules/firebase-tools/lib/bin/firebase.js", import.meta.url));
const project = "una-casita";
const execute = process.argv.includes("--execute");

function run(args, capture = false) {
  const result = spawnSync(process.execPath, [cli, ...args, "--project", project, "--non-interactive"], {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (capture) console.error(result.stdout, result.stderr);
    throw new Error("Firebase falló. Verifica firebase login y los permisos del proyecto.");
  }
  return result.stdout;
}

function inventory() {
  const payload = JSON.parse(run(["functions:list", "--json"], true));
  if (payload.status !== "success" || !Array.isArray(payload.result)) {
    throw new Error("Inventario inválido; no se eliminará ninguna función.");
  }
  for (const fn of payload.result) {
    if (!/^[a-zA-Z0-9_-]+$/.test(fn.id) || !/^[a-z0-9-]+$/.test(fn.region) || fn.project !== project) {
      throw new Error("Función inesperada en el inventario; se detuvo el apagado.");
    }
  }
  return payload.result;
}

try {
  const functions = inventory();
  console.table(functions.map(({ id, region }) => ({ id, region })));
  if (!functions.length) {
    console.log("Verificado: no hay Cloud Functions desplegadas en una-casita.");
  } else if (!execute) {
    console.log("Solo inventario. Para apagar estas funciones: npm run cloud:stop -- --execute");
  } else {
    // Prioritize the scheduled email sender, then publication/image email triggers.
    const priority = ["checkPropertyAvailability", "sendHousePublishedEmail", "processCasaImage"];
    functions.sort((a, b) => {
      const rank = (id) => priority.includes(id) ? priority.indexOf(id) : priority.length;
      return rank(a.id) - rank(b.id);
    });
    for (const fn of functions) {
      // Explicit codebase/id avoids CLI codebase-name collisions.
      const target = `${fn.codebase || "default"}:${fn.id}`;
      run(["functions:delete", target, "--region", fn.region, "--force"]);
    }
    const remaining = inventory();
    if (remaining.length) throw new Error("Todavía quedan funciones desplegadas. Revisa el inventario.");
    console.log("Verificado: todas las Cloud Functions fueron eliminadas.");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
