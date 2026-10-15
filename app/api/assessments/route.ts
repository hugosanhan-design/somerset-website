import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireGroupAccess } from '@/lib/authz'
import { getDb, newId } from '@/lib/db'
import { uploadWorkImage } from '@/lib/blob'

export const dynamic = 'force-dynamic'

// Registered tests. GET ?groupId=&since=YYYY-MM-DD&until=YYYY-MM-DD lists a group's tests
// in a date window (the scanner uses it to suggest "today's test"); no filters lists all
// the caller can see. POST (multipart) registers a test: paper files + answer-key files.
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groupId = req.nextUrl.searchParams.get('groupId')
  const since = req.nextUrl.searchParams.get('since')
  const until = req.nextUrl.searchParams.get('until')
  const where: string[] = [], params: unknown[] = []
  if (groupId) { where.push('a.group_id = ?'); params.push(groupId) }
  if (since) { where.push('a.date >= ?'); params.push(since) }
  if (until) { where.push('a.date <= ?'); params.push(until) }
  if (session.user.role !== 'admin') { where.push('(g.teacher_id = ? OR g.teacher_id IS NULL)'); params.push(session.user.id) }

  const db = await getDb()
  const rows = await db.prepare(`
    SELECT a.*, g.name AS group_name FROM assessments a
    LEFT JOIN groups g ON g.id = a.group_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY a.date DESC, a.created_at DESC
  `).all(...params)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData()
    const groupId = (fd.get('groupId') as string) || ''
    const date = (fd.get('date') as string) || new Date().toISOString().slice(0, 10)
    const title = ((fd.get('title') as string) || '').trim()
    const testFiles = fd.getAll('test') as File[]
    const keyFiles = fd.getAll('key') as File[]
    if (!groupId || !title) return NextResponse.json({ error: 'Group and title are required' }, { status: 400 })
    if (!keyFiles.length) return NextResponse.json({ error: 'Add the answer key' }, { status: 400 })
    if (!(await requireGroupAccess(groupId))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const testUrls = await Promise.all(testFiles.map(f => uploadWorkImage(f)))
    const keyUrls = await Promise.all(keyFiles.map(f => uploadWorkImage(f)))

    const db = await getDb()
    const id = newId()
    await db.prepare(`
      INSERT INTO assessments (id, group_id, date, title, test_urls, key_urls)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, groupId, date, title, JSON.stringify(testUrls), JSON.stringify(keyUrls))
    return NextResponse.json(await db.prepare('SELECT * FROM assessments WHERE id = ?').get(id), { status: 201 })
  } catch (err) {
    console.error('assessments POST failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
