import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { studentKey, studentName, course, subscription } = body

  if (!studentKey || !course) return NextResponse.json({ error: 'missing' }, { status: 400 })

  const db = await getDb()

  // Always update last_seen — called on every course open
  if (!subscription) {
    await db.prepare(
      `UPDATE push_subscriptions SET last_seen = NOW() WHERE student_key = $1 AND course = $2`
    ).run(studentKey, course)
    return NextResponse.json({ ok: true })
  }

  // Save or update push subscription
  const { endpoint, keys } = subscription
  await db.prepare(
    `INSERT INTO push_subscriptions (student_key, student_name, course, endpoint, p256dh, auth, last_seen)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (endpoint) DO UPDATE SET
       last_seen = NOW(), student_name = EXCLUDED.student_name`
  ).run(studentKey, studentName || '', course, endpoint, keys.p256dh, keys.auth)

  return NextResponse.json({ ok: true })
}
