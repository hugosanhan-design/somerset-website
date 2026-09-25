import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { monthClassDays, type CalendarConfig, type GroupSlot } from '@/lib/academicCalendar'

// The dashboard's month calendar: which groups meet on which days this month, and
// whether each of those lessons has been marked ready. Manual toggle, not disk-scan —
// see lib/db.ts's comment on lesson_log for why.
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ym = req.nextUrl.searchParams.get('ym') || new Date().toISOString().slice(0, 7)
  const db = await getDb()

  const calRow = await db.prepare('SELECT * FROM calendar_config ORDER BY term_start DESC LIMIT 1').get() as
    { term_start: string; term_end: string; festivos: string; breaks: string } | undefined

  if (!calRow) {
    return NextResponse.json({ error: 'No academic calendar configured yet' }, { status: 404 })
  }

  const cal: CalendarConfig = {
    term_start: calRow.term_start,
    term_end: calRow.term_end,
    festivos: JSON.parse(calRow.festivos || '[]'),
    breaks: JSON.parse(calRow.breaks || '[]'),
  }

  const isAdmin = session.user.role === 'admin'
  const slotRows = await db.prepare(`
    SELECT gs.group_id, g.name as group_name, g.slug as group_slug, g.level as group_level, gs.dow, gs.from_time, gs.to_time
    FROM group_slots gs JOIN groups g ON g.id = gs.group_id
    WHERE g.active = 1 ${isAdmin ? '' : 'AND (g.teacher_id = ? OR g.teacher_id IS NULL)'}
  `).all(...(isAdmin ? [] : [session.user.id])) as GroupSlot[]

  const days = monthClassDays(ym, cal, slotRows)

  const logRows = await db.prepare(`
    SELECT group_id, date, status, note FROM lesson_log
    WHERE date >= ? AND date < ?
  `).all(`${ym}-01`, `${ym}-32`) as { group_id: string; date: string; status: string; note: string }[]
  const logByKey = new Map(logRows.map(r => [`${r.group_id}|${r.date}`, r]))

  const enriched = days.map(d => ({
    date: d.date,
    groups: d.groups.map(g => {
      const log = logByKey.get(`${g.group_id}|${d.date}`)
      return {
        group_id: g.group_id,
        group_name: g.group_name,
        group_slug: g.group_slug,
        group_level: g.group_level || '',
        from_time: g.from_time,
        to_time: g.to_time,
        status: log?.status || 'not_ready',
        note: log?.note || '',
      }
    }),
  }))

  return NextResponse.json({ ym, days: enriched })
}
