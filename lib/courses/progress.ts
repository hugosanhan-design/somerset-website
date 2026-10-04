// Course progress: Leitner-box spaced repetition per item, active days, the study plan
// and game bests. Pure functions here are shared by the browser and the save API, so
// nothing at module level may touch `window`.

export type ItemState = {
  box: number          // 1..5; climbs on a clean first-try answer, drops to 1 on a miss
  due: number          // epoch ms when it should come back
  last: number         // epoch ms of the last attempt (used to merge devices)
  right: number
  wrong: number
  ok?: boolean         // was the most recent attempt clean
}

export type Progress = {
  v: 1
  items: Record<string, ItemState>
  days: string[]                       // local dates (YYYY-MM-DD) with any activity
  plan?: { days: string[]; hours: string; goal: string; at: number }
  best: Record<string, number>         // game id -> best score
  lessons: Record<string, { score: number; at: number }>
  // The student's own mistakes from speaking, revised later in Spot the mistake.
  personal?: Record<string, PersonalFix>
  speaking?: { at: number; accuracy: number; fluency: number; words: number }[]
}

export type PersonalFix = { pre: string; seg: string; post: string; fix: string; why: string; at: number }

const DAY = 86_400_000
// Days until an item returns, by box. Box 1 = missed or new: back tomorrow.
const INTERVAL_DAYS = [0, 1, 3, 7, 21, 60]
export const MASTERED_BOX = 3

export function emptyProgress(): Progress {
  return { v: 1, items: {}, days: [], best: {}, lessons: {} }
}

export function localDate(t = Date.now()): string {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function recordAnswer(p: Progress, id: string, cleanFirstTry: boolean, now = Date.now()): Progress {
  const prev = p.items[id]
  // A word only climbs when it was due: replaying the same day is practice, not proof
  // it has stuck. A miss always drops it back to box 1.
  const climbs = cleanFirstTry && (!prev || prev.due <= now)
  const box = !cleanFirstTry ? 1 : climbs ? Math.min((prev?.box ?? 0) + 1, 5) : prev!.box
  const items = {
    ...p.items,
    [id]: {
      box,
      due: cleanFirstTry && !climbs ? prev!.due : now + INTERVAL_DAYS[box] * DAY,
      last: now,
      right: (prev?.right ?? 0) + (cleanFirstTry ? 1 : 0),
      wrong: (prev?.wrong ?? 0) + (cleanFirstTry ? 0 : 1),
      ok: cleanFirstTry,
    },
  }
  return markActive({ ...p, items }, now)
}

export function markActive(p: Progress, now = Date.now()): Progress {
  const today = localDate(now)
  return p.days.includes(today) ? p : { ...p, days: [...p.days, today].sort() }
}

// Revise picks: overdue first (oldest due first), then weakest box, then most-missed.
// Only items the student has already met are eligible — revision, not new teaching.
export function pickForReview(p: Progress, candidateIds: string[], n: number, now = Date.now()): string[] {
  const seen = candidateIds.filter(id => p.items[id])
  const overdue = seen
    .filter(id => p.items[id].due <= now)
    .sort((a, b) => p.items[a].due - p.items[b].due || p.items[b].wrong - p.items[a].wrong)
  // Fill-ins (not yet due) favour the weakest; a small shuffle stops two sessions in a row feeling identical.
  const rest = seen
    .filter(id => p.items[id].due > now)
    .sort((a, b) => p.items[a].box - p.items[b].box || p.items[b].wrong - p.items[a].wrong)
    .slice(0, n + 3)
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  const chosen = [...overdue.slice(0, n), ...rest.slice(0, Math.max(0, n - overdue.length))]
  // Same set, varied order: due items still always make the cut.
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chosen[i], chosen[j]] = [chosen[j], chosen[i]]
  }
  return chosen
}

export function dueCount(p: Progress, ids: string[], now = Date.now()): number {
  return ids.filter(id => p.items[id] && p.items[id].due <= now).length
}

export function masteredCount(p: Progress, ids: string[]): number {
  return ids.filter(id => (p.items[id]?.box ?? 0) >= MASTERED_BOX).length
}

// ─── Weekly goal and streak ───────────────────────────────────────────────────
// Forgiving by design: the streak counts weeks in which the student met their own
// planned number of days, not unbroken daily runs.

function mondayOf(t: number): string {
  const d = new Date(t)
  const dow = (d.getDay() + 6) % 7
  return localDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow).getTime())
}

export function weeklyGoal(p: Progress): number {
  return Math.max(1, Math.min(7, p.plan?.days.length || 3))
}

