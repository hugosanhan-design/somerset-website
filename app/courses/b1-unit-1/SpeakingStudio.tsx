'use client'

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { parseSegment, summarise, type Segment, type SpeakingSummary } from '@/lib/courses/speaking'
import { checkAnswer } from '@/lib/courses/b1u1'

const MAX_SECONDS = 90
const STREAK_GOAL = 3
type Fix = { sentence: string; original: string; fix: string; why: string }
type Feedback = {
  fixes: Fix[]; drill: { prompt: string; items: { q: string; a: string }[] }
  sayAgain: string; praise: string; length: 'short' | 'good'
  b1Version?: string; b1Why?: string[]
  level?: 'below' | 'starting' | 'solid'; verdict?: string
  sounds?: Sound[]
}
type Sound = { heard: string; meant: string }
type WordResult = 'good' | 'amber' | 'bad'
type Phase = 'pick' | 'connecting' | 'recording' | 'thinking' | 'feedback' | 'done'
type Rec = { stop: () => Promise<void> }
type PronExplain = { ipa: string; how: string; rule: string | null; similar: string[] }
type WordPhase = 'idle' | 'hearing' | 'starting' | 'listening' | 'done'
type DrillPhase = 'intro' | 'play-slow' | 'echo-slow' | 'play-hard' | 'echo-hard' | 'play-full' | 'listen-full' | null
type WordHint = '' | 'go' | 'checking' | 'listen' | 'yourturn'
type PronGoal = 'understood' | 'british'

const clean = (w: string) => w.toLowerCase().replace(/[^a-z']/g, '')

type WordRun = {
  pushes: { write: (b: ArrayBuffer) => void; close: () => void }[]
  proc: ScriptProcessorNode | null
  closed: boolean; close: () => void; stream: MediaStream; ctx: AudioContext | null
  peak: number; cancelled: boolean; timer: ReturnType<typeof setTimeout> | null
  chunks: Int16Array[]; sent: number; voiced: boolean
}

// Float audio at any sample rate → 16 kHz 16-bit mono PCM, the format Azure expects.
function toPcm16(input: Float32Array, rate: number): Int16Array {
  const ratio = rate / 16000
  const len = Math.floor(input.length / ratio)
  const out = new Int16Array(len)
  for (let i = 0; i < len; i++) {
    const a = Math.floor(i * ratio), b = Math.max(a + 1, Math.floor((i + 1) * ratio))
    let sum = 0
    for (let j = a; j < b && j < input.length; j++) sum += input[j]
    const v = Math.max(-1, Math.min(1, sum / (b - a)))
    out[i] = v < 0 ? v * 0x8000 : v * 0x7fff
  }
  return out
}

const norm = (t: string) => t.toLowerCase().replace(/[^a-z']+/g, ' ').trim()

// A short stretch of the student's own sentence around the word. Said on its own, a short
// word gives the recogniser nothing to go on ("went" heard as "wind"); in a phrase, native
// voices were recognised 42/42 times and Spanish-accented ones still caught 9/12 (2026-10-06).
function phraseAround(word: string, text: string): string {
  const target = norm(word)
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text]
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/)
    const k = words.findIndex(w => norm(w) === target)
    if (k < 0) continue
    const chunk = words.length <= 9 ? words : words.slice(Math.max(0, k - 3), k + 4)
    return chunk.join(' ').replace(/[.!?,;:]+$/, '')
  }
  return word
}

// Which recognised word lines up with the target word? (Word-level edit-distance alignment.)
function alignedWord(expected: string[], heard: string[], t: number): string | null {
  const n = expected.length, m = heard.length
  const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1))
  let i = n, j = m
  while (i > 0) {
    if (j > 0 && d[i][j] === d[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1)) {
      if (i - 1 === t) return heard[j - 1]
      i--; j--
    } else if (d[i][j] === d[i - 1][j] + 1) {
      if (i - 1 === t) return null
      i--
    } else j--
  }
  return null
}


// Syllable display data for the slow drill.
// syl: how the word is split for visual highlighting
// p1:  first TTS chunk (slow approach)   p2: hard phoneme/cluster (emphasised)
type DrillData = { syl: string[]; p1: string; p2: string }
const DRILL_DATA: Record<string, DrillData> = {
  'architect':    { syl: ['ar', 'chi', 'tect'],       p1: 'archi',    p2: 'tect'     },
  'hairdresser':  { syl: ['hair', 'dress', 'er'],     p1: 'hair',     p2: 'dresser'  },
  'athlete':      { syl: ['ath', 'lete'],             p1: 'ath',      p2: 'lete'     },
  'lawyer':       { syl: ['law', 'yer'],              p1: 'law',      p2: 'yer'      },
  'firefighter':  { syl: ['fire', 'fight', 'er'],     p1: 'fire',     p2: 'fighter'  },
  'cook':         { syl: ['cook'],                    p1: 'coo',      p2: 'k'        },
  'soldier':      { syl: ['sol', 'dier'],             p1: 'sol',      p2: 'dier'     },
  'actor':        { syl: ['ac', 'tor'],               p1: 'ac',       p2: 'tor'      },
  'politician':   { syl: ['pol', 'i', 'ti', 'cian'], p1: 'politi',   p2: 'cian'     },
  'librarian':    { syl: ['li', 'brar', 'i', 'an'],  p1: 'libra',    p2: 'rian'     },
  'astronaut':    { syl: ['as', 'tro', 'naut'],      p1: 'astro',    p2: 'naut'     },
  'calm':         { syl: ['calm'],                    p1: 'caa',      p2: 'lm'       },
  'cheerful':     { syl: ['cheer', 'ful'],            p1: 'cheer',    p2: 'ful'      },
  'confident':    { syl: ['con', 'fi', 'dent'],      p1: 'confi',    p2: 'dent'     },
  'generous':     { syl: ['gen', 'er', 'ous'],       p1: 'gen',      p2: 'erous'    },
  'honest':       { syl: ['hon', 'est'],              p1: 'hon',      p2: 'est'      },
  'patient':      { syl: ['pa', 'tient'],             p1: 'pa',       p2: 'tient'    },
  'reliable':     { syl: ['re', 'li', 'a', 'ble'],   p1: 'reli',     p2: 'able'     },
  'shy':          { syl: ['shy'],                     p1: 'sh',       p2: 'y'        },
  'sociable':     { syl: ['so', 'cia', 'ble'],       p1: 'so',       p2: 'ciable'   },
  'hard-working': { syl: ['hard', 'work', 'ing'],    p1: 'hard',     p2: 'working'  },
}

