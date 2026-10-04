import { NextRequest, NextResponse } from 'next/server'
import { lookupStudent } from '@/lib/studentAccess'
import { getDb } from '@/lib/db'

export const runtime = 'nodejs'

// PUBLIC (api/courses allow-list), but only for signed-in Student's Corner students.
// Swaps our Azure key for a 10-minute token so the browser can stream the microphone
// straight to Azure: the key never leaves the server and audio never passes through Vercel.
//
// Azure has no hard spending cap, so this route is the cap: each token = one recording
// session (the client stops at 90 s). Limits per student per day and for the whole app
// per month; both can be changed with env vars without a code change.
const PER_STUDENT_PER_DAY = Number(process.env.SPEECH_SESSIONS_PER_STUDENT_DAY) || 20
const PER_MONTH = Number(process.env.SPEECH_SESSIONS_PER_MONTH) || 1500

function studentKey(name: string) {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export async function POST(req: NextRequest) {
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION
  if (!key || !region) return NextResponse.json({ error: 'Speaking practice is not switched on yet.' }, { status: 503 })

  const body = (await req.json().catch(() => ({}))) as { name?: string; code?: string }
  const name = String(body.name || '')
  if (!lookupStudent(name, String(body.code || ''))) {
    return NextResponse.json({ error: 'Sign in at Student’s Corner to record your answer.' }, { status: 401 })
  }

  const who = studentKey(name)
  const today = new Date().toISOString().slice(0, 10)
  const db = await getDb()
  const mine = (await db.prepare('SELECT sessions FROM speech_usage WHERE day = ? AND student_key = ?').get(today, who)) as { sessions: number } | undefined
  if ((mine?.sessions ?? 0) >= PER_STUDENT_PER_DAY) {
    return NextResponse.json({ error: 'That’s plenty of speaking for today. Come back tomorrow!' }, { status: 429 })
  }
  const month = (await db.prepare('SELECT COALESCE(SUM(sessions), 0)::int AS n FROM speech_usage WHERE day LIKE ?').get(today.slice(0, 7) + '%')) as { n: number }
  if (month.n >= PER_MONTH) {
    return NextResponse.json({ error: 'Speaking practice is paused for the rest of the month. Your teacher knows.' }, { status: 429 })
  }

  const r = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Length': '0' },
  })
  if (!r.ok) {
    console.error('[speech-token] Azure refused the key', r.status)
    return NextResponse.json({ error: 'Speaking practice is unavailable right now. Try again later.' }, { status: 502 })
  }
  const token = await r.text()

  await db.prepare(
    `INSERT INTO speech_usage (day, student_key, sessions) VALUES (?, ?, 1)
     ON CONFLICT (day, student_key) DO UPDATE SET sessions = speech_usage.sessions + 1`
  ).run(today, who)

  return NextResponse.json({ token, region })
}
