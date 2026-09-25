import { NextRequest, NextResponse } from 'next/server'
import { requireSessionOrCode } from '@/lib/authz'
import { correctWriting } from '@/lib/writingCorrection'

export async function POST(req: NextRequest) {
  if (!(await requireSessionOrCode(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { studentName, level, taskType, taskPrompt, studentText } = await req.json()

  try {
    const result = await correctWriting({ studentName, level, taskType, taskPrompt, studentText })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to generate the correction. Please try again.' }, { status: 502 })
  }
}
