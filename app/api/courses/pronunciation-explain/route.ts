import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getCached, setCached } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 30

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a pronunciation teacher for Spanish learners of English (around B1 level, preparing for Cambridge PET). When given an English word, explain its pronunciation in a way that is useful, brief, and friendly.

Return strict JSON only — no markdown, no explanation outside the JSON:
{
  "ipa": "British English IPA, e.g. /θɔːt/",
  "how": "One sentence: exactly how to physically produce the sound — where the tongue, lips, and air go. Make it concrete, not vague.",
  "rule": "The pronunciation rule this word follows, e.g. 'Silent K before N', or null if there is no clear rule.",
  "why": "One to three sentences: the historical or etymological reason this word sounds the way it does. Why does English spell it this way? When did the pronunciation change? What language did it come from? Spanish learners often find English spelling/sound mismatches baffling — give them the real story.",
  "similar": ["2 or 3 other common English words that share the same tricky sound or pattern"]
}

Be warm and specific. Avoid vague phrases like "it's complicated". If the word is straightforward, say so briefly. Never mention exams or scores.`

type PronExplain = {
  ipa: string
  how: string
  rule: string | null
  why: string
  similar: string[]
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { word?: string }
  const word = String(body.word || '').trim().toLowerCase().slice(0, 60)
  if (!word || !/^[a-z'-]+$/.test(word)) {
    return NextResponse.json({ error: 'Invalid word.' }, { status: 400 })
  }

  const cacheKey = `pron:${word}`
  const cached = await getCached<PronExplain>(cacheKey)
  if (cached) return NextResponse.json(cached)

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Word: "${word}"` }],
    })
    const raw = msg.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '{}') as Partial<PronExplain>
    const result: PronExplain = {
      ipa: String(json.ipa || ''),
      how: String(json.how || ''),
      rule: json.rule ? String(json.rule) : null,
      why: String(json.why || ''),
      similar: Array.isArray(json.similar) ? json.similar.map(String).slice(0, 3) : [],
    }
    await setCached(cacheKey, 'text', result)
    return NextResponse.json(result)
  } catch (e) {
    console.error('[pronunciation-explain]', e)
    return NextResponse.json({ error: 'Explanation unavailable right now.' }, { status: 502 })
  }
}
