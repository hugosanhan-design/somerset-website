/* THE renderer for the Somerset rail. One function, one markup shape.
 *
 * Plain JavaScript on purpose: Node (scripts/build-nav.mjs) and TypeScript
 * (via nav-render.d.mts) both import THIS file, so there is exactly one
 * renderer. Types live next door in nav-render.d.mts.
 *
 * Used by:
 *   - src/components/Shell.tsx       (every Next-rendered page, incl. the homepage)
 *   - scripts/build-nav.mjs          (writes build/nav-rail.html for the Python
 *                                     generators, so the standalone pages get
 *                                     byte-identical markup)
 *
 * Nav content lives in src/data/nav.json. Styling lives in public/nav-rail.css.
 * Behaviour lives in public/nav-rail.js. Change nav in one of those three, never
 * in a page.
 */
import navData from "../data/nav.json" with { type: "json" };



const ICONS = {
  about:
    '<circle cx="9.4" cy="9" r="2.9"/><path d="M4 19c0-2.7 2.4-4.6 5.4-4.6s5.4 1.9 5.4 4.6"/><path d="M15.6 6.6a2.9 2.9 0 0 1 .6 5.6"/><path d="M17 14.9c2 .6 3.4 2.2 3.4 4.1"/>',
  courses:
    '<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M9 4v3M15 4v3M8.5 13.5h2M8.5 16.5h5"/>',
  contact:
    '<path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.6" r="2.4"/>',
  exercises:
    '<path d="M16.4 4.6a2 2 0 0 1 2.9 2.8L9.6 17.1l-3.8 1 1-3.8Z"/><path d="m14.6 6.4 3 3"/>',
  games:
    '<rect x="4" y="4.5" width="15" height="15" rx="3.2"/><circle cx="9" cy="9.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="14" cy="14.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="14" cy="9.5" r="1.1" fill="currentColor" stroke="none"/>',
  blog: '<rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M7.5 9.5h6M7.5 13h9M7.5 16h5"/>',
  group:
    '<rect x="3.5" y="6" width="17" height="13" rx="2.6"/><path d="M8 6V4.2M16 6V4.2M7.5 11h3M7.5 14.5h6"/>',
  check: '<path d="M19 5.5 10.2 15l-4-3.6"/><path d="M5 18.5h14"/>',
  level:
    '<path d="M5 17.5a7.6 7.6 0 1 1 14 0"/><path d="M12 14.2 15.6 10"/><circle cx="12" cy="17.5" r="1.1" fill="currentColor" stroke="none"/>',
  key: '<circle cx="8.6" cy="11" r="3.6"/><path d="m11.6 9.4 8.4-2.8.6 3.2-2.4.8.5 2.3-2.6.9-.5-2.3-2.6.9"/>',
  chev: '<path d="M13.5 6 8 12l5.5 6"/>',
  burger: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function icon(key, cls = "sl-ico") {
  if (key.startsWith("monogram:")) {
    return `<span class="${cls} sl-mono" aria-hidden="true">${esc(key.slice(9))}</span>`;
  }
  const d = ICONS[key] || ICONS.blog;
  return `<span class="${cls}" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg></span>`;
}

/** Active when the paths match, or when a section page is a prefix of the URL. */
export function isActive(href, active) {
  if (!active) return false;
  const path = href.split("#")[0] || "/";
  if (path === "/") return active === "/";
  return active === path || active.startsWith(path + "/");
}

function renderItem(it, groupLabel, active) {
  const on = isActive(it.href, active) ? " sl-active" : "";
  const aria = on ? ' aria-current="page"' : "";
  return (
    `<a class="sl-item${on}" href="${esc(it.href)}"${aria}>` +
    icon(it.icon) +
    `<span class="sl-lab">${esc(it.label)}</span>` +
    `<span class="sl-tip"><s>${esc(groupLabel)}</s>${esc(it.short || it.label)}</span>` +
    `</a>`
  );
}

/** Inner HTML of the rail, without the <aside> wrapper — for React, which
 *  supplies its own element so no extra div lands inside the shell grid. */
export function renderRailInner(opts = {}) {
  const d = navData;
  const { active, collapsed, signedIn, student } = opts;

  const groups = d.groups
    .filter((g) => g.public || signedIn)
    .map(
      (g) =>
        `<div class="sl-glabel">${esc(g.label)}</div><div class="sl-div"></div>` +
        `<nav class="sl-group" aria-label="${esc(g.label)}">` +
        g.items.map((it) => renderItem(it, g.label, active)).join("") +
        `</nav>`
    )
    .join("");

  const account =
    signedIn && student
      ? `<a class="sl-account" href="/student">` +
        `<span class="sl-avatar" aria-hidden="true">${esc(student.initials)}</span>` +
        `<span class="sl-who"><span class="sl-n">${esc(student.name)}</span><span class="sl-g">${esc(
          student.group
        )}</span></span></a>`
      : "";

  const ctas = signedIn
    ? ""
    : `<div class="sl-ctas">` +
      d.ctas
        .map(
          (c) =>
            `<a class="sl-cta${c.style === "ghost" ? " sl-ghost" : ""}" href="${esc(c.href)}">` +
            icon(c.icon) +
            `<span class="sl-lab">${esc(c.label)}</span>` +
            `<span class="sl-tip">${esc(c.short || c.label)}</span></a>`
        )
        .join("") +
      `</div>`;

  return (
    `<div class="sl-railtop">` +
    `<button type="button" class="sl-toggle" aria-label="${
      collapsed ? "Expand navigation" : "Collapse navigation"
    }" aria-expanded="${collapsed ? "false" : "true"}">` +
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS.chev}</svg>` +
    `</button></div>` +
    `<div class="sl-hint" role="status"><button type="button" class="sl-x" aria-label="Dismiss">&times;</button>` +
    `<b>Welcome back</b>You can narrow this rail to icons — the arrow, or press <kbd>[</kbd>.</div>` +
    account +
    groups +
    ctas +
    `<div class="sl-foot"><b>${esc(d.foot.hours)}</b>${esc(d.foot.address)}<br>${esc(
      d.foot.meta
    )}</div>`
  );
}

/** Full rail element — used by the standalone/generated HTML pages. */
export function renderRail(opts = {}) {
  return `<aside class="sl-rail" aria-label="Main navigation">${renderRailInner(opts)}</aside>`;
}

/** Sticky bar shown only below the breakpoint; opens the rail as a drawer. */
export function renderTopbarInner() {
  const d = navData;
  return (
    `<a href="/" class="sl-name" style="text-decoration:none"><b>${esc(d.brand.name)}</b>${esc(
      d.brand.rest
    )}</a>` +
    `<button type="button" class="sl-burger" aria-label="Open menu">` +
    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">${ICONS.burger}</svg>` +
    `</button>`
  );
}

export function renderTopbar() {
  return `<div class="sl-topbar">${renderTopbarInner()}</div>`;
}

export const NAV_BREAKPOINT = navData.breakpoint;

/* Minibar — for full-screen interactive pages (individual games, the placement
   test) where a permanent 268px column would eat the play area. Same nav.json,
   same tokens, same stylesheet: one source, two kinds of chrome.
   Rule: rail for pages you browse, minibar for things you play. */
export function renderMinibar(active) {
  const d = navData;
  const visit = d.groups.find((g) => g.id === "visit");
  const cta = d.ctas[0];
  const links = visit.items
    .map(
      (it) =>
        `<a href="${esc(it.href)}"${isActive(it.href, active) ? ' class="sl-on"' : ""}>${esc(
          it.short || it.label
        )}</a>`
    )
    .join("");
  return (
    `<header class="sl-minibar">` +
    `<a class="sl-mb-logo" href="${esc(d.brand.href)}">` +
    `<span class="sl-name"><b>${esc(d.brand.name)}</b>${esc(d.brand.rest)}</span>` +
    `<span class="sl-sub">${esc(d.brand.sub)}</span></a>` +
    `<nav class="sl-mb-nav">${links}<a class="sl-mb-cta" href="${esc(cta.href)}">${esc(
      cta.short || cta.label
    )}</a></nav></header>`
  );
}

/* Masthead — the full-width brand band across the very top.
   Built as a CSS FLEXBOX TEXT LOCKUP, never an <img> of logo-colour.svg.
   Those SVGs are live <text> with absolute x coordinates and a font-family, the
   exact asset class that has produced the LANGUAGE/CENTRE overlap three times
   (SVG x-coords May 2026; PNG data-URIs 8 Jun; canonical light data-URI 17 Jun).
   Flexbox is real text flow, so the two parts can never collide at any size or
   in any font. Do not "simplify" this back to an image. */
export function renderMastheadInner() {
  const d = navData;
  return (
    `<a class="sl-lockup" href="${esc(d.brand.href)}" aria-label="${esc(d.brand.name + d.brand.rest)}">` +
    `<span class="sl-lk-word">Somerset</span>` +
    `<span class="sl-lk-sub"><span>LANGUAGE</span><span>CENTRE</span></span>` +
    `</a>` +
    `<span class="sl-mast-meta">${esc(d.brand.sub)}</span>` +
    `<button type="button" class="sl-burger" aria-label="Open menu">` +
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">${ICONS.burger}</svg>` +
    `</button>`
  );
}

export function renderMasthead() {
  return `<header class="sl-masthead">${renderMastheadInner()}</header>`;
}
