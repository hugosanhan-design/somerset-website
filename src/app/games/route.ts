// Somerset Games hub — standalone page served from the embedded prototype HTML.
import { gamesHubHtml } from "@/data/site-html";

export const dynamic = "force-static";

export async function GET() {
  return new Response(gamesHubHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
