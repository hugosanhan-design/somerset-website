import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: 'A reset link and a password of at least 8 characters are required' }, { status: 400 })
  }

  const db = await getDb()
  const teacher = await db.prepare('SELECT id, reset_token_expires FROM teachers WHERE reset_token = ?').get(token) as { id: string; reset_token_expires: string | null } | undefined

  if (!teacher || !teacher.reset_token_expires || new Date(teacher.reset_token_expires) < new Date()) {
    return NextResponse.json({ error: 'This reset link is invalid or has expired. Request a new one.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.prepare('UPDATE teachers SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?').run(passwordHash, teacher.id)

  return NextResponse.json({ ok: true })
}
