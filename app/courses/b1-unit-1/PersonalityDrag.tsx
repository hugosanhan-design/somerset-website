'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PERS_QS, PERS_OPTIONS } from '@/lib/courses/b1u1'
import type { DeckResult } from './RecallDeck'

type Status = 'asking' | 'right' | 'revealed'
type Drag = { word: string; x: number; y: number }

// One sentence, one person, a bag of all ten adjectives. Drag a word onto the person
// (or tap it): a wrong word is refused the moment it touches them, the right one lands
// in the sentence and the person's face changes to show it. Right first time = 1 point,
// second try = ½, after three misses the answer is shown and scores 0.
export default function PersonalityDrag({ onRecord, onFinish }: {
  onRecord: (id: string, clean: boolean) => void
  onFinish: (results: DeckResult[]) => void
}) {
  const bag = useMemo(() => [...PERS_OPTIONS].sort(() => Math.random() - 0.5), [])
  const [idx, setIdx] = useState(0)
  const [status, setStatus] = useState<Status>('asking')
  const [tried, setTried] = useState<string[]>([])
  const [results, setResults] = useState<DeckResult[]>([])
  const [shake, setShake] = useState(0)
  const [refused, setRefused] = useState('')
  const [drag, setDrag] = useState<Drag | null>(null)
  const [over, setOver] = useState(false)
  const target = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const nextBtn = useRef<HTMLButtonElement>(null)
  const press = useRef<{ word: string; x: number; y: number; moved: boolean } | null>(null)
  const q = PERS_QS[idx]
  const id = `pers:${q.a}`

  function finishCard(points: number) {
    setResults(r => [...r, { id, points }])
    onRecord(id, points === 1)
  }

  // Returns true if the word was taken (right), false if refused.
  function attempt(word: string): boolean {
    if (status !== 'asking' || tried.includes(word)) return false
    if (word === q.a) {
      setStatus('right')
      finishCard(tried.length === 0 ? 1 : tried.length === 1 ? 0.5 : 0)
      return true
    }
    const t = [...tried, word]
    setTried(t); setRefused(word); setShake(n => n + 1)
    if (t.length >= 3) { setStatus('revealed'); finishCard(0) }
    return false
  }

  function advance() {
    if (idx + 1 >= PERS_QS.length) { onFinish(results); return }
    setIdx(idx + 1); setStatus('asking'); setTried([]); setRefused('')
  }

  useEffect(() => {
    if (status === 'right') { const t = setTimeout(advance, 1400); return () => clearTimeout(t) }
    if (status === 'revealed') nextBtn.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, idx])

  // On a phone the sentence, the person and the bag must all be on screen to drag
  // between them: bring the game into view once the page has settled.
  useEffect(() => {
    if (window.innerWidth >= 700) return
    const t = setTimeout(() => root.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450)
    return () => clearTimeout(t)
  }, [])

  function overTarget(x: number, y: number) {
    const r = target.current?.getBoundingClientRect()
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  }

  function onDown(e: React.PointerEvent<HTMLButtonElement>, word: string) {
    if (status !== 'asking' || tried.includes(word)) return
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* keep going without capture */ }
    press.current = { word, x: e.clientX, y: e.clientY, moved: false }
  }
  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    const p = press.current
    if (!p) return
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6) p.moved = true
    if (!p.moved) return
    setDrag({ word: p.word, x: e.clientX, y: e.clientY })
    const isOver = overTarget(e.clientX, e.clientY)
    setOver(isOver)
    // The person decides the moment the word touches them.
    if (isOver) { attempt(p.word); press.current = null; setDrag(null); setOver(false) }
  }
  function onUp() {
    const p = press.current
    press.current = null
    setDrag(null); setOver(false)
    if (p && !p.moved) attempt(p.word)
  }

  const lastPoints = results[results.length - 1]?.points

  return (
    <div className="pd" ref={root}>
      <div className="deck-top">
        <div className="deck-dots">
          {PERS_QS.map((x, i) => {
            const r = results[i]
            const cls = r ? (r.points === 1 ? 'd-ok' : r.points > 0 ? 'd-mid' : 'd-bad') : i === idx ? 'd-now' : ''
            return <span key={x.a} className={`deck-dot ${cls}`} />
          })}
        </div>
        <span className="deck-count">{idx + 1} / {PERS_QS.length}</span>
      </div>

      <p className="pd-sentence" key={`s${idx}`}>
        {q.before}{' '}
        <span className={`pd-blank ${status}`}>{status === 'asking' ? ' ' : q.a}</span>
        {q.after === '.' ? '.' : ` ${q.after}`}
      </p>

      <div className="pd-stage">
        <div ref={target} key={`p${idx}-${shake}`}
          className={`pd-person ${status}${over ? ' over' : ''}${shake && status === 'asking' && refused ? ' refuse' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pd-photo" key={q.img} src={q.img} alt={status === 'asking' ? '' : q.alt} draggable={false} />
          <span className="pd-role" aria-hidden>{q.role}</span>
          {refused && status === 'asking' && <span className="pd-nope" key={`n${shake}`}>✗ not {refused}</span>}
        </div>
        <span className="pd-who">{q.who}</span>
        {status === 'right' && <span className={`deck-verdict right`}>{lastPoints === 1 ? '✓ First time!' : '✓ Got it'}</span>}
        {status === 'revealed' && (
          <div className="pd-revealed">
            <span className="deck-verdict revealed">The word is <strong>{q.a}</strong>. It comes back in Revise.</span>
            <button ref={nextBtn} type="button" className="btn" onClick={advance}>Next →</button>
          </div>
        )}
      </div>

      <div className="pd-bag">
        <div className="pd-bag-label">🎒 Your adjective bag <small>Drag a word onto the person, or tap it</small></div>
        <div className="pd-chips">
          {bag.map(w => {
            const used = tried.includes(w)
            const isRight = status !== 'asking' && w === q.a
            return (
              <button key={w} type="button" className={`pd-chip${used ? ' used' : ''}${isRight ? ' right' : ''}${drag?.word === w ? ' lifting' : ''}`}
                disabled={used || status !== 'asking'}
                onPointerDown={e => onDown(e, w)} onPointerMove={onMove} onPointerUp={onUp}
                onPointerCancel={() => { press.current = null; setDrag(null); setOver(false) }}
                onClick={e => { if (e.detail === 0) attempt(w) /* keyboard */ }}>
                {w}
              </button>
            )
          })}
        </div>
      </div>

      {/* Portal to the .mag root (keeps the theme variables): an ancestor with a transform/animation would otherwise become the
          containing block for position:fixed and push the dragged word away from the pointer. */}
      {drag && createPortal(
        <div className={`pd-ghost${over ? ' over' : ''}`} style={{ left: drag.x, top: drag.y }}>{drag.word}</div>,
        (root.current?.closest('.mag') as HTMLElement | null) ?? document.body
      )}
    </div>
  )
}
