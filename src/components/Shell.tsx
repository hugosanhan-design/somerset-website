/* Server component — the page shell for every Next-rendered route.
 *
 * No "use client". The rail is server-rendered markup plus one shared vanilla
 * script (public/nav-rail.js), which is what lets the Next pages and the
 * generated standalone pages run the SAME navigation instead of two copies.
 *
 * Reading slc_nav here is the whole reason we chose a cookie over localStorage:
 * the collapsed class is in the first paint, so a returning visitor never sees
 * the rail open and then snap shut.
 *
 * The active link is applied by nav-rail.js from location.pathname rather than
 * on the server, so this component needs no pathname and routes stay static.
 * Without JS the rail still renders, open and fully navigable.
 *
 * STUDENT_AREA: signedIn is UI-only. The slc_student cookie is a DEMO FLAG, not
 * a session — it proves nothing and protects nothing. Before real student
 * content goes behind it, replace this with a verified session and gate
 * /student in middleware. The "Learn, free" group must stay public: it is the
 * site's only organic acquisition surface.
 */
import { cookies } from "next/headers";
import { renderRailInner, renderMastheadInner, NAV_BREAKPOINT } from "@/lib/nav-render.mjs";

export default async function Shell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const jar = await cookies();
  const collapsed = jar.get("slc_nav")?.value === "collapsed";
  const signedIn = jar.get("slc_student")?.value === "1";

  const student = signedIn
    ? { initials: "AG", name: "Álex G.", group: "PET I · Wed 15:45" }
    : undefined;

  return (
    <div
      className={`sl-shell${collapsed ? " sl-collapsed" : ""}`}
      data-breakpoint={NAV_BREAKPOINT}
    >
      <header className="sl-masthead" dangerouslySetInnerHTML={{ __html: renderMastheadInner() }} />
      <aside
        className="sl-rail"
        aria-label="Main navigation"
        dangerouslySetInnerHTML={{ __html: renderRailInner({ collapsed, signedIn, student }) }}
      />
      <div className="sl-col">
        <main>{children}</main>
        {footer}
      </div>
      <div className="sl-scrim" />
    </div>
  );
}
