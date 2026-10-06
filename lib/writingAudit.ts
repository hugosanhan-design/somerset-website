import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FORMAL_TYPES = ['report', 'essay', 'article', 'formal letter', 'formal email']

const AUDIT_SYSTEM_PROMPT = `You are a Cambridge English grammar auditor. Your ONLY job is to find every single error in the student's text. Do not write a report. Do not summarise. Just list errors.

Go through the text CATEGORY BY CATEGORY in the exact order below. Read every sentence for each category before moving to the next. Do not rush.

CATEGORY 1 — CONTRACTIONS (formal writing only: reports, essays, articles, formal letters, formal emails)
Flag every contraction: don't, doesn't, didn't, can't, couldn't, won't, wouldn't, shouldn't, haven't, hasn't, hadn't, I'm, I've, I'd, I'll, you're, it's (when = it is), there's, that's, they're, we're, we've, we'd, what's, who's, he's, she's, let's, that's, I'd, it'd

CATEGORY 2 — ARTICLES
- Missing "the" before specific/known nouns
- Wrong "a" vs "an"
- "a" or "an" before uncountable nouns (a homework, an advice, an information)
- Unnecessary article before proper nouns, languages, school subjects, meals
- Wrong use of "the" with plural/uncountable generalisations ("the pollution is bad" → "pollution is bad")

CATEGORY 3 — PREPOSITIONS
- Wrong preposition after verbs: depends of/on, interested in/on, participate in/at, responsible of/for, consist of/in
- Wrong preposition after adjectives: good at/in, similar to/with, afraid of/from, different from/to/than
- Wrong time prepositions: at/in/on errors, "in the morning" vs "at morning"
- Missing prepositions

CATEGORY 4 — VERB TENSES
- Present simple vs present continuous confusion
- Past simple vs present perfect confusion (especially with already, yet, just, ever, never, ago, last year)
- Missing -ed on regular past tense
- Wrong irregular past tense or past participle
- Will vs going to vs present continuous for future
- Sequence of tenses errors

CATEGORY 5 — SUBJECT-VERB AGREEMENT
- Missing 3rd person singular -s in present simple
- "everyone / someone / nobody / each" + plural verb
- Collective nouns

CATEGORY 6 — COUNTABLE AND UNCOUNTABLE NOUNS
- Plural of uncountable: informations, advices, furnitures, equipments, knowledges, feedbacks, progresses, researches, behaviours (used as plural), works (as artworks plural)
- "much" vs "many", "less" vs "fewer"
- "a" + uncountable noun

CATEGORY 7 — WORD FORM
- Adjective used where adverb needed ("she sings beautiful" → "beautifully")
- Noun used where adjective needed
- Wrong derived form: economy/economic/economical/economically, politics/political, success/successful/successfully

CATEGORY 8 — GERUND VS INFINITIVE
- Gerund verbs used with infinitive: enjoy to do, avoid to, suggest to, consider to, mind to, finish to, recommend to, practise to
- Infinitive verbs used with gerund: want doing, decide doing, hope doing, plan doing, manage doing, afford doing, agree doing, refuse doing, seem doing, tend doing, fail doing
- Change-of-meaning verbs: stop to smoke vs stop smoking, remember to do vs remember doing, try to do vs try doing

CATEGORY 9 — MODALS
- Modal + "to" + infinitive: should to go, can to do, must to be, will to
- "could of", "would of", "should of", "must of" (must be "have")
- Missing modal in conditional or polite request

CATEGORY 10 — CONDITIONALS
- First conditional with "would" instead of "will": "If it rains, I would stay"
- Second conditional with "will" instead of "would": "If I had money, I will buy"
- Third conditional errors: "If I would have known", missing "have"
- Mixed conditional tense errors

CATEGORY 11 — PASSIVE VOICE
- Wrong auxiliary: "is build", "was wrote"
- Missing auxiliary: "the report write by"
- Wrong past participle in passive: "is known" vs "is knew"

CATEGORY 12 — RELATIVE CLAUSES
- "which" used for people (should be "who")
- "who" used for things (should be "which")
- "whose" confusion
- "what" used as relative pronoun: "the thing what I need"
- Missing relative pronoun when needed

CATEGORY 13 — COMPARATIVES AND SUPERLATIVES
- Double marking: "more better", "most tallest", "more easier"
- Wrong form for long adjectives: "importanter", "interestinger"
- "as...as" structure errors: "as tall than", "so tall as"

CATEGORY 14 — DISCOURSE MARKERS AND COHESION
- "despite of" (must be "despite + noun/gerund")
- "although" + "but" in same clause
- Missing comma after: However, Moreover, Furthermore, Nevertheless, Therefore, In addition, In contrast, On the other hand
- "despite" + full clause instead of noun/gerund

CATEGORY 15 — WORD ORDER
- Adverb between verb and object: "I like very much football" → "I like football very much"
- "always/never/usually/often" before main verb but after auxiliary: "She always is happy"
- Indirect question word order: "I wonder what is she doing" → "what she is doing"

CATEGORY 16 — PUNCTUATION AND CAPITALISATION
- Missing comma after introductory clause or adverbial phrase
- Comma splice: two independent clauses joined with only a comma
- "its" vs "it's" confusion
- "your" vs "you're" confusion
- "their" vs "they're" confusion
- Missing capital for proper nouns

CATEGORY 17 — SPELLING
- Any misspelled word (flag as "spelling" category)

CATEGORY 18 — REGISTER (formal writing only)
- Informal vocabulary: stuff, things (vague), a lot of, get/got (vague), kind of, sort of, loads of, pretty (adverb), really (overused intensifier), big (instead of significant/major), bad (instead of poor/negative/detrimental), good (instead of beneficial/effective), nice, okay, also starting sentences with "And" or "But"

Return ONLY this JSON — no markdown, no explanation, nothing outside the JSON:
{
  "word_count": <integer — count the words in the student text>,
  "errors": [
    {
      "category": "<exact category name from above>",
      "you_wrote": "<exact phrase copied from student text — never paraphrase>",
      "better_version": "<corrected version>",
      "reason": "<one clear sentence explaining why it is wrong>"
    }
  ]
}

If a category has zero errors, include nothing for it. There is NO upper limit on errors — list every single one. Be exhaustive. A missed error is a failed audit.`

