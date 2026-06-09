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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .blog-root { font-family: 'Poppins', sans-serif; background: #f0f4ec; min-height: 60vh; }
        .blog-card { transition: transform 0.15s, box-shadow 0.15s; }
        .blog-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; }
      `}</style>

      <div className="blog-root">

        {/* Hero */}
        <div style={{
          background: "linear-gradient(135deg, #dce9d0 0%, #e8f0e0 60%, #f0f4ec 100%)",
          padding: "80px 48px 72px",
          textAlign: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#6BAE2E", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "#4a7a1e", textTransform: "uppercase" as const }}>
              From the Centre
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 700, color: "#1a2e1a", lineHeight: 1.1, marginBottom: 20, fontFamily: "'Poppins', sans-serif" }}>
            The Somerset <span style={{ color: "#6BAE2E" }}>Blog</span>
          </h1>
          <p style={{ fontSize: 18, color: "#4b6040", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            News, seasonal notes and exam tips from Sara and the team —{" "}
            straight from our notebook to yours.
          </p>
        </div>

        {/* Cards */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 32px 80px" }}>
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
                        <span style={{ fontSize: 13, color: "#6BAE2E", fontWeight: 600, marginTop: 4 }}>
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
