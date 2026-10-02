import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { correctWriting } from '@/lib/writingCorrection'
import { transporter, FROM } from '@/lib/mailer'

export const runtime = 'nodejs'

// Public writing correction for catch-up students. The pack_id in the request body
// acts as a lightweight auth token — if a valid catchup pack exists with that id,
// the student is allowed to submit. No teacher session required.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, string>
  const { pack_id, studentName, level, taskType, taskPrompt, studentText } = body

  if (!pack_id) return NextResponse.json({ error: 'Missing pack_id' }, { status: 400 })

  const db = await getDb()
  const pack = await db.prepare(
    `SELECT cp.id, cp.unit_title, cp.date, g.name as group_name,
            t.email as teacher_email, t.name as teacher_name
     FROM catchup_packs cp
     LEFT JOIN groups g ON g.id = cp.group_id
     LEFT JOIN teachers t ON t.id = cp.created_by
     WHERE cp.id = ?`
  ).get(pack_id) as { id: string; unit_title: string; date: string; group_name: string; teacher_email: string; teacher_name: string } | undefined

  if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 403 })

  try {
    const result = await correctWriting({ studentName, level, taskType, taskPrompt, studentText })

    // Fire-and-forget email to the teacher
    if (pack.teacher_email) {
      transporter.sendMail({
        from: FROM,
        to: pack.teacher_email,
        subject: `Catch-up: ${studentName || 'A student'} submitted writing (${pack.group_name})`,
        html: `<p>Hola ${pack.teacher_name || 'teacher'},</p>
<p><strong>${studentName || 'A student'}</strong> completed their writing task from the catch-up pack <em>${pack.unit_title}</em> (${pack.group_name}, class ${pack.date}).</p>
<p>Task type: ${taskType} · Level: ${level}</p>
<p>Their feedback has been generated. No action needed unless you want to follow up.</p>
<p style="color:#888;font-size:12px;">Somerset App · catch-up packs</p>`,
      }).catch(err => console.error('[correct-student] email failed', err))
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Could not generate feedback right now. Please try again.' }, { status: 502 })
  }
}
