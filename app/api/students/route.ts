import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb, newId } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const isAdmin = session.user.role === 'admin'
  const students = await db.prepare(`
    SELECT s.*,
      COUNT(e.id)::int as entry_count,
      MAX(e.date) as last_activity,
      ROUND(AVG(e.score), 0) as avg_score
    FROM students s
    LEFT JOIN work_entries e ON e.student_id = s.id
    ${isAdmin ? '' : 'WHERE s.group_id IN (SELECT id FROM groups WHERE teacher_id = ?)'}
    GROUP BY s.id
    ORDER BY s.name ASC
  `).all(...(isAdmin ? [] : [session.user.id]))
  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const body = await req.json()
  const { name, group_name, level, notes, enrolled_at } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const id = newId()
  await db.prepare(`
    INSERT INTO students (id, name, group_name, level, notes, enrolled_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), group_name || '', level || '', notes || '', enrolled_at || new Date().toISOString().slice(0, 10))

  const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(id)
  return NextResponse.json(student, { status: 201 })
}
