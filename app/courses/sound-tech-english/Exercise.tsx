'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { SomersetIcon, type IconName } from '@/components/SomersetIcon'
import { recordAnswer, addMistake, type Progress } from '@/lib/courses/progress'
import type { Activity, Exercise, Item } from '@/lib/courses/soundTech'
import { Deck, type DeckItem } from '../_kit'

// Instant feedback: every answer is judged the moment it is given.
//  - Right first time: the item opens to the full width with the word in green (celebration).
//  - Wrong: only that option turns red; try again.
//  - Right after a miss: goes green quietly, and the word is stored to revise.
type St = { wrong: string[]; done: boolean; first: boolean }

export const norm = (s: string) => s.toLowerCase().replace(/[.,;:!?"']+$/g, '').replace(/\s+/g, ' ').trim()
const COLOURS = ['#6a4fb3', '#d2573f', '#2b8a9e', '#c9871a', '#3d8b3d', '#b0457a', '#4a6fa5', '#8a7a2e']

// Read a word or phrase aloud in British English (browser voice).
function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-GB'; u.rate = 0.85
    const v = speechSynthesis.getVoices().find(x => x.lang === 'en-GB')
    if (v) u.voice = v
    speechSynthesis.cancel(); speechSynthesis.speak(u)
  } catch { /* no speech support: silent */ }
}
const ICON_FOR: Record<string, IconName> = { 'True': 'correct', 'False': 'wrong', 'Not said': 'confused' }

export function Listen({ text, label }: { text: string; label?: string }) {
  return (
    <span role="button" tabIndex={0} className="oc-listen" aria-label={label ?? `Listen: ${text}`}
      onClick={e => { e.stopPropagation(); speak(text) }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); speak(text) } }}>▶</span>
  )
}

export function isRight(item: Item, a: string | undefined): boolean {
  if (a === undefined || a === '') return false
  if (item.kind === 'gap') return item.answers.map(norm).includes(norm(a))
  return Number(a) === item.answer
}

export default function ExerciseCard({ act, ex, progress, update, head }: {
  act: Activity; ex: Exercise; progress: Progress; update: (fn: (p: Progress) => Progress) => void; head: ReactNode
}) {
  const key = `${act.id}.${ex.id}`
  const saved = progress.lessons[key]
  const [st, setSt] = useState<Record<string, St>>({})
  const [shake, setShake] = useState<string | null>(null)
  const [result, setResult] = useState<{ firsts: number; total: number } | null>(null)
  const [practice, setPractice] = useState(false)
  const [showEs, setShowEs] = useState(false)
  const recording = !saved && !practice
  const total = ex.items.length
  const doneCount = ex.items.filter(i => st[i.id]?.done).length
  const firstCount = ex.items.filter(i => st[i.id]?.first).length
  const allDone = doneCount === total

  function attempt(it: Item, val: string) {
    const cur = st[it.id] ?? { wrong: [], done: false, first: false }
    if (cur.done || val === '') return
    const ok = isRight(it, val)
    if (!ok && cur.wrong.includes(norm(val))) return
    const firstTry = cur.wrong.length === 0
    const next: St = ok
      ? { wrong: cur.wrong, done: true, first: firstTry }
      : { wrong: [...cur.wrong, norm(val)], done: false, first: false }
    const all = { ...st, [it.id]: next }
    setSt(all)
    if (!ok) { setShake(it.id); setTimeout(() => setShake(null), 450) }
    if (recording && firstTry) update(p => recordAnswer(p, `${key}.${it.id}`.slice(0, 60), ok))
    // Keep what the student actually chose, so "Improve my mistakes" and the teacher can see it.
    if (recording && !ok) {
      const pick = it.kind === 'gap' ? val : it.kind === 'choice' ? (it.options[Number(val)] ?? val) : (ex.options?.[Number(val)] ?? val)
      update(p => addMistake(p, `${key}.${it.id}`, pick))
    }
    if (ok && recording && ex.items.every(i => all[i.id]?.done)) {
      const firsts = ex.items.filter(i => all[i.id].first).length
      update(p => ({ ...p, lessons: { ...p.lessons, [key]: { score: Math.round((firsts / total) * 100), at: Date.now() } } }))
    }
  }

  const isMatch = ex.items.every(it => it.kind === 'match') && (ex.options ?? []).length > 0

  // Everything that is not a match board runs as a one-at-a-time Deck (12 Oct 2026):
  // one big sentence, option cards, instant feedback. Bank words become tappable cards.
  const deckItems: DeckItem[] = ex.items.flatMap((it, n): DeckItem[] => {
    const gloss = ex.gloss?.[n]
    if (it.kind === 'match') return []
    if (it.kind === 'gap') return [{ ...it, gloss, bank: ex.bank }]
    return [{ ...it, gloss, icons: it.options.map(o => (ICON_FOR[o] ? <SomersetIcon key={o} name={ICON_FOR[o]} size={34} /> : undefined)) }]
  })
  function deckAnswer(it: DeckItem, ok: boolean, firstTry: boolean, chosen: string) {
    if (recording && firstTry) update(p => recordAnswer(p, `${key}.${it.id}`.slice(0, 60), ok))
    if (recording && !ok) {
      const pick = it.kind === 'choice' ? (it.options[Number(chosen)] ?? chosen) : chosen
      update(p => addMistake(p, `${key}.${it.id}`, pick))
    }
  }
  function deckDone(firsts: number, n: number) {
    setResult({ firsts, total: n })
    if (recording) update(p => ({ ...p, lessons: { ...p.lessons, [key]: { score: Math.round((firsts / n) * 100), at: Date.now() } } }))
  }

  return (
    <section className="card" data-tour="exercise">
      {head}
      {isMatch ? (
        <>
          {ex.gloss && (
            <label className="oc-switch">
              <input type="checkbox" checked={showEs} onChange={e => setShowEs(e.target.checked)} />
              <span className="oc-track" aria-hidden />
              <span>Mostrar español</span>
            </label>
          )}
          <p className="match-count">{doneCount} / {total} done{firstCount ? ` · ${firstCount} first time` : ''}</p>
          <MatchBoard ex={ex} st={st} attempt={attempt} shake={shake} showEs={showEs} />
          <div className="row">
            {allDone && <strong className="score-pill">{firstCount} / {total} first time</strong>}
            {allDone && saved && <span className="saved-note">Saved · {saved.score}%</span>}
            {allDone && <button className="btn btn--ghost" onClick={() => { setSt({}); setPractice(true) }}>↻ Practise again</button>}
          </div>
          {allDone && <div className="tip-box"><strong>En español</strong><p>{ex.es}</p></div>}
        </>
      ) : (
        <>
          <Deck items={deckItems} glossLabel="Mostrar español" listen={speak}
            onAnswer={deckAnswer} onDone={deckDone} onRestart={() => setPractice(true)}
            endTitle={`${ex.title} — done`} endSub={saved ? `Saved · ${saved.score}%` : undefined} />
          {result && <div className="tip-box"><strong>En español</strong><p>{ex.es}</p></div>}
        </>
      )}
    </section>
  )
}

