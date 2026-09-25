import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  if (session.user.id === params.id) {
    return NextResponse.json({ error: "You can't delete your own account while logged in as it" }, { status: 400 })
  }

  const db = await getDb()
  await db.prepare('UPDATE groups SET teacher_id = NULL WHERE teacher_id = ?').run(params.id)
  await db.prepare('DELETE FROM teachers WHERE id = ?').run(params.id)
  return NextResponse.json({ ok: true })
}
