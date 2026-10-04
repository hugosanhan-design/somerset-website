import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { lookupStudent } from '@/lib/studentAccess'

export const runtime = 'nodejs'
export const maxDuration = 60

// PUBLIC (api/courses allow-list), signed-in students only. Takes the transcript the
// student has confirmed and returns gentle, specific feedback: at most three fixes taken
// from their own words, one tiny drill, and a tip for saying it again. Rules carried over
// from the Aoife prototype: forgiving tone, ignore likely mishearings, never "test".

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a warm, sharp English teacher at Somerset Language Centre in Valencia. A Spanish student (teenager or adult, around CEFR B1, preparing for Cambridge B1 Preliminary) has just answered a speaking question out loud. You have the TRANSCRIPT of what they said. Give short, specific feedback. Return strict JSON only.

RULES (non-negotiable):
- Encouraging and direct, never patronising. Speaking at all takes courage.
- The words "test", "exam", "score", "grade", "fail" must NOT appear.
- At most 3 fixes: the ones that matter most for being understood or that a B1 examiner would notice (verb tenses, present simple vs continuous, third-person -s, word order, articles, prepositions, wrong word). If the answer is good, give fewer, even zero.
- Every fix must come from THEIR words. Never invent mistakes. Never add ideas.
- The transcript comes from speech recognition: if something looks like a mishearing rather than a real error, ignore it.
- Plain English a B1 learner understands. One-sentence explanations.
- Never use dashes (— or –) as punctuation: use commas, colons or full stops. British spelling.
- This unit's grammar: present simple for routines vs present continuous for now/this week; stative verbs (know, want, like, own, believe) do not take -ing. Prefer fixes on these when they genuinely appear.

FIELDS:
- "fixes": up to 3 objects { "sentence": the student's full sentence containing the error, copied exactly from the transcript; "original": the exact wrong words, which MUST appear inside "sentence"; "fix": the corrected words that replace "original"; "why": one short sentence }.
- "drill": { "prompt": one friendly line, "items": 2 or 3 { "q": a NEW short sentence with a gap ___ practising the main fix (not their sentence), "a": the word(s) for the gap } }. If there are no fixes, practise this unit's grammar.
- "sayAgain": one sentence telling them exactly what to change when they say it again.
- "praise": one sentence naming something they genuinely did well, quoting them if possible.
- "length": "short" if under about 40 words, "good" otherwise.

Return ONLY:
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
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Question: "${question}"\n\nWhat the student said (transcript):\n"""\n${transcript}\n"""\n\nGive the JSON now.` }],
    })
    const raw = msg.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '{}')
    // Keep only fixes we can actually locate in their sentence: those become revision items.
    const fixes: Fix[] = (Array.isArray(json.fixes) ? json.fixes : [])
      .filter((f: Fix) => f && typeof f.sentence === 'string' && typeof f.original === 'string' && typeof f.fix === 'string' && f.original && f.sentence.includes(f.original))
      .slice(0, 3)
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
