'use client'
// Reusable word coach: listen, say the word inside a short phrase, three clean tries lock it in.
// After three misses it slows down: first chunk, hard chunk, whole word. Ported from the PET
// SpeakingStudio coach (same recogniser checks and thresholds) so any course can use it.

import { useEffect, useRef, useState } from 'react'
import type { SpeakingLang } from '@/lib/courses/speakingLang'
import { alignedWord, clean, getSpeechToken, neuralUrl, norm, playToEnd, toPcm16, wavUrl, type Student } from './speechCore'

const STREAK_GOAL = 3
type WordResult = 'good' | 'amber' | 'bad'
type WordPhase = 'idle' | 'hearing' | 'starting' | 'listening' | 'done'
type DrillPhase = 'intro' | 'play-slow' | 'echo-slow' | 'play-hard' | 'echo-hard' | 'play-full' | 'listen-full' | null
type WordHint = '' | 'go' | 'checking' | 'listen' | 'yourturn'
type PronExplain = { ipa: string; how: string; rule: string | null; similar: string[] }
type Run = {
  pushes: { write: (b: ArrayBuffer) => void; close: () => void }[]
  proc: ScriptProcessorNode | null; closed: boolean; close: () => void; stream: MediaStream; ctx: AudioContext | null
  cancelled: boolean; timer: ReturnType<typeof setTimeout> | null; chunks: Int16Array[]; sent: number; voiced: boolean
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

function scoreFrom(raw: string | undefined, ref: string): number | null {
  if (!raw) return null
  type W = { Word?: string; PronunciationAssessment?: { AccuracyScore?: number } }
  const json = JSON.parse(raw) as { NBest?: { Words?: W[] }[] }
  const words = json.NBest?.[0]?.Words ?? []
  const target = words.find(w => clean(w.Word ?? '') === clean(ref)) ?? words[0]
  const acc = target?.PronunciationAssessment?.AccuracyScore
  return typeof acc === 'number' ? acc : null
}

// Rough syllable split for the slow drill (vowel groups), good enough for both languages.
function chunks(word: string): { syl: string[]; p1: string; p2: string } {
  const V = /[aeiouáéíóúü]/i
  const syl: string[] = []
  let cur = ''
  for (let i = 0; i < word.length; i++) {
    const ch = word[i]
    if (V.test(cur) && !V.test(ch) && i + 1 < word.length && V.test(word[i + 1])) { syl.push(cur); cur = ch } else cur += ch
  }
  if (cur) syl.push(cur)
  if (syl.length < 2) return { syl: [word], p1: word.slice(0, Math.ceil(word.length / 2)), p2: word.slice(Math.ceil(word.length / 2)) }
  return { syl, p1: syl.slice(0, -1).join(''), p2: syl[syl.length - 1] }
}

export default function WordCoachPanel({ word, phrase, heardBefore = '', lang, student, onClose, onLocked }: {
  word: string; phrase: string; heardBefore?: string; lang: SpeakingLang; student: Student | null
  onClose: () => void; onLocked?: (word: string) => void
}) {
  const [phase, setPhase] = useState<WordPhase>('idle')
  const [result, setResult] = useState<WordResult | null>(null)
  const [heard, setHeard] = useState('')
  const [hint, setHint] = useState<WordHint>('')
  const [err, setErr] = useState('')
  const [explain, setExplain] = useState<PronExplain | null>(null)
  const [volume, setVolume] = useState(0)
  const [streak, setStreak] = useState(0)
  const [tries, setTries] = useState(0)
  const [clip, setClip] = useState('')
  const [drillPhase, setDrillPhase] = useState<DrillPhase>(null)
  const [drillHi, setDrillHi] = useState(-1)
  const badRun = useRef(0)
  const drillOn = useRef(false)
  const drillReps = useRef(0)
  const run = useRef<Run | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)
  const alive = useRef(true)
  const dd = chunks(word)

  useEffect(() => {
    alive.current = true
    audio.current = new Audio()
    setPhase('idle'); setResult(null); setStreak(0); setHint(''); setErr(''); setExplain(null); setClip(''); badRun.current = 0
    void import('microsoft-cognitiveservices-speech-sdk')
    if (student) void getSpeechToken(student).catch(() => {})
    fetch('/api/courses/pronunciation-explain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word, lang: lang.code }) })
      .then(r => (r.ok ? r.json() : null)).then(d => { if (d && alive.current) setExplain(d) }).catch(() => {})
    return () => { alive.current = false; drillOn.current = false; endRun(); audio.current?.pause() }
  }, [word]) // eslint-disable-line react-hooks/exhaustive-deps

  async function hear(text: string, rate = 0.85) {
    const url = await neuralUrl(text, lang, student, rate)
    if (url && audio.current && alive.current) { await playToEnd(audio.current, url); URL.revokeObjectURL(url) }
  }

  function endRun() {
    const r = run.current
    if (!r) return
    run.current = null
    if (r.timer) clearTimeout(r.timer)
    try { r.proc?.disconnect() } catch { /* gone */ }
    if (!r.closed) { r.closed = true; for (const p of r.pushes) { try { p.close() } catch { /* closed */ } } }
    try { r.close() } catch { /* closed */ }
    r.stream.getTracks().forEach(t => t.stop())
    r.ctx?.close().catch(() => {})
    setVolume(0)
  }

  async function sayWord() {
    if (!student || !alive.current) return
    endRun()
    setPhase('starting'); setResult(null); setHeard(''); setErr(''); setHint('')
    setClip(c => { if (c) URL.revokeObjectURL(c); return '' })
    let stream: MediaStream
    try {
      // Noise suppression off: it strips the quiet sounds we are scoring.
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true } })
    } catch { setErr('Your browser blocked the microphone. Allow it and try again.'); setPhase('idle'); return }
    const r: Run = { pushes: [], proc: null, closed: false, close: () => {}, stream, ctx: null, cancelled: false, timer: null, chunks: [], sent: 0, voiced: false }
    run.current = r
    const fail = (msg: string) => { if (r.cancelled || run.current !== r) return; endRun(); setErr(msg); setPhase('idle'); setHint('') }
    r.timer = setTimeout(() => fail('That took too long. Try again.'), 15000)
    const flush = () => {
      if (!r.pushes.length) return
      while (r.sent < r.chunks.length) { const b = r.chunks[r.sent++].buffer as ArrayBuffer; for (const p of r.pushes) p.write(b) }
    }
    try {
      let ctx: AudioContext, source: MediaStreamAudioSourceNode
      try { ctx = new AudioContext({ sampleRate: 16000 }); source = ctx.createMediaStreamSource(stream) }
      catch { ctx = new AudioContext(); source = ctx.createMediaStreamSource(stream) }
      r.ctx = ctx
      await ctx.resume().catch(() => {})
      const single = phrase === word
      const handOver = () => {
        if (r.closed) return
        r.closed = true; setHint('checking'); setVolume(0); flush()
        for (const p of r.pushes) { try { p.close() } catch { /* closed */ } }
      }
      const t0 = Date.now()
      let floor = 1, voiceStart = 0, lastVoice = 0
      const proc = ctx.createScriptProcessor(1024, 1, 1)
      r.proc = proc
      proc.onaudioprocess = e => {
        if (r.closed || r.cancelled) return
        const input = e.inputBuffer.getChannelData(0)
        r.chunks.push(toPcm16(input, ctx.sampleRate)); flush()
        let sum = 0
        for (let i = 0; i < input.length; i++) sum += input[i] * input[i]
        const vol = Math.min(1, Math.sqrt(sum / input.length) * 3.2)
        const now = Date.now()
        if (now - t0 < 250) floor = Math.min(floor, vol)
        const threshold = Math.max(0.08, Math.min(0.25, (floor === 1 ? 0.03 : floor) * 3))
        if (vol > threshold) { if (!voiceStart) voiceStart = now; lastVoice = now; r.voiced = true }
        setVolume(vol)
        if (!voiceStart) { setHint(now - t0 > 2000 ? 'go' : ''); if (now - t0 > 6000) handOver() }
        else if (now - lastVoice > (single ? 700 : 900) || now - voiceStart > (single ? 4000 : 9000)) handOver()
        else setHint('')
      }
      source.connect(proc); proc.connect(ctx.destination)
      setPhase('listening')

      const [{ token, region }, sdk] = await Promise.all([getSpeechToken(student), import('microsoft-cognitiveservices-speech-sdk')])
      if (r.cancelled) return
      const fmt = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
      const pushPlain = sdk.AudioInputStream.createPushStream(fmt)
      const pushScore = sdk.AudioInputStream.createPushStream(fmt)
      r.pushes = [pushPlain, pushScore]
      flush()
      if (r.closed) { pushPlain.close(); pushScore.close() }
      const cfgPlain = sdk.SpeechConfig.fromAuthorizationToken(token, region)
      cfgPlain.speechRecognitionLanguage = lang.locale
      cfgPlain.outputFormat = sdk.OutputFormat.Detailed
      const plain = new sdk.SpeechRecognizer(cfgPlain, sdk.AudioConfig.fromStreamInput(pushPlain))
      const cfgScore = sdk.SpeechConfig.fromAuthorizationToken(token, region)
      cfgScore.speechRecognitionLanguage = lang.locale
      const scorer = new sdk.SpeechRecognizer(cfgScore, sdk.AudioConfig.fromStreamInput(pushScore))
      new sdk.PronunciationAssessmentConfig(phrase, sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Phoneme, false).applyTo(scorer)
      r.close = () => { plain.close(); scorer.close() }
      const once = (rec: typeof plain) => new Promise<string>((resolve, reject) =>
        rec.recognizeOnceAsync(res => resolve(res.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) || ''), e => reject(new Error(String(e)))))
      const [rawPlain, rawScore] = await Promise.all([once(plain), once(scorer)])
      if (r.cancelled || run.current !== r) return
      const voiced = r.voiced
      setClip(wavUrl(r.chunks))
      endRun()

      // Judge the target word by what was recognised in its place in the phrase (PET method).
      const expected = norm(phrase).split(' ')
      const parts = norm(word).split(' ')
      const t = Math.max(0, expected.indexOf(parts[0]))
      const target = expected[t]
      let alts: string[][] = []
      try {
        const j = JSON.parse(rawPlain || '{}') as { NBest?: { Lexical?: string }[] }
        alts = (j.NBest ?? []).slice(0, 3).map(n => norm(n.Lexical ?? '').split(' ').filter(Boolean))
      } catch { /* unreadable */ }
      let sc: number | null = null
      try { sc = scoreFrom(rawScore, word) } catch { /* unreadable */ }
      const at = alts.map(a => alignedWord(expected, a, t))
      const isTarget = (w: string | null) => !!w && (w === target || (parts.length > 1 && w === parts.join('')))
      let british = false
      try { british = lang.goalPicker && localStorage.getItem('pron-goal') === 'british' } catch { /* private */ }
      const threshold = british ? 65 : 50
      let res: WordResult | null
      if (isTarget(at[0])) res = sc !== null && sc < threshold ? 'amber' : 'good'
      else if (at.slice(1).some(isTarget)) res = 'amber'
      else res = voiced || alts.length ? 'bad' : null
      if (res === null) { setErr("We didn't hear you. Tap Start and speak up."); setPhase('idle'); return }
      setResult(res); setHeard(at[0] ?? ''); setTries(n => n + 1); setPhase('done')
      afterResult(res)
    } catch (e) {
      fail(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  function afterResult(res: WordResult) {
    if (res === 'good') {
      badRun.current = 0
      setStreak(n => {
        const next = Math.min(n + 1, STREAK_GOAL)
        if (next === STREAK_GOAL) onLocked?.(word)
        return next
      })
    }
    if (drillOn.current) {
      if (res !== 'bad') drillReps.current++
      if (drillReps.current >= 2) { drillOn.current = false; setDrillPhase(null); setDrillHi(-1); return }
      setTimeout(async () => {
        if (!drillOn.current) return
        setResult(null); setPhase('idle')
        await hear(word, 0.75); await sleep(300)
        if (drillOn.current) void sayWord()
      }, 900)
      return
    }
    if (res === 'good') return
    if (res === 'bad') badRun.current++
    if (badRun.current >= 3) { setTimeout(() => void startDrill(), 1000); return }
    setHint('listen')
    setTimeout(async () => { await hear(phrase); setHint('yourturn'); setTimeout(() => void sayWord(), 500) }, 900)
  }

  async function startDrill() {
    drillOn.current = true; drillReps.current = 0; badRun.current = 0
    setDrillPhase('intro'); setHint(''); setResult(null)
    await sleep(2000); if (!drillOn.current) return
    setDrillPhase('play-slow'); setDrillHi(0); await hear(dd.p1, 0.35); await sleep(350); if (!drillOn.current) return
    setDrillPhase('echo-slow'); await sleep(2200); if (!drillOn.current) return
    setDrillPhase('play-hard'); setDrillHi(dd.syl.length - 1); await hear(dd.p2, 0.3); await sleep(350); if (!drillOn.current) return
    setDrillPhase('echo-hard'); await sleep(2200); if (!drillOn.current) return
    setDrillPhase('play-full'); setDrillHi(-1); await hear(word, 0.75); await sleep(400); if (!drillOn.current) return
    setDrillPhase('listen-full'); void sayWord()
  }

  async function start() {
    if (!student) return
    setPhase('hearing'); setResult(null); setHint('')
    await hear(phrase, 0.8); await sleep(300)
    if (alive.current) void sayWord()
  }

  function stop() { if (run.current) run.current.cancelled = true; endRun(); setPhase('idle'); setHint('') }
  function close() { drillOn.current = false; stop(); onClose() }

  const tier = phase === 'listening' ? 'listening' : result ?? 'idle'
  const locked = streak >= STREAK_GOAL
  const p = phrase.split(/\s+/)
  const at = p.findIndex(w => norm(w) === norm(word))
  const drillMsg = drillPhase === 'intro' ? "Let's go slower. Repeat after me."
    : drillPhase === 'play-slow' ? 'Listen carefully…' : drillPhase === 'echo-slow' ? 'Now you say it'
    : drillPhase === 'play-hard' ? 'Now the hard part…' : drillPhase === 'echo-hard' ? 'Say that part'
    : drillPhase === 'play-full' ? 'The whole word:' : drillPhase === 'listen-full' ? 'Your turn' : null
  const message = drillMsg ?? (
    !student ? "Sign in at Student's Corner to practise out loud."
    : phase === 'starting' ? 'One moment…'
    : phase === 'hearing' ? 'Listen…'
    : phase === 'listening' ? (hint === 'go' ? 'Go on, say it now' : hint === 'checking' ? 'Checking…' : 'Say it now')
    : result === null ? (heardBefore ? `We heard "${heardBefore}" for this word. Tap Start and say it clearly.` : 'Tap Start: listen, then say it.')
    : result === 'good' ? (locked ? 'Locked in! Pick another word.' : `Any ${lang.speakers} speaker would understand you. ${streak}/${STREAK_GOAL}, say it again`)
    : hint === 'yourturn' ? 'Your turn. Copy it.'
    : result === 'amber' ? `Nearly. "${word}" sounded a bit like "${heard}". Listen…`
    : heard ? `We heard "${heard}", not "${word}". Listen…` : `We didn't catch "${word}". Listen…`)
  const showEar = phase === 'hearing' || hint === 'listen' || ['play-slow', 'play-hard', 'play-full'].includes(drillPhase ?? '')
  const showMouth = phase === 'starting' || phase === 'listening' || ['echo-slow', 'echo-hard', 'listen-full'].includes(drillPhase ?? '')
  const style = phase === 'listening' && volume > 0 ? { transform: `scale(${1 + volume * 0.45})`, animation: 'none' } : undefined
  const inner = dd.syl.length > 1
    ? dd.syl.map((s, i) => {
      const on = drillHi >= 0 && ((drillHi === 0 && i < dd.syl.length - 1) || (drillHi === dd.syl.length - 1 && i === dd.syl.length - 1))
      return <span key={i} className={on ? 'syl syl--on' : 'syl'}>{s}</span>
    })
    : (at >= 0 ? p[at] : word)

  return (
    <div className="wc">
      <div className="wc-top-row">
        <button type="button" className="wc-close" onClick={close} aria-label="Close">x</button>
        <span className="wc-phrase">{p.map((w, i) => <span key={i} className={i === at ? 'on' : ''}>{w} </span>)}</span>
      </div>
      <div className="wc-streak" aria-label={`${streak} of ${STREAK_GOAL}`}>
        {Array.from({ length: STREAK_GOAL }, (_, i) => <span key={i} className={i < streak ? 'on' : ''} />)}
      </div>
      <div className="wc-word-wrap">
        <span key={tier === 'listening' ? 'l' : `r-${tries}`} className={`wc-word wc-word--${tier}`} style={style}>{inner}</span>
      </div>
      {explain?.ipa && <div className="wc-ipa">{explain.ipa}</div>}
      <p className={`wc-msg wc-msg--${tier}`}>{message}</p>
      <div className="wc-actions">
        <div className="wc-indicators">
          <span className={`wc-ear${showEar ? ' wc-ear--on' : ''}`} aria-label="Listening">👂</span>
          <span className={`wc-mouth${showMouth ? ' wc-mouth--on' : ''}`} aria-label="Speaking">👄</span>
        </div>
        {(phase === 'idle' || phase === 'done') && !drillPhase && !locked && student && (
          <button type="button" className="wc-start" onClick={() => void start()}>{result === null ? 'Start' : 'Try again'}</button>
        )}
        {locked && <span className="wc-locked">Locked in!</span>}
        {(phase === 'listening' || phase === 'starting') && !drillPhase && <button type="button" className="btn wc-stop" onClick={stop}>Stop</button>}
        {clip && phase === 'done' && !drillPhase && (
          <button type="button" className="help-btn" onClick={() => { try { void new Audio(clip).play() } catch { /* ignore */ } }}>Hear yourself</button>
        )}
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