export function daysThisWeek(p: Progress, now = Date.now()): number {
  const wk = mondayOf(now)
  return p.days.filter(d => mondayOf(new Date(d + 'T12:00:00').getTime()) === wk).length
}

export function weekStreak(p: Progress, now = Date.now()): number {
  const goal = weeklyGoal(p)
  const perWeek: Record<string, number> = {}
  for (const d of p.days) {
    const wk = mondayOf(new Date(d + 'T12:00:00').getTime())
    perWeek[wk] = (perWeek[wk] ?? 0) + 1
  }
  let streak = (perWeek[mondayOf(now)] ?? 0) >= goal ? 1 : 0
  let t = new Date(mondayOf(now) + 'T12:00:00').getTime() - 7 * DAY
  while ((perWeek[mondayOf(t)] ?? 0) >= goal) { streak++; t -= 7 * DAY }
  return streak
}

// ─── Merging two copies (phone + laptop) ──────────────────────────────────────

export function mergeProgress(a: Progress, b: Progress): Progress {
  const items: Record<string, ItemState> = { ...a.items }
  for (const [id, s] of Object.entries(b.items)) {
    if (!items[id] || s.last > items[id].last) items[id] = s
  }
  const best: Record<string, number> = { ...a.best }
  for (const [k, v] of Object.entries(b.best)) best[k] = Math.max(best[k] ?? 0, v)
  const lessons = { ...a.lessons }
  for (const [k, v] of Object.entries(b.lessons)) if (!lessons[k] || v.at > lessons[k].at) lessons[k] = v
  const plan = !a.plan ? b.plan : !b.plan ? a.plan : a.plan.at >= b.plan.at ? a.plan : b.plan
  const personal = { ...(a.personal ?? {}), ...(b.personal ?? {}) }
  const speaking = [...(a.speaking ?? []), ...(b.speaking ?? [])]
    .filter((x, i, arr) => arr.findIndex(y => y.at === x.at) === i)
    .sort((x, y) => x.at - y.at)
    .slice(-50)
  return { v: 1, items, days: Array.from(new Set([...a.days, ...b.days])).sort(), plan, best, lessons, personal, speaking }
}

export function sanitiseProgress(raw: unknown): Progress {
  const p = emptyProgress()
  if (!raw || typeof raw !== 'object') return p
  const r = raw as Partial<Progress>
  if (r.items && typeof r.items === 'object') {
    for (const [id, s] of Object.entries(r.items)) {
      if (id.length > 60 || !s || typeof s !== 'object') continue
      const n = (x: unknown) => (typeof x === 'number' && isFinite(x) ? x : 0)
      p.items[id] = { box: Math.min(5, Math.max(1, n(s.box))), due: n(s.due), last: n(s.last), right: n(s.right), wrong: n(s.wrong), ok: s.ok !== false }
    }
  }
  if (Array.isArray(r.days)) p.days = r.days.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-400)
  if (r.plan && typeof r.plan === 'object' && Array.isArray(r.plan.days)) {
    p.plan = { days: r.plan.days.filter(x => typeof x === 'string').slice(0, 7), hours: String(r.plan.hours ?? '').slice(0, 20), goal: String(r.plan.goal ?? '').slice(0, 60), at: Number(r.plan.at) || 0 }
  }
  if (r.best && typeof r.best === 'object') for (const [k, v] of Object.entries(r.best)) if (typeof v === 'number' && k.length < 30) p.best[k] = v
  if (r.lessons && typeof r.lessons === 'object') {
    for (const [k, v] of Object.entries(r.lessons)) {
      if (k.length < 30 && v && typeof v === 'object' && typeof v.score === 'number') p.lessons[k] = { score: v.score, at: Number(v.at) || 0 }
    }
  }
  if (r.personal && typeof r.personal === 'object') {
    p.personal = {}
    const str = (x: unknown, max: number) => String(x ?? '').slice(0, max)
    for (const [id, f] of Object.entries(r.personal).slice(-60)) {
      if (!/^own:[a-z0-9]{1,24}$/.test(id) || !f || typeof f !== 'object') continue
      p.personal[id] = { pre: str(f.pre, 300), seg: str(f.seg, 120), post: str(f.post, 300), fix: str(f.fix, 120), why: str(f.why, 300), at: Number(f.at) || 0 }
    }
  }
  if (Array.isArray(r.speaking)) {
    p.speaking = r.speaking
      .filter(x => x && typeof x === 'object')
      .map(x => ({ at: Number(x.at) || 0, accuracy: Number(x.accuracy) || 0, fluency: Number(x.fluency) || 0, words: Number(x.words) || 0 }))
      .slice(-50)
  }
  return p
}
