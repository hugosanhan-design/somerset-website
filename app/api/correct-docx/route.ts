import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import {
  AlignmentType, BorderStyle, Document, Packer, Paragraph,
  ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx'
import { requireSessionOrCode } from '@/lib/authz'
import { auditWriting, markFromErrors, languageScoreFromErrors, minWords } from '@/lib/writingAudit'

// Two-pass architecture (Oct 2026):
// Pass 1 — Haiku, temperature 0 → systematic category-by-category error audit
// Pass 2 — Sonnet, temperature 0 → DOCX report built from the audit list
// Mark anchored to error count → consistent results every run.

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GREEN = '6BAE2E'
const DARK = '1A1A1A'
const LIGHT_GREEN = 'EAF4DA'
const ALT_ROW = 'F5FAF0'
const RED_TEXT = 'C0392B'
const GREEN_TEXT = '2D6A0A'
const CONTENT_WIDTH = 9026
const COL_CRITERION = 2500
const COL_SCORE = 800
const COL_COMMENT = CONTENT_WIDTH - COL_CRITERION - COL_SCORE
const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 }
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: border, bottom: border, left: border, right: border }

const REPORT_SYSTEM_PROMPT = `You are the Somerset Language Centre writing correction agent. You receive a student essay AND a pre-audited error list. Write the correction report using that list.

CRITICAL RULES:
1. Do NOT add errors not in the list. Do NOT remove errors from the list.
2. The mark and Language score are provided — use them exactly.
3. Return raw JSON only — no markdown, no explanation.

JSON shape:
{
  "evaluation": "2 sentences. One verdict, one qualification.",
  "content_score": "X/5",
  "content_comment": "1 sentence",
  "achievement_score": "X/5",
  "achievement_comment": "1 sentence",
  "organisation_score": "X/5",
  "organisation_comment": "1 sentence",
  "strengths": "Short prose paragraph. One clear verdict, then specific evidence from text.",
  "improvements": "Short prose paragraph. Max 2–3 sentences. Name specific error categories.",
  "feedback": "4–6 sentences direct to student. Open positive → corrections → level-reference close. Be careful with [X]. Try to... Also remember that... [Adj] B1/B2/C1 effort. Never: excellent, amazing, great job."
}

No bullet points in prose sections. Short declarative sentences. Name exact errors, not vague categories.`

interface ReportData {
  evaluation: string
  content_score: string
  content_comment: string
  achievement_score: string
  achievement_comment: string
  organisation_score: string
  organisation_comment: string
  strengths: string
  improvements: string
  feedback: string
}

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
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20, font: 'Arial' })] })],
  })
}

function dataCell(text: string, width: number, fill = 'FFFFFF', color = DARK, italic = false, bold = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { fill, type: ShadingType.CLEAR },
    margins: CELL_MARGINS,
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: 'Arial', color, italics: italic, bold })] })],
  })
}

