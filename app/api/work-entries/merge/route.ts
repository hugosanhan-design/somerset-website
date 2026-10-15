import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'
import { parseImageUrls, serialiseImageUrls } from '@/lib/workImages'

// Joins several pending scans of the SAME student into one multi-page entry — the
// fix for a document that was scanned as separate single-photo entries. Pages are
// ordered by when each scan was taken (oldest first); the earliest entry survives
// and the others are removed. Blob files are not touched, the survivor points at them.
async function handle(req: NextRequest) {
  const { entryIds } = await req.json() as { entryIds?: string[] }
  if (!Array.isArray(entryIds) || entryIds.length < 2) {
    return NextResponse.json({ error: 'Pick at least two scans to merge' }, { status: 400 })
  }

  const db = await getDb()
  const rows: { id: string; student_id: string; status: string; image_url: string; image_urls: string }[] = []
  for (const id of entryIds) {
    const r = await db.prepare('SELECT * FROM work_entries WHERE id = ?').get(id) as typeof rows[number] | undefined
    if (!r) return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    rows.push(r)
  }
  const studentId = rows[0].student_id
  if (rows.some(r => r.student_id !== studentId)) return NextResponse.json({ error: 'Scans belong to different students' }, { status: 400 })
  if (rows.some(r => r.status !== 'pending')) return NextResponse.json({ error: 'Only scans still waiting can be merged' }, { status: 409 })
  if (!(await requireStudentAccess(studentId))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const ordered = (await db.prepare(
    `SELECT * FROM work_entries WHERE id IN (${rows.map(() => '?').join(',')}) ORDER BY created_at ASC`
  ).all(...rows.map(r => r.id))) as typeof rows
  const [keep, ...rest] = ordered
  const pages = ordered.flatMap(parseImageUrls)
  const { image_url, image_urls } = serialiseImageUrls(pages)

  await db.prepare('UPDATE work_entries SET image_url = ?, image_urls = ? WHERE id = ?').run(image_url, image_urls, keep.id)
  for (const r of rest) await db.prepare('DELETE FROM work_entries WHERE id = ? AND student_id = ?').run(r.id, studentId)
  return NextResponse.json({ ok: true, id: keep.id, pages: pages.length })
}

// Surface the real error text instead of a bare 500, so a failure on the phone or in the
// queue says what broke (and shows in the Vercel function log).
export async function POST(req: NextRequest) {
  try {
    return await handle(req)
  } catch (err) {
    console.error('work-entries/merge failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
