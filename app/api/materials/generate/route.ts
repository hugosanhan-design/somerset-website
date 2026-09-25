import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { buildPrompt } from '@/lib/materialsPrompt'
import { REVIEW_CHECKLIST } from '@/lib/houseRules'

// Generations take 30-60s; without this Vercel may kill the function mid-write.
export const maxDuration = 300

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function extractText(message: Anthropic.Message): string {
  const block = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
  return block?.text || ''
}

function extractJson(raw: string): any {
  const match = raw.match(/\{[\s\S]*\}/)
  return JSON.parse(match ? match[0] : raw)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const prompt = buildPrompt(body)
  if (!prompt) return NextResponse.json({ error: 'Unknown book, unit or activity type' }, { status: 400 })
  const { book, unitData, system, user: userMessage } = prompt

  let parsed: any = null
  let lastError: unknown = null
  for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 10000,
      system,
      messages: [{ role: 'user', content: userMessage }],
    })
    try {
      parsed = extractJson(extractText(message))
    } catch (e) {
      lastError = e
      console.error(`[materials] attempt ${attempt} failed. stop_reason:`, message.stop_reason, 'blocks:', message.content.map(c => c.type))
    }
  }
  if (!parsed?.html_body) {
    console.error('[materials] generation failed:', lastError)
    return NextResponse.json({ error: 'Failed to generate the material. Please try again.' }, { status: 502 })
  }

  const flags: string[] = Array.isArray(parsed.flags) ? parsed.flags.filter((f: unknown) => typeof f === 'string' && f.trim()) : []
  const flagsHtml = flags.length
    ? `<div class="flags"><h3>Check these first</h3><ul>${flags.map((f: string) => `<li>${f}</li>`).join('')}</ul></div>`
    : ''

  const today = new Date().toISOString().slice(0, 10)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${parsed.title || 'Class material'} · Somerset</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, 'Liberation Sans', sans-serif; color: #1A1A1A; background: #fff; font-size: 12.5pt; line-height: 1.65; }
  header { background: #6BAE2E; color: #fff; padding: 16px 32px; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  header .logo { font-size: 17pt; font-weight: 700; letter-spacing: 0.01em; }
  header .meta { font-size: 10.5pt; opacity: 0.92; text-align: right; }
  .content { max-width: 760px; margin: 0 auto; padding: 26px 34px 60px; }
  h1.doc-title { font-size: 19pt; margin-bottom: 4px; }
  .duration { font-size: 11pt; color: #4b5563; margin-bottom: 22px; }
  h2 { font-size: 14pt; margin: 26px 0 10px; border-bottom: 2px solid #EAF4DA; padding-bottom: 5px; }
  h3 { font-size: 12.5pt; margin: 14px 0 8px; }
  p { margin-bottom: 10px; }
  ol, ul { padding-left: 24px; margin-bottom: 12px; }
  li { margin-bottom: 9px; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0 14px; }
  td, th { border: 1px solid #d1d5db; padding: 7px 10px; text-align: left; font-size: 12pt; }
  th { background: #EAF4DA; }
  .exercise { margin-bottom: 22px; break-inside: avoid; page-break-inside: avoid; }
  .instructions { font-weight: 700; margin-bottom: 8px; }
  .notebox { background: #EAF4DA; border-left: 4px solid #6BAE2E; padding: 12px 16px; border-radius: 4px; margin: 12px 0 16px; break-inside: avoid; }
  .reading { font-size: 14pt; line-height: 1.8; background: #fafafa; border: 1px solid #e8e8e8; border-radius: 6px; padding: 18px 22px; margin: 12px 0 16px; }
  .lines { margin: 10px 0 6px; }
  .lines::before { content: "\\A0"; display: block; border-bottom: 1.5px solid #9ca3af; height: 2em; }
  .lines::after { content: "\\A0"; display: block; border-bottom: 1.5px solid #9ca3af; height: 2em; }
  .lines > * { display: none; }
  .card { border: 2px dashed #6BAE2E; border-radius: 8px; padding: 14px 18px; margin: 14px 0; break-inside: avoid; page-break-inside: avoid; }
  .script { background: #fafafa; border: 1px solid #e8e8e8; border-radius: 6px; padding: 16px 22px; margin: 12px 0 16px; }
  .script p { margin-bottom: 7px; }
  .gap { display: inline-block; min-width: 90px; border-bottom: 1.5px solid #1A1A1A; }
  .teacher-key { page-break-before: always; padding-top: 18px; }
  .teacher-key .band { background: #1A1A1A; color: #fff; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 12pt; display: inline-block; margin-bottom: 14px; }
  .checklist { border: 2px solid #1A1A1A; border-radius: 8px; padding: 14px 20px; margin-top: 22px; break-inside: avoid; }
  .checklist h3 { margin: 0 0 6px; }
  .checklist p { font-size: 11pt; color: #4b5563; }
  .checklist ul { list-style: none; padding-left: 0; }
  .checklist li { padding-left: 26px; position: relative; margin-bottom: 7px; }
  .checklist li::before { content: ""; position: absolute; left: 0; top: 2px; width: 14px; height: 14px; border: 1.5px solid #1A1A1A; border-radius: 3px; }
  .flags { border: 2px solid #E2542C; border-radius: 8px; padding: 12px 18px; margin-top: 18px; break-inside: avoid; }
  .flags h3 { margin: 0 0 6px; color: #E2542C; }
  footer { text-align: center; font-size: 9.5pt; color: #9ca3af; margin-top: 34px; }
  @media print { header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <header>
    <span class="logo">Somerset Language Centre</span>
    <span class="meta">${book.name} · Unit ${unitData.unit}: ${unitData.title}<br>${body.groupLabel ? body.groupLabel + ' · ' : ''}${today}</span>
  </header>
  <div class="content">
    <h1 class="doc-title">${parsed.title || ''}</h1>
    <div class="duration">${parsed.duration_note || ''}</div>
    ${parsed.html_body}
    <div class="teacher-key">
      <span class="band">Teacher's key and notes, do not photocopy this page</span>
      ${parsed.teacher_key_html || ''}
      ${flagsHtml}
      <div class="checklist">
        <h3>Before you print this</h3>
        <p>This material was generated. You are the last person who sees it before a student does.</p>
        <ul>${REVIEW_CHECKLIST.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
    </div>
    <footer>Somerset Language Centre · Valencia</footer>
  </div>
</body>
</html>`

  return NextResponse.json({ html, title: parsed.title || 'Class material' })
}
