#!/usr/bin/env node
// Validates Den themes: the den.theme/v1 JSON Schema, the contrast rules Den
// enforces, that referenced files exist, and that each id matches its directory.
//
//   node scripts/validate.mjs                 every theme in this repo (starter/ and themes/*)
//   node scripts/validate.mjs <dir> [<dir>]   the themes in those directories
//   --no-id-check                             skip the id-matches-directory rule
//                                             (for a single-theme repo, whose directory name is arbitrary)
//
// Exits 1 if any theme fails.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, basename, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(readFileSync(join(repo, "schemas/den.theme.v1.json"), "utf8"));
const SCHEMA_URL = "https://raw.githubusercontent.com/Monster-Orange/den/main/schemas/den.theme.v1.json";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

// The pairs Den checks, as [foreground, background, minimum ratio].
// Keep in step with Den's own `theme validate`.
const TEXT = ["text", "muted", "faint", "accent-text", "ok", "warn", "bad", "remote"];
const GROUNDS = ["bg", "surface", "raised", "sunken"];
const PAIRS = [
  // Every text token on every ground at 4.5:1 (faint is text: captions, labels).
  ...TEXT.flatMap((f) => GROUNDS.map((b) => [f, b, 4.5])),
  ["on-accent", "accent-fill", 4.5],
  // Non-text UI (focus rings, selection, control borders) on every ground at 3:1.
  // accent is never text: links and accent text use accent-text.
  ...["accent", "border-strong"].flatMap((f) => GROUNDS.map((b) => [f, b, 3])),
];

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// An SVG is shown with <img>, which already blocks scripts; refuse them anyway
// so a mark never depends on that.
function svgProblems(text) {
  const out = [];
  if (/<script\b/i.test(text)) out.push("contains <script>");
  if (/<foreignObject\b/i.test(text)) out.push("contains <foreignObject>");
  if (/\son[a-z]+\s*=/i.test(text)) out.push("has an on* event attribute");
  if (/(?:xlink:)?href\s*=\s*["'](?!#)/i.test(text)) out.push("references an external resource (href must start with #)");
  if (/url\(\s*["']?(?!#)/i.test(text)) out.push("references an external resource via url()");
  if (/<!ENTITY/i.test(text)) out.push("declares XML entities");
  return out;
}

function validateTheme(dir, { idCheck }) {
  const errors = [];
  const file = join(dir, "den-theme.json");
  if (!existsSync(file)) return [`no den-theme.json in ${dir}`];
  let theme;
  try {
    theme = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    return [`den-theme.json is not valid JSON: ${e.message}`];
  }

  if (!validateSchema(theme)) {
    for (const e of validateSchema.errors) {
      const where = e.instancePath || "(root)";
      const extra = e.params?.additionalProperty ? ` ('${e.params.additionalProperty}')` : "";
      errors.push(`schema: ${where} ${e.message}${extra}`);
    }
  }
  if (theme.$schema !== undefined && theme.$schema !== SCHEMA_URL) {
    errors.push(`$schema should be ${SCHEMA_URL}`);
  }

  if (idCheck && typeof theme.id === "string" && theme.id !== basename(dir)) {
    errors.push(`id '${theme.id}' does not match its directory '${basename(dir)}'`);
  }

  // Contrast, per mode. Skip a mode the schema already rejected for a missing or non-hex token.
  const hex = /^#[0-9a-fA-F]{6}$/;
  for (const mode of ["light", "dark"]) {
    const c = theme.modes?.[mode];
    if (!c) continue;
    for (const [fg, bg, min] of PAIRS) {
      if (!hex.test(c[fg] ?? "") || !hex.test(c[bg] ?? "")) continue;
      const r = contrast(c[fg], c[bg]);
      if (r < min) {
        errors.push(
          `contrast: ${mode}: ${fg} on ${bg} is ${r.toFixed(2)}:1, needs ${min}:1 (${c[fg]} on ${c[bg]})`,
        );
      }
    }
  }

  // Referenced files exist, stay inside the theme, and are what they claim to be.
  const inside = (p) => {
    const abs = resolve(dir, p);
    return relative(dir, abs).startsWith("..") ? null : abs;
  };
  for (const key of ["svg", "svg_dark"]) {
    const p = theme.mark?.[key];
    if (typeof p !== "string") continue;
    const abs = inside(p);
    if (!abs || !existsSync(abs)) {
      errors.push(`files: mark.${key} '${p}' does not exist`);
      continue;
    }
    const text = readFileSync(abs, "utf8");
    if (!/<svg\b/i.test(text)) errors.push(`files: mark.${key} '${p}' is not an SVG`);
    for (const why of svgProblems(text)) errors.push(`files: mark.${key} '${p}' ${why}`);
  }
  for (const font of theme.fonts ?? []) {
    for (const f of font.files ?? []) {
      if (typeof f.path !== "string") continue;
      const abs = inside(f.path);
      if (!abs || !existsSync(abs)) {
        errors.push(`files: font '${font.family}' file '${f.path}' does not exist`);
        continue;
      }
      if (readFileSync(abs).subarray(0, 4).toString("latin1") !== "wOF2") {
        errors.push(`files: font '${font.family}' file '${f.path}' is not woff2`);
      }
      const licensed = readdirSync(dirname(abs)).some((n) => /^(OFL|LICENSE)/i.test(n));
      if (!licensed) {
        errors.push(`files: font '${font.family}': no OFL.txt or LICENSE next to '${f.path}'`);
      }
    }
  }

  return errors;
}

// Which directories to check.
const args = process.argv.slice(2);
const idCheck = !args.includes("--no-id-check");
let dirs = args.filter((a) => !a.startsWith("--")).map((a) => resolve(a));
if (dirs.length === 0) {
  dirs = [join(repo, "starter")];
  const themes = join(repo, "themes");
  for (const n of readdirSync(themes).sort()) {
    if (statSync(join(themes, n)).isDirectory()) dirs.push(join(themes, n));
  }
}

let failed = 0;
for (const dir of dirs) {
  const shown = relative(process.cwd(), dir) || ".";
  const errors = validateTheme(dir, { idCheck });
  if (errors.length === 0) {
    console.log(`ok    ${shown}`);
  } else {
    failed++;
    console.log(`FAIL  ${shown}`);
    for (const e of errors) console.log(`      ${e}`);
  }
}
console.log(`\n${dirs.length - failed} of ${dirs.length} themes pass.`);
process.exit(failed ? 1 : 0);
