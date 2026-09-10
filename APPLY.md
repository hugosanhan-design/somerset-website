# Nav unification — apply to `somerset-website`

Goal: **one source of truth for navigation**, then the rail. Today the nav is written
out five times (`Header.tsx`, the homepage's own nav inside `page.tsx`, `site-html.ts`,
`build_daily_quizzical.py`, and the ~93 generated Quizzical pages). After this, it is
written once in `src/data/nav.json` and rendered from one file everywhere.

Everything below is on branch `nav-rail`. Nothing here touches `main`.

## What's in this kit

| File | Role |
|---|---|
| `src/data/nav.json` | **The only place nav content lives.** Groups, labels, hrefs, icons. |
| `src/lib/nav-render.mjs` | **The only renderer.** Plain JS so Node and TypeScript both import it. |
| `src/lib/nav-render.d.mts` | Types for the above. |
| `src/components/Shell.tsx` | Server component. Reads cookies, wraps every Next page. |
| `public/nav-rail.css` | The only stylesheet. Tokens match the live site exactly. |
| `public/nav-rail.js` | The only behaviour: collapse, drawer, hint, active link. |
| `scripts/build-nav.mjs` | Exports `build/nav-*.html` so the Python generators stop hand-writing nav. |
| `preview.html` | Open it in a browser — the standalone-page shell, no build needed. |

## Steps

1. **Branch.** `git checkout -b nav-rail`
2. **Copy the kit in**, preserving paths (`src/…`, `public/…`, `scripts/…`).
3. **`src/app/layout.tsx`** — wrap children, drop `Header`:
   ```tsx
   import Shell from "@/components/Shell";
   // in <body>:  <Shell>{children}</Shell>  <Footer />
   //   plus:     <link rel="stylesheet" href="/nav-rail.css" />
   //             <script src="/nav-rail.js" defer />
   ```
   `Shell` renders its own `<main>`, so remove the existing `<main>` wrapper.
4. **`src/components/Header.tsx`** — delete. Its `if (pathname === "/") return null`
   escape hatch is what let the homepage nav drift in the first place.
5. **`src/app/page.tsx`** — remove the homepage's own full-screen nav block and its
   nav CSS. The homepage now gets the same rail as everything else. *(This is the
   fiddliest step — the nav is entangled with the hero's scroll behaviour.)*
6. **`package.json`** — make the export automatic so the generated pages can never
   go stale:
   ```json
   "build": "node scripts/build-nav.mjs && next build"
   ```
7. **`build_daily_quizzical.py`** — replace `site_header()` (line ~1172) with a read
   of the exported file, and swap the `.sl-header` CSS block (lines ~62–92) for a
   read of `public/nav-rail.css`:
   ```python
   NAVDIR = BASE / "somerset-website"
   RAIL  = (NAVDIR / "build/nav-rail.html").read_text(encoding="utf-8")
   TOPBAR= (NAVDIR / "build/nav-topbar.html").read_text(encoding="utf-8")
   NAVCSS= (NAVDIR / "public/nav-rail.css").read_text(encoding="utf-8")
   NAVJS = (NAVDIR / "public/nav-rail.js").read_text(encoding="utf-8")
   ```
   and in `page_shell`, wrap the body:
   ```html
   <div class="sl-shell" data-breakpoint="900">{RAIL}<div class="sl-col">{TOPBAR}<main>…</main></div><div class="sl-scrim"></div></div>
   <script>{NAVJS}</script>
   ```
   Delete the "keep in sync with Header.tsx" comment — there is nothing to sync now.
8. **`regen_site_html.py`** — same substitution for the pages it embeds.
   **Leave Somerset Island alone**: it is a full-screen game with its own shell, and
   the file already says so.
9. **Verify:** `npm run build`, then `npm run dev` and check `/`, `/courses`,
   `/contact`, `/blog`, `/exercises` (React) and `/games`, `/daily-quizzical`,
   `/reading-lab`, `/placement` (generated). Resize below 900px on each.
10. **Do not merge to `main` until Vercel's preview deploy looks right** — the
    generated pages are static, so a bad export ships to ~93 URLs at once.

## Two things this kit deliberately does NOT do

- **No real auth.** `slc_student` is a demo flag. It proves nothing and protects
  nothing. Before any student content goes behind it: verified session +
  `middleware.ts` gating `/student`, and a decision about who creates accounts.
- **No gating of `/games`, `/exercises`, `/daily-quizzical`, `/blog`.** Those four
  are the site's only organic acquisition surface. `nav.json` records this as a note
  so the next person doesn't quietly move them.

## Still worth doing before any of it

The site has no analytics (checked 10 Jun 2026). This migration changes the
navigation of every page on the site with no way to see whether it helped.
