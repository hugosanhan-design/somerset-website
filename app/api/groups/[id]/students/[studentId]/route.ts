import { NextRequest, NextResponse } from 'next/server'
import { requireGroupAccess } from '@/lib/authz'
import { getDb } from '@/lib/db'

// Removes a student from this group (does not delete the student).
export async function DELETE(_req: NextRequest, { params }: { params: { id: string; studentId: string } }) {
  if (!(await requireGroupAccess(params.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const db = await getDb()
  await db.prepare('UPDATE students SET group_id = NULL WHERE id = ? AND group_id = ?').run(params.studentId, params.id)
  return NextResponse.json({ ok: true })
}
