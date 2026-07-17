"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Canonical site nav — keep in sync with the homepage nav and the shared
// sl-header in the embedded prototypes (build_daily_quizzical.py, Reading Lab,
// Somerset Games hub). Same items, same order, same styling everywhere.
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
      <style>{`
        .sl-header { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 2px solid #57B82C; }
        .sl-header .sl-wrap { max-width: 1160px; margin: 0 auto; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; }
        .sl-header .sl-logo { display: flex; align-items: center; text-decoration: none; }
        .sl-header .sl-nav { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 6px; }
        .sl-header .sl-nav a { font-size: 13.5px; font-weight: 600; color: #4b5563; text-decoration: none; padding: 7px 10px; border-radius: 6px; }
        .sl-header .sl-nav a:hover { color: #3D8B1F; }
        .sl-header .sl-nav a.active { color: #3D8B1F; }
        .sl-header .sl-nav a.sl-cta { background: #57B82C; color: #fff; padding: 7px 15px; border-radius: 20px; margin-left: 4px; }
        .sl-header .sl-nav a.sl-cta:hover { background: #3D8B1F; color: #fff; }
        @media (max-width: 700px) {
          .sl-header .sl-wrap { padding: 8px 14px; }
          .sl-header .sl-logo img { height: 28px !important; width: auto !important; }
          .sl-header .sl-nav a { font-size: 12.5px; padding: 5px 7px; }
          .sl-header .sl-nav a.sl-cta { padding: 5px 12px; }
        }
      `}</style>
      <div className="sl-wrap">
        <Link href="/" className="sl-logo">
          <Image src="/logo-colour.svg" alt="Somerset Language Centre" width={153} height={34} style={{ height: 34, width: "auto" }} priority />
        </Link>
        <nav className="sl-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
          <Link href="/placement" className={"sl-cta"}>Placement Test</Link>
        </nav>
      </div>
    </header>
  );
}
