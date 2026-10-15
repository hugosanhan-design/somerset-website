import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb, newId } from '@/lib/db'
import { uploadWorkImage } from '@/lib/blob'
import { serialiseImageUrls } from '@/lib/workImages'

// Fast phone-side capture: pick student + type, snap the pages, submit. No AI call
// here on purpose — that happens later at the laptop, in the correction queue,
// so a teacher isn't stood in a classroom waiting on a vision-model round trip.
// Saved as status='pending'.
//
// Two ways in:
//  - `imageUrls` (JSON array): pages already uploaded one by one via /page-upload.
//    This is what the scanner uses, so one document = one entry however many pages.
//  - `image` (single file): the original one-photo path, kept for older callers.
async function handle(req: NextRequest) {
  const formData = await req.formData()
  const studentId = formData.get('studentId') as string | null
  const type = (formData.get('type') as string) || 'class_exercise'
  const title = (formData.get('title') as string) || ''
  const date = (formData.get('date') as string) || new Date().toISOString().slice(0, 10)
  const imageFile = formData.get('image') as File | null
  const imageUrlsRaw = (formData.get('imageUrls') as string) || ''
  const assessmentId = (formData.get('assessmentId') as string) || null

  if (!studentId) return NextResponse.json({ error: 'studentId is required' }, { status: 400 })
  if (!(await requireStudentAccess(studentId))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let urls: string[] = []
  if (imageUrlsRaw) {
    try {
      const parsed = JSON.parse(imageUrlsRaw)
      if (Array.isArray(parsed)) urls = parsed.filter((u): u is string => typeof u === 'string' && !!u)
    } catch { /* handled below */ }
  } else if (imageFile) {
    urls = [await uploadWorkImage(imageFile)]
  }
  if (urls.length === 0) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  const { image_url, image_urls } = serialiseImageUrls(urls)
  const db = await getDb()
  const id = newId()
  await db.prepare(`
    INSERT INTO work_entries
      (id, student_id, type, title, date, score, ai_feedback, ai_error_patterns, image_filename, image_url, image_urls, assessment_id, status)
    VALUES (?, ?, ?, ?, ?, NULL, '', '[]', '', ?, ?, ?, 'pending')
  `).run(id, studentId, type, title, date, image_url, image_urls, assessmentId)

  const entry = await db.prepare('SELECT * FROM work_entries WHERE id = ?').get(id)
  return NextResponse.json(entry, { status: 201 })
}

// Surface the real error text instead of a bare 500, so a failure on the phone or in the
// queue says what broke (and shows in the Vercel function log).
export async function POST(req: NextRequest) {
  try {
    return await handle(req)
  } catch (err) {
    console.error('work-entries/quick failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
