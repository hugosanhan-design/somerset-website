import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb, newId } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const isAdmin = session.user.role === 'admin'
  const groups = await db.prepare(`
    SELECT g.*,
      c.name as curriculum_name,
      u.title as current_unit_title,
      u.order_index as current_unit_order,
      t.name as teacher_name,
      (SELECT COUNT(*)::int FROM curriculum_units WHERE curriculum_id = g.curriculum_id) as total_units,
      (SELECT COUNT(*)::int FROM students WHERE group_id = g.id) as student_count
    FROM groups g
    LEFT JOIN curricula c ON c.id = g.curriculum_id
    LEFT JOIN curriculum_units u ON u.id = g.current_unit_id
    LEFT JOIN teachers t ON t.id = g.teacher_id
    ${isAdmin ? '' : 'WHERE g.teacher_id = ?'}
    ORDER BY g.name ASC
  `).all(...(isAdmin ? [] : [session.user.id]))
  return NextResponse.json(groups)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const body = await req.json()
  const { name, level, curriculum_id } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const id = newId()
  await db.prepare(`
    INSERT INTO groups (id, name, level, curriculum_id, teacher_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name.trim(), level || '', curriculum_id || null, session.user.id)

  const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(id)
  return NextResponse.json(group, { status: 201 })
}
