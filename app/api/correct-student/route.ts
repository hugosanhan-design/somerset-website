import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { correctWriting } from '@/lib/writingCorrection'

export const runtime = 'nodejs'

// Public writing correction for catch-up students. The pack_id in the request body
// acts as a lightweight auth token — if a valid catchup pack exists with that id,
// the student is allowed to submit. No teacher session required.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, string>
  const { pack_id, studentName, level, taskType, taskPrompt, studentText } = body

  if (!pack_id) return NextResponse.json({ error: 'Missing pack_id' }, { status: 400 })

  const db = await getDb()
  const pack = await db.prepare('SELECT id FROM catchup_packs WHERE id = ?').get(pack_id)
  if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 403 })

  try {
    const result = await correctWriting({ studentName, level, taskType, taskPrompt, studentText })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Could not generate feedback right now. Please try again.' }, { status: 502 })
  }
}