// Seeded shuffle (stable between renders, new order after each match) that keeps a meaning
// out of the row of the word it belongs to. `avoid[k]` is the meaning that must not land in slot k.
function shuffleAvoid(defs: number[], avoid: (number | undefined)[], seed: string): number[] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  const rnd = () => {
    h = (h + 0x6D2B79F5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  let last = defs
  for (let attempt = 0; attempt < 80; attempt++) {
    const a = [...defs]
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
    if (a.every((d, k) => avoid[k] !== d)) return a
    last = a
  }
  return last
}

// Tap a word, then its meaning. A right pair turns green at once; 0.75 s later the meaning
// slides up to the word's row and snaps into place like a magnet. A wrong one turns red.
function MatchBoard({ ex, st, attempt, shake, showEs }: {
  ex: Exercise; st: Record<string, St>; attempt: (it: Item, val: string) => void; shake: string | null; showEs: boolean
}) {
  const options = ex.options ?? []
  const [cur, setCur] = useState<string | null>(ex.items[0]?.id ?? null)
  const [settled, setSettled] = useState<string[]>([])
  const defRefs = useRef<Record<number, HTMLButtonElement | null>>({})
  const lastPos = useRef<Record<number, number>>({})
  const lastSettled = useRef(0)
  const curItem = ex.items.find(it => it.id === cur)
  const owner = (d: number) => ex.items.findIndex(it => st[it.id]?.done && it.kind === 'match' && it.answer === d)

  // Matched pairs wait 0.75 s (the green moment), then the meaning moves to its word.
  useEffect(() => {
    const anyDone = ex.items.some(it => st[it.id]?.done)
    if (!anyDone) {
      if (settled.length) setSettled([])
      if (cur === null) setCur(ex.items[0]?.id ?? null)
      return
    }
    const pending = ex.items.filter(it => st[it.id]?.done && !settled.includes(it.id)).map(it => it.id)
    if (!pending.length) return
    const t = setTimeout(() => setSettled(s => [...s, ...pending.filter(id => !s.includes(id))]), 750)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st, settled])

  // Row layout: a settled word keeps its meaning in its own row; the rest fill the gaps in order.
  const rows = Math.max(ex.items.length, options.length)
  const rowDef: (number | null)[] = Array.from({ length: rows }, () => null)
  const used = new Set<number>()
  ex.items.forEach((it, i) => { if (settled.includes(it.id) && it.kind === 'match') { rowDef[i] = it.answer; used.add(it.answer) } })
  // Meanings still waiting are reshuffled after every match, and never sit beside their own word.
  const freeDefs = options.map((_, d) => d).filter(d => !used.has(d))
  const freeRows = rowDef.map((v, i) => (v === null ? i : -1)).filter(i => i >= 0)
  const answerOfRow = (i: number) => { const it = ex.items[i]; return it && it.kind === 'match' ? it.answer : undefined }
  const mixed = shuffleAvoid(freeDefs, freeRows.map(answerOfRow), `${ex.id}|${[...settled].sort().join(',')}`)
  freeRows.forEach((r, k) => { rowDef[r] = mixed[k] ?? null })

  // FLIP: slide each meaning from its old row to the new one, with a small magnetic overshoot.
  useLayoutEffect(() => {
    const moved = settled.length !== lastSettled.current
    lastSettled.current = settled.length
    options.forEach((_, d) => {
      const el = defRefs.current[d]
      if (!el) return
      const top = el.offsetTop
      const prev = lastPos.current[d]
      lastPos.current[d] = top
      if (!moved || prev === undefined || prev === top || typeof el.animate !== 'function') return
      const magnet = settled.length > 0 && ex.items.some(it => settled.includes(it.id) && it.kind === 'match' && it.answer === d)
      el.style.zIndex = '2'
      const anim = el.animate(
        magnet
          ? [{ transform: `translateY(${prev - top}px)`, boxShadow: '0 0 0 0 rgba(107,174,46,0)' },
             { transform: 'translateY(4px)', boxShadow: '0 0 0 8px rgba(107,174,46,.35)', offset: .78 },
             { transform: 'translateY(0)', boxShadow: '0 0 0 0 rgba(107,174,46,0)' }]
          : [{ transform: `translateY(${prev - top}px)` }, { transform: 'translateY(0)' }],
        { duration: magnet ? 560 : 420, easing: 'cubic-bezier(.3,1.2,.5,1)' },
      )
      anim.onfinish = () => { el.style.zIndex = '' }
    })
  })

  function pickDef(d: number) {
    if (!curItem || owner(d) >= 0) return
    if (st[curItem.id]?.wrong.includes(String(d))) return
    const ok = isRight(curItem, String(d))
    attempt(curItem, String(d))
    if (ok) {
      const idx = ex.items.findIndex(it => it.id === curItem.id)
      const after = { ...st, [curItem.id]: { done: true } as St }
      const order = [...ex.items.slice(idx + 1), ...ex.items.slice(0, idx + 1)]
      setCur(order.find(it => !after[it.id]?.done)?.id ?? null)
    }
  }

  const cells: ReactNode[] = []
  for (let i = 0; i < rows; i++) {
    const it = ex.items[i]
    const s = it ? st[it.id] : undefined
    cells.push(it ? (
      <button key={`w${it.id}`} type="button" disabled={!!s?.done} onClick={() => setCur(it.id)}
        style={{ ['--mc' as string]: COLOURS[i % COLOURS.length] }}
        className={`mb-item${cur === it.id && !s?.done ? ' mb-on' : ''}${s?.done ? ' mb-paired mb-ok' : ''}${shake === it.id ? ' mb-bad' : ''}`}>
        <span className="mb-badge">{i + 1}</span>
        <span className="mb-word">{it.kind === 'match' ? it.q : ''}{showEs && ex.gloss?.[i] && <small className="oc-es">{ex.gloss[i]}</small>}</span>
        {it.kind === 'match' && <Listen text={it.q} />}
        {s?.done && <span className="mark ok">✓</span>}
      </button>
    ) : <span key={`e${i}`} />)
    const d = rowDef[i]
    if (d === null) { cells.push(<span key={`n${i}`} />); continue }
    const w = owner(d)
    const red = !!curItem && st[curItem.id]?.wrong.includes(String(d))
    cells.push(
      <button key={`d${d}`} ref={el => { defRefs.current[d] = el }} type="button" disabled={w >= 0 || red} onClick={() => pickDef(d)}
        style={{ ['--mc' as string]: COLOURS[(w >= 0 ? w : 0) % COLOURS.length] }}
        className={`mb-item mb-def${w >= 0 ? ' mb-paired mb-ok' : ''}${red ? ' mb-bad mb-red' : ''}`}>
        {w >= 0 ? <span className="mb-badge">{w + 1}</span> : <span className="mb-badge mb-badge--empty" />}
        <span>{options[d]}</span>
      </button>,
    )
  }
  return <div className="match-board">{cells}</div>
}
