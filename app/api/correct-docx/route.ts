import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import {
  AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph,
  ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx'
import { requireSessionOrCode } from '@/lib/authz'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GREEN = '6BAE2E'
const DARK = '1A1A1A'
const LIGHT_GREEN = 'EAF4DA'
const ALT_ROW = 'F5FAF0'
const RED_TEXT = 'C0392B'
const GREEN_TEXT = '2D6A0A'

// Page metrics (A4, 1-inch margins)
const CONTENT_WIDTH = 9026
const COL_CRITERION = 2500
const COL_SCORE = 800
const COL_COMMENT = CONTENT_WIDTH - COL_CRITERION - COL_SCORE
const COL_HALF = Math.floor(CONTENT_WIDTH / 2)

const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 }

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: border, bottom: border, left: border, right: border }

const SYSTEM_PROMPT = `You are the Somerset Language Centre writing correction agent.
Analyse the student's writing and return a JSON object — no markdown, no explanation, just the raw JSON.

The JSON must have exactly this shape:
{
  "mark": "e.g. 13–14 / 20",
  "evaluation": "2 sentences max. One verdict, one qualification.",
  "criteria": [
    { "name": "Content", "score": "X/5", "comment": "1 sentence" },
    { "name": "Communicative Achievement", "score": "X/5", "comment": "1 sentence" },
    { "name": "Organisation", "score": "X/5", "comment": "1 sentence" },
    { "name": "Language", "score": "X/5", "comment": "1 sentence" }
  ],
  "strengths": "Short prose paragraph. Lead with a clear verdict.",
  "improvements": "Short prose paragraph. Max 2–3 sentences.",
  "corrections": [
    { "you_wrote": "the original phrase", "better_version": "the correction" }
  ],
  "feedback": "4–6 sentences direct to student. Warm but analytical."
}

Corrections: include minimum 4 entries. Italicise nothing — this is plain text for a Word file.
Never use the word 'test' anywhere.`

function heading(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, color: GREEN, font: 'Arial' })],
    spacing: { before: 280, after: 100 },
  })
}

function body(text: string, italic = false) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, italics: italic, font: 'Arial', color: DARK })],
    spacing: { after: 60 },
  })
}

function headerCell(text: string, width: number) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { fill: GREEN, type: ShadingType.CLEAR },
    margins: CELL_MARGINS,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20, font: 'Arial' })],
    })],
  })
}

function cell(text: string, width: number, fill = 'FFFFFF', color = DARK, italic = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { fill, type: ShadingType.CLEAR },
    margins: CELL_MARGINS,
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: 'Arial', color, italics: italic })],
    })],
  })
}

interface CorrectionData {
  mark: string
  evaluation: string
  criteria: Array<{ name: string; score: string; comment: string }>
  strengths: string
  improvements: string
  corrections: Array<{ you_wrote: string; better_version: string }>
  feedback: string
}

function buildDoc(d: CorrectionData, studentName: string, level: string, taskType: string): Document {
  const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22, color: DARK } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [

        // ── Title bar ──────────────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: 'Somerset Language Centre — Writing Correction', bold: true, size: 26, color: 'FFFFFF', font: 'Arial' })],
          shading: { fill: GREEN, type: ShadingType.CLEAR },
          spacing: { before: 0, after: 0 },
          indent: { left: 160, right: 160 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN } },
        }),

        // ── Student info ───────────────────────────────────────────────────
        new Paragraph({
          children: [
            new TextRun({ text: studentName ? `${studentName}  ` : '', bold: true, size: 22, font: 'Arial' }),
            new TextRun({ text: `${level}  ·  ${taskType}  ·  ${now}`, size: 22, color: '777777', font: 'Arial' }),
          ],
          spacing: { before: 200, after: 160 },
        }),

        // ── Mark ───────────────────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: d.mark, bold: true, size: 48, color: GREEN, font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 200 },
        }),

        // ── General evaluation ─────────────────────────────────────────────
        heading('General Evaluation'),
        body(d.evaluation, true),

        // ── Criteria table ─────────────────────────────────────────────────
        heading('Cambridge Criteria'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [COL_CRITERION, COL_SCORE, COL_COMMENT],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                headerCell('Criterion', COL_CRITERION),
                headerCell('Score', COL_SCORE),
                headerCell('Notes', COL_COMMENT),
              ],
            }),
            ...d.criteria.map((c, i) =>
              new TableRow({
                children: [
                  cell(c.name, COL_CRITERION, i % 2 === 0 ? 'FFFFFF' : ALT_ROW, DARK, true),
                  cell(c.score, COL_SCORE, i % 2 === 0 ? 'FFFFFF' : ALT_ROW, GREEN, true),
                  cell(c.comment, COL_COMMENT, i % 2 === 0 ? 'FFFFFF' : ALT_ROW),
                ],
              })
            ),
          ],
        }),

        // ── Strengths ──────────────────────────────────────────────────────
        heading('Strengths'),
        body(d.strengths),

        // ── Improvements ───────────────────────────────────────────────────
        heading('Main Points to Improve'),
        body(d.improvements),

        // ── Corrections table ──────────────────────────────────────────────
        heading('Corrections'),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [COL_HALF, CONTENT_WIDTH - COL_HALF],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                headerCell('You wrote', COL_HALF),
                headerCell('Better version', CONTENT_WIDTH - COL_HALF),
              ],
            }),
            ...d.corrections.map((c, i) =>
              new TableRow({
                children: [
                  cell(c.you_wrote, COL_HALF, i % 2 === 0 ? 'FFFFFF' : ALT_ROW, RED_TEXT, true),
                  cell(c.better_version, CONTENT_WIDTH - COL_HALF, i % 2 === 0 ? 'FFFFFF' : ALT_ROW, GREEN_TEXT),
                ],
              })
            ),
          ],
        }),

        // ── Teacher feedback ───────────────────────────────────────────────
        heading('Teacher Feedback'),
        new Paragraph({
          children: [new TextRun({ text: d.feedback, size: 22, italics: true, font: 'Arial', color: DARK })],
          shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN } },
          indent: { left: 200 },
          spacing: { before: 60, after: 60 },
        }),

        // ── Note ───────────────────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: 'Somerset Language Centre, Valencia', size: 18, color: 'AAAAAA', font: 'Arial' })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 400 },
        }),
      ],
    }],
  })
}

export async function POST(req: NextRequest) {
  if (!(await requireSessionOrCode(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { studentName, level, taskType, taskPrompt, studentText } = await req.json()

    const userMessage = `Please correct this student's writing.

STUDENT: ${studentName || 'Anonymous'}
LEVEL: ${level}
TASK TYPE: ${taskType}

TASK PROMPT:
${taskPrompt}

STUDENT'S ANSWER:
${studentText}

Return only the JSON object.`

    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    // Sonnet 5 can emit a 'thinking' block before 'text' — never assume content[0] is the answer.
    const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
    const raw = textBlock?.text.trim() || '{}'
    const data: CorrectionData = JSON.parse(raw)

    const doc = buildDoc(data, studentName || '', level, taskType)
    const buffer = await Packer.toBuffer(doc)

    const filename = `correction-${(studentName || 'student').toLowerCase().replace(/\s+/g, '-')}.docx`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[correct-docx]', err)
    return NextResponse.json({ error: 'Word generation failed.' }, { status: 500 })
  }
}
