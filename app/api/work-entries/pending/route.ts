import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

// Everything scanned from the phone but not yet corrected — the queue behind the
// laptop's "To correct" button. A student with no group yet is visible to any
// signed-in teacher (mirrors requireStudentAccess's own rule for ungrouped students).
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const isAdmin = session.user.role === 'admin'
  const entries = await db.prepare(`
    SELECT e.*, s.name as student_name, s.level as student_level, g.name as group_name
    FROM work_entries e
    JOIN students s ON s.id = e.student_id
    LEFT JOIN groups g ON g.id = s.group_id
    WHERE e.status = 'pending'
    ${isAdmin ? '' : 'AND (g.teacher_id = ? OR g.teacher_id IS NULL)'}
    ORDER BY e.date ASC, e.created_at ASC
  `).all(...(isAdmin ? [] : [session.user.id]))
  return NextResponse.json(entries)
}
