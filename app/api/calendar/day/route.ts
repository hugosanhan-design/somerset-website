import { NextRequest, NextResponse } from 'next/server'
import { requireGroupAccess } from '@/lib/authz'
import { getDb, newId } from '@/lib/db'

// Manually mark a lesson ready/not-ready for one group on one date. This is the
// replacement for the old local Portal's automatic disk-scan readiness check, which
// can't run from a hosted app (see lib/db.ts's comment on lesson_log).
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { groupId, date, status, note } = body as { groupId: string; date: string; status: string; note?: string }

  if (!groupId || !date || !status) {
    return NextResponse.json({ error: 'groupId, date and status are required' }, { status: 400 })
  }
  if (!(await requireGroupAccess(groupId))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  await db.prepare(`
    INSERT INTO lesson_log (id, group_id, date, status, note, updated_at)
    VALUES (?, ?, ?, ?, ?, now()::text)
    ON CONFLICT (group_id, date) DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, updated_at = now()::text
  `).run(newId(), groupId, date, status, note || '')

  const row = await db.prepare('SELECT * FROM lesson_log WHERE group_id = ? AND date = ?').get(groupId, date)
  return NextResponse.json(row)
}
