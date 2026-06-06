import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-16">
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold mb-3">Somerset Language Centre</h3>
          <p className="leading-relaxed">English classes for all levels in Valencia, Spain. Children, teens and adults.</p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-3">Contact</h3>
          <p>Calle Ministro Luis Mayans, 31, Bajo</p>
          <p className="mt-1">📞 601 12 95 52 / 963 38 89 33</p>
          <p className="mt-1">✉️ <a href="mailto:info@somersetlc.com" className="text-green-400 hover:text-green-300">info@somersetlc.com</a></p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-3">Follow</h3>
          <a href="https://somersetlanguagecentre.blogspot.com" target="_blank" rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 block mb-1">Sara's Blog</a>
          <a href="https://www.instagram.com/somersetlanguagecentre/" target="_blank" rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 block">Instagram</a>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-gray-500">
        © {new Date().getFullYear()} Somerset Language Centre. All rights reserved.
      </div>
    </footer>
  );
}
