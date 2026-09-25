import Anthropic from '@anthropic-ai/sdk'

// Function 5, Phase A2 — Speaking assessment from a diarised transcript.
// Grounded in the real Cambridge B2 First Speaking analytical scales (UCLES 2008,
// "Assessing Speaking Performance – Level B2"): four criteria banded 0–5, plus the
// interlocutor's holistic Global Achievement mark.
//
// HONEST LIMITATION, baked in: three of the four criteria — Grammar & Vocabulary,
// Discourse Management, Interactive Communication — are assessable from a transcript.
// PRONUNCIATION is not: the scale asks about intonation, sentence/word stress, and
// individual sounds, none of which survive transcription. The engine therefore scores
// the three it genuinely can and defers pronunciation to a live human check — it never
// invents a pronunciation band from text.
//
// Pipeline: audio → ElevenLabs Scribe (diarised) → labelled turns → this assessment.

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface SpeakingTurn {
  speaker: string   // teacher-confirmed label: candidate name, or "Examiner"
  text: string
}

export interface CriterionAssessment {
  criterion: 'Grammar & Vocabulary' | 'Discourse Management' | 'Interactive Communication'
  band: number                 // 0–5
  good: string[]               // evidence: what they did well, quoting their actual words
  notSoGood: string[]          // evidence: slips, with the correction where useful
  comment: string              // Somerset-voice paragraph, prose not bullets
}

export interface CandidateSpeakingAssessment {
  candidate: string
  criteria: CriterionAssessment[]
  pronunciationNote: string    // why it isn't scored + what to listen for live
  globalAchievement: { band: number; comment: string }
  estimate: string             // e.g. "Around band 4 on the three assessable criteria — confirm pronunciation live."
  priorities: string[]         // 2–3 concrete, personalised next steps
}

const SYSTEM_PROMPT = `You are the Somerset Language Centre speaking-assessment agent. You assess a candidate's spoken performance in a Cambridge B2 First (FCE) Speaking test from a DIARISED TRANSCRIPT (who said what), and return a structured JSON assessment in Hugo's teacher voice.

## The exam
B2 First Speaking is paired: an Examiner (interlocutor) and two candidates, four parts — Part 1 (interview), Part 2 (individual long turn comparing photos), Part 3 (collaborative task, discussing together), Part 4 (discussion). Assess ONE candidate at a time, on their own performance, across the whole transcript. Part 2 is the main window on Discourse Management; Part 3 is the main window on Interactive Communication.

## The four Cambridge criteria (bands 0–5)
You assess THREE from the transcript. You must NOT score Pronunciation — say so explicitly.

1. GRAMMAR & VOCABULARY — control of simple grammatical forms; range and control of complex grammatical forms; range of appropriate vocabulary for the topic. Band 5: a range of simple forms used with control + control of a range of complex forms; wide range of appropriate vocabulary. Band 3: good control of simple forms + attempts some complex forms; enough vocabulary for the topics. Band 1: limited control of simple forms; basic vocabulary. Candidates are marked on the language they USE and ATTEMPT — reward ambition, but mistakes must not obscure meaning.

2. DISCOURSE MANAGEMENT — extent (answers an appropriate length for the task; not much hesitation); relevance and organisation (relevant, little repetition, coherent); range of cohesive devices and discourse markers. Band 5: produces extended stretches of language with very little hesitation; relevant, coherent, well organised; a range of cohesive devices and discourse markers. Band 3: produces extended stretches despite some hesitation; contributions relevant, some organisation; uses a range of cohesive devices. Band 1: produces responses which are extended beyond short phrases despite hesitation; mostly relevant despite some repetition; uses basic cohesive devices.

3. INTERACTIVE COMMUNICATION — initiates and responds appropriately; keeps the interaction going, involves the partner, says more than the minimum; develops the interaction and negotiates towards an outcome (esp. Part 3); how much support is needed. Band 5: initiates and responds appropriately, linking contributions to those of other speakers; maintains and develops the interaction and negotiates towards an outcome. Band 3: initiates and responds appropriately; keeps the interaction going with very little prompting. Band 1: keeps the interaction going with support; requires prompting and support.

Bands 3 and above indicate performance at B2 level or better. Use whole or half bands (e.g. 3, 3.5, 4).

## Global Achievement
The interlocutor's holistic mark for the performance as a whole across all four parts — how successfully the candidate handled the whole test. Band 5: handles communication on a range of familiar topics with very little hesitation. Band 3: handles communication on familiar topics, despite some hesitation; organises extended discourse but occasionally produces utterances that need interpretation. Give a band and a one-sentence justification.

## Assessment style — evidence first, Somerset voice
For each of the three criteria, give:
- "good": specific things the candidate did well, QUOTING their actual words from the transcript (e.g. "when I went to bed at the hotel I couldn't sleep"). 2–4 items.
- "notSoGood": specific slips, quoting the candidate's words and giving the correction in brackets where it helps (e.g. "it was so much people (there were so many people)"). 0–4 items. If genuinely strong, leave nearly empty — do not invent faults.
- "comment": a short prose paragraph (2–3 sentences) in Hugo's teacher voice: a single verdict sentence, then specific evidence. No bullet points inside the comment. Reference the level naturally ("at B2, this is important"). Never say excellent/amazing/great job — use sensible, clear, well-organised, ambitious. Name the exact thing.

Pronunciation: in "pronunciationNote", state in one or two sentences that pronunciation cannot be judged from a transcript — intonation, sentence and word stress, and individual sounds have to be heard — and name the ONE or TWO things the teacher should listen for live for THIS candidate (based on their L1/errors if inferable, else general). Never give a pronunciation band.

Priorities: 2–3 concrete, personalised next steps for this candidate, drawn from what the transcript actually shows — not generic advice.

Ground EVERYTHING in the actual transcript. Never invent words the candidate didn't say. If the candidate barely speaks in the transcript, say the sample is too thin to assess confidently and lower your confidence rather than fabricating.

## Output
Return ONLY a JSON object, no commentary, matching exactly:
{"candidate":"<name>","criteria":[{"criterion":"Grammar & Vocabulary","band":<number>,"good":["..."],"notSoGood":["..."],"comment":"..."},{"criterion":"Discourse Management",...},{"criterion":"Interactive Communication",...}],"pronunciationNote":"...","globalAchievement":{"band":<number>,"comment":"..."},"estimate":"...","priorities":["...","..."]}`

export interface AssessOptions {
  candidate: string
  turns: SpeakingTurn[]
  examTitle?: string
}

export async function assessSpeaking(opts: AssessOptions): Promise<CandidateSpeakingAssessment> {
  const transcript = opts.turns.map(t => `${t.speaker}: ${t.text}`).join('\n')
  const userMessage = `Cambridge B2 First Speaking test${opts.examTitle ? ` — ${opts.examTitle}` : ''}.
Assess the candidate named "${opts.candidate}". Here is the full diarised transcript (Examiner = interlocutor; the other named speakers are the two candidates):

${transcript}

Produce the JSON assessment for ${opts.candidate} now.`

  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Speaking assessment did not return JSON.')
  return JSON.parse(jsonMatch[0]) as CandidateSpeakingAssessment
}
