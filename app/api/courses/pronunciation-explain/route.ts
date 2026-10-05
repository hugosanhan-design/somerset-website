import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getCached, setCached } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 30

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a pronunciation coach for Spanish learners of English. Be BRIEF. They need to imitate immediately — no lectures.

Return strict JSON only:
{
  "ipa": "British English IPA — e.g. /θɔːt/",
  "how": "ONE short sentence: the physical action. Where tongue, lips, air go. Compare to a Spanish sound they know if helpful. Max 15 words.",
  "rule": "The ONE rule, e.g. 'Silent K before N'. null if none.",
  "similar": ["2 common English words with the same tricky sound"]
}

Examples of good 'how' values:
- brush /ʌ/: "Like 'a' in 'masa' but mouth more open, tongue lower and back."
- think /θ/: "Tongue between teeth, push air — no vibration."
- week /iː/: "Like Spanish 'i' in 'mi' but longer and tenser."

No 'why', no etymology, no history. Never mention exams or scores.`

type PronExplain = {
  ipa: string
  how: string
  rule: string | null
  similar: string[]
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { word?: string }
  const word = String(body.word || '').trim().toLowerCase().slice(0, 60)
  if (!word || !/^[a-z'-]+$/.test(word)) {
    return NextResponse.json({ error: 'Invalid word.' }, { status: 400 })
  }

  const cacheKey = `pron2:${word}`
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
      similar: Array.isArray(json.similar) ? json.similar.map(String).slice(0, 2) : [],
    }
    await setCached(cacheKey, 'text', result)
    return NextResponse.json(result)
  } catch (e) {
    console.error('[pronunciation-explain]', e)
    return NextResponse.json({ error: 'Explanation unavailable right now.' }, { status: 502 })
  }
}
