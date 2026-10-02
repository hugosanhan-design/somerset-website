import { NextRequest, NextResponse } from 'next/server'
import { requireGroupAccess } from '@/lib/authz'
import { getDb, newId } from '@/lib/db'
import { findExercise } from '@/lib/classroomExercises'

// A child taps their answers on the iPad; the server marks them against the answer key
// (which never leaves the server) and stores one row per item. Sending the same exercise
// again by the same child overwrites their earlier answers (last submission wins).
// The response says only how many answers were saved: the child is never told right/wrong.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    groupId?: string; date?: string; studentId?: string; exerciseId?: string; answers?: Record<string, string>
  } | null
  const { groupId, date, studentId, exerciseId, answers } = body || {}
  if (!groupId || !date || !studentId || !exerciseId || !answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'groupId, date, studentId, exerciseId and answers are required' }, { status: 400 })
  }
  if (!(await requireGroupAccess(groupId))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const group = await db.prepare('SELECT name FROM groups WHERE id = ?').get(groupId) as { name: string } | undefined
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const student = await db.prepare('SELECT id FROM students WHERE id = ? AND group_id = ?').get(studentId, groupId)
  if (!student) return NextResponse.json({ error: 'Student is not in this group' }, { status: 400 })

  const ex = findExercise(group.name, exerciseId, date)
  if (!ex) return NextResponse.json({ error: 'Unknown exercise for that date' }, { status: 400 })

  const values: unknown[] = []
  const rows: string[] = []
  for (const item of ex.items) {
    const chosen = answers[String(item.n)]
    if (chosen === undefined || chosen === null || chosen === '') continue
    if (!item.options.some(o => o.key === chosen)) continue // ignore anything that is not a real option
    values.push(newId(), groupId, studentId, date, exerciseId, item.n, chosen, item.correct, chosen === item.correct ? 1 : 0)
    rows.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)')
  }
  if (rows.length === 0) return NextResponse.json({ error: 'No valid answers' }, { status: 400 })

  await db.prepare(`
    INSERT INTO exercise_answers (id, group_id, student_id, date, exercise_id, item_n, chosen, correct_key, is_correct)
    VALUES ${rows.join(', ')}
    ON CONFLICT (student_id, date, exercise_id, item_n)
    DO UPDATE SET chosen = excluded.chosen, correct_key = excluded.correct_key, is_correct = excluded.is_correct, updated_at = now()::text
  `).run(...values)

  return NextResponse.json({ ok: true, saved: rows.length })
}