// The exact audio Azure scored, as a playable WAV, so the student can hear themselves.
function wavUrl(chunks: Int16Array[]): string {
  const n = chunks.reduce((a, c) => a + c.length, 0)
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const tag = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)) }
  tag(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); tag(8, 'WAVE'); tag(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  tag(36, 'data'); v.setUint32(40, n * 2, true)
  let o = 44
  for (const c of chunks) for (let i = 0; i < c.length; i++, o += 2) v.setInt16(o, c[i], true)
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

function pronClass(accuracy: number, error: string) {
  if (error === 'Omission') return 'pw-omit'
  if (accuracy >= 80) return ''
  if (accuracy >= 55) return 'pw-amber'
  return 'pw-bad'
}

// Splits the transcript into plain text and the stretches the feedback corrected,
// so corrections can be shown inside the student's own words.
type Piece = { kind: 'text'; text: string } | { kind: 'fix'; idx: number; text: string } | { kind: 'sound'; idx: number; text: string }
function piecesFor(transcript: string, fixes: Fix[], sounds: Sound[]): Piece[] {
  const ranges: { start: number; end: number; idx: number; kind: 'fix' | 'sound' }[] = []
  const free = (start: number, end: number) => !ranges.some(r => start < r.end && end > r.start)
  fixes.forEach((f, idx) => {
    const s = transcript.indexOf(f.sentence)
    const start = s >= 0 ? s + f.sentence.indexOf(f.original) : transcript.indexOf(f.original)
    if (start < 0) return
    const end = start + f.original.length
    if (free(start, end)) ranges.push({ start, end, idx, kind: 'fix' })
  })
  sounds.forEach((x, idx) => {
    const m = new RegExp(`(^|[^A-Za-z'])(${x.heard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=$|[^A-Za-z'])`).exec(transcript)
    if (!m) return
    const start = m.index + m[1].length, end = start + m[2].length
    if (free(start, end)) ranges.push({ start, end, idx, kind: 'sound' })
  })
  ranges.sort((a, b) => a.start - b.start)
  const out: Piece[] = []
  let at = 0
  for (const r of ranges) {
    if (r.start > at) out.push({ kind: 'text', text: transcript.slice(at, r.start) })
    out.push({ kind: r.kind, idx: r.idx, text: transcript.slice(r.start, r.end) })
    at = r.end
  }
  if (at < transcript.length) out.push({ kind: 'text', text: transcript.slice(at) })
  return out
}

function Words({ text, pron, onWord, extra = '' }: {
  text: string; pron?: Map<string, { accuracy: number; error: string }>; onWord: (w: string) => void; extra?: string
}) {
  return (
    <>
      {text.split(/(\s+)/).map((tok, i) => {
        if (!tok) return null
        if (/^\s+$/.test(tok)) return <Fragment key={i}>{tok}</Fragment>
        const c = clean(tok)
        if (!c) return <Fragment key={i}>{tok}</Fragment>
        const p = pron?.get(c)
        const cls = p ? pronClass(p.accuracy, p.error) : ''
        return (
          <button key={i} type="button" className={`pw${cls ? ' ' + cls : ''}${extra ? ' ' + extra : ''}`} onClick={() => onWord(c)}>
            {tok}
          </button>
        )
      })}
    </>
  )
}

// "What you said": pronunciation problems underlined, grammar fixes shown in place.
function SaidText({ transcript, segs, fixes, sounds, activeFix, onWord, onFix }: {
  transcript: string; segs: Segment[]; fixes: Fix[]; sounds: Sound[]; activeFix: number | null
  onWord: (w: string, heard?: string) => void; onFix: (i: number) => void
}) {
  const pron = new Map<string, { accuracy: number; error: string }>()
  segs.flatMap(s => s.words).forEach(w => {
    const k = clean(w.word)
    const prev = pron.get(k)
    if (!prev || w.accuracy < prev.accuracy) pron.set(k, { accuracy: w.accuracy, error: w.error })
  })
  return (
    <p className="rp-text">
      {piecesFor(transcript, fixes, sounds).map((pc, i) => pc.kind === 'text'
        ? <Words key={i} text={pc.text} pron={pron} onWord={onWord} />
        : pc.kind === 'sound' ? (
          <button key={i} type="button" className="pw pw-bad pw-misheard" title={`We heard "${pc.text}". Did you mean "${sounds[pc.idx].meant}"? Tap to practise.`}
            onClick={() => onWord(sounds[pc.idx].meant, pc.text)}>
            {pc.text}<sup>?</sup>
          </button>
        ) : (
          <button key={i} type="button" className={`rp-fix${activeFix === pc.idx ? ' on' : ''}`} onClick={() => onFix(pc.idx)}>
            <s>{pc.text}</s> <ins>{fixes[pc.idx].fix}</ins>
          </button>
        ))}
    </p>
  )
}

// "B1 version": [[changed parts]] highlighted, every word still tappable to practise.
function B1Text({ text, onWord }: { text: string; onWord: (w: string) => void }) {
  return (
    <p className="rp-text">
      {text.split(/(\[\[[^\]]+\]\])/).map((part, i) => {
        const m = part.match(/^\[\[([^\]]+)\]\]$/)
        return m
          ? <mark key={i} className="rp-b1-new"><Words text={m[1]} onWord={onWord} /></mark>
          : <Words key={i} text={part} onWord={onWord} />
      })}
    </p>
  )
}

// Goal-selector modal: shown once before the first word-coach session.
// Two options: intelligibility (default) or RP training (opt-in).
function GoalModal({ onChoose }: { onChoose: (g: PronGoal) => void }) {
  return createPortal(
    <div className="goal-overlay" role="dialog" aria-modal="true" aria-label="What is your pronunciation goal?">
      <div className="goal-modal">
        <h2 className="goal-title">What&apos;s your goal?</h2>
        <p className="goal-sub">Every learner is different. Pick what feels right for you.</p>
        <div className="goal-options">
          <button type="button" className="goal-opt goal-opt--main" onClick={() => onChoose('understood')}>
            <span className="goal-opt-icon">🗣️</span>
            <strong>Be understood</strong>
            <span className="goal-opt-tag">Recommended</span>
            <p>Say words clearly enough that any English speaker gets them. Your Spanish accent is part of who you are — Rafa Nadal, Penélope Cruz and Antonio Banderas kept theirs.</p>
          </button>
          <button type="button" className="goal-opt" onClick={() => onChoose('british')}>
            <span className="goal-opt-icon">🎯</span>
            <strong>Sound British</strong>
            <p>Train towards a Received Pronunciation accent. Stricter scoring, more phoneme tips. Good if you specifically want to minimise your accent.</p>
          </button>
        </div>
        <p className="goal-note">You can change this any time using the ⚙ button inside the practice window.</p>
      </div>
    </div>,
    document.body
  )
}

