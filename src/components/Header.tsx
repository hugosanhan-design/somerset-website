"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Canonical site nav — a replica of the homepage premium nav in its scrolled
// state (cream blurred bar, Poppins wordmark, dark Placement pill). THE rule:
// every page's banner looks exactly like this. Keep in sync with the homepage
// nav in page.tsx and the sl-header in the embedded prototypes
// (build_daily_quizzical.py, Reading Lab, Somerset Games hub).
// No "Home" link — the logo is the home button. Primary trio first, then the
// learning-content group (Games / Exercises / Daily Quizzical / Blog) as its
// own quieter section after a hairline divider.
const primaryLinks = [
  { href: "/#about", label: "Who we are" },
  { href: "/courses", label: "Courses" },
  { href: "/contact", label: "Contact" },
];
const secondaryLinks = [
  { href: "/games", label: "Games" },
  { href: "/exercises", label: "Exercises" },
  { href: "/daily-quizzical", label: "Daily Quizzical" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes, and lock body scroll
  // while it's open.
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onEsc);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onEsc); };
  }, [menuOpen]);

  // Homepage has its own full-screen nav — suppress layout header there
  if (pathname === "/") return null;

  const isActive = (href: string) => href !== "/" && pathname.startsWith(href);

  return (
    <>
    <header className={`sl-header${menuOpen ? " menu-open" : ""}`}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Poppins:wght@600;700&display=swap"
      />
      <style>{`
        .sl-header { position: sticky; top: 0; z-index: 100; background: rgba(245,241,230,0.92); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); box-shadow: 0 1px 0 #D9D2BC; }
        .sl-header .sl-wrap { max-width: 1240px; margin: 0 auto; padding: 0.85rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem 2rem; flex-wrap: wrap; }
        .sl-header .sl-logo { display: flex; flex-direction: column; line-height: 1.05; gap: 2px; text-decoration: none; }
        .sl-header .sl-logo-name { font-family: 'Poppins', system-ui, sans-serif; font-size: 1.35rem; font-weight: 700; color: #17281B; letter-spacing: -0.01em; }
        .sl-header .sl-logo-name b { font-weight: 700; color: #57B82C; }
        .sl-header .sl-logo-sub { font-family: 'Instrument Sans', system-ui, sans-serif; font-size: 0.55rem; font-weight: 600; letter-spacing: 0.26em; text-transform: uppercase; color: #5C6657; }
        .sl-header .sl-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 0.3rem; }
        .sl-header .sl-nav a { font-family: 'Instrument Sans', system-ui, sans-serif; font-size: 0.9rem; font-weight: 500; color: #17281B; text-decoration: none; padding: 0.42rem 0.95rem; border-radius: 50px; white-space: nowrap; }
        .sl-header .sl-nav a:hover { color: #3D8B1F; }
        .sl-header .sl-nav a.active { color: #3D8B1F; font-weight: 600; }
        .sl-header .sl-nav a.sl-cta { background: #17281B; color: #F5F1E6; padding: 0.6rem 1.35rem; margin-left: 0.6rem; font-weight: 600; }
        .sl-header .sl-nav a.sl-cta:hover { background: #3D8B1F; color: #fff; }
        .sl-header .sl-nav .sl-sep { width: 1px; height: 18px; background: #D9D2BC; margin: 0 0.55rem; }
        .sl-header .sl-nav a.sl-sec { font-size: 0.78rem; color: #5C6657; padding: 0.38rem 0.7rem; }
        .sl-header .sl-nav a.sl-sec:hover { color: #3D8B1F; }
        .sl-header .sl-nav a.sl-sec.active { color: #3D8B1F; font-weight: 600; }
        /* ── Mobile burger (hidden on desktop) ── */
        .sl-burger { display: none; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #D9D2BC; background: rgba(245,241,230,0.85); cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; z-index: 260; }
        .sl-burger span { display: block; width: 18px; height: 2px; background: #17281B; border-radius: 2px; transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.2s; }
        .sl-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .sl-burger.open span:nth-child(2) { opacity: 0; }
        .sl-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        /* while the menu is open, lift the header (and its burger) above the
           overlay so the X stays visible and tappable — the header's own
           backdrop-filter would otherwise trap the fixed overlay inside it */
        .sl-header.menu-open { z-index: 260; background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; box-shadow: none; }
        .sl-header.menu-open .sl-burger { background: transparent; border-color: rgba(245,241,230,0.4); }
        .sl-header.menu-open .sl-burger span { background: #F5F1E6; }
        /* ── Full-screen mobile menu ── */
        .sl-mobile { position: fixed; inset: 0; z-index: 250; background: #1E4227; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .sl-mobile.open { opacity: 1; pointer-events: auto; }
        .sl-mobile a { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.7rem, 7vw, 2.2rem); font-weight: 400; color: #F5F1E6; padding: 0.4rem 1.5rem; letter-spacing: -0.01em; }
        .sl-mobile a.active { color: #A8D77E; }
        .sl-mobile .sl-mobile-divider { width: 42px; height: 1px; background: rgba(245,241,230,0.25); margin: 1.1rem 0 0.9rem; }
        .sl-mobile a.sl-mobile-small { font-family: 'Instrument Sans', system-ui, sans-serif; font-size: 1.02rem; font-weight: 500; color: rgba(245,241,230,0.8); padding: 0.32rem 1.5rem; letter-spacing: 0; }
        .sl-mobile a.sl-mobile-small.active { color: #A8D77E; }
        .sl-mobile .sl-mobile-sub { font-family: 'Instrument Sans', system-ui, sans-serif; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(245,241,230,0.45); margin-top: 1.4rem; }
        @media (max-width: 700px) {
          .sl-header .sl-wrap { padding: 0.6rem 1rem; flex-wrap: nowrap; }
          .sl-header .sl-logo-name { font-size: 1.05rem; }
          .sl-header .sl-nav { display: none; }
          .sl-burger { display: flex; }
        }
      `}</style>
      <div className="sl-wrap">
        <Link href="/" className="sl-logo">
          <span className="sl-logo-name"><b>Somerset</b> Language Centre</span>
          <span className="sl-logo-sub">Valencia · Est. 2013</span>
        </Link>
        <nav className="sl-nav">
          {primaryLinks.map(l => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
          <span className="sl-sep" aria-hidden="true" />
          {secondaryLinks.map(l => (
            <Link key={l.href} href={l.href} className={`sl-sec${isActive(l.href) ? " active" : ""}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/placement" className="sl-cta">Placement Test</Link>
        </nav>
        <button
          type="button"
          className={`sl-burger${menuOpen ? " open" : ""}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>

    <div className={`sl-mobile${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
      {primaryLinks.map(l => (
        <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : ""}>
          {l.label}
        </Link>
      ))}
      <Link href="/placement" className={isActive("/placement") ? "active" : ""}>Placement Test</Link>
      <span className="sl-mobile-divider" aria-hidden="true" />
      {secondaryLinks.map(l => (
        <Link key={l.href} href={l.href} className={`sl-mobile-small${isActive(l.href) ? " active" : ""}`}>
          {l.label}
        </Link>
      ))}
      <span className="sl-mobile-sub">Valencia · Est. 2013</span>
    </div>
    </>
  );
}
