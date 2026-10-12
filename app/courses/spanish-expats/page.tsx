'use client'

import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { useProgress } from '@/lib/courses/useProgress'
import { recordAnswer, markActive, type Progress } from '@/lib/courses/progress'
import {
  COURSE_ID, MODULE_ID,
  VOCAB_M1, PHRASES_M1, PODER_QS, DIALOGUE_M1, DIALOGUE_QS, DIALOGUE_SPOTS,
  LEVEL_QS, getLevelLabel,
  normaliseSE, checkAnswerSE,
  VOCAB_ITEMS_SE, PHRASE_ITEMS_SE,
  MATCH_QS, MATCH_OPTIONS,
  type PoderItem,
} from '@/lib/courses/spanishExpats'
import { photoSE, type PhotoKeySE } from '@/lib/courses/photosExpats'
import { VOCAB_PHOTOS, CLUE_POPUPS, type CoursePhoto } from '@/lib/courses/spanishExpatsPhotos'
import MiExpediente from './MiExpediente'
import SpeakingStudio from '../b1-unit-1/SpeakingStudio'
import DialogueReader, { type ReaderLine } from '@/components/speaking/DialogueReader'
import { SPEAKING_ES } from '@/lib/courses/speakingLang'
import WritingStep from './WritingStep'
import { shortHashSE } from '@/lib/courses/spanishExpats'
import { Icon, type IconName } from './icons'
import { FormGuideButton } from './FormGuide'
import { FORM_FOR } from '@/lib/courses/spanishExpatsForms'
import {
  DOCS, NATIONALITIES, PURPOSES, REALITY, GOTCHAS, GESTOR, RUTA_LAST_VERIFIED,
  routeFor, docsFor,
  type Nationality, type Purpose, type DocId, type DocCard, type DocImage, type Route,
} from '@/lib/courses/spanishExpatsRuta'

// ─── Step metadata ─────────────────────────────────────────────────────────────

const ACCENT_DEFAULT = '#C4694A'

type StepMeta = {
  nav: string; tag: string; title: string; aim: string; accent: string; photo: PhotoKeySE
}
const STEPS: StepMeta[] = [
  { nav: 'Inicio', tag: 'Módulo 1', title: 'El primer mes', aim: 'What to expect in your first month in Spain — and the Spanish to handle it.', accent: '#C4694A', photo: 'ayuntamiento' },
  { nav: 'Tu ruta', tag: 'Antes de empezar', title: 'Tu ruta: los papeles', aim: 'Which documents you need, in what order, what they cost and how long they take — for your situation.', accent: '#7a3f2a', photo: 'plaza-reina' },
  { nav: 'Vocabulario', tag: 'Lección A', title: 'Los documentos esenciales', aim: '12 terms you will need before your first week is out. Type each one from memory.', accent: '#9B4F35', photo: 'plaza-ayuntamiento' },
  { nav: 'Frases', tag: 'Lección B', title: 'En la oficina', aim: '8 key phrases for any government office — the ones that will actually save you.', accent: '#1D4E89', photo: 'ayuntamiento' },
  { nav: 'Emparejar', tag: 'Lección C', title: '¿Cuál es la frase?', aim: 'Drag the right phrase onto each situation. 6 real office scenarios.', accent: '#5a9a2c', photo: 'plaza-reina' },
  { nav: 'Gramática', tag: 'Lección D', title: 'Poder + infinitivo', aim: 'One structure covers half your bureaucracy Spanish: "Can you…?" "Can I…?"', accent: '#E8B84B', photo: 'plaza-ayuntamiento' },
  { nav: 'Diálogo', tag: 'Lección E', title: 'En la comisaría', aim: 'Follow Sarah through her NIE appointment, answer four questions, then read her part out loud.', accent: '#9B4F35', photo: 'plaza-reina' },
  { nav: 'Hablar', tag: 'Lección F', title: 'A practicar', aim: 'No script now: say it your own way, see every fix, then say it again.', accent: '#1D4E89', photo: 'ayuntamiento' },
  { nav: 'Escribir', tag: 'Lección G', title: 'Por escrito', aim: 'Write a short message you could really send this week. It comes back corrected and ready to copy.', accent: '#5a9a2c', photo: 'plaza-ayuntamiento' },
  { nav: 'Resultado', tag: 'Módulo 1', title: '¿Qué tal?', aim: 'Your scores across the module, and what to work on next.', accent: '#C4694A', photo: 'plaza-reina' },
]
// step: 0=welcome, 1=ruta, 2=vocab, 3=phrases, 4=match, 5=grammar, 6=dialogue (+ read aloud), 7=speaking, 8=writing, 9=result

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Clue text where chosen words open a pop-up with a related real image.
function ClueText({ id, text }: { id: string; text: string }) {
  const [pop, setPop] = useState<CoursePhoto | null>(null)
  const pops = CLUE_POPUPS[id] ?? []
  const parts: (string | { phrase: string; photo: CoursePhoto })[] = [text]
  for (const p of pops) {
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (typeof part !== 'string') continue
      const at = part.indexOf(p.phrase)
      if (at < 0) continue
      parts.splice(i, 1, part.slice(0, at), p, part.slice(at + p.phrase.length))
      break
    }
  }
  return (
    <>
      {parts.map((part, i) => typeof part === 'string'
        ? <span key={i}>{part}</span>
        : <button key={i} type="button" className="clue-pop" onClick={() => setPop(part.photo)}>{part.phrase}</button>)}
      {pop && createPortal(
        <div className="sexp" style={{ minHeight: 0, background: 'none' }}>
          <div className="ruta-zoom" onClick={() => setPop(null)} role="dialog" aria-label={pop.alt}>
            <figure onClick={e => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pop.src} alt={pop.alt} />
              <figcaption>{pop.caption} <a href={pop.creditUrl} target="_blank" rel="noopener noreferrer">{pop.credit}</a></figcaption>
              <button className="btn btn--ghost" onClick={() => setPop(null)}>Close</button>
            </figure>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

function PhotoCreditSE({ k }: { k: PhotoKeySE }) {
  const p = photoSE(k)
  return (
    <a className="photo-credit" href={p.page} target="_blank" rel="noopener noreferrer">
      Photo: {p.author} · {p.licence}
    </a>
  )
}

function pct(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

// ─── Level check component ─────────────────────────────────────────────────────

function LevelCheck({ onDone }: { onDone: (score: number) => void }) {
  const [qi, setQi] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const current = LEVEL_QS[qi]

  function choose(pts: number) {
    const next = [...answers, pts]
    if (qi + 1 < LEVEL_QS.length) {
      setAnswers(next)
      setQi(qi + 1)
    } else {
      const total = next.reduce((a, b) => a + b, 0)
      onDone(total)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct(qi, LEVEL_QS.length)}%` }} />
        </div>
        <p style={{ fontSize: '.8rem', color: '#aaa', marginBottom: '1rem' }}>
          Question {qi + 1} of {LEVEL_QS.length}
        </p>
        <p style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.2rem' }}>
          {current.q}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {current.options.map((opt, i) => (
          <button
            key={i}
            className="mcq-opt"
            onClick={() => choose(opt.points)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Vocab drill ───────────────────────────────────────────────────────────────

function VocabDrill({ onDone, updateProgress }: {
  onDone: (score: number) => void
  updateProgress: (fn: (p: Progress) => Progress) => void
}) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'right' | 'close' | 'wrong'>('idle')
  const [showReveal, setShowReveal] = useState(false)
  const [score, setScore] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const item = VOCAB_M1[idx]
  const total = VOCAB_M1.length
  const done = idx >= total

  function submit(value = input) {
    if (status !== 'idle' || !value.trim()) return
    const result = checkAnswerSE(value, item.answer)
    setStatus(result)
    const clean = result === 'right' || result === 'close'
    if (clean) setScore(s => s + 1)
    const itemId = VOCAB_ITEMS_SE[idx].id
    updateProgress(p => recordAnswer(p, itemId, clean))
    if (result === 'right') {
      setTimeout(() => advance(), 1300)
    } else {
      setShowReveal(true)
    }
  }

  function advance() {
    if (idx + 1 >= total) {
      onDone(score + (status === 'right' || status === 'close' ? 0 : 0))
      return
    }
    setIdx(i => i + 1)
    setInput('')
    setStatus('idle')
    setShowReveal(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  if (done) return null

  return (
    <div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct(idx, total)}%` }} />
      </div>
      <div className="vocab-card">
        {VOCAB_PHOTOS[item.id] ? (
          <figure className="vocab-photo">
            <div className="vocab-photo__frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={VOCAB_PHOTOS[item.id].src} alt={VOCAB_PHOTOS[item.id].alt} />
              <span className="vocab-photo__icon" title="Somerset icon"><Icon name={item.icon} size={52} /></span>
            </div>
            <figcaption>
              {status !== 'idle' && <>{VOCAB_PHOTOS[item.id].caption} </>}
              <a href={VOCAB_PHOTOS[item.id].creditUrl} target="_blank" rel="noopener noreferrer">{VOCAB_PHOTOS[item.id].credit}</a>
            </figcaption>
          </figure>
        ) : (
          <span className="vocab-emoji"><Icon name={item.icon} size={64} /></span>
        )}
        <p className="vocab-clue"><ClueText id={item.id} text={item.clue} /></p>
        <p className="vocab-note">{item.note}</p>
        <p className="vocab-counter">{idx + 1} / {total}</p>
        {status === 'right' ? <p className="type-win">{item.answer}</p> : (
        <input
          ref={inputRef}
          className={`vocab-input${status === 'idle' ? '' : ` vocab-input--${status}`}`}
          value={input}
          onChange={e => {
            if (status !== 'idle') return
            const v = e.target.value
            setInput(v)
            // Right answers are accepted the moment they are typed: no button, no Enter.
            if (checkAnswerSE(v, item.answer) === 'right') submit(v)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (status === 'idle') submit()
              else advance()
            }
          }}
          placeholder="Type the Spanish term…"
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        )}
        {status !== 'idle' && (
          <>
            {showReveal && (
              <p className="vocab-reveal">{item.answer}</p>
            )}
            <p className="vocab-iconkey"><Icon name={item.icon} size={28} /> <span>In this course, this icon means <strong>{item.answer}</strong>.</span></p>
            <p className={`vocab-feedback vocab-feedback--${status}`}>
              {status === 'right' ? <><Icon name="correct" size={20} className="ico-inline" /> Perfecto</> : status === 'close' ? <><Icon name="almost" size={20} className="ico-inline" /> Close — check the spelling</> : <><Icon name="wrong" size={20} className="ico-inline" /> Not quite</>}
            </p>
          </>
        )}
        <div style={{ display: 'flex', gap: '.7rem', justifyContent: 'center', marginTop: '1rem' }}>
          {status === 'idle' ? (
            <>
              <button className="btn btn--terra" onClick={() => submit()}>Check →</button>
              <button className="btn btn--ghost" onClick={advance}>Skip</button>
            </>
          ) : (
            <button className="btn btn--terra" onClick={advance}>Next →</button>
          )}
        </div>
      </div>
      <div className="score-strip" style={{ justifyContent: 'center' }}>
        <div className="score-pill">
          <span className="score-num">{score}</span>
          <span className="score-label">Correct</span>
        </div>
        <div className="score-pill">
          <span className="score-num">{idx}</span>
          <span className="score-label">Done</span>
        </div>
        <div className="score-pill">
          <span className="score-num">{total - idx}</span>
          <span className="score-label">Left</span>
        </div>
      </div>
    </div>
  )
}

// ─── VocabDrillWrapper: handles "all done" state ───────────────────────────────

function VocabDrillWrapper({ savedScore, onDone, updateProgress }: {
  savedScore?: number
  onDone: (score: number) => void
  updateProgress: (fn: (p: Progress) => Progress) => void
}) {
  const [drillDone, setDrillDone] = useState(false)
  const [finalScore, setFinalScore] = useState(savedScore ?? 0)

  function handleDone(score: number) {
    setFinalScore(score)
    setDrillDone(true)
  }

  if (drillDone || savedScore !== undefined) {
    const pctScore = pct(finalScore, VOCAB_M1.length)
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', marginBottom: '.5rem' }}>
          <Icon name={pctScore >= 80 ? 'celebrate' : pctScore >= 50 ? 'well-done' : 'almost'} size={56} />
        </p>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', marginBottom: '.4rem' }}>
          {finalScore} / {VOCAB_M1.length} correct
        </p>
        <p style={{ color: '#666', fontSize: '.9rem', marginBottom: '1.2rem' }}>
          {pctScore >= 80
            ? 'Excellent recall. These terms will stick.'
            : pctScore >= 50
            ? 'Good start — the ones you missed will come up again in Repaso.'
            : 'Don\'t worry — the spaced repetition system will bring these back.'}
        </p>
        <button className="btn btn--terra" onClick={() => onDone(finalScore)}>
          Next: Frases clave →
        </button>
      </div>
    )
  }

  return (
    <VocabDrill
      onDone={handleDone}
      updateProgress={updateProgress}
    />
  )
}

