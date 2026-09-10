/* Types for nav-render.mjs. The renderer is plain JS so Node and TypeScript can
   both import the same file — this is the only place types are declared. */
export type NavItem = { href: string; label: string; short?: string; icon: string };
export type NavGroup = { id: string; label: string; public: boolean; items: NavItem[] };

export type RailOptions = {
  /** Pathname of the current page, e.g. "/courses". Optional: nav-rail.js
   *  applies the active class from location.pathname at runtime. */
  active?: string;
  /** Render collapsed on the server, from the slc_nav cookie — avoids a flash. */
  collapsed?: boolean;
  /** UI only for now: no real auth is wired. See STUDENT_AREA in Shell.tsx. */
  signedIn?: boolean;
  student?: { initials: string; name: string; group: string };
};

export function isActive(href: string, active?: string): boolean;
/** Inner HTML of the rail, without the <aside> wrapper — for the React shell. */
export function renderRailInner(opts?: RailOptions): string;
/** Full <aside> rail — for the standalone/generated HTML pages. */
export function renderRail(opts?: RailOptions): string;
export function renderTopbarInner(): string;
export function renderTopbar(): string;
/** Slim top bar for full-screen interactive pages (games, placement test). */
export function renderMinibar(active?: string): string;
/** Full-width brand band. CSS flexbox lockup — never an <img> of the logo SVGs. */
export function renderMastheadInner(): string;
export function renderMasthead(): string;
export const NAV_BREAKPOINT: number;
