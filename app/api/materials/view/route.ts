import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Proxies an HTML lesson material (slides, review plays) from Vercel Blob so
// it opens inline in a new tab instead of downloading.
//
// Why this exists: Vercel Blob always serves stored files with
// `Content-Disposition: attachment` when it can't guarantee the content is
// safe to render on its own origin (this is hard-coded in the platform, not
// something `put()` can override — see the "no contentDisposition option"
// note in scripts/migrate-materials.mjs). For audio, images and PDFs the
// browser still renders them fine even as an "attachment" open; for our
// interactive HTML slides/plays (Answers_VISTA.html, review play scripts)
// the browser instead prompts to save the file. Fetching the file ourselves
// and re-serving it from our own domain lets us send Content-Disposition:
// inline and skip Blob's own CSP, so the page's buttons/JS actually work.
//
// Only ever proxies our own Blob store (checked against BLOB_READ_WRITE_TOKEN's
// store host, derived from any already-known blob URL pattern) to avoid this
// becoming an open fetch-anything proxy.
const ALLOWED_HOST_SUFFIX = '.public.blob.vercel-storage.com'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const src = req.nextUrl.searchParams.get('src')
  if (!src) return NextResponse.json({ error: 'src is required' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(src)
  } catch {
    return NextResponse.json({ error: 'invalid src' }, { status: 400 })
  }
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith(ALLOWED_HOST_SUFFIX)) {
    return NextResponse.json({ error: 'src must be a Vercel Blob URL' }, { status: 400 })
  }

  const upstream = await fetch(parsed.toString())
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'material not found' }, { status: 404 })
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'text/html; charset=utf-8',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, max-age=300',
    },
  })
}
