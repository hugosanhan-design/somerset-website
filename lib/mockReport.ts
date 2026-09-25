import Anthropic from '@anthropic-ai/sdk'
import { getDb } from '@/lib/db'
import { B2_FIRST_PARTS, scorePaper, matchesKey, type ExamPart, type PartScore } from '@/lib/mocks'
import { PART_RULES, bandFromWeighted } from '@/lib/mockRules'
import { correctWriting, type WritingCorrectionResult } from '@/lib/writingCorrection'
import { TEST4, CbtReadingPart } from '@/data/cbt/test4-b2first'

// Function 4, Phase 3 — full mock correction package, per the Model doc
// (Somerset Worksheets/_method/mock-correction-package-model.md):
//   Component 1: scores + banding
//   Component 2: Every Mistake Explained, with full passage text
//   Component 3/4: Writing correction (Function 1, reused unchanged) + merged into one doc
// Component 5 (personal practice pack) is NOT built here yet — deliberately deferred
// rather than shipped shallow (the Model doc warns against exactly that).
//
// Listening: per house rule (never fabricate a transcript), wrong listening items are
// listed (question / your answer / correct answer) WITHOUT invented "why" reasoning —
// we don't have the audio script on file for this exam.
//
// Pulled out of the API route so it's callable directly (tests, scripts) without going
// through the auth-gated HTTP handler — see app/api/mocks/report/route.ts for the thin
// wrapper that actually serves it.

const CONTENT_BY_EXAM: Record<string, typeof TEST4 | undefined> = { 'test4-b2first': TEST4 }

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

interface WrongItem { q: number; student: string; correct: string }

function findReadingPart(exam: typeof TEST4, partId: string): CbtReadingPart | undefined {
  return exam.readingParts.find(p => p.part === partId)
}

// Builds the plain-text passage/question context an explanation call needs for one
// part, plus the list of wrong items — everything the model needs, nothing invented.
function buildPartContext(content: CbtReadingPart, wrong: WrongItem[]): string {
  const lines: string[] = []
  if (content.passageTitle) lines.push(`PASSAGE TITLE: ${content.passageTitle}`)
  if (content.passage) lines.push(`PASSAGE:\n${content.passage}`)
  if (content.gapOptions) lines.push(`SENTENCE BANK:\n${content.gapOptions.map(o => `${o.letter}) ${o.text}`).join('\n')}`)
  if (content.matchTexts) lines.push(`TEXTS:\n${content.matchTexts.map(t => `${t.letter} — ${t.title}\n${t.text}`).join('\n\n')}`)
  if (content.stems) lines.push(`WORD-FORMATION STEMS: ${JSON.stringify(content.stems)}`)

  lines.push('\nWRONG ITEMS (produce one <div class="q"> block per item, in this order):')
  for (const w of wrong) {
    const mcq = content.mcqs?.find(m => m.q === w.q)
    const matchQ = content.matchQuestions?.find(m => m.q === w.q)
    const transform = content.transformations?.find(t => t.q === w.q)
    let desc = `Q${w.q}: student answered "${w.student || '(blank)'}", correct answer is "${w.correct}".`
    if (mcq) desc += ` Options: ${mcq.options.map(o => `${o.letter}=${o.text}`).join(', ')}.${mcq.text ? ` Question: ${mcq.text}` : ''}`
    if (matchQ) desc += ` Question: "Which person ${matchQ.text}"`
    if (transform) desc += ` Original sentence: "${transform.sentence}" Keyword: ${transform.keyword}. Gapped: "${transform.gapped}"`
    lines.push(desc)
  }
  return lines.join('\n')
}

const EXPLAIN_SYSTEM = `You are the Somerset Language Centre exam-mistake-explanation agent. Given exam passage/question content and a list of wrong answers, produce ONLY a sequence of HTML blocks — no outer <html>, no <h2>, no markdown, no commentary before or after.

For EACH wrong item, produce exactly this structure:
<div class="q"><div class="qh">Q{n} &mdash; you put <u>{student answer}</u> | answer: <b>{correct answer}</b></div><div class="txt">{the exact relevant sentence(s) from the passage containing the gap, or the exact quoted proving sentence for matching parts, with the key word/gap in <b>bold</b>}</div><div class="w"><b>Why yours fails:</b> {1-2 sentences, referencing the actual words in the passage/options}</div><div class="w"><b>Why the key is right:</b> {1-2 sentences, referencing the actual words in the passage/options}</div></div>

Rules:
- Reference EXACT words from the passage/text given to you. Never invent content not given.
- Be concise and concrete — no filler, no "great effort", no hedging.
- Direct teacher voice: short declarative sentences naming the exact linguistic reason.
- If the item is a multiple-matching or gapped-text question, quote the proving sentence from the correct text/option, not a paraphrase.
- Output the blocks concatenated with no separators, nothing else.`

