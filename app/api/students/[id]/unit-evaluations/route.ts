import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb, newId } from '@/lib/db'

// Unit evaluation: one row per (student, unit, part). Parts are scored separately
// on purpose: there is no overall mark or average (a unit test is not a Cambridge paper).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const db = await getDb()
    const rows = await db.prepare(
      `SELECT * FROM unit_evaluations WHERE student_id = ? ORDER BY unit, position, part`
    ).all(params.id)
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}

// Body: { unit: 'Unit 1', parts: [{ part, score, max, detail?, position? }] }  (upsert)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await req.json()
    const unit = String(body.unit || '').trim()
    const parts = Array.isArray(body.parts) ? body.parts : []
    if (!unit || parts.length === 0) return NextResponse.json({ error: 'unit and parts are required' }, { status: 400 })
    const db = await getDb()
    let i = 0
    for (const p of parts) {
      const part = String(p.part || '').trim()
      if (!part || p.score == null || p.max == null) continue
      const existing = await db.prepare(
        `SELECT id FROM unit_evaluations WHERE student_id = ? AND unit = ? AND part = ?`
      ).get(params.id, unit, part) as { id: string } | undefined
      const pos = Number.isFinite(p.position) ? Number(p.position) : i
      if (existing) {
        await db.prepare(
          `UPDATE unit_evaluations SET score = ?, max = ?, detail = ?, position = ?, updated_at = now()::text WHERE id = ?`
        ).run(Number(p.score), Number(p.max), String(p.detail || ''), pos, existing.id)
      } else {
        await db.prepare(
          `INSERT INTO unit_evaluations (id, student_id, unit, part, score, max, detail, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(newId(), params.id, unit, part, Number(p.score), Number(p.max), String(p.detail || ''), pos)
      }
      i++
    }
    const rows = await db.prepare(
      `SELECT * FROM unit_evaluations WHERE student_id = ? ORDER BY unit, position, part`
    ).all(params.id)
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
