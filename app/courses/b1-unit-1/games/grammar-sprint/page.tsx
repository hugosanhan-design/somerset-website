'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useProgress } from '@/lib/courses/useProgress'
import { recordAnswer } from '@/lib/courses/progress'
import { COURSE_ID, GRAMMAR_QS, STATIVE_QS } from '@/lib/courses/b1u1'

// ─── Question type ────────────────────────────────────────────────────────────

type Q = {
  id: string          // item id from the course progress bank
  sentence: string    // full sentence with ___ for the blank
  correct: string
  options: string[]   // shuffled [correct, ...wrong] — 3 total
  why: string
}

// ─── Build questions from the student's gram:* and stat:* error items ─────────

const SIMPLE_WHY = 'Routine, habit or fact (usually, always, every morning) → present simple.'
const CONT_WHY   = 'Happening now, this week, for a temporary period → present continuous.'
const STAT_WHY   = 'Stative verbs (know, own, believe, want, taste) describe states — they stay in the present simple.'

function fillSentence(text: string, answers: string[], skipIdx: number): string {
  let out = text
  answers.forEach((a, k) => {
    if (k !== skipIdx) out = out.replace(`[${k + 1}]`, a)
  })
  return out
}

function buildGrammarQuestions(): Q[] {
  const qs: Q[] = []
  GRAMMAR_QS.forEach((g, qi) => {
    g.answers.forEach((ans, bi) => {
      const filled = fillSentence(g.text, g.answers, bi)
      const sentence = filled.replace(`[${bi + 1}]`, '___')
      const wrong = g.options[bi].filter(o => o !== ans)
      qs.push({
        id: `gram:${qi}:${bi}`,
        sentence,
        correct: ans,
        options: [],          // shuffled later
        why: /\b(is|are|am)\b.*ing\b/.test(ans) ? CONT_WHY : SIMPLE_WHY,
      })
      qs[qs.length - 1].options = shuffle([ans, wrong[0], wrong[1] ?? wrong[0]])
    })
  })
  return qs
}

function buildStaticQuestions(): Q[] {
  return STATIVE_QS
    .filter(s => s.isWrong && s.fix && s.fix.length > 0)
    .map((s, i) => {
      const sentence = s.pre + '___' + s.post
      const correct = s.fix![0]
      const wrong = s.seg
      // Second distractor: add 'is ' or drop it
      const distractor2 = wrong.startsWith('is ') ? wrong.replace('is ', '') : `is ${correct}ing`
      return {
        id: `stat:${i}`,
        sentence,
        correct,
        options: shuffle([correct, wrong, distractor2]),
        why: STAT_WHY,
      }
    })
}

// Full bank for fallback (no personal errors yet)
const ALL_GRAM_QS = buildGrammarQuestions()
const ALL_STAT_QS = buildStaticQuestions()
const ALL_QS = [...ALL_GRAM_QS, ...ALL_STAT_QS]

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const ROUND_SIZE = 10
const SECONDS = 90

// ─── Page ─────────────────────────────────────────────────────────────────────

type Phase = 'playing' | 'done'
type Answer = { q: Q; chosen: string; correct: boolean }