function WordCoach({ word, phrase, result, heard, before, phase, hint, err, explain, volume, streak, clip, debug, tries, goal, drillPhase, drillHighlight, onStart, onClose, onFinish, onChangeGoal }: {
  word: string; phrase: string; result: WordResult | null; heard: string; before: string; phase: WordPhase; hint: WordHint
  err: string; explain: PronExplain | null; volume: number; streak: number; clip: string; debug: string; tries: number
  goal: PronGoal; drillPhase: DrillPhase; drillHighlight: number
  onStart: () => void; onClose: () => void; onFinish: () => void; onChangeGoal: () => void
}) {
  const dd = DRILL_DATA[word]
  const tier = phase === 'listening' ? 'listening' : result ?? 'idle'
  const locked = streak >= STREAK_GOAL
  const parts = phrase.split(/\s+/)
  const at = parts.findIndex(w => norm(w) === norm(word))
  const multi = parts.length > 1 && at >= 0
  const style = phase === 'listening' && volume > 0
    ? { transform: `scale(${1 + volume * 0.45})`, animation: 'none' }
    : undefined
  const goodMsg = goal === 'british'
    ? (locked ? 'Locked in! Tap another word.' : `British RP accepted. ${streak}/${STREAK_GOAL}, say it again`)
    : (locked ? 'Locked in! Tap another word.' : `Any English speaker would understand you. ${streak}/${STREAK_GOAL}, say it again`)
  const drillMsg = drillPhase === 'intro' ? "Let's go slower. Repeat after me."
    : drillPhase === 'play-slow' ? 'Listen carefully...'
    : drillPhase === 'echo-slow' ? 'Now you say it'
    : drillPhase === 'play-hard' ? 'Now the hard part...'
    : drillPhase === 'echo-hard' ? 'Say that part'
    : drillPhase === 'play-full' ? 'Full word:'
    : drillPhase === 'listen-full' ? 'Your turn'
    : null
  const message = drillMsg ??
    (phase === 'starting' ? 'One moment...'
    : phase === 'hearing' ? 'Listen...'
    : phase === 'listening' ? (hint === 'go' ? 'Go on, say it now' : hint === 'checking' ? 'Checking...' : 'Say it now')
    : result === null ? (before ? `In your answer we heard "${before}". Say the phrase.` : multi ? 'Say the whole phrase.' : 'Tap Start and say the word.')
    : result === 'good' ? goodMsg
    : hint === 'yourturn' ? 'Your turn. Copy it.'
    : result === 'amber' ? `Nearly. "${word}" sounded a bit like "${heard}". Listen...`
    : heard ? `We heard "${heard}", not "${word}". Listen...` : `We didn't catch "${word}". Listen...`)

  const showEar = phase === 'hearing' || hint === 'listen' || (drillPhase !== null && ['play-slow', 'play-hard', 'play-full', 'echo-slow', 'echo-hard'].includes(drillPhase))
  const showMouth = phase === 'starting' || phase === 'listening' || (drillPhase !== null && ['echo-slow', 'echo-hard', 'listen-full'].includes(drillPhase))
  const showStart = (phase === 'idle' || phase === 'done') && drillPhase === null && !locked
  const showStop = (phase === 'listening' || phase === 'starting') && drillPhase === null

  // Syllable display: split if DRILL_DATA exists, otherwise show word whole
  const wordInner = dd && dd.syl.length > 1 ? (
    <>
      {dd.syl.map((s, i) => {
        const on = drillHighlight >= 0 && (
          (drillHighlight === 0 && i < dd.syl.length - 1) ||
          (drillHighlight === dd.syl.length - 1 && i === dd.syl.length - 1)
        )
        return <span key={i} className={on ? 'syl syl--on' : 'syl'}>{s}</span>
      })}
    </>
  ) : (multi ? parts[at] : word)

  return (
    <div className="wc">
      <div className="wc-top-row">
        <button type="button" className="wc-close" onClick={onClose} aria-label="Close">x</button>
        <button type="button" className="wc-goal-btn" onClick={onChangeGoal} title={goal === 'british' ? 'Goal: Sound British' : 'Goal: Be understood'}>
          {goal === 'british' ? 'Sound British' : 'Be understood'}
        </button>
      </div>
      <div className="wc-streak" aria-label={`${streak} of ${STREAK_GOAL}`}>
        {Array.from({ length: STREAK_GOAL }, (_, i) => <span key={i} className={i < streak ? 'on' : ''} />)}
      </div>
      <div className={`wc-word-wrap${multi ? ' wc-word-wrap--phrase' : ''}`}>
        {multi && parts.slice(0, at).length > 0 && <span className="wc-ctx">{parts.slice(0, at).join(' ')}</span>}
        <span key={tier === 'listening' ? 'l' : `r-${tries}`} className={`wc-word wc-word--${tier}`} style={style}>{wordInner}</span>
        {multi && parts.slice(at + 1).length > 0 && <span className="wc-ctx">{parts.slice(at + 1).join(' ')}</span>}
      </div>
      {explain?.ipa && <div className="wc-ipa">{explain.ipa}</div>}
      <p className={`wc-msg wc-msg--${tier}`}>{message}</p>
      <div className="wc-actions">
        <div className="wc-indicators">
          <span className={`wc-ear${showEar ? ' wc-ear--on' : ''}`} aria-label="Listening">👂</span>
          <span className={`wc-mouth${showMouth ? ' wc-mouth--on' : ''}`} aria-label="Speaking">👄</span>
        </div>
        {showStart && (
          <button type="button" className="wc-start" onClick={onStart}>
            {result === null ? 'Start' : 'Try again'}
          </button>
        )}
        {locked && <span className="wc-locked">Locked in!</span>}
        {showStop && (
          <button type="button" className="btn wc-stop" onClick={onFinish}>Stop</button>
        )}
        {clip && phase === 'done' && !drillPhase && (
          <button type="button" className="help-btn" onClick={() => { try { void new Audio(clip).play() } catch { /* ignore */ } }}>Hear yourself</button>
        )}
      </div>
      {err && <p className="wc-err">{err}</p>}
      {debug && <p className="wc-debug">{debug}</p>}
      {explain?.how && (
        <div className="wc-how">
          <p>{explain.how}</p>
          {explain.rule && <p className="wc-rule">{explain.rule}</p>}
        </div>
      )}
    </div>
  )
}

function has(text: string, phrase: string) {
  return !!phrase && text.toLowerCase().includes(phrase.toLowerCase())
}

