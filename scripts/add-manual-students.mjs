// One-off/re-runnable migration: adds student rosters that do NOT exist in
// portal-data.js (either because that group started after the last data build,
// or its roster was only ever confirmed in Hugo's memory notes, not the local
// static Portal). Source: Hugo's own dictated confirmations, not portal-data.js.
//
// - Flyers I (slug: flyers) — 11 students confirmed 23 Sep 2026 by Hugo directly
//   (matches Level_Ladder_Scores_9Sep2026.md "ALL 11 CONFIRMED" and the level-gap
//   investigation roster). Surname resolved 25 Sep 2026: Vera Castel Dolz
//   (Pau's sister) — Castel Dolz is her full surname.
// - Private class (slug: private-tue) — 1 student, Ivan, confirmed 22 Sep 2026.
//
// Idempotent: skips a name already on that group's roster in Postgres, so
// re-running after Hugo confirms a surname or adds a student only inserts the
// delta. Groups intentionally left untouched (per Hugo 25 Sep 2026): KET I (not
// running), B1+Seniors (starts October), B2 Conversación (not yet started).
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const MANUAL_ROSTERS = {
  flyers: [
    'Gael', 'Enzo', 'Pau', 'Vera Castel Dolz', 'Vera de la Ossa', 'Ona',
    'Carla', 'Madison', 'Lucas', 'Martin', 'Bruno',
  ],
  'private-tue': ['Ivan'],
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

async function main() {
  const { rows: groups } = await pool.query('SELECT id, name, slug, level FROM groups')
  const bySlug = new Map(groups.map(g => [g.slug, g]))

  let inserted = 0, skipped = 0, noGroup = 0

  for (const [slug, names] of Object.entries(MANUAL_ROSTERS)) {
    const group = bySlug.get(slug)
    if (!group) { console.warn(`No matching group for slug "${slug}" — skipping ${names.length} student(s)`); noGroup += names.length; continue }

    const { rows: existing } = await pool.query('SELECT name FROM students WHERE group_id = $1', [group.id])
    const existingNames = new Set(existing.map(r => r.name))

    for (const name of names) {
      if (existingNames.has(name)) { skipped++; continue }
      await pool.query(
        `INSERT INTO students (id, name, group_name, level, group_id, enrolled_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE::text)`,
        [newId(), name, group.name, group.level, group.id]
      )
      inserted++
    }
  }

  console.log(`students: ${inserted} inserted, ${skipped} already there, ${noGroup} had no matching group`)
  await pool.end()
}

main().catch(err => { console.error(err); process.exit(1) })
