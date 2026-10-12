'use client'
// Repaso: the student's own mistakes (from writing and speaking) plus the module's words
// and phrases, brought back by spaced repetition. Right answers lock in as they are typed.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { useProgress } from '@/lib/courses/useProgress'
import { recordAnswer, pickForReview, dueCount, type Progress } from '@/lib/courses/progress'
import { COURSE_ID, ALL_ITEMS_SE, checkAnswerSE } from '@/lib/courses/spanishExpats'
import { Icon } from '../icons'

type Card =
  | { kind: 'own'; id: string; pre: string; post: string; answer: string; why: string; wrong: string }
  | { kind: 'vocab'; id: string; clue: string; answer: string }
  | { kind: 'phrase'; id: string; context: string; translation: string; answer: string }

function buildSession(p: Progress): Card[] {
  const ownIds = Object.keys(p.personal ?? {})
  const own: Card[] = pickForReview(p, ownIds, 8).map(id => {
    const f = p.personal![id]
    return { kind: 'own', id, pre: f.pre, post: f.post, answer: f.fix, why: f.why, wrong: f.seg }
  })
  const bank = new Map(ALL_ITEMS_SE.map(i => [i.id, i]))
  const words: Card[] = pickForReview(p, ALL_ITEMS_SE.map(i => i.id), 8).map(id => {
    const it = bank.get(id)!
    return it.kind === 'vocab'
      ? { kind: 'vocab', id, clue: it.clue, answer: it.answer }
      : { kind: 'phrase', id, context: it.context, translation: it.translation, answer: it.answer }
  })
  return [...own, ...words]
}

function RepasoCard({ card, onResult }: { card: Card; onResult: (id: string, firstTry: boolean) => void }) {
  const [value, setValue] = useState('')
  const [state, setState] = useState<'ask' | 'win' | 'late' | 'shown'>('ask')
  const [misses, setMisses] = useState(0)
  const [shake, setShake] = useState(false)
  const [why, setWhy] = useState(false)

  function accept() {
    setState(misses ? 'late' : 'win')
    onResult(card.id, misses === 0)
  }
  function onType(v: string) {
    if (state !== 'ask') return
    setValue(v)
    if (checkAnswerSE(v, card.answer) === 'right') accept()   // right answers lock in at once
  }
  function onEnter() {
    if (state !== 'ask' || !value.trim()) return
    const r = checkAnswerSE(value, card.answer)
    if (r !== 'wrong') { accept(); return }
    setShake(true); setTimeout(() => setShake(false), 400)
    if (misses >= 1) { setState('shown'); onResult(card.id, false) } else setMisses(1)
  }

  const done = state !== 'ask'
  const gap = done
    ? <b className={state === 'win' ? 'type-win rp2-win' : 'rp2-late'}>{card.answer}</b>
    : <input className={`rp2-gap${misses ? ' bad' : ''}`} value={value} onChange={e => onType(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onEnter() }} placeholder="type it…" autoCapitalize="none" autoCorrect="off" spellCheck={false} />

  return (
    <article className={`rp2-card rp2-card--${card.kind}${done ? ' done' : ''}${state === 'win' ? ' win' : ''}${shake ? ' poder-shake' : ''}`}>
      <p className="rp2-kind">{card.kind === 'own' ? 'Your mistake' : card.kind === 'vocab' ? 'Word' : 'Phrase'}</p>
      {card.kind === 'own' && (
        <>
          <p className="rp2-was">You wrote <s>{card.wrong}</s></p>
          <p className="rp2-sentence">{card.pre}{gap}{card.post}</p>
          {(done || why) ? <p className="rp2-why">{card.why}</p> : <button type="button" className="rp2-hint" onClick={() => setWhy(true)}>Why was it wrong?</button>}
        </>
      )}
      {card.kind === 'vocab' && (<><p className="rp2-clue">{card.clue}</p><p className="rp2-sentence">{gap}</p></>)}
      {card.kind === 'phrase' && (<><p className="rp2-clue">{card.context} <em>&ldquo;{card.translation}&rdquo;</em></p><p className="rp2-sentence">{gap}</p></>)}
      {misses > 0 && state === 'ask' && <p className="rp2-nope">Not yet. One more try, then press Enter.</p>}
      {state === 'shown' && <p className="rp2-nope">This one comes back tomorrow.</p>}
    </article>
  )
}

