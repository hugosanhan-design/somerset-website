'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

// Guided tour: dims the page, spotlights one element at a time, explains it in a card
// in the centre of the screen and draws an arrow from the card to the element.
export type TourStep = { go: number; sel: string; title: string; text: string }

type Rect = { top: number; left: number; width: number; height: number }

const same = (a: Rect | null, b: Rect | null) =>
  a === b || (!!a && !!b && Math.abs(a.top - b.top) < 0.5 && Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5)

export default function Tour({ steps, onGo, onClose }: {
  steps: TourStep[]
  onGo: (step: number) => void
  onClose: () => void
}) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [card, setCard] = useState<Rect | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const s = steps[i]

  const measure = useCallback(() => {
    const el = document.querySelector(s.sel) as HTMLElement | null
    const r = el ? el.getBoundingClientRect() : null
    const next = r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null
    setRect(p => (same(p, next) ? p : next))
    const c = cardRef.current
    if (c) {
      const cr = c.getBoundingClientRect()
      const nc = { top: cr.top, left: cr.left, width: cr.width, height: cr.height }
      setCard(p => (same(p, nc) ? p : nc))
    }
  }, [s.sel])

  // Open the right tab, then bring the element into view in the free space above the card.
  useEffect(() => {
    onGo(s.go)
    const t = setTimeout(() => {
      const el = document.querySelector(s.sel) as HTMLElement | null
      if (el) {
        const r = el.getBoundingClientRect()
        window.scrollTo({ top: Math.max(0, r.top + window.scrollY - 70), behavior: 'smooth' })
      }
      setTimeout(measure, 450)
    }, 380)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  // Extra room at the end of the page so any element can be scrolled to the top, above the card.
  useEffect(() => {
    document.body.classList.add('tour-open')
    return () => document.body.classList.remove('tour-open')
  }, [])

  useLayoutEffect(() => {
    let raf = 0
    const tick = () => { measure(); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [measure])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI(n => Math.min(n + 1, steps.length - 1))
      if (e.key === 'ArrowLeft') setI(n => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, steps.length])

  const pad = 8
  const last = i === steps.length - 1

  // Card sits in the free space: below the element if it fits, else above; a very tall
  // element is clipped so the card never covers the part that is being explained.
  let cardTop: number | null = null
  let shown: Rect | null = rect
  if (rect && typeof window !== 'undefined') {
    const vh = window.innerHeight
    const h = card ? card.height : 250
    const gap = 36, edge = 10
    const tTop = Math.max(rect.top - pad, 0)
    const tBot = Math.min(rect.top + rect.height + pad, vh)
    const roomBelow = vh - tBot - edge - gap
    const roomAbove = tTop - edge - gap
    if (roomBelow >= h) cardTop = tBot + gap + Math.min((roomBelow - h) / 2, 30)
    else if (roomAbove >= h) cardTop = tTop - gap - h - Math.min((roomAbove - h) / 2, 30)
    else {
      const maxH = vh - h - gap - edge - tTop - pad * 2
      if (maxH >= 100) {
        shown = { ...rect, height: Math.min(rect.height, maxH) }
        cardTop = tTop + shown.height + pad * 2 + gap
      } else cardTop = vh - h - edge
    }
  }

  // Arrow from the card edge to the visible part of the spotlighted element.
  let arrow: { d: string } | null = null
  if (shown && card && typeof window !== 'undefined') {
    const vw = window.innerWidth, vh = window.innerHeight
    let tTop = Math.max(shown.top - pad, 4)
    let tBot = Math.min(shown.top + shown.height + pad, vh - 4)
    const tLeft = Math.max(shown.left - pad, 4)
    const tRight = Math.min(shown.left + shown.width + pad, vw - 4)
    const cTop = card.top, cBot = card.top + card.height
    const cL = card.left, cR = card.left + card.width
    const overlapsX = tLeft < cR && tRight > cL
    if (overlapsX && tTop < cBot && tBot > cTop) {
      // Target runs behind the card: aim at the part that is still visible.
      if (shown.top + shown.height / 2 < (cTop + cBot) / 2) tBot = cTop - 6
      else tTop = cBot + 6
    }
    if (tBot > tTop && tRight > tLeft) {
      const tc = (tTop + tBot) / 2
      const above = tBot <= cTop + 2
      const below = tTop >= cBot - 2
      let x1: number, y1: number, x2: number, y2: number
      if (above || below) {
        const lo = Math.max(tLeft, cL + 24), hi = Math.min(tRight, cR - 24)
        const x = lo <= hi ? (lo + hi) / 2 : Math.min(Math.max((tLeft + tRight) / 2, cL + 24), cR - 24)
        x1 = x; x2 = Math.min(Math.max(x, tLeft + 12), tRight - 12)
        y1 = above ? cTop : cBot
        y2 = above ? tBot + 4 : tTop - 4
      } else {
        const toLeft = tRight <= cL
        x1 = toLeft ? cL : cR
        x2 = toLeft ? tRight + 4 : tLeft - 4
        y1 = Math.min(Math.max(tc, cTop + 24), cBot - 24)
        y2 = tc
      }
      const bend = above || below ? { cx: (x1 + x2) / 2 + 40, cy: (y1 + y2) / 2 } : { cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 - 40 }
      arrow = { d: `M ${x1} ${y1} Q ${bend.cx} ${bend.cy} ${x2} ${y2}` }
    }
  }

  return (
    <>
      <div className="tour-block" onClick={onClose} />
      {shown && (
        <div className="tour-spot" style={{
          top: shown.top - pad, left: shown.left - pad, width: shown.width + pad * 2, height: shown.height + pad * 2,
        }} />
      )}
      {arrow && (
        <svg className="tour-arrow" aria-hidden>
          <defs>
            <marker id="tour-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#B7E36F" />
            </marker>
          </defs>
          <path d={arrow.d} fill="none" stroke="#B7E36F" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 0" markerEnd="url(#tour-head)" />
        </svg>
      )}
      <div className="tour-card" ref={cardRef} role="dialog" aria-label="How this course works" style={cardTop !== null ? { top: cardTop } : undefined}>
        <div className="tour-top">
          <span className="tour-count">{i + 1} of {steps.length}</span>
          <button type="button" className="tour-x" onClick={onClose} aria-label="Close the tour">✕</button>
        </div>
        <h3 className="tour-title">{s.title}</h3>
        <p className="tour-text">{s.text}</p>
        <div className="tour-dots" aria-hidden>
          {steps.map((_, n) => <span key={n} className={n === i ? 'on' : ''} />)}
        </div>
        <div className="tour-actions">
          <button type="button" className="btn btn--ghost" onClick={() => setI(n => Math.max(n - 1, 0))} disabled={i === 0}>← Back</button>
          {last
            ? <button type="button" className="btn" onClick={onClose}>Finish</button>
            : <button type="button" className="btn" onClick={() => setI(n => n + 1)}>Next →</button>}
        </div>
      </div>
    </>
  )
}
