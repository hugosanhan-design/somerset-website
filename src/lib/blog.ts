export interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  excerpt: string;
}

export async function getBlogPosts(max = 10): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `https://somersetlanguagecentre.blogspot.com/feeds/posts/default?alt=rss&max-results=${max}`,
      { next: { revalidate: 3600 } } // refresh every hour
    );
    const xml = await res.text();

    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    return items.map((item) => {
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim() ?? "";
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
      const rawContent = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1") ?? "";
      const content = rawContent;
      const excerpt = rawContent.replace(/<[^>]+>/g, "").slice(0, 200).trim() + "…";

      return { title, link, pubDate, content, excerpt };
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
