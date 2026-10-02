// Function 4 — Mock Exam Correction. Shared types + exam structure definitions.
// Spec: Somerset App/mock-correction-build-spec-v1.0.md (Phase 0: answer key digitisation).
//
// One deviation from the spec's data model: answers are keyed by a composite
// "part#qNumber" string, not a bare qNumber — B2 First numbers the Reading/UoE paper
// 1–52 and the Listening paper 1–30 separately, so bare numbers collide across papers.

export type ExamPart =
  | 'reading-p1' | 'reading-p5' | 'reading-p6' | 'reading-p7'
  | 'uoe-p2' | 'uoe-p3' | 'uoe-p4'
  | 'listening-p1' | 'listening-p2' | 'listening-p3' | 'listening-p4'

export type AnswerType = 'single-letter' | 'short-text' | 'letter-from-bank'

export interface ExamPartDefinition {
  part: ExamPart
  label: string                 // teacher-facing, e.g. "Reading Part 1 — Multiple-choice cloze"
  paper: 'reading-uoe' | 'listening'
  answerType: AnswerType
  options?: string[]            // click choices for letter answers; absent for short-text
  marksPerQuestion: number      // used for scoring in Phase 1
  qFrom: number
  qTo: number
}

export interface ExamDefinition {
  id: string
  title: string
  parts: ExamPartDefinition[]
}

export interface RawReading {
  part: ExamPart
  qNumber: number
  value: string
  confidence: 'high' | 'low'
  candidates?: string[]         // e.g. ["B","D"] when the mark is ambiguous
}

export function qKey(part: ExamPart, qNumber: number): string {
  return `${part}#${qNumber}`
}

// Standard Cambridge B2 First structure. Marks per the Model doc's totals:
// Reading 42 (8×1 + 6×2 + 6×2 + 10×1), UoE 28 (8+8+6×2), Listening 30.
export const B2_FIRST_PARTS: ExamPartDefinition[] = [
  { part: 'reading-p1',   label: 'Reading Part 1 — Multiple-choice cloze',  paper: 'reading-uoe', answerType: 'single-letter',    options: ['A', 'B', 'C', 'D'],                     marksPerQuestion: 1, qFrom: 1,  qTo: 8 },
  { part: 'uoe-p2',       label: 'Use of English Part 2 — Open cloze',      paper: 'reading-uoe', answerType: 'short-text',                                                          marksPerQuestion: 1, qFrom: 9,  qTo: 16 },
  { part: 'uoe-p3',       label: 'Use of English Part 3 — Word formation',  paper: 'reading-uoe', answerType: 'short-text',                                                          marksPerQuestion: 1, qFrom: 17, qTo: 24 },
  { part: 'uoe-p4',       label: 'Use of English Part 4 — Key word transformations', paper: 'reading-uoe', answerType: 'short-text',                                                 marksPerQuestion: 2, qFrom: 25, qTo: 30 },
  { part: 'reading-p5',   label: 'Reading Part 5 — Multiple choice',        paper: 'reading-uoe', answerType: 'single-letter',    options: ['A', 'B', 'C', 'D'],                     marksPerQuestion: 2, qFrom: 31, qTo: 36 },
  { part: 'reading-p6',   label: 'Reading Part 6 — Gapped text',            paper: 'reading-uoe', answerType: 'letter-from-bank', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],      marksPerQuestion: 2, qFrom: 37, qTo: 42 },
  { part: 'reading-p7',   label: 'Reading Part 7 — Multiple matching',      paper: 'reading-uoe', answerType: 'letter-from-bank', options: ['A', 'B', 'C', 'D'],                     marksPerQuestion: 1, qFrom: 43, qTo: 52 },
  { part: 'listening-p1', label: 'Listening Part 1 — Multiple choice',      paper: 'listening',   answerType: 'single-letter',    options: ['A', 'B', 'C'],                          marksPerQuestion: 1, qFrom: 1,  qTo: 8 },
  { part: 'listening-p2', label: 'Listening Part 2 — Sentence completion',  paper: 'listening',   answerType: 'short-text',                                                          marksPerQuestion: 1, qFrom: 9,  qTo: 18 },
  { part: 'listening-p3', label: 'Listening Part 3 — Multiple matching',    paper: 'listening',   answerType: 'letter-from-bank', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], marksPerQuestion: 1, qFrom: 19, qTo: 23 },
  { part: 'listening-p4', label: 'Listening Part 4 — Multiple choice',      paper: 'listening',   answerType: 'single-letter',    options: ['A', 'B', 'C'],                          marksPerQuestion: 1, qFrom: 24, qTo: 30 },
]

// Exams seeded on first use. Test 6 is the exam Mock 1 was sat on (10 Jul 2026).
export const SEED_EXAMS: ExamDefinition[] = [
  { id: 'test4-b2first', title: 'Cambridge FCE Style Test', parts: B2_FIRST_PARTS },
  { id: 'test6-b2first', title: 'Cambridge B2 First — Test 6', parts: B2_FIRST_PARTS },
  { id: 'test7-b2first', title: 'Cambridge B2 First — Test 7', parts: B2_FIRST_PARTS },
]

export async function ensureMockExamsSeeded(db: { prepare(sql: string): { get(...p: unknown[]): Promise<any>; run(...p: unknown[]): Promise<any> } }): Promise<void> {
  for (const exam of SEED_EXAMS) {
    const existing = await db.prepare('SELECT id FROM mock_exams WHERE id = ?').get(exam.id)
    if (!existing) {
      await db.prepare('INSERT INTO mock_exams (id, title, definition) VALUES (?, ?, ?)')
        .run(exam.id, exam.title, JSON.stringify(exam.parts))
    }
  }
}

export interface PartScore { correct: number; outOf: number; points: number; pointsOutOf: number }

const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, ' ')

// Keys may list accepted alternatives separated by "/", e.g. "which / that".
export function matchesKey(answer: string, key: string): boolean {
  const a = norm(answer)
  if (!a) return false
  return key.split('/').some(alt => norm(alt) === a)
}

// Shared by the CBT submit route (score-on-arrival) and the report generator
// (re-score on demand, e.g. after a key is entered/edited later).
export function scorePaper(
  paper: 'reading-uoe' | 'listening',
  answers: Record<string, string>,
  key: Record<string, string>
): Record<string, PartScore> {
  const score: Record<string, PartScore> = {}
  const paperParts = B2_FIRST_PARTS.filter(p => p.paper === paper)
  for (const part of paperParts) {
    let correct = 0
    let keyed = 0
    for (let q = part.qFrom; q <= part.qTo; q++) {
      const k = key[`${part.part}#${q}`]
      if (!k) continue
      keyed++
      if (matchesKey(answers[`${part.part}#${q}`] || '', k)) correct++
    }
    score[part.part] = { correct, outOf: keyed, points: correct * part.marksPerQuestion, pointsOutOf: keyed * part.marksPerQuestion }
  }
  return score
}
