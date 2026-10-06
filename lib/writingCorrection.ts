import Anthropic from '@anthropic-ai/sdk'
import { auditWriting, markFromErrors, languageScoreFromErrors, minWords } from './writingAudit'

// Shared by /api/correct (standalone writing correction) and /api/mocks/report
// (Writing component of a full mock package) — one voice, one system, everywhere,
// per the Model doc's Component 3 rule. Never fork this prompt.
//
// Two-pass architecture (added Oct 2026):
// Pass 1 — Haiku, temperature 0 → systematic category-by-category error audit
// Pass 2 — Sonnet, temperature 0 → HTML report built from the audit list
// Mark and Language score are derived from error count, not AI opinion → consistent every time.

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const WRITING_SYSTEM_PROMPT = `You are the Somerset Language Centre writing correction agent. You receive a student essay AND a pre-audited list of every error. Produce a complete HTML correction report using that list.

CRITICAL RULES:
1. The corrections table and annotated text must reflect the PRE-AUDITED ERROR LIST exactly — all errors, no additions, no omissions.
2. The mark and Language score are provided — use them exactly as given.
3. Return ONLY a complete self-contained HTML document starting with <!DOCTYPE html>. No markdown, no explanation outside the HTML.

## Report structure (always in this order)

1. Mark — use the provided mark exactly. If under length, add a red warning line.
2. General evaluation — 2 sentences max. One verdict, one qualification.
3. Cambridge criteria table — Content, Communicative Achievement, Organisation, Language. Use provided Language score. Score others based on the essay quality.
4. Strengths — short prose paragraph. One clear verdict, then specific evidence quoted from the text.
5. Main points to improve — short prose paragraph. Max 2–3 sentences. Name specific error categories found.
6. Annotated student text — reproduce the FULL student text in <div class="essay-text">. Wrap each errored phrase in <span class="err">…</span> followed immediately by <span class="fix">…</span>. Use the pre-audited error list to know exactly where errors are. Preserve paragraph breaks with <p>…</p>.
7. Corrections table — four columns: "Student wrote" | "Better version" | "Category" | "Why". Include EVERY error from the pre-audited list.
8. Teacher feedback box — direct to student, 4–6 sentences. See voice rules below.
9. Practice page — <div class="practice-section page-break">. Build 2–3 exercises directly from the most common error categories in this essay. Fill-in-the-blank format. No answer key.

## Teacher voice rules

ANALYTICAL SECTIONS:
- Short prose paragraphs — NO bullet points anywhere
- Lead with one clear verdict sentence
- Italicise examples with <em>
- Reference level naturally: "at B2, this matters"
- No bold sub-problems, no hedged language

TEACHER FEEDBACK BOX:
- Open positive → corrections → close with level-reference
- Signature phrases: "Be careful with [X]." / "Try to [verb]..." / "Also remember that..." / "[Adjective] B1/B2/C1 effort."
- NEVER say: excellent, amazing, great job
- Approval words: sensible, clear, easy to follow, well-structured

## HTML design system

- Green: #6BAE2E | Dark: #1A1A1A | Panel fill: #EAF4DA | Alt row: #f5faf0
- Title bar: #6BAE2E background, white text
- Criteria table: green thead, alternating rows
- essay-text: background #fafafa, 1px solid #e8e8e8, border-radius 4px, line-height 2.1
- .err: colour #c0392b, text-decoration line-through, background #fdecea
- .fix: colour #2d6a0a, font-weight 600, background #EAF4DA
- Four-column corrections table: "you wrote" in #c0392b italic, "better version" in #2d6a0a, "category" in #777, "why" in #1A1A1A
- Feedback box: #EAF4DA background, 4px solid #6BAE2E left border, italic 14px
- Practice page: class="practice-section page-break", h3 headings bold, .hint italic ~12.5px #666, numbered <ol>
- Body: Helvetica Neue, Arial, sans-serif, minimum 14px
- Print rule: @media print { .page-break { page-break-before:always; } }
- Complete self-contained HTML. Inline all styles. No external CSS.

## Metadata block

At the very end of <body>, include:
<!-- SOMERSET_META:{"score":<mark×5>,"summary":"<one sentence — main issue>","errors":["<category1>","<category2>","<category3>"]} -->`

export interface WritingCorrectionInput {
  studentName?: string
  level: string
  taskType: string
  taskPrompt: string
  studentText: string
}

export interface WritingCorrectionResult {
  html: string
  score: number | null
  summary: string
  errors: string[]
}

export async function correctWriting(input: WritingCorrectionInput): Promise<WritingCorrectionResult> {
  // ── Pass 1: Audit (Haiku, temperature 0) ─────────────────────────────
  const audit = await auditWriting(input.studentText, input.taskType)

  const mark = markFromErrors(audit.errors.length)
  const langScore = languageScoreFromErrors(audit.errors.length)
  const minWordCount = minWords(input.taskType, input.level)
  const underLength = audit.word_count > 0 && audit.word_count < minWordCount
  const scoreInt = parseInt(mark.split('–')[0]) * 5

  // ── Pass 2: HTML Report (Sonnet, temperature 0) ───────────────────────
  const userMessage = `Produce the complete HTML correction report for this student's ${input.taskType}.

STUDENT: ${input.studentName || 'Anonymous'}
LEVEL: ${input.level}
MARK (fixed — use exactly): ${mark}
LANGUAGE SCORE (fixed — use exactly): ${langScore}
WORD COUNT: ~${audit.word_count}${underLength ? ` ⚠ UNDER LENGTH (minimum ~${minWordCount})` : ''}
TOTAL ERRORS: ${audit.errors.length}

TASK PROMPT:
${input.taskPrompt}

STUDENT'S TEXT:
${input.studentText}

PRE-AUDITED ERROR LIST (${audit.errors.length} errors — use ALL, add none):
${JSON.stringify(audit.errors, null, 2)}

Produce the complete HTML document now.`

  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 8192,
    temperature: 0,
    system: WRITING_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
  const raw = textBlock?.text || ''
  if (!raw) throw new Error('Failed to generate the correction.')

  // Extract metadata from HTML comment
  let score: number | null = scoreInt || null
  let summary = ''
  let errors: string[] = []
  const metaMatch = raw.match(/<!--\s*SOMERSET_META:(\{.*?\})\s*-->/)
  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1])
      score = meta.score ?? scoreInt
      summary = meta.summary ?? ''
      errors = meta.errors ?? []
    } catch { /* ignore parse errors */ }
  }

  return { html: raw, score, summary, errors }
}
