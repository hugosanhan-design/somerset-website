// Uploads the actual lesson material files (worksheets, teacher keys, slides,
// audio, photos) referenced in the local Somerset Portal's portal-data.js
// (each day's `classes[].shelves`) to Vercel Blob storage, then upserts
// lesson_content rows carrying blob URLs instead of local file:// paths.
//
// This supersedes the group-restricted scope of migrate-lesson-content.mjs
// (which only covered fce1/pet1): it walks every group and date that has
// real shelf content in portal-data.js, since that's exactly the set the
// local Portal itself would show as "ready" — nothing more, nothing less.
//
// Idempotent: each file is uploaded to a stable pathname
// (materials/<groupSlug>/<date>/<filename>) with addRandomSuffix:false and
// allowOverwrite:true, so re-running after new material is built only
// re-uploads what changed and never creates duplicate blobs.
//
// Usage: node migrate-materials.mjs <path to portal-data.js> <path to Somerset Worksheets root>
import { put } from '@vercel/blob'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const CONTENT_TYPES = {
  '.pdf': 'application/pdf',
  '.html': 'text/html',
  '.mp3': 'audio/mpeg',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

async function uploadOne(localAbsPath, groupSlug, date) {
  const filename = path.basename(localAbsPath)
  const ext = path.extname(filename).toLowerCase()
  const buf = fs.readFileSync(localAbsPath)
  const blob = await put(`materials/${groupSlug}/${date}/${filename}`, buf, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: CONTENT_TYPES[ext] || 'application/octet-stream',
  })
  return blob.url
}

// Walks one shelf item's `files` map (e.g. {html, pdf}) and returns the same
// shape with local paths replaced by blob URLs. Missing files on disk are
// skipped (logged), not fatal — a stale portal-data.js reference shouldn't
// stop everything else from uploading.
async function uploadShelfItem(item, groupSlug, date, worksheetsRoot, portalDir, stats) {
  const newFiles = {}
  for (const [kind, relPath] of Object.entries(item.files || {})) {
    const absPath = path.resolve(portalDir, relPath)
    if (!fs.existsSync(absPath)) {
      console.warn(`  missing on disk, skipping: ${relPath}`)
      stats.missing++
      continue
    }
    newFiles[kind] = await uploadOne(absPath, groupSlug, date)
    stats.uploaded++
  }
  return { ...item, files: newFiles }
}

async function main() {
  const portalDataPath = process.argv[2]
  const worksheetsRoot = process.argv[3]
  if (!portalDataPath || !worksheetsRoot) {
    console.error('Usage: node migrate-materials.mjs <path to portal-data.js> <path to Somerset Worksheets root>')
    process.exit(1)
  }
  const portalDir = path.dirname(portalDataPath)
  const raw = fs.readFileSync(portalDataPath, 'utf-8')
  const jsonText = raw.split('window.PORTAL_DATA = ')[1].split(/;\s*$/)[0]
  const D = JSON.parse(jsonText)

  const stats = { uploaded: 0, missing: 0, daysProcessed: 0, daysSkipped: 0 }

  for (const [date, day] of Object.entries(D.days)) {
    for (const c of day.classes || []) {
      if (!c.shelves) continue
      const hasAnyFiles = Object.values(c.shelves).some(arr => Array.isArray(arr) && arr.length > 0)
      if (!hasAnyFiles) { stats.daysSkipped++; continue }

      console.log(`${date} / ${c.classId}`)
      const newShelves = {}
      for (const [shelfName, items] of Object.entries(c.shelves)) {
        if (!Array.isArray(items)) { newShelves[shelfName] = items; continue }
        newShelves[shelfName] = []
        for (const item of items) {
          newShelves[shelfName].push(await uploadShelfItem(item, c.classId, date, worksheetsRoot, portalDir, stats))
        }
      }

      await pool.query(
        `INSERT INTO lesson_content (id, group_slug, date, shelves_json)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (group_slug, date) DO UPDATE SET shelves_json = EXCLUDED.shelves_json`,
        [newId(), c.classId, date, JSON.stringify(newShelves)]
      )
      stats.daysProcessed++
    }
  }

  console.log(`\nDone: ${stats.daysProcessed} day/group entries updated, ${stats.daysSkipped} skipped (no files), ${stats.uploaded} files uploaded, ${stats.missing} referenced files missing on disk`)
  await pool.end()
}

main().catch(err => { console.error(err); process.exit(1) })
