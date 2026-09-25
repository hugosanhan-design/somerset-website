import { NextRequest, NextResponse } from 'next/server'
import { requireGroupAccess } from '@/lib/authz'
import { getDb, newId } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireGroupAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10)
  const records = await db.prepare('SELECT student_id, present FROM attendance WHERE group_id = ? AND date = ?').all(params.id, date)
  return NextResponse.json(records)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireGroupAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const { date, records } = await req.json()
  if (!date || !Array.isArray(records)) {
    return NextResponse.json({ error: 'date and records[] are required' }, { status: 400 })
  }
  if (records.length === 0) return NextResponse.json({ ok: true })

  // A single multi-row upsert (one round trip, atomic by nature) instead of looping
  // individual statements — each row is (id, group_id, student_id, date, present).
  const values: unknown[] = []
  const rowPlaceholders = records.map((r: { student_id: string; present: boolean }) => {
    values.push(newId(), params.id, r.student_id, date, r.present ? 1 : 0)
    return '(?, ?, ?, ?, ?)'
  }).join(', ')

  await db.prepare(`
    INSERT INTO attendance (id, group_id, student_id, date, present)
    VALUES ${rowPlaceholders}
    ON CONFLICT(group_id, student_id, date) DO UPDATE SET present = excluded.present
  `).run(...values)

  return NextResponse.json({ ok: true })
}
