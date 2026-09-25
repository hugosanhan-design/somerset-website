import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb, newId } from '@/lib/db'
import { uploadWorkImage } from '@/lib/blob'

// Fast phone-side capture: pick student + type, snap a photo, submit. No AI call
// here on purpose — that happens later at the laptop, in the correction queue,
// so a teacher isn't stood in a classroom waiting on a vision-model round trip.
// Saved as status='pending'.
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const studentId = formData.get('studentId') as string | null
  const type = (formData.get('type') as string) || 'class_exercise'
  const title = (formData.get('title') as string) || ''
  const date = (formData.get('date') as string) || new Date().toISOString().slice(0, 10)
  const imageFile = formData.get('image') as File | null

  if (!studentId) return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
  if (!(await requireStudentAccess(studentId))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!imageFile) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  const imageUrl = await uploadWorkImage(imageFile)

  const db = await getDb()
  const id = newId()
  await db.prepare(`
    INSERT INTO work_entries
      (id, student_id, type, title, date, score, ai_feedback, ai_error_patterns, image_filename, image_url, status)
    VALUES (?, ?, ?, ?, ?, NULL, '', '[]', '', ?, 'pending')
  `).run(id, studentId, type, title, date, imageUrl)

  const entry = await db.prepare('SELECT * FROM work_entries WHERE id = ?').get(id)
  return NextResponse.json(entry, { status: 201 })
}
