// Individual Somerset Games (grammar-sprint, punctuation-repair, vocab-match,
// irregular-verb-dash) served from embedded prototype HTML.
import { gamePages } from "@/data/site-html";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(gamePages).map((slug) => ({ slug }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const html = gamePages[slug];
  if (!html) return new Response("Not found", { status: 404 });
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
