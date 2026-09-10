#!/usr/bin/env node
/* Exports the rail for the non-React pages.
 *
 * The Python generators (build_daily_quizzical.py, regen_site_html.py) and the
 * standalone prototypes cannot import TypeScript, so they read the files this
 * script writes. Run it after ANY change to src/data/nav.json, then re-run the
 * generators.
 *
 *   node scripts/build-nav.mjs
 *
 * Writes:
 *   build/nav-rail.html   rail markup (no <aside> state classes)
 *   build/nav-topbar.html sticky bar for narrow screens
 *   build/nav-minibar.html slim bar for full-screen game/test pages
 *   build/nav-meta.json   breakpoint + the asset paths to include
 *
 * Duplicates nothing: it imports the same renderer the React shell uses. If it
 * is not re-run, the generated pages keep the previous nav — so wire it into
 * `npm run build` (see APPLY.md step 6).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const nav = JSON.parse(readFileSync(resolve(root, "src/data/nav.json"), "utf8"));

import { renderRail, renderTopbar, renderMinibar, renderMasthead } from "../src/lib/nav-render.mjs";

mkdirSync(resolve(root, "build"), { recursive: true });
writeFileSync(resolve(root, "build/nav-rail.html"), renderRail({}), "utf8");
writeFileSync(resolve(root, "build/nav-topbar.html"), renderTopbar(), "utf8");
writeFileSync(resolve(root, "build/nav-minibar.html"), renderMinibar(), "utf8");
writeFileSync(resolve(root, "build/nav-masthead.html"), renderMasthead(), "utf8");
writeFileSync(
  resolve(root, "build/nav-meta.json"),
  JSON.stringify({ breakpoint: nav.breakpoint, css: "/nav-rail.css", js: "/nav-rail.js" }, null, 2),
  "utf8"
);
console.log("nav exported → build/nav-rail.html, nav-topbar.html, nav-minibar.html, nav-masthead.html, nav-meta.json");
