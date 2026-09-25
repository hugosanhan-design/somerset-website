import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { requireSessionOrCode } from '@/lib/authz'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an expert EFL teacher analysing whether a student's written text was likely produced by AI rather than written by the student themselves.

You will be given the student's level, task type, and their submitted text. Assess the likelihood that the text is AI-generated based on these signals:

SIGNALS SUGGESTING AI:
- Vocabulary and syntax consistently above the stated level with no errors
- Zero or near-zero learner errors (real B1/B2 writers make mistakes)
- Generic, non-specific content with no personal detail or concrete examples
- Unnaturally varied synonym use (AI avoids repeating words; learners don't)
- Structural perfection: every paragraph transitions smoothly, no awkward moments
- Absence of typical interlanguage patterns for the stated level
- Overly formal or neutral register that doesn't match a student's voice

SIGNALS SUGGESTING HUMAN:
- Errors consistent with the stated level
- Specific personal details or examples
- Occasional repetition, awkward phrasing, or false starts
- Register appropriate to a language learner (slightly informal, occasional L1 interference)
- Inconsistent quality — good ideas but weaker execution

Return a JSON object ONLY (no markdown, no explanation), in this exact format:
{
  "verdict": "low" | "medium" | "high",
  "confidence": "low" | "medium" | "high",
  "flags": ["flag1", "flag2"],
  "note": "One sentence for the teacher explaining the main reason."
}

verdict: probability that the text is AI-generated (low = probably human, high = probably AI)
confidence: how certain you are of your verdict
flags: 2-4 specific observations from the text (e.g. "No errors despite C1-level vocabulary", "Generic examples with no personal detail")
note: one sentence the teacher can act on`

export async function POST(req: NextRequest) {
  if (!(await requireSessionOrCode(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { level, taskType, studentText } = await req.json()

  const userMessage = `Level: ${level}
Task type: ${taskType}

Student text:
${studentText}

Analyse and return the JSON assessment.`.trim()

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
    const raw = (textBlock?.text || '').trim()
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ verdict: 'unknown', confidence: 'low', flags: [], note: 'Detection failed.' })
  }
}
