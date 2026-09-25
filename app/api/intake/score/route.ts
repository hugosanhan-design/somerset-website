import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SCORING_PROMPT = `You are scoring a language learner's written response for a placement tool.
Score the following response on three dimensions, each 1–3:
- vocabulary_range: 1=limited/repetitive, 2=adequate/some variety, 3=varied/precise
- grammar_complexity: 1=simple clauses with errors, 2=some complexity with occasional errors, 3=multi-clause accurate
- vocabulary_precision: How exactly and carefully the student chooses words. Length does NOT affect this score — a single precise sentence scores 3. A long paragraph of vague or repeated words scores 1.
  1=basic/common words only, vague or imprecise
  2=some precise or varied word choices, adequate
  3=specific/exact vocabulary, no unnecessary repetition, clear word choice throughout

In addition, identify up to 2 topic clusters present in this response from the following list:
SPORT, FOOTBALL, GAMING, MUSIC, TV_FILM, ANIMALS, FOOD, TRAVEL, FAMILY,
WORK_PROFESSIONAL, TECHNOLOGY, CULTURE_HISTORY, SOCIAL_FRIENDS, VALENCIA_LOCAL,
PSYCHOLOGY_PEOPLE, CREATIVE_ARTS, NATURE, PERSONAL_DEVELOPMENT

Return only valid JSON with no explanation or wrapping:
{"vocabulary_range": X, "grammar_complexity": X, "vocabulary_precision": X, "clusters": ["CLUSTER1"]}

If no clear cluster is detectable, return "clusters": []

Student response:`

export async function POST(req: NextRequest) {
  try {
    const { response } = await req.json()
    if (!response || typeof response !== 'string') {
      return NextResponse.json({ error: 'Missing response' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: `${SCORING_PROMPT}\n\n${response}` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    const score = JSON.parse(text)
    return NextResponse.json(score)
  } catch (err) {
    console.error('[intake/score]', err)
    return NextResponse.json({
      vocabulary_range: 2,
      grammar_complexity: 2,
      vocabulary_precision: 2,
      clusters: [],
    })
  }
}
