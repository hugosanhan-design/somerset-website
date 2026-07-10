// Reading Lab — Daily Quizzical leveled-exercise prototype, served from embedded prototype HTML.
import { readingLabHtml } from "@/data/site-html";

export const dynamic = "force-static";

export async function GET() {
  return new Response(readingLabHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
