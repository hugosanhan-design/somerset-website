#!/usr/bin/env node
// Copies the CONTENT of the website's SPRINT, REPAIR and MATCH games into data/games/*.json.
// The website files are only read, never changed. Re-runnable: it overwrites the imported
// JSON (never story-time / who-did-it or any file without "source"), then rewrites
// data/games/index.ts so the registry picks up every game that is not a draft.
//
// Run: node scripts/games-import.mjs "/path/to/Somerset Website"
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const out = path.join(root, 'data/games')
const site = process.argv[2]
if (!site) { console.error('Usage: node scripts/games-import.mjs "<Somerset Website folder>"'); process.exit(1) }

// slug -> [tags, website engine]  (tags from the 15 Oct 2026 audit)
const GAMES = {
  'grammar-sprint': [['tense', 'agreement', 'preposition'], 'SPRINT'],
  'irregular-verb-dash': [['tense', 'spelling'], 'SPRINT'],
  'time-traveller': [['tense'], 'SPRINT'],
  'article-allotment': [['article'], 'SPRINT'],
  'if-only': [['tense'], 'SPRINT'],
  'reported-speech-relay': [['tense'], 'SPRINT'],
  'cognate-or-con': [['vocabulary'], 'SPRINT'],
  'future-forms-fair': [['tense'], 'SPRINT'],
  'in-on-at': [['preposition'], 'SPRINT'],
  'question-tag-tavern': [['other'], 'SPRINT'],
  'prefix-and-suffix-workshop': [['vocabulary', 'spelling'], 'SPRINT'],
  'because-so-or-although': [['other'], 'SPRINT'],
  'much-many-or-a-lot-of': [['agreement', 'vocabulary'], 'SPRINT'],
  'modal-meadow': [['other'], 'SPRINT'],
  'idiom-or-nonsense': [['vocabulary'], 'SPRINT'],
  'weather-idiom-almanac': [['vocabulary'], 'SPRINT'],
  'punctuation-repair': [['punctuation'], 'REPAIR'],
  'particle-post': [['preposition', 'vocabulary'], 'REPAIR'],
  'comma-cottage': [['punctuation'], 'REPAIR'],
  'apostrophe-ambush': [['punctuation', 'spelling'], 'REPAIR'],
  'naked-nouns': [['article'], 'REPAIR'],
  'capital-offences': [['punctuation'], 'REPAIR'],
  'linking-words-loom': [['other', 'register'], 'REPAIR'],
  'contraction-control': [['register', 'punctuation'], 'REPAIR'],
  'indirect-question-inn': [['word-order'], 'REPAIR'],
  'vocab-match': [['vocabulary'], 'MATCH'],
  'preposition-orchard': [['preposition'], 'MATCH'],
  'word-family-tree': [['vocabulary'], 'MATCH'],
  'false-friends-ambush': [['vocabulary'], 'MATCH'],
  'make-or-do': [['vocabulary'], 'MATCH'],
  'idiom-orchard': [['vocabulary'], 'MATCH'],
  'phrasal-verb-farm': [['vocabulary'], 'MATCH'],
  'same-verb-different-particle': [['vocabulary', 'preposition'], 'MATCH'],
  'strong-collocations': [['vocabulary'], 'MATCH'],
  'the-uncountable-larder': [['agreement', 'vocabulary'], 'MATCH'],
  'deduction-detective': [['other'], 'MATCH'],
  'ladder-of-nice': [['vocabulary', 'register'], 'MATCH'],
  'formal-essay-upgrade': [['register'], 'MATCH'],
  'dear-sir-or-hey-dude': [['register'], 'MATCH'],
  'email-etiquette': [['register'], 'MATCH'],
  'very-plus-adjective-killer': [['vocabulary'], 'MATCH'],
}
// Student-facing fixes applied on import (house rules: never "test", British spelling).
// The website files keep their original wording.
const FIXES = [
  ['He ___ his car since he passed his test.', 'He ___ his car since he got his licence.'],
  ['He passed the test ___ he barely studied.', 'He passed the exam ___ he barely studied.'],
  [/\brealize\b/g, 'realise'],
]
const fix = v => typeof v === 'string' ? FIXES.reduce((t, [a, b]) => t.replaceAll(a, b), v) : v
const MIN = 10   // below this a level cannot make a session; the game is imported as a draft

// Taken over by hand (15 Oct 2026): filled to 12 items a level with a "why" on every item.
// Re-imports leave these files alone; edit them directly in data/games/.
const SKIP = new Set([
  'apostrophe-ambush', 'capital-offences', 'cognate-or-con', 'comma-cottage', 'contraction-control',
  'indirect-question-inn', 'linking-words-loom', 'naked-nouns', 'particle-post', 'punctuation-repair',
  'dear-sir-or-hey-dude', 'deduction-detective', 'email-etiquette', 'false-friends-ambush', 'formal-essay-upgrade',
  'idiom-orchard', 'ladder-of-nice', 'make-or-do', 'phrasal-verb-farm', 'preposition-orchard',
  'same-verb-different-particle', 'strong-collocations', 'the-uncountable-larder', 'very-plus-adjective-killer',
  'vocab-match', 'word-family-tree',
  // The 15 quick-fire games, taken over the same way (15 Oct 2026).
  'article-allotment', 'because-so-or-although', 'future-forms-fair', 'grammar-sprint', 'idiom-or-nonsense',
  'if-only', 'in-on-at', 'irregular-verb-dash', 'modal-meadow', 'much-many-or-a-lot-of',
  'prefix-and-suffix-workshop', 'question-tag-tavern', 'reported-speech-relay', 'time-traveller', 'weather-idiom-almanac',
])

