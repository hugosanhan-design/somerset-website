"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/#courses", label: "Courses" },
  { href: "/games", label: "Games" },
  { href: "/exercises", label: "Exercises" },
  { href: "/placement", label: "Placement Test" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Homepage has its own full-screen nav — suppress layout header there
  if (pathname === "/") return null;
  return (
    <header className="sticky top-0 z-50 bg-white" style={{ borderBottom: "2px solid #6BAE2E" }}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src="/logo-colour.svg" alt="Somerset Language Centre" width={180} height={40} priority />
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="text-gray-600 hover:text-green-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
              style={{"--hover-color": "#6BAE2E"} as React.CSSProperties}>
              {l.label}
            </Link>
          ))}
        </nav>
        {/* Mobile burger */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 18L18 6M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t px-5 pb-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block text-gray-700 py-3 text-sm font-semibold border-b border-gray-100 last:border-0">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
