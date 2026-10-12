'use client'
// Somerset course design system — the six pieces every online course is built from.
// Canonical exemplar: /courses/kit-preview. Clone that; don't restyle in a course.
// Rules: tokens live in tokens.css, classes are ck-*, a course only sets --accent.
import React from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import './tokens.css'
import './kit.css'

// ───────── CourseShell: header · step nav · hero · progress strip ─────────
export type ShellLink = { href: string; label: React.ReactNode; brass?: boolean; badge?: number }
export type ShellStep = { nav: string }
export type ShellHero = {
  src: string; alt: string; focus?: string
  credit?: { author: string; licence: string; page: string }
  tag: string; title: React.ReactNode; aim: React.ReactNode; note?: React.ReactNode
}

export function CourseShell({
  scope, accent, accentLt, label, links = [], steps, step, onGo,
  canGo = i => i <= step + 1, isDone = i => i < step,
  hero, cover = step === 0, stripLeft, stripRight, children,
}: {
  scope: string                         // the course's own CSS scope class, e.g. 'sexp'
  accent?: string; accentLt?: string    // the ONE thing a course may change
  label: string                         // "Spanish for Expats · Module 1"
  links?: ShellLink[]
  steps: ShellStep[]; step: number; onGo: (i: number) => void
  canGo?: (i: number) => boolean; isDone?: (i: number) => boolean
  hero: ShellHero; cover?: boolean
  stripLeft: React.ReactNode; stripRight?: React.ReactNode
  children: React.ReactNode
}) {
  const vars = { ['--accent' as string]: accent, ['--accent-lt' as string]: accentLt } as React.CSSProperties
  return (
    <div className={`course ${scope}`} style={accent ? vars : undefined}>
      <header className="ck-header">
        <div className="ck-header__top">
          <Link href="/" aria-label="Somerset Language Centre" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <SomersetLogo variant="white" />
          </Link>
          <span className="ck-header__label">{label}</span>
          {links.map((l, i) => (
            <Link key={i} href={l.href} className={`ck-header__link${l.brass ? ' ck-header__link--brass' : ''}`}>
              {l.label}{l.badge ? <span className="ck-header__badge">{l.badge}</span> : null}
            </Link>
          ))}
        </div>
        <nav className="ck-nav" aria-label="Lessons">
          {steps.map((s, i) => {
            const done = isDone(i) && i !== step
            return (
              <button key={s.nav} type="button" disabled={!canGo(i)} onClick={() => canGo(i) && onGo(i)}
                className={`ck-nav__btn${i === step ? ' is-active' : ''}${done ? ' is-done' : ''}`}>
                {done ? <span className="ck-nav__tick">✓</span> : <span className="ck-nav__num">{i + 1}</span>}
                {s.nav}
              </button>
            )
          })}
        </nav>
      </header>

      <section className={`ck-hero${cover ? ' ck-hero--cover' : ''}`} key={`hero-${step}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ck-hero__img" src={hero.src} alt={hero.alt} style={hero.focus ? { objectPosition: hero.focus } : undefined} />
        {hero.credit && (
          <a className="ck-credit" href={hero.credit.page} target="_blank" rel="noopener noreferrer">
            Photo: {hero.credit.author} · {hero.credit.licence}
          </a>
        )}
        <div className="ck-hero__overlay">
          <p className="ck-hero__label">{hero.tag}</p>
          <h1 className="ck-hero__title">{hero.title}</h1>
          <p className="ck-hero__sub">{hero.aim}</p>
          {hero.note && <p className="ck-hero__note">{hero.note}</p>}
        </div>
      </section>

      <div className="ck-strip">
        <div className="ck-strip__inner">
          <div className="ck-segs" aria-label={`Step ${step + 1} of ${steps.length}`}>
            {steps.map((_, i) => (
              <span key={i} className={`ck-seg${isDone(i) ? ' is-done' : ''}${i === step ? ' is-now' : ''}`} />
            ))}
          </div>
          <div className="ck-strip__row">
            <span className="ck-strip__text">{stripLeft}</span>
            {stripRight && <span className="ck-strip__text">{stripRight}</span>}
          </div>
        </div>
      </div>

      <main className="ck-wrap">
        <div className="ck-step" key={`step-${step}`}>{children}</div>
      </main>
    </div>
  )
}

// ───────── StepHead: the labelled heading inside a card ─────────
export function StepHead({ tag, title, aim, icon, extra }: {
  tag: string; title: React.ReactNode; aim?: React.ReactNode; icon?: React.ReactNode; extra?: React.ReactNode
}) {
  return (
    <div className="ck-head">
      {icon && <div className="ck-head__icon">{icon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="ck-head__tag">{tag}</span>
        <h2 className="ck-head__title">{title}</h2>
        {aim && <p className="ck-head__aim">{aim}</p>}
      </div>
      {extra}
    </div>
  )
}

// ───────── OptionCard + ChoiceGrid: the approved Emparejar card, lifted ─────────
export type OptionState = 'idle' | 'selected' | 'right' | 'wrong' | 'used' | 'lifting'

export function OptionCard({
  icon, text, en, showEn = false, state = 'idle', onPick, onPlay, disabled, drag, mainProps,
}: {
  icon?: React.ReactNode
  text: React.ReactNode          // target-language text, large serif
  en?: React.ReactNode           // translation — shown when showEn, or always on a wrong pick
  showEn?: boolean
  state?: OptionState
  onPick?: () => void
  onPlay?: () => void            // renders the ▶ button when given
  disabled?: boolean
  drag?: boolean                 // grab cursor; pair with mainProps pointer handlers
  mainProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}) {
  const revealEn = en && (showEn || state === 'wrong')
  return (
    <div className={`ck-opt${drag ? ' ck-opt--drag' : ''}${state !== 'idle' ? ` is-${state}` : ''}`}>
      <button type="button" className="ck-opt__main" onClick={onPick} disabled={disabled || state === 'used' || state === 'right'} {...mainProps}>
        {icon && <span className="ck-opt__icon">{icon}</span>}
        <span className="ck-opt__text">
          <span className="ck-opt__es">{text}</span>
          {revealEn && <span className="ck-opt__en">{en}</span>}
        </span>
      </button>
      {onPlay && (
        <button type="button" className="ck-opt__play" aria-label="Listen" onClick={e => { e.stopPropagation(); onPlay() }}>▶</button>
      )}
    </div>
  )
}

export function ChoiceGrid({ label, sub, showEn, onToggleEn, cols = 2, children }: {
  label?: React.ReactNode; sub?: React.ReactNode
  showEn?: boolean; onToggleEn?: (v: boolean) => void   // renders the "Show English" switch when given
  cols?: 1 | 2
  children: React.ReactNode
}) {
  return (
    <div>
      {(label || onToggleEn) && (
        <div className="ck-grid__head">
          {label && <p className="ck-label">{label}{sub && <small>{sub}</small>}</p>}
          {onToggleEn && (
            <label className="ck-switch">
              <input type="checkbox" checked={!!showEn} onChange={e => onToggleEn(e.target.checked)} /> Show English
            </label>
          )}
        </div>
      )}
      <div className={`ck-grid${cols === 1 ? ' ck-grid--1' : ''}`}>{children}</div>
    </div>
  )
}

// ───────── Feedback: instant, no Check button ─────────
export const CHEERS = ['Right first time!', 'Exactly!', 'Perfecto.', 'That one is yours now.', 'Clean.', 'Yes!']

export function Feedback({ kind, text, revise, n = 0 }: {
  kind: 'win' | 'quiet' | 'wrong'
  text?: React.ReactNode
  revise?: boolean      // "added to your revision" tag
  n?: number            // rotates the cheer
}) {
  const msg = text ?? (kind === 'win' ? CHEERS[n % CHEERS.length] : kind === 'quiet' ? 'Got it.' : 'Not that one — try again.')
  return (
    <div className={`ck-fb ck-fb--${kind}`} role="status">
      <span className="ck-fb__burst" aria-hidden>{kind === 'wrong' ? '✕' : '✓'}</span>
      <span className="ck-fb__text">{msg}{revise && <span className="ck-fb__revise">added to your revision</span>}</span>
    </div>
  )
}

// ───────── Dots: progress inside a drill ─────────
export function Dots({ states, now, count }: { states: Array<'ok' | 'mid' | 'bad' | null>; now?: number; count?: React.ReactNode }) {
  return (
    <div className="ck-deck-top">
      <div className="ck-dots">
        {states.map((s, i) => <span key={i} className={`ck-dot${s ? ` is-${s}` : ''}${i === now ? ' is-now' : ''}`} />)}
      </div>
      {count !== undefined && <span className="ck-count">{count}</span>}
    </div>
  )
}

// ───────── ResultSummary: end of module ─────────
export function ResultSummary({ score, max, title, sub, items, children }: {
  score: number; max: number
  title: React.ReactNode; sub?: React.ReactNode
  items?: Array<{ label: string; score: number; max: number }>
  children?: React.ReactNode   // "What next?" block
}) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  const r = 66, c = 2 * Math.PI * r
  return (
    <div className="ck-card ck-result">
      <div className="ck-result__ring">
        <svg width="148" height="148" viewBox="0 0 148 148" aria-hidden>
          <circle cx="74" cy="74" r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
          <circle cx="74" cy="74" r={r} fill="none" stroke="var(--brass)" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)' }} />
        </svg>
        <div className="ck-result__pct">{pct}%<small>{score} / {max}</small></div>
      </div>
      <h2 className="ck-result__title">{title}</h2>
      {sub && <p className="ck-result__sub">{sub}</p>}
      {items && items.length > 0 && (
        <ul className="ck-result__list">
          {items.map(it => {
            const p = it.max ? it.score / it.max : 0
            return (
              <li key={it.label} className="ck-result__item">
                <span className={`ck-dot is-${p >= .8 ? 'ok' : p >= .5 ? 'mid' : 'bad'}`} />
                <span style={{ flex: 1 }}>{it.label}</span>
                <strong>{Math.round(it.score)}/{it.max}</strong>
              </li>
            )
          })}
        </ul>
      )}
      {children}
    </div>
  )
}

// ───────── Btn ─────────
export function Btn({ variant, sm, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'accent' | 'ghost'; sm?: boolean }) {
  return <button type="button" className={`ck-btn${variant ? ` ck-btn--${variant}` : ''}${sm ? ' ck-btn--sm' : ''} ${className}`} {...rest} />
}
