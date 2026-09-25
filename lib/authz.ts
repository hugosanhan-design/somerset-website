import { NextRequest } from 'next/server'
import { auth } from './auth'
import { getDb } from './db'

// Allows either a real teacher session OR Sara's shared access code (sent as the
// x-access-code header). Used only by the stateless AI routes (/api/correct,
// /api/correct-docx, /api/extract, /api/detect-ai) that both the authenticated /correct
// page and the code-gated, no-login /sara page call — none of these read/write the
// database, so there's no per-teacher data to scope, just an API-cost gate.
export async function requireSessionOrCode(req: NextRequest): Promise<boolean> {
  const session = await auth()
  if (session) return true

  const code = req.headers.get('x-access-code')
  return !!code && code === process.env.SARA_ACCESS_CODE
}

// Returns the session if it's allowed to act on the given group (owns it, or is admin),
// or null if not authenticated / not authorized (callers should treat null as a 401/404).
export async function requireGroupAccess(groupId: string) {
  const session = await auth()
  if (!session) return null

  if (session.user.role === 'admin') return session

  const db = await getDb()
  const group = await db.prepare('SELECT teacher_id FROM groups WHERE id = ?').get(groupId) as { teacher_id: string | null } | undefined
  if (!group || group.teacher_id !== session.user.id) return null

  return session
}

// Same idea for a student — allowed if the caller is admin, or the student sits in one of
// the caller's own groups. A student with no group yet (group_id NULL — e.g. just created
// via the tracker, not yet assigned to a class) is visible to any signed-in teacher, since
// there's no owner to check against; it becomes properly scoped the moment it joins a group.
export async function requireStudentAccess(studentId: string) {
  const session = await auth()
  if (!session) return null

  if (session.user.role === 'admin') return session

  const db = await getDb()
  const student = await db.prepare(`
    SELECT s.group_id, g.teacher_id FROM students s
    LEFT JOIN groups g ON g.id = s.group_id
    WHERE s.id = ?
  `).get(studentId) as { group_id: string | null; teacher_id: string | null } | undefined
  if (!student) return null
  if (student.group_id && student.teacher_id !== session.user.id) return null

  return session
}
