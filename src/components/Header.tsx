"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Canonical site nav — a replica of the homepage premium nav in its scrolled
// state (cream blurred bar, Poppins wordmark, dark Placement pill). THE rule:
// every page's banner looks exactly like this. Keep in sync with the homepage
// nav in page.tsx and the sl-header in the embedded prototypes
// (build_daily_quizzical.py, Reading Lab, Somerset Games hub).
const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/daily-quizzical", label: "Daily Quizzical" },
  { href: "/courses", label: "Courses" },
  { href: "/games", label: "Games" },
  { href: "/exercises", label: "Exercises" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();

  // Homepage has its own full-screen nav — suppress layout header there
  if (pathname === "/") return null;

  const isActive = (href: string) => href !== "/" && pathname.startsWith(href);

  return (
    <header className="sl-header">
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
        @media (max-width: 700px) {
          .sl-header .sl-wrap { padding: 0.6rem 1rem; }
          .sl-header .sl-logo-name { font-size: 1.05rem; }
          .sl-header .sl-nav a { font-size: 0.8rem; padding: 0.3rem 0.55rem; }
          .sl-header .sl-nav a.sl-cta { padding: 0.4rem 0.9rem; margin-left: 0.2rem; }
        }
      `}</style>
      <div className="sl-wrap">
        <Link href="/" className="sl-logo">
          <span className="sl-logo-name"><b>Somerset</b> Language Centre</span>
          <span className="sl-logo-sub">Valencia · Est. 2013</span>
        </Link>
        <nav className="sl-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
          <Link href="/placement" className="sl-cta">Placement Test</Link>
        </nav>
      </div>
    </header>
  );
}