export default function GrammarSprintPage() {
  const { progress, update } = useProgress(COURSE_ID)
  const [phase, setPhase] = useState<Phase>('playing')
  const [round, setRound] = useState<Q[]>([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [chosen, setChosen] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(SECONDS)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Build a personalised round: student's weak items first, padded with others
  const buildRound = useCallback((p: typeof progress) => {
    const items = p.items
    // Ids that had at least one wrong answer, most-missed first
    const weakIds = new Set(
      Object.entries(items)
        .filter(([id, s]) => (id.startsWith('gram:') || id.startsWith('stat:')) && s.wrong > 0)
        .sort((a, b) => b[1].wrong - a[1].wrong)
        .map(([id]) => id)
    )
    const prioritised = ALL_QS.filter(q => weakIds.has(q.id))
    const rest = shuffle(ALL_QS.filter(q => !weakIds.has(q.id)))
    const pool = [...prioritised, ...rest].slice(0, ROUND_SIZE)
    // Re-shuffle options for freshness
    return pool.map(q => ({ ...q, options: shuffle([q.correct, ...q.options.filter(o => o !== q.correct)]) }))
  }, [])

  useEffect(() => {
    setRound(buildRound(progress))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally once at mount

  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setPhase('done'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  function pick(option: string) {
    if (chosen !== null || phase !== 'playing') return
    const q = round[idx]
    const correct = option === q.correct
    setChosen(option)

    // Record to Leitner progress
    update(p => recordAnswer(p, q.id, correct))

    const next = [...answers, { q, chosen: option, correct }]
    setTimeout(() => {
      setAnswers(next)
      setChosen(null)
      if (idx + 1 >= round.length) {
        setPhase('done')
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        setIdx(i => i + 1)
      }
    }, 700)
  }

  function restart() {
    setRound(buildRound(progress))
    setIdx(0)
    setAnswers([])
    setChosen(null)
    setTimeLeft(SECONDS)
    setPhase('playing')
  }

  const score = answers.filter(a => a.correct).length
  const pct = Math.round((timeLeft / SECONDS) * 100)
  const isLow = timeLeft <= 20

  if (!round.length) return null

  // ── End screen ──────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const total = answers.length
    const ratio = total ? score / total : 0
    return (
      <div className="gs-wrap">
        <nav className="gs-nav">
          <Link href="/courses/b1-unit-1" className="gs-back">← Back to Unit 1</Link>
        </nav>
        <div className="gs-card">
          <div className="gs-done-score">{score}<span className="gs-done-of">/{total}</span></div>
          <p className="gs-done-sub">
            {ratio === 1 ? 'Perfect round! All correct.' : ratio >= 0.8 ? 'Great work — nearly there.' : ratio >= 0.5 ? 'Good effort. Keep going.' : 'Tough round — it comes back in Revise in 5.'}
          </p>
          <div className="gs-review">
            {answers.map((ans, i) => (
              <div key={i} className={`gs-rev-item ${ans.correct ? 'ok' : 'no'}`}>
                <span className="gs-rev-s">{ans.q.sentence.replace('___', ans.q.correct)}</span>
                {!ans.correct && <span className="gs-rev-err">You chose: <em>{ans.chosen}</em> · {ans.q.why}</span>}
              </div>
            ))}
          </div>
          <div className="gs-end-btns">
            <button type="button" className="btn" onClick={restart}>Play again →</button>
            <Link href="/courses/b1-unit-1" className="btn btn-ghost">Back to course</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing ─────────────────────────────────────────────────────────────────
  const q = round[idx]
  const [before, after] = q.sentence.split('___')

  return (
    <div className="gs-wrap">
      <nav className="gs-nav">
        <Link href="/courses/b1-unit-1" className="gs-back">← Unit 1</Link>
        <span className="gs-nav-title">Grammar Sprint</span>
        <span className={`gs-timer ${isLow ? 'low' : ''}`}>{timeLeft}s</span>
      </nav>

      <div className="gs-card">
        {/* Progress bar */}
        <div className={`gs-tbar ${isLow ? 'low' : ''}`}>
          <div style={{ width: `${pct}%` }} />
        </div>

        {/* Question counter */}
        <div className="gs-hud">
          <span className="gs-q-count">{idx + 1} / {round.length}</span>
          <span className="gs-score-inline">{score} correct</span>
        </div>

        {/* Sentence */}
        <p className="gs-sentence">
          {before}<span className="gs-blank">{chosen ? (chosen === q.correct ? q.correct : '✗') : '   '}</span>{after}
        </p>

        {/* Options */}
        <div className="gs-opts">
          {q.options.map(opt => {
            let cls = 'gs-opt'
            if (chosen !== null) {
              if (opt === q.correct) cls += ' right'
              else if (opt === chosen) cls += ' wrong'
            }
            return (
              <button key={opt} type="button" className={cls}
                disabled={chosen !== null}
                onClick={() => pick(opt)}>
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        .gs-wrap { min-height: 100dvh; background: #F5F1E6; display: flex; flex-direction: column; font-family: system-ui, sans-serif; }
        .gs-nav { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.4rem; background: rgba(245,241,230,0.92); border-bottom: 1px solid #D9D2BC; gap: 1rem; }
        .gs-back { font-size: .88rem; font-weight: 600; color: #3D8B1F; text-decoration: none; }
        .gs-nav-title { font-weight: 700; font-size: .95rem; color: #17281B; }
        .gs-timer { font-weight: 700; font-size: 1rem; color: #5C6657; min-width: 3ch; text-align: right; }
        .gs-timer.low { color: #B23A2C; }
        .gs-card { background: #FBF9F2; border: 1px solid #D9D2BC; border-radius: 20px; padding: 1.8rem 1.6rem; margin: 1.5rem 1.2rem; flex: 1; }
        .gs-tbar { height: 6px; background: #EDE7D6; border-radius: 3px; overflow: hidden; margin-bottom: 1.2rem; }
        .gs-tbar > div { height: 100%; background: #E3A33A; border-radius: 3px; transition: width .3s linear; }
        .gs-tbar.low > div { background: #B23A2C; }
        .gs-hud { display: flex; justify-content: space-between; font-size: .82rem; font-weight: 600; color: #5C6657; margin-bottom: 1.4rem; }
        .gs-score-inline { color: #3D8B1F; }
        .gs-sentence { font-size: clamp(1.2rem, 3.5vw, 1.55rem); line-height: 1.5; color: #17281B; margin-bottom: 1.6rem; font-family: Georgia, serif; }
        .gs-blank { display: inline-block; min-width: 3.4em; border-bottom: 2.5px solid #C9A24B; text-align: center; font-style: italic; color: #3D8B1F; }
        .gs-opts { display: grid; gap: .65rem; }
        .gs-opt { text-align: left; background: #fff; border: 1.5px solid #D9D2BC; border-radius: 14px; padding: .9rem 1.2rem; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all .12s; color: #17281B; font-family: system-ui, sans-serif; }
        .gs-opt:hover:not(:disabled) { border-color: #3D8B1F; transform: translateY(-1px); }
        .gs-opt.right { background: #EAF6E0; border-color: #57B82C; color: #3D8B1F; font-weight: 700; }
        .gs-opt.wrong { background: #F9E9E6; border-color: #B23A2C; color: #B23A2C; }
        .gs-opt:disabled { cursor: default; }
        /* End screen */
        .gs-done-score { font-family: Georgia, serif; font-size: clamp(3.5rem, 12vw, 5rem); line-height: 1; color: #1E4227; font-weight: 400; }
        .gs-done-of { font-size: .5em; color: #5C6657; }
        .gs-done-sub { color: #5C6657; margin: .5rem 0 1.4rem; }
        .gs-review { border-top: 1px solid #D9D2BC; margin-top: 1rem; }
        .gs-rev-item { padding: .8rem 0; border-bottom: 1px solid #EDE7D6; }
        .gs-rev-item.ok::before { content: '✓ '; color: #3D8B1F; font-weight: 700; }
        .gs-rev-item.no::before { content: '✗ '; color: #B23A2C; font-weight: 700; }
        .gs-rev-s { font-size: .9rem; color: #17281B; }
        .gs-rev-err { display: block; font-size: .82rem; color: #5C6657; margin-top: .25rem; }
        .gs-end-btns { display: flex; gap: .8rem; flex-wrap: wrap; margin-top: 1.6rem; }
        .btn { display: inline-flex; align-items: center; font-size: .95rem; font-weight: 600; padding: .75rem 1.6rem; border-radius: 50px; background: #57B82C; color: #fff; border: none; cursor: pointer; text-decoration: none; transition: background .15s; }
        .btn:hover { background: #3D8B1F; }
        .btn-ghost { background: transparent; color: #17281B; border: 1.5px solid #D9D2BC; }
        .btn-ghost:hover { border-color: #3D8B1F; color: #3D8B1F; background: transparent; }
      `}</style>
    </div>
  )
}
