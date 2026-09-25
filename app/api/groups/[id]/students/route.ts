import { NextRequest, NextResponse } from 'next/server'
import { requireGroupAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'

// Assigns an existing student to this group (a student can only be in one group at a time).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireGroupAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const { student_id } = await req.json()
  if (!student_id) return NextResponse.json({ error: 'student_id is required' }, { status: 400 })

  await db.prepare('UPDATE students SET group_id = ? WHERE id = ?').run(params.id, student_id)
  const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(student_id)
  return NextResponse.json(student)
}
