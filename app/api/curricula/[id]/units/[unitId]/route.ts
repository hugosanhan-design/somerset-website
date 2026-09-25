import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string; unitId: string } }) {
  const db = await getDb()
  const existing = await db.prepare('SELECT * FROM curriculum_units WHERE id = ?').get(params.unitId) as Record<string, unknown> | undefined
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json()

  const title = body.title ?? existing.title
  const grammar_focus = body.grammar_focus ?? existing.grammar_focus
  const vocab_focus = body.vocab_focus ?? existing.vocab_focus
  const notes = body.notes ?? existing.notes
  const order_index = body.order_index ?? existing.order_index

  await db.prepare(`
    UPDATE curriculum_units SET title=?, grammar_focus=?, vocab_focus=?, notes=?, order_index=?
    WHERE id=?
  `).run(title, grammar_focus, vocab_focus, notes, order_index, params.unitId)

  const unit = await db.prepare('SELECT * FROM curriculum_units WHERE id = ?').get(params.unitId)
  return NextResponse.json(unit)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; unitId: string } }) {
  const db = await getDb()
  await db.prepare('DELETE FROM curriculum_units WHERE id = ?').run(params.unitId)
  return NextResponse.json({ ok: true })
}
