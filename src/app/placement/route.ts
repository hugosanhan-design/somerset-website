// Serves the progressive placement test (v2) as a standalone page.
// The HTML is the canonical prototype, embedded at build time — see src/data/site-html.ts.
// It replaced the old 6-question PlacementTest component on 2026-07-09.
import { placementHtml } from "@/data/site-html";

export const dynamic = "force-static";

export async function GET() {
  return new Response(placementHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
