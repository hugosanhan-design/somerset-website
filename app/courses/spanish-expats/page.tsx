'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { useProgress } from '@/lib/courses/useProgress'
import { recordAnswer, markActive, type Progress } from '@/lib/courses/progress'
import {
  COURSE_ID, MODULE_ID,
  VOCAB_M1, PHRASES_M1, PODER_QS, DIALOGUE_M1, DIALOGUE_QS,
  LEVEL_QS, getLevelLabel,
  normaliseSE, checkAnswerSE,
  VOCAB_ITEMS_SE, PHRASE_ITEMS_SE,
  MATCH_QS, MATCH_OPTIONS,
  type PoderItem,
} from '@/lib/courses/spanishExpats'

// ─── Step metadata ─────────────────────────────────────────────────────────────

const ACCENT_DEFAULT = '#C4694A'

type StepMeta = {
  nav: string; tag: string; title: string; aim: string; accent: string
}
const STEPS: StepMeta[] = [
  { nav: 'Inicio', tag: 'Módulo 1', title: 'El primer mes', aim: 'What to expect in your first month in Spain — and the Spanish to handle it.', accent: '#C4694A' },
  { nav: 'Vocabulario', tag: 'Lección A', title: 'Los documentos esenciales', aim: '12 terms you will need before your first week is out. Type each one from memory.', accent: '#9B4F35' },
  { nav: 'Frases', tag: 'Lección B', title: 'En la oficina', aim: '8 key phrases for any government office — the ones that will actually save you.', accent: '#1D4E89' },
  { nav: 'Emparejar', tag: 'Lección C', title: '¿Cuál es la frase?', aim: 'Drag the right phrase onto each situation. 6 real office scenarios.', accent: '#5a9a2c' },
  { nav: 'Gramática', tag: 'Lección D', title: 'Poder + infinitivo', aim: 'One structure covers half your bureaucracy Spanish: "Can you…?" "Can I…?"', accent: '#E8B84B' },
  { nav: 'Diálogo', tag: 'Lección E', title: 'En la extranjería', aim: 'Follow Sarah through her NIE appointment in Valencia. Then answer four questions.', accent: '#9B4F35' },
  { nav: 'Hablar', tag: 'Lección F', title: 'A practicar', aim: 'Talk through your own situation out loud. Use the phrases from this module.', accent: '#1D4E89' },
  { nav: 'Resultado', tag: 'Módulo 1', title: '¿Qué tal?', aim: 'Your scores across the module, and what to work on next.', accent: '#C4694A' },
]
// step: 0=welcome, 1=vocab, 2=phrases, 3=match, 4=grammar, 5=dialogue, 6=speaking, 7=result

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

  function submit() {
    if (status !== 'idle' || !input.trim()) return
    const result = checkAnswerSE(input, item.answer)
    setStatus(result)
    const clean = result === 'right' || result === 'close'
    if (clean) setScore(s => s + 1)
    const itemId = VOCAB_ITEMS_SE[idx].id
    updateProgress(p => recordAnswer(p, itemId, clean))
    if (result === 'right') {
      setTimeout(() => advance(), 900)
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
        <span className="vocab-emoji">{item.emoji}</span>
        <p className="vocab-clue">{item.clue}</p>
        <p className="vocab-note">{item.note}</p>
        <p className="vocab-counter">{idx + 1} / {total}</p>
        <input
          ref={inputRef}
          className={`vocab-input${status === 'idle' ? '' : ` vocab-input--${status}`}`}
          value={input}
          onChange={e => { if (status === 'idle') setInput(e.target.value) }}
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
        {status !== 'idle' && (
          <>
            {showReveal && (
              <p className="vocab-reveal">{item.answer}</p>
            )}
            <p className={`vocab-feedback vocab-feedback--${status}`}>
              {status === 'right' ? '✓ Perfecto' : status === 'close' ? '~ Close — check the spelling' : '✗ Not quite'}
            </p>
          </>
        )}
        <div style={{ display: 'flex', gap: '.7rem', justifyContent: 'center', marginTop: '1rem' }}>
          {status === 'idle' ? (
            <>
              <button className="btn btn--terra" onClick={submit}>Check →</button>
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
          {pctScore >= 80 ? '🎉' : pctScore >= 50 ? '👍' : '💪'}
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

  function submit() {
    if (status !== 'idle' || !input.trim()) return
    const result = checkAnswerSE(input, item.answer)
    setStatus(result)
    const clean = result === 'right' || result === 'close'
    if (clean) setScore(s => s + 1)
    const itemId = PHRASE_ITEMS_SE[idx].id
    updateProgress(p => recordAnswer(p, itemId, clean))
    if (result === 'right') setTimeout(() => advance(), 900)
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
            🔊 Listen
          </button>
        </div>
        <p className="vocab-counter">{idx + 1} / {total}</p>
        <input
          ref={inputRef}
          className={`vocab-input${status === 'idle' ? '' : ` vocab-input--${status}`}`}
          value={input}
          onChange={e => { if (status === 'idle') setInput(e.target.value) }}
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
        {status !== 'idle' && (
          <>
            {showReveal && <p className="vocab-reveal">{item.answer}</p>}
            <p className={`vocab-feedback vocab-feedback--${status}`}>
              {status === 'right' ? '✓ Perfecto' : status === 'close' ? '~ Close — check accents or spelling' : '✗ Not quite — check the answer above'}
            </p>
          </>
        )}
        <div style={{ display: 'flex', gap: '.7rem', justifyContent: 'center', marginTop: '1rem' }}>
          {status === 'idle' ? (
            <>
              <button className="btn btn--terra" onClick={submit}>Comprobar →</button>
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
        <p className="md-situation">{q.situation}</p>
        <div className={`md-slot${status !== 'asking' ? ' md-slot--filled' : ''}`}>
          {status === 'asking'
            ? <span className="md-slot-empty">drag a phrase here</span>
            : <span className="md-slot-phrase">{q.phrase}</span>
          }
        </div>
        {refused && status === 'asking' && (
          <p className="md-nope" key={`n${shake}`}>✗ not that one</p>
        )}
        {status === 'right' && (
          <p className="deck-verdict right" style={{ textAlign: 'center', marginTop: '.75rem' }}>
            {lastPoints === 1 ? '✓ First time!' : '✓ Got it'}
          </p>
        )}
        {status === 'revealed' && (
          <div style={{ textAlign: 'center', marginTop: '.75rem' }}>
            <button type="button" className="btn btn--terra" onClick={advance}>Next →</button>
          </div>
        )}
      </div>

      <div className="pd-bag">
        <div className="pd-bag-label">🗣 Your phrases <small>Drag a phrase onto the situation, or tap it</small></div>
        <div className="md-chips">
          {bag.map(phrase => {
            const used = tried.includes(phrase) || (status !== 'asking' && phrase === q.phrase)
            const isRight = status !== 'asking' && phrase === q.phrase
            return (
              <button key={phrase} type="button"
                className={`md-chip${used ? ' used' : ''}${isRight ? ' right' : ''}${drag?.phrase === phrase ? ' lifting' : ''}`}
                disabled={used || status !== 'asking'}
                onPointerDown={e => onDown(e, phrase)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={() => { press.current = null; setDrag(null); setOver(false) }}
                onClick={e => { if (e.detail === 0) attempt(phrase) }}
              >
                {phrase}
              </button>
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

// ─── Explain video (inline, grammar step) ─────────────────────────────────────

function ExplainVideoSE() {
  const [open, setOpen] = useState(false)
  const YOUTUBE_ID = 'CoKEawEVVTY' // "How to Use Spanish Verb PODER" — Hola Spanish (47k views)
  const KEY_POINTS = [
    'Poder conjugates: puedo (I can), puede (you/he/she can), pueden (they/you can)',
    'Always followed by an infinitive: ¿Puedo pagar? = Can I pay?',
    'At the office you need two forms: puedo (can I?) and puede (can you?)',
    'Negative: No puedo abrir el archivo = I can\'t open the file',
  ]

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {open ? (
        <div className="sexp-ev-wrap">
          <div className="sexp-ev-top">
            <span className="sexp-ev-label">🎬 Poder explained</span>
            <button className="sexp-ev-close" onClick={() => setOpen(false)} aria-label="Close video">✕</button>
          </div>
          <div className="sexp-ev-frame-wrap">
            <iframe
              className="sexp-ev-frame"
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1`}
              title="How to use poder in Spanish"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <button className="sexp-ev-btn" onClick={() => setOpen(true)}>
          🎬 Watch: How to use poder (8 min)
        </button>
      )}
      <details className="sexp-ev-notes" open={!open}>
        <summary>Key points</summary>
        <ol>
          {KEY_POINTS.map((pt, i) => <li key={i}>{pt}</li>)}
        </ol>
      </details>
    </div>
  )
}

// ─── Grammar: poder + infinitive ──────────────────────────────────────────────

function PoderExercise({ onDone }: { onDone: (score: number) => void }) {
  const [answers, setAnswers] = useState<string[]>(Array(PODER_QS.length).fill(''))
  const [checked, setChecked] = useState<('idle' | 'right' | 'close' | 'wrong')[]>(Array(PODER_QS.length).fill('idle'))
  const [submitted, setSubmitted] = useState(false)

  function checkAll() {
    const results = PODER_QS.map((q, i) => checkAnswerSE(answers[i], q.answer))
    setChecked(results)
    setSubmitted(true)
  }

  const score = checked.filter(r => r === 'right' || r === 'close').length

  return (
    <div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="lesson-header">
          <div className="lesson-tag" style={{ background: '#E8B84B', color: '#fff' }}>Gramática</div>
          <div>
            <div className="lesson-title">Poder + infinitivo</div>
            <div className="lesson-aim">Fill in each gap with the correct form of <strong>poder</strong> + the verb.</div>
          </div>
        </div>

        <ExplainVideoSE />

        <div className="tip">
          <strong>The pattern:</strong> poder (puedo / puede / pueden) + infinitive.
          It works exactly like "can" in English: <em>¿Puedo pagar?</em> = Can I pay?
          <em> ¿Puede repetir?</em> = Can you repeat?
        </div>

        {PODER_QS.map((q, i) => (
          <div key={q.id} style={{ marginBottom: '1.5rem' }}>
            <p className="phrase-context">{q.context}</p>
            <p className="phrase-translation" style={{ fontSize: '.82rem', color: '#999', fontWeight: 400 }}>
              {q.translation}
            </p>
            <div className="poder-sentence">
              {q.pre}
              <span className="poder-gap">
                <input
                  className="poder-gap"
                  value={answers[i]}
                  onChange={e => {
                    if (!submitted) {
                      const next = [...answers]
                      next[i] = e.target.value
                      setAnswers(next)
                    }
                  }}
                  placeholder="poder + verbo…"
                  disabled={submitted}
                  style={{
                    color: !submitted ? undefined
                      : checked[i] === 'right' ? '#2d7a0f'
                      : checked[i] === 'close' ? '#b07a10'
                      : '#c0392b',
                  }}
                />
              </span>
              {q.post}
            </div>
            {submitted && checked[i] !== 'right' && (
              <p style={{ textAlign: 'center', fontSize: '.85rem', color: '#c4694a', fontWeight: 600 }}>
                → {q.answer}
              </p>
            )}
          </div>
        ))}

        {!submitted ? (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn--terra" onClick={checkAll}>Comprobar todo →</button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1rem' }}>
              {score} / {PODER_QS.length} correct
            </p>
            <button className="btn btn--terra" onClick={() => onDone(score)}>
              Next: Diálogo →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Dialogue + comprehension ──────────────────────────────────────────────────

function DialogueLesson({ onDone }: { onDone: (score: number) => void }) {
  const [showFull, setShowFull] = useState(false)
  const [qIdx, setQIdx] = useState(0)
  const [qAnswers, setQAnswers] = useState<(string | null)[]>(Array(DIALOGUE_QS.length).fill(null))
  const [phase, setPhase] = useState<'read' | 'quiz' | 'done'>('read')

  function answerQ(idx: number, opt: string) {
    if (qAnswers[idx] !== null) return
    const next = [...qAnswers]
    next[idx] = opt
    setQAnswers(next)
    if (idx + 1 < DIALOGUE_QS.length) {
      setTimeout(() => setQIdx(idx + 1), 600)
    } else {
      setTimeout(() => setPhase('done'), 800)
    }
  }

  const score = qAnswers.filter((a, i) => a === DIALOGUE_QS[i].a).length

  return (
    <div>
      {/* Dialogue */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="lesson-header">
          <div className="lesson-tag" style={{ background: '#9B4F35' }}>Diálogo</div>
          <div>
            <div className="lesson-title">En la extranjería</div>
            <div className="lesson-aim">Read the conversation, then answer four comprehension questions.</div>
          </div>
        </div>
        <div className="dialogue">
          {(showFull ? DIALOGUE_M1 : DIALOGUE_M1.slice(0, 8)).map((line, i) => (
            <div key={i} className="dl-line">
              <span className={`dl-who dl-who--${line.who === 'You' ? 'you' : line.who === 'Narrator' ? 'narrator' : 'func'}`}>
                {line.who === 'You' ? '🗣 You' : line.who}
              </span>
              <span className="dl-text">{line.line}</span>
            </div>
          ))}
          {!showFull && (
            <button
              className="btn btn--outline"
              style={{ marginTop: '.8rem', width: '100%', justifyContent: 'center' }}
              onClick={() => setShowFull(true)}
            >
              Read full dialogue ↓
            </button>
          )}
        </div>

        <div className="vlc-note" style={{ marginTop: '1rem' }}>
          The Oficina de Extranjería serving central Valencia is at Calle Colón. You cannot walk in — you must book a cita previa online first. The appointment availability is infamous: book 2–3 weeks ahead minimum.
        </div>

        {phase === 'read' && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button className="btn btn--terra" onClick={() => { setShowFull(true); setPhase('quiz') }}>
              Answer the questions →
            </button>
          </div>
        )}
      </div>

      {/* Questions */}
      {phase !== 'read' && (
        <div className="card">
          <p className="label">Comprehension — {DIALOGUE_QS.length} questions</p>
          {DIALOGUE_QS.map((q, i) => {
            if (i > qIdx && phase !== 'done') return null
            const chosen = qAnswers[i]
            return (
              <div key={q.q} style={{ marginBottom: '1.5rem' }}>
                <p className="mcq-q">{i + 1}. {q.q}</p>
                <div className="mcq-options">
                  {q.options.map(opt => {
                    const isChosen = chosen === opt
                    const isCorrect = opt === q.a
                    const showResult = chosen !== null
                    return (
                      <button
                        key={opt}
                        className={`mcq-opt${showResult && isCorrect ? ' mcq-opt--right' : ''}${showResult && isChosen && !isCorrect ? ' mcq-opt--wrong' : ''}`}
                        onClick={() => answerQ(i, opt)}
                        disabled={chosen !== null}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {phase === 'done' && (
            <div style={{ textAlign: 'center', marginTop: '.5rem' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', marginBottom: '1rem' }}>
                {score} / {DIALOGUE_QS.length} correct
              </p>
              <button className="btn btn--terra" onClick={() => onDone(score)}>
                Next: A hablar →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Speaking step ─────────────────────────────────────────────────────────────

function SpeakingStep({ onDone }: { onDone: () => void }) {
  const PROMPTS = [
    {
      label: 'At the office — key phrases',
      prompt: 'You arrive at the Oficina de Extranjería. The clerk looks up. Introduce yourself, give your appointment time, and ask for help if you don\'t understand something.',
      hint: 'Use: Vengo a pedir el NIE / Tengo una cita a las… / ¿Me puede ayudar? / No entiendo del todo',
    },
    {
      label: 'Describing your situation',
      prompt: 'Tell someone — in Spanish — why you moved to Valencia, how long you\'ve been here, and what your most confusing bureaucratic experience has been so far.',
      hint: 'Use: Llevo… meses aquí / Vine porque… / Lo más difícil fue…',
    },
    {
      label: 'Phone call practice',
      prompt: 'You\'re calling the Ayuntamiento to ask about the empadronamiento certificate. Introduce yourself and ask what documents you need to bring.',
      hint: 'Use: Buenos días, llamo para… / ¿Qué documentos necesito? / Perdona, ¿puede repetir?',
    },
  ]

  const [chosen, setChosen] = useState<number | null>(null)

  return (
    <div>
      <div className="card">
        <div className="lesson-header">
          <div className="lesson-tag" style={{ background: '#1D4E89' }}>A hablar</div>
          <div>
            <div className="lesson-title">A practicar</div>
            <div className="lesson-aim">Choose a prompt and talk for 60–90 seconds. Out loud — not in your head.</div>
          </div>
        </div>

        <div className="tip">
          <strong>Why speaking matters:</strong> You will freeze in the real office if you have only read Spanish, not spoken it. Sixty seconds now saves five minutes of panic later.
        </div>

        <p className="label" style={{ marginTop: '1rem' }}>Choose your prompt:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.5rem' }}>
          {PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => setChosen(i)}
              style={{
                padding: '.75rem 1rem', borderRadius: '8px', textAlign: 'left',
                border: `1.5px solid ${chosen === i ? '#C4694A' : '#ddd'}`,
                background: chosen === i ? '#fdf3ef' : '#fff',
                cursor: 'pointer', font: '600 .9rem system-ui',
                transition: 'all .15s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {chosen !== null && (
          <div className="speaking-prompt" style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '.4rem' }}>{PROMPTS[chosen].prompt}</p>
            <p style={{ fontSize: '.82rem', color: '#2a4060', opacity: .75 }}>
              💡 {PROMPTS[chosen].hint}
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button className="btn btn--terra" onClick={onDone}>
            I spoke — next →
          </button>
        </div>
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
        <div className="result-trophy">🎉</div>
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
          <li>Come back tomorrow — the spaced repetition system will pick out the words you struggled with</li>
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

export default function SpanishExpatsPage() {
  const { progress, update } = useProgress(COURSE_ID)

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
        <div className="hero-img" style={{
          backgroundImage: step === 0
            ? 'linear-gradient(135deg, #5a2a1a 0%, #c4694a 45%, #1d4e89 100%)'
            : `linear-gradient(135deg, ${accent}cc 0%, ${accent}88 100%)`,
        }} />
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
                      <li>12 essential terms for documents and processes</li>
                      <li>8 key phrases for any government office</li>
                      <li>The <em>poder + infinitive</em> structure that covers half your bureaucracy Spanish</li>
                      <li>A real dialogue: Sarah gets her NIE in Valencia</li>
                    </ul>
                  </div>

                  <div className="vlc-note">
                    Valencia has its own quirks: the Oficina de Extranjería booking system opens at midnight and fills in minutes. Set an alarm. Alternatively — hire a gestor.
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

          {/* Step 1: Vocabulary */}
          {step === 1 && (
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="lesson-header">
                  <div className="lesson-tag">Vocabulario</div>
                  <div>
                    <div className="lesson-title">Los documentos esenciales</div>
                    <div className="lesson-aim">Read the description and type the Spanish term from memory. Accents matter, but a near-miss counts as close.</div>
                  </div>
                </div>
              </div>
              <VocabDrillWrapper
                savedScore={vocabScore}
                onDone={(score) => { setVocabScore(score); setStep(2) }}
                updateProgress={update}
              />
            </div>
          )}

          {/* Step 2: Phrases */}
          {step === 2 && (
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
                  <button className="btn btn--terra" onClick={() => setStep(3)}>Next: Emparejar →</button>
                </div>
              ) : (
                <PhraseDrill
                  onDone={(score) => { setPhraseScore(score); setStep(3) }}
                  updateProgress={update}
                />
              )}
            </div>
          )}

          {/* Step 3: Match drag */}
          {step === 3 && (
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
                  <button className="btn btn--terra" onClick={() => setStep(4)}>Next: Gramática →</button>
                </div>
              ) : (
                <MatchDragSE
                  onDone={(score) => { setMatchScore(score); setStep(4) }}
                  updateProgress={update}
                />
              )}
            </div>
          )}

          {/* Step 4: Grammar */}
          {step === 4 && (
            grammarScore !== undefined ? (
              <div className="card" style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', marginBottom: '.5rem' }}>
                  {grammarScore} / {PODER_QS.length} correct
                </p>
                <button className="btn btn--terra" onClick={() => setStep(5)}>Next: Diálogo →</button>
              </div>
            ) : (
              <PoderExercise onDone={(score) => { setGrammarScore(score); setStep(5) }} />
            )
          )}

          {/* Step 5: Dialogue */}
          {step === 5 && (
            dialogueScore !== undefined ? (
              <div className="card" style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', marginBottom: '.5rem' }}>
                  {dialogueScore} / {DIALOGUE_QS.length} correct
                </p>
                <button className="btn btn--terra" onClick={() => setStep(6)}>Next: A hablar →</button>
              </div>
            ) : (
              <DialogueLesson onDone={(score) => { setDialogueScore(score); setStep(6) }} />
            )
          )}

          {/* Step 6: Speaking */}
          {step === 6 && (
            <SpeakingStep onDone={() => {
              update(p => markActive(p))
              setStep(7)
            }} />
          )}

          {/* Step 7: Result */}
          {step === 7 && (
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
