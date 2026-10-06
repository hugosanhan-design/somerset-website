---
name: reference_somerset_app_sync_deploy_runbook
description: Exact command sequence to sync lesson content + materials from Somerset Worksheets into the Somerset App (Postgres + Vercel Blob) and deploy — plus the fix history behind why each step exists. Read before touching migrate-*.mjs, deploy.sh, or if the sync ever needs to be repeated/rebuilt from scratch.
sources: [cowork]
---

## What this pipeline does

Somerset Worksheets (`_apps/somerset-portal/build.mjs`) reads the raw
lesson data (`lessons.<group>.json`, the audio page-maps, `data/timetable.json`,
`data/calendar.json`) and produces `portal-data.js` — a single JS file with
everything: every class day, its unit/pages/plan/grammar/vocab, which shelf
files exist, which plays and Arcade games apply, which book-audio tracks.

The Somerset App (Next.js on Vercel, Postgres via Neon, files on Vercel Blob)
has no idea any of that exists until two scripts push it across:

- `scripts/migrate-lesson-content.mjs` — reads `portal-data.js`, upserts one
  row per day/group into the `lesson_content` Postgres table (unit, pages,
  plan, grammar, vocab, play_json, arcade_json, shelves_json, unit_audio_json).
- `scripts/migrate-materials.mjs` — walks the same data, uploads every actual
  file it finds on disk (worksheets, keys, slides, plays, audio) to Vercel
  Blob, and rewrites the URLs it just wrote into Postgres to point at Blob
  instead of local paths.

Then `./deploy.sh` ships the app itself (code, not data) to Vercel.

**All three steps are independent and safe to re-run.** Content changes
(edit a `lessons.*.json`, add a new day) only need the two migrate scripts.
Code changes (a dashboard fix, a new API route) only need `deploy.sh`. A full
resync needs all three, in this order.

## The exact commands (run from Hugo's Terminal, never from a Claude sandbox)

```
cd "/Users/hugos/Documents/Claude/Projects/Somerset Project/Somerset App/app"
node scripts/migrate-lesson-content.mjs "../../Somerset Worksheets/_apps/somerset-portal/portal-data.js"
node scripts/migrate-materials.mjs "../../Somerset Worksheets/_apps/somerset-portal/portal-data.js" "../../Somerset Worksheets"
./deploy.sh
```

If `portal-data.js` is stale (a `lessons.*.json` or an audio page-map
changed), rebuild it first from the Worksheets side:

```
cd "/Users/hugos/Documents/Claude/Projects/Somerset Worksheets/_apps/somerset-portal"
node build.mjs
```

**Why this must run in Hugo's real Terminal, not a Claude cloud sandbox or
the device-bridge shell:** both are network-sandboxed and cannot reach Neon
Postgres or Vercel Blob (raw TCP, not HTTP — the same restriction that blocks
SSH and DB clients from any sandboxed shell). Claude can write and test the
scripts and read back whatever Hugo pastes, but cannot run the actual sync.

## Fix history — why each piece of this exists (27 Sep 2026)

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | `ECONNREFUSED ::1:5432` / `BlobError: No token found` running the migrate scripts | Next.js auto-loads `.env.local`; plain `node scripts/*.mjs` does not | `process.loadEnvFile(new URL('../.env.local', import.meta.url))` (try/catch) added to the top of both migrate scripts |
| 2 | Dashboard showed every book-audio track for the whole unit on every lesson | No page-level data existed yet — the real mapping is printed on the book page as "N.M ▶" next to the exercise, nobody had extracted it | `data/pet1-audio-page-map.json` + `data/fce1-audio-page-map.json` (units 1–6, both books) built by reading the actual Student's Book pages; `build.mjs` filters `unitAudio` by the lesson's `pages` field. See [[reference_audio_page_scoping]] |
| 3 | Point Grab / Arcade and review-play links 404'd on the live app | Linked by local `file://` path from Hugo's Mac | Somerset Arcade copied into `public/arcade/`; `migrate-materials.mjs` uploads play HTML to Blob like any other material. See [[reference_arcade_and_plays_web_hosting]] |
| 4 | `BlobError: Your store is blocked` mid-sync | Vercel Blob Hobby plan hard-caps at 2,000 "Advanced Operations"/month (each upload = 1); one full sync did 1,475 | Hugo upgraded to Vercel Pro (no hard cap, usage-based). Mitigated going forward with a persistent SHA-256 hash cache (`.migrate-blob-cache.json`, gitignored) in `migrate-materials.mjs` so an unchanged file is skipped on the next sync |
| 5 | Clicking Slides or a review play offered "Save As" instead of opening | Vercel Blob always serves a stored file with `Content-Disposition: attachment` when it can't guarantee the content is safe to render on its own origin — no `put()` option overrides this. Audio/images/PDF still open fine; slides/plays are interactive HTML | New route `app/api/materials/view/route.ts` fetches the blob server-side and re-serves it with `Content-Disposition: inline`; dashboard sends any `.html` Blob link through it (`viewUrl()` in `app/(portal)/dashboard/page.tsx`) |

## Known open items (not blocking, deliberately deferred)

- **Multi-teacher / shared-curriculum architecture** — Hugo's longer-term goal
  (other teachers download the app, get his method + materials pre-built).
  Full plan written up in the claude.ai Project doc
  `portal/MULTI_TEACHER_ARCHITECTURE_PLAN.md`. Explicitly not started —
  Hugo's call: solo use this year, revisit if it's working.
- **Somerset App repo has no tracking remote** — `git pull` fails with "no
  tracking information for the current branch" on `main`. Doesn't block
  `deploy.sh` (it deploys the working tree, not git), but there's no
  off-machine backup of history. Not yet fixed.
- **Audio page-mapping only covers PET I/FCE I/Friday B2, units 1–6.** Any
  other group/unit falls back to showing the whole unit's audio (not
  silently wrong, just unfiltered) until the same page-by-page extraction is
  done for it.
