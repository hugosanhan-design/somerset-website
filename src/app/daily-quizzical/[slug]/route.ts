// Individual Daily Quizzical pieces, served from embedded prototype HTML.
import { dailyQuizzicalPages } from "@/data/site-html";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(dailyQuizzicalPages).map((slug) => ({ slug }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const html = dailyQuizzicalPages[slug];
  if (!html) return new Response("Not found", { status: 404 });
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
