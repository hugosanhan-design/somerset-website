"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/exercises", label: "Exercises" },
  { href: "/placement", label: "Placement Test" },
  { href: "/courses", label: "Courses" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header style={{ backgroundColor: "#6BAE2E" }} className="sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src="/logo-white.svg" alt="Somerset Language Centre" width={180} height={40} priority />
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="text-white/90 hover:text-white hover:bg-white/15 px-4 py-2 rounded text-sm font-semibold transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        {/* Mobile burger */}
        <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 18L18 6M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-green-700 px-5 pb-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block text-white py-2 text-sm font-semibold border-b border-white/10 last:border-0">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
