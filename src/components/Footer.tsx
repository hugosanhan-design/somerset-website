"use client";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  // Homepage has its own full countryside footer — suppress the layout footer there
  if (pathname === "/") return null;
  return (
    <footer className="text-sm mt-16" style={{ backgroundColor: "#1E4227", color: "rgba(245,241,230,0.65)" }}>
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold mb-3">Somerset Language Centre</h3>
          <p className="leading-relaxed">English classes for all levels in Valencia, Spain. Children, teens and adults.</p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-3">Contact</h3>
          <p>Calle Ministro Luis Mayans, 31, Bajo</p>
          <p className="mt-1">📞 601 12 95 52 / 963 38 89 33</p>
          <p className="mt-1">✉️ <a href="mailto:info@somersetlc.com" className="text-[#A8D77E] hover:text-white">info@somersetlc.com</a></p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-3">Follow</h3>
          <a href="https://somersetlanguagecentre.blogspot.com" target="_blank" rel="noopener noreferrer"
            className="text-[#A8D77E] hover:text-white block mb-1">Sara's Blog</a>
          <a href="https://www.instagram.com/somersetlanguagecentre/" target="_blank" rel="noopener noreferrer"
            className="text-[#A8D77E] hover:text-white block">Instagram</a>
        </div>
      </div>
      <div className="text-center py-4" style={{ borderTop: "1px solid rgba(245,241,230,0.12)", color: "rgba(245,241,230,0.4)" }}>
        © {new Date().getFullYear()} Somerset Language Centre. All rights reserved.
      </div>
    </footer>
  );
}
