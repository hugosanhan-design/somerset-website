import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ensureMockExamsSeeded } from '@/lib/mocks'

// Lists available mock exams with whether each already has a confirmed answer key.
// Session-gated by middleware (everything under /api is protected by default).
// force-dynamic: without it Next prerenders this GET at build time (hitting the DB
// during build and freezing hasKey at whatever it was when deployed).
export const dynamic = 'force-dynamic'

export async function GET() {
  const db = await getDb()
  await ensureMockExamsSeeded(db)

  const exams = await db.prepare(`
    SELECT e.id, e.title, e.definition,
           k.reviewed_by, k.reviewed_at,
           CASE WHEN k.exam_id IS NULL THEN 0 ELSE 1 END AS has_key
    FROM mock_exams e
    LEFT JOIN mock_answer_keys k ON k.exam_id = e.id
    ORDER BY e.title
  `).all()

  return NextResponse.json(exams.map(e => ({
    id: e.id,
    title: e.title,
    parts: JSON.parse(e.definition),
    hasKey: !!e.has_key,
    reviewedBy: e.reviewed_by || null,
    reviewedAt: e.reviewed_at || null,
  })))
}
