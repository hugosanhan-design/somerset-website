import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb, newId } from '@/lib/db'

// Creates the very first teacher account (always an admin). Only works while the
// teachers table is empty — locks itself out permanently the moment one account exists,
// so there is no standing "create the first admin" backdoor left in the running app.
export async function POST(req: NextRequest) {
  const db = await getDb()
  const existingCount = (await db.prepare('SELECT COUNT(*)::int as c FROM teachers').get() as { c: number }).c
  if (existingCount > 0) {
    return NextResponse.json({ error: 'Setup already complete. Ask an admin to create your account instead.' }, { status: 403 })
  }

  const { name, email, password } = await req.json()
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return NextResponse.json({ error: 'Name, email, and a password of at least 8 characters are required' }, { status: 400 })
  }

  const id = newId()
  const passwordHash = await bcrypt.hash(password, 12)
  await db.prepare('INSERT INTO teachers (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .run(id, name.trim(), email.trim().toLowerCase(), passwordHash, 'admin')

  return NextResponse.json({ ok: true }, { status: 201 })
}
