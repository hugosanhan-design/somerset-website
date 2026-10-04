// Uploads the actual lesson material files (worksheets, teacher keys, slides,
// class audio, photos, per-unit book audio tracks, AND review plays) referenced
// in the local Somerset Portal's portal-data.js to Vercel Blob storage, then
// upserts lesson_content rows carrying blob URLs instead of local file:// paths.
//
// Three sources of files, all handled here:
// - `classes[].shelves` — per-lesson materials (worksheet/key/slides/audio/other),
//   each item has a `files` map of {kind: relPath}.
// - `classes[].unitAudio` (and `.audio`) — per-unit BOOK audio tracks (Track 1.0,
//   1.1, ...), each item has a single `path`. The same track is shared across
//   every lesson date in that unit, so uploads are deduped in-memory by source
//   path within one run — re-uploading the same book track 15 times would be
//   wasteful and pointless.
// - `classes[].lesson.play` / `.plays` — the review play HTML file(s) for that
//   date's unit (added 27 Sep 2026, alongside the Arcade fix — see
//   reference_arcade_and_plays_web_hosting.md). Same dedup-by-source-path
//   caching as book audio, since one unit's play is referenced by every lesson
//   date in that unit.
//
// This supersedes the group-restricted scope of migrate-lesson-content.mjs
// (which only covered fce1/pet1): it walks every group and date that has
// real content in portal-data.js, since that's exactly the set the local
// Portal itself would show as "ready" — nothing more, nothing less.
//
// Idempotent: each file is uploaded to a stable pathname with
// addRandomSuffix:false and allowOverwrite:true, so re-running after new
// material is built only re-uploads what changed and never creates
// duplicate blobs.
//
// Usage: node migrate-materials.mjs <path to portal-data.js> <path to Somerset Worksheets root>
import { put } from '@vercel/blob'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

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

// In-memory cache: absolute local path -> blob URL, so a book audio track
// referenced by 15 different lesson dates is only uploaded once per run.
const uploadCache = new Map()

// Persistent, cross-run cache: blob pathname -> {hash, url}, so re-running
// this script after a small content change (one new lesson, one edited
// worksheet) doesn't re-upload all 540 unique files every time. Each put()
// with allowOverwrite:true counts as a Vercel Blob "Advanced Operation" (27
// Sep 2026: 1475 uploads in one run alone tripped the Hobby plan's 2,000/month
// cap and blocked the store — see reference in
// Claude/memory/reference_vercel_blob_token_fix.md's sibling notes). Skipping
// unchanged files keeps that number close to zero on every run after the
// first. Not committed to git (see .gitignore) — it's local run state, not
// source, and losing it just means the next run re-uploads everything once.
const CACHE_PATH = new URL('../.migrate-blob-cache.json', import.meta.url)
let diskCache = {}
try {
  diskCache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
} catch {}
let cacheDirty = false
let skippedUnchanged = 0

async function uploadOne(localAbsPath, blobPathname) {
  if (uploadCache.has(localAbsPath)) return uploadCache.get(localAbsPath)
  const buf = fs.readFileSync(localAbsPath)
  const hash = crypto.createHash('sha256').update(buf).digest('hex')
  const cached = diskCache[blobPathname]
  if (cached && cached.hash === hash) {
    uploadCache.set(localAbsPath, cached.url)
    skippedUnchanged++
    return cached.url
  }
  const ext = path.extname(localAbsPath).toLowerCase()
  const blob = await put(blobPathname, buf, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: CONTENT_TYPES[ext] || 'application/octet-stream',
  })
  diskCache[blobPathname] = { hash, url: blob.url }
  cacheDirty = true
  uploadCache.set(localAbsPath, blob.url)
  return blob.url
}

// Walks one shelf item's `files` map (e.g. {html, pdf}) and returns the same
// shape with local paths replaced by blob URLs. Missing files on disk are
// skipped (logged), not fatal — a stale portal-data.js reference shouldn't
// stop everything else from uploading.
async function uploadShelfItem(item, groupSlug, date, portalDir, stats) {
  const newFiles = {}
  for (const [kind, relPath] of Object.entries(item.files || {})) {
    const absPath = path.resolve(portalDir, relPath)
    if (!fs.existsSync(absPath)) {
      console.warn(`  missing on disk, skipping: ${relPath}`)
      stats.missing++
      continue
    }
    const filename = path.basename(absPath)
    newFiles[kind] = await uploadOne(absPath, `materials/${groupSlug}/${date}/${filename}`)
    stats.uploaded++
  }
  return { ...item, files: newFiles }
}

// Walks a book-audio array (unitAudio or audio), each {label, track, path}.
// Uploaded under materials/<groupSlug>/book-audio/<filename> (no date — the
// same track belongs to every lesson in its unit, not one specific day).
async function uploadAudioTracks(tracks, groupSlug, portalDir, stats) {
  const out = []
  for (const t of tracks || []) {
    if (!t.path) { out.push(t); continue }
    const absPath = path.resolve(portalDir, t.path)
    if (!fs.existsSync(absPath)) {
      console.warn(`  missing on disk, skipping: ${t.path}`)
      stats.missing++
      out.push(t)
      continue
    }
    const filename = path.basename(absPath)
    const url = await uploadOne(absPath, `materials/${groupSlug}/book-audio/${filename}`)
    stats.uploaded++
    out.push({ ...t, path: url })
  }
  return out
}