// Portal intros: one or two calm sentences that say what the student practises.
// (The website intros talk about clocks, scores and website-only features.)
const INTROS = {
  'grammar-sprint': 'A mixed round: tenses, verb forms and the small words around them. Pick the one that completes the sentence.',
  'irregular-verb-dash': 'Went, sought, forgotten: the past forms English expects you to know. Pick the right form for each sentence.',
  'time-traveller': 'Present perfect or past simple? The difference that catches out almost every Spanish speaker.',
  'article-allotment': 'A, an, the, or nothing at all. Pick the article each sentence really needs.',
  'if-only': 'Zero, first, second, third and mixed conditionals. Pick the verb form that makes the “if” sentence work.',
  'reported-speech-relay': '“I’m tired” becomes “she said she was tired”. Practise how verbs move back when you report what someone said.',
  'future-forms-fair': 'Will, going to, the present continuous or the present simple? Pick the future that fits the situation.',
  'in-on-at': 'At seven, on Monday, in May. Pick the preposition of time or place each sentence needs.',
  'question-tag-tavern': 'Isn’t it? Didn’t they? Pick the question tag that matches the sentence.',
  'prefix-and-suffix-workshop': 'Unclear, disagree, kindness. Pick the form of the word that fits the gap.',
  'because-so-or-although': 'Cause, result or contrast? Pick the linking word that fits what the sentence is doing.',
  'much-many-or-a-lot-of': 'Much, many or a lot of? It depends on whether you can count the thing. Pick the one that fits.',
  'modal-meadow': 'Must, have to, should, might. Pick the modal that says what the sentence means: obligation, advice or possibility.',
  'idiom-or-nonsense': 'Some of these are real English idioms and some are invented. Decide which is which.',
  'weather-idiom-almanac': 'A bolt from the blue, steal someone’s thunder, weather the storm. Pick the weather idiom that fits each situation.',
}

// slug -> website file, from the website's own regen script
const reg = fs.readFileSync(path.join(site, 'regen_site_html.py'), 'utf8')
const fileOf = Object.fromEntries([...reg.matchAll(/"([a-z0-9-]+)":\s*"(Game — [^"]+)"/g)].map(m => [m[1], m[2]]))

function grab(js, name) {
  const i = js.indexOf(`const ${name} =`)
  if (i < 0) return null
  let j = js.indexOf('=', i) + 1, d = 0, k = j
  for (; k < js.length; k++) { const c = js[k]; if (c === '{' || c === '[') d++; else if (c === '}' || c === ']') { d--; if (d === 0) { k++; break } } }
  return vm.runInNewContext('(' + js.slice(j, k) + ')')
}
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/<[^>]+>/g, '')
// The website intros talk about clocks and speed; the portal games have neither.
const calm = s => decode(s).split(/(?<=[.!?])\s+/).filter(x => !/second|minute|clock|sprint|race|fast|timer|beat/i.test(x)).join(' ').trim()

const report = []
for (const [slug, [tags, eng]] of Object.entries(GAMES)) {
  if (SKIP.has(slug)) { report.push(`= ${slug}: taken over by hand, skipped`); continue }
  const file = fileOf[slug]
  if (!file) { report.push(`✗ ${slug}: not in regen_site_html.py`); continue }
  const html = fs.readFileSync(path.join(site, file), 'utf8')
  const js = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || ''
  const C = grab(js, 'CONTENT')
  const title = decode((html.match(/<title>(.*?) — /) || [])[1] || slug)
  const intro = INTROS[slug] || calm((html.match(/class="lead">([\s\S]*?)<\/p>/) || [])[1] || '') || title
  const prefix = slug
  const items = {}
  for (const [lv, list] of Object.entries(C)) {
    items[lv] = list.map((it, n) => {
      const id = `${prefix}-${lv.toLowerCase()}-${String(n + 1).padStart(2, '0')}`
      if (eng === 'MATCH') return { id, left: fix(it.w), right: fix(it.m) }
      return { id, q: fix(it.s), options: [it.a, ...it.w].map(fix), answer: 0 }
    })
  }
  const short = Object.entries(items).filter(([, l]) => l.length < MIN).map(([lv, l]) => `${lv}:${l.length}`)
  const game = { id: slug, title, tags, engine: eng === 'MATCH' ? 'pairs' : 'choice', intro, source: file, ...(short.length ? { draft: true } : {}), items }
  fs.writeFileSync(path.join(out, slug + '.json'), JSON.stringify(game, null, 2) + '\n')
  report.push(`${short.length ? '·' : '✓'} ${slug} [${game.engine}] ${Object.entries(items).map(([l, v]) => `${l}:${v.length}`).join(' ')}${short.length ? '  DRAFT (fewer than ' + MIN + ')' : ''}`)
}

// Registry index: ready games, plus drafts (only reachable with ?preview=1, for review).
const all = fs.readdirSync(out).filter(f => f.endsWith('.json')).sort()
const isDraft = f => !!JSON.parse(fs.readFileSync(path.join(out, f), 'utf8')).draft
const ready = all.filter(f => !isDraft(f)), drafts = all.filter(isDraft)
const ident = f => f.replace('.json', '').replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/^(\d)/, '_$1')
fs.writeFileSync(path.join(out, 'index.ts'),
  `// GENERATED by scripts/games-import.mjs. Do not edit by hand.\n` +
  all.map(f => `import ${ident(f)} from './${f}'`).join('\n') +
  `\n\n// Ready: playable by students.\nexport const GAME_FILES = [${ready.map(ident).join(', ')}]\n` +
  `// Drafts: a level has fewer than 10 items. Only opened with ?preview=1.\nexport const DRAFT_FILES = [${drafts.map(ident).join(', ')}]\n`)

console.log(report.join('\n'))
console.log(`\n${Object.keys(GAMES).length} imported · ${ready.length} games in the registry (index.ts)`)
