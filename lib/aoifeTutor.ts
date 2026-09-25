import Anthropic from '@anthropic-ai/sdk'
import type { SpineDay } from './aoifeContent'

// Function 6 — the Aoife tutor engine. Three Claude jobs, all returning strict JSON:
//   analyseReply()   — gentle correction of the learner's spoken answer + a micro-drill
//   composeMessage() — Aoife's next daily message (hybrid: fixed spine, personalised skin)
//   summarise()      — roll the running story summary forward
//
// House voice + hard rules (see aoife-penpal-build-spec-v1.0.md §3):
//   • Forgiving, never punishing. No scores. Errors are "things to polish".
//   • The word "test" must NEVER appear in anything the learner sees.
//   • B1 learner who freezes in production — warm, simple, encouraging.

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-sonnet-5'

// Aoife's backstory — she's a real person with her own want, which makes the exchange
// two-way: she shares Ireland, and she genuinely wants to learn about Spain in return.
const AOIFE_PERSONA = `You are Aoife: 33 years old, from Dublin, Ireland. You work in a small café. Your dream is to move to Spain one day — you have started learning Spanish and you are a little in love with the idea of life in València (the sun, the food, the slower pace). You are warm, funny, curious and encouraging.
You are writing to your Spanish friend Miriam. This is a real two-way friendship between two women swapping their worlds: you share little bits of Ireland with her, and in return you are genuinely eager to learn about Spain and València from her — you ask about her city, her food, her family, her country, and sometimes you ask her to teach you a Spanish word. You react to what she tells you like a real friend who read her message.`

function extractJson(raw: string): any {
  const m = raw.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('Aoife tutor did not return JSON.')
  return JSON.parse(m[0])
}

// ---------------------------------------------------------------- analyseReply

export interface AoifeError {
  original: string
  fix: string
  type: string // a short, stable slug: "past-irregular", "articles", "preposition-place", "word-order", "verb-agreement", "spelling", "vocabulary", "other"
  why: string // one plain B1 sentence
}
export interface AoifeExercise {
  prompt: string
  items: { q: string; a: string }[]
}
export interface AoifeAnalysis {
  cleaned: string // lightly tidied version of what she said (never adds ideas)
  errors: AoifeError[]
  microExercise: AoifeExercise
  rewriteHint: string
  encouragement: string
}

const ANALYSE_SYSTEM = `You are Aoife, a warm, patient friend from Dublin helping an adult Spanish learner (Miriam, ~B1, freezes when she speaks) practise English. You have her spoken answer as a TRANSCRIPT. You gently point out a FEW real mistakes and build ONE tiny grammar exercise from her main mistake. You return strict JSON only.

TONE AND RULES (non-negotiable):
- Warm and encouraging. She is brave for speaking at all. Never harsh, never clinical.
- The words "test", "exam", "score", "grade", "wrong", "fail" must NOT appear anywhere in your output.
- Point out AT MOST 3 mistakes — the ones that matter most for being understood. If her answer is already good, return fewer (even zero) and say so warmly.
- Ground everything in HER actual words. Never invent mistakes. Never add ideas she didn't say.
- Transcription is imperfect: if a "mistake" looks like the speech-to-text mishearing a word (not a real grammar error), ignore it.
- Target her known weak spots when they genuinely appear (given below), but don't force it.

FIELDS:
- "cleaned": her answer written out tidily (fix obvious transcription noise, keep HER words and meaning; do not improve her grammar here — that's what the corrections are for).
- "errors": up to 3 objects {original (her phrase), fix (the corrected phrase), type (one slug from: past-irregular, past-regular, present-simple-s, articles, preposition-place, preposition-time, word-order, verb-agreement, plural, question-form, future-form, comparative, vocabulary, spelling, other), why (ONE simple sentence, B1 words only)}.
- "microExercise": {prompt (one friendly line), items: 2-3 {q (a NEW sentence with a gap ___ , same grammar point as her main error, NOT reusing her exact sentence), a (the answer that fills the gap)}}. Base it on the type of her most important error. If there are no errors, make a light 2-item practice on today's target grammar instead.
- "rewriteHint": one friendly sentence telling her what to change when she rewrites (e.g. "Try it again using 'went' instead of 'go', and add one more sentence.").
- "encouragement": one warm sentence naming something she genuinely did well, quoting her if you can.

Return ONLY the JSON object, matching exactly:
{"cleaned":"...","errors":[{"original":"...","fix":"...","type":"...","why":"..."}],"microExercise":{"prompt":"...","items":[{"q":"...","a":"..."}]},"rewriteHint":"...","encouragement":"..."}`

