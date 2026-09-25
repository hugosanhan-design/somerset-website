import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'
import { ERROR_TAGS } from '@/data/errorTags'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CEFR_BANDS: Record<string, [number, number]> = {
  A1: [0, 20], A2: [20, 40], B1: [40, 60], B2: [60, 80], C1: [80, 100],
}

function extractText(message: Anthropic.Message): string {
  const block = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
  return block?.text || ''
}

function extractJson(raw: string): any {
  const match = raw.match(/\{[\s\S]*\}/)
  return JSON.parse(match ? match[0] : raw)
}

function tagLabel(key: string): string {
  return ERROR_TAGS.find(t => t.key === key)?.label || key
}

function scoreColor(score: number): string {
  if (score >= 80) return '#6BAE2E'
  if (score >= 65) return '#f59e0b'
  return '#ef4444'
}

function renderChartSvg(checkins: { date: string; score: number }[], targetLevel: string): string {
  const w = 600, h = 140, pad = 32
  const points = checkins.map((c, i) => {
    const x = pad + (i / Math.max(checkins.length - 1, 1)) * (w - 2 * pad)
    const y = h - pad - ((c.score / 100) * (h - 2 * pad))
    return { x, y, s: c.score }
  })
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const band = CEFR_BANDS[targetLevel]
  const bandY1 = band ? h - pad - ((band[1] / 100) * (h - 2 * pad)) : 0
  const bandY2 = band ? h - pad - ((band[0] / 100) * (h - 2 * pad)) : 0

  const gridlines = [25, 50, 75, 100].map(v => {
    const y = h - pad - ((v / 100) * (h - 2 * pad))
    return `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="#f3f4f6" stroke-width="1" />
      <text x="${pad - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="#9ca3af">${v}</text>`
  }).join('')

  const bandRect = band
    ? `<rect x="${pad}" y="${bandY1}" width="${w - 2 * pad}" height="${bandY2 - bandY1}" fill="#6BAE2E" fill-opacity="0.08" />
       <text x="${w - pad}" y="${(bandY1 + bandY2) / 2 + 3}" text-anchor="end" font-size="9" fill="#6BAE2E" font-weight="700">${targetLevel} target band</text>`
    : ''

  const dots = points.map((p, i) => `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="#6BAE2E" />
    <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" font-size="9" fill="#374151" font-weight="600">${p.s}</text>
    <text x="${p.x}" y="${h - 4}" text-anchor="middle" font-size="8" fill="#9ca3af">${checkins[i]?.date?.slice(5)}</text>
  `).join('')

  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;height:auto;display:block">
    ${bandRect}${gridlines}
    <polyline points="${polyline}" fill="none" stroke="#6BAE2E" stroke-width="2.5" stroke-linejoin="round" />
    ${dots}
  </svg>`
}

const SYSTEM_PROMPT = `You are Hugo, the director of Somerset Language Centre, Valencia, writing to a parent and preparing practice material for their child.
You will be given a student's name, target CEFR course level, their most recent monthly check-in score and by-skill breakdown, their check-in score history, and their top recurring error tags (a controlled vocabulary, not free text).

Write in Hugo's voice: warm, direct, specific — never generic praise, never corporate. Reference a concrete detail from the data (a skill that's flat, a score that moved, a specific error pattern). Include one light Valencia/Spain touch where natural.

Return ONLY valid JSON, no prose, in this exact shape:
{
  "parent_summary_es": "2-4 short paragraphs in Spanish, Hugo's voice, opens with a greeting using the student's first name, ends with 'Un saludo, Hugo'. Interprets the current level in plain terms a parent understands (not just a number) and names ONE concrete strength and ONE concrete area to work on, grounded in the actual data given.",
  "level_interpretation_es": "One sentence in Spanish translating the current check-in score/CEFR estimate into what it means practically for this student at this point in the course.",
  "practice_title_en": "Short title for the student practice page, e.g. 'This month's focus: prepositions'",
  "practice_intro_en": "1-2 friendly sentences in English, directly addressing the student, introducing why these exercises were chosen (their own error patterns).",
  "practice_exercises": [
    { "instruction_en": "clear instruction for one exercise targeting one of the student's top error tags", "items": ["exercise item 1", "exercise item 2", "exercise item 3", "exercise item 4"] }
  ]
}
Produce 2-3 practice_exercises, each targeting a different one of the given error tags. Never use the word "test" anywhere — say "check-in", "review", or "practice" instead.`

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(params.id) as Record<string, any> | undefined
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const entries = await db.prepare('SELECT * FROM work_entries WHERE student_id = ? ORDER BY date ASC').all(params.id) as Record<string, any>[]
  const checkins = entries
    .filter(e => e.type === 'checkin' && e.score != null)
    .map(e => ({ date: e.date, score: e.score, cefr_estimate: e.cefr_estimate || '' }))

  if (checkins.length === 0) {
    return NextResponse.json({ error: 'No monthly check-ins logged yet for this student. Log one from the group roster first.' }, { status: 400 })
  }

  const latestCheckin = checkins[checkins.length - 1]
  const latestEntry = entries.filter(e => e.type === 'checkin').slice(-1)[0]
  let bySkill: Record<string, number> | null = null
  if (latestEntry?.by_skill) {
    try { bySkill = JSON.parse(latestEntry.by_skill) } catch { bySkill = null }
  }

  const patternCount: Record<string, number> = {}
  entries.forEach(e => {
    let patterns: string[] = []
    try { patterns = JSON.parse(e.ai_error_patterns || '[]') } catch { patterns = [] }
    patterns.forEach(p => { patternCount[p] = (patternCount[p] || 0) + 1 })
  })
  const topTags = Object.entries(patternCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k)
  const topTagLabels = topTags.map(tagLabel)

  const userMessage = `STUDENT: ${student.name}
