import { NextRequest, NextResponse } from 'next/server'
import { requireGroupAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'
import { setsForGroupName, allExercises, forChild } from '@/lib/classroomExercises'

// Everything the iPad "Student input" screen needs for one group:
// the roster, the dates that have tap-to-answer exercises, the exercises for the chosen
// date (WITHOUT the correct answers) and who has already answered what.
// Optional ?student=<id> also returns that child's saved answers, so re-opening an exercise
// shows what they tapped before.
export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('group') || ''
  const date = req.nextUrl.searchParams.get('date') || ''
  const studentId = req.nextUrl.searchParams.get('student') || ''
  if (!groupId || !(await requireGroupAccess(groupId))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const group = await db.prepare('SELECT id, name FROM groups WHERE id = ?').get(groupId) as { id: string; name: string } | undefined
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const students = await db.prepare('SELECT id, name FROM students WHERE group_id = ? ORDER BY name').all(groupId) as { id: string; name: string }[]
  const all = allExercises(group.name)
  const dates = Array.from(new Set(all.map(e => e.date))).sort()
  const exercises = date ? all.filter(e => e.date === date).map(forChild) : []

  const done: Record<string, Record<string, number>> = {}
  if (date) {
    const rows = await db.prepare(
      'SELECT student_id, exercise_id, COUNT(*) AS n FROM exercise_answers WHERE group_id = ? AND date = ? GROUP BY student_id, exercise_id'
    ).all(groupId, date) as { student_id: string; exercise_id: string; n: number | string }[]
    for (const r of rows) (done[r.student_id] ||= {})[r.exercise_id] = Number(r.n)
  }

  let mine: Record<string, Record<string, string>> | undefined
  if (date && studentId) {
    const rows = await db.prepare(
      'SELECT exercise_id, item_n, chosen FROM exercise_answers WHERE group_id = ? AND date = ? AND student_id = ?'
    ).all(groupId, date, studentId) as { exercise_id: string; item_n: number | string; chosen: string }[]
    mine = {}
    for (const r of rows) (mine[r.exercise_id] ||= {})[String(r.item_n)] = r.chosen
  }

  return NextResponse.json({
    group: { id: group.id, name: group.name },
    hasExercises: setsForGroupName(group.name).length > 0,
    students, dates, exercises, done, mine,
  })
}
