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
import path from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

// Node doesn't auto-load .env.local outside `next dev`/`next build` — running
// this script bare (`node scripts/...`) otherwise gets DATABASE_URL/
// BLOB_READ_WRITE_TOKEN as undefined, which is what caused the 27 Sep 2026
// ECONNREFUSED-to-localhost and "no Blob token" failures. Load it ourselves;
// swallow the error so this stays harmless in Vercel/CI where the file
// doesn't exist and the real env vars are already injected.
try {
  process.loadEnvFile(new URL('../.env.local', import.meta.url))
} catch {}


const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const GROUPS = ['fce1', 'pet1', 'flyers', 'friday-b2']

// Copy real material files (worksheets, keys, slides, notes, review plays) out of the
// Worksheets repo and into this app's public/materials-src/, mirroring their folder
// structure, then rewrite each href in-place from a local-relative path to a public
// URL path. Added 28 Sep 2026 after discovering these links 404'd on the deployed
// site — they'd only ever been resolved relative to the local static portal.
//
// NEVER copies anything under _source-books/ (publisher book audio/scans) — that
// stays "not synced yet" on purpose, see reference_somerset_portal.md's copyright note.
// Only shelves.{worksheet,key,slides,notes,other,plan} and play/plays hrefs are
// touched; unitAudio / shelves.audio are left completely alone.
function syncMaterials(D, relBase) {
  const worksheetsRoot = path.resolve(relBase, '..', '..')
  const publicRoot = fileURLToPath(new URL('../public/materials-src/', import.meta.url))
  const copiedDirs = new Set()
  let filesRewritten = 0, skippedCopyright = 0

  function toPublicHref(absPath) {
    const relFromRoot = path.relative(worksheetsRoot, absPath)
    if (relFromRoot.startsWith('..')) return null // outside the Worksheets repo entirely
    if (relFromRoot.includes('_source-books')) { skippedCopyright++; return null }
    const srcDir = path.dirname(absPath)
    const destDir = path.join(publicRoot, path.dirname(relFromRoot))
    if (!copiedDirs.has(srcDir)) {
      copiedDirs.add(srcDir)
      try {
        // fs.cpSync's permission-preserving copy throws EACCES on this FUSE mount;
        // plain `cp -R` (no -p) works fine and is all we need for static assets.
        // Trailing `/.` on the source copies CONTENTS into destDir, which we create
        // first — idempotent whether or not destDir already exists from a prior run.
        fs.mkdirSync(destDir, { recursive: true })
        execFileSync('cp', ['-R', srcDir + '/.', destDir])
      } catch (e) {
        console.warn(`  ! could not copy ${srcDir}: ${e.message}`)
        return null
      }
    }
    filesRewritten++
    return '/materials-src/' + relFromRoot.split(path.sep).map(encodeURIComponent).join('/')
  }

  function rewriteShelfItem(item) {
    if (!item || !item.files) return
    for (const fmt of Object.keys(item.files)) {
      const rel = item.files[fmt]
      if (!rel || typeof rel !== 'string' || /^https?:\/\//.test(rel)) continue
      const abs = path.resolve(relBase, rel)
      const href = toPublicHref(abs)
      if (href) item.files[fmt] = href
    }
  }

  function rewritePlay(play) {
    if (!play) return
    const list = Array.isArray(play) ? play : [play]
    for (const p of list) {
      if (!p || !p.href || /^https?:\/\//.test(p.href)) continue
      const abs = path.resolve(relBase, p.href)
      const href = toPublicHref(abs)
      if (href) p.href = href
    }
  }

  for (const day of Object.values(D.days)) {
    for (const c of day.classes || []) {
      if (!GROUPS.includes(c.classId)) continue
      const L = c.lesson || {}
      const shelves = c.shelves || {}
      for (const cat of ['worksheet', 'key', 'slides', 'notes', 'other', 'plan']) {
        for (const item of shelves[cat] || []) rewriteShelfItem(item)
      }
      rewritePlay(L.play || L.plays)
    }
  }
  console.log(`materials-src: ${copiedDirs.size} folders copied, ${filesRewritten} links rewritten, ${skippedCopyright} skipped (publisher copyright)`)
}

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

  syncMaterials(D, path.dirname(portalDataPath)); console.log(JSON.stringify(D.days['2026-09-30'].classes.find(c=>c.classId==='pet1').shelves.worksheet))

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_content (
      id TEXT PRIMARY KEY,
      group_slug TEXT NOT NULL,
      date TEXT NOT NULL,
      unit TEXT, unit_approx INTEGER NOT NULL DEFAULT 0,
      title TEXT, pages TEXT, grammar TEXT, vocab TEXT, warmer TEXT,
      plan TEXT, print_note TEXT, flag TEXT, note TEXT,
      booklet_digital_web TEXT,
      play_json TEXT NOT NULL DEFAULT 'null',
      arcade_json TEXT NOT NULL DEFAULT 'null',
      shelves_json TEXT NOT NULL DEFAULT 'null',
      unit_audio_json TEXT NOT NULL DEFAULT '[]',
      generated_at TEXT,
      UNIQUE(group_slug, date)
    );
  `)

  // Additive: column may not exist on a table created before 28 Sep 2026.
  await pool.query(`ALTER TABLE lesson_content ADD COLUMN IF NOT EXISTS booklet_digital_web TEXT;`)

  let upserted = 0, skipped = 0
  for (const [date, day] of Object.entries(D.days)) {
    for (const c of day.classes || []) {
      if (!GROUPS.includes(c.classId)) continue
      const L = c.lesson || {}
      if (!L.unit && !L.title && !c.shelves) { skipped++; continue }
      await pool.query(
        `INSERT INTO lesson_content
           (id, group_slug, date, unit, unit_approx, title, pages, grammar, vocab, warmer,
            plan, print_note, flag, note, play_json, arcade_json, shelves_json, unit_audio_json, generated_at,
            booklet_digital_web)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         ON CONFLICT (group_slug, date) DO UPDATE SET
           unit=EXCLUDED.unit, unit_approx=EXCLUDED.unit_approx, title=EXCLUDED.title,
           pages=EXCLUDED.pages, grammar=EXCLUDED.grammar, vocab=EXCLUDED.vocab, warmer=EXCLUDED.warmer,
           plan=EXCLUDED.plan, print_note=EXCLUDED.print_note, flag=EXCLUDED.flag, note=EXCLUDED.note,
           play_json=EXCLUDED.play_json, arcade_json=EXCLUDED.arcade_json, shelves_json=EXCLUDED.shelves_json,
           unit_audio_json=EXCLUDED.unit_audio_json, generated_at=EXCLUDED.generated_at,
           booklet_digital_web=EXCLUDED.booklet_digital_web`,
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
          L.bookletDigitalWeb || null,
        ]
      )
      upserted++
    }
  }
  console.log(`lesson_content: ${upserted} upserted, ${skipped} skipped (no content)`)
  await pool.end()
}

main().catch(err => { console.error(err); process.exit(1) })
