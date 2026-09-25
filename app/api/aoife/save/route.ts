import { NextRequest, NextResponse } from 'next/server'
import { lookupStudent } from '@/lib/studentAccess'
import { normaliseKey, getThread, saveTurn } from '@/lib/aoifeStore'
import { summarise, checkRewrite } from '@/lib/aoifeTutor'

export const runtime = 'nodejs'
export const maxDuration = 60

// PUBLIC (middleware allow-list). Step 3: she has rewritten her reply. Save the turn,
// roll the story summary forward, advance the day. Nothing is scored; the rewrite is
// never gated. The next day's message (composed at /next) will react to what she said.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    name?: string
    code?: string
    day?: number
    question?: string
    transcript?: string
    rewrite?: string
    errorTypes?: string[]
    errorFixes?: string[]
  }
  const area = lookupStudent(String(body.name || ''), String(body.code || ''))
  if (!area) {
    return NextResponse.json({ error: 'Please sign in first with your name and code.' }, { status: 401, headers: CORS })
  }

  const key = normaliseKey(String(body.name || ''))
  const thread = await getThread(key)
  const day = Number(body.day) || thread.day
  const question = String(body.question || '')
  const transcript = String(body.transcript || '')
  const rewrite = String(body.rewrite || transcript)
  const errorTypes = Array.isArray(body.errorTypes) ? body.errorTypes.filter((x) => typeof x === 'string') : []

  try {
    // Aoife reacts to the rewrite (the rewrite-check pass), and we roll the story
    // summary forward. Run both together to keep it snappy.
    const fixes = Array.isArray(body.errorFixes) ? body.errorFixes.filter((x) => typeof x === 'string') : []
    const [check, newSummary] = await Promise.all([
      checkRewrite({ original: transcript, rewrite, errors: fixes.map((f) => ({ fix: f })), question }),
      summarise({ oldSummary: thread.story_summary, day, question, reply: rewrite }),
    ])
    const result = await saveTurn({ key, day: thread.day, question, transcript, rewrite, errorTypes, newSummary })
    return NextResponse.json({ ok: true, ...result, reaction: check.reaction }, { headers: CORS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Something went wrong saving your day.'
    return NextResponse.json({ error: msg }, { status: 502, headers: CORS })
  }
}
