import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10)

  const group = await db.prepare(`
    SELECT g.*,
      c.name as curriculum_name,
      u.title as current_unit_title,
      u.order_index as current_unit_order,
      (SELECT COUNT(*)::int FROM curriculum_units WHERE curriculum_id = g.curriculum_id) as total_units
    FROM groups g
    LEFT JOIN curricula c ON c.id = g.curriculum_id
    LEFT JOIN curriculum_units u ON u.id = g.current_unit_id
    WHERE g.id = ?
  `).get(params.id) as Record<string, unknown> | undefined

  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (session.user.role !== 'admin' && group.teacher_id !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const units = group.curriculum_id
    ? await db.prepare('SELECT * FROM curriculum_units WHERE curriculum_id = ? ORDER BY order_index ASC').all(group.curriculum_id)
    : []

  const students = await db.prepare(`
    SELECT s.*,
      COUNT(e.id)::int as entry_count,
      MAX(e.date) as last_activity,
      ROUND(AVG(e.score), 0) as avg_score,
      a.present as present
    FROM students s
    LEFT JOIN work_entries e ON e.student_id = s.id
    LEFT JOIN attendance a ON a.student_id = s.id AND a.group_id = ? AND a.date = ?
    WHERE s.group_id = ?
    GROUP BY s.id, a.present
    ORDER BY s.name ASC
  `).all(params.id, date, params.id)

  return NextResponse.json({ ...group, date, units, students })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const body = await req.json()
  const existing = await db.prepare('SELECT * FROM groups WHERE id = ?').get(params.id) as Record<string, unknown> | undefined
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (session.user.role !== 'admin' && existing.teacher_id !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const name = body.name ?? existing.name
  const level = body.level ?? existing.level
  const curriculum_id = body.curriculum_id !== undefined ? body.curriculum_id : existing.curriculum_id
  const current_unit_id = body.current_unit_id !== undefined ? body.current_unit_id : existing.current_unit_id
  // Only an admin may reassign which teacher owns a group.
  const teacher_id = session.user.role === 'admin' && body.teacher_id !== undefined ? body.teacher_id : existing.teacher_id

  await db.prepare(`
    UPDATE groups SET name=?, level=?, curriculum_id=?, current_unit_id=?, teacher_id=?
    WHERE id=?
  `).run(name, level, curriculum_id, current_unit_id, teacher_id, params.id)

  const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(params.id)
  return NextResponse.json(group)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const existing = await db.prepare('SELECT teacher_id FROM groups WHERE id = ?').get(params.id) as { teacher_id: string | null } | undefined
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (session.user.role !== 'admin' && existing.teacher_id !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.prepare('UPDATE students SET group_id = NULL WHERE group_id = ?').run(params.id)
  await db.prepare('DELETE FROM groups WHERE id = ?').run(params.id)
  return NextResponse.json({ ok: true })
}
