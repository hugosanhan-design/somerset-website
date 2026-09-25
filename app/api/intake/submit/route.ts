import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import type { IntakeSession } from '@/lib/intake/types'
import { formatTeacherOutput, formatTeacherText, formatParentText } from '@/lib/intake/output'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const session: IntakeSession = await req.json()
    const output = formatTeacherOutput(session)
    const teacherText = formatTeacherText(output)
    const parentText = formatParentText(session)

    await transporter.sendMail({
      from: `"Somerset Intake" <${process.env.GMAIL_USER}>`,
      to: process.env.TEACHER_EMAIL,
      subject: `Intake profile — ${session.studentName} (${output.levelEstimate})`,
      text: teacherText,
    })

    console.log(`[intake/submit] Email sent for ${session.studentName}`)

    return NextResponse.json({ success: true, output })
  } catch (err) {
    console.error('[intake/submit]', err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
