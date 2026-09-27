// One-off/re-runnable migration: pulls the RESOLVED per-date lesson content (unit,
// pages, plan, grammar, vocab, play, arcade, and the shelf of material labels — NOT
// the files themselves, which stay on Hugo's Mac) out of the local Somerset Portal's
// generated portal-data.js and into Postgres, so the web Portal's lesson panel can
// show real content instead of "nothing synced yet".
//
// Scope: all 4 groups with real lesson content in the Worksheets build —
// fce1, pet1, flyers, friday-b2 (widened 27 Sep 2026 from the original fce1/pet1-only
// scope; those were the only two with content built out on 25 Sep). Re-run any time
// portal-data.js is regenerated (`node build.mjs` in Somerset Worksheets/_apps/somerset-portal)
// to pick up new material; it's a full upsert per (group, date), safe to re-run.
import { Pool } from 'pg'
import fs from 'fs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const GROUPS = ['fce1', 'pet1', 'flyers', 'friday-b2']

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

async function main() {
  const portalDataPath = process.argv[2]
  if (!portalDataPath) {
    console.error('Usage: node migrate-lesson-content.mjs <path to portal-data.js>')
    process.exit(1)
  }
  const raw = fs.readFileSync(portalDataPath, 'utf-8')
  const jsonText = raw.split('window.PORTAL_DATA = ')[1].split(/;\s*$/)[0]
  const D = JSON.parse(jsonText)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_content (
      id TEXT PRIMARY KEY,
      group_slug TEXT NOT NULL,
      date TEXT NOT NULL,
      unit TEXT, unit_approx INTEGER NOT NULL DEFAULT 0,
      title TEXT, pages TEXT, grammar TEXT, vocab TEXT, warmer TEXT,
      plan TEXT, print_note TEXT, flag TEXT, note TEXT,
      play_json TEXT NOT NULL DEFAULT 'null',
      arcade_json TEXT NOT NULL DEFAULT 'null',
      shelves_json TEXT NOT NULL DEFAULT 'null',
      unit_audio_json TEXT NOT NULL DEFAULT '[]',
      generated_at TEXT,
      UNIQUE(group_slug, date)
    );
  `)

  let upserted = 0, skipped = 0
  for (const [date, day] of Object.entries(D.days)) {
    for (const c of day.classes || []) {
      if (!GROUPS.includes(c.classId)) continue
      const L = c.lesson || {}
      if (!L.unit && !L.title && !c.shelves) { skipped++; continue }
      await pool.query(
        `INSERT INTO lesson_content
           (id, group_slug, date, unit, unit_approx, title, pages, grammar, vocab, warmer,
            plan, print_note, flag, note, play_json, arcade_json, shelves_json, unit_audio_json, generated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (group_slug, date) DO UPDATE SET
           unit=EXCLUDED.unit, unit_approx=EXCLUDED.unit_approx, title=EXCLUDED.title,
           pages=EXCLUDED.pages, grammar=EXCLUDED.grammar, vocab=EXCLUDED.vocab, warmer=EXCLUDED.warmer,
           plan=EXCLUDED.plan, print_note=EXCLUDED.print_note, flag=EXCLUDED.flag, note=EXCLUDED.note,
           play_json=EXCLUDED.play_json, arcade_json=EXCLUDED.arcade_json, shelves_json=EXCLUDED.shelves_json,
           unit_audio_json=EXCLUDED.unit_audio_json, generated_at=EXCLUDED.generated_at`,
        [
          newId(), c.classId, date,
          L.unit || null, L.unitApprox ? 1 : 0, L.title || null, L.pages || null,
          L.grammar || null, L.vocab || null, L.warmer || null,
          L.plan || null, L.print || null, L.flag || null, c.note || null,
          JSON.stringify(L.play || L.plays || null),
          JSON.stringify(c.arcade || null),
          JSON.stringify(c.shelves || null),
          JSON.stringify((c.audio || []).concat(c.unitAudio || [])),
          D.generatedAt || null,
        ]
      )
      upserted++
    }
  }
  console.log(`lesson_content: ${upserted} upserted, ${skipped} skipped (no content)`)
  await pool.end()
}

main().catch(err => { console.error(err); process.exit(1) })
