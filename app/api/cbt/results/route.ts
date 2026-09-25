import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// Teacher-only (protected by default middleware): all CBT submissions, newest first.
export const dynamic = 'force-dynamic'

export async function GET() {
  const db = await getDb()
  const rows = await db.prepare(
    'SELECT id, exam_id, student_name, paper, answers, score, started_at, submitted_at FROM cbt_responses ORDER BY submitted_at DESC LIMIT 200'
  ).all()

  return NextResponse.json(rows.map(r => ({
    id: r.id,
    examId: r.exam_id,
    studentName: r.student_name,
    paper: r.paper,
    answers: JSON.parse(r.answers),
    score: r.score ? JSON.parse(r.score) : null,
    startedAt: r.started_at,
    submittedAt: r.submitted_at,
  })))
}

// Delete one submission by id. Teacher-only (this route is protected by default
// middleware — students can't reach it). Used by the bin button on /mocks.
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = await getDb()
  const result = await db.prepare('DELETE FROM cbt_responses WHERE id = ?').run(id)
  if (!result?.changes) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