export async function POST(req: NextRequest) {
  if (!(await requireSessionOrCode(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { studentName, level, taskType, taskPrompt, studentText } = await req.json()

    // ── Pass 1: Audit (Haiku, temperature 0) ─────────────────────────────
    const audit = await auditWriting(studentText, taskType)

    const mark = markFromErrors(audit.errors.length)
    const langScore = languageScoreFromErrors(audit.errors.length)
    const minWordCount = minWords(taskType, level)
    const underLength = audit.word_count > 0 && audit.word_count < minWordCount
    const isFormal = ['report', 'essay', 'article', 'formal letter', 'formal email'].some(t => taskType.toLowerCase().includes(t))
    const contractionCount = audit.errors.filter(e => e.category.toLowerCase() === 'contractions').length

    const byCat: Record<string, number> = {}
    for (const e of audit.errors) byCat[e.category] = (byCat[e.category] || 0) + 1

    // ── Pass 2: Report JSON (Sonnet, temperature 0) ───────────────────────
    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      temperature: 0,
      system: REPORT_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Write the correction report for this student's ${taskType}.

STUDENT: ${studentName || 'Anonymous'}
LEVEL: ${level}
MARK (fixed): ${mark}
LANGUAGE SCORE (fixed): ${langScore}
TOTAL ERRORS: ${audit.errors.length}

TASK PROMPT:
${taskPrompt}

STUDENT'S TEXT:
${studentText}

PRE-AUDITED ERROR LIST (use ALL, add none):
${JSON.stringify(audit.errors, null, 2)}

Return the JSON.`,
      }],
    })

    const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
    const raw = textBlock?.text?.trim() || ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Report pass returned no JSON.')
    const report = JSON.parse(jsonMatch[0]) as ReportData

    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const colA = Math.floor(CONTENT_WIDTH * 0.28)
    const colB = Math.floor(CONTENT_WIDTH * 0.28)
    const colC = Math.floor(CONTENT_WIDTH * 0.16)
    const colD = CONTENT_WIDTH - colA - colB - colC

    const doc = new Document({
      styles: { default: { document: { run: { font: 'Arial', size: 22, color: DARK } } } },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // Title bar
          new Paragraph({
            children: [new TextRun({ text: 'Somerset Language Centre — Writing Correction', bold: true, size: 26, color: 'FFFFFF', font: 'Arial' })],
            shading: { fill: GREEN, type: ShadingType.CLEAR },
            spacing: { before: 0, after: 0 },
            indent: { left: 160, right: 160 },
          }),

          // Student info
          new Paragraph({
            children: [
              new TextRun({ text: studentName ? `${studentName}  ` : '', bold: true, size: 22, font: 'Arial' }),
              new TextRun({ text: `${level}  ·  ${taskType}  ·  ${now}`, size: 22, color: '777777', font: 'Arial' }),
            ],
            spacing: { before: 200, after: 60 },
          }),

          // Word count
          new Paragraph({
            children: [
              new TextRun({ text: `Word count: ~${audit.word_count} words`, size: 20, color: underLength ? 'C0392B' : '777777', font: 'Arial', italics: underLength }),
              ...(underLength ? [new TextRun({ text: `  ⚠ Under length (minimum ~${minWordCount} words)`, size: 20, color: 'C0392B', bold: true, font: 'Arial' })] : []),
            ],
            spacing: { before: 0, after: 160 },
          }),

          // Mark
          new Paragraph({
            children: [new TextRun({ text: mark, bold: true, size: 52, color: GREEN, font: 'Arial' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
          }),

          // Error badge
          new Paragraph({
            children: [new TextRun({
              text: `${audit.errors.length} error${audit.errors.length !== 1 ? 's' : ''} identified`,
              size: 20, color: audit.errors.length > 10 ? 'C0392B' : '888888', font: 'Arial', bold: true,
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
          }),

          // Contraction warning
          ...(isFormal && contractionCount > 0 ? [
            new Paragraph({
              children: [new TextRun({
                text: `⚠ ${contractionCount} contraction${contractionCount > 1 ? 's' : ''} in formal writing. Contractions are not acceptable in ${taskType}s.`,
                size: 20, color: 'C0392B', bold: true, font: 'Arial',
              })],
              shading: { fill: 'FDECEA', type: ShadingType.CLEAR },
              indent: { left: 160 },
              spacing: { before: 0, after: 200 },
            }),
          ] : []),

          // Evaluation
          heading('General Evaluation'),
          body(report.evaluation, true),

          // Criteria table
          heading('Cambridge Criteria'),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: [COL_CRITERION, COL_SCORE, COL_COMMENT],
            rows: [
              new TableRow({
                tableHeader: true,
                children: [headerCell('Criterion', COL_CRITERION), headerCell('Score', COL_SCORE), headerCell('Notes', COL_COMMENT)],
              }),
              ...[
                { name: 'Content', score: report.content_score, comment: report.content_comment },
                { name: 'Communicative Achievement', score: report.achievement_score, comment: report.achievement_comment },
                { name: 'Organisation', score: report.organisation_score, comment: report.organisation_comment },
                { name: 'Language', score: langScore, comment: `${audit.errors.length} errors across ${Object.keys(byCat).length} categories` },
              ].map((c, i) =>
                new TableRow({
                  children: [
                    dataCell(c.name, COL_CRITERION, i % 2 === 0 ? 'FFFFFF' : ALT_ROW, DARK, true),
                    dataCell(c.score, COL_SCORE, i % 2 === 0 ? 'FFFFFF' : ALT_ROW, GREEN, false, true),
                    dataCell(c.comment, COL_COMMENT, i % 2 === 0 ? 'FFFFFF' : ALT_ROW),
                  ],
                })
              ),
            ],
          }),

          // Error summary
          ...(Object.keys(byCat).length > 0 ? [
            heading('Error Summary by Category'),
            new Table({
              width: { size: CONTENT_WIDTH, type: WidthType.DXA },
              columnWidths: [Math.floor(CONTENT_WIDTH * 0.7), Math.floor(CONTENT_WIDTH * 0.3)],
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: [headerCell('Category', Math.floor(CONTENT_WIDTH * 0.7)), headerCell('Count', Math.floor(CONTENT_WIDTH * 0.3))],
                }),
                ...Object.entries(byCat).map(([cat, count], i) =>
                  new TableRow({
                    children: [
                      dataCell(cat, Math.floor(CONTENT_WIDTH * 0.7), i % 2 === 0 ? 'FFFFFF' : ALT_ROW),
                      dataCell(String(count), Math.floor(CONTENT_WIDTH * 0.3), i % 2 === 0 ? 'FFFFFF' : ALT_ROW, count >= 3 ? RED_TEXT : GREEN_TEXT, false, true),
                    ],
                  })
                ),
              ],
            }),
          ] : []),

          // Strengths
          heading('Strengths'),
          body(report.strengths),

          // Improvements
          heading('Main Points to Improve'),
          body(report.improvements),

          // Corrections table
          heading(`Corrections (${audit.errors.length})`),
          new Table({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            columnWidths: [colA, colB, colC, colD],
            rows: [
              new TableRow({
                tableHeader: true,
                children: [headerCell('You wrote', colA), headerCell('Better version', colB), headerCell('Category', colC), headerCell('Why', colD)],
              }),
              ...audit.errors.map((e, i) =>
                new TableRow({
                  children: [
                    dataCell(e.you_wrote, colA, i % 2 === 0 ? 'FFFFFF' : ALT_ROW, RED_TEXT, true),
                    dataCell(e.better_version, colB, i % 2 === 0 ? 'FFFFFF' : ALT_ROW, GREEN_TEXT),
                    dataCell(e.category, colC, i % 2 === 0 ? 'FFFFFF' : ALT_ROW, '777777'),
                    dataCell(e.reason, colD, i % 2 === 0 ? 'FFFFFF' : ALT_ROW),
                  ],
                })
              ),
            ],
          }),

          // Teacher feedback
          heading('Teacher Feedback'),
          new Paragraph({
            children: [new TextRun({ text: report.feedback, size: 22, italics: true, font: 'Arial', color: DARK })],
            shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR },
            border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN } },
            indent: { left: 200 },
            spacing: { before: 60, after: 60 },
          }),

          // Footer
          new Paragraph({
            children: [new TextRun({ text: 'Somerset Language Centre, Valencia', size: 18, color: 'AAAAAA', font: 'Arial' })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
          }),
        ],
      }],
    })

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
