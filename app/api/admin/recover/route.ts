import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'

// Break-glass account recovery — used when a teacher (including the sole admin) is fully
// locked out and can't use the normal /forgot-password email flow (no email access, or the
// link gets blocked by a spam/malware filter). Gated by RECOVERY_SECRET, a server-only env
// var that never reaches the client and isn't something a teacher needs to remember —
// intended to be triggered on a teacher's behalf, not self-service.

function checkSecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-recovery-secret')
  return !!secret && secret === process.env.RECOVERY_SECRET
}

// GET — lists registered teacher emails (no password data) so the right account can be identified.
export async function GET(req: NextRequest) {
  if (!checkSecret(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const teachers = await db.prepare('SELECT id, name, email, role, created_at FROM teachers ORDER BY created_at ASC').all()
  return NextResponse.json(teachers)
}

// POST { email, newPassword } — resets that teacher's password.
export async function POST(req: NextRequest) {
  if (!checkSecret(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, newPassword } = await req.json()
  const normalizedEmail = (email || '').trim().toLowerCase()
  if (!normalizedEmail || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'email and a newPassword of at least 8 characters are required' }, { status: 400 })
  }

  const db = await getDb()
  const teacher = await db.prepare('SELECT id FROM teachers WHERE email = ?').get(normalizedEmail) as { id: string } | undefined
  if (!teacher) return NextResponse.json({ error: 'No teacher with that email' }, { status: 404 })

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await db.prepare('UPDATE teachers SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?').run(passwordHash, teacher.id)

  return NextResponse.json({ ok: true })
}
