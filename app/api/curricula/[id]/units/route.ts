import { NextRequest, NextResponse } from 'next/server'
import { getDb, newId } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDb()
  const { title, grammar_focus, vocab_focus, notes } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const curriculum = await db.prepare('SELECT id FROM curricula WHERE id = ?').get(params.id)
  if (!curriculum) return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 })

  const maxOrder = await db.prepare('SELECT MAX(order_index) as m FROM curriculum_units WHERE curriculum_id = ?').get(params.id) as { m: number | null }
  const orderIndex = (maxOrder.m ?? -1) + 1

  const id = newId()
  await db.prepare(`
    INSERT INTO curriculum_units (id, curriculum_id, order_index, title, grammar_focus, vocab_focus, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, params.id, orderIndex, title.trim(), grammar_focus || '', vocab_focus || '', notes || '')

  const unit = await db.prepare('SELECT * FROM curriculum_units WHERE id = ?').get(id)
  return NextResponse.json(unit, { status: 201 })
}
