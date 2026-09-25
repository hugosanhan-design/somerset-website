import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getCached, setCached } from '@/lib/db'
import { getSeedWords, LEVEL_GRAMMAR_MENU } from '@/data/topicVocabSeed'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a CEFR-calibrated English vocabulary curriculum writer for a language school in Valencia, Spain.
Given a TOPIC and a CEFR LEVEL, produce a "lesson pack": a target vocabulary list and a short set of grammar/tense points worth practising for that topic at that level.

Rules:
1. Produce 10–15 target vocabulary items (single words or short natural collocations, e.g. "break into", not full sentences).
2. Every item must be genuinely useful, topic-relevant vocabulary a learner at this level should know or is ready to stretch into.
3. For each item give: word (the word/collocation itself), pos (part of speech — noun, verb, adjective, phrasal verb, collocation, etc.), def_en (a short, simple English definition), def_es (a natural Spanish translation/gloss — not a literal word-for-word translation), example (one natural example sentence using the word, in context, at or near this level), cefr (the level: "${'{LEVEL}'}" unless a word is genuinely a level below/above, in which case use its real level).
4. Produce 3–6 grammar/tense points. Choose ONLY from this level's grammar range — do not exceed it:
   A2: ${LEVEL_GRAMMAR_MENU.A2}
   B1: ${LEVEL_GRAMMAR_MENU.B1}
   B2: ${LEVEL_GRAMMAR_MENU.B2}
   C1: ${LEVEL_GRAMMAR_MENU.C1}
   Pick only the points from the chosen level's list that this specific topic naturally invites (e.g. Crime invites passive voice and past tenses; Travel invites present perfect and comparatives; Environment invites future forms and conditionals).
5. For each grammar point give a one-line "why" explaining why it fits this topic.

Return ONLY valid JSON, no prose, in this exact shape:
{
  "vocab": [ { "word": "", "pos": "", "def_en": "", "def_es": "", "example": "", "cefr": "" } ],
  "grammarPoints": [ { "point": "", "why": "" } ]
}`

function cacheKey(topic: string, level: string): string {
  return 'pack:' + crypto.createHash('md5').update(`${topic.trim().toLowerCase()}|${level}`).digest('hex')
}

export async function POST(req: NextRequest) {
  const { topic, level } = await req.json()
  if (!topic || !level) {
    return NextResponse.json({ error: 'topic and level are required' }, { status: 400 })
  }

  const key = cacheKey(topic, level)
  const cached = await getCached(key)
  if (cached) return NextResponse.json(cached)

  const seedWords = getSeedWords(topic)
  const seedNote = seedWords && level === 'B2'
    ? `\n\nThe school's existing curated word bank for this topic (exam-aligned, B2) includes: ${seedWords.join(', ')}.\nPrefer these words where they fit naturally — you may add others to reach 10–15 items, and adapt a word's form if needed, but stay close to this bank.`
    : ''

  const userMessage = `TOPIC: ${topic}\nLEVEL: ${level}${seedNote}\n\nProduce the lesson pack now.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 6000,
    system: SYSTEM_PROMPT.replace('{LEVEL}', level),
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
  const raw = textBlock?.text || ''
  let parsed
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
  } catch {
    return NextResponse.json({ error: 'Failed to generate lesson pack. Please try again.' }, { status: 502 })
  }

  const pack = {
    topic,
    level,
    vocab: parsed.vocab || [],
    grammarPoints: parsed.grammarPoints || [],
  }

  await setCached(key, 'pack', pack)
  return NextResponse.json(pack)
}
