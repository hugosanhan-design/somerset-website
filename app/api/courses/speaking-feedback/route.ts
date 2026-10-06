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
- Speaking breakdowns: repeated words ("take take", "it is it is"), false starts and abandoned sentences ("My day I know I normally like to this week do..."), fragments with no clear verb. Fix each one by giving the clean sentence they were trying to say.

HOW TO WORK: go through the transcript sentence by sentence. Every stretch that is not correct, natural English gets a fix. Leave nothing broken unmarked.

HONESTY (most important):
- Judge the answer against what a student STARTING B1 should manage: clear sentences, simple linking, the right tense most of the time.
- Praise must be TRUE and SMALL. Only praise something they actually said correctly. NEVER praise a phrase that contains an error, a repetition or an awkward structure, and never praise "structures" in an answer that was hard to follow. If the answer was weak, praise only the effort or one correct phrase, e.g. "You kept going and answered the question."
- Do not soften the verdict to be kind. A weak answer is called weak, warmly.

RULES:
- Warm and direct. Never patronising. British spelling.
- Every fix must come from THEIR exact words. Never invent errors. Never add ideas.
- The transcript is from speech recognition. When a word makes no sense in context ("I bruise my teeth", "thirty bikini tablets"), the student almost certainly MISPRONOUNCED the word they meant and the recogniser heard something else. Do NOT put these in "fixes": list them in "sounds" instead. Correct real language errors in "fixes".
- Plain English explanations a B1 learner understands. One sentence per fix.
- Never use dashes (— or –): use commas, colons or full stops.
- Never use the words "test", "exam", "score", "grade", "fail".
- If the answer is genuinely correct, return an empty fixes array.

