#!/usr/bin/env node
// Checks every data/games/*.json against the game contract.
// Run: node scripts/games-validate.mjs   (exits 1 if anything fails)
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const dir = path.join(root, 'data/games')
const tagSrc = fs.readFileSync(path.join(root, 'data/errorTags.ts'), 'utf8')
const TAGS = [...tagSrc.matchAll(/key:\s*'([a-z-]+)'/g)].map(m => m[1])
const LEVELS = ['A2', 'B1', 'B2', 'C1']
const MIN_ITEMS = 10      // a session needs at least this many
const FULL_ITEMS = 12     // the "Got 3 minutes?" target
const ENGINES = { choice: ['q', 'options', 'answer'], pairs: ['left', 'right'] }
// Student-facing text: British spelling, no emojis, never the word "test".
const US = /\b\w+(?:ize|izes|ized|izing|ization|izations)\b|\b(?:color|colors|favorite|center|centers|behavior|neighbor|honor|labor|traveled|traveling|gray|mom|analyze|catalog)\b/gi
const US_OK = /^(size|sizes|sized|prize|prizes|seize|seized|capsize)$/i
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2194}-\u{21FF}]/u

let failed = 0, warned = 0
const ids = new Set()
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()
for (const f of files) {
  const errs = [], warns = []
  let g
  try { g = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) } catch (e) { console.log(`✗ ${f}: not valid JSON (${e.message})`); failed++; continue }
  if (g.id + '.json' !== f) errs.push(`id "${g.id}" does not match the file name`)
  for (const k of ['id', 'title', 'tags', 'engine', 'intro', 'items']) if (g[k] == null) errs.push(`missing "${k}"`)
  if (!ENGINES[g.engine]) errs.push(`unknown engine "${g.engine}"`)
  if (!Array.isArray(g.tags) || !g.tags.length) errs.push('no tags')
  for (const t of g.tags || []) if (!TAGS.includes(t)) errs.push(`tag "${t}" is not one of the 10`)
  const levels = Object.keys(g.items || {})
  if (!levels.length) errs.push('no levels')
  let missingWhy = 0
  for (const lv of levels) {
    if (!LEVELS.includes(lv)) errs.push(`unknown level ${lv}`)
    const list = g.items[lv]
    if (!Array.isArray(list)) { errs.push(`${lv} is not a list`); continue }
    if (list.length < MIN_ITEMS) (g.draft ? warns : errs).push(`${lv}: ${list.length} items, needs at least ${MIN_ITEMS}${g.draft ? ' (draft: kept out of the portal)' : ''}`)
    else if (list.length < FULL_ITEMS) warns.push(`${lv}: ${list.length} items, so sessions are ${list.length} long (target ${FULL_ITEMS})`)
    const seen = new Set()
    for (const it of list) {
      if (!it.id) { errs.push(`${lv}: item without id`); continue }
      if (ids.has(it.id)) errs.push(`duplicate item id ${it.id}`)
      ids.add(it.id)
      for (const k of ENGINES[g.engine] || []) if (it[k] == null) errs.push(`${it.id}: missing "${k}"`)
      const key = g.engine === 'pairs' ? it.left : it.q + '|' + (it.options || []).join('|')
      if (seen.has(key)) errs.push(`${it.id}: duplicate of another item`)
      seen.add(key)
      if (g.engine === 'choice' && Array.isArray(it.options)) {
        if (it.options.length < 2) errs.push(`${it.id}: fewer than 2 options`)
        if (!(it.answer >= 0 && it.answer < it.options.length)) errs.push(`${it.id}: answer index out of range`)
        if (new Set(it.options).size !== it.options.length) errs.push(`${it.id}: the same option appears twice`)
      }
      if (!it.why) missingWhy++
    }
    if (g.engine === 'pairs') {
      const rights = list.map(i => i.right)
      if (new Set(rights).size !== rights.length) errs.push(`${lv}: two pairs share the same right-hand card`)
    }
  }
  if (missingWhy) warns.push(`${missingWhy} item(s) have no "why" yet (the game shows only the right answer)`)
  const text = JSON.stringify([g.title, g.intro, g.items])
  const us = [...new Set((text.match(US) || []).filter(w => !US_OK.test(w)))]
  if (us.length) errs.push(`American spelling: ${us.join(', ')}`)
  if (EMOJI.test(text)) errs.push('contains an emoji')
  if (/\btests?\b/i.test(text)) errs.push('uses the word "test"')
  if (errs.length) { failed++; console.log(`✗ ${f}\n   - ${errs.join('\n   - ')}`) }
  else console.log(`${g.draft ? '·' : '✓'} ${f}  [${g.engine}] ${(g.tags || []).join(', ')} · ${levels.map(l => `${l}:${g.items[l].length}`).join(' ')}`)
  if (warns.length) { warned++; console.log(`   ! ${warns.join('\n   ! ')}`) }
}
console.log(`\n${files.length} games · ${files.length - failed} pass · ${failed} fail · ${warned} with warnings`)
process.exit(failed ? 1 : 0)