export interface AuditError {
  category: string
  you_wrote: string
  better_version: string
  reason: string
}

export interface AuditResult {
  word_count: number
  errors: AuditError[]
}

export async function auditWriting(
  studentText: string,
  taskType: string,
  studentNotes?: string,
): Promise<AuditResult> {
  const isFormal = FORMAL_TYPES.some(t => taskType.toLowerCase().includes(t))

  const userMessage = `TASK TYPE: ${taskType}
IS FORMAL WRITING: ${isFormal ? 'YES — check contractions and register (categories 1 and 18)' : 'NO — skip contractions and register checks'}
${studentNotes ? `\nADDITIONAL FOCUS AREAS FOR THIS STUDENT (pay extra attention to these known patterns):\n${studentNotes}\n` : ''}
STUDENT TEXT:
${studentText}

Now go through every category in order. Return the JSON.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    temperature: 0,
    system: AUDIT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
  const raw = textBlock?.text?.trim() || ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Audit pass returned no JSON.')

  const parsed = JSON.parse(jsonMatch[0]) as AuditResult
  return {
    word_count: parsed.word_count || 0,
    errors: parsed.errors || [],
  }
}

export function markFromErrors(errorCount: number): string {
  if (errorCount <= 3)  return '17–18 / 20'
  if (errorCount <= 6)  return '15–16 / 20'
  if (errorCount <= 10) return '13–14 / 20'
  if (errorCount <= 14) return '11–12 / 20'
  if (errorCount <= 18) return '9–10 / 20'
  return '7–8 / 20'
}

export function languageScoreFromErrors(errorCount: number): string {
  if (errorCount <= 2)  return '5/5'
  if (errorCount <= 5)  return '4/5'
  if (errorCount <= 9)  return '3/5'
  if (errorCount <= 13) return '2/5'
  return '1/5'
}

export function minWords(taskType: string, level: string): number {
  const t = taskType.toLowerCase()
  const l = level.toUpperCase()
  if (t.includes('email') || t.includes('letter')) return l === 'B1' ? 120 : 140
  if (t.includes('report') || t.includes('essay') || t.includes('article')) return l === 'B1' ? 140 : 160
  return 140
}
