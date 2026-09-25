import Anthropic from '@anthropic-ai/sdk'
import type { ImageBlockParam, TextBlockParam } from '@anthropic-ai/sdk/resources/messages'
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { ExamPartDefinition, RawReading } from '@/lib/mocks'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const maxDuration = 180

// Phase 0, step 2 of the build spec: photographed answer key → Claude vision →
// qNumber → RawReading. Never trusted directly — everything goes through the
// click-to-confirm review screen before it becomes an AnswerKey.
//
// Reliability design (validated 17 Jul 2026 against Alex's real Mock 1 sheet):
// - A full A4 page in one image is unreadable — the API downscales to ~1568px and
//   pencil marks/handwriting collapse. The client therefore uploads, per photo, a
//   downscaled context image PLUS ~6 overlapping high-resolution tiles.
// - A single read silently misreads (e.g. "FITS" → "fists", ambiguous bubbles read
//   differently run to run, always claiming high confidence). Each photo is therefore
//   read TWICE independently and any disagreement is flagged for teacher review
//   rather than resolved by the model.

function buildPrompt(parts: ExamPartDefinition[]): string {
  const structure = parts.map(p =>
    `- part "${p.part}" (${p.label}): questions ${p.qFrom}–${p.qTo}, answer type ${p.answerType}` +
    (p.options ? `, valid options: ${p.options.join('/')}` : ', free text answer')
  ).join('\n')

  return `These images show ONE page of a Cambridge B2 First ANSWER KEY (the correct answers, printed or handwritten). The FIRST image is the full page for layout context; the following images are high-resolution crops of the same page — use the crops for reading precision. The exam has this structure — note that the Reading/Use of English paper and the Listening paper each number their questions independently:

${structure}

Read every answer visible on this page and return ONLY a JSON object, no commentary:

{"readings": [{"part": "<part id from the list above>", "qNumber": <number>, "value": "<answer>", "confidence": "high" | "low", "candidates": ["..."]} , ...]}

Rules:
- "value" is your best reading. For letter answers, a single uppercase letter. For free-text answers, the exact word/phrase as written (lowercase unless it is a proper noun); if alternatives are listed (e.g. "which / that"), keep them joined with " / ".
- Multiple-choice grids: each question row prints the letters with a small answer box under EACH letter. An unmarked box is plain white; the marked answer is the box shaded, filled, scribbled or underlined in pencil. Grey row banding is printed on the sheet — it is NOT a mark. Work box by box under each letter before deciding, and if no box is clearly marked or more than one could be, set confidence "low" and list every plausible letter in "candidates".
- Transcribe handwriting letter-for-letter EXACTLY as written, even if it is misspelled or not a real English word — never silently correct it. Where letters are written one per box, read box by box and count the letters. If what is written looks like a misspelling of an intended word (e.g. DANAGED where "damaged" was clearly meant), report the letters actually written as "value", set confidence to "low", and put the correctly-spelled word in "candidates".
- "confidence" must be "low" whenever the mark or writing is ambiguous, smudged, cut off, or you are not certain — never guess silently.
- Report each question number at most once. Only include questions actually visible in these images; do not invent readings for questions you cannot see.
- If a letter answer shows something outside the valid options for that part, still report what you see and set confidence to "low".`
}

async function fileToBlock(file: File): Promise<ImageBlockParam> {
  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const mediaType = (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
    ? file.type : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  return { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } }
}

async function readOnce(blocks: ImageBlockParam[], prompt: TextBlockParam, validParts: Set<string>): Promise<RawReading[]> {
  const message = await client.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 8192,
    messages: [{ role: 'user', content: [...blocks, prompt] }],
  })
  const raw = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return []
  const parsed = JSON.parse(jsonMatch[0]) as { readings: RawReading[] }
  return (parsed.readings || []).filter(r =>
    r && validParts.has(r.part) && typeof r.qNumber === 'number' && typeof r.value === 'string'
  )
}

// Merge any number of independent reading lists for the same page(s). Agreement on a
// question keeps the better confidence; ANY disagreement (across the two runs, or
// duplicate reports from overlapping tiles) demotes it to a flagged low-confidence
// reading whose candidates are every value seen — the teacher decides, not the model.
function mergeReadings(lists: RawReading[][]): RawReading[] {
  const norm = (v: string) => v.trim().toLowerCase()
  const merged = new Map<string, RawReading>()
  for (const list of lists) {
    for (const r of list) {
      const key = `${r.part}#${r.qNumber}`
      const existing = merged.get(key)
      if (!existing) {
        merged.set(key, { ...r })
        continue
      }
      const candidates = new Set((existing.candidates || []).concat(r.candidates || []))
      if (norm(existing.value) !== norm(r.value)) {
        candidates.add(existing.value)
        candidates.add(r.value)
        merged.set(key, { ...existing, confidence: 'low', candidates: Array.from(candidates) })
      } else {
        merged.set(key, {
          ...existing,
          confidence: existing.confidence === 'high' && r.confidence === 'high' ? 'high' : 'low',
          candidates: candidates.size > 0 ? Array.from(candidates) : undefined,
        })
      }
    }
  }
  // Case-only or self-referential candidate lists aren't real disagreements — drop them
  // so they don't reach the review UI as flags.
  return Array.from(merged.values()).map(r => {
    const distinct = (r.candidates || []).filter((c, i, arr) =>
      arr.findIndex(x => norm(x) === norm(c)) === i && norm(c) !== norm(r.value))
    return { ...r, candidates: distinct.length > 0 ? [r.value, ...distinct] : undefined }
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const examId = formData.get('examId') as string | null
    if (!examId) return NextResponse.json({ error: 'No examId provided' }, { status: 400 })

    const db = await getDb()
    const exam = await db.prepare('SELECT definition FROM mock_exams WHERE id = ?').get(examId) as { definition: string } | undefined
    if (!exam) return NextResponse.json({ error: 'Unknown exam' }, { status: 404 })
    const parts: ExamPartDefinition[] = JSON.parse(exam.definition)
    const validParts = new Set(parts.map(p => p.part))
    const prompt: TextBlockParam = { type: 'text', text: buildPrompt(parts) }

    // The client sends, per photo i: photo_<i>_context plus photo_<i>_tile_<j>.
    // (A plain `images` field still works as one single-image group — no tiles.)
    const groups: ImageBlockParam[][] = []
    for (let i = 0; ; i++) {
      const context = formData.get(`photo_${i}_context`) as File | null
      if (!context) break
      const blocks = [await fileToBlock(context)]
      for (let j = 0; ; j++) {
        const tile = formData.get(`photo_${i}_tile_${j}`) as File | null
        if (!tile) break
        blocks.push(await fileToBlock(tile))
      }
      groups.push(blocks)
    }
    for (const legacy of formData.getAll('images') as File[]) groups.push([await fileToBlock(legacy)])
    if (groups.length === 0) return NextResponse.json({ error: 'No images provided' }, { status: 400 })

    // Two independent reads per photo, all photos in parallel; merge everything.
    const perGroup = await Promise.all(groups.map(blocks =>
      Promise.all([readOnce(blocks, prompt, validParts), readOnce(blocks, prompt, validParts)])
    ))
    const readings = mergeReadings(perGroup.flat())

    if (readings.length === 0) return NextResponse.json({ error: 'Could not read the images — try clearer photos.' }, { status: 502 })
    return NextResponse.json({ readings })
  } catch (err) {
    console.error('[mocks/read-key]', err)
    return NextResponse.json({ error: 'Reading the answer key failed. Please try again.' }, { status: 500 })
  }
}
