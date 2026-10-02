import { NextRequest, NextResponse } from 'next/server'
import { getDb, newId } from '@/lib/db'
import { ensureMockExamsSeeded, scorePaper } from '@/lib/mocks'
import { transporter, FROM } from '@/lib/mailer'

// Public route (middleware exception): students submit their computer-based test here.
// No auth by design — students don't have logins. Rate/abuse exposure is acceptable for
// the in-class trial; revisit before any public rollout.
//
// Objective papers are auto-scored against the mock answer key (entered at /mocks)
// when one exists. Answers are stored either way, so a key entered later can re-score
// (the report route at /api/mocks/report re-runs scorePaper on demand).

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      examId?: string
      studentName?: string
      paper?: string
      answers?: Record<string, string>
      startedAt?: string
      pack_id?: string
    }
    if (!body.examId || !body.studentName?.trim() || !body.paper || !body.answers) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (body.studentName.length > 100 || JSON.stringify(body.answers).length > 100_000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 400 })
    }

    const db = await getDb()
    await ensureMockExamsSeeded(db)

    // Score objective papers if a confirmed answer key exists for this exam.
    let score: ReturnType<typeof scorePaper> | null = null
    if (body.paper === 'reading-uoe' || body.paper === 'listening') {
      const keyRow = await db.prepare('SELECT answers FROM mock_answer_keys WHERE exam_id = ?').get(body.examId) as { answers: string } | undefined
      if (keyRow) {
        const key = JSON.parse(keyRow.answers) as Record<string, string>
        score = scorePaper(body.paper, body.answers, key)
      }
    }

    const id = newId()
    await db.prepare(
      'INSERT INTO cbt_responses (id, exam_id, student_name, paper, answers, score, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, body.examId, body.studentName.trim().slice(0, 100), body.paper,
      JSON.stringify(body.answers), score ? JSON.stringify(score) : null, body.startedAt || null)

    // Fire-and-forget teacher notification if this submission came from a catch-up pack
    if (body.pack_id) {
      ;(async () => {
        try {
          const pack = await db.prepare(
            `SELECT cp.unit_title, cp.date, g.name as group_name,
                    t.email as teacher_email, t.name as teacher_name
             FROM catchup_packs cp
             LEFT JOIN groups g ON g.id = cp.group_id
             LEFT JOIN teachers t ON t.id = cp.created_by
             WHERE cp.id = ?`
          ).get(body.pack_id) as { unit_title: string; date: string; group_name: string; teacher_email: string; teacher_name: string } | undefined
          if (pack?.teacher_email) {
            const paperLabel: Record<string, string> = { 'reading-uoe': 'Reading & Use of English', listening: 'Listening', writing: 'Writing' }
            const scoreText = score ? ` · Score: ${score.correct}/${score.total} (${Math.round(score.correct / score.total * 100)}%)` : ''
            await transporter.sendMail({
              from: FROM,
              to: pack.teacher_email,
              subject: `Catch-up: ${body.studentName} submitted ${paperLabel[body.paper!] || body.paper} (${pack.group_name})`,
              html: `<p>Hola ${pack.teacher_name || 'teacher'},</p>
<p><strong>${body.studentName}</strong> completed their practice exam from the catch-up pack <em>${pack.unit_title}</em> (${pack.group_name}, class ${pack.date}).</p>
<p>Paper: ${paperLabel[body.paper!] || body.paper}${scoreText}</p>
<p style="color:#888;font-size:12px;">Somerset App · catch-up packs</p>`,
            })
          }
        } catch (err) { console.error('[cbt/submit] email failed', err) }
      })()
    }

    return NextResponse.json({ ok: true, scored: !!score })
  } catch (err) {
    console.error('[cbt/submit]', err)
    return NextResponse.json({ error: 'Could not submit — tell your teacher.' }, { status: 500 })
  }
}
