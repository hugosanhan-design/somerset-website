import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getCached, setCached } from '@/lib/db'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LEVEL_CONSTRAINTS: Record<string, string> = {
  A2: 'present & past simple, going to, can/must; sentences ≤ 12 words; concrete, everyday content; ~120 words.',
  B1: '+ present perfect, past continuous, will, first conditional, common linkers (because, so, although); sentences ≤ 16 words; ~180 words.',
  B2: '+ passive, second/third conditional, reported speech, relative clauses, a range of past forms; cohesive paragraphs; ~250 words.',
  C1: '+ nuanced/idiomatic usage, inversion, cleft sentences, hedging; sophisticated cohesion; ~320 words.',
}

const LENGTH_WORDS: Record<string, number> = { Short: 120, Medium: 200, Long: 300 }

function systemPrompt(type: string, words: number, level: string): string {
  return `You are a CEFR-calibrated English materials writer for a language school.
You will be given: a TOPIC, a CEFR LEVEL, a list of TARGET WORDS, and TARGET GRAMMAR/TENSES.

Write a short ${type} of about ${words} words that:
1. Uses EVERY target word naturally and in context (never as a list). Each target word must appear at least once.
2. Foregrounds the target grammar/tenses so a learner sees them working.
3. Keeps ALL non-target vocabulary and sentence complexity AT OR BELOW ${level}. The only words allowed to be harder than ${level} are the target words themselves — because meeting them in easy surrounding text is the point.
4. Is engaging and age-appropriate for adult/teen learners, and includes a light Valencia or Spain reference where natural.

Hard level constraints:
- A2: ${LEVEL_CONSTRAINTS.A2}
- B1: ${LEVEL_CONSTRAINTS.B1}
- B2: ${LEVEL_CONSTRAINTS.B2}
- C1: ${LEVEL_CONSTRAINTS.C1}
Do NOT exceed the chosen level in the surrounding language.

Wrap each target word where it appears in **double asterisks**.

Return ONLY valid JSON, no prose, in this exact shape:
{
  "title": "string",
  "text": "the text, with **target words** marked",
  "glossary": [ { "word": "", "pos": "", "def_en": "", "def_es": "", "example": "" } ],
  "grammar_notes": [ { "point": "", "seen_in": "a sentence from the text showing it" } ],
  "questions": [ { "q": "", "answer": "" } ],
  "gap_fill": { "text_with_blanks": "same text with target words replaced by ___", "answers": [ "" ] }
}`
}

function cacheKey(topic: string, level: string, type: string, length: string, words: string[]): string {
  const wordsetHash = crypto.createHash('md5').update([...words].sort().join('|')).digest('hex')
  return 'text:' + crypto.createHash('md5').update(`${topic.trim().toLowerCase()}|${level}|${type}|${length}|${wordsetHash}`).digest('hex')
}

function extractText(message: Anthropic.Message): string {
  const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
  return textBlock?.text || ''
}

function extractJson(raw: string): any {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  return JSON.parse(jsonMatch ? jsonMatch[0] : raw)
}

function missingWords(text: string, words: string[]): string[] {
  const lower = text.toLowerCase()
  return words.filter(w => !lower.includes(w.toLowerCase()))
}

export async function POST(req: NextRequest) {
  const { topic, level, type = 'Story', length = 'Medium', vocab, grammarPoints, skipCache } = await req.json()
  if (!topic || !level || !Array.isArray(vocab) || vocab.length === 0) {
    return NextResponse.json({ error: 'topic, level and vocab are required' }, { status: 400 })
  }

  const words: string[] = vocab.map((v: { word: string }) => v.word)
  const key = cacheKey(topic, level, type, length, words)
  if (!skipCache) {
    const cached = await getCached(key)
    if (cached) return NextResponse.json(cached)
  }

  const targetWordCount = LENGTH_WORDS[length] || 200
  const grammarList = (grammarPoints || []).map((g: { point: string }) => g.point)

  const userMessage = `TOPIC: ${topic}\nLEVEL: ${level}\nTARGET WORDS: ${JSON.stringify(words)}\nTARGET GRAMMAR/TENSES: ${JSON.stringify(grammarList)}\n\nProduce the JSON now.`

  const first = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 8192,
    system: systemPrompt(type, targetWordCount, level),
    messages: [{ role: 'user', content: userMessage }],
  })

  let raw = extractText(first)
  let parsed
  try {
    parsed = extractJson(raw)
  } catch {
    return NextResponse.json({ error: 'Failed to generate text. Please try again.' }, { status: 502 })
  }

  // Validate every target word appears — one repair pass if not.
  let missing = missingWords(parsed.text || '', words)
  if (missing.length > 0) {
    const repair = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 8192,
      system: systemPrompt(type, targetWordCount, level),
      messages: [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: raw },
        { role: 'user', content: `These target words are missing from the text: ${JSON.stringify(missing)}. Revise the text minimally to include every one of them, naturally, wrapped in **double asterisks**, keeping everything else as close to the original as possible. Return the complete corrected JSON in the same shape.` },
      ],
    })
    const repairRaw = extractText(repair)
    try {
      const repairParsed = extractJson(repairRaw)
      parsed = repairParsed
      raw = repairRaw
      missing = missingWords(parsed.text || '', words)
    } catch { /* keep first-pass result if repair JSON is malformed */ }
  }

  // Self-check pass: verify surrounding language stays at/below level, using a faster model.
  try {
    const check = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      system: `You are a CEFR level-fidelity checker. You will be given a JSON lesson object and a target CEFR level. Check the "text" field: find any words or phrases ABOVE ${level} that are NOT in the target word list — these are level leaks. If you find any, rewrite ONLY those sentences more simply so the surrounding language is at or below ${level}, keeping target words (marked in **double asterisks**) untouched and still present. If nothing is above level, return the object unchanged. Return ONLY the corrected JSON, in the exact same shape as given, no prose.`,
      messages: [{ role: 'user', content: `TARGET WORDS (never simplify these): ${JSON.stringify(words)}\nLEVEL: ${level}\nJSON:\n${JSON.stringify(parsed)}` }],
    })
    const checked = extractJson(extractText(check))
    if (checked.text && missingWords(checked.text, words).length === 0) {
      parsed = checked
    }
  } catch { /* self-check is best-effort; keep the validated draft if it fails */ }

  await setCached(key, 'text', parsed)
  return NextResponse.json(parsed)
}
