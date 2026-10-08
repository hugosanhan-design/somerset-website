'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FORM_GUIDES, formPage, type FormGuide as Guide } from '@/lib/courses/spanishExpatsForms'

// Walks the learner through a real official form, spotlighting one box at a time.
export function FormGuideButton({ id }: { id: Guide['id'] }) {
  const [open, setOpen] = useState(false)
  const g = FORM_GUIDES[id]
  return (
    <>
      <button type="button" className="fg-launch" onClick={() => setOpen(true)}>
        <span className="fg-launch__play" aria-hidden>▶</span>
        <span><strong>How to fill in form {g.name}</strong><small>{g.purpose} · {g.steps.length} steps</small></span>
      </button>
      {open && <FormGuideModal guide={g} onClose={() => setOpen(false)} />}
    </>
  )
}

function FormGuideModal({ guide, onClose }: { guide: Guide; onClose: () => void }) {
  const [i, setI] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const s = guide.steps[i]
  const last = i === guide.steps.length - 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI(n => Math.min(n + 1, guide.steps.length - 1))
      if (e.key === 'ArrowLeft') setI(n => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose, guide.steps.length])

  // Keep the highlighted box in view inside the scrollable page.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const t = setTimeout(() => {
      const img = el.querySelector('img')
      if (!img) return
      const top = (s.box[1] / 100) * img.clientHeight
      const h = (s.box[3] / 100) * img.clientHeight
      el.scrollTo({ top: Math.max(0, top - Math.max(24, (el.clientHeight - h) / 2)), behavior: 'smooth' })
    }, 60)
    return () => clearTimeout(t)
  }, [i, s.box, s.page])

  return createPortal(
    <div className="sexp" style={{ minHeight: 0, background: 'none' }}>
      <div className="fg" role="dialog" aria-label={`How to fill in form ${guide.name}`}>
        <div className="fg-panel">
          <header className="fg-head">
            <div>
              <p className="fg-kicker">Form {guide.name} · page {s.page}</p>
              <h3 className="fg-name">{guide.purpose}</h3>
            </div>
            <button type="button" className="fg-x" onClick={onClose} aria-label="Close the guide">✕</button>
          </header>
          <div className="fg-body">
            <div className="fg-page" ref={scroller}>
              <div className="fg-page__inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formPage(guide.id, s.page)} alt={`Form ${guide.name}, page ${s.page}`} />
                <div className="fg-spot" style={{ left: `${s.box[0]}%`, top: `${s.box[1]}%`, width: `${s.box[2]}%`, height: `${s.box[3]}%` }} />
              </div>
            </div>
            <div className="fg-card">
              <span className="fg-count">Step {i + 1} of {guide.steps.length}</span>
              <h4 className="fg-title">{s.title}</h4>
              <p className="fg-text">{s.text}</p>
              {s.words && (
                <dl className="fg-words">
                  {s.words.map(([es, en]) => <div key={es}><dt>{es}</dt><dd>{en}</dd></div>)}
                </dl>
              )}
              <div className="fg-dots" aria-hidden>{guide.steps.map((_, n) => <span key={n} className={n === i ? 'on' : ''} />)}</div>
              <div className="fg-actions">
                <button type="button" className="btn btn--ghost" onClick={() => setI(n => Math.max(n - 1, 0))} disabled={i === 0}>← Back</button>
                {last
                  ? <button type="button" className="btn btn--terra" onClick={onClose}>Finish</button>
                  : <button type="button" className="btn btn--terra" onClick={() => setI(n => n + 1)}>Next →</button>}
              </div>
              <a className="fg-pdf" href={guide.pdf} target="_blank" rel="noopener noreferrer">Download the official {guide.name} (fillable PDF) ↗</a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