// ─── Phrase drill ──────────────────────────────────────────────────────────────

function PhraseDrill({ onDone, updateProgress }: {
  onDone: (score: number) => void
  updateProgress: (fn: (p: Progress) => Progress) => void
}) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'right' | 'close' | 'wrong'>('idle')
  const [showReveal, setShowReveal] = useState(false)
  const [score, setScore] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const item = PHRASES_M1[idx]
  const total = PHRASES_M1.length

  function submit(value = input) {
    if (status !== 'idle' || !value.trim()) return
    const result = checkAnswerSE(value, item.answer)
    setStatus(result)
    const clean = result === 'right' || result === 'close'
    if (clean) setScore(s => s + 1)
    const itemId = PHRASE_ITEMS_SE[idx].id
    updateProgress(p => recordAnswer(p, itemId, clean))
    if (result === 'right') setTimeout(() => advance(), 1300)
    else setShowReveal(true)
  }

  function advance() {
    if (idx + 1 >= total) {
      onDone(score)
      return
    }
    setIdx(i => i + 1)
    setInput('')
    setStatus('idle')
    setShowReveal(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function playAudio() {
    const audio = new Audio(`/courses/spanish-expats/audio/${item.id}.mp3`)
    audio.play().catch(() => { /* file not yet generated — fail silently */ })
  }

  return (
    <div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct(idx, total)}%` }} />
      </div>
      <div className="vocab-card">
        <p className="phrase-context">{item.context}</p>
        <p className="phrase-translation">{item.translation}</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '.6rem' }}>
          <button type="button" className="btn btn--ghost audio-btn" onClick={playAudio} aria-label="Listen to phrase">
            <Icon name="sound" size={20} className="ico-inline" /> Listen
          </button>
        </div>
        <p className="vocab-counter">{idx + 1} / {total}</p>
        {status === 'right' ? <p className="type-win">{item.answer}</p> : (
        <input
          ref={inputRef}
          className={`vocab-input${status === 'idle' ? '' : ` vocab-input--${status}`}`}
          value={input}
          onChange={e => {
            if (status !== 'idle') return
            const v = e.target.value
            setInput(v)
            // Right answers are accepted the moment they are typed: no button, no Enter.
            if (checkAnswerSE(v, item.answer) === 'right') submit(v)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (status === 'idle') submit()
              else advance()
            }
          }}
          placeholder="Type the Spanish phrase…"
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        )}
        {status !== 'idle' && (
          <>
            {showReveal && <p className="vocab-reveal">{item.answer}</p>}
            <p className={`vocab-feedback vocab-feedback--${status}`}>
              {status === 'right' ? <><Icon name="correct" size={20} className="ico-inline" /> Perfecto</> : status === 'close' ? <><Icon name="almost" size={20} className="ico-inline" /> Close — check accents or spelling</> : <><Icon name="wrong" size={20} className="ico-inline" /> Not quite — check the answer above</>}
            </p>
          </>
        )}
        <div style={{ display: 'flex', gap: '.7rem', justifyContent: 'center', marginTop: '1rem' }}>
          {status === 'idle' ? (
            <>
              <button className="btn btn--terra" onClick={() => submit()}>Comprobar →</button>
              <button className="btn btn--ghost" onClick={advance}>Skip</button>
            </>
          ) : (
            <button className="btn btn--terra" onClick={advance}>Next →</button>
          )}
        </div>
      </div>
      <div className="score-strip" style={{ justifyContent: 'center' }}>
        <div className="score-pill">
          <span className="score-num">{score}</span>
          <span className="score-label">Correct</span>
        </div>
        <div className="score-pill">
          <span className="score-num">{total - idx}</span>
          <span className="score-label">Left</span>
        </div>
      </div>
    </div>
  )
}

// ─── Match drag activity ───────────────────────────────────────────────────────
// Drag a phrase chip onto the situation card that matches it.
// Scoring: 1pt first try, 0.5pt second, 0pt after 3 misses (auto-reveal).

// What each phrase does, as a Somerset icon (by PHRASES_M1 id).
const PHRASE_ICON: Record<string, IconName> = {
  'ph-cita': 'nie', 'ph-ayuda': 'hand', 'ph-repite': 'sound', 'ph-entiendo': 'confused',
  'ph-documentos': 'register', 'ph-tarda': 'stopwatch', 'ph-pagar': 'tie', 'ph-justificante': 'documents',
}

function MatchDragSE({ onDone, updateProgress }: {
  onDone: (score: number) => void
  updateProgress: (fn: (p: Progress) => Progress) => void
}) {
  const bag = useMemo(() => [...MATCH_OPTIONS].sort(() => Math.random() - 0.5), [])
  const [idx, setIdx] = useState(0)
  const [status, setStatus] = useState<'asking' | 'right' | 'revealed'>('asking')
  const [tried, setTried] = useState<string[]>([])
  const [results, setResults] = useState<{ id: string; points: number }[]>([])
  const [shake, setShake] = useState(0)
  const [refused, setRefused] = useState('')
  const [drag, setDrag] = useState<{ phrase: string; x: number; y: number } | null>(null)
  const [over, setOver] = useState(false)
  const [showEn, setShowEn] = useState(false)
  const target = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const press = useRef<{ phrase: string; x: number; y: number; moved: boolean } | null>(null)

  const q = MATCH_QS[idx]
  const matchId = `m1:match:${q.id}`

  function finishCard(points: number) {
    setResults(r => [...r, { id: matchId, points }])
    updateProgress(p => recordAnswer(p, matchId, points === 1))
  }

  function attempt(phrase: string): boolean {
    if (status !== 'asking' || tried.includes(phrase)) return false
    if (phrase === q.phrase) {
      setStatus('right')
      finishCard(tried.length === 0 ? 1 : tried.length === 1 ? 0.5 : 0)
      return true
    }
    const t = [...tried, phrase]
    setTried(t); setRefused(phrase); setShake(n => n + 1)
    if (t.length >= 3) { setStatus('revealed'); finishCard(0) }
    return false
  }

  function advance() {
    if (idx + 1 >= MATCH_QS.length) {
      const total = results.reduce((s, r) => s + r.points, 0)
      onDone(total)
      return
    }
    setIdx(idx + 1); setStatus('asking'); setTried([]); setRefused('')
  }

  useEffect(() => {
    if (status === 'right') { const t = setTimeout(advance, 1400); return () => clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, idx])

  function overTarget(x: number, y: number) {
    const r = target.current?.getBoundingClientRect()
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  }

  function onDown(e: React.PointerEvent<HTMLButtonElement>, phrase: string) {
    if (status !== 'asking' || tried.includes(phrase)) return
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ok */ }
    press.current = { phrase, x: e.clientX, y: e.clientY, moved: false }
  }
  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    const p = press.current
    if (!p) return
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6) p.moved = true
    if (!p.moved) return
    setDrag({ phrase: p.phrase, x: e.clientX, y: e.clientY })
    const isOver = overTarget(e.clientX, e.clientY)
    setOver(isOver)
    if (isOver) { attempt(p.phrase); press.current = null; setDrag(null); setOver(false) }
  }
  function onUp() {
    const p = press.current
    press.current = null; setDrag(null); setOver(false)
    if (p && !p.moved) attempt(p.phrase)
  }

  const lastPoints = results[results.length - 1]?.points

  return (
    <div className="md" ref={root}>
      <div className="deck-top">
        <div className="deck-dots">
          {MATCH_QS.map((item, i) => {
            const r = results[i]
            const cls = r ? (r.points === 1 ? 'd-ok' : r.points > 0 ? 'd-mid' : 'd-bad') : i === idx ? 'd-now' : ''
            return <span key={item.id} className={`deck-dot ${cls}`} />
          })}
        </div>
        <span className="deck-count">{idx + 1} / {MATCH_QS.length}</span>
      </div>

      <div
        ref={target}
        key={`c${idx}-${shake}`}
        className={`md-card${over ? ' over' : ''}${shake && status === 'asking' && refused ? ' refuse' : ''}`}
      >
        <div className="md-scene">
          <span className="md-scene__who"><Icon name="government" size={30} /> At the office · situation {idx + 1}</span>
          <p className="md-situation">{q.situation}</p>
        </div>
        <div className={`md-slot${status !== 'asking' ? ' md-slot--filled' : ''}`}>
          {status === 'asking'
            ? <span className="md-slot-empty">Drag the right phrase here — or tap it below</span>
            : <span className="md-slot-phrase">{q.phrase}</span>
          }
        </div>
        {refused && status === 'asking' && (
          <p className="md-nope" key={`n${shake}`}><Icon name="wrong" size={18} className="ico-inline" /> not that one</p>
        )}
        {status === 'right' && (
          <p className="deck-verdict right" style={{ textAlign: 'center', marginTop: '.75rem' }}>
            <Icon name="correct" size={18} className="ico-inline" /> {lastPoints === 1 ? 'First time!' : 'Got it'}
          </p>
        )}
        {status === 'revealed' && (
          <div style={{ textAlign: 'center', marginTop: '.75rem' }}>
            <button type="button" className="btn btn--terra" onClick={advance}>Next →</button>
          </div>
        )}
      </div>

      <div className="pd-bag">
        <div className="md-bag-head">
          <div className="pd-bag-label"><Icon name="speak" size={18} className="ico-inline" /> Your phrases <small>Which one would you say? Tap ▶ to hear it.</small></div>
          <label className="md-en-toggle"><input type="checkbox" checked={showEn} onChange={e => setShowEn(e.target.checked)} /> Show English</label>
        </div>
        <div className="md-grid">
          {bag.map(phrase => {
            const used = tried.includes(phrase) || (status !== 'asking' && phrase === q.phrase)
            const isRight = status !== 'asking' && phrase === q.phrase
            const ph = PHRASES_M1.find(p => p.answer === phrase)
            return (
              <div key={phrase} className={`md-pcard${used ? ' used' : ''}${isRight ? ' right' : ''}${drag?.phrase === phrase ? ' lifting' : ''}`}>
                <button type="button" className="md-pcard__main"
                  disabled={used || status !== 'asking'}
                  onPointerDown={e => onDown(e, phrase)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={() => { press.current = null; setDrag(null); setOver(false) }}
                  onClick={e => { if (e.detail === 0) attempt(phrase) }}
                >
                  <Icon name={ph ? PHRASE_ICON[ph.id] ?? 'speak' : 'speak'} size={40} />
                  <span className="md-pcard__text">
                    <span className="md-pcard__es">{phrase}</span>
                    {(showEn || used) && ph && <span className="md-pcard__en">{ph.translation}</span>}
                  </span>
                </button>
                {ph && (
                  <button type="button" className="md-pcard__play" aria-label={`Listen: ${phrase}`}
                    onClick={() => { new Audio(`/courses/spanish-expats/audio/${ph.id}.mp3`).play().catch(() => {}) }}>▶</button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {drag && createPortal(
        <div className={`md-ghost${over ? ' over' : ''}`} style={{ left: drag.x, top: drag.y }}>
          {drag.phrase}
        </div>,
        (root.current?.closest('.sexp') as HTMLElement | null) ?? document.body
      )}
    </div>
  )
}

// ─── Recorded audio (ElevenLabs) — no synthetic voices in this course ─────────

const AUDIO = '/courses/spanish-expats/audio'
let clipPlayer: HTMLAudioElement | null = null
function playClip(url: string) {
  try {
    clipPlayer?.pause()
    clipPlayer = new Audio(url)
    void clipPlayer.play().catch(() => {})
  } catch { /* no audio on this device */ }
}
const phraseAudio = (id: string) => `${AUDIO}/${id}.mp3`
// Dialogue lines recorded one file per line; narrator lines have none.
const dialogueAudio = (i: number) => DIALOGUE_M1[i].who === 'Narrator' ? undefined : `${AUDIO}/dialogue/dl-${String(i).padStart(2, '0')}.mp3`

// ─── Explain video (grammar step) ─────────────────────────────────────────────

function ExplainVideoSE() {
  const [open, setOpen] = useState(false)
  const YOUTUBE_ID = 'CoKEawEVVTY' // "How to Use Spanish Verb PODER" — Hola Spanish
  const KEY_POINTS = [
    'Poder conjugates: puedo (I can), puede (you/he/she can), pueden (they/you all can)',
    'Always followed by an infinitive: ¿Puedo pagar? = Can I pay?',
    'At the office you need two forms: puedo (can I?) and puede (can you?)',
    'Negative: No puedo abrir el archivo = I can\'t open the file',
  ]
  return (
    <div className="gx-video">
      {open ? (
        <div className="sexp-ev-frame-wrap gx-video__frame">
          <iframe
            className="sexp-ev-frame"
            src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1&autoplay=1`}
            title="How to use poder in Spanish"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <button type="button" className="gx-video__thumb" onClick={() => setOpen(true)} aria-label="Play the video: how to use poder">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${YOUTUBE_ID}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="gx-video__play">▶</span>
          <span className="gx-video__label"><Icon name="video" size={18} className="ico-inline" /> Poder explained · 8 min</span>
        </button>
      )}
      <details className="sexp-ev-notes gx-video__notes">
        <summary>Key points from the video</summary>
        <ol>{KEY_POINTS.map((pt, i) => <li key={i}>{pt}</li>)}</ol>
      </details>
    </div>
  )
}

