import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'
import { parseImageUrls, serialiseImageUrls } from '@/lib/workImages'

// Adds more pages to a scan that is already saved (status='pending' only), so
// "carry on scanning the same document" works even after the teacher has hit Save.
async function handle(req: NextRequest) {
  const { entryId, imageUrls } = await req.json() as { entryId?: string; imageUrls?: string[] }
  if (!entryId || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return NextResponse.json({ error: 'entryId and imageUrls are required' }, { status: 400 })
  }

  const db = await getDb()
  const entry = await db.prepare('SELECT * FROM work_entries WHERE id = ?').get(entryId) as
    { id: string; student_id: string; status: string; image_url: string; image_urls: string } | undefined
  if (!entry || !(await requireStudentAccess(entry.student_id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (entry.status !== 'pending') return NextResponse.json({ error: 'Already corrected' }, { status: 409 })

  const all = [...parseImageUrls(entry), ...imageUrls.filter(u => typeof u === 'string' && u)]
  const { image_url, image_urls } = serialiseImageUrls(all)
  await db.prepare('UPDATE work_entries SET image_url = ?, image_urls = ? WHERE id = ?').run(image_url, image_urls, entryId)
  return NextResponse.json({ ok: true, pages: all.length })
}

// Surface the real error text instead of a bare 500, so a failure on the phone or in the
// queue says what broke (and shows in the Vercel function log).
export async function POST(req: NextRequest) {
  try {
    return await handle(req)
  } catch (err) {
    console.error('work-entries/append failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
