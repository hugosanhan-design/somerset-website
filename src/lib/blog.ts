export interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  excerpt: string;
  image: string | null;
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
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim() ?? "";
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
      const rawContent = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1") ?? "";

      // Extract first image src from HTML content
      const imgMatch = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      const image = imgMatch?.[1] ?? null;

      const excerpt = rawContent.replace(/<[^>]+>/g, "").slice(0, 200).trim() + "…";

      return { title, link, pubDate, content: rawContent, excerpt, image };
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
