import { NextRequest, NextResponse } from 'next/server'
import { requireGroupAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'

// Moves a group's current unit forward or backward one step within its curriculum.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireGroupAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const { direction = 'forward' } = await req.json().catch(() => ({}))

  const group = await db.prepare('SELECT * FROM groups WHERE id = ?').get(params.id) as Record<string, unknown> | undefined
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!group.curriculum_id) return NextResponse.json({ error: 'This group has no curriculum assigned' }, { status: 400 })

  const units = await db.prepare('SELECT * FROM curriculum_units WHERE curriculum_id = ? ORDER BY order_index ASC').all(group.curriculum_id) as { id: string }[]
  if (units.length === 0) return NextResponse.json({ error: 'This curriculum has no units yet' }, { status: 400 })

  const currentIndex = units.findIndex(u => u.id === group.current_unit_id)
  let nextIndex: number
  if (direction === 'back') {
    nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1
  } else {
    nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, units.length - 1)
  }

  const nextUnit = units[nextIndex]
  await db.prepare('UPDATE groups SET current_unit_id = ? WHERE id = ?').run(nextUnit.id, params.id)

  const updated = await db.prepare(`
    SELECT g.*, u.title as current_unit_title, u.order_index as current_unit_order
    FROM groups g LEFT JOIN curriculum_units u ON u.id = g.current_unit_id
    WHERE g.id = ?
  `).get(params.id)
  return NextResponse.json(updated)
}
