import { NextResponse } from 'next/server'

// Always runs fresh on the server (never cached), so it reports whatever
// build is actually live right now — used by <UpdateBanner> to detect a
// newer deploy than the one the browser currently has loaded.
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    buildId: process.env.VERCEL_GIT_COMMIT_SHA || String(process.env.NEXT_PUBLIC_BUILD_ID || 'dev'),
  })
}
