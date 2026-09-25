import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

// Confirmed AnswerKey storage (Phase 0, step 4). Answers are keyed "part#qNumber"
// (see lib/mocks.ts for why — the two papers number questions independently).

export async function GET(req: NextRequest) {
  const examId = req.nextUrl.searchParams.get('examId')
  if (!examId) return NextResponse.json({ error: 'No examId provided' }, { status: 400 })

  const db = await getDb()
  const row = await db.prepare('SELECT answers, reviewed_by, reviewed_at FROM mock_answer_keys WHERE exam_id = ?').get(examId) as
    { answers: string; reviewed_by: string; reviewed_at: string } | undefined
  if (!row) return NextResponse.json(null)

  return NextResponse.json({
    examId,
    answers: JSON.parse(row.answers),
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { examId?: string; answers?: Record<string, string> }
  if (!body.examId || !body.answers || Object.keys(body.answers).length === 0) {
    return NextResponse.json({ error: 'examId and answers are required' }, { status: 400 })
  }

  const db = await getDb()
  const exam = await db.prepare('SELECT id FROM mock_exams WHERE id = ?').get(body.examId)
  if (!exam) return NextResponse.json({ error: 'Unknown exam' }, { status: 404 })

  await db.prepare(`
    INSERT INTO mock_answer_keys (exam_id, answers, reviewed_by, reviewed_at)
    VALUES (?, ?, ?, now()::text)
    ON CONFLICT(exam_id) DO UPDATE SET answers = excluded.answers, reviewed_by = excluded.reviewed_by, reviewed_at = now()::text
  `).run(body.examId, JSON.stringify(body.answers), session.user.name || session.user.email || 'teacher')

  return NextResponse.json({ ok: true })
}
