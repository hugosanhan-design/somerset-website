// A scanned document can have several pages. `image_urls` (JSON array) holds them all
// in page order; `image_url` is always page 1 so older code that only knows the single
// field keeps working. Use these helpers instead of reading either column directly.

export function parseImageUrls(entry: { image_url?: string | null; image_urls?: string | null }): string[] {
  let urls: string[] = []
  try {
    const parsed = JSON.parse(entry.image_urls || '[]')
    if (Array.isArray(parsed)) urls = parsed.filter((u): u is string => typeof u === 'string' && !!u)
  } catch { /* fall through to the legacy single field */ }
  if (urls.length === 0 && entry.image_url) urls = [entry.image_url]
  return urls
}

export function serialiseImageUrls(urls: string[]): { image_url: string; image_urls: string } {
  return { image_url: urls[0] || '', image_urls: JSON.stringify(urls) }
}