export default function RepasoPage() {
  const { progress, update } = useProgress(COURSE_ID)
  const latest = useRef(progress)
  latest.current = progress
  const [session, setSession] = useState<Card[] | null>(null)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState({ done: 0, first: 0 })

  useEffect(() => {
    // Give the saved copy a moment to merge in from the server before choosing cards.
    const t = setTimeout(() => setSession(buildSession(latest.current)), 700)
    return () => clearTimeout(t)
  }, [round])

  const ownTotal = Object.keys(progress.personal ?? {}).length
  const due = dueCount(progress, [...Object.keys(progress.personal ?? {}), ...ALL_ITEMS_SE.map(i => i.id)])

  function onResult(id: string, firstTry: boolean) {
    update(p => recordAnswer(p, id, firstTry))
    setScore(s => ({ done: s.done + 1, first: s.first + (firstTry ? 1 : 0) }))
  }

  const own = session?.filter(c => c.kind === 'own') ?? []
  const rest = session?.filter(c => c.kind !== 'own') ?? []

  return (
    <div className="sexp" style={{ ['--accent' as string]: '#5a9a2c', ['--accent-lt' as string]: '#eaf4da' }}>
      <header className="site-header">
        <div className="site-header__top">
          <Link href="/" className="corner-link" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><SomersetLogo variant="white" /></Link>
          <span className="unit-label">Spanish for Expats · Repaso</span>
          <Link href="/courses/spanish-expats" className="corner-link">← Module 1</Link>
        </div>
      </header>
      <main className="page-wrap">
        <div className="card rp2-head">
          <div>
            <p className="gx-kicker">Repaso</p>
            <h1 className="rp2-title">Learn from your own mistakes</h1>
            <p className="gx-head__sub">Your mistakes from writing and speaking, plus the words and phrases that are due today. Type the right answer: it locks in by itself.</p>
          </div>
          <div className="rp2-stats">
            <div><b>{ownTotal}</b><span>your mistakes saved</span></div>
            <div><b>{due}</b><span>due today</span></div>
            <div><b>{score.first}/{score.done}</b><span>first time this round</span></div>
          </div>
        </div>

        {!session ? <p className="rp2-empty">Choosing your cards…</p> : session.length === 0 ? (
          <div className="card rp2-empty">
            <Icon name="books" size={48} />
            <p>Nothing to revise yet. Do the module first: your mistakes from Escribir and A hablar, and the words you meet, will appear here.</p>
            <Link href="/courses/spanish-expats" className="btn btn--terra" style={{ textDecoration: 'none', display: 'inline-flex' }}>Go to Module 1 →</Link>
          </div>
        ) : (
          <>
            {own.length > 0 && (
              <section className="card">
                <p className="label">Your mistakes</p>
                <div className="rp2-grid">{own.map(c => <RepasoCard key={`${round}-${c.id}`} card={c} onResult={onResult} />)}</div>
              </section>
            )}
            {rest.length > 0 && (
              <section className="card">
                <p className="label">Words and phrases</p>
                <div className="rp2-grid">{rest.map(c => <RepasoCard key={`${round}-${c.id}`} card={c} onResult={onResult} />)}</div>
              </section>
            )}
            <div style={{ textAlign: 'center' }}>
              <button type="button" className="btn btn--terra" onClick={() => { setSession(null); setScore({ done: 0, first: 0 }); setRound(r => r + 1) }}>Another round →</button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
