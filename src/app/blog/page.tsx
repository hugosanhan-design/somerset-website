import { getBlogPosts, formatDate } from "@/lib/blog";
import Link from "next/link";

export const metadata = { title: "Blog — Somerset Language Centre" };

export default async function BlogPage() {
  const posts = await getBlogPosts(12);

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      {/* Green header bar */}
      <div className="rounded-xl text-white px-8 py-6 mb-10" style={{ backgroundColor: "#6BAE2E" }}>
        <h1 className="text-3xl font-bold">Sara's Blog</h1>
        <p className="opacity-90 mt-1">Cultural notes, grammar tips and English curiosities from Sara Hancock</p>
      </div>

      {posts.length === 0 && (
        <p className="text-gray-500 text-center py-12">No posts found. Please check back soon.</p>
      )}

      <div className="space-y-6">
        {posts.map((post, i) => (
          <article key={i} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{formatDate(post.pubDate)}</p>
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
            <a href={post.link} target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold border-2 rounded px-4 py-2 inline-block transition-colors hover:text-white"
              style={{ borderColor: "#6BAE2E", color: "#4d8520" }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#6BAE2E"; (e.currentTarget as HTMLElement).style.color = "white"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#4d8520"; }}>
              Read on Blogger ↗
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
