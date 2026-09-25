import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb, newId } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const entries = await db.prepare(`
    SELECT * FROM work_entries WHERE student_id = ? ORDER BY date DESC, created_at DESC
  `).all(params.id)
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const body = await req.json()
  const {
    type, title, date, score, ai_feedback, ai_error_patterns, image_filename, image_url, teacher_notes,
    by_skill, cefr_estimate, status
  } = body

  if (!type || !date) {
    return NextResponse.json({ error: 'type and date are required' }, { status: 400 })
  }

  const id = newId()
  await db.prepare(`
    INSERT INTO work_entries
      (id, student_id, type, title, date, score, ai_feedback, ai_error_patterns, image_filename, image_url, teacher_notes, by_skill, cefr_estimate, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, params.id, type, title || '', date,
    score ?? null,
    ai_feedback || '',
    JSON.stringify(ai_error_patterns || []),
    image_filename || '',
    image_url || '',
    teacher_notes || '',
    by_skill ? JSON.stringify(by_skill) : null,
    cefr_estimate || '',
    status || 'corrected'
  )

  const entry = await db.prepare('SELECT * FROM work_entries WHERE id = ?').get(id)
  return NextResponse.json(entry, { status: 201 })
}
