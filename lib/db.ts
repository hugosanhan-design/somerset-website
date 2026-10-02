import { Pool } from 'pg'
import { attachDatabasePool } from '@vercel/functions'

// Real persistent storage (Neon Postgres) — replaces the old local-file SQLite setup,
// which turned out to be read-only in production (confirmed via SQLITE_READONLY errors,
// 2026-07-12) and was never actually durable. Every call site that used to call
// better-sqlite3 synchronously now needs `await` — see the Statement shim below, which
// keeps each route's `.prepare(sql).get/all/run(...)` call shape almost unchanged (still
// takes `?` placeholders) so the migration is mechanical rather than a full rewrite.

let _pool: Pool | null = null
let _schemaReady: Promise<void> | null = null

function getPool(): Pool {
  if (_pool) return _pool
  _pool = new Pool({ connectionString: process.env.DATABASE_URL })
  attachDatabasePool(_pool)
  return _pool
}

// SQLite used `?` placeholders; pg uses `$1, $2, ...`. Converting here means query strings
// written for SQLite don't need editing at every call site.
function toPgParams(sql: string): string {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

class Statement {
  constructor(private sql: string) {}

  async get(...params: unknown[]): Promise<any> {
    const res = await getPool().query(toPgParams(this.sql), params)
    return res.rows[0]
  }

  async all(...params: unknown[]): Promise<any[]> {
    const res = await getPool().query(toPgParams(this.sql), params)
    return res.rows
  }

  async run(...params: unknown[]): Promise<{ changes: number }> {
    const res = await getPool().query(toPgParams(this.sql), params)
    return { changes: res.rowCount ?? 0 }
  }
}

interface Db {
  prepare(sql: string): Statement
  exec(sql: string): Promise<void>
}

function makeDb(): Db {
  return {
    prepare(sql: string) {
      return new Statement(sql)
    },
    async exec(sql: string) {
      await getPool().query(sql)
    },
  }
}

export async function getDb(): Promise<Db> {
  if (!_schemaReady) _schemaReady = initSchema()
  await _schemaReady
  return makeDb()
}

async function initSchema(): Promise<void> {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      group_name  TEXT DEFAULT '',
      level       TEXT DEFAULT '',
      notes       TEXT DEFAULT '',
      enrolled_at TEXT DEFAULT (CURRENT_DATE::text),
      created_at  TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS work_entries (
      id               TEXT PRIMARY KEY,
      student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      type             TEXT NOT NULL,
      title            TEXT NOT NULL DEFAULT '',
      date             TEXT NOT NULL,
      score            INTEGER,
      ai_feedback      TEXT DEFAULT '',
      ai_error_patterns TEXT DEFAULT '[]',
      image_filename   TEXT DEFAULT '',
      teacher_notes    TEXT DEFAULT '',
      created_at       TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS context_lab_cache (
      cache_key  TEXT PRIMARY KEY,
      kind       TEXT NOT NULL,
      payload    TEXT NOT NULL,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS curricula (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      level      TEXT DEFAULT '',
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS curriculum_units (
      id            TEXT PRIMARY KEY,
      curriculum_id TEXT NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
      order_index   INTEGER NOT NULL,
      title         TEXT NOT NULL,
      grammar_focus TEXT DEFAULT '',
      vocab_focus   TEXT DEFAULT '',
      notes         TEXT DEFAULT '',
      created_at    TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      level           TEXT DEFAULT '',
      curriculum_id   TEXT REFERENCES curricula(id) ON DELETE SET NULL,
      current_unit_id TEXT REFERENCES curriculum_units(id) ON DELETE SET NULL,
      created_at      TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id         TEXT PRIMARY KEY,
      group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      date       TEXT NOT NULL,
      present    INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (now()::text),
      UNIQUE(group_id, student_id, date)
    );

    CREATE TABLE IF NOT EXISTS exercise_answers (
      id         TEXT PRIMARY KEY,
      group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      date       TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      item_n     INTEGER NOT NULL,
      chosen     TEXT NOT NULL,
      correct_key TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (now()::text),
      updated_at TEXT DEFAULT (now()::text),
      UNIQUE(student_id, date, exercise_id, item_n)
    );

    CREATE TABLE IF NOT EXISTS mock_exams (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      definition TEXT NOT NULL,
      created_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS mock_answer_keys (
      exam_id     TEXT PRIMARY KEY REFERENCES mock_exams(id) ON DELETE CASCADE,
      answers     TEXT NOT NULL,
      reviewed_by TEXT NOT NULL DEFAULT '',
      reviewed_at TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS cbt_responses (
      id           TEXT PRIMARY KEY,
      exam_id      TEXT NOT NULL,
      student_name TEXT NOT NULL,
      paper        TEXT NOT NULL,
      answers      TEXT NOT NULL,
      score        TEXT,
      started_at   TEXT,
      submitted_at TEXT DEFAULT (now()::text)
    );

    -- In-progress CBT sessions, saved server-side so a student can resume on ANY device
    -- (or after the computer dies) using a short resume code — not just on the same
    -- browser. seconds_left stores the remaining time at the last save, so a resume
    -- restores the time that was left (the clock effectively pauses during an outage)
    -- rather than counting down against a wall-clock deadline. Rows are deleted on submit.
    CREATE TABLE IF NOT EXISTS cbt_drafts (
      code         TEXT PRIMARY KEY,
      exam_id      TEXT NOT NULL,
      student_name TEXT NOT NULL,
      paper        TEXT NOT NULL,
      part_idx     INTEGER NOT NULL DEFAULT 0,
      answers      TEXT NOT NULL DEFAULT '{}',
      task2_choice INTEGER NOT NULL DEFAULT 2,
      seconds_left INTEGER NOT NULL DEFAULT 0,
      extras       TEXT NOT NULL DEFAULT '{}',
      started_at   TEXT,
      submitted    INTEGER NOT NULL DEFAULT 0,
      updated_at   TEXT DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'teacher',
      created_at    TEXT DEFAULT (now()::text)
    );

    -- Function 6 — Aoife the daily pen-pal. Keyed by a stable student_key (the
    -- normalised Student's-Corner name), NOT the teacher-managed students.id, because
    -- a self-serve learner isn't necessarily a students row.
    CREATE TABLE IF NOT EXISTS aoife_threads (
      student_key   TEXT PRIMARY KEY,
      day           INTEGER NOT NULL DEFAULT 1,
      story_summary TEXT DEFAULT '',
      last_message  TEXT DEFAULT '',
      updated_at    TEXT DEFAULT (now()::text)
    );

    -- Somerset Portal dashboard: each group's weekly meeting slots (a group can
    -- meet more than once a week), the one shared academic-year calendar config
    -- (term dates, festivos, breaks — mirrors the local Portal's data/calendar.json,
    -- the rule being: a class day is any weekday in term that isn't a festivo or
    -- inside a break), and a manually-toggled ready/not-ready log per group per date
    -- (replaces the old local Portal's disk-scan auto-detection, which can't run from
    -- a Vercel serverless function — it can't see Hugo's Mac filesystem).
    CREATE TABLE IF NOT EXISTS group_slots (
      id       TEXT PRIMARY KEY,
      group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      dow      INTEGER NOT NULL,
      from_time TEXT NOT NULL,
      to_time   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_config (
      id          TEXT PRIMARY KEY,
      year_label  TEXT NOT NULL,
      term_start  TEXT NOT NULL,
      term_end    TEXT NOT NULL,
      festivos    TEXT NOT NULL DEFAULT '[]',
      breaks      TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS lesson_log (
      id       TEXT PRIMARY KEY,
      group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      date     TEXT NOT NULL,
      status   TEXT NOT NULL DEFAULT 'not_ready',
      note     TEXT DEFAULT '',
      updated_at TEXT DEFAULT (now()::text),
      UNIQUE(group_id, date)
    );

    CREATE TABLE IF NOT EXISTS aoife_turns (
      id          TEXT PRIMARY KEY,
      student_key TEXT NOT NULL,
      day         INTEGER NOT NULL,
      question    TEXT DEFAULT '',
      transcript  TEXT DEFAULT '',
      rewrite     TEXT DEFAULT '',
      error_types TEXT DEFAULT '[]',
      created_at  TEXT DEFAULT (now()::text)
    );

    -- Phase 1 online course: teacher creates a catch-up pack after class for absent students.
    -- Each pack gets a public shareable URL (/catchup/[id]) with no login required.
    CREATE TABLE IF NOT EXISTS catchup_packs (
      id             TEXT PRIMARY KEY,
      group_id       TEXT REFERENCES groups(id) ON DELETE CASCADE,
      date           TEXT NOT NULL,
      unit_title     TEXT NOT NULL DEFAULT '',
      writing_prompt TEXT DEFAULT '',
      cbt_paper      TEXT DEFAULT '',
      reading_url    TEXT DEFAULT '',
      reading_label  TEXT DEFAULT '',
      note           TEXT DEFAULT '',
      created_by     TEXT REFERENCES teachers(id) ON DELETE SET NULL,
      created_at     TEXT DEFAULT (now()::text)
    );
  `)

  await addColumnIfMissing(pool, 'students', 'group_id', "TEXT REFERENCES groups(id) ON DELETE SET NULL")
  await addColumnIfMissing(pool, 'students', 'parent_email', "TEXT DEFAULT ''")
  await addColumnIfMissing(pool, 'work_entries', 'by_skill', "TEXT DEFAULT NULL")
  await addColumnIfMissing(pool, 'work_entries', 'status', "TEXT NOT NULL DEFAULT 'corrected'")
  await addColumnIfMissing(pool, 'work_entries', 'image_url', "TEXT DEFAULT ''")
  await addColumnIfMissing(pool, 'work_entries', 'corrected_at', "TEXT DEFAULT NULL")
  await addColumnIfMissing(pool, 'work_entries', 'cefr_estimate', "TEXT DEFAULT ''")
  await addColumnIfMissing(pool, 'work_entries', 'criteria', "TEXT DEFAULT ''")
  await addColumnIfMissing(pool, 'work_entries', 'transcribed_text', "TEXT DEFAULT ''")
  await addColumnIfMissing(pool, 'work_entries', 'criteria_check', "TEXT DEFAULT '[]'")
  await addColumnIfMissing(pool, 'groups', 'teacher_id', "TEXT REFERENCES teachers(id) ON DELETE SET NULL")
  await addColumnIfMissing(pool, 'teachers', 'reset_token', "TEXT DEFAULT NULL")
  await addColumnIfMissing(pool, 'teachers', 'reset_token_expires', "TEXT DEFAULT NULL")
  await addColumnIfMissing(pool, 'groups', 'slug', "TEXT UNIQUE")
  await addColumnIfMissing(pool, 'groups', 'active', "INTEGER NOT NULL DEFAULT 1")
  // Defensive: if an earlier deploy created cbt_drafts before the extras column existed.
  await addColumnIfMissing(pool, 'cbt_drafts', 'extras', "TEXT NOT NULL DEFAULT '{}'")
  await addColumnIfMissing(pool, 'catchup_packs', 'cbt_exam_id', "TEXT DEFAULT ''")
  await migrateGroupNamesToGroups(pool)
}

async function addColumnIfMissing(pool: Pool, table: string, column: string, definition: string) {
  const { rows } = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  )
  if (rows.length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

// One-time, idempotent: turn existing free-text student.group_name values into real Group rows,
// and link each student to its group via group_id. Never touches group_name itself.
async function migrateGroupNamesToGroups(pool: Pool) {
  const { rows: distinctNames } = await pool.query(
    `SELECT DISTINCT group_name FROM students WHERE group_name != '' AND group_id IS NULL`
  )

  for (const { group_name } of distinctNames as { group_name: string }[]) {
    const { rows } = await pool.query('SELECT id FROM groups WHERE name = $1', [group_name])
    let groupId = rows[0]?.id as string | undefined
    if (!groupId) {
      groupId = newId()
      await pool.query('INSERT INTO groups (id, name) VALUES ($1, $2)', [groupId, group_name])
    }
    await pool.query('UPDATE students SET group_id = $1 WHERE group_name = $2 AND group_id IS NULL', [groupId, group_name])
  }
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export async function getCached<T>(key: string): Promise<T | null> {
  const db = await getDb()
  const row = await db.prepare('SELECT payload FROM context_lab_cache WHERE cache_key = ?').get(key) as { payload: string } | undefined
  if (!row) return null
  try { return JSON.parse(row.payload) as T } catch { return null }
}

export async function setCached(key: string, kind: 'pack' | 'text', payload: unknown): Promise<void> {
  const db = await getDb()
  await db.prepare(
    "INSERT INTO context_lab_cache (cache_key, kind, payload) VALUES (?, ?, ?) ON CONFLICT(cache_key) DO UPDATE SET payload = excluded.payload, created_at = now()::text"
  ).run(key, kind, JSON.stringify(payload))
}
