import { NextRequest, NextResponse } from 'next/server'
import { requireStudentAccess } from '@/lib/authz'
import { getDb, newId } from '@/lib/db'
import { sanitiseProgress } from '@/lib/courses/progress'
import { ACTIVITIES } from '@/lib/courses/mondayYoungAdults'

export const runtime = 'nodejs'

// Teacher only. Copies one student's Monday Young Adults digital-week results into their
// ficha as a single work entry: average first-attempt score, the exercises where they
// slipped (these feed the ficha's recurring-error chips) and every wrong answer with what
// they chose. Press it again and the same entry is updated, never duplicated.
const COURSE = 'monday-young-adults'
const TITLE = 'Monday Young Adults · Digital week 1'

const key = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const ITEMS = new Map<string, { topic: string; line: (picks: string[], n: number) => string }>()
for (const a of ACTIVITIES) for (const e of a.exercises) for (const it of e.items) {
  const prompt = it.kind === 'gap' ? `${it.before} ____ ${it.after ?? ''}`.trim() : it.q
  const right = it.kind === 'gap' ? it.answers[0] : it.kind === 'choice' ? it.options[it.answer] : (e.options?.[it.answer] ?? '')
  const topic = `${a.title}: ${e.title.split(' · ').slice(1).join(' · ') || e.title}`
  ITEMS.set(`${a.id}.${e.id}.${it.id}`.slice(0, 60), {
    topic,
    line: (picks, n) => `${a.no}${e.id} "${prompt}" right: ${right}; chose: ${picks.join(' / ') || '?'}${n > 1 ? ` (x${n})` : ''}`,
  })
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { student?: string }
  const who = key(String(body.student || ''))
  if (!who) return NextResponse.json({ error: 'No student given.' }, { status: 400 })

  const db = await getDb()
  const all = (await db.prepare('SELECT id, name, group_name FROM students').all()) as { id: string; name: string; group_name: string }[]
  const hits = all.filter(s => key(s.name) === who || key(s.name).split(/\s+/)[0] === who)
  if (hits.length === 0) return NextResponse.json({ error: `No ficha called "${body.student}". Create the student in Students first, then press again.` }, { status: 404 })
  if (hits.length > 1) return NextResponse.json({ error: `More than one ficha matches "${body.student}": ${hits.map(h => `${h.name} (${h.group_name || 'no group'})`).join(', ')}.` }, { status: 409 })
  const st = hits[0]
  if (!(await requireStudentAccess(st.id))) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 })

  const row = (await db.prepare('SELECT data FROM course_progress WHERE student_key = ? AND course = ?').get(who.split(/\s+/)[0], COURSE)) as { data: string } | undefined
  if (!row) return NextResponse.json({ error: 'This student has not saved any course work yet.' }, { status: 404 })
  let p = sanitiseProgress(null)
  try { p = sanitiseProgress(JSON.parse(row.data)) } catch { /* corrupt row: treated as empty */ }

  const scores = Object.values(p.lessons).map(l => l.score)
  const score = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const mistakes = Object.entries(p.mistakes ?? {}).filter(([id]) => ITEMS.has(id)).sort((a, b) => b[1].n - a[1].n)
  const patterns = Array.from(new Set(mistakes.map(([id]) => ITEMS.get(id)!.topic)))
  const fixed = mistakes.filter(([, m]) => m.fixes >= 2).length
  const writing = Object.keys(p.writing ?? {}).length
  const feedback = [
    `Digital course (self-checked, first attempts): ${scores.length} exercises done, average ${score ?? '-'}%. Active ${p.days.length} day(s). Writing sent: ${writing}.`,
    mistakes.length
      ? `Mistakes: ${mistakes.length}, ${fixed} fixed in Improve my mistakes.\n` + mistakes.map(([id, m]) => `- ${ITEMS.get(id)!.line(m.picks, m.n)}${m.fixes >= 2 ? ' [fixed]' : ''}`).join('\n')
      : 'No mistakes recorded.',
  ].join('\n')

  const date = new Date().toISOString().slice(0, 10)
  const existing = (await db.prepare('SELECT id FROM work_entries WHERE student_id = ? AND title = ?').get(st.id, TITLE)) as { id: string } | undefined
  if (existing) {
    await db.prepare('UPDATE work_entries SET date = ?, score = ?, ai_feedback = ?, ai_error_patterns = ? WHERE id = ?')
      .run(date, score, feedback, JSON.stringify(patterns), existing.id)
  } else {
    await db.prepare(`INSERT INTO work_entries (id, student_id, type, title, date, score, ai_feedback, ai_error_patterns, status)
      VALUES (?, ?, 'homework', ?, ?, ?, ?, ?, 'corrected')`)
      .run(newId(), st.id, TITLE, date, score, feedback, JSON.stringify(patterns))
  }
  return NextResponse.json({ ok: true, action: existing ? 'updated' : 'created', studentId: st.id, name: st.name, mistakes: mistakes.length })
}