async function explainPart(partLabel: string, context: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4096,
    system: EXPLAIN_SYSTEM,
    messages: [{ role: 'user', content: `Exam part: ${partLabel}\n\n${context}\n\nProduce the HTML blocks now.` }],
  })
  const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
  return textBlock?.text.trim() || `<p><em>Could not generate explanations for ${esc(partLabel)}.</em></p>`
}

function extractBody(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return m ? m[1] : html
}

const REPORT_STYLE = `
@page{size:A4;margin:15mm 18mm;}*{box-sizing:border-box;}
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1c1c1c;font-size:12pt;line-height:1.5;margin:0;}
.logo .word{font-weight:800;font-size:25pt;letter-spacing:-1px;}.logo .lc{font-weight:700;font-size:8pt;color:#666;letter-spacing:2.4px;}
.head{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:2.5px solid #1c1c1c;padding-bottom:8px;margin-bottom:10px;}
.head .rt{text-align:right;font-size:10pt;color:#666;}.head .rt b{color:#111;}
h1{font-size:22pt;margin:8px 0 4px;}.sub{font-size:11pt;color:#555;margin:0 0 10px;}
.tot{display:flex;gap:10px;margin:10px 0 10px;flex-wrap:wrap;}
.tc{flex:1;min-width:100px;border:2px solid #1c1c1c;border-radius:9px;padding:9px 4px;text-align:center;}
.tc.wr{border-color:#6BAE2E;background:#F5FAF0;}
.tc .lab{font-size:9pt;text-transform:uppercase;letter-spacing:.6px;color:#555;}.tc .val{font-size:22pt;font-weight:800;line-height:1.05;}.tc .den{font-size:11pt;color:#666;}
.level{border:2px solid #1c1c1c;border-radius:9px;padding:9px 14px;margin:8px 0 14px;background:#fafafa;}.level .big{font-size:15pt;font-weight:800;}
h2{font-size:15pt;margin:18px 0 6px;border-bottom:1.5px solid #1c1c1c;padding-bottom:2px;page-break-after:avoid;}
table{width:100%;border-collapse:collapse;margin:4px 0 8px;}td,th{border:1px solid #bbb;padding:5px 10px;font-size:11pt;}
th{background:#1c1c1c;color:#fff;text-align:left;font-size:8.5pt;text-transform:uppercase;letter-spacing:.5px;}
td.sec{font-weight:bold;background:#f0f0f0;width:38px;text-align:center;}td.mk{text-align:center;font-weight:bold;width:80px;}
tr.tl td{font-weight:bold;background:#eaeaea;}p{margin:6px 0;}
.foot{margin-top:16px;border-top:2px solid #1c1c1c;padding-top:6px;font-size:8.5pt;color:#666;display:flex;justify-content:space-between;}
.note{font-size:9pt;color:#666;}
.rule{background:#f0f0f0;border-radius:6px;padding:6px 11px;margin:6px 0;font-size:10.5pt;}
.q{border:1px solid #999;border-radius:7px;padding:7px 11px;margin:7px 0;page-break-inside:avoid;}
.qh{font-weight:bold;font-size:11.5pt;margin-bottom:3px;}
.txt{background:#f2f2f2;border-radius:5px;padding:5px 9px;margin:4px 0;font-size:10.5pt;font-style:italic;}
.w{margin:3px 0;}.w b{color:#111;}
.section-break{page-break-before:always;}
`

const PART_META: { part: ExamPart; label: string; short: string }[] = B2_FIRST_PARTS.map(p => ({ part: p.part, label: p.label, short: p.label.split(' — ')[0] }))

function htmlError(message: string): { status: number; html: string } {
  return {
    status: 200,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;color:#c0392b"><h2>Report not available</h2><p>${esc(message)}</p></body></html>`,
  }
}

