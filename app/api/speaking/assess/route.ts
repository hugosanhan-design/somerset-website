import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { assessSpeaking, type SpeakingTurn } from '@/lib/speakingAssessment'

export const runtime = 'nodejs'
export const maxDuration = 120

// Teacher-only. Takes the diarised transcript (with speakers already labelled by the
// teacher) and one candidate name, and returns the Cambridge B2 First speaking
// assessment for that candidate. Wraps the already-built engine in lib/speakingAssessment.ts.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    candidate?: string
    turns?: SpeakingTurn[]
    examTitle?: string
  }
  if (!body.candidate || !Array.isArray(body.turns) || body.turns.length === 0) {
    return NextResponse.json({ error: 'candidate and turns are required.' }, { status: 400 })
  }

  try {
    const result = await assessSpeaking({
      candidate: body.candidate,
      turns: body.turns,
      examTitle: body.examTitle,
    })
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Assessment failed.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
