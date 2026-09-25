import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDb()
  const curriculum = await db.prepare('SELECT * FROM curricula WHERE id = ?').get(params.id)
  if (!curriculum) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const units = await db.prepare('SELECT * FROM curriculum_units WHERE curriculum_id = ? ORDER BY order_index ASC').all(params.id)
  return NextResponse.json({ ...curriculum, units })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDb()
  const existing = await db.prepare('SELECT * FROM curricula WHERE id = ?').get(params.id) as Record<string, unknown> | undefined
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json()
  const name = body.name ?? existing.name
  const level = body.level ?? existing.level
  await db.prepare('UPDATE curricula SET name=?, level=? WHERE id=?').run(name, level, params.id)
  const curriculum = await db.prepare('SELECT * FROM curricula WHERE id = ?').get(params.id)
  return NextResponse.json(curriculum)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDb()
  await db.prepare('DELETE FROM curricula WHERE id = ?').run(params.id)
  return NextResponse.json({ ok: true })
}
