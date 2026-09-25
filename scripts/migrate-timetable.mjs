// One-off migration: import the real 2026-27 timetable + academic calendar from the
// local Portal's JSON files into Postgres (groups, group_slots, calendar_config).
// Safe to re-run — everything is upserted by slug / by a fixed calendar id.
import { Pool } from 'pg'
import fs from 'fs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

async function main() {
  const timetable = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'))
  const calendar = JSON.parse(fs.readFileSync(process.argv[3], 'utf-8'))

  // Ensure this run's tables/columns exist even if the app hasn't been deployed yet
  // with the new schema (mirrors lib/db.ts's own migration, safe to run twice).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_slots (
      id TEXT PRIMARY KEY, group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      dow INTEGER NOT NULL, from_time TEXT NOT NULL, to_time TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS calendar_config (
      id TEXT PRIMARY KEY, year_label TEXT NOT NULL, term_start TEXT NOT NULL, term_end TEXT NOT NULL,
      festivos TEXT NOT NULL DEFAULT '[]', breaks TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS lesson_log (
      id TEXT PRIMARY KEY, group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'not_ready', note TEXT DEFAULT '',
      updated_at TEXT DEFAULT (now()::text), UNIQUE(group_id, date)
    );
  `)
  async function addColIfMissing(table, col, def) {
    const { rows } = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name=$1 AND column_name=$2`, [table, col])
    if (rows.length === 0) await pool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`)
  }
  await addColIfMissing('groups', 'slug', 'TEXT UNIQUE')
  await addColIfMissing('groups', 'active', 'INTEGER NOT NULL DEFAULT 1')

  for (const cls of timetable.classes) {
    const { rows } = await pool.query('SELECT id FROM groups WHERE slug = $1', [cls.id])
    let groupId = rows[0]?.id
    if (!groupId) {
      groupId = newId()
      await pool.query(
        'INSERT INTO groups (id, name, level, slug, active) VALUES ($1,$2,$3,$4,$5)',
        [groupId, cls.label, cls.level || '', cls.id, cls.active ? 1 : 0]
      )
      console.log('created group', cls.id, cls.label)
    } else {
      await pool.query('UPDATE groups SET name=$1, level=$2, active=$3 WHERE id=$4',
        [cls.label, cls.level || '', cls.active ? 1 : 0, groupId])
      console.log('updated group', cls.id, cls.label)
    }

    await pool.query('DELETE FROM group_slots WHERE group_id = $1', [groupId])
    for (const slot of cls.slots) {
      await pool.query(
        'INSERT INTO group_slots (id, group_id, dow, from_time, to_time) VALUES ($1,$2,$3,$4,$5)',
        [newId(), groupId, slot.dow, slot.from, slot.to]
      )
    }
    console.log('  slots:', cls.slots.length)
  }

  const calId = `${calendar.year || 'current'}`
  const { rows: existingCal } = await pool.query('SELECT id FROM calendar_config WHERE id = $1', [calId])
  const festivos = JSON.stringify(calendar.festivos || [])
  const breaks = JSON.stringify(calendar.breaks || [])
  if (existingCal.length === 0) {
    await pool.query(
      'INSERT INTO calendar_config (id, year_label, term_start, term_end, festivos, breaks) VALUES ($1,$2,$3,$4,$5,$6)',
      [calId, calendar.year || '', calendar.termStart, calendar.termEnd, festivos, breaks]
    )
    console.log('created calendar_config', calId)
  } else {
    await pool.query(
      'UPDATE calendar_config SET year_label=$1, term_start=$2, term_end=$3, festivos=$4, breaks=$5 WHERE id=$6',
      [calendar.year || '', calendar.termStart, calendar.termEnd, festivos, breaks, calId]
    )
    console.log('updated calendar_config', calId)
  }

  await pool.end()
  console.log('done')
}

main().catch(err => { console.error(err); process.exit(1) })
