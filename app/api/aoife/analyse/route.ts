import { NextRequest, NextResponse } from 'next/server'
import { lookupStudent } from '@/lib/studentAccess'
import { spineDay } from '@/lib/aoifeContent'
import { errorProfile, normaliseKey, getThread } from '@/lib/aoifeStore'
import { analyseReply } from '@/lib/aoifeTutor'

export const runtime = 'nodejs'
export const maxDuration = 60

// PUBLIC (middleware allow-list). Step 2: she has CONFIRMED her transcript. Gently find
// a few real mistakes and build a micro-drill from her main one. Nothing is stored yet
// (that happens at /save, after she rewrites).

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
    text?: string
    question?: string
  }
  const area = lookupStudent(String(body.name || ''), String(body.code || ''))
  if (!area) {
    return NextResponse.json({ error: 'Please sign in first with your name and code.' }, { status: 401, headers: CORS })
  }
  const text = String(body.text || '').trim()
  const question = String(body.question || '').trim()
  if (!text) return NextResponse.json({ error: 'Nothing to look at yet — say your answer first.' }, { status: 400, headers: CORS })

  const key = normaliseKey(String(body.name || ''))
  const day = Number(body.day) || (await getThread(key)).day
  const spine = spineDay(day)

  try {
    const profile = await errorProfile(key)
    const analysis = await analyseReply({
      text,
      question: question || spine.seedQuestions[0]?.q || '',
      targetGrammar: spine.grammar,
      errorProfile: profile,
    })
    return NextResponse.json(analysis, { headers: CORS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Something went wrong looking at your answer.'
    return NextResponse.json({ error: msg }, { status: 502, headers: CORS })
  }
}
