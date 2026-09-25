import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { getDb } from '@/lib/db'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Always responds the same way whether or not the email exists, so this can't be used to
// discover which addresses have an account.
export async function POST(req: NextRequest) {
  const { email } = await req.json()
  const normalizedEmail = (email || '').trim().toLowerCase()

  if (normalizedEmail) {
    const db = await getDb()
    const teacher = await db.prepare('SELECT id, name FROM teachers WHERE email = ?').get(normalizedEmail) as { id: string; name: string } | undefined

    if (teacher) {
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      await db.prepare('UPDATE teachers SET reset_token = ?, reset_token_expires = ? WHERE id = ?').run(token, expires, teacher.id)

      const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}`
      try {
        await transporter.sendMail({
          from: `"Somerset Language Centre" <${process.env.GMAIL_USER}>`,
          to: normalizedEmail,
          subject: 'Reset your Somerset App password',
          html: `<p>Hola ${teacher.name},</p><p>Click below to set a new password. This link works for 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p>`,
        })
      } catch (err) {
        console.error('[forgot-password] email send failed', err)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
