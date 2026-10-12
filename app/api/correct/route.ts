import { NextRequest, NextResponse } from 'next/server'
import { requireSessionOrCode } from '@/lib/authz'
import { correctWriting } from '@/lib/writingCorrection'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  if (!(await requireSessionOrCode(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { studentName, level, taskType, taskPrompt, studentText, studentNotes } = await req.json()

  try {
    const result = await correctWriting({ studentName, level, taskType, taskPrompt, studentText, studentNotes })
    return NextResponse.json(result)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[api/correct] correction failed:', detail)
    return NextResponse.json({ error: 'Failed to generate the correction.', detail }, { status: 502 })
  }
}