export async function buildReportHtml(examId: string, studentName: string): Promise<{ status: number; html: string }> {
  try {
    const db = await getDb()
    const examRow = await db.prepare('SELECT title FROM mock_exams WHERE id = ?').get(examId) as { title: string } | undefined
    if (!examRow) return { status: 404, html: htmlError('Unknown exam').html }

    const keyRow = await db.prepare('SELECT answers FROM mock_answer_keys WHERE exam_id = ?').get(examId) as { answers: string } | undefined
    if (!keyRow) return htmlError(`No answer key entered yet for ${examRow.title}. Enter it at /mocks before generating reports.`)
    const key = JSON.parse(keyRow.answers) as Record<string, string>

    // Most recent submission per paper for this student.
    const rows = await db.prepare(
      `SELECT DISTINCT ON (paper) paper, answers, submitted_at FROM cbt_responses
       WHERE exam_id = ? AND student_name = ? ORDER BY paper, submitted_at DESC`
    ).all(examId, studentName) as { paper: string; answers: string; submitted_at: string }[]

    const readingRow = rows.find(r => r.paper === 'reading-uoe')
    const listeningRow = rows.find(r => r.paper === 'listening')
    const writingRow = rows.find(r => r.paper === 'writing')

    if (!readingRow && !listeningRow && !writingRow) {
      return htmlError(`No submissions found for ${esc(studentName)} on ${esc(examRow.title)}.`)
    }

    const readingAnswers: Record<string, string> = readingRow ? JSON.parse(readingRow.answers) : {}
    const listeningAnswers: Record<string, string> = listeningRow ? JSON.parse(listeningRow.answers) : {}
    const readingScore = readingRow ? scorePaper('reading-uoe', readingAnswers, key) : null
    const listeningScore = listeningRow ? scorePaper('listening', listeningAnswers, key) : null

    const sumPart = (score: Record<string, PartScore> | null, parts: ExamPart[]) =>
      parts.reduce((acc, p) => {
        const s = score?.[p]
        return s ? { points: acc.points + s.points, outOf: acc.outOf + s.pointsOutOf } : acc
      }, { points: 0, outOf: 0 })

    const readingTotal = sumPart(readingScore, ['reading-p1', 'reading-p5', 'reading-p6', 'reading-p7'])
    const uoeTotal = sumPart(readingScore, ['uoe-p2', 'uoe-p3', 'uoe-p4'])
    const listeningTotal = sumPart(listeningScore, ['listening-p1', 'listening-p2', 'listening-p3', 'listening-p4'])

    // ── Writing correction (Function 1, reused unchanged) ──
    let task2Type = ''
    let task1Job: Promise<WritingCorrectionResult> | null = null
    let task2Job: Promise<WritingCorrectionResult> | null = null
    if (writingRow) {
      const wAnswers: Record<string, string> = JSON.parse(writingRow.answers)
      const task1Text = wAnswers['writing#task1'] || ''
      const task2Text = wAnswers['writing#task2'] || ''
      const task2Choice = parseInt(wAnswers['task2#choice'] || '2', 10)
      const task1 = TEST4.writingTasks.find(t => t.taskNumber === 1)!
      const task2 = TEST4.writingTasks.find(t => t.taskNumber === task2Choice) || TEST4.writingTasks.find(t => !t.compulsory)!
      task2Type = task2.type

      if (task1Text.trim()) task1Job = correctWriting({
        studentName, level: 'B2', taskType: task1.type,
        taskPrompt: `${task1.prompt}\n${task1.box || ''}\n${(task1.notes || []).join('\n')}`, studentText: task1Text,
      })
      if (task2Text.trim()) task2Job = correctWriting({
        studentName, level: 'B2', taskType: task2.type,
        taskPrompt: `${task2.prompt}\n${task2.box || ''}\n${(task2.notes || []).join('\n')}`, studentText: task2Text,
      })
    }
    const [task1Result, task2Result] = await Promise.all([
      task1Job ?? Promise.resolve(null),
      task2Job ?? Promise.resolve(null),
    ])

    const task1Mark = task1Result ? Math.round((task1Result.score ?? 0) / 5 * 10) / 10 : null
    const task2Mark = task2Result ? Math.round((task2Result.score ?? 0) / 5 * 10) / 10 : null
    const writingTotal = task1Mark !== null && task2Mark !== null ? { points: Math.round((task1Mark + task2Mark) * 10) / 10, outOf: 40 } : null

    // ── Every Mistake Explained (Reading/UoE only — full passage content available) ──
    const examContent = CONTENT_BY_EXAM[examId]
    let mistakesHtml = ''
    if (readingRow && examContent) {
      const wrongByPart = new Map<ExamPart, WrongItem[]>()
      for (const meta of PART_META) {
        if (meta.part.startsWith('listening')) continue
        const partDef = B2_FIRST_PARTS.find(p => p.part === meta.part)!
        const wrong: WrongItem[] = []
        for (let q = partDef.qFrom; q <= partDef.qTo; q++) {
          const k = key[`${meta.part}#${q}`]
          if (!k) continue
          const student = readingAnswers[`${meta.part}#${q}`] || ''
          if (!matchesKey(student, k)) wrong.push({ q, student, correct: k.split('/')[0] })
        }
        if (wrong.length) wrongByPart.set(meta.part, wrong)
      }

      const explainJobs = Array.from(wrongByPart.entries()).map(async ([part, wrong]) => {
        const content = findReadingPart(examContent, part)
        const meta = PART_META.find(m => m.part === part)!
        if (!content) return `<h2>${esc(meta.label)}</h2><p class="note">Content not on file for this exam — cannot generate explanations.</p>`
        const context = buildPartContext(content, wrong)
        const blocks = await explainPart(meta.label, context)
        const rule = PART_RULES[part] ? `<div class="rule">${PART_RULES[part]}</div>` : ''
        return `<h2>${esc(meta.label)}${content.passageTitle ? ` (<i>${esc(content.passageTitle)}</i>)` : ''}</h2>${rule}${blocks}`
      })
      mistakesHtml = (await Promise.all(explainJobs)).join('')
    }

    // ── Listening: list wrong items, no fabricated transcript reasoning ──
    let listeningReviewHtml = ''
    if (listeningRow) {
      const rows2: string[] = []
      for (const meta of PART_META) {
        if (!meta.part.startsWith('listening')) continue
        const partDef = B2_FIRST_PARTS.find(p => p.part === meta.part)!
        for (let q = partDef.qFrom; q <= partDef.qTo; q++) {
          const k = key[`${meta.part}#${q}`]
          if (!k) continue
          const student = listeningAnswers[`${meta.part}#${q}`] || ''
          if (!matchesKey(student, k)) rows2.push(`<tr><td class="sec">${q}</td><td>${esc(student || '(blank)')}</td><td>${esc(k.split('/')[0])}</td></tr>`)
        }
      }
      if (rows2.length) {
        listeningReviewHtml = `<h2>Listening — items to review</h2><p class="note">No audio transcript on file for this exam, so these are listed for you to replay in class rather than explained here.</p><table><tr><th style="width:38px">Q</th><th>Student answer</th><th>Correct answer</th></tr>${rows2.join('')}</table>`
      }
    }

    // ── Score + band (Component 1) ──
    const pct = (t: { points: number; outOf: number } | null) => t && t.outOf > 0 ? (t.points / t.outOf) * 100 : null
    const rAndUoe = readingRow ? { points: readingTotal.points + uoeTotal.points, outOf: readingTotal.outOf + uoeTotal.outOf } : null
    // Require at least two of the three components before offering a band — a single
    // partial paper (e.g. a Listening-only attempt) isn't enough to responsibly estimate
    // a level, even labelled as an approximation.
    const componentsPresent = [rAndUoe, writingTotal, listeningTotal].filter(Boolean).length
    const bandResult = componentsPresent >= 2 ? bandFromWeighted(pct(rAndUoe), pct(writingTotal), pct(listeningTotal)) : null

    const scoreCards = [
      readingRow && `<div class="tc"><div class="lab">Reading</div><div class="val">${readingTotal.points}</div><div class="den">/ ${readingTotal.outOf}</div></div>`,
      readingRow && `<div class="tc"><div class="lab">Use of English</div><div class="val">${uoeTotal.points}</div><div class="den">/ ${uoeTotal.outOf}</div></div>`,
      writingTotal && `<div class="tc wr"><div class="lab">Writing</div><div class="val">${writingTotal.points}</div><div class="den">/ 40</div></div>`,
      listeningRow && `<div class="tc"><div class="lab">Listening</div><div class="val">${listeningTotal.points}</div><div class="den">/ ${listeningTotal.outOf}</div></div>`,
    ].filter(Boolean).join('')

    const missing: string[] = []
    if (!readingRow) missing.push('Reading & Use of English')
    if (!listeningRow) missing.push('Listening')
    if (!writingRow) missing.push('Writing')

    const partTable = (title: string, parts: ExamPart[], score: Record<string, PartScore> | null) => {
      if (!score) return ''
      const rows3 = parts.map(p => {
        const s = score[p]
        const meta = PART_META.find(m => m.part === p)!
        return s && s.outOf > 0 ? `<tr><td class="sec">${meta.short.replace(/\D/g, '')}</td><td>${esc(meta.short)}</td><td class="mk">${s.points} / ${s.pointsOutOf}</td></tr>` : ''
      }).join('')
      const total = sumPart(score, parts)
      return `<h2>${title} — by part</h2><table><tr><th style="width:38px">Part</th><th>What it tests</th><th style="width:80px">Score</th></tr>${rows3}<tr class="tl"><td class="sec">&nbsp;</td><td>${title} total</td><td class="mk">${total.points} / ${total.outOf}</td></tr></table>`
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(studentName)} — ${esc(examRow.title)} — Full Report</title><style>${REPORT_STYLE}</style></head><body>
<div class="head"><div class="logo"><span class="word">Somerset</span> <span class="lc">LANGUAGE&nbsp;CENTRE</span></div><div class="rt"><b>${esc(examRow.title)}</b><br>Full report &middot; ${esc(studentName)} &middot; generated ${new Date().toISOString().slice(0, 10)}</div></div>
<h1>${esc(studentName)} — Results</h1>
<p class="sub">Cambridge B2 First practice exam${missing.length ? ` — <b>${missing.join(', ')} not yet submitted</b>` : ' — all four skills except Speaking'}</p>
<div class="tot">${scoreCards}</div>
${bandResult ? `<div class="level"><div class="big">Estimated overall level (this mock): ${bandResult.band}</div><p style="margin:4px 0 0;font-size:10.5pt">${bandResult.method} Overall &asymp; <b>${bandResult.pct}%</b> &rarr; <b>${bandResult.band}</b>.</p></div><p class="note">Estimate only — Cambridge's actual grade boundaries are not public and vary each session. One mock is a snapshot, not a prediction. No Speaking component was sat for this mock.</p>` : '<p class="note">Not enough papers submitted yet for a level estimate.</p>'}
${partTable('Reading', ['reading-p1', 'reading-p5', 'reading-p6', 'reading-p7'], readingScore)}
${partTable('Use of English', ['uoe-p2', 'uoe-p3', 'uoe-p4'], readingScore)}
${task1Result || task2Result ? `<h2>Writing — by task</h2><table><tr><th style="width:38px">Task</th><th>What it tests</th><th style="width:80px">Score</th></tr>${task1Mark !== null ? `<tr><td class="sec">1</td><td>Essay</td><td class="mk">${task1Mark} / 20</td></tr>` : ''}${task2Mark !== null ? `<tr><td class="sec">2</td><td>${esc(task2Type)}</td><td class="mk">${task2Mark} / 20</td></tr>` : ''}${writingTotal ? `<tr class="tl"><td class="sec">&nbsp;</td><td>Writing total</td><td class="mk">${writingTotal.points} / 40</td></tr>` : ''}</table>` : ''}
${partTable('Listening', ['listening-p1', 'listening-p2', 'listening-p3', 'listening-p4'], listeningScore)}
${mistakesHtml ? `<div class="section-break"></div><h1>${esc(studentName)} — Every Mistake Explained</h1>${mistakesHtml}` : ''}
${listeningReviewHtml}
${task1Result ? `<div class="section-break">${extractBody(task1Result.html)}</div>` : ''}
${task2Result ? `<div class="section-break">${extractBody(task2Result.html)}</div>` : ''}
<div class="foot"><span>Somerset Language Centre &middot; Val&egrave;ncia &middot; ${esc(examRow.title)}</span><span>${esc(studentName)}</span></div>
</body></html>`

    return { status: 200, html }
  } catch (err) {
    console.error('[mockReport]', err)
    return htmlError('Something went wrong generating this report. Check the server log.')
  }
}
