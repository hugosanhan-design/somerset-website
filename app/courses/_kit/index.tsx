'use client'
// Somerset course design system — the six pieces every online course is built from.
// Canonical exemplar: /courses/kit-preview. Clone that; don't restyle in a course.
// Rules: tokens live in tokens.css, classes are ck-*, a course only sets --accent.
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import './tokens.css'
import './kit.css'

// ───────── CourseShell: header · step nav · hero · progress strip ─────────
export type ShellLink = { href: string; label: React.ReactNode; brass?: boolean; badge?: number; tour?: string; ariaLabel?: string }
export type ShellStep = { nav: string }
export type ShellHero = {
  src?: string; alt?: string; focus?: string          // photo hero (the default)
  background?: React.ReactNode; className?: string     // or a drawn hero (e.g. Sound Tech's wave)
  credit?: { author: string; licence: string; page: string }
  tag: string; title: React.ReactNode; aim: React.ReactNode; note?: React.ReactNode
}

export function CourseShell({
  scope, accent, accentLt, label, links = [], steps, step, onGo,
  canGo = i => i <= step + 1, isDone = i => i < step,
  headerExtra, navExtra, hero, heroKey, cover = step === 0, stripLeft, stripRight, footer, children,
}: {
  scope: string                         // the course's own CSS scope class, e.g. 'sexp'
  accent?: string; accentLt?: string    // the ONE thing a course may change
  label: string                         // "Spanish for Expats · Module 1"
  links?: ShellLink[]
  steps: ShellStep[]; step: number; onGo: (i: number) => void
  canGo?: (i: number) => boolean; isDone?: (i: number) => boolean
  headerExtra?: React.ReactNode         // between the top bar and the step nav (e.g. week switch)
  navExtra?: React.ReactNode            // appended to the step nav (e.g. "Improve my mistakes")
  hero: ShellHero; heroKey?: string; cover?: boolean
  stripLeft: React.ReactNode; stripRight?: React.ReactNode
  footer?: React.ReactNode
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
            <Link key={i} href={l.href} data-tour={l.tour} aria-label={l.ariaLabel} className={`ck-header__link${l.brass ? ' ck-header__link--brass' : ''}`}>
              {l.label}{l.badge ? <span className="ck-header__badge">{l.badge}</span> : null}
            </Link>
          ))}
        </div>
        {headerExtra}
        <nav className="ck-nav" aria-label="Lessons" data-tour="tabs">
          {steps.map((s, i) => {
            const done = isDone(i) && i !== step
            return (
              <button key={`${s.nav}${i}`} type="button" disabled={!canGo(i)} onClick={() => canGo(i) && onGo(i)}
                className={`ck-nav__btn${i === step ? ' is-active' : ''}${done ? ' is-done' : ''}`}>
                {done ? <span className="ck-nav__tick">✓</span> : <span className="ck-nav__num">{i + 1}</span>}
                {s.nav}
              </button>
            )
          })}
          {navExtra}
        </nav>
      </header>

      <section className={`ck-hero${cover ? ' ck-hero--cover' : ''}${hero.className ? ` ${hero.className}` : ''}`} key={heroKey ?? `hero-${step}`}>
        {hero.background}
        {hero.src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="ck-hero__img" src={hero.src} alt={hero.alt ?? ''} style={hero.focus ? { objectPosition: hero.focus } : undefined} />
        )}
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
        <div className="ck-step" key={heroKey ? `step-${heroKey}` : `step-${step}`}>{children}</div>
      </main>
      {footer && <footer className="ck-foot">{footer}</footer>}
    </div>
  )
}

