import Anthropic from '@anthropic-ai/sdk'

// Function 5, solo-practice variant — assess a SINGLE candidate's ~1-minute
// Part 2 long turn (comparing two photos + answering a question), from a transcript.
//
// HONEST SCOPE, baked in: a monologue only lets us judge TWO of the four Cambridge
// criteria — Grammar & Vocabulary and Discourse Management (how the long turn is
// organised and sustained). Interactive Communication needs a partner; Pronunciation
// needs a live ear. This engine scores the two it genuinely can, gives a band estimate,
// and states plainly what a solo answer can't show. It never invents the other two.

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface LongTurnCriterion {
  criterion: 'Grammar & Vocabulary' | 'Discourse Management'
  band: number // 0–5
  good: string[]
  notSoGood: string[]
  comment: string
}

export interface LongTurnAssessment {
  candidate: string
  topic?: string
  transcript: string
  wordCount: number
  criteria: LongTurnCriterion[]
  estimate: string
  interactionNote: string
  pronunciationNote: string
  priorities: string[]
}

const SYSTEM_PROMPT = `You are the Somerset Language Centre speaking-practice agent. A student has recorded a solo Cambridge B2 First Speaking PART 2 long turn (about one minute: compare two photographs and answer one question). You assess it from a TRANSCRIPT of what they said, in Hugo's teacher voice, and return structured JSON.

## What you CAN and CANNOT judge from a one-minute solo transcript
You assess ONLY two of the four Cambridge criteria:
1. GRAMMAR & VOCABULARY — control of simple forms; range/control of complex forms; range of vocabulary appropriate to the task. Reward ambition; mistakes must not obscure meaning.
2. DISCOURSE MANAGEMENT — is the answer a sustained, coherent, relevant stretch of speech? Does it actually compare the photos and answer the question? Are ideas linked (whereas, both, on the other hand, it looks as if…)? Is it the right length for a one-minute turn, without long hesitation or drifting off-task?
Band each 0–5, using the real B2 First scales (Band 5 = wide range used with control + fully coherent, well-organised; Band 3 = adequate control + generally coherent; Band 1 = limited).

You must NOT score Interactive Communication (there is no partner in a solo turn) or Pronunciation (it cannot be judged from text). Say so in the dedicated fields.

## Assessment style — evidence first, Somerset voice
For each criterion:
- "good": specific things done well, QUOTING the student's actual words. 2–4 items.
- "notSoGood": specific slips, quoting the words with the correction in brackets where it helps, e.g. "it was so much people (there were so many people)". 0–4 items. If genuinely strong, leave nearly empty — never invent faults.
- "comment": 2–3 sentences, prose not bullets: one verdict sentence, then specific evidence. Reference the level naturally ("at B2, this matters"). Never say excellent/amazing/great job — use sensible, clear, well-organised, ambitious. Name the exact thing.

"estimate": one sentence, e.g. "Around Band 4 on the two criteria a one-minute solo answer can show — the paired exam and a live pronunciation check would complete the picture."
"interactionNote": one sentence — Interactive Communication isn't scored because there's no partner in a solo turn; it's judged in the paired exam (Parts 3 and 4).
"pronunciationNote": one or two sentences — pronunciation can't be judged from a transcript; name ONE or TWO things to listen for live for this student (from their errors if inferable, else general). Never give a pronunciation band.
"priorities": 2–3 concrete next steps drawn from what THIS transcript shows — not generic advice.

Ground everything in the transcript. Never invent words the student didn't say. If the sample is very short or barely on-task, say the sample is too thin to score confidently and lower the bands rather than inflating them.

## Output
Return ONLY a JSON object, no commentary, matching exactly:
{"criteria":[{"criterion":"Grammar & Vocabulary","band":<n>,"good":["..."],"notSoGood":["..."],"comment":"..."},{"criterion":"Discourse Management","band":<n>,"good":["..."],"notSoGood":["..."],"comment":"..."}],"estimate":"...","interactionNote":"...","pronunciationNote":"...","priorities":["...","..."]}`

export interface LongTurnOptions {
  candidate: string
  transcript: string
  question: string
  topic?: string
}

export async function assessLongTurn(opts: LongTurnOptions): Promise<LongTurnAssessment> {
  const wordCount = opts.transcript.trim().split(/\s+/).filter(Boolean).length
  const userMessage = `B2 First Speaking — Part 2 solo long turn.
Topic: ${opts.topic || '(general)'}
The question the student answered: "${opts.question}"

Transcript of what the student ("${opts.candidate}") said (about one minute):
"""
${opts.transcript}
"""

Produce the JSON assessment now.`

  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 3072,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Long-turn assessment did not return JSON.')
  const parsed = JSON.parse(jsonMatch[0]) as Omit<LongTurnAssessment, 'candidate' | 'topic' | 'transcript' | 'wordCount'>

  return {
    candidate: opts.candidate,
    topic: opts.topic,
    transcript: opts.transcript,
    wordCount,
    ...parsed,
  }
}
