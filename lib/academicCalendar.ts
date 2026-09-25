// Shared teaching-day logic — ported from the local Somerset Portal's data/calendar.json
// rule: "a class day is any weekday between termStart and termEnd that is not a festivo
// and not inside a break." Keep this in sync with that file if the rule ever changes;
// this is the same computation, just running against calendar_config in Postgres
// instead of a JSON file on Hugo's disk.

export interface CalendarConfig {
  term_start: string
  term_end: string
  festivos: { date: string; name: string }[]
  breaks: { name: string; from: string; to: string }[]
}

export interface GroupSlot {
  group_id: string
  group_name: string
  group_slug: string
  group_level?: string
  dow: number // 1 = Monday ... 5 = Friday, matching timetable.json's own convention
  from_time: string
  to_time: string
}

function toDate(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

function isoOf(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function isTeachingDay(dateIso: string, cal: CalendarConfig): boolean {
  const d = toDate(dateIso)
  if (d < toDate(cal.term_start) || d > toDate(cal.term_end)) return false

  const jsDow = d.getDay() // 0=Sun..6=Sat
  if (jsDow === 0 || jsDow === 6) return false // weekend

  if (cal.festivos.some(f => f.date === dateIso)) return false
  if (cal.breaks.some(b => d >= toDate(b.from) && d <= toDate(b.to))) return false

  return true
}

// timetable.json's dow convention is 1=Monday..5=Friday. JS Date#getDay() is 0=Sunday..
// 6=Saturday, so Monday there is 1 too — the two line up for weekdays, which is all a
// school timetable ever uses.
export function groupsMeetingOn(dateIso: string, slots: GroupSlot[]): GroupSlot[] {
  const jsDow = toDate(dateIso).getDay()
  return slots.filter(s => s.dow === jsDow)
}

// All dates in a given month (YYYY-MM) that are actual class days for at least one group.
export function monthClassDays(yearMonth: string, cal: CalendarConfig, slots: GroupSlot[]): {
  date: string
  groups: GroupSlot[]
}[] {
  const [y, m] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const out: { date: string; groups: GroupSlot[] }[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = isoOf(new Date(y, m - 1, day))
    if (!isTeachingDay(date, cal)) continue
    const groups = groupsMeetingOn(date, slots)
    if (groups.length > 0) out.push({ date, groups })
  }
  return out
}
