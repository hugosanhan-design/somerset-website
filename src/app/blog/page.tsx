import { getBlogPosts } from "@/lib/blog";

export const metadata = { title: "Blog — Somerset Language Centre" };
export const revalidate = 3600;

function formatDateSplit(dateStr: string): { day: string; month: string; year: string } {
  try {
    const d = new Date(dateStr);
    return {
      day: String(d.getDate()),
      month: d.toLocaleString("en-GB", { month: "long" }).toUpperCase(),
      year: String(d.getFullYear()),
    };
  } catch {
    return { day: "", month: "", year: dateStr };
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts(12);

  return (
    <>
      <style>{`
        .blog-card { transition: transform 0.15s, box-shadow 0.15s; }
        .blog-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; }
      `}</style>

      <div className="max-w-6xl mx-auto px-5 py-10">

        {/* Standard page heading — same pattern as Exercises / Courses */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "#3D8B1F" }}>The Somerset Blog</h1>
          <p className="text-gray-500 mt-1">
            News, seasonal notes and exam tips from Sara and the team — straight from our notebook to yours.
          </p>
        </div>

        {/* Cards */}
        <div>
          {posts.length === 0 ? (
            <p style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>No posts found. Check back soon.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 32 }}>
              {posts.map((post, i) => {
                const { day, month, year } = formatDateSplit(post.pubDate);
                return (
                  <a key={i} href={post.link} target="_blank" rel="noopener noreferrer"
                    style={{ textDecoration: "none", display: "block" }}>
                    <article className="blog-card" style={{
                      background: "#fff",
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}>
                      <div style={{ width: "100%", height: 220, backgroundColor: "#dce9d0", overflow: "hidden", flexShrink: 0 }}>
                        {post.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.image} alt={post.title} referrerPolicy="no-referrer"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#c8ddb8,#e0edd4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 40 }}>📖</span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#6b7280" }}>
                          <span style={{ fontWeight: 600, color: "#4a7a1e", lineHeight: 1.3 }}>
                            {day} {month}<br />{year}
                          </span>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#d1d5db", flexShrink: 0 }} />
                          <span>Somerset Language Centre</span>
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a2e1a", lineHeight: 1.3, margin: 0 }}>
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, flex: 1, margin: 0 }}>
                            {post.excerpt}
                          </p>
                        )}
                        <span style={{ fontSize: 13, color: "#57B82C", fontWeight: 600, marginTop: 4 }}>
                          Read more →
                        </span>
                      </div>
                    </article>
                  </a>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

