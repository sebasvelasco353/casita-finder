// CommonJS keeps this build compatible with Firebase's standalone Node runtime.
// No package manager, Vite, environment variables or network access are needed.
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const css = fs.readFileSync(path.join(root, "src/static.css"), "utf8");
const source = fs.readFileSync(path.join(root, "index.html"), "utf8");
const stylesheet = "/src/static.css";

if (!source.includes(`href="${stylesheet}"`)) {
  throw new Error("No se encontró la hoja de estilos de la página estática.");
}

const hash = createHash("sha256").update(css).digest("hex").slice(0, 12);
const cssName = `static-${hash}.css`;
const html = source.replace(`href="${stylesheet}"`, `href="/assets/${cssName}"`);

fs.rmSync(output, { recursive: true, force: true });
fs.cpSync(path.join(root, "public"), output, { recursive: true });
fs.mkdirSync(path.join(output, "assets"), { recursive: true });
fs.writeFileSync(path.join(output, "assets", cssName), css);
fs.writeFileSync(path.join(output, "index.html"), html);

console.log(`Sitio estático generado en dist/: HTML, CSS y recursos locales (${cssName}).`);
