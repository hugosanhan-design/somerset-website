import { NextRequest, NextResponse } from 'next/server'
import { lookupStudent } from '@/lib/studentAccess'

export const runtime = 'nodejs'

// Public (added to the middleware allow-list). Verifies a student's name + code and
// returns ONLY that student's content manifest. Wrong name/code returns a generic
// failure so codes can't be probed by the difference in responses.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; code?: string }
  const name = (body.name || '').toString()
  const code = (body.code || '').toString()
  if (!name.trim() || !code.trim()) {
    return NextResponse.json({ ok: false, error: 'Enter your name and your code.' }, { status: 400 })
  }
  const area = lookupStudent(name, code)
  if (!area) {
    return NextResponse.json({ ok: false, error: "That name and code don't match. Check with your teacher." }, { status: 200 })
  }
  return NextResponse.json({ ok: true, area })
}
