import { getDb, newId } from './db'

// Function 6 — persistence for the Aoife pen-pal. Two tables (see db.ts):
//   aoife_threads  — one row per learner: which day, the rolling story summary, the
//                    cached current-day message.
//   aoife_turns    — one row per completed day: what she said, her rewrite, error types.
// Everything is keyed by student_key (the normalised Student's-Corner name).

export interface AoifeThread {
  student_key: string
  day: number
  story_summary: string
  last_message: string // JSON: { message, questions } cached for the current day
}

export function normaliseKey(name: string): string {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export async function getThread(key: string): Promise<AoifeThread> {
  const db = await getDb()
  const row = (await db.prepare('SELECT * FROM aoife_threads WHERE student_key = ?').get(key)) as
    | AoifeThread
    | undefined
  if (row) return row
  await db
    .prepare('INSERT INTO aoife_threads (student_key, day, story_summary, last_message) VALUES (?, 1, \'\', \'\')')
    .run(key)
  return { student_key: key, day: 1, story_summary: '', last_message: '' }
}

export async function cacheMessage(key: string, payload: unknown): Promise<void> {
  const db = await getDb()
  await db
    .prepare('UPDATE aoife_threads SET last_message = ?, updated_at = now()::text WHERE student_key = ?')
    .run(JSON.stringify(payload), key)
}

// Aggregate her recurring error types across all completed turns -> { type: count }.
export async function errorProfile(key: string): Promise<Record<string, number>> {
  const db = await getDb()
  const rows = (await db
    .prepare('SELECT error_types FROM aoife_turns WHERE student_key = ?')
    .all(key)) as { error_types: string }[]
  const tally: Record<string, number> = {}
  for (const r of rows) {
    let arr: string[] = []
    try {
      arr = JSON.parse(r.error_types || '[]')
    } catch {
      arr = []
    }
    for (const t of arr) tally[t] = (tally[t] || 0) + 1
  }
  return tally
}

// Save a completed day: write the turn, advance the day, store the new summary,
// clear the cached message so the next day is composed fresh.
export async function saveTurn(opts: {
  key: string
  day: number
  question: string
  transcript: string
  rewrite: string
  errorTypes: string[]
  newSummary: string
}): Promise<{ day: number; daysDone: number }> {
  const db = await getDb()
  await db
    .prepare(
      'INSERT INTO aoife_turns (id, student_key, day, question, transcript, rewrite, error_types) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(newId(), opts.key, opts.day, opts.question, opts.transcript, opts.rewrite, JSON.stringify(opts.errorTypes))

  const nextDay = Math.min(opts.day + 1, 31)
  await db
    .prepare(
      'UPDATE aoife_threads SET day = ?, story_summary = ?, last_message = \'\', updated_at = now()::text WHERE student_key = ?',
    )
    .run(nextDay, opts.newSummary, opts.key)

  const doneRow = (await db
    .prepare('SELECT COUNT(*)::int AS n FROM aoife_turns WHERE student_key = ?')
    .get(opts.key)) as { n: number }
  return { day: nextDay, daysDone: doneRow?.n ?? 0 }
}

// Her most recent rewrite, so Aoife can react to what Miriam actually said last time.
export async function lastReply(key: string): Promise<string> {
  const db = await getDb()
  const row = (await db
    .prepare('SELECT rewrite FROM aoife_turns WHERE student_key = ? ORDER BY created_at DESC LIMIT 1')
    .get(key)) as { rewrite: string } | undefined
  return row?.rewrite || ''
}

export async function daysDone(key: string): Promise<number> {
  const db = await getDb()
  const row = (await db
    .prepare('SELECT COUNT(*)::int AS n FROM aoife_turns WHERE student_key = ?')
    .get(key)) as { n: number }
  return row?.n ?? 0
}
