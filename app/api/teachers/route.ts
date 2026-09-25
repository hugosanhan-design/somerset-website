import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { getDb, newId } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  const db = await getDb()
  const teachers = await db.prepare(`
    SELECT t.id, t.name, t.email, t.role, t.created_at,
      (SELECT COUNT(*)::int FROM groups WHERE teacher_id = t.id) as group_count
    FROM teachers t ORDER BY t.name ASC
  `).all()
  return NextResponse.json(teachers)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { name, email, password, role } = await req.json()
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return NextResponse.json({ error: 'Name, email, and a password of at least 8 characters are required' }, { status: 400 })
  }

  const db = await getDb()
  const normalizedEmail = email.trim().toLowerCase()
  const existing = await db.prepare('SELECT id FROM teachers WHERE email = ?').get(normalizedEmail)
  if (existing) {
    return NextResponse.json({ error: 'A teacher with that email already exists' }, { status: 409 })
  }

  const id = newId()
  const passwordHash = await bcrypt.hash(password, 12)
  await db.prepare('INSERT INTO teachers (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .run(id, name.trim(), normalizedEmail, passwordHash, role === 'admin' ? 'admin' : 'teacher')

  const teacher = await db.prepare('SELECT id, name, email, role, created_at FROM teachers WHERE id = ?').get(id)
  return NextResponse.json(teacher, { status: 201 })
}
