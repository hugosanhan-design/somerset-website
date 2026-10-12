import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { sanitiseProgress } from '@/lib/courses/progress'

export const runtime = 'nodejs'

// Teacher only (session required). Everything the Monday Young Adults digital week
// has saved: scores per exercise, active days and the free writing.
const COURSE = 'monday-young-adults'
const ALLOWED = new Set(['monday-young-adults', 'sound-tech-english'])

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  const asked = new URL(req.url).searchParams.get('course') || COURSE
  const course = ALLOWED.has(asked) ? asked : COURSE
  const db = await getDb()
  const rows = (await db.prepare('SELECT student_key, data, updated_at FROM course_progress WHERE course = ? ORDER BY student_key').all(course)) as
    { student_key: string; data: string; updated_at: string }[]
  const students = rows.map(r => {
    let p = sanitiseProgress(null)
    try { p = sanitiseProgress(JSON.parse(r.data)) } catch { /* skip corrupt */ }
    return { student: r.student_key, updatedAt: r.updated_at, days: p.days, lessons: p.lessons, writing: p.writing ?? {}, mistakes: p.mistakes ?? {} }
  })
  return NextResponse.json({ students })
}
