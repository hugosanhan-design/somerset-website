import { NextRequest, NextResponse } from 'next/server'
import { getDb, newId } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  const curricula = await db.prepare(`
    SELECT c.*, (SELECT COUNT(*)::int FROM curriculum_units WHERE curriculum_id = c.id) as unit_count
    FROM curricula c
    ORDER BY c.name ASC
  `).all()
  return NextResponse.json(curricula)
}

export async function POST(req: NextRequest) {
  const db = await getDb()
  const { name, level } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const id = newId()
  await db.prepare('INSERT INTO curricula (id, name, level) VALUES (?, ?, ?)').run(id, name.trim(), level || '')
  const curriculum = await db.prepare('SELECT * FROM curricula WHERE id = ?').get(id)
  return NextResponse.json(curriculum, { status: 201 })
}
