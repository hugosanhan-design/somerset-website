import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// Public route (middleware exception): the CBT engine autosaves an in-progress session
// here on every change. Students have no logins, so a session is identified by a short
// "resume code" the student is shown when they start. With that code they can pick the
// exam back up on ANY device — after a crash, a power cut, or from the student app on a
// different computer — which localStorage alone (same-browser only) could never do.
//
// seconds_left is stored as the time remaining at the last save, so a resume gives the
// student back the time that was left (the clock pauses during the outage) rather than
// counting down against a fixed wall-clock deadline. Rows are deleted on submit.

// Human-friendly code: 5 chars, no 0/O/1/I/L to avoid misreads when a student copies it.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function makeCode(): string {
  let c = ''
  for (let i = 0; i < 5; i++) c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return c
}

interface DraftBody {
  code?: string
  examId?: string
  studentName?: string
  paper?: string
  partIdx?: number
  answers?: Record<string, string>
  task2Choice?: number
  secondsLeft?: number
  extras?: unknown          // flags / notes / highlights — study aids, stored opaquely
  startedAt?: string
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json() as DraftBody
    if (!b.examId || !b.studentName?.trim() || !b.paper || !b.answers) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const answersJson = JSON.stringify(b.answers)
    if (b.studentName.length > 100 || answersJson.length > 200_000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 400 })
    }

    const name = b.studentName.trim().slice(0, 100)
    const partIdx = Math.max(0, Math.floor(b.partIdx ?? 0))
    const task2 = Math.floor(b.task2Choice ?? 2)
    const secs = Math.max(0, Math.floor(b.secondsLeft ?? 0))
    let extrasJson = '{}'
    try { extrasJson = JSON.stringify(b.extras ?? {}) } catch { extrasJson = '{}' }
    if (extrasJson.length > 400_000) extrasJson = '{}'   // guard runaway note/highlight payloads
    const db = await getDb()

    // Existing session → update in place (unless it was already submitted/removed).
    if (b.code) {
      const res = await db.prepare(
        `UPDATE cbt_drafts
           SET part_idx = ?, answers = ?, task2_choice = ?, seconds_left = ?, extras = ?, updated_at = now()::text
         WHERE code = ? AND submitted = 0`
      ).run(partIdx, answersJson, task2, secs, extrasJson, b.code.trim().toUpperCase())
      if (res.changes > 0) return NextResponse.json({ code: b.code.trim().toUpperCase() })
      // Code not found (server reset, typo, or already submitted) → fall through to mint a fresh one.
    }

    // New session → mint a unique code. Retry a couple of times on the (very unlikely) collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeCode()
      try {
        await db.prepare(
          `INSERT INTO cbt_drafts (code, exam_id, student_name, paper, part_idx, answers, task2_choice, seconds_left, extras, started_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(code, b.examId, name, b.paper, partIdx, answersJson, task2, secs, extrasJson, b.startedAt || null)
        return NextResponse.json({ code })
      } catch (e) {
        // Duplicate primary key → try another code; anything else → real error.
        if (attempt === 4) throw e
      }
    }
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  } catch (err) {
    console.error('[cbt/draft POST]', err)
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
    if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })

    const db = await getDb()
    const row = await db.prepare(
      `SELECT code, exam_id, student_name, paper, part_idx, answers, task2_choice, seconds_left, extras, started_at
         FROM cbt_drafts WHERE code = ? AND submitted = 0`
    ).get(code) as {
      code: string; exam_id: string; student_name: string; paper: string
      part_idx: number; answers: string; task2_choice: number; seconds_left: number; extras: string | null; started_at: string | null
    } | undefined

    if (!row) return NextResponse.json({ draft: null }, { status: 404 })

    let answers: Record<string, string> = {}
    try { answers = JSON.parse(row.answers) } catch { answers = {} }
    let extras: unknown = {}
    try { extras = JSON.parse(row.extras || '{}') } catch { extras = {} }

    return NextResponse.json({
      draft: {
        code: row.code,
        examId: row.exam_id,
        studentName: row.student_name,
        paper: row.paper,
        partIdx: row.part_idx,
        answers,
        task2Choice: row.task2_choice,
        secondsLeft: row.seconds_left,
        extras,
        startedAt: row.started_at,
      },
    })
  } catch (err) {
    console.error('[cbt/draft GET]', err)
    return NextResponse.json({ error: 'Could not load' }, { status: 500 })
  }
}

// Called after a successful submit so the finished paper can't be resumed. Best-effort.
export async function DELETE(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
    if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 })
    const db = await getDb()
    await db.prepare('DELETE FROM cbt_drafts WHERE code = ?').run(code)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cbt/draft DELETE]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