// A nav-row link that sits after the step buttons (e.g. "Improve my mistakes" with a count).
export function NavLink({ href, badge, tour, children }: { href: string; badge?: number; tour?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="ck-nav__link" data-tour={tour}>
      {children}{badge ? <span className="ck-nav__badge">{badge}</span> : null}
    </Link>
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

// ───────── Deck: one item at a time, big, instant feedback ─────────
// The replacement for the "worksheet list" (10 numbered sentences with tiny chips).
// choice: pick an option card. A blank written as ___ in `q` is highlighted and filled on success.
// gap: type the answer (or tap a bank word when `bank` is given). Two misses reveal the answer.
export type DeckItem =
  | { id: string; kind: 'choice'; q: string; options: string[]; answer: number; icons?: (React.ReactNode | undefined)[]; gloss?: string; after?: React.ReactNode; audio?: string }
  | { id: string; kind: 'gap'; before: string; after?: string; answers: string[]; bank?: string[]; gloss?: string }

const BLANK_RE = /_{3,}/
export const normAnswer = (s: string) => s.toLowerCase().replace(/[.,;:!?"']+$/g, '').replace(/\s+/g, ' ').trim()

export function Deck({
  items, onAnswer, onDone, onRestart, listen, glossLabel = 'Show translation', endTitle = 'Done', endSub, endExtra, resetKey,
}: {
  items: DeckItem[]
  onAnswer?: (item: DeckItem, ok: boolean, firstTry: boolean, chosen: string) => void
  onDone?: (firsts: number, total: number) => void
  onRestart?: () => void                   // "Practise again" pressed (e.g. stop recording scores)
  listen?: (text: string) => void          // renders ▶ on option cards
  glossLabel?: string
  endTitle?: React.ReactNode; endSub?: React.ReactNode; endExtra?: React.ReactNode
  resetKey?: unknown                       // change it to start again from item 1
}) {
  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [done, setDone] = useState<null | { first: boolean; revealed: boolean }>(null)
  const [typed, setTyped] = useState('')
  const [results, setResults] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)
  const [showGloss, setShowGloss] = useState(false)
  const [shake, setShake] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const total = items.length
  const it = items[Math.min(idx, total - 1)]
  const hasGloss = items.some(i => i.gloss)

  function reset() { setIdx(0); setWrong([]); setDone(null); setTyped(''); setResults([]); setFinished(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reset() }, [resetKey])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function advance(nextResults: boolean[]) {
    if (idx + 1 >= total) { setFinished(true); onDone?.(nextResults.filter(Boolean).length, total); return }
    setIdx(idx + 1); setWrong([]); setDone(null); setTyped('')
  }
  function attempt(chosen: string, ok: boolean) {
    if (done) return
    const firstTry = wrong.length === 0
    onAnswer?.(it, ok, firstTry, chosen)
    if (ok) {
      const next = [...results, firstTry]
      setResults(next); setDone({ first: firstTry, revealed: false })
      timer.current = setTimeout(() => advance(next), firstTry ? 950 : 1400)
      return
    }
    const w = [...wrong, chosen]
    setWrong(w); setShake(true); setTimeout(() => setShake(false), 450)
    if (it.kind === 'gap' && w.length >= 2) {
      const next = [...results, false]
      setResults(next); setDone({ first: false, revealed: true })
    }
  }

  const answerText = it.kind === 'choice' ? it.options[it.answer] : it.answers[0]
  function blank(filled: boolean) {
    return <span className={`ck-blank${filled ? ' is-filled' : ''}`}>{filled ? answerText : <span className="ck-blank__dots">…</span>}</span>
  }
  function question() {
    if (it.kind === 'gap') return <>{it.before} {blank(!!done)}{it.after ? ` ${it.after}` : ''}</>
    if (!BLANK_RE.test(it.q)) return <>{it.q}</>
    const parts = it.q.split(BLANK_RE)
    return <>{parts.map((p, i) => <React.Fragment key={i}>{p}{i < parts.length - 1 && blank(!!done)}</React.Fragment>)}</>
  }

  if (finished) {
    const firsts = results.filter(Boolean).length
    return (
      <ResultSummary score={firsts} max={total} title={endTitle} sub={endSub ?? (firsts === total ? 'All of them first time.' : 'The ones you missed are saved to revise.')}>
        <div className="ck-row" style={{ justifyContent: 'center' }}>
          <Btn variant="ghost" onClick={() => { reset(); onRestart?.() }}>↻ Practise again</Btn>
          {endExtra}
        </div>
      </ResultSummary>
    )
  }

  const bank = it.kind === 'gap' ? it.bank : undefined
  return (
    <div className="ck-deck">
      <div className="ck-grid__head">
        <Dots states={items.map((_, i) => (i < results.length ? (results[i] ? 'ok' : 'bad') : null))} now={idx} count={`${idx + 1} / ${total}`} />
        {hasGloss && (
          <label className="ck-switch"><input type="checkbox" checked={showGloss} onChange={e => setShowGloss(e.target.checked)} /> {glossLabel}</label>
        )}
      </div>
      <div className={`ck-card ck-deck__card${shake ? ' is-shake' : ''}`} key={it.id}>
        <p className="ck-deck__q">{question()}</p>
        {showGloss && it.gloss && <p className="ck-deck__gloss">{it.gloss}</p>}
        {it.kind === 'choice' && it.audio && <audio className="ck-deck__audio" controls preload="none" src={it.audio} />}

        {!done && it.kind === 'choice' && (
          <ChoiceGrid cols={it.options.length <= 2 || it.options.join('').length > 60 ? 2 : 2}>
            {it.options.map((o, i) => (
              <OptionCard key={`${it.id}-${i}`} text={o} icon={it.icons?.[i]} state={wrong.includes(String(i)) ? 'wrong' : 'idle'}
                onPick={() => attempt(String(i), i === it.answer)} onPlay={listen ? () => listen(o) : undefined} />
            ))}
          </ChoiceGrid>
        )}
        {!done && it.kind === 'gap' && bank && (
          <ChoiceGrid>
            {bank.map(w => (
              <OptionCard key={w} text={w} state={wrong.includes(normAnswer(w)) ? 'wrong' : 'idle'}
                onPick={() => attempt(normAnswer(w), it.answers.map(normAnswer).includes(normAnswer(w)))} onPlay={listen ? () => listen(w) : undefined} />
            ))}
          </ChoiceGrid>
        )}
        {!done && it.kind === 'gap' && !bank && (
          <input className="ck-deck__input" value={typed} autoFocus autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label="Your answer"
            placeholder="Type it here"
            onChange={e => { const v = e.target.value; setTyped(v); if (it.answers.map(normAnswer).includes(normAnswer(v))) attempt(normAnswer(v), true) }}
            onKeyDown={e => { if (e.key === 'Enter' && typed.trim() && !wrong.includes(normAnswer(typed))) attempt(normAnswer(typed), it.answers.map(normAnswer).includes(normAnswer(typed))) }} />
        )}
        {!done && wrong.length > 0 && <Feedback kind="wrong" text={it.kind === 'gap' ? 'Not quite — try once more.' : 'Not that one — try again.'} />}
        {done && (
          <Feedback kind={done.revealed ? 'wrong' : done.first ? 'win' : 'quiet'} n={idx}
            text={done.revealed ? <>The answer is <strong>{answerText}</strong>.</> : undefined} revise={!done.first} />
        )}
        {done && it.kind === 'choice' && it.after && <p className="ck-deck__after">{it.after}</p>}
        {done?.revealed && <div className="ck-row"><Btn variant="accent" onClick={() => advance(results)}>Next →</Btn></div>}
      </div>
    </div>
  )
}

// ───────── Btn ─────────
export function Btn({ variant, sm, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'accent' | 'ghost'; sm?: boolean }) {
  return <button type="button" className={`ck-btn${variant ? ` ck-btn--${variant}` : ''}${sm ? ' ck-btn--sm' : ''} ${className}`} {...rest} />
}