function highlight(text: string, fixes: Fix[]) {
  const marks = [
    ...fixes.map(f => ({ p: f.fix, cls: 'hl-ok' })),
    ...fixes.map(f => ({ p: f.original, cls: 'hl-bad' })),
  ].filter(m => m.p && m.p.length > 1).sort((a, b) => b.p.length - a.p.length)
  if (!marks.length) return text
  const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${marks.map(m => esc(m.p)).join('|')})`, 'gi')
  return text.split(re).map((part, i) => {
    const m = marks.find(x => x.p.toLowerCase() === part.toLowerCase())
    return m ? <span key={i} className={m.cls}>{part}</span> : <span key={i}>{part}</span>
  })
}

// The speaking loop: speak → one report built around what you said (fixes in place,
// pronunciation to tap, a B1 version) → say it again → see what got better.
// Audio streams from the microphone straight to Azure; nothing is stored.
export default function SpeakingStudio({ questions, student, aside, onSpoken, onFixes, onSecondTry }: {
  questions: string[]
  student: { name: string; code: string } | null
  aside?: ReactNode
  onSpoken: (s: SpeakingSummary) => void
  onFixes: (fixes: Fix[]) => void
  onSecondTry: (s: SpeakingSummary) => void
}) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [qi, setQi] = useState(0)
  const [live, setLive] = useState('')
  const [heard, setHeard] = useState('')
  const [secs, setSecs] = useState(0)
  const [err, setErr] = useState('')
  const [fbErr, setFbErr] = useState('')
  const [first, setFirst] = useState<SpeakingSummary | null>(null)
  const [second, setSecond] = useState<SpeakingSummary | null>(null)
  const [transcript, setTranscript] = useState('')
  const [fb, setFb] = useState<Feedback | null>(null)
  const [view, setView] = useState<'said' | 'b1'>('said')
  const [activeFix, setActiveFix] = useState<number | null>(null)
  const [drill, setDrill] = useState<string[]>([])
  const [drillChecked, setDrillChecked] = useState(false)
  const [clip, setClip] = useState('')
  const [practiceWord, setPracticeWord] = useState<string | null>(null)
  const [practicePhrase, setPracticePhrase] = useState('')
  const [wordPhase, setWordPhase] = useState<WordPhase>('idle')
  const [wordResult, setWordResult] = useState<WordResult | null>(null)
  const [wordHeard, setWordHeard] = useState('')
  const [wordBefore, setWordBefore] = useState('')
  const [wordTries, setWordTries] = useState(0)
  const [wordHint, setWordHint] = useState<WordHint>('')
  const [wordErr, setWordErr] = useState('')
  const [wordExplain, setWordExplain] = useState<PronExplain | null>(null)
  const [wordVolume, setWordVolume] = useState(0)
  const [wordStreak, setWordStreak] = useState(0)
  const [wordClip, setWordClip] = useState('')
  const [wordDebug, setWordDebug] = useState('')
  const [debugOn, setDebugOn] = useState(false)
  const [pronGoal, setPronGoal] = useState<PronGoal>('understood')
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [drillPhase, setDrillPhase] = useState<DrillPhase>(null)
  const [drillHighlight, setDrillHighlight] = useState(-1)
  const [consecutiveBad, setConsecutiveBad] = useState(0)
  const drillActive = useRef(false)
  const drillReps = useRef(0)
  const segs = useRef<Segment[]>([])
  const attemptRef = useRef<1 | 2>(1)
  const rec = useRef<Rec | null>(null)
  const media = useRef<{ mr: MediaRecorder; stream: MediaStream; chunks: Blob[] } | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const tokenRef = useRef<{ token: string; region: string; at: number } | null>(null)
  const wordRun = useRef<WordRun | null>(null)
  const coachRef = useRef<HTMLElement | null>(null)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => { setDebugOn(new URLSearchParams(window.location.search).has('debug')) }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pron-goal') as PronGoal | null
      if (saved === 'understood' || saved === 'british') setPronGoal(saved)
    } catch { /* private browsing */ }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const on = () => setNarrow(mq.matches)
    on(); mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => () => {
    void rec.current?.stop(); stopMedia(); endWordRun()
    if (timer.current) clearInterval(timer.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // One Azure token lasts ten minutes, so reuse it instead of spending a daily session per attempt.
  async function getToken() {
    const c = tokenRef.current
    if (c && Date.now() - c.at < 8 * 60_000) return c
    const r = await fetch('/api/courses/speech-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(student) })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.error || 'Speaking practice is unavailable right now.')
    tokenRef.current = { token: d.token, region: d.region, at: Date.now() }
    return tokenRef.current
  }

  // A separate recording just so the student can hear themselves back. Uses the
  // browser's real format (webm on Chrome/Android, mp4 on iPhone). If it fails, skip it.
  async function startMedia(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    try {
      const mr = new MediaRecorder(stream)
      const chunks: Blob[] = []
      mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
      mr.onstop = () => setClip(URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || 'audio/webm' })))
      mr.start()
      media.current = { mr, stream, chunks }
    } catch { stream.getTracks().forEach(t => t.stop()); media.current = null }
  }
  function stopMedia() {
    const m = media.current
    if (!m) return
    if (m.mr.state !== 'inactive') m.mr.stop()
    m.stream.getTracks().forEach(t => t.stop())
    media.current = null
  }

  async function start(which: 1 | 2) {
    setErr('')
    if (!student) { setErr("Sign in at Student's Corner first, so your speaking can be checked."); return }
    attemptRef.current = which; setPhase('connecting'); setLive(''); setHeard(''); setSecs(0); setClip('')
    setPracticeWord(null); endWordRun()
    segs.current = []
    try {
      // Microphone permission first, so a blocked mic never uses up a speaking session.
      await startMedia()
      const { token, region } = await getToken()
      const sdk = await import('microsoft-cognitiveservices-speech-sdk')
      const cfg = sdk.SpeechConfig.fromAuthorizationToken(token, region)
      cfg.speechRecognitionLanguage = 'en-GB'
      // B1 learners pause longer when thinking in English — give them more space.
      cfg.setProperty(sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, '2500')
      const recognizer = new sdk.SpeechRecognizer(cfg, sdk.AudioConfig.fromDefaultMicrophoneInput())
      // Empty reference text = unscripted: transcript + phoneme-level pronunciation in one pass.
      const pa = new sdk.PronunciationAssessmentConfig('', sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Phoneme, false)
      pa.applyTo(recognizer)
      recognizer.recognizing = (_s, e) => setLive(e.result.text)
      recognizer.recognized = (_s, e) => {
        if (e.result.reason !== sdk.ResultReason.RecognizedSpeech) return
        const seg = parseSegment(e.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult))
        if (seg && seg.text) { segs.current.push(seg); setHeard(segs.current.map(x => x.text).join(' ')); setLive('') }
      }
      recognizer.canceled = (_s, e) => {
        if (e.reason === sdk.CancellationReason.Error) setErr('The connection dropped. Check your internet and try again.')
      }
      rec.current = {
        stop: () => new Promise<void>(resolve => {
          recognizer.stopContinuousRecognitionAsync(() => { recognizer.close(); resolve() }, () => { recognizer.close(); resolve() })
        }),
      }
      await new Promise<void>((resolve, reject) => recognizer.startContinuousRecognitionAsync(resolve, e => reject(new Error(String(e)))))
      setPhase('recording')
      const t0 = Date.now()
      timer.current = setInterval(() => {
        const s = Math.floor((Date.now() - t0) / 1000)
        setSecs(s)
        if (s >= MAX_SECONDS) void stop()
      }, 250)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setErr(/permission|denied|NotAllowed|microphone/i.test(msg) ? 'Your browser blocked the microphone. Allow it (the icon by the address bar) and try again.' : msg || 'Something went wrong starting the microphone.')
      stopMedia()
      setPhase(which === 1 ? 'pick' : 'feedback')
    }
  }

  async function stop() {
    if (timer.current) { clearInterval(timer.current); timer.current = null }
    const r = rec.current
    rec.current = null
    if (r) await r.stop()
    stopMedia()
    const sum = summarise(segs.current)
    if (sum.wordCount < 5) {
      setErr("We didn't catch enough. Speak a little closer to the microphone and try again.")
      setPhase(attemptRef.current === 1 ? 'pick' : 'feedback')
      return
    }
    if (attemptRef.current === 1) {
      setFirst(sum); setTranscript(sum.transcript); onSpoken(sum)
      void getFeedback(sum.transcript)
    } else {
      setSecond(sum); setPhase('done'); onSecondTry(sum)
    }
  }

  // The report opens straight away with the transcript; feedback fills in beside it.
  async function getFeedback(t: string) {
    setErr(''); setFbErr(''); setFb(null); setActiveFix(null); setView('said'); setPhase('thinking')
    try {
      const r = await fetch('/api/courses/speaking-feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, question: questions[qi], transcript: t }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Feedback is unavailable right now.')
      setFb(d); setDrill(Array(d.drill.items.length).fill('')); setDrillChecked(false)
      onFixes(d.fixes)
    } catch (e) {
      setFbErr(e instanceof Error ? e.message : 'Feedback is unavailable right now.')
    }
    setPhase('feedback')
  }

  function hear(word: string, onEnd?: () => void, rate = 0.8) {
    try {
      const u = new SpeechSynthesisUtterance(word)
      u.lang = 'en-GB'; u.rate = rate
      const v = speechSynthesis.getVoices().find(x => x.lang === 'en-GB')
      if (v) u.voice = v
      if (onEnd) u.onend = onEnd
      speechSynthesis.cancel(); speechSynthesis.speak(u)
    } catch { onEnd?.() }
  }

  const hearAsync = (word: string, rate = 0.8) => new Promise<void>(resolve => hear(word, resolve, rate))
  const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

  function vadDetect(ms = 600): Promise<boolean> {
    return new Promise(async resolve => {
      let stream: MediaStream
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }) }
      catch { resolve(false); return }
      const ctx = new AudioContext()
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      src.connect(analyser)
      const data = new Float32Array(analyser.frequencyBinCount)
      let voiceStart: number | null = null
      let done = false
      const finish = (v: boolean) => {
        if (done) return; done = true
        stream.getTracks().forEach(t => t.stop())
        ctx.close().catch(() => {})
        resolve(v)
      }
      const check = () => {
        if (done) return
        analyser.getFloatTimeDomainData(data)
        const rms = Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length)
        if (rms > 0.04) {
          if (voiceStart === null) voiceStart = Date.now()
          else if (Date.now() - voiceStart > ms) { finish(true); return }
        } else { voiceStart = null }
        requestAnimationFrame(check)
      }
      check()
      setTimeout(() => finish(false), 10000)
    })
  }

  function correctedText() {
    const f = fb?.fixes ?? [], so = fb?.sounds ?? []
    return piecesFor(transcript, f, so).map(pc => pc.kind === 'text' ? pc.text : pc.kind === 'fix' ? f[pc.idx].fix : so[pc.idx].meant).join('')
  }

  function chooseGoal(g: PronGoal) {
    setPronGoal(g); setShowGoalModal(false)
    try { localStorage.setItem('pron-goal', g); localStorage.setItem('pron-goal-set', '1') } catch { /* private browsing */ }
  }

  async function openWordPractice(word: string, heardBefore?: string, source: 'said' | 'b1' = 'said') {
    const context = source === 'b1' ? (fb?.b1Version ?? '').replace(/\[\[|\]\]/g, '') : correctedText()
    setPracticePhrase(phraseAround(word, context))
    endWordRun()
    // Show the goal modal the first time a student opens word practice.
    try { if (!localStorage.getItem('pron-goal-set')) setShowGoalModal(true) } catch { /* private browsing */ }
    setPracticeWord(word); setWordPhase('idle'); setWordResult(null); setWordHeard(''); setWordBefore(heardBefore ?? '')
    setWordHint(''); setWordStreak(0); setWordErr(''); setWordExplain(null); setWordClip(''); setWordDebug('')
    // Warm up the speech engine and token now, so the first "Say it" starts recording at once.
    void import('microsoft-cognitiveservices-speech-sdk')
    if (student) void getToken().catch(() => {})
    if (!window.matchMedia('(max-width: 900px)').matches) setTimeout(() => coachRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    try {
      const r = await fetch('/api/courses/pronunciation-explain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      })
      if (r.ok) setWordExplain(await r.json())
    } catch { /* the explanation is optional */ }
  }

  function endWordRun() {
    const run = wordRun.current
    if (!run) return
    wordRun.current = null
    if (run.timer) clearTimeout(run.timer)
    try { run.proc?.disconnect() } catch { /* already gone */ }
    if (!run.closed) { run.closed = true; for (const ps of run.pushes) { try { ps.close() } catch { /* already closed */ } } }
    try { run.close() } catch { /* already closed */ }
    run.stream.getTracks().forEach(t => t.stop())
    run.ctx?.close().catch(() => {})
    setWordVolume(0)
  }

  function stopWord() {
    if (wordRun.current) wordRun.current.cancelled = true
    endWordRun()
    setWordPhase('idle'); setWordHint('')
  }

  // Pronunciation score for the target word (used to tell a clear word from a just-about one).
  function scoreFrom(raw: string | undefined, ref: string): { score: number | null; info: string } {
    if (!raw) return { score: null, info: 'no score' }
    type P = { PronunciationAssessment?: { AccuracyScore?: number } }
    type W = { Word?: string; PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string }; Phonemes?: P[] }
    const json = JSON.parse(raw) as { NBest?: { Words?: W[] }[] }
    const words = json.NBest?.[0]?.Words ?? []
    const target = words.find(w => clean(w.Word ?? '') === clean(ref)) ?? words[0]
    const acc = target?.PronunciationAssessment?.AccuracyScore
    if (typeof acc !== 'number') return { score: null, info: 'no score' }
    const ph = (target?.Phonemes ?? []).map(p => p.PronunciationAssessment?.AccuracyScore).filter((x): x is number => typeof x === 'number')
    return { score: acc, info: `score ${acc} · sounds ${ph.join('/')}` }
  }

  async function sayWord() {
    const word = practiceWord
    const phrase = practicePhrase || practiceWord
    if (!word || !phrase || !student) return
    endWordRun()
    try { speechSynthesis.cancel() } catch { /* ignore */ }
    setWordPhase('starting'); setWordResult(null); setWordHeard(''); setWordErr(''); setWordHint(''); setWordDebug('')
    setWordClip(c => { if (c) URL.revokeObjectURL(c); return '' })

    let stream: MediaStream
    try {
      // Noise suppression off: it strips the quiet sounds we are scoring (/s/, /ʃ/, /θ/).
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true } })
    } catch {
      setWordErr('Your browser blocked the microphone. Allow it and try again.'); setWordPhase('idle'); return
    }
    const run: WordRun = { pushes: [], proc: null, closed: false, close: () => {}, stream, ctx: null, peak: 0, cancelled: false, timer: null, chunks: [], sent: 0, voiced: false }
    wordRun.current = run
    const fail = (msg: string) => {
      if (run.cancelled || wordRun.current !== run) return
      endWordRun(); setWordErr(msg); setWordPhase('idle'); setWordHint('')
    }
    run.timer = setTimeout(() => fail('That took too long. Try again.'), 15000)
    const flush = () => {
      if (!run.pushes.length) return
      while (run.sent < run.chunks.length) {
        const b = run.chunks[run.sent++].buffer as ArrayBuffer
        for (const ps of run.pushes) ps.write(b)
      }
    }

    try {
      // Record from the moment the microphone opens. Audio is kept until Azure is ready,
      // so a student who speaks straight away never loses the start of the word.
      let ctx: AudioContext
      let source: MediaStreamAudioSourceNode
      try { ctx = new AudioContext({ sampleRate: 16000 }); source = ctx.createMediaStreamSource(stream) }
      catch { ctx = new AudioContext(); source = ctx.createMediaStreamSource(stream) }
      run.ctx = ctx
      await ctx.resume().catch(() => {})
      // We decide when the student has stopped and hand the audio over. Left to decide on
      // its own, Azure waited 6+ seconds after the word (longer with room noise).
      const handOver = () => {
        if (run.closed) return
        run.closed = true
        setWordHint('checking'); setWordVolume(0)
        flush()
        for (const ps of run.pushes) { try { ps.close() } catch { /* already closed */ } }
      }
      // Voice detection reads the same samples Azure receives (a separate analyser node
      // once read silence while Azure heard the word, and fell back to the 6 s timeout).
      const t0 = Date.now()
      let floor = 1, voiceStart = 0, lastVoice = 0
      const detect = (vol: number) => {
        const now = Date.now()
        if (now - t0 < 250) floor = Math.min(floor, vol)
        const threshold = Math.max(0.08, Math.min(0.25, (floor === 1 ? 0.03 : floor) * 3))
        if (vol > threshold) { if (!voiceStart) voiceStart = now; lastVoice = now; run.voiced = true }
        run.peak = Math.max(run.peak, vol)
        setWordVolume(vol)
        if (!voiceStart) {
          setWordHint(now - t0 > 2000 ? 'go' : '')
          if (now - t0 > 6000) handOver()
        } else if (now - lastVoice > (phrase === word ? 700 : 900) || now - voiceStart > (phrase === word ? 4000 : 9000)) {
          handOver()
        } else {
          setWordHint('')
        }
      }
      const proc = ctx.createScriptProcessor(1024, 1, 1)
      run.proc = proc
      proc.onaudioprocess = e => {
        if (run.closed || run.cancelled) return
        const input = e.inputBuffer.getChannelData(0)
        run.chunks.push(toPcm16(input, ctx.sampleRate))
        flush()
        let sum = 0
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i]
        detect(Math.min(1, Math.sqrt(sum / input.length) * 3.2))
      }
      source.connect(proc); proc.connect(ctx.destination)
      if (run.cancelled) return
      setWordPhase('listening')

      const [{ token, region }, sdk] = await Promise.all([getToken(), import('microsoft-cognitiveservices-speech-sdk')])
      if (run.cancelled) return
      // Two checks on the same audio, at the same time:
      //  1. plain recognition: what did the student actually sound like? This is the main test.
      //     Calibrated 2026-10-06 with 10 native + 6 Spanish voices × 21 Unit-1 words (phrase context):
      //     native acceptance 98% (205/210); Spanish rejection 67% (85/126).
      //     Edge case: "hard-working" — non-GB native voices sometimes hear "hardworking" as one token;
      //     the aligner finds "hard" at position t and still passes correctly in practice.
      //  2. pronunciation score against the target: separates a clear word from a just-about one.
      //     On its own it was too noisy (natives 55–100, Spanish 54–70).
      const fmt = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
      const pushPlain = sdk.AudioInputStream.createPushStream(fmt)
      const pushScore = sdk.AudioInputStream.createPushStream(fmt)
      run.pushes = [pushPlain, pushScore]
      flush()
      if (run.closed) { pushPlain.close(); pushScore.close() }

      const cfgPlain = sdk.SpeechConfig.fromAuthorizationToken(token, region)
      cfgPlain.speechRecognitionLanguage = 'en-GB'
      cfgPlain.outputFormat = sdk.OutputFormat.Detailed
      const plain = new sdk.SpeechRecognizer(cfgPlain, sdk.AudioConfig.fromStreamInput(pushPlain))
      const cfgScore = sdk.SpeechConfig.fromAuthorizationToken(token, region)
      cfgScore.speechRecognitionLanguage = 'en-GB'
      const scorer = new sdk.SpeechRecognizer(cfgScore, sdk.AudioConfig.fromStreamInput(pushScore))
      // Miscue off: Azure lines the audio up against the target word and scores every sound.
      new sdk.PronunciationAssessmentConfig(phrase, sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Phoneme, false).applyTo(scorer)
      run.close = () => { plain.close(); scorer.close() }

      const once = (r: typeof plain) => new Promise<string>((resolve, reject) =>
        r.recognizeOnceAsync(res => resolve(res.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) || ''), e => reject(new Error(String(e)))))
      const [rawPlain, rawScore] = await Promise.all([once(plain), once(scorer)])
      if (run.cancelled || wordRun.current !== run) return
      const { voiced, peak } = run
      const seconds = run.chunks.reduce((a, c) => a + c.length, 0) / 16000
      setWordClip(wavUrl(run.chunks))
      endWordRun()

      const expected = norm(phrase).split(' ')
      const wordParts = norm(word).split(' ')  // ['hard','working'] for 'hard-working'
      const wordFlat = wordParts.join('')       // 'hardworking' — Azure sometimes merges compound words
      const t = Math.max(0, expected.indexOf(wordParts[0]))
      const target = expected[t]
      let alts: { words: string[]; display: string }[] = []
      try {
        const j = JSON.parse(rawPlain || '{}') as { NBest?: { Lexical?: string; Display?: string }[] }
        alts = (j.NBest ?? []).slice(0, 3).map(n => ({ words: norm(n.Lexical ?? '').split(' ').filter(Boolean), display: (n.Display ?? n.Lexical ?? '').replace(/[.?!,]+$/, '') }))
      } catch { /* unreadable */ }
      let sc: { score: number | null; info: string } = { score: null, info: 'no score' }
      try { sc = scoreFrom(rawScore, word) } catch { /* unreadable */ }
      // Judge the target word by what was recognised in its place in the phrase.
      // Also accept merged compound tokens (e.g. Azure hears "hardworking" for "hard-working").
      const at = alts.map(a => alignedWord(expected, a.words, t))
      const topHeard = at[0] ?? ''
      const isTarget = (w: string | null) => !!w && (w === target || (wordParts.length > 1 && w === wordFlat))
      // In "Sound British" mode, require a higher pronunciation score to reach green.
      const scoreThreshold = pronGoal === 'british' ? 65 : 50
      let result: WordResult | null
      if (isTarget(at[0])) result = sc.score !== null && sc.score < scoreThreshold ? 'amber' : 'good'
      else if (at.slice(1).some(isTarget)) result = 'amber'
      else result = voiced || alts.length ? 'bad' : null
      if (debugOn) setWordDebug(`heard ${alts.map(a => `"${a.display}"`).join(' / ') || 'nothing'} · in place of "${target}": ${at.map(x => x ?? '∅').join('/')} · ${sc.info} · ${seconds.toFixed(1)}s · peak ${peak.toFixed(2)}`)
      if (result === null) {
        setWordErr("We didn't hear you. Tap \"Say it\" and speak up."); setWordPhase('idle'); setWordHint(''); return
      }
      setWordResult(result); setWordHeard(topHeard); setWordTries(n => n + 1); setWordPhase('done')
      if (result === 'good') {
        setWordHint(''); setWordStreak(n => Math.min(n + 1, STREAK_GOAL))
        setConsecutiveBad(0)
        if (drillActive.current) {
          drillReps.current++
          if (drillReps.current >= 2) {
            drillActive.current = false
            setDrillPhase(null); setDrillHighlight(-1)
          } else {
            setTimeout(async () => {
              if (!drillActive.current) return
              setWordResult(null); setWordPhase('idle'); setWordHint('')
              await hearAsync(word || '', 0.75)
              await sleep(300)
              if (drillActive.current) void sayWord()
            }, 900)
          }
        }
      } else if (result === 'amber') {
        setConsecutiveBad(0)
        if (drillActive.current) {
          drillReps.current++
          if (drillReps.current >= 2) {
            drillActive.current = false
            setDrillPhase(null); setDrillHighlight(-1)
          } else {
            setTimeout(async () => {
              if (!drillActive.current) return
              setWordResult(null); setWordPhase('idle'); setWordHint('')
              await hearAsync(word || '', 0.75)
              await sleep(300)
              if (drillActive.current) void sayWord()
            }, 900)
          }
        } else {
          setWordHint('listen')
          setTimeout(() => hear(phrase, () => setWordHint('yourturn')), 900)
        }
      } else {
        if (drillActive.current) {
          setTimeout(async () => {
            if (!drillActive.current) return
            setWordResult(null); setWordPhase('idle'); setWordHint('')
            await hearAsync(word || '', 0.75)
            await sleep(300)
            if (drillActive.current) void sayWord()
          }, 900)
        } else {
          setConsecutiveBad(n => {
            const next = n + 1
            if (next >= 3) { setTimeout(() => startDrill(), 1000) }
            else {
              setWordHint('listen')
              setTimeout(() => hear(phrase, () => setWordHint('yourturn')), 900)
            }
            return next
          })
        }
      }
    } catch (e) {
      fail(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  function closeCoach() {
    drillActive.current = false
    setDrillPhase(null)
    setDrillHighlight(-1)
    setConsecutiveBad(0)
    stopWord(); setPracticeWord(null)
  }
  async function startDrill() {
    const word = practiceWord
    if (!word) return
    const dd: DrillData = DRILL_DATA[word] ?? { syl: [word], p1: word.slice(0, Math.ceil(word.length / 2)), p2: word.slice(Math.ceil(word.length / 2)) }
    drillActive.current = true
    drillReps.current = 0
    setConsecutiveBad(0)
    setDrillPhase('intro')
    setWordHint(''); setWordResult(null)
    await sleep(2200)
    if (!drillActive.current) return

    setDrillPhase('play-slow'); setDrillHighlight(0)
    await hearAsync(dd.p1, 0.35)
    await sleep(350)
    if (!drillActive.current) return

    setDrillPhase('echo-slow')
    await vadDetect(500)
    await sleep(450)
    if (!drillActive.current) return

    setDrillPhase('play-hard'); setDrillHighlight(dd.syl.length - 1)
    await hearAsync(dd.p2, 0.3)
    await sleep(350)
    if (!drillActive.current) return

    setDrillPhase('echo-hard')
    await vadDetect(500)
    await sleep(450)
    if (!drillActive.current) return

    setDrillPhase('play-full'); setDrillHighlight(-1)
    await hearAsync(word, 0.75)
    await sleep(400)
    if (!drillActive.current) return

    setDrillPhase('listen-full')
    void sayWord()
  }

  async function startPractice() {
    if (!practiceWord || !student) return
    const phrase = practicePhrase || practiceWord
    setWordPhase('hearing'); setWordResult(null); setWordHint('')
    await hearAsync(phrase, 0.8)
    await sleep(350)
    if (!practiceWord) return
    void sayWord()
  }

  function resetToPick() { closeCoach(); setPhase('pick'); setFirst(null); setSecond(null); setFb(null) }

  const remaining = Math.max(0, MAX_SECONDS - secs)
  const report = (phase === 'thinking' || phase === 'feedback') && first

  const setup = (
    <div className="studio">
      {phase === 'pick' && (
        <>
          <div className="section-head">Choose a question</div>
          <div className="studio-qs">
            {questions.map((q, i) => (
              <button key={q} type="button" className={`studio-q${qi === i ? ' on' : ''}`} onClick={() => setQi(i)}>
                <span className="num">{i + 1}</span>{q}
              </button>
            ))}
          </div>
          <button type="button" className="studio-mic" onClick={() => start(1)} disabled={!student}>
            <span className="studio-mic-dot" />🎙️ Start speaking
          </button>
          <p className="studio-note">{student ? 'Speak for 60 to 90 seconds. Your words appear as you talk. Nothing is recorded or stored.' : "Sign in at Student's Corner to have your speaking checked."}</p>
        </>
      )}
      {phase === 'connecting' && <p className="studio-note studio-wait">Opening the microphone…</p>}
      {phase === 'recording' && (
        <div className="studio-live">
          <p className="studio-question">{questions[qi]}</p>
          <div className="studio-wave" aria-hidden>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}</div>
          <div className="studio-timer"><span style={{ width: `${(secs / MAX_SECONDS) * 100}%` }} className={secs >= 60 ? 'ok' : ''} /></div>
          <p className="studio-secs">{secs < 60 ? `${secs}s · keep going to 60` : `${secs}s · great, finish when you're ready (${remaining}s left)`}</p>
          <p className="studio-heard">{heard} <span className="studio-partial">{live}</span>{!heard && !live && <em>Listening…</em>}</p>
          <button type="button" className="btn studio-stop" onClick={() => void stop()}>■ I&apos;ve finished</button>
        </div>
      )}
      {err && <p className="err">{err}</p>}
    </div>
  )

  if (phase === 'pick' || phase === 'connecting' || phase === 'recording') {
    return aside ? <div className="two-col-60">{setup}{aside}</div> : setup
  }

  if (phase === 'done' && first && second && fb) {
    return (
      <div className="studio-compare">
        <div className="section-head">Your second try</div>
        <p className="studio-heard studio-heard--done">{highlight(second.transcript, fb.fixes)}</p>
        <div className="studio-stats">
          <div><strong>{second.wordCount}</strong><span>{second.wordCount > first.wordCount ? `words (+${second.wordCount - first.wordCount})` : 'words'}</span></div>
          <div><strong className="small">{second.fluencyLabel}</strong><span>{second.fluency > first.fluency + 3 ? 'smoother than before' : 'flow'}</span></div>
          <div><strong>{fb.fixes.filter(f => has(second.transcript, f.fix)).length}/{fb.fixes.length}</strong><span>fixes used</span></div>
        </div>
        {fb.fixes.length > 0 && <p className="studio-note"><span className="hl-ok">Green</span> = a fix you used. <span className="hl-bad">Red</span> = the old mistake came back.</p>}
        {clip && <audio className="studio-clip" controls src={clip} />}
        <div className="row">
          <button type="button" className="btn" onClick={() => { setFirst(second); setTranscript(second.transcript); setSecond(null); void getFeedback(second.transcript) }}>Get feedback on this answer →</button>
          <button type="button" className="help-btn" onClick={resetToPick}>Try another question</button>
        </div>
      </div>
    )
  }

  if (!report) return setup

  const fixes = fb?.fixes ?? []
  const sounds = fb?.sounds ?? []
  // Words to say better: probable mispronunciations first, then words Azure scored low.
  const lowWords = Array.from(new Set(segs.current.flatMap(s => s.words).filter(w => w.accuracy < 70 && clean(w.word).length > 2).map(w => clean(w.word))))
    .filter(w => !sounds.some(x => clean(x.heard) === w))
  const practiseList: { word: string; heard?: string }[] = [...sounds.map(x => ({ word: x.meant, heard: x.heard })), ...lowWords.map(w => ({ word: w }))].slice(0, 8)
  const coach = practiceWord && (
    <WordCoach word={practiceWord} phrase={practicePhrase || practiceWord} result={wordResult} heard={wordHeard} before={wordBefore} phase={wordPhase} hint={wordHint}
      err={wordErr} explain={wordExplain} volume={wordVolume} streak={wordStreak} clip={wordClip} debug={wordDebug} tries={wordTries}
      goal={pronGoal} drillPhase={drillPhase} drillHighlight={drillHighlight}
      onStart={() => void startPractice()} onClose={closeCoach} onFinish={stopWord}
      onChangeGoal={() => setShowGoalModal(true)} />
  )
  return (
    <div className="rp">
      <header className="rp-head">
        <div className="rp-q"><span>You answered</span>{questions[qi]}</div>
        <div className="rp-meta">
          <span><b>{first.seconds}s</b> speaking</span>
          <span><b>{first.wordCount}</b> words</span>
          <span>{first.fluencyLabel}</span>
          {clip && <audio className="rp-audio" controls src={clip} />}
        </div>
      </header>

      <div className="rp-grid">
        <main className="rp-main">
          <div className="rp-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={view === 'said'} className={view === 'said' ? 'on' : ''} onClick={() => setView('said')}>What you said</button>
            <button type="button" role="tab" aria-selected={view === 'b1'} className={view === 'b1' ? 'on' : ''} onClick={() => setView('b1')} disabled={!fb?.b1Version}>
              Your B1 version{!fb && phase === 'thinking' ? ' …' : ''}
            </button>
          </div>

          {view === 'said' ? (
            <>
              {fb?.verdict && (
                <p className={`rp-verdict rp-verdict--${fb.level ?? 'starting'}`}>
                  <b>{fb.level === 'below' ? 'Not B1 yet' : fb.level === 'solid' ? 'Solid B1' : 'Starting B1'}</b> {fb.verdict}
                </p>
              )}
              {fb?.praise && <p className="rp-praise">👏 {fb.praise}</p>}
              <SaidText transcript={transcript} segs={segs.current} fixes={fixes} sounds={sounds} activeFix={activeFix}
                onWord={(w, h) => openWordPractice(w, h, 'said')} onFix={i => { closeCoach(); setActiveFix(i) }} />
              <p className="rp-legend">
                <span className="rp-key rp-key--fix"><s>wrong</s> <ins>right</ins></span> grammar fix
                <span className="rp-key rp-key--pron">word</span> say it better (tap)
                <span className="rp-key-tip">Tap any word to practise saying it.</span>
              </p>
            </>
          ) : fb?.b1Version ? (
            <>
              <p className="rp-b1-intro">This is <strong>your answer</strong> as a good starting-B1 student would say it. Same ideas, <mark className="rp-b1-new">highlighted</mark> parts are what changed.</p>
              <B1Text text={fb.b1Version} onWord={w => openWordPractice(w, undefined, 'b1')} />
              {!!fb.b1Why?.length && (
                <div className="rp-b1-why">
                  <strong>What B1 expects from you</strong>
                  <ul>{fb.b1Why.map((w, i) => <li key={i}>{w}</li>)}</ul>
                </div>
              )}
              <button type="button" className="help-btn" onClick={() => hear(fb.b1Version!.replace(/\[\[|\]\]/g, ''))}>🔊 Listen to it</button>
            </>
          ) : null}
        </main>

        <aside className="rp-side" ref={coachRef}>
          {practiceWord && !narrow ? coach : phase === 'thinking' ? (
            <div className="rp-card rp-reading" role="status">
              <div className="rp-reading-dots" aria-hidden><span /><span /><span /></div>
              <p className="rp-reading-title">Reading what you said…</p>
              <p className="rp-reading-sub">Checking your grammar, the words we misheard and writing your B1 version.</p>
            </div>
          ) : fbErr ? (
            <div className="rp-card">
              <p className="err">{fbErr}</p>
              <button type="button" className="btn" onClick={() => void getFeedback(transcript)}>Try again</button>
            </div>
          ) : fb && (
            <>
              {practiseList.length > 0 && (
                <div className="rp-card">
                  <div className="rp-card-head">Say these better</div>
                  <div className="rp-say">
                    {practiseList.map(x => (
                      <button key={x.word + (x.heard ?? '')} type="button" onClick={() => openWordPractice(x.word, x.heard, 'said')}>
                        <b>{x.word}</b>{x.heard && <small>we heard "{x.heard}"</small>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="rp-card">
                <div className="rp-card-head">{fixes.length ? `${fixes.length} thing${fixes.length > 1 ? 's' : ''} to fix` : 'Nothing to fix. Lovely.'}</div>
                <ol className="rp-fixes">
                  {fixes.map((f, i) => (
                    <li key={i} className={activeFix === i ? 'on' : ''}>
                      <button type="button" onClick={() => setActiveFix(activeFix === i ? null : i)}>
                        <s>{f.original}</s> → <ins>{f.fix}</ins>
                      </button>
                      {activeFix === i && <p className="rp-why">{f.why}</p>}
                    </li>
                  ))}
                </ol>
                {fixes.length > 0 && <p className="rp-small">These go into your <strong>Revise in 5</strong>.</p>}
              </div>

              {fb.drill.items.length > 0 && (
                <details className="rp-card rp-drill">
                  <summary>Quick practice · {fb.drill.prompt}</summary>
                  {fb.drill.items.map((it, i) => {
                    const ok = drillChecked ? checkAnswer(drill[i], [it.a]) !== 'wrong' : null
                    return (
                      <p key={i} className={`rp-drill-q ${ok === null ? '' : ok ? 'ok' : 'bad'}`}>
                        {it.q.split('___')[0]}
                        <input className="studio-gap" value={drill[i]} disabled={drillChecked} onChange={e => setDrill(d => d.map((x, k) => (k === i ? e.target.value : x)))} />
                        {it.q.split('___').slice(1).join('___')}
                        {drillChecked && (ok ? <span className="mark ok"> ✓</span> : <span className="mark bad"> ✗ <em>{it.a}</em></span>)}
                      </p>
                    )
                  })}
                  {!drillChecked && <button type="button" className="help-btn" onClick={() => setDrillChecked(true)}>Check</button>}
                </details>
              )}

              <div className="rp-card rp-again">
                <p><strong>Now say it again.</strong> {fb.sayAgain}</p>
                <button type="button" className="studio-mic" onClick={() => start(2)}><span className="studio-mic-dot" />🎙️ Say it again</button>
                <button type="button" className="rp-link" onClick={resetToPick}>Try a different question</button>
              </div>
            </>
          )}
          {err && <p className="err">{err}</p>}
        </aside>
      </div>
      {narrow && coach && createPortal(<div className="wc-sheet">{coach}</div>, document.body)}
      {showGoalModal && <GoalModal onChoose={chooseGoal} />}
    </div>
  )
}
