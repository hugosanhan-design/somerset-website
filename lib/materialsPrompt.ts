// Everything the materials generator sends to the model, in one place so it can be
// inspected and tested without spending an API call or standing up the app.
// The route is the caller; this file is the prompt.

import { BOOKS, getUnit, wordListForPrompt, strandsForPrompt, type Book, type BookUnit } from '@/data/books'
import { HOUSE_RULES } from '@/lib/houseRules'

export const ACTIVITY_SPECS: Record<string, string> = {
  worksheet: `A complete mixed worksheet: 4-5 varied exercises moving from recognition to production, e.g. matching words to definitions, gap-fill sentences, error correction, a short guided writing task. Number every exercise. Leave writing lines (use div class="lines") where students write.`,
  vocabulary: `A vocabulary-focused worksheet: 4 exercises: matching, categorising/odd-one-out, gap-fill in context sentences, and a personalisation task where students use the words about their own lives. Number every exercise.`,
  grammar: `A grammar-focused worksheet on the given grammar point: a very short "Remember" box summarising the rule with 2 examples (use div class="notebox"), then 3-4 exercises from controlled (transformation, gap-fill) to freer production. Use unit vocabulary inside the grammar exercises so both are recycled.`,
  reading: `A reading lesson: an engaging ~250-word text at the class level (use div class="reading", this renders at 14pt), naturally using 10-12 of the target words in bold (<b>), followed by 3 exercises: comprehension questions, a vocabulary-from-context matching task, and a short discussion/reaction task.`,
  infogap: `A pair/group speaking info-gap activity. Produce one card per student in each group (use div class="card" for each card, with an h3 like "Student A"). Each student's card contains information the others don't have, plus "Ask Student X:" question sections. Each card must have question sections for every OTHER student in its group. Follow the grouping arrangement given. Cards must be self-contained so they can be cut out.`,
  roleplay: `A role-play lesson: a short play script of 8-12 lines set in Valencia or Spain (use div class="script", one p per line with the character name in <b>), ending with the line "★ Now perform it!". Before the script: a 6-8 item key-phrase box. After the script: a task where groups adapt/extend the script and perform their own version. Assign roles matching the group sizes given.`,
  revision: `A revision game/quiz session plan for teams: 4-5 rounds of different game formats (e.g. definitions race, taboo-style describing, sentence auction, spelling relay) using the unit vocabulary. For each round give the teacher clear instructions, the materials/word sets needed, and scoring. Never use the word "test". Say quiz, game, challenge or check-in.`,
}

export const ACTIVITY_LABELS: Record<string, string> = {
  worksheet: 'Worksheet', vocabulary: 'Vocabulary practice', grammar: 'Grammar practice',
  reading: 'Reading lesson', infogap: 'Info-gap speaking', roleplay: 'Role-play', revision: 'Revision game',
}

// Somerset grouping maths (locked rule from worksheet production)
export function grouping(n: number): number[] {
  if (n <= 1) return [Math.max(n, 0)].filter(Boolean)
  if (n === 2) return [2]
  if (n === 4) return [2, 2]
  if (n % 3 === 0) return Array(n / 3).fill(3)
  if (n % 3 === 2) return [...Array((n - 2) / 3).fill(3), 2]
  // n % 3 === 1 → swap one trio for two pairs
  return [...Array((n - 4) / 3).fill(3), 2, 2]
}

export const SYSTEM_PROMPT = `You are the materials writer for Somerset Language Centre, Valencia, Spain, an English academy preparing students for Cambridge exams. You produce print-ready class material from the coursebook unit data you are given, and from nothing else.

${HOUSE_RULES}

You return content as JSON with HTML fragments. Allowed HTML: h2, h3, p, ol, ul, li, table/tr/td/th, b, i, and divs with ONLY these classes:
- div class="exercise": wraps each numbered exercise
- div class="instructions": the exercise instruction line
- div class="notebox": grammar/remember box (green tinted)
- div class="reading": reading text (renders larger)
- div class="lines": 4 ruled writing lines for student answers
- div class="card": cut-out card (bordered, avoid page break inside)
- div class="script": play script block
- span class="gap": a gap in gap-fill items (renders as underline space)
No inline styles, no other classes, no <style>, no <script>, no images.

Return ONLY valid JSON, no prose:
{
  "title": "short material title for the header",
  "duration_note": "one line: suggested timing, e.g. '≈ 40 min · pairs then open class'",
  "html_body": "the full student-facing material as an HTML fragment using the allowed elements",
  "teacher_key_html": "HTML fragment: complete answer key plus the teaching notes described in THE TEACHER KEY above",
  "flags": ["anything you had to stretch, invent or leave out, one short line each. Empty array if nothing."]
}`


export interface MaterialRequest {
  bookId?: string
  unit: number
  activityType: string
  studentCount?: number
  groupLabel?: string
  grammarFocus?: string
  focusNotes?: string
}

export interface PromptBundle {
  book: Book
  unitData: BookUnit
  system: string
  user: string
}

/** Returns null when the book or unit is unknown, or the activity type is not one of ours. */
export function buildPrompt(req: MaterialRequest): PromptBundle | null {
  const found = getUnit(String(req.bookId || BOOKS[0].id), Number(req.unit))
  if (!found) return null
  const { book, unit: unitData } = found
  const spec = ACTIVITY_SPECS[req.activityType]
  if (!spec) return null

  const activityType = req.activityType
  const groupLabel = req.groupLabel
  const grammarFocus = req.grammarFocus
  const focusNotes = req.focusNotes
  const n = Math.min(Math.max(Number(req.studentCount) || 6, 1), 30)
  const groups = grouping(n)
  const trios = groups.filter(g => g === 3).length
  const pairs = groups.filter(g => g === 2).length
  const groupDesc = n === 1
    ? '1 student, adapt every task to teacher and student working as a pair'
    : `${n} students: ${[trios ? `${trios} trio(s)` : '', pairs ? `${pairs} pair(s)` : ''].filter(Boolean).join(' + ')}`

  const wordList = wordListForPrompt(unitData)
  const strands = strandsForPrompt(unitData)

  const userMessage = `COURSEBOOK: ${book.name}${book.publisher ? ` (${book.publisher})` : ''}
LEVEL: ${book.level}${book.exam ? ` · exam track: ${book.exam}` : ''}
UNIT: ${unitData.unit}, ${unitData.title}${unitData.sbPages ? ` (Student's Book pages ${unitData.sbPages})` : ''}
CLASS: ${groupLabel || 'not specified'}
STUDENTS COMING: ${n} → grouping: ${groupDesc}
ACTIVITY TYPE: ${ACTIVITY_LABELS[activityType]}
ACTIVITY SPEC: ${spec}
GRAMMAR FOCUS: ${grammarFocus || (unitData.grammar?.length ? unitData.grammar.join(' · ') : 'none specified, keep the material vocabulary-led')}
TEACHER NOTES: ${focusNotes || 'none'}

WHAT THIS UNIT TEACHES, according to the book's own contents page:
${strands || 'not recorded for this book'}

THE UNIT'S OWN VOCABULARY, transcribed from the publisher's Vocabulary reference.
Use these words and no others. The example sentences are the book's, and they set the
register and the level you should match.
${wordList}

Produce the JSON now.`

  return { book, unitData, system: SYSTEM_PROMPT, user: userMessage }
}
