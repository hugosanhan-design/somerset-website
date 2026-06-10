export interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  excerpt: string;
  image: string | null;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export async function getBlogPosts(max = 10): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `https://somersetlanguagecentre.blogspot.com/feeds/posts/default?alt=rss&max-results=${max}`,
      { next: { revalidate: 3600 } }
    );
    const xml = await res.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    return items.map((item) => {
      const rawTitle = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim() ?? "";
      const title = decodeEntities(rawTitle);

      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";

      const rawContent = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1") ?? "";

      // Decode XML entities so we can parse actual HTML
      const decoded = decodeEntities(rawContent);

      // Extract first image src; upgrade http to https to avoid mixed-content blocks
      const imgMatch = decoded.match(/<img[^>]+src=["']([^"']+)["']/i);
      const rawImage = imgMatch?.[1] ?? null;
      const image = rawImage ? rawImage.replace(/^http:\/\//, "https://") : null;

      // Strip HTML to get plain text excerpt
      const excerpt = decoded
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&[a-z#0-9]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160).trim() + "…";

      return { title, link, pubDate, content: decoded, excerpt, image };
    });
  } catch {
    return [];
  }
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
