// Daily Quizzical hub — tile grid of all pieces, served from embedded prototype HTML.
import { dailyQuizzicalHubHtml } from "@/data/site-html";

export const dynamic = "force-static";

export async function GET() {
  return new Response(dailyQuizzicalHubHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
