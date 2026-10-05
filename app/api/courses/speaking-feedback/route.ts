import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { lookupStudent } from '@/lib/studentAccess'

export const runtime = 'nodejs'
export const maxDuration = 60

// PUBLIC (api/courses allow-list), signed-in students only. Takes the transcript the
// student has confirmed and returns comprehensive correction: ALL language errors,
// one focused drill on the main fix, and a tip for saying it again.

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a thorough, warm English teacher at Somerset Language Centre in Valencia. A Spanish student (teenager or adult, CEFR B1, preparing for Cambridge B1 Preliminary) has just answered a speaking question out loud. You have the confirmed TRANSCRIPT. Return strict JSON only.

YOUR JOB: find and correct EVERY language error. Do not hold back. This is a correction session, not a confidence exercise.

ERROR CATEGORIES — catch all of these:
- Verb tenses: present simple vs continuous, past simple vs continuous, wrong tense choice
- Stative verbs (know, want, like, own, believe, understand, prefer) never take -ing
- Third-person -s missing or wrong
- Preposition collocations: "at night" (NOT "in the night"), "at the weekend", "in the morning/afternoon/evening", "on Monday", "interested in", "good at", "listen to", "arrive at/in", "depend on", "on the internet" (NOT "in the internet"), "by car/bus/foot", "at home" (NOT "in home")
- Articles: missing "a/an/the", wrong article, "the" before general nouns ("I like the music" → "I like music")
- Word choice: wrong vocabulary, false friends (Spanish interference), calques ("I have 20 years" → "I am 20 years old"), incorrect fixed expressions
- Word order: adjective placement, adverb placement ("always I go" → "I always go")
- Subject omission or doubling ("My brother he works" → "My brother works")
- Countable/uncountable nouns ("informations", "advices", "furnitures" → singular)
- Register: "very much" after adjectives ("I am very much tired" → "I am very tired")

RULES:
- Encouraging and direct. Never patronising. British spelling.
- Every fix must come from THEIR exact words. Never invent errors. Never add ideas.
- The transcript is from speech recognition: ignore obvious mishearings (words that make no sense in context and were clearly garbled by the microphone). Correct real language errors.
- Plain English explanations a B1 learner understands. One sentence per fix.
- Never use dashes (— or –): use commas, colons or full stops.
- Never use the words "test", "exam", "score", "grade", "fail".
- If the answer is genuinely correct, return an empty fixes array.

FIELDS:
- "fixes": ALL errors found. Each: { "sentence": the student's complete sentence copied exactly from the transcript; "original": the exact wrong word(s), which MUST appear verbatim inside "sentence"; "fix": the corrected replacement; "why": one plain sentence explaining the rule }.
- "drill": { "prompt": one friendly line naming what to practise, "items": 2 or 3 fill-gap items { "q": a NEW short sentence with ___ for the gap, "a": the answer } }. Base the drill on the most common or important error type in the fixes. If no fixes, drill this unit's grammar (present simple vs continuous).
- "sayAgain": one sentence telling them the single most important thing to change when they say it again.
- "praise": one sentence naming something they genuinely did well, quoting their words if possible.
- "length": "short" if under about 40 words, "good" otherwise.

Return ONLY valid JSON:
{"fixes":[{"sentence":"...","original":"...","fix":"...","why":"..."}],"drill":{"prompt":"...","items":[{"q":"...","a":"..."}]},"sayAgain":"...","praise":"...","length":"good"}`

type Fix = { sentence: string; original: string; fix: string; why: string }

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; code?: string; question?: string; transcript?: string }
  if (!lookupStudent(String(body.name || ''), String(body.code || ''))) {
    return NextResponse.json({ error: 'Sign in at Student’s Corner first.' }, { status: 401 })
  }
  const transcript = String(body.transcript || '').trim().slice(0, 4000)
  const question = String(body.question || '').trim().slice(0, 300)
  if (transcript.split(/\s+/).length < 5) {
    return NextResponse.json({ error: 'Say a bit more first: two or three sentences.' }, { status: 400 })
  }

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2500,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Question: "${question}"\n\nWhat the student said (transcript):\n"""\n${transcript}\n"""\n\nGive the JSON now.` }],
    })
    const raw = msg.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '{}')
    // Keep only fixes we can actually locate in their sentence: those become revision items.
    const fixes: Fix[] = (Array.isArray(json.fixes) ? json.fixes : [])
      .filter((f: Fix) => f && typeof f.sentence === 'string' && typeof f.original === 'string' && typeof f.fix === 'string' && f.original && f.sentence.includes(f.original))
      .slice(0, 12)
    const items = Array.isArray(json.drill?.items) ? json.drill.items.filter((i: { q?: string; a?: string }) => i?.q && i?.a).slice(0, 3) : []
    return NextResponse.json({
      fixes,
      drill: { prompt: String(json.drill?.prompt || 'Fill the gaps.'), items },
      sayAgain: String(json.sayAgain || 'Say it again and add one more detail.'),
      praise: String(json.praise || 'You kept going and got your ideas across.'),
      length: json.length === 'short' ? 'short' : 'good',
    })
  } catch (e) {
    console.error('[speaking-feedback]', e)
    return NextResponse.json({ error: 'Feedback is taking a break. Your recording still counts: try again in a minute.' }, { status: 502 })
  }
}
