import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(params.id)
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(student)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const body = await req.json()
  const { name, group_name, level, notes, enrolled_at, parent_email } = body

  await db.prepare(`
    UPDATE students SET name=?, group_name=?, level=?, notes=?, enrolled_at=?, parent_email=?
    WHERE id=?
  `).run(name, group_name || '', level || '', notes || '', enrolled_at || '', parent_email || '', params.id)

  const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(params.id)
  return NextResponse.json(student)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  await db.prepare('DELETE FROM students WHERE id = ?').run(params.id)
  return NextResponse.json({ ok: true })
}
