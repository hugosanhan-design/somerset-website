import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { requireStudentAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireStudentAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(params.id) as { name: string; parent_email: string } | undefined
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  if (!student.parent_email) return NextResponse.json({ error: 'No parent email on file for this student' }, { status: 400 })

  const { html } = await req.json()
  if (!html) return NextResponse.json({ error: 'html is required' }, { status: 400 })

  try {
    await transporter.sendMail({
      from: `"Somerset Language Centre" <${process.env.GMAIL_USER}>`,
      to: student.parent_email,
      subject: `Informe de progreso — ${student.name}`,
      html,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[progress/email]', err)
    return NextResponse.json({ error: 'Email failed to send' }, { status: 500 })
  }
}
