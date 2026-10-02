import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb, newId } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const groupId = new URL(req.url).searchParams.get('group_id')

  const packs = groupId
    ? await db.prepare(`
        SELECT cp.*, g.name as group_name
        FROM catchup_packs cp LEFT JOIN groups g ON g.id = cp.group_id
        WHERE cp.group_id = ?
        ORDER BY cp.date DESC, cp.created_at DESC
      `).all(groupId)
    : await db.prepare(`
        SELECT cp.*, g.name as group_name
        FROM catchup_packs cp LEFT JOIN groups g ON g.id = cp.group_id
        ORDER BY cp.date DESC, cp.created_at DESC
        LIMIT 60
      `).all()

  return NextResponse.json(packs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as Record<string, string>
  const { group_id, date, unit_title, writing_prompt, cbt_paper, cbt_exam_id, reading_url, reading_label, note } = body

  if (!group_id?.trim() || !date?.trim() || !unit_title?.trim()) {
    return NextResponse.json({ error: 'group_id, date, and unit_title are required' }, { status: 400 })
  }

  const db = await getDb()
  const id = newId()

  await db.prepare(`
    INSERT INTO catchup_packs
      (id, group_id, date, unit_title, writing_prompt, cbt_paper, cbt_exam_id, reading_url, reading_label, note, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, group_id, date, unit_title.trim(),
    writing_prompt || '', cbt_paper || '', cbt_exam_id || '',
    reading_url || '', reading_label || '',
    note || '', session.user.id,
  )

  const pack = await db.prepare(`
    SELECT cp.*, g.name as group_name
    FROM catchup_packs cp LEFT JOIN groups g ON g.id = cp.group_id
    WHERE cp.id = ?
  `).get(id)

  return NextResponse.json(pack, { status: 201 })
}