// ─── Grammar: poder + infinitive ──────────────────────────────────────────────

const PODER_FORMS: { form: string; who: string; en: string; ex: string; icon: IconName; audio: string }[] = [
  { form: 'puedo', who: 'yo', en: 'I can · Can I…?', ex: '¿Puedo pagar con tarjeta?', icon: 'money', audio: phraseAudio('ph-pagar') },
  { form: 'puede', who: 'usted · él · ella', en: 'You can · Can you…? (polite)', ex: '¿Me puede ayudar?', icon: 'hand', audio: phraseAudio('ph-ayuda') },
  { form: 'pueden', who: 'ustedes · ellos', en: 'You all / they can', ex: '¿Pueden atenderme mañana?', icon: 'calendar', audio: `${AUDIO}/m1/g-pueden.mp3` },
]
// The full sentence of each gap-fill, recorded.
const PODER_AUDIO: Record<string, string> = {
  'pod-1': phraseAudio('ph-ayuda'), 'pod-2': phraseAudio('ph-pagar'), 'pod-3': `${AUDIO}/m1/g-repetir.mp3`,
  'pod-4': `${AUDIO}/m1/g-archivo.mp3`, 'pod-5': `${AUDIO}/m1/g-pueden.mp3`,
}
const PODER_ICON: Record<string, IconName> = {
  'pod-1': 'hand', 'pod-2': 'money', 'pod-3': 'sound', 'pod-4': 'device', 'pod-5': 'calendar',
}
const CHEERS = ['¡Sí!', '¡Perfecto!', '¡Exacto!', '¡Muy bien!', '¡Eso es!']

