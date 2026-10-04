import { NextRequest, NextResponse } from 'next/server'
import { lookupStudent } from '@/lib/studentAccess'
import { getDb } from '@/lib/db'
import { emptyProgress, mergeProgress, sanitiseProgress } from '@/lib/courses/progress'

export const runtime = 'nodejs'

// PUBLIC (api/courses is on the middleware allow-list). Name + code are verified on every
// call, and a student can only ever read or write their own row.
// Body: { name, code, course, data? }. Without `data` it loads; with `data` it merges and saves.
// Always returns the merged copy, so a stale device can never wipe newer progress.

const COURSES = new Set(['b1-unit-1'])
const MAX_BYTES = 200_000

function studentKey(name: string) {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; code?: string; course?: string; data?: unknown }
  const name = String(body.name || '')
  const course = String(body.course || '')
  if (!lookupStudent(name, String(body.code || ''))) {
    return NextResponse.json({ error: 'Please sign in at Student’s Corner first.' }, { status: 401 })
  }
  if (!COURSES.has(course)) return NextResponse.json({ error: 'Unknown course.' }, { status: 400 })

  const key = studentKey(name)
  const db = await getDb()
  const row = (await db.prepare('SELECT data FROM course_progress WHERE student_key = ? AND course = ?').get(key, course)) as { data: string } | undefined
  let stored = emptyProgress()
  try { if (row) stored = sanitiseProgress(JSON.parse(row.data)) } catch { /* corrupt row: start clean */ }

  if (body.data === undefined) return NextResponse.json({ data: stored })

  const merged = mergeProgress(stored, sanitiseProgress(body.data))
  const json = JSON.stringify(merged)
  if (json.length > MAX_BYTES) return NextResponse.json({ error: 'Progress too large.' }, { status: 413 })
  await db.prepare(
    `INSERT INTO course_progress (student_key, course, data, updated_at) VALUES (?, ?, ?, now()::text)
     ON CONFLICT (student_key, course) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  ).run(key, course, json)
  return NextResponse.json({ data: merged })
}