TARGET COURSE LEVEL: ${student.level || 'not set'}
LATEST CHECK-IN: score ${latestCheckin.score}/100, CEFR estimate ${latestCheckin.cefr_estimate || 'not given'}, date ${latestCheckin.date}
CHECK-IN HISTORY: ${JSON.stringify(checkins)}
BY-SKILL BREAKDOWN (latest): ${JSON.stringify(bySkill)}
TOP RECURRING ERROR TAGS: ${JSON.stringify(topTagLabels)}

Produce the JSON now.`

  let content
  let lastError: unknown = null
  for (let attempt = 0; attempt < 2 && !content; attempt++) {
    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })
    try {
      content = extractJson(extractText(message))
    } catch (e) {
      lastError = e
      console.error(`[progress] attempt ${attempt} failed. stop_reason:`, message.stop_reason, 'blocks:', message.content.map(c => c.type))
    }
  }
  if (!content) {
    console.error('[progress] both attempts failed:', lastError)
    return NextResponse.json({ error: 'Failed to generate the report. Please try again.' }, { status: 502 })
  }

  const chartSvg = renderChartSvg(checkins, student.level || '')
  const today = new Date().toISOString().slice(0, 10)

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Informe de progreso — ${student.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, 'Liberation Sans', sans-serif; color: #1A1A1A; background: #fff; font-size: 14px; line-height: 1.6; }
  header { background: #6BAE2E; color: #fff; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }
  header .logo { font-size: 20px; font-weight: 700; }
  header .doc-title { font-size: 13px; opacity: 0.9; }
  .content { max-width: 720px; margin: 0 auto; padding: 28px 32px 60px; }
  .level-box { background: #EAF4DA; border-left: 4px solid #6BAE2E; padding: 14px 18px; border-radius: 4px; margin-bottom: 20px; }
  .level-box .level { font-size: 22px; font-weight: 700; color: #2d6a0a; }
  .level-box .sub { font-size: 13px; color: #4b5563; margin-top: 4px; }
  h2 { font-size: 16px; color: #1A1A1A; margin: 28px 0 12px; border-bottom: 2px solid #EAF4DA; padding-bottom: 6px; }
  .summary p { margin-bottom: 12px; font-size: 14px; }
  .chart-wrap { background: #fafafa; border: 1px solid #e8e8e8; border-radius: 6px; padding: 16px; }
  .skills { margin-top: 16px; }
  .skill-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; font-size: 12.5px; }
  .skill-name { width: 90px; text-transform: capitalize; color: #374151; flex-shrink: 0; }
  .skill-track { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
  .skill-fill { height: 100%; }
  .practice-section { page-break-before: always; padding-top: 20px; }
  .practice-title { font-size: 19px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px; }
  .practice-intro { font-size: 14px; color: #374151; margin-bottom: 20px; }
  .exercise { margin-bottom: 18px; }
  .exercise .instruction { font-weight: 700; font-size: 14px; margin-bottom: 8px; }
  .exercise ol { padding-left: 20px; }
  .exercise li { margin-bottom: 10px; line-height: 2; }
  footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 30px; }
  @media print { .page-break { page-break-before: always; } }
</style>
</head>
<body>
  <header>
    <span class="logo">Somerset Language Centre</span>
    <span class="doc-title">Informe de progreso mensual · ${today}</span>
  </header>
  <div class="content">
    <div class="level-box">
      <div class="level">${student.name} · ${student.level || '—'}</div>
      <div class="sub">${content.level_interpretation_es || ''}</div>
    </div>

    <h2>Resumen para la familia</h2>
    <div class="summary">
      ${(content.parent_summary_es || '').split('\n').filter(Boolean).map((p: string) => `<p>${p}</p>`).join('')}
    </div>

    <h2>Evolución mensual</h2>
    <div class="chart-wrap">${chartSvg}</div>

    ${bySkill ? `<div class="skills">
      <h2 style="margin-top:20px">Por destreza (último check-in)</h2>
      ${Object.entries(bySkill).filter(([, v]) => v != null).map(([sk, v]) => `
        <div class="skill-row">
          <span class="skill-name">${sk}</span>
          <div class="skill-track"><div class="skill-fill" style="width:${v}%;background:${scoreColor(v as number)}"></div></div>
          <span>${v}</span>
        </div>
      `).join('')}
    </div>` : ''}

    <div class="practice-section page-break">
      <div class="practice-title">${content.practice_title_en || 'This month’s practice'}</div>
      <p class="practice-intro">${content.practice_intro_en || ''}</p>
      ${(content.practice_exercises || []).map((ex: any) => `
        <div class="exercise">
          <div class="instruction">${ex.instruction_en}</div>
          <ol>${(ex.items || []).map((it: string) => `<li>${it}</li>`).join('')}</ol>
        </div>
      `).join('')}
    </div>

    <footer>Somerset Language Centre · Valencia</footer>
  </div>
</body>
</html>`

  return NextResponse.json({ html })
}