// Walks one lesson's play reference — a single {label, href} or an array of
// them (Friday B2 / PET I can have several plays per unit). `href` is a
// portalDir-relative local path, same convention as shelf items' `files`.
async function uploadPlayRef(playRef, groupSlug, portalDir, stats) {
  if (!playRef) return playRef
  const uploadOnePlay = async (p) => {
    if (!p.href) return p
    const absPath = path.resolve(portalDir, p.href)
    if (!fs.existsSync(absPath)) {
      console.warn(`  missing on disk, skipping play: ${p.href}`)
      stats.missing++
      return p
    }
    const filename = path.basename(absPath)
    const url = await uploadOne(absPath, `materials/${groupSlug}/plays/${filename}`)
    stats.uploaded++
    return { ...p, href: url }
  }
  return Array.isArray(playRef) ? Promise.all(playRef.map(uploadOnePlay)) : uploadOnePlay(playRef)
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
      const hasShelfFiles = c.shelves && Object.values(c.shelves).some(arr => Array.isArray(arr) && arr.length > 0)
      const hasUnitAudio = Array.isArray(c.unitAudio) && c.unitAudio.length > 0
      const hasAudio = Array.isArray(c.audio) && c.audio.length > 0
      const playRef = c.lesson?.play || c.lesson?.plays || null
      const hasPlay = !!playRef
      const hasSlides = !!(c.lesson?.slides || c.lesson?.deckWeb)
      if (!hasShelfFiles && !hasUnitAudio && !hasAudio && !hasPlay && !hasSlides) { stats.daysSkipped++; continue }

      console.log(`${date} / ${c.classId}`)

      let newShelves
      if (c.shelves) {
        newShelves = {}
        for (const [shelfName, items] of Object.entries(c.shelves)) {
          if (!Array.isArray(items)) { newShelves[shelfName] = items; continue }
          newShelves[shelfName] = []
          for (const item of items) {
            newShelves[shelfName].push(await uploadShelfItem(item, c.classId, date, portalDir, stats))
          }
        }
      }

      // Lesson-level slides (Flyers): the lesson's slide PDF (uploaded like any file), the interactive deck and the
      // click-to-reveal answers page (both already live under public/flyers/, so they are plain web paths, not uploads).
      // Without this the dashboard's "Slides" section stayed empty for Flyers (30 Sep 2026). Rebuilt on every run, deduped by stem.
      if (hasSlides) {
        const L = c.lesson
        newShelves = newShelves || {}
        const keep = (newShelves.slides || []).filter(it => !/^L\d+-/.test(it.stem || ''))
        const extra = []
        if (L.deckWeb) extra.push({ stem: `L${L.n}-deck`, role: 'slides', label: `Lesson ${L.n} slides · interactive`, files: { open: L.deckWeb } })
        if (L.slides) extra.push(await uploadShelfItem({ stem: `L${L.n}-slides-pdf`, role: 'slides', label: `Lesson ${L.n} slides (PDF)`, files: { pdf: L.slides } }, c.classId, date, portalDir, stats))
        if (L.correctTogetherWeb) extra.push({ stem: `L${L.n}-correct`, role: 'slides', label: `Lesson ${L.n} · correct together (answers)`, files: { open: L.correctTogetherWeb } })
        newShelves.slides = extra.concat(keep)
      }

      const newUnitAudio = hasUnitAudio ? await uploadAudioTracks(c.unitAudio, c.classId, portalDir, stats) : undefined
      const newAudio = hasAudio ? await uploadAudioTracks(c.audio, c.classId, portalDir, stats) : undefined
      const newPlay = hasPlay ? await uploadPlayRef(playRef, c.classId, portalDir, stats) : undefined

      // Build the upsert dynamically so we never clobber shelves_json with
      // null when this pass only touched unitAudio (or vice versa) — read
      // the existing row's other JSON columns first, only overwrite what
      // this run actually produced.
      const { rows: existingRows } = await pool.query(
        'SELECT shelves_json, unit_audio_json, play_json FROM lesson_content WHERE group_slug = $1 AND date = $2',
        [c.classId, date]
      )
      const existing = existingRows[0]
      const shelvesToStore = newShelves ? JSON.stringify(newShelves) : (existing?.shelves_json ?? 'null')
      const unitAudioToStore = newUnitAudio ? JSON.stringify(newUnitAudio.concat(newAudio || []))
        : newAudio ? JSON.stringify(newAudio)
        : (existing?.unit_audio_json ?? '[]')
      const playToStore = newPlay !== undefined ? JSON.stringify(newPlay) : (existing?.play_json ?? 'null')

      await pool.query(
        `INSERT INTO lesson_content (id, group_slug, date, shelves_json, unit_audio_json, play_json)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (group_slug, date) DO UPDATE SET shelves_json = EXCLUDED.shelves_json, unit_audio_json = EXCLUDED.unit_audio_json, play_json = EXCLUDED.play_json`,
        [newId(), c.classId, date, shelvesToStore, unitAudioToStore, playToStore]
      )
      stats.daysProcessed++
    }
  }

  console.log(`\nDone: ${stats.daysProcessed} day/group entries updated, ${stats.daysSkipped} skipped (no files), ${stats.uploaded} files uploaded (${uploadCache.size} unique), ${stats.missing} referenced files missing on disk, ${skippedUnchanged} unchanged (skipped)`)

  if (cacheDirty) {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(diskCache, null, 1))
  }
  await pool.end()
}

main().catch(err => { console.error(err); process.exit(1) })
