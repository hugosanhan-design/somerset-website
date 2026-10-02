import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const runtime = 'nodejs'

// Public — no auth required. Students open this via a link the teacher shares.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await getDb()
  const pack = await db.prepare(`
    SELECT cp.*, g.name as group_name
    FROM catchup_packs cp LEFT JOIN groups g ON g.id = cp.group_id
    WHERE cp.id = ?
  `).get(id)

  if (!pack) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(pack)
}