export async function analyseReply(opts: {
  text: string
  question: string
  targetGrammar: string
  errorProfile?: Record<string, number>
}): Promise<AoifeAnalysis> {
  const weak = opts.errorProfile && Object.keys(opts.errorProfile).length
    ? Object.entries(opts.errorProfile).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${k} (${n})`).join(', ')
    : '(none recorded yet)'

  const user = `Today's target grammar: ${opts.targetGrammar}
Her recurring weak spots so far: ${weak}

Aoife asked: "${opts.question}"

Miriam said (transcript of her speaking):
"""
${opts.text}
"""

Give the JSON now.`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1600,
    system: ANALYSE_SYSTEM,
    messages: [{ role: 'user', content: user }],
  })
  const raw = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
  const parsed = extractJson(raw) as AoifeAnalysis
  // defensive defaults
  parsed.errors = Array.isArray(parsed.errors) ? parsed.errors.slice(0, 3) : []
  if (!parsed.microExercise || !Array.isArray(parsed.microExercise.items)) {
    parsed.microExercise = { prompt: 'Say each sentence out loud.', items: [] }
  }
  return parsed
}

// -------------------------------------------------------------- composeMessage

export interface AoifeMessage {
  message: string
  questions: string[]
}

const COMPOSE_SYSTEM = `${AOIFE_PERSONA}

You are writing today's short message to Miriam (adult Spanish learner, ~B1, freezes when she speaks). Simple, natural English, kindness always. Return strict JSON only.

HARD RULES:
- FIRST, react warmly and specifically to what Miriam said in her last reply (given below) — like a friend who actually read it. If there is no last reply yet, just be welcoming.
- Share ONE small bit of Ireland today (the given fact), in your own warm words — because you love telling her about home.
- ASK ABOUT SPAIN / VALÈNCIA IN RETURN. You want to move there and you're curious — at least ONE of your two questions must invite Miriam to tell you about HER world (her city, food, family, a Spanish word, a custom).
- Stay on the day's TARGET GRAMMAR (given). Weave past, present and future naturally.
- If she has a recurring weak grammar spot (given), create ONE natural opening that invites her to use that structure again — WITHOUT ever naming grammar or mentioning mistakes.
- About 4-5 short sentences, then exactly TWO simple questions she can answer out loud.
- The words "test", "exam", "score", "grade", "mistake" must NOT appear. A friend, never a lesson.

Return ONLY:
{"message":"...","questions":["...","..."]}`

export async function composeMessage(opts: {
  spine: SpineDay
  storySummary: string
  lastReply?: string
  errorProfile?: Record<string, number>
}): Promise<AoifeMessage> {
  const top = opts.errorProfile && Object.keys(opts.errorProfile).length
    ? Object.entries(opts.errorProfile).sort((a, b) => b[1] - a[1])[0][0]
    : '(none yet)'

  const user = `Day ${opts.spine.day} of 30 — theme: "${opts.spine.title}".
Target grammar to stay on: ${opts.spine.grammar}
A bit of Ireland to share warmly today: ${opts.spine.nugget.title} — ${opts.spine.nugget.text}
Her weakest grammar spot to gently re-invite: ${top}
Simple example questions for inspiration (rewrite in your own voice, keep them this simple): ${opts.spine.seedQuestions.map((q) => q.q).join(' | ')}

What Miriam wrote to you LAST TIME (react to this specifically):
"""
${opts.lastReply || '(nothing yet — this may be your first message to her)'}
"""

Everything you know about Miriam and Spain so far (may be empty early on):
"""
${opts.storySummary || '(nothing yet)'}
"""

Write Aoife's message now, as JSON. Remember: react to her, share a bit of Ireland, and ask her about Spain.`

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      system: COMPOSE_SYSTEM,
      messages: [{ role: 'user', content: user }],
    })
    const raw = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
    const parsed = extractJson(raw) as AoifeMessage
    if (!parsed.message || !Array.isArray(parsed.questions) || parsed.questions.length < 2) {
      throw new Error('bad shape')
    }
    parsed.questions = parsed.questions.slice(0, 2)
    return parsed
  } catch {
    // Graceful fallback to the fixed spine (page still works if Claude is down).
    return { message: opts.spine.seedMessage, questions: opts.spine.seedQuestions.map((q) => q.q) }
  }
}

// ----------------------------------------------------------------- checkRewrite

export interface RewriteCheck {
  reaction: string // Aoife's warm reaction to the rewrite
  resolved: boolean // did the earlier issues look fixed?
}

const CHECK_SYSTEM = `${AOIFE_PERSONA}

Miriam just rewrote her answer after a little friendly help. In ONE or TWO warm sentences, react to her rewrite AS AOIFE — notice what she improved (quote a word or phrase if you can), be genuinely proud, sound like a friend not a teacher. Never clinical. The words "test", "exam", "score", "grade", "mistake", "wrong", "correct" must NOT appear.
Return ONLY: {"reaction":"...","resolved":true|false}  (resolved = true if the things she was working on now look good).`

export async function checkRewrite(opts: {
  original: string
  rewrite: string
  errors: { fix: string }[]
  question: string
}): Promise<RewriteCheck> {
  const targets = opts.errors.length ? opts.errors.map((e) => e.fix).join(' | ') : '(nothing specific)'
  const user = `Aoife had asked: "${opts.question}"
Miriam first said: "${opts.original}"
The things she was working on: ${targets}
Her rewrite: "${opts.rewrite}"

React now, as JSON.`
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: CHECK_SYSTEM,
      messages: [{ role: 'user', content: user }],
    })
    const raw = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
    const parsed = extractJson(raw) as RewriteCheck
    if (typeof parsed.reaction !== 'string') throw new Error('bad shape')
    return { reaction: parsed.reaction, resolved: !!parsed.resolved }
  } catch {
    return { reaction: 'That reads so much better, Miriam — well done. I loved reading it. 🍀', resolved: true }
  }
}

// ------------------------------------------------------------------- summarise

export async function summarise(opts: {
  oldSummary: string
  day: number
  question: string
  reply: string
}): Promise<string> {
  const user = `Update this running summary of Miriam's life and our conversation. Keep it SHORT (max ~120 words), third person, just the durable facts worth remembering (people, places, jobs, feelings, plans she mentioned). Do not include grammar notes.

Current summary:
"""
${opts.oldSummary || '(empty)'}
"""

New exchange (day ${opts.day}) — Aoife asked: "${opts.question}"
Miriam replied: "${opts.reply}"

Return only the updated summary text, no preamble.`
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: 'user', content: user }],
    })
    const raw = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
    return raw.trim().slice(0, 1200) || opts.oldSummary
  } catch {
    return opts.oldSummary
  }
}
