import { NextRequest, NextResponse } from 'next/server'
import { correctWriting } from '@/lib/writingCorrection'
import { transporter, FROM } from '@/lib/mailer'

export const runtime = 'nodejs'

const TASK_PROMPT =
  'Write an email to a new penfriend (70–100 words). Tell them: what you usually do every day (your routine), what you are doing differently this week, and one thing you want to do in the future.'

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { studentName?: string; text?: string }
  const { studentName, text } = body

  if (!text || text.trim().length < 20)
    return NextResponse.json({ error: 'Text too short.' }, { status: 400 })

  try {
    const result = await correctWriting({
      studentName: studentName || 'Student',
      level: 'B1',
      taskType: 'Informal email',
      taskPrompt: TASK_PROMPT,
      studentText: text,
    })

    const to = process.env.GMAIL_USER!
    await transporter.sendMail({
      from: FROM,
      to,
      subject: `B1 Unit 1 Writing — ${studentName || 'A student'} submitted`,
      html: `
<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:680px;margin:0 auto;">
  <div style="background:#1E4227;color:#fff;padding:14px 20px;border-bottom:3px solid #6BAE2E;">
    <strong>Somerset Language Centre</strong> · B1 Unit 1 Online Course
  </div>
  <div style="padding:20px;">
    <p><strong>${studentName || 'A student'}</strong> submitted their Unit 1 writing task.</p>
    <p><strong>Review and forward to the student if you're happy with the feedback.</strong></p>
    <h3 style="margin:20px 0 8px;">Student's text:</h3>
    <blockquote style="border-left:3px solid #6BAE2E;margin:0;padding:10px 16px;background:#f5faf0;border-radius:4px;">
      ${text.replace(/\n/g, '<br>')}
    </blockquote>
    <h3 style="margin:24px 0 8px;">AI correction report:</h3>
    ${result.html}
  </div>
</div>`,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[b1u1-writing]', e)
    return NextResponse.json({ error: 'Could not process writing right now.' }, { status: 502 })
  }
}
