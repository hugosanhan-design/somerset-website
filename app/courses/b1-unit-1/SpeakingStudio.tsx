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
}
type Phase = 'pick' | 'connecting' | 'recording' | 'thinking' | 'feedback' | 'done'
type Rec = { stop: () => Promise<void> }
type PronExplain = { ipa: string; how: string; rule: string | null; similar: string[] }
type WordPhase = 'idle' | 'listening' | 'done'
type WordHint = '' | 'go' | 'checking' | 'listen' | 'yourturn'

const clean = (w: string) => w.toLowerCase().replace(/[^a-z']/g, '')

function pronClass(accuracy: number, error: string) {
  if (error === 'Omission') return 'pw-omit'
  if (accuracy >= 80) return ''
  if (accuracy >= 55) return 'pw-amber'
  return 'pw-bad'
}

// Splits the transcript into plain text and the stretches the feedback corrected,
// so corrections can be shown inside the student's own words.
type Piece = { kind: 'text'; text: string } | { kind: 'fix'; idx: number; text: string }
function piecesFor(transcript: string, fixes: Fix[]): Piece[] {
  const ranges: { start: number; end: number; idx: number }[] = []
  fixes.forEach((f, idx) => {
    const s = transcript.indexOf(f.sentence)
    const start = s >= 0 ? s + f.sentence.indexOf(f.original) : transcript.indexOf(f.original)
    if (start < 0) return
    const end = start + f.original.length
    if (ranges.some(r => start < r.end && end > r.start)) return
    ranges.push({ start, end, idx })
  })
  ranges.sort((a, b) => a.start - b.start)
  const out: Piece[] = []
  let at = 0
  for (const r of ranges) {
    if (r.start > at) out.push({ kind: 'text', text: transcript.slice(at, r.start) })
    out.push({ kind: 'fix', idx: r.idx, text: transcript.slice(r.start, r.end) })
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
function SaidText({ transcript, segs, fixes, activeFix, onWord, onFix }: {
  transcript: string; segs: Segment[]; fixes: Fix[]; activeFix: number | null
  onWord: (w: string) => void; onFix: (i: number) => void
}) {
  const pron = new Map<string, { accuracy: number; error: string }>()
  segs.flatMap(s => s.words).forEach(w => {
    const k = clean(w.word)
    const prev = pron.get(k)
    if (!prev || w.accuracy < prev.accuracy) pron.set(k, { accuracy: w.accuracy, error: w.error })
  })
  return (
    <p className="rp-text">
      {piecesFor(transcript, fixes).map((pc, i) => pc.kind === 'text'
        ? <Words key={i} text={pc.text} pron={pron} onWord={onWord} />
        : (
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

function WordCoach({ word, score, phase, hint, phoneme, err, explain, volume, streak, onSay, onHear, onClose, onFinish }: {
  word: string; score: number | null; phase: WordPhase; hint: WordHint
  phoneme: { phoneme: string; score: number } | null; err: string
  explain: PronExplain | null; volume: number; streak: number
  onSay: () => void; onHear: () => void; onClose: () => void; onFinish: () => void
}) {
  const tier = phase === 'listening' ? 'listening' : score === null ? 'idle' : score >= 80 ? 'good' : score >= 55 ? 'amber' : 'bad'
  const locked = streak >= STREAK_GOAL
  // While listening the word grows with the student's voice; the colour then eases to the result.
  const style = phase === 'listening' && volume > 0
    ? { transform: `scale(${1 + volume * 0.45})`, animation: 'none' }
    : undefined
  const message =
    phase === 'listening' ? (hint === 'go' ? 'Go on, say it now 🎤' : hint === 'checking' ? 'Checking…' : 'Listening…')
    : score === null ? (explain?.how ? '' : 'Tap “Say it” and say the word.')
    : locked ? '🔒 Locked in! Tap another word.'
    : score >= 80 ? `✓ Good! ${streak}/${STREAK_GOAL}, say it again`
    : hint === 'listen' ? '👂 Not yet. Listen…'
    : hint === 'yourturn' ? '🎙️ Your turn. Copy it.'
    : score >= 55 ? 'Nearly. Listen and try again.' : 'Not yet. Listen and try again.'

  return (
    <div className="wc">
      <button type="button" className="wc-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="wc-streak" aria-label={`${streak} of ${STREAK_GOAL}`}>
        {Array.from({ length: STREAK_GOAL }, (_, i) => <span key={i} className={i < streak ? 'on' : ''} />)}
      </div>
      <div className="wc-word-wrap">
        <span key={tier === 'listening' ? 'l' : `r-${score}`} className={`wc-word wc-word--${tier}`} style={style}>{word}</span>
      </div>
      {explain?.ipa && <div className="wc-ipa">{explain.ipa}</div>}
      <p className={`wc-msg wc-msg--${tier}`}>
        {message}
        {phoneme && score !== null && score < 80 && <span className="wc-phoneme"> · the /{phoneme.phoneme}/ sound</span>}
      </p>
      <div className="wc-actions">
        <button type="button" className="help-btn" onClick={onHear}>🔊 Hear it</button>
        {phase === 'listening'
          ? <button type="button" className="btn wc-stop" onClick={onFinish}>◼ Stop</button>
          : <button type="button" className="studio-mic studio-mic--sm" onClick={onSay} disabled={locked}>
              <span className="studio-mic-dot" />{locked ? 'Done' : hint === 'yourturn' ? 'Your turn' : 'Say it'}
            </button>}
      </div>
      {err && <p className="wc-err">{err}</p>}
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
  const [wordPhase, setWordPhase] = useState<WordPhase>('idle')
  const [wordScore, setWordScore] = useState<number | null>(null)
  const [wordPhoneme, setWordPhoneme] = useState<{ phoneme: string; score: number } | null>(null)
  const [wordHint, setWordHint] = useState<WordHint>('')
  const [wordErr, setWordErr] = useState('')
  const [wordExplain, setWordExplain] = useState<PronExplain | null>(null)
  const [wordVolume, setWordVolume] = useState(0)
  const [wordStreak, setWordStreak] = useState(0)
  const segs = useRef<Segment[]>([])
  const attemptRef = useRef<1 | 2>(1)
  const rec = useRef<Rec | null>(null)
  const media = useRef<{ mr: MediaRecorder; stream: MediaStream; chunks: Blob[] } | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const tokenRef = useRef<{ token: string; region: string; at: number } | null>(null)
  const wordRun = useRef<{ close: () => void; stream: MediaStream; ctx: AudioContext | null; raf: number; peak: number; cancelled: boolean } | null>(null)
  const coachRef = useRef<HTMLElement | null>(null)
  const [narrow, setNarrow] = useState(false)

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
    if (!student) { setErr('Sign in at Student’s Corner first, so your speaking can be checked.'); return }
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
      setErr('We didn’t catch enough. Speak a little closer to the microphone and try again.')
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

  function hear(word: string, onEnd?: () => void) {
    try {
      const u = new SpeechSynthesisUtterance(word)
      u.lang = 'en-GB'; u.rate = 0.8
      const v = speechSynthesis.getVoices().find(x => x.lang === 'en-GB')
      if (v) u.voice = v
      if (onEnd) u.onend = onEnd
      speechSynthesis.cancel(); speechSynthesis.speak(u)
    } catch { onEnd?.() }
  }

  async function openWordPractice(word: string) {
    endWordRun()
    setPracticeWord(word); setWordPhase('idle'); setWordScore(null); setWordPhoneme(null)
    setWordHint(''); setWordStreak(0); setWordErr(''); setWordExplain(null)
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
    cancelAnimationFrame(run.raf)
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

  function scoreFrom(raw: string | undefined, ref: string): { score: number | null; worst: { phoneme: string; score: number } | null } {
    if (!raw) return { score: null, worst: null }
    type P = { Phoneme?: string; PronunciationAssessment?: { AccuracyScore?: number } }
    type W = { Word?: string; PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string }; Phonemes?: P[] }
    const json = JSON.parse(raw) as { NBest?: { Words?: W[] }[] }
    const words = json.NBest?.[0]?.Words ?? []
    const target = words.find(w => clean(w.Word ?? '') === ref && w.PronunciationAssessment?.ErrorType !== 'Insertion') ?? words[0]
    if (!target) return { score: null, worst: null }
    if (target.PronunciationAssessment?.ErrorType === 'Omission') return { score: 10, worst: null }
    const phonemes = (target.Phonemes ?? [])
      .map(p => ({ phoneme: String(p.Phoneme ?? ''), score: p.PronunciationAssessment?.AccuracyScore }))
      .filter((p): p is { phoneme: string; score: number } => typeof p.score === 'number')
      .sort((a, b) => a.score - b.score)
    const acc = target.PronunciationAssessment?.AccuracyScore
    if (typeof acc !== 'number') return { score: null, worst: null }
    // Azure's word score can stay high when one sound is clearly wrong; the phoneme average can't.
    const avg = phonemes.length >= 2 ? phonemes.reduce((s, p) => s + p.score, 0) / phonemes.length : acc
    return { score: Math.round(Math.min(acc, avg)), worst: phonemes[0] && phonemes[0].score < 70 ? phonemes[0] : null }
  }

  async function sayWord() {
    const word = practiceWord
    if (!word || !student) return
    endWordRun()
    try { speechSynthesis.cancel() } catch { /* ignore */ }
    setWordPhase('listening'); setWordScore(null); setWordPhoneme(null); setWordErr(''); setWordHint('')

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    } catch {
      setWordErr('Your browser blocked the microphone. Allow it and try again.'); setWordPhase('idle'); return
    }
    const run = { close: () => {}, stream, ctx: null as AudioContext | null, raf: 0, peak: 0, cancelled: false }
    wordRun.current = run

    // One microphone stream feeds both the pulse and Azure (two streams at once upsets Safari).
    try {
      const ctx = new AudioContext()
      run.ctx = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      const t0 = Date.now()
      let lastVoice = 0
      const tick = () => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += (data[i] - 128) * (data[i] - 128)
        const vol = Math.min(1, Math.sqrt(sum / data.length) / 40)
        run.peak = Math.max(run.peak, vol)
        setWordVolume(vol)
        const now = Date.now()
        if (vol > 0.12) lastVoice = now
        setWordHint(!lastVoice ? (now - t0 > 2000 ? 'go' : '') : now - lastVoice > 400 ? 'checking' : '')
        run.raf = requestAnimationFrame(tick)
      }
      run.raf = requestAnimationFrame(tick)
    } catch { /* no Web Audio: the CSS pulse still shows */ }

    try {
      const { token, region } = await getToken()
      if (run.cancelled) return
      const sdk = await import('microsoft-cognitiveservices-speech-sdk')
      const cfg = sdk.SpeechConfig.fromAuthorizationToken(token, region)
      cfg.speechRecognitionLanguage = 'en-GB'
      cfg.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, '5000')
      cfg.setProperty(sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, '900')
      // Miscue off: Azure lines the audio up against the target word and scores every sound.
      // With miscue on, "brash" for "brush" counts as an extra word and the target as skipped.
      const pa = new sdk.PronunciationAssessmentConfig(word, sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Phoneme, false)
      const recognizer = new sdk.SpeechRecognizer(cfg, sdk.AudioConfig.fromStreamInput(stream))
      pa.applyTo(recognizer)
      run.close = () => recognizer.close()
      recognizer.recognizeOnceAsync(result => {
        if (run.cancelled) return
        const peak = run.peak
        endWordRun()
        let { score, worst } = { score: null as number | null, worst: null as { phoneme: string; score: number } | null }
        try { ({ score, worst } = scoreFrom(result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult), word)) } catch { /* unreadable result */ }
        // Heard a voice but Azure couldn't match it to the word at all: that's a miss, not silence.
        if (score === null && peak > 0.2) score = 15
        if (score === null) {
          setWordErr('We didn’t hear you. Tap “Say it” and speak up.'); setWordPhase('idle'); setWordHint(''); return
        }
        setWordScore(score); setWordPhoneme(worst); setWordPhase('done')
        if (score >= 80) {
          setWordHint(''); setWordStreak(s => Math.min(s + 1, STREAK_GOAL))
        } else {
          setWordHint('listen')
          setTimeout(() => hear(word, () => setWordHint('yourturn')), 700)
        }
      }, (e: string) => {
        if (run.cancelled) return
        console.error('[sayWord]', e)
        endWordRun(); setWordErr('The microphone dropped. Try again.'); setWordPhase('idle'); setWordHint('')
      })
    } catch (e) {
      endWordRun()
      setWordErr(e instanceof Error ? e.message : 'Something went wrong.'); setWordPhase('idle'); setWordHint('')
    }
  }

  function closeCoach() { stopWord(); setPracticeWord(null) }
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
          <p className="studio-note">{student ? 'Speak for 60 to 90 seconds. Your words appear as you talk. Nothing is recorded or stored.' : 'Sign in at Student’s Corner to have your speaking checked.'}</p>
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
  const coach = practiceWord && (
    <WordCoach word={practiceWord} score={wordScore} phase={wordPhase} hint={wordHint} phoneme={wordPhoneme}
      err={wordErr} explain={wordExplain} volume={wordVolume} streak={wordStreak}
      onSay={() => void sayWord()} onHear={() => hear(practiceWord)} onClose={closeCoach} onFinish={stopWord} />
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
              {fb?.praise && <p className="rp-praise">👏 {fb.praise}</p>}
              <SaidText transcript={transcript} segs={segs.current} fixes={fixes} activeFix={activeFix}
                onWord={openWordPractice} onFix={i => { closeCoach(); setActiveFix(i) }} />
              <p className="rp-legend">
                <span className="rp-key rp-key--fix"><s>wrong</s> <ins>right</ins></span> grammar fix
                <span className="rp-key rp-key--pron">word</span> say it better
                <span className="rp-key-tip">Tap any word to practise saying it.</span>
              </p>
            </>
          ) : fb?.b1Version ? (
            <>
              <p className="rp-b1-intro">This is <strong>your answer</strong> as a good starting-B1 student would say it. Same ideas, <mark className="rp-b1-new">highlighted</mark> parts are what changed.</p>
              <B1Text text={fb.b1Version} onWord={openWordPractice} />
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
            <p className="studio-note studio-wait">Reading what you said…</p>
          ) : fbErr ? (
            <div className="rp-card">
              <p className="err">{fbErr}</p>
              <button type="button" className="btn" onClick={() => void getFeedback(transcript)}>Try again</button>
            </div>
          ) : fb && (
            <>
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
    </div>
  )
}
