import { getBlogPosts, formatDate } from "@/lib/blog";
import Link from "next/link";

export const metadata = { title: "Blog — Somerset Language Centre" };
export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getBlogPosts(12);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#4d8520" }}>Sara&apos;s Blog</h1>
        <p className="text-gray-500 mt-1">Cultural notes, grammar tips and English curiosities from Sara Hancock</p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 300px" }}>

        {/* Main — blog posts */}
        <main>
          <div className="text-xs font-bold uppercase tracking-widest pb-2 mb-5"
            style={{ color: "#4d8520", borderBottom: "3px solid #6BAE2E" }}>
            Latest Posts
          </div>

          {posts.length === 0 && (
            <p className="text-gray-400 py-10 text-center">No posts found. Check back soon.</p>
          )}

          <div className="space-y-5">
            {posts.map((post, i) => (
              <article key={i} className="bg-white rounded-lg overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
                {/* Coloured placeholder thumbnail */}
                <div className="h-44 flex items-center justify-center text-5xl"
                  style={{ backgroundColor: "#eaf4da" }}>
                  📝
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-wide text-gray-400">{formatDate(post.pubDate)}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#eaf4da", color: "#4d8520" }}>Blog</span>
                  </div>
                  <h2 className="text-lg font-bold mb-2 leading-snug">{post.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
                  <a href={post.link} target="_blank" rel="noopener noreferrer"
                    className="inline-block text-sm font-bold px-4 py-2 rounded border-2 transition-colors"
                    style={{ borderColor: "#6BAE2E", color: "#4d8520" }}
                    onMouseOver={undefined}>
                    Read on Blogger ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="space-y-5">

          {/* About Sara */}
          <div className="bg-white rounded-lg p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
            <div className="text-xs font-bold uppercase tracking-widest pb-2 mb-4"
              style={{ color: "#4d8520", borderBottom: "3px solid #6BAE2E" }}>
              About Sara
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjcR1xO-Msx2ZNIhWlH3NLvZggB8b2WlI8gcUJPInF74MX4gA32sLbtCqxhmyBfnqTQatDh9L_ktwKDMT0F84ibxo3fC3bpLH4sSOa53mzOYdhmpuHgqIEQhpzcEkKoF-1mNB7yYFXkLM6mxXES4ncZsbk67TB4H3V0hkKZar7RcIv-MZY/s220/Imagen%20de%20WhatsApp%202025-02-02%20a%20las%2018.50.29_c2b9fcbd.jpg"
              alt="Sara Hancock"
              width={80} height={80}
              className="rounded-full mx-auto mb-3 block"
              style={{ border: "3px solid #6BAE2E", objectFit: "cover" }}
            />
            <p className="text-center font-bold text-sm">Sara Hancock</p>
            <p className="text-center text-xs text-gray-500 mt-1 leading-relaxed">
              Teaching English since 1982. Somerset Language Centre opened in Valencia in 2013. Cultural notes, exercises, and Cambridge exam tips.
            </p>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-lg p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
            <div className="text-xs font-bold uppercase tracking-widest pb-2 mb-4"
              style={{ color: "#4d8520", borderBottom: "3px solid #6BAE2E" }}>
              Also on the site
            </div>
            <div className="space-y-1">
              {[
                { href: "/exercises", label: "📚 Exercise Library", sub: "B1 to C2 + EVAU" },
                { href: "/placement", label: "🎯 Placement Test", sub: "Find your level in 2 min" },
                { href: "/contact",   label: "✉️ Contact us",      sub: "Valencia · Mon–Fri" },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="flex flex-col py-2 border-b border-gray-100 last:border-0 hover:pl-1 transition-all text-sm font-semibold text-gray-700">
                  {l.label}
                  <span className="text-xs text-gray-400 font-normal">{l.sub}</span>
                </Link>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
