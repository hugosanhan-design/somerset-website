import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  const row = await db.prepare('SELECT a.*, g.name AS group_name FROM assessments a LEFT JOIN groups g ON g.id = a.group_id WHERE a.id = ?').get(params.id)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

// Edit the transcribed key and confirm it. Editing the key text un-confirms it unless
// `key_confirmed: true` is sent in the same request, so a changed key is always re-checked.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json() as { key_text?: string; key_confirmed?: boolean; title?: string }
  const db = await getDb()
  const sets: string[] = [], vals: unknown[] = []
  if (body.key_text !== undefined) { sets.push('key_text = ?'); vals.push(body.key_text) }
  if (body.key_confirmed !== undefined) { sets.push('key_confirmed = ?'); vals.push(body.key_confirmed ? 1 : 0) }
  else if (body.key_text !== undefined) { sets.push('key_confirmed = 0') }
  if (body.title !== undefined) { sets.push('title = ?'); vals.push(body.title) }
  if (sets.length) await db.prepare(`UPDATE assessments SET ${sets.join(', ')} WHERE id = ?`).run(...vals, params.id)
  return NextResponse.json(await db.prepare('SELECT * FROM assessments WHERE id = ?').get(params.id))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = await getDb()
  await db.prepare('UPDATE work_entries SET assessment_id = NULL WHERE assessment_id = ?').run(params.id)
  await db.prepare('DELETE FROM assessments WHERE id = ?').run(params.id)
  return NextResponse.json({ ok: true })
}