FIELDS:
- "fixes": ALL errors found. Each: { "sentence": the student's complete sentence copied exactly from the transcript; "original": the exact wrong word(s), which MUST appear verbatim inside "sentence"; "fix": the corrected replacement; "why": one plain sentence explaining the rule }.
- "drill": { "prompt": one friendly line naming what to practise, "items": 2 or 3 fill-gap items { "q": a NEW short sentence with ___ for the gap, "a": the answer } }. Base the drill on the most common or important error type in the fixes. If no fixes, drill this unit's grammar (present simple vs continuous).
- "sayAgain": one sentence telling them the single most important thing to change when they say it again.
- "sounds": up to 8 places where the recogniser probably misheard the student because of pronunciation. This is how students find out which words they said badly, so look hard: any word or short phrase that is odd, random or nonsense in context is a mispronounced word. Think about what it SOUNDS like. Examples: "I bruise my teeth" → heard "bruise", meant "brush". "a comfort double sofa" → heard "comfort double", meant "comfortable". "thirty bikini tablets" → heard "bikini tablets", meant "vegetables". "I tink so" → heard "tink", meant "think". Each: { "heard": the SHORTEST stretch copied EXACTLY from the transcript, "meant": the ONE word they were trying to say }. Include it when it is your best reasonable guess. Empty array if none.
- "level": "below" if the answer is hard to follow or most sentences are broken; "starting" if it is mostly clear with several errors; "solid" if it is clear with only small slips.
- "verdict": one honest sentence (max 20 words) on the answer as a whole and the ONE biggest thing to change. E.g. "Hard to follow: many restarts and repeated words. Say one complete idea per sentence."
- "praise": one short sentence naming something they genuinely did well (see HONESTY).
- "length": "short" if under about 40 words, "good" otherwise.
- "b1Version": their answer rewritten as a GOOD answer from a student who is just starting B1. Keep THEIR ideas, facts and order. Fix every error. Then lift it to starter-B1 level with only what a starting B1 student can really say: join ideas with and / but / because / so / then; use present simple for routines and present continuous for now or this week; add time expressions (usually, every day, at the moment, this week); add one reason or example where it is thin. Short, natural, spoken sentences. No advanced vocabulary, no idioms, no complex grammar. At most about 30% longer than the original. Wrap every part you changed or added in double square brackets, e.g. "I [[usually get up]] at seven [[because]] I start work early."
- "b1Why": 2 or 3 very short bullets (max 10 words each) telling the student what a starting B1 speaker is expected to do, matched to the changes you made. E.g. "Join your ideas with because and so."

Return ONLY valid JSON:
{"fixes":[{"sentence":"...","original":"...","fix":"...","why":"..."}],"drill":{"prompt":"...","items":[{"q":"...","a":"..."}]},"sayAgain":"...","sounds":[{"heard":"...","meant":"..."}],"level":"starting","verdict":"...","praise":"...","length":"good","b1Version":"...","b1Why":["..."]}`

type Fix = { sentence: string; original: string; fix: string; why: string }

function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

// Claude often returns a whole phrase ("a sheet near the window" for "seat"); keep only the
// word(s) that sound closest to what was meant, so just the misheard word is underlined.
function narrow(heard: string, meant: string) {
  const words = heard.trim().split(/\s+/)
  const target = meant.toLowerCase().replace(/[^a-z]/g, '')
  if (words.length < 2 || !target) return heard.trim()
  let best = heard.trim(), bestD = Infinity
  for (let i = 0; i < words.length; i++)
    for (let j = i; j < words.length && j < i + 3; j++) {
      const span = words.slice(i, j + 1).join(' ')
      const d = distance(span.toLowerCase().replace(/[^a-z]/g, ''), target)
      if (d < bestD || (d === bestD && span.length > best.length)) { best = span; bestD = d }
    }
  return best.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, '')
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; code?: string; question?: string; transcript?: string; lexicalTranscript?: string }
  if (!lookupStudent(String(body.name || ''), String(body.code || ''))) {
    return NextResponse.json({ error: "Sign in at Student's Corner first." }, { status: 401 })
  }
  const transcript = String(body.transcript || '').trim().slice(0, 4000)
  const lexicalTranscript = String(body.lexicalTranscript || '').trim().slice(0, 4000)
  const question = String(body.question || '').trim().slice(0, 300)
  if (transcript.split(/\s+/).length < 5) {
    return NextResponse.json({ error: 'Say a bit more first: two or three sentences.' }, { status: 400 })
  }

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Question: "${question}"\n\nWhat the student said (transcript):\n"""\n${transcript}\n"""${lexicalTranscript && lexicalTranscript !== transcript ? `\n\nRaw recognition (before ASR grammar correction) — use this to catch errors Azure silently fixed, e.g. wrong verb forms:\n"""\n${lexicalTranscript}\n"""` : ''}\n\nGive the JSON now.` }],
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
      sounds: (Array.isArray(json.sounds) ? json.sounds : [])
        .filter((x: { heard?: unknown; meant?: unknown }) => typeof x?.heard === 'string' && typeof x?.meant === 'string' && x.heard && x.meant && transcript.includes(x.heard))
        .map((x: { heard: string; meant: string }) => {
          const h = x.heard.trim().split(/\s+/), m = x.meant.trim().split(/\s+/)
          const bare = (w: string) => w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, '')
          if (h.length > 1 && h.length === m.length) {
            const i = h.findIndex((w, k) => bare(w).toLowerCase() !== bare(m[k]).toLowerCase())
            if (i >= 0) return { heard: bare(h[i]), meant: bare(m[i]) }
          }
          return { heard: narrow(x.heard, x.meant), meant: x.meant.trim() }
        })
        .slice(0, 8),
      level: ['below', 'starting', 'solid'].includes(json.level) ? json.level : 'starting',
      verdict: String(json.verdict || ''),
      b1Version: typeof json.b1Version === 'string' ? json.b1Version.slice(0, 3000) : '',
      b1Why: Array.isArray(json.b1Why) ? json.b1Why.map(String).slice(0, 3) : [],
    })
  } catch (e) {
    console.error('[speaking-feedback]', e)
    return NextResponse.json({ error: 'Feedback is taking a break. Your recording still counts: try again in a minute.' }, { status: 502 })
  }
}
