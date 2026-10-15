'use client'
// "Explícamelo": a Spanish card for one grammar point — how you say it in Spanish, a mini
// timeline, the structure, one rule to remember and an example. Cards live in data/explainers.json.
import { useEffect, useState } from 'react'
import { SomersetIcon } from '@/components/SomersetIcon'
import explainers from '@/data/explainers.json'

type Mark = { kind: 'point' | 'span'; x?: number; x1?: number; x2?: number; label: string; tone?: 'brass' }
export type Explainer = {
  title: string; es: string; structure: string[]; rule: string
  timeline?: { marks: Mark[]; arrow?: [number, number] }
  example?: { en: string; es: string }
}
const CARDS = explainers as unknown as Record<string, Explainer>

export function getExplainer(id?: string): Explainer | null {
  return id && !id.startsWith('_') ? CARDS[id] ?? null : null
}

// Past on the left, "ahora" on the right. x: 0 = far past, 1 = now.
function Timeline({ t }: { t: NonNullable<Explainer['timeline']> }) {
  const W = 320, L = 16, R = 286, Y = t.arrow ? 62 : 46
  const X = (v: number) => L + v * (R - L)
  const colour = (m: Mark) => (m.tone === 'brass' ? 'var(--brass)' : 'var(--racing-2)')
  return (
    <svg className="gm-tl" viewBox={`0 0 ${W} ${Y + 46}`} role="img" aria-label="Línea de tiempo">
      <line x1={L} y1={Y} x2={R + 18} y2={Y} stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />
      <line x1={X(1)} y1={Y - 12} x2={X(1)} y2={Y + 12} stroke="var(--muted)" strokeWidth="2" />
      <text x={X(1)} y={Y + 30} textAnchor="middle" className="gm-tl__now">ahora</text>
      <text x={L} y={Y + 30} className="gm-tl__now">pasado</text>
      {t.arrow && (
        <path d={`M${X(t.arrow[0]) + 8} ${Y - 16} Q ${(X(t.arrow[0]) + X(t.arrow[1])) / 2} ${Y - 34} ${X(t.arrow[1]) - 8} ${Y - 16}`}
          fill="none" stroke="var(--brass)" strokeWidth="1.6" strokeDasharray="4 3" markerEnd="url(#gmArrow)" />
      )}
      <defs><marker id="gmArrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="var(--brass)" /></marker></defs>
      {t.marks.map((m, i) => m.kind === 'span' ? (
        <g key={i}>
          <rect x={X(m.x1!)} y={Y - 6} width={X(m.x2!) - X(m.x1!)} height="12" rx="6" fill={colour(m)} opacity=".85" />
          <text x={(X(m.x1!) + X(m.x2!)) / 2} y={Y + 30} textAnchor="middle" className="gm-tl__label">{m.label}</text>
        </g>
      ) : (
        <g key={i}>
          <circle cx={X(m.x!)} cy={Y} r="8" fill={colour(m)} stroke="#fff" strokeWidth="2.5" />
          <text x={X(m.x!)} y={Y - (t.arrow ? 40 : 16)} textAnchor="middle" className="gm-tl__label">{m.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ids: one card, or several shown as tabs (used before the student answers, so the
// button never reveals which form is right). label: button text.
export function ExplainButton({ ids, label = 'Explícamelo', variant = 'pill' }: { ids: (string | undefined)[]; label?: string; variant?: 'pill' | 'link' }) {
  // Tabs follow the order of data/explainers.json (past simple → past continuous → past perfect…).
  const order = Object.keys(CARDS)
  const cards = ([...new Set(ids)].map(id => ({ id, card: getExplainer(id) })).filter(c => c.card) as { id: string; card: Explainer }[])
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState(0)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  if (!cards.length) return null
  const card = cards[Math.min(tab, cards.length - 1)].card
  return (
    <>
      <button type="button" className={variant === 'link' ? 'gm-explain-link' : 'gm-explain-btn'} onClick={() => { setTab(0); setOpen(true) }}>
        {variant === 'pill' && <SomersetIcon name="tip" size={26} />} {label}
      </button>
      {open && (
        <div className="gm-sheet" role="dialog" aria-modal="true" aria-label={`Explicación: ${card.title}`} onClick={() => setOpen(false)}>
          <div className="gm-sheet__card" onClick={e => e.stopPropagation()}>
            <div className="gm-sheet__head">
              <h2>{cards.length > 1 ? 'Explícamelo' : card.title}</h2>
              <button type="button" className="gm-sheet__close" onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
            </div>
            {cards.length > 1 && (
              <div className="gm-tabs" role="tablist">
                {cards.map((c, i) => (
                  <button key={c.id} type="button" role="tab" aria-selected={i === tab} className={`gm-tab${i === tab ? ' is-on' : ''}`} onClick={() => setTab(i)}>{c.card.title}</button>
                ))}
              </div>
            )}
            <p className="gm-sheet__es">{card.es}</p>
            {card.timeline && <Timeline t={card.timeline} />}
            <div className="gm-sheet__block">
              <p className="gm-sheet__kicker">Estructura</p>
              <p className="gm-sheet__structure">{card.structure[0]}</p>
              {card.structure[1] && <p className="gm-sheet__eg">{card.structure[1]}</p>}
            </div>
            <div className="gm-sheet__rule">
              <SomersetIcon name="tip" size={34} />
              <p><strong>Para no olvidarlo:</strong> {card.rule}</p>
            </div>
            {card.example && (
              <div className="gm-sheet__block">
                <p className="gm-sheet__kicker">Ejemplo</p>
                <p className="gm-sheet__en">{card.example.en}</p>
                <p className="gm-sheet__eg">{card.example.es}</p>
              </div>
            )}
            <button type="button" className="ck-btn ck-btn--accent gm-sheet__ok" onClick={() => setOpen(false)}>Entendido</button>
          </div>
        </div>
      )}
    </>
  )
}
