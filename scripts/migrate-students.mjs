// One-off/re-runnable migration: pulls the per-group student rosters out of the
// local Somerset Portal's generated portal-data.js (top-level `classes[].students`
// arrays — first names only, as Hugo keeps them there) and into Postgres, linked
// to the matching group by slug (classId === groups.slug). Idempotent: skips a
// name already on that group's roster, so re-running after adding a new student
// to portal-data.js only inserts the new one.
//
// Groups with `"students": null` in portal-data.js (Private class, B1+Seniors,
// B2 Conversación) are left untouched here — add students for those by hand in
// the Portal, or add them to portal-data.js and re-run this script.
import { Pool } from 'pg'
import fs from 'fs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

async function main() {
  const portalDataPath = process.argv[2]
  if (!portalDataPath) {
    console.error('Usage: node migrate-students.mjs <path to portal-data.js>')
    process.exit(1)
  }
  const raw = fs.readFileSync(portalDataPath, 'utf-8')
  const jsonText = raw.split('window.PORTAL_DATA = ')[1].split(/;\s*$/)[0]
  const D = JSON.parse(jsonText)

  const { rows: groups } = await pool.query('SELECT id, name, slug, level FROM groups')
  const bySlug = new Map(groups.map(g => [g.slug, g]))

  let inserted = 0, skipped = 0, noGroup = 0

  for (const c of D.classes || []) {
    if (!Array.isArray(c.students) || c.students.length === 0) continue
    const group = bySlug.get(c.id)
    if (!group) { console.warn(`No matching group for classId "${c.id}" — skipping ${c.students.length} student(s)`); noGroup += c.students.length; continue }

    const { rows: existing } = await pool.query('SELECT name FROM students WHERE group_id = $1', [group.id])
    const existingNames = new Set(existing.map(r => r.name))

    for (const name of c.students) {
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
