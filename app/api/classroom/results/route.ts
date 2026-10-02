import { NextRequest, NextResponse } from 'next/server'
import { requireGroupAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'
import { allExercises } from '@/lib/classroomExercises'

// Teacher view of what the children tapped on the iPad: one cell per student x exercise
// (correct / answered / items) and, per exercise, which items were hardest and which wrong
// answer was chosen most, so the class can correct together. Includes the answer key, so it
// is only served to a signed-in teacher who owns the group (requireGroupAccess).
export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('group') || ''
  const date = req.nextUrl.searchParams.get('date') || ''
  if (!groupId || !date || !(await requireGroupAccess(groupId))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const group = await db.prepare('SELECT name FROM groups WHERE id = ?').get(groupId) as { name: string } | undefined
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const students = await db.prepare('SELECT id, name FROM students WHERE group_id = ? ORDER BY name').all(groupId) as { id: string; name: string }[]
  const exercises = allExercises(group.name).filter(e => e.date === date)
  const rows = await db.prepare(
    'SELECT student_id, exercise_id, item_n, chosen, correct_key, is_correct FROM exercise_answers WHERE group_id = ? AND date = ?'
  ).all(groupId, date) as { student_id: string; exercise_id: string; item_n: number | string; chosen: string; correct_key: string; is_correct: number | string }[]

  const cells: Record<string, Record<string, { answered: number; correct: number; total: number }>> = {}
  const itemStats: Record<string, Record<string, { answered: number; correct: number; chosen: Record<string, number> }>> = {}
  for (const r of rows) {
    const ex = exercises.find(e => e.id === r.exercise_id)
    if (!ex) continue
    const c = ((cells[r.student_id] ||= {})[r.exercise_id] ||= { answered: 0, correct: 0, total: ex.items.length })
    c.answered++
    if (Number(r.is_correct) === 1) c.correct++
    const s = ((itemStats[r.exercise_id] ||= {})[String(r.item_n)] ||= { answered: 0, correct: 0, chosen: {} })
    s.answered++
    if (Number(r.is_correct) === 1) s.correct++
    s.chosen[r.chosen] = (s.chosen[r.chosen] || 0) + 1
  }

  return NextResponse.json({
    students,
    exercises: exercises.map(e => ({
      id: e.id, page: e.page, title: e.title, type: e.type,
      items: e.items.map(i => {
        const s = itemStats[e.id]?.[String(i.n)]
        const wrong = s ? Object.entries(s.chosen).filter(([k]) => k !== i.correct).sort((a, b) => b[1] - a[1])[0] : undefined
        return {
          n: i.n, q: i.q, correct: i.correct,
          correctText: i.options.find(o => o.key === i.correct)?.text || i.correct,
          answered: s?.answered || 0, right: s?.correct || 0,
          commonWrong: wrong ? { key: wrong[0], text: i.options.find(o => o.key === wrong[0])?.text || wrong[0], count: wrong[1] } : null,
        }
      }),
    })),
    cells,
  })
}
