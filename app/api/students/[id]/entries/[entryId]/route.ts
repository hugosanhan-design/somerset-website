import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string; entryId: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const entry = await db.prepare(`
    SELECT e.*, s.name as student_name, s.level as student_level
    FROM work_entries e JOIN students s ON s.id = e.student_id
    WHERE e.id = ? AND e.student_id = ?
  `).get(params.entryId, params.id)
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; entryId: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  await db.prepare('DELETE FROM work_entries WHERE id = ? AND student_id = ?').run(params.entryId, params.id)
  return NextResponse.json({ ok: true })
}

// Finishes a pending scan: the teacher has reviewed the AI's score/feedback (or
// written their own) and the entry moves from status='pending' to 'corrected'.
// Used by /correct-queue/[entryId].
export async function PATCH(req: NextRequest, { params }: { params: { id: string; entryId: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const body = await req.json()
  const { score, ai_feedback, ai_error_patterns, teacher_notes, status } = body

  await db.prepare(`
    UPDATE work_entries SET
      score = COALESCE(?, score),
      ai_feedback = COALESCE(?, ai_feedback),
      ai_error_patterns = COALESCE(?, ai_error_patterns),
      teacher_notes = COALESCE(?, teacher_notes),
      status = COALESCE(?, status),
      corrected_at = CASE WHEN ? = 'corrected' THEN now()::text ELSE corrected_at END
    WHERE id = ? AND student_id = ?
  `).run(
    score ?? null,
    ai_feedback ?? null,
    ai_error_patterns ? JSON.stringify(ai_error_patterns) : null,
    teacher_notes ?? null,
    status ?? null,
    status ?? '',
    params.entryId, params.id
  )

  const entry = await db.prepare('SELECT * FROM work_entries WHERE id = ?').get(params.entryId)
  return NextResponse.json(entry)
}