function PoderExercise({ onDone, updateProgress }: {
  onDone: (score: number) => void
  updateProgress: (fn: (p: Progress) => Progress) => void
}) {
  // Instant feedback: each gap is judged as soon as it is right (typing) or when you leave it / press Enter.
  type PS = { value: string; done: boolean; first: boolean; kind: 'right' | 'close' | null; wrongs: number }
  const [items, setItems] = useState<PS[]>(PODER_QS.map(() => ({ value: '', done: false, first: false, kind: null, wrongs: 0 })))
  const [shake, setShake] = useState<number | null>(null)

  function judge(i: number, value: string, final: boolean) {
    const it = items[i]
    if (it.done) return
    const r = checkAnswerSE(value, PODER_QS[i].answer)
    let next: PS = { ...it, value }
    if (r === 'right' || (final && r === 'close')) {
      next = { value, done: true, first: it.wrongs === 0, kind: r, wrongs: it.wrongs }
      updateProgress(p => recordAnswer(p, `m1:poder:${PODER_QS[i].id}`, it.wrongs === 0))
    } else if (final && value.trim()) {
      next = { ...it, value, wrongs: it.wrongs + 1 }
      setShake(i); setTimeout(() => setShake(null), 450)
    }
    setItems(prev => prev.map((x, j) => (j === i ? next : x)))
  }

  const doneCount = items.filter(it => it.done).length
  const allDone = doneCount === PODER_QS.length
  const score = items.filter(it => it.done && it.first).length

  return (
    <div className="gx">
      <div className="card">
        <div className="lesson-header">
          <div className="lesson-tag" style={{ background: '#E8B84B', color: '#fff' }}>Gramática</div>
          <div>
            <div className="lesson-title">Poder + infinitivo</div>
            <div className="lesson-aim">One verb, three forms, and you can ask for almost anything at the counter. Tap a form to hear it.</div>
          </div>
        </div>

        <div className="gx-top">
          <div className="gx-pattern">
            <div className="gx-eq" aria-label="poder plus infinitive">
              <span className="gx-block gx-block--poder"><b>poder</b><small>puedo · puede · pueden</small></span>
              <span className="gx-op">+</span>
              <span className="gx-block gx-block--inf"><b>infinitivo</b><small>pagar · repetir · abrir</small></span>
              <span className="gx-op">=</span>
              <span className="gx-block gx-block--out"><b>¿Puedo pagar?</b><small>Can I pay?</small></span>
            </div>

            <div className="gx-forms">
              {PODER_FORMS.map(f => (
                <button key={f.form} type="button" className="gx-form" onClick={() => playClip(f.audio)}>
                  <span className="gx-form__icon"><Icon name={f.icon} size={40} /></span>
                  <span className="gx-form__es">{f.form}</span>
                  <span className="gx-form__who">{f.who}</span>
                  <span className="gx-form__ex"><span className="gx-play" aria-hidden>▶</span>{f.ex}</span>
                  <span className="gx-form__en">{f.en}</span>
                </button>
              ))}
            </div>

            <div className="gx-rules">
              <p><span className="gx-rule-tag">No</span> goes in front: <em>No puedo abrir el archivo.</em></p>
              <p><span className="gx-rule-tag">me</span> goes before puede: <em>¿Me puede ayudar?</em></p>
            </div>
          </div>
          <ExplainVideoSE />
        </div>
      </div>

      <div className="card">
        <div className="gx-head">
          <div>
            <p className="gx-kicker">Your turn</p>
            <p className="gx-head__title">Say it with poder</p>
            <p className="gx-head__sub">Type <b>poder + verb</b> into each gap. It turns green the moment it&apos;s right.</p>
          </div>
          <div className="gx-score">
            <div className="deck-dots">
              {items.map((it, i) => (
                <span key={i} className={`deck-dot ${it.done ? (it.first ? 'd-ok' : 'd-mid') : ''}`} />
              ))}
            </div>
            <span className="deck-count">{doneCount} / {PODER_QS.length}</span>
          </div>
        </div>

        <div className="gx-grid">
          {PODER_QS.map((q, i) => {
            const it = items[i]
            const win = it.done && it.first
            return (
              <article key={q.id} className={`gx-item${it.done ? ' gx-item--done' : ''}${win ? ' gx-item--win' : ''}${shake === i ? ' poder-shake' : ''}`}>
                <div className="gx-item__top">
                  <span className="gx-num">{i + 1}</span>
                  <span className="gx-item__icon"><Icon name={PODER_ICON[q.id] ?? 'speak'} size={34} /></span>
                  <div className="gx-item__text">
                    <p className="gx-ctx">{q.context}</p>
                    <p className="gx-en">&ldquo;{q.translation}&rdquo;</p>
                  </div>
                </div>
                <div className="gx-sentence">
                  {q.pre}
                  {it.done
                    ? <b className={`poder-done${it.kind === 'close' ? ' poder-done--close' : ''}`}>{q.answer.trim()}</b>
                    : (
                      <input
                        className={`gx-gap${it.wrongs ? ' gx-gap--bad' : ''}`}
                        value={it.value}
                        onChange={e => judge(i, e.target.value, false)}
                        onBlur={e => judge(i, e.target.value, true)}
                        onKeyDown={e => { if (e.key === 'Enter') judge(i, (e.target as HTMLInputElement).value, true) }}
                        placeholder="poder + verbo"
                        aria-label={`Gap ${i + 1}: ${q.translation}`}
                        autoCapitalize="none" autoCorrect="off" spellCheck={false}
                      />
                    )}
                  {q.post}
                </div>
                {it.wrongs > 0 && !it.done && <p className="gx-hint">Not yet. Check the form of poder, then the verb.</p>}
                {it.done && (
                  <div className="gx-result">
                    {win && <span className="poder-cheer gx-cheer">✓ {CHEERS[i % CHEERS.length]}</span>}
                    {!win && it.kind !== 'close' && <span className="poder-revise">Got it. We&apos;ll bring this one back later.</span>}
                    {it.kind === 'close' && <span className="poder-revise">Nearly: check the spelling of <b>{q.answer.trim()}</b></span>}
                    <button type="button" className="gx-listen" onClick={() => playClip(PODER_AUDIO[q.id])}>▶ Hear it</button>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {allDone && (
          <div className="gx-done">
            <Icon name={score >= 4 ? 'celebrate' : 'well-done'} size={48} />
            <div>
              <p className="gx-done__score">{score} / {PODER_QS.length} first time</p>
              <p className="gx-done__sub">{score >= 4 ? 'You can ask for things at any counter now.' : 'The ones you missed will come back in Repaso.'}</p>
            </div>
            <button className="btn btn--terra" onClick={() => onDone(score)}>Next: Diálogo →</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Dialogue + comprehension ──────────────────────────────────────────────────
// A chat you step through line by line. Phrases from the module light up as they
// appear; the questions unlock at the end, and each right answer lights the line that proves it.

function markSpots(text: string, idx: number, spotted: boolean) {
  const spots = DIALOGUE_SPOTS.filter(s => s.line === idx)
  if (!spotted || !spots.length) return text
  const out: ReactNode[] = [text]
  spots.forEach((s, k) => {
    for (let i = 0; i < out.length; i++) {
      const part = out[i]
      if (typeof part !== 'string') continue
      const at = part.indexOf(s.text)
      if (at < 0) continue
      out.splice(i, 1, part.slice(0, at), <mark key={k} className="dl2-spot">{s.text}</mark>, part.slice(at + s.text.length))
      break
    }
  })
  return out
}

const FIRST_LINES = 3

// Step 3 of Diálogo: the scaffolded speaking stage. Same script, now the student speaks it.
// (Hablar is the unscaffolded stage: no script.)
function ReadAloudStage({ student, onNext }: { student: { name: string; code: string } | null; onNext: () => void }) {
  return (
    <div className="card ra-card">
      <div className="ra-head">
        <span className="ra-step">3</span>
        <div>
          <p className="gx-kicker">Now you speak it</p>
          <p className="gx-head__title">Learn Sarah&apos;s part by heart</p>
          <p className="gx-head__sub">Five rounds. First you read every word; then your words disappear little by little; in the last round there is no text at all, you just hear the clerks and answer.</p>
        </div>
      </div>
      <DialogueReader lines={READER_LINES} lang={SPEAKING_ES} student={student} defaultRole="Sarah" place="Comisaría de Policía · Valencia" />
      <div className="sp-foot">
        <span className="sp-foot__note">Next comes speaking without a script.</span>
        <button className="btn btn--terra" onClick={onNext}>Next: A hablar →</button>
      </div>
    </div>
  )
}

function DialogueLesson({ student, onDone }: { student: { name: string; code: string } | null; onDone: (score: number) => void }) {
  const total = DIALOGUE_M1.length
  const [shown, setShown] = useState(FIRST_LINES)
  const [qIdx, setQIdx] = useState(0)
  const [tried, setTried] = useState<string[]>([])
  const [right, setRight] = useState<string | null>(null)
  const [firsts, setFirsts] = useState<boolean[]>([])
  const [flash, setFlash] = useState<number | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const allShown = shown >= total
  const done = firsts.length === DIALOGUE_QS.length
  const score = firsts.filter(Boolean).length
  const spotted = DIALOGUE_SPOTS.filter(s => s.line < shown).length

  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [shown])

  function showLine(i: number) {
    const el = document.getElementById(`dl2-${i}`)
    const box = chatRef.current
    if (el && box) box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' })
  }

  function answer(opt: string) {
    const q = DIALOGUE_QS[qIdx]
    if (right || tried.includes(opt)) return
    if (opt !== q.a) { setTried(t => [...t, opt]); return }
    setRight(opt); setFlash(q.line); showLine(q.line)
    setTimeout(() => {
      setFirsts(f => [...f, tried.length === 0])
      setRight(null); setTried([]); setFlash(null)
      setQIdx(i => i + 1)
    }, 1700)
  }

  const q = DIALOGUE_QS[Math.min(qIdx, DIALOGUE_QS.length - 1)]

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <div className="lesson-header">
          <div className="lesson-tag" style={{ background: '#9B4F35' }}>Diálogo</div>
          <div>
            <div className="lesson-title">En la comisaría</div>
            <div className="lesson-aim">1 · Step through Sarah&apos;s NIE appointment line by line. 2 · Answer four questions. 3 · Read Sarah&apos;s part out loud.</div>
          </div>
        </div>

        <div className="dl2">
          <div className="dl2-phone">
            <div className="dl2-bar">
              <span className="dl2-bar__icon"><Icon name="government" size={30} /></span>
              <span className="dl2-bar__text"><strong>Comisaría de Policía</strong><small>Valencia · martes, 10:00</small></span>
              <span className="dl2-bar__count">{Math.min(shown, total)} / {total}</span>
            </div>
            <div className="dl2-chat" ref={chatRef} aria-live="polite">
              {DIALOGUE_M1.slice(0, shown).map((l, i) => {
                const lit = flash === i ? ' dl2-flash' : ''
                if (l.who === 'Narrator') {
                  return <p key={i} id={`dl2-${i}`} className={`dl2-scene${lit}`}><Icon name={i === 0 ? 'calendar' : 'clock'} size={18} className="ico-inline" /> {l.line}</p>
                }
                const you = l.who === 'You'
                return (
                  <div key={i} id={`dl2-${i}`} className={`dl2-msg ${you ? 'dl2-msg--you' : 'dl2-msg--them'}${lit}`}>
                    {!you && <span className="dl2-avatar" aria-hidden>F</span>}
                    <div className="dl2-bubble">
                      <span className="dl2-who">{you ? 'Sarah (you)' : l.who}</span>
                      <span className="dl2-text">{markSpots(l.line, i, true)}</span>
                    </div>
                    <button type="button" className="dl2-play" aria-label="Listen to this line" onClick={() => { const a = dialogueAudio(i); if (a) playClip(a) }}>▶</button>
                  </div>
                )
              })}
            </div>
            <div className="dl2-controls">
              {!allShown ? (
                <>
                  <button type="button" className="btn btn--terra dl2-next" onClick={() => setShown(s => Math.min(total, s + 1))}>Next line ▸</button>
                  <button type="button" className="dl2-all" onClick={() => setShown(total)}>Show it all</button>
                </>
              ) : (
                <span className="dl2-end"><Icon name="correct" size={18} className="ico-inline" /> Conversation complete</span>
              )}
            </div>
          </div>

          <div className="dl2-side">
            <div className="dl2-card">
              <p className="dl2-card__head">Phrases you know <span>{spotted} / {DIALOGUE_SPOTS.length}</span></p>
              <ul className="dl2-spots">
                {DIALOGUE_SPOTS.map(s => {
                  const on = s.line < shown
                  return (
                    <li key={s.text} className={on ? 'on' : ''}>
                      <span className="dl2-spots__es">{on ? s.text : '• • •'}</span>
                      <span className="dl2-spots__en">{s.en}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="dl2-card dl2-quiz">
              {!allShown ? (
                <div className="dl2-locked">
                  <Icon name="lock" size={40} />
                  <p><strong>{DIALOGUE_QS.length} questions</strong> unlock when you reach the end of the conversation.</p>
                </div>
              ) : !done ? (
                <>
                  <div className="deck-top">
                    <div className="deck-dots">
                      {DIALOGUE_QS.map((_, i) => (
                        <span key={i} className={`deck-dot ${i < firsts.length ? (firsts[i] ? 'd-ok' : 'd-mid') : i === qIdx ? 'd-now' : ''}`} />
                      ))}
                    </div>
                    <span className="deck-count">{qIdx + 1} / {DIALOGUE_QS.length}</span>
                  </div>
                  <p className="dl2-q" key={qIdx}>{q.q}</p>
                  <div className="dl2-opts">
                    {q.options.map(opt => {
                      const bad = tried.includes(opt)
                      const ok = right === opt
                      return (
                        <button key={opt} type="button" disabled={bad || !!right}
                          className={`mcq-opt dl2-opt${ok ? ' mcq-opt--right' : ''}${bad ? ' mcq-opt--wrong dl2-opt--bad' : ''}`}
                          onClick={() => answer(opt)}>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  <p className="dl2-fb" aria-live="polite">
                    {right
                      ? <><Icon name="correct" size={18} className="ico-inline" /> {tried.length === 0 ? '¡Exacto! Look, it lights up in the chat.' : 'That\'s it. It\'s lit up in the chat.'}</>
                      : tried.length ? 'Not that one. Look back at the chat and try again.' : ''}
                  </p>
                </>
              ) : (
                <div className="dl2-done">
                  <Icon name={score >= 3 ? 'celebrate' : 'well-done'} size={52} />
                  <p className="gx-done__score">{score} / {DIALOGUE_QS.length} first time</p>
                  <p className="dl2-fb">Step 3 is below: read it aloud ↓</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="vlc-note" style={{ marginTop: '1.2rem', marginBottom: 0 }}>
          The NIE appointment is at a police station (comisaría), not the Oficina de Extranjería. You cannot walk in: book the cita previa online first, and check for new slots every day.
        </div>
      </div>
      {done && <ReadAloudStage student={student} onNext={() => onDone(score)} />}
    </div>
  )
}

// ─── Speaking step ─────────────────────────────────────────────────────────────
// The same speaking engine as the PET course, set to Spanish: speak, see every fix in
// your own words, practise the words it misheard, hear a smoother version, say it again.

const SPEAK_PROMPTS = [
  'At the comisaría: greet the clerk, say you have an appointment and at what time, say why you have come, and ask them to repeat something.',
  'A new neighbour asks about you: say why you moved to Valencia, how long you have been here and what paperwork has been hardest.',
  'You phone the Ayuntamiento: say who you are, that you want to register on the padrón, and ask what documents you need.',
]

const SPEAK_FRAMES = [
  'Buenos días. Tengo una cita a las diez.',
  'Me llamo Sarah y vengo a pedir el NIE.',
  'Llevo tres meses en Valencia.',
  'Vine a Valencia por trabajo.',
  'Llamo para preguntar por el padrón.',
]

// The dialogue for reading aloud: Sarah is "You" in the data.
const READER_LINES: ReaderLine[] = DIALOGUE_M1.map((l, i) => ({ who: l.who === 'You' ? 'Sarah' : l.who, text: l.line, audio: dialogueAudio(i) }))


function SpeakingStep({ student, onDone, updateProgress }: { student: { name: string; code: string } | null; onDone: () => void; updateProgress: (fn: (p: Progress) => Progress) => void }) {
  const [spoke, setSpoke] = useState(false)
  const office = PHRASES_M1.map(p => p.answer)
  return (
    <div className="card sp-card">
      <div className="lesson-header">
        <div className="lesson-tag" style={{ background: '#1D4E89' }}>A hablar</div>
        <div>
          <div className="lesson-title">A practicar</div>
          <div className="lesson-aim">No script this time. Pick a situation and say it your own way. You&apos;ll see every fix inside your own words, then say it again.</div>
        </div>
      </div>

      <ol className="sp-steps">
        <li><span>1</span>Pick a situation</li>
        <li><span>2</span>Speak for 30 to 90 seconds</li>
        <li><span>3</span>See your fixes and a smoother version</li>
        <li><span>4</span>Say it again</li>
      </ol>

      <SpeakingStudio
        lang={SPEAKING_ES}
        questions={SPEAK_PROMPTS}
        student={student}
        onSpoken={() => setSpoke(true)}
        onFixes={fixes => updateProgress(p => {
          // Spoken mistakes go into Repaso too, next to the written ones.
          const personal = { ...(p.personal ?? {}) }
          let next: Progress = { ...p, personal }
          for (const f of fixes) {
            const [pre, ...rest] = f.sentence.split(f.original)
            const id = 'own:s:' + shortHashSE(f.sentence + '|' + f.original)
            personal[id] = { pre, seg: f.original, post: rest.join(f.original), fix: f.fix, why: f.why, at: Date.now() }
            next = recordAnswer(next, id, false)
          }
          return next
        })}
        onSecondTry={() => setSpoke(true)}
        aside={
          <div className="sp-aside">
            <div className="section-head">Useful Spanish · tap to hear</div>
            <p className="sp-group">At the counter</p>
            <div className="sp-chips">
              {office.map(t => (
                <button key={t} type="button" className="sp-chip" onClick={() => { const ph = PHRASES_M1.find(p => p.answer === t); if (ph) playClip(phraseAudio(ph.id)) }}><span aria-hidden>▶</span>{t}</button>
              ))}
            </div>
            <p className="sp-group">About you</p>
            <div className="sp-chips">
              {SPEAK_FRAMES.map((t, k) => (
                <button key={t} type="button" className="sp-chip sp-chip--frame" onClick={() => playClip(`${AUDIO}/m1/fr-${k + 1}.mp3`)}><span aria-hidden>▶</span>{t}</button>
              ))}
            </div>
            <p className="sp-tip"><Icon name="tip" size={20} className="ico-inline" /> Short and clear beats long and broken. One idea per sentence.</p>
          </div>
        }
      />

      <div className="sp-foot">
        <span className="sp-foot__note">{spoke ? '¡Bien hecho! Say it again as often as you like.' : 'No microphone right now? Practise out loud anyway, then carry on.'}</span>
        <button className="btn btn--terra" onClick={onDone}>{spoke ? 'See my results →' : 'I practised out loud →'}</button>
      </div>
    </div>
  )
}

// ─── Result step ───────────────────────────────────────────────────────────────

function ResultStep({
  scores, levelScore,
}: {
  scores: { vocab: number; phrase: number; match: number; grammar: number; dialogue: number }
  levelScore: number | null
}) {
  const level = levelScore !== null ? getLevelLabel(levelScore) : null
  const total = scores.vocab + scores.phrase + scores.match + scores.grammar + scores.dialogue
  const maxTotal = VOCAB_M1.length + PHRASES_M1.length + MATCH_QS.length + PODER_QS.length + DIALOGUE_QS.length

  return (
    <div>
      <div className="result-banner">
        <div className="result-trophy"><Icon name="celebrate" size={72} /></div>
        <h2 className="result-title">Módulo 1 completo</h2>
        <p className="result-sub">
          {total} / {maxTotal} correct across all sections
        </p>
      </div>

      {level && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <p className="label">Your level</p>
          <span className={`level-badge level-badge--${level.level.toLowerCase()}`}>
            {level.level} — {level.label}
          </span>
          <p style={{ fontSize: '.9rem', color: '#555' }}>{level.note}</p>
        </div>
      )}

      <div className="card">
        <p className="label" style={{ marginBottom: '1rem' }}>Section scores</p>
        <div className="score-strip">
          <div className="score-pill">
            <span className="score-num">{scores.vocab}/{VOCAB_M1.length}</span>
            <span className="score-label">Vocabulario</span>
          </div>
          <div className="score-pill">
            <span className="score-num">{scores.phrase}/{PHRASES_M1.length}</span>
            <span className="score-label">Frases</span>
          </div>
          <div className="score-pill">
            <span className="score-num">{Math.round(scores.match)}/{MATCH_QS.length}</span>
            <span className="score-label">Emparejar</span>
          </div>
          <div className="score-pill">
            <span className="score-num">{scores.grammar}/{PODER_QS.length}</span>
            <span className="score-label">Gramática</span>
          </div>
          <div className="score-pill">
            <span className="score-num">{scores.dialogue}/{DIALOGUE_QS.length}</span>
            <span className="score-label">Diálogo</span>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="label">What next?</p>
        <ul className="goal-list">
          <li><Link href="/courses/spanish-expats/repaso">Repaso</Link>: your own mistakes from writing and speaking, plus the words that are due. Come back tomorrow and they will be waiting.</li>
          <li>Module 2: Healthcare — tarjeta SIP, CAP, booking appointments (Valencia-specific)</li>
          <li>Module 3: Daily life — bars, shops, the menú del día, the Valencia register</li>
        </ul>
        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/student" className="btn btn--terra" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            ← Back to My Area
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

// ─── Tu ruta: personalised paperwork map ──────────────────────────────────────

const BEFORE_LABEL: Record<DocCard['before'], string> = {
  yes: 'Can do before you leave',
  partly: 'Partly before you leave',
  no: 'In Spain only',
}

function DocCardView({ doc, open, onToggle, onZoom }: {
  doc: DocCard; open: boolean; onToggle: () => void; onZoom: (img: DocImage) => void
}) {
  return (
    <div className={`ruta-doc${open ? ' ruta-doc--open' : ''}`} id={`doc-${doc.id}`}>
      <button className="ruta-doc__head" onClick={onToggle} aria-expanded={open}>
        <span className="ruta-doc__icon"><Icon name={doc.id} size={36} /></span>
        <span className="ruta-doc__names">
          <span className="ruta-doc__es">{doc.es}</span>
          <span className="ruta-doc__en">{doc.en}</span>
        </span>
        <span className={`ruta-badge ruta-badge--${doc.before}`}>{BEFORE_LABEL[doc.before]}</span>
        <span className="ruta-doc__chev" aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="ruta-doc__body">
          {doc.images && (
            <div className="ruta-imgs">
              {doc.images.map(img => (
                <figure key={img.src} className="ruta-fig">
                  <button className="ruta-fig__btn" onClick={() => onZoom(img)} aria-label={`Enlarge: ${img.alt}`}>
                    <img src={img.src} alt={img.alt} loading="lazy" />
                  </button>
                  <figcaption>
                    {img.caption}{' '}
                    <a href={img.creditUrl} target="_blank" rel="noopener noreferrer" className="ruta-credit">{img.credit}</a>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
          {FORM_FOR[doc.id] && <FormGuideButton id={FORM_FOR[doc.id]!} />}
          <p className="ruta-what">{doc.what}</p>
          <dl className="ruta-facts">
            <div><dt>Who needs it</dt><dd>{doc.who}</dd></div>
            <div><dt>Before you leave?</dt><dd>{doc.beforeNote}</dd></div>
            <div><dt>Where</dt><dd>{doc.where}</dd></div>
            <div><dt>Cost</dt><dd>{doc.cost}</dd></div>
            <div><dt>How long</dt><dd>{doc.time}</dd></div>
            {doc.needs && <div><dt>You need first</dt><dd>{doc.needs}</dd></div>}
            {doc.unlocks && <div><dt>It unlocks</dt><dd>{doc.unlocks}</dd></div>}
          </dl>
          <p className="label">Step by step</p>
          <ol className="ruta-steps">
            {doc.steps.map(s => <li key={s}>{s}</li>)}
          </ol>
          {doc.watch && <div className="ruta-watch"><strong>Watch out:</strong> {doc.watch}</div>}
          {doc.booking?.links && (
            <>
              <p className="label">Official links</p>
              <div className="exp-links" style={{ marginBottom: '1rem' }}>
                {doc.booking.links.map(l => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                ))}
              </div>
            </>
          )}
          <p className="ruta-sources">
            Official source{doc.sources.length > 1 ? 's' : ''}:{' '}
            {doc.sources.map((s, i) => (
              <span key={s.url}>{i > 0 && ' · '}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></span>
            ))}
          </p>
        </div>
      )}
    </div>
  )
}

function RutaStep({ onDone }: { onDone: () => void }) {
  const [nat, setNat] = useState<Nationality | null>(null)
  const [purpose, setPurpose] = useState<Purpose | null>(null)
  const [open, setOpen] = useState<DocId | null>(null)
  const [showOthers, setShowOthers] = useState(false)
  const [zoom, setZoom] = useState<DocImage | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sexp:m1:ruta') || 'null')
      if (saved?.nat) setNat(saved.nat)
      if (saved?.purpose) setPurpose(saved.purpose)
    } catch { /* fresh */ }
  }, [])

  useEffect(() => {
    if (!nat) return
    try { localStorage.setItem('sexp:m1:ruta', JSON.stringify({ nat, purpose })) } catch { /* ignore */ }
  }, [nat, purpose])

  const ready = nat === 'uk-old' || (nat !== null && purpose !== null)
  const route = ready ? routeFor(nat!, purpose ?? 'retire') : null
  const mine = route ? docsFor(route) : []
  const others = (Object.keys(DOCS) as DocId[]).filter(id => !mine.includes(id))

  function jump(id: DocId) {
    setOpen(id)
    if (!mine.includes(id)) setShowOthers(true)
    setTimeout(() => document.getElementById(`doc-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  const phases: { key: keyof Pick<Route, 'before' | 'week' | 'month'>; es: string; en: string }[] = [
    { key: 'before', es: 'Antes de salir', en: 'Before you leave' },
    { key: 'week', es: 'Primera semana', en: 'First week' },
    { key: 'month', es: 'Primer mes', en: 'First month' },
  ]

  return (
    <div className="ruta">
      <div className="card">
        <div className="lesson-header">
          <div className="lesson-tag">Tu ruta</div>
          <div>
            <div className="lesson-title">Your paperwork route</div>
            <div className="lesson-aim">Which documents you need, in what order, what they cost and how long they take — for your situation. Then we learn the words.</div>
          </div>
        </div>
        <div className="ruta-rules">
          <div className="ruta-rule"><span>1</span><p><strong>Padrón first.</strong> Registering your address at the town hall unlocks almost everything else.</p></div>
          <div className="ruta-rule"><span>2</span><p><strong>The NIE is a number</strong>, not residence. Having one doesn&apos;t mean you can live here.</p></div>
          <div className="ruta-rule"><span>3</span><p><strong>Two systems.</strong> Police for cards and numbers; the Oficina de Extranjería for permits.</p></div>
        </div>
      </div>

      <div className="card">
        <p className="label">1 · Where is your passport from?</p>
        <div className="ruta-pick ruta-pick--4">
          {NATIONALITIES.map(n => (
            <button key={n.id} className={`ruta-opt${nat === n.id ? ' ruta-opt--on' : ''}`} onClick={() => { setNat(n.id); setOpen(null) }}>
              <strong>{n.label}</strong><span>{n.sub}</span>
            </button>
          ))}
        </div>
        {nat && nat !== 'uk-old' && (
          <>
            <p className="label" style={{ marginTop: '1.4rem' }}>2 · Why are you moving?</p>
            <div className="ruta-pick ruta-pick--5">
              {PURPOSES.map(p => (
                <button key={p.id} className={`ruta-opt${purpose === p.id ? ' ruta-opt--on' : ''}`} onClick={() => { setPurpose(p.id); setOpen(null) }}>
                  <span className="ruta-opt__icon"><Icon name={p.id} size={30} /></span><strong>{p.label}</strong>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {route && (
        <div className="card">
          <p className="label">Your route</p>
          {route.note && <p className="ruta-note">{route.note}</p>}
          <div className="ruta-timeline">
            {phases.map(ph => route[ph.key].length > 0 && (
              <div key={ph.key} className="ruta-phase">
                <div className="ruta-phase__head"><span className="ruta-phase__es">{ph.es}</span><span className="ruta-phase__en">{ph.en}</span></div>
                <ul>
                  {route[ph.key].map(item => (
                    <li key={item.text} className={item.deadline ? 'ruta-item--deadline' : undefined}>
                      <span>{item.deadline && <span className="ruta-clock" title="Deadline"><Icon name="clock" size={14} variant="linea" /></span>}{item.text}</span>
                      {item.doc && (
                        <button className="ruta-link" onClick={() => jump(item.doc!)}>{DOCS[item.doc].es} →</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {route && nat && <MiExpediente route={route} nat={nat} purpose={purpose} onRead={jump} />}

      <div className="card">
        <p className="label">{route ? 'Your documents' : 'The essential documents'}</p>
        {!route && <p className="ruta-note">Choose your situation above to see only the documents you need. Here are all of them.</p>}
        {(route ? mine : (Object.keys(DOCS) as DocId[])).map(id => (
          <DocCardView key={id} doc={DOCS[id]} open={open === id} onToggle={() => setOpen(open === id ? null : id)} onZoom={setZoom} />
        ))}
        {route && others.length > 0 && (
          <>
            <button className="btn btn--ghost" style={{ marginTop: '1rem' }} onClick={() => setShowOthers(v => !v)}>
              {showOthers ? 'Hide' : 'Show'} the other {others.length} documents (not on your route)
            </button>
            {showOthers && others.map(id => (
              <DocCardView key={id} doc={DOCS[id]} open={open === id} onToggle={() => setOpen(open === id ? null : id)} onZoom={setZoom} />
            ))}
          </>
        )}
      </div>

      <div className="card">
        <p className="label">Valencia reality check</p>
        <div className="two-col">
          {REALITY.systems.map(s => (
            <div key={s.name} className="ruta-system">
              <strong>{s.name}</strong>
              <p className="ruta-system__does">{s.does}</p>
              <p>{s.how}</p>
            </div>
          ))}
        </div>
        <p className="ruta-small">Official backlog at the Valencia Oficina de Extranjería on {REALITY.backlogDate} — applications being reviewed were submitted around:</p>
        <ul className="ruta-backlog">
          {REALITY.backlog.map(b => <li key={b.what}><span>{b.what}</span><strong>{b.upTo}</strong></li>)}
        </ul>
        <ul className="ruta-tips">
          {REALITY.tips.map(t => <li key={t}>{t}</li>)}
        </ul>
        <p className="label" style={{ marginTop: '1.2rem' }}>Official links you&apos;ll use again and again</p>
        <div className="exp-links">
          {REALITY.links.map(l => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
          ))}
        </div>
        <p className="ruta-sources"><a href={REALITY.source.url} target="_blank" rel="noopener noreferrer">{REALITY.source.label}</a></p>
      </div>

      <div className="two-col">
        <div className="card">
          <p className="label">Classic mistakes</p>
          <ul className="ruta-gotchas">{GOTCHAS.map(g => <li key={g}>{g}</li>)}</ul>
        </div>
        <div className="card">
          <p className="label">Do I need a gestor?</p>
          <p className="ruta-small"><strong>Worth it for:</strong></p>
          <ul className="ruta-tips">{GESTOR.worth.map(g => <li key={g}>{g}</li>)}</ul>
          <p className="ruta-small"><strong>Do it yourself:</strong> {GESTOR.notWorth.join(' · ')}</p>
          <p className="ruta-small">{GESTOR.limits}</p>
          <p className="ruta-small">{GESTOR.price}</p>
        </div>
      </div>

      <div className="ruta-disclaimer">
        Last verified {RUTA_LAST_VERIFIED}. This is practical guidance, not legal advice — fees and procedures change. Always check the official source linked on each card, or ask a gestor.
      </div>

      <div style={{ textAlign: 'center', margin: '1.5rem 0 .5rem' }}>
        <button className="btn btn--terra" style={{ fontSize: '1rem', padding: '.8rem 2rem' }} onClick={onDone}>
          Now learn the words → Vocabulario
        </button>
      </div>

      {zoom && createPortal(
        <div className="sexp" style={{ minHeight: 0, background: 'none' }}>
          <div className="ruta-zoom" onClick={() => setZoom(null)} role="dialog" aria-label={zoom.alt}>
            <figure onClick={e => e.stopPropagation()}>
              <img src={zoom.src} alt={zoom.alt} />
              <figcaption>{zoom.caption} <a href={zoom.creditUrl} target="_blank" rel="noopener noreferrer">{zoom.credit}</a></figcaption>
              <button className="btn btn--ghost" onClick={() => setZoom(null)}>Close</button>
            </figure>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

export default function SpanishExpatsPage() {
  const { progress, update, student } = useProgress(COURSE_ID)

  const [step, setStep] = useState(0)

  // Level check
  const [levelDone, setLevelDone] = useState(false)
  const [levelScore, setLevelScore] = useState<number | null>(null)

  // Section scores
  const [vocabScore, setVocabScore] = useState<number | undefined>(undefined)
  const [phraseScore, setPhraseScore] = useState<number | undefined>(undefined)
  const [matchScore, setMatchScore] = useState<number | undefined>(undefined)
  const [grammarScore, setGrammarScore] = useState<number | undefined>(undefined)
  const [dialogueScore, setDialogueScore] = useState<number | undefined>(undefined)

  // Load level from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sexp:m1:level')
      if (saved) {
        const { score } = JSON.parse(saved)
        setLevelScore(score)
        setLevelDone(true)
      }
    } catch { /* fresh */ }
  }, [])

  function handleLevelDone(score: number) {
    setLevelScore(score)
    setLevelDone(true)
    try { localStorage.setItem('sexp:m1:level', JSON.stringify({ score, at: Date.now() })) } catch { /* ignore */ }
  }

  function goTo(s: number) {
    if (s <= step || s === step + 1) setStep(s)
  }

  const meta = STEPS[step]
  const accent = meta?.accent ?? ACCENT_DEFAULT

  const cssVars = `.sexp { --accent: ${accent}; --accent-lt: ${accent}22; }`

  return (
    <div className="sexp">
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />

      {/* Header */}
      <header className="site-header">
        <div className="site-header__top">
          <Link href="/" className="corner-link" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <SomersetLogo variant="white" />
          </Link>
          <span className="unit-label">Spanish for Expats · Module 1</span>
          <Link href="/courses/spanish-expats/repaso" className="corner-link">Repaso</Link>
          <Link href="/student" className="corner-link">My area</Link>
        </div>
        <nav className="lesson-nav" aria-label="Module lessons">
          {STEPS.map((s, i) => (
            <button
              key={s.nav}
              className={`nav-btn${step === i ? ' active' : ''}${i < step ? ' done' : ''}`}
              onClick={() => goTo(i)}
              disabled={i > step + 1}
            >
              <span className={i < step ? 'nav-tick' : 'nav-num'}>{i < step ? '✓' : i + 1}</span>
              {s.nav}
            </button>
          ))}
        </nav>
      </header>

      {/* Progress strip */}
      <div className="goals-strip">
        <div className="goals-inner">
          <div className="seg-bar">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`seg${i < step ? ' seg--done' : ''}${i === step ? ' seg--now' : ''}`}
              />
            ))}
          </div>
          <div className="goals-row">
            <span className="goal-text">
              <strong>Module 1</strong> — The First Month
            </span>
            <span className="goal-text">{step} / {STEPS.length - 1} sections done</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className={`hero${step === 0 ? ' hero--cover' : ''}`}>
        <img
          className="hero-img"
          src={photoSE(meta.photo).src}
          alt={photoSE(meta.photo).alt}
          style={{ objectPosition: photoSE(meta.photo).focus }}
        />
        <PhotoCreditSE k={meta.photo} />
        <div className="hero-overlay">
          <span className="hero-label">{meta.tag}</span>
          <h1 className="hero-title">{meta.title}</h1>
          <p className="hero-sub">{meta.aim}</p>
        </div>
      </div>

      {/* Content */}
      <main className="page-wrap">
        <div className="lesson" key={step}>

          {/* Step 0: Welcome + level check */}
          {step === 0 && (
            <div>
              <div className="two-col-60">
                <div>
                  <div className="intro-card" style={{ marginBottom: '1.5rem' }}>
                    <p className="dropcap-text">
                      <span className="dropcap">Y</span>
                      our first month in Spain is administrative chaos — and nobody warns you. Before you can open a bank account, get a SIM card, or access healthcare, you need to work your way through a maze of offices, forms, and websites that seem designed to test your patience before testing your Spanish.
                    </p>
                    <p className="intro-sub">
                      This module gives you the vocabulary and phrases to get through that first month with your dignity intact. It will not make the bureaucracy faster — nothing can — but it will make it survivable.
                    </p>
                    <ul className="goal-list">
                      <li>Your personal paperwork route: which documents, in what order, what they cost and how long they take</li>
                      <li>12 essential terms for documents and processes</li>
                      <li>8 key phrases for any government office</li>
                      <li>The <em>poder + infinitive</em> structure that covers half your bureaucracy Spanish</li>
                      <li>A real dialogue: Sarah gets her NIE in Valencia</li>
                      <li>Speaking practice that checks your Spanish and shows every fix</li>
                    </ul>
                  </div>

                  <div className="vlc-note">
                    Police appointments (NIE, TIE, EU certificate) are booked online and they are scarce — new slots appear daily, so check often and screenshot every attempt. Never pay anyone who &quot;sells&quot; an appointment.
                  </div>
                </div>

                <div>
                  {!levelDone ? (
                    <div>
                      <p className="label">Quick check — where are you starting from?</p>
                      <p style={{ fontSize: '.88rem', color: '#666', marginBottom: '1rem' }}>
                        5 questions, no wrong answers — helps us calibrate the module for you.
                      </p>
                      <LevelCheck onDone={handleLevelDone} />
                    </div>
                  ) : (
                    <div>
                      {levelScore !== null && (() => {
                        const lvl = getLevelLabel(levelScore)
                        return (
                          <div className="card" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '.82rem', color: '#aaa', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Your starting level</p>
                            <span className={`level-badge level-badge--${lvl.level.toLowerCase()}`} style={{ display: 'inline-flex', marginBottom: '.5rem' }}>
                              {lvl.level} · {lvl.label}
                            </span>
                            <p style={{ fontSize: '.88rem', color: '#555' }}>{lvl.note}</p>
                          </div>
                        )
                      })()}
                      <div style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn--terra"
                          style={{ fontSize: '1rem', padding: '.8rem 2rem' }}
                          onClick={() => setStep(1)}
                        >
                          Start Module 1 →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Tu ruta — paperwork map */}
          {step === 1 && <RutaStep onDone={() => setStep(2)} />}

          {/* Step 2: Vocabulary */}
          {step === 2 && (
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="lesson-header">
                  <div className="lesson-tag">Vocabulario</div>
                  <div>
                    <div className="lesson-title">Los documentos esenciales</div>
                    <div className="lesson-aim">You&apos;ve seen the documents — now make the words stick. Read the description and type the Spanish term from memory. Accents matter, but a near-miss counts as close.</div>
                  </div>
                </div>
              </div>
              <VocabDrillWrapper
                savedScore={vocabScore}
                onDone={(score) => { setVocabScore(score); setStep(3) }}
                updateProgress={update}
              />
            </div>
          )}

          {/* Step 2: Phrases */}
          {step === 3 && (
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="lesson-header">
                  <div className="lesson-tag" style={{ background: '#1D4E89' }}>Frases</div>
                  <div>
                    <div className="lesson-title">En la oficina</div>
                    <div className="lesson-aim">Each prompt shows you the context and the English meaning. Listen, then type the Spanish phrase.</div>
                  </div>
                </div>
                <div className="tip">
                  <strong>Tip:</strong> These phrases work in any government office, at the bank, at the clinic, or on the phone. Learn all 8 and you will always have something to say.
                </div>
              </div>
              {phraseScore !== undefined ? (
                <div className="card" style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', marginBottom: '.5rem' }}>
                    {phraseScore} / {PHRASES_M1.length} correct
                  </p>
                  <button className="btn btn--terra" onClick={() => setStep(4)}>Next: Emparejar →</button>
                </div>
              ) : (
                <PhraseDrill
                  onDone={(score) => { setPhraseScore(score); setStep(4) }}
                  updateProgress={update}
                />
              )}
            </div>
          )}

          {/* Step 3: Match drag */}
          {step === 4 && (
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="lesson-header">
                  <div className="lesson-tag" style={{ background: '#5a9a2c' }}>Emparejar</div>
                  <div>
                    <div className="lesson-title">¿Cuál es la frase?</div>
                    <div className="lesson-aim">Six situations, six phrases. Drag the right one onto each card — or tap it.</div>
                  </div>
                </div>
              </div>
              {matchScore !== undefined ? (
                <div className="card" style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', marginBottom: '.5rem' }}>
                    {Math.round(matchScore)} / {MATCH_QS.length} correct
                  </p>
                  <button className="btn btn--terra" onClick={() => setStep(5)}>Next: Gramática →</button>
                </div>
              ) : (
                <MatchDragSE
                  onDone={(score) => { setMatchScore(score); setStep(5) }}
                  updateProgress={update}
                />
              )}
            </div>
          )}

          {/* Step 4: Grammar */}
          {step === 5 && (
            grammarScore !== undefined ? (
              <div className="card" style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', marginBottom: '.5rem' }}>
                  {grammarScore} / {PODER_QS.length} correct
                </p>
                <button className="btn btn--terra" onClick={() => setStep(6)}>Next: Diálogo →</button>
              </div>
            ) : (
              <PoderExercise onDone={(score) => { setGrammarScore(score); setStep(6) }} updateProgress={update} />
            )
          )}

          {/* Step 5: Dialogue */}
          {step === 6 && (
            dialogueScore !== undefined ? (
              <div>
              <div className="card" style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', marginBottom: '.5rem' }}>
                  {dialogueScore} / {DIALOGUE_QS.length} correct
                </p>
              </div>
              <ReadAloudStage student={student} onNext={() => setStep(7)} />
              </div>
            ) : (
              <DialogueLesson student={student} onDone={(score) => { setDialogueScore(score); setStep(7) }} />
            )
          )}

          {/* Step 6: Speaking */}
          {step === 7 && (
            <SpeakingStep student={student} updateProgress={update} onDone={() => {
              update(p => markActive(p))
              setStep(8)
            }} />
          )}

          {/* Step 8: Writing */}
          {step === 8 && (
            <WritingStep student={student} savedText={progress.writing} updateProgress={update} onDone={() => setStep(9)} />
          )}

          {/* Step 9: Result */}
          {step === 9 && (
            <ResultStep
              scores={{
                vocab: vocabScore ?? 0,
                phrase: phraseScore ?? 0,
                match: matchScore ?? 0,
                grammar: grammarScore ?? 0,
                dialogue: dialogueScore ?? 0,
              }}
              levelScore={levelScore}
            />
          )}

        </div>
      </main>
    </div>
  )
}
