'use client'
// Read-aloud dialogue, hands-free after one tap.
// The other characters speak (recorded audio, e.g. ElevenLabs); when it's your line the
// microphone opens by itself, each word turns green as you say it well or red if it was
// missed or unclear, and the dialogue carries on. At the end the red words go to the word coach.
// Reusable in any course: pass the lines, the role the student reads and the language.

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SpeakingLang } from '@/lib/courses/speakingLang'
import { clean, getSpeechToken, neuralUrl, norm, phraseAround, playToEnd, sameWord, toPcm16, wavUrl, type Student } from './speechCore'
import WordCoachPanel from './WordCoachPanel'
import './dialogue-reader.css'

export type ReaderLine = { who: string; text: string; audio?: string }
type WS = 'idle' | 'live' | 'good' | 'bad'
type Tok = { t: string; w: number | null; stage?: boolean }   // w = index into the line's scored words
type Phase = 'ready' | 'starting' | 'running' | 'paused' | 'done'
type Turn = { push: { write: (b: ArrayBuffer) => void; close: () => void }; chunks: Int16Array[]; t0: number; voiceStart: number; lastVoice: number }

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

// Words to score, plus display tokens. [stage directions] are shown but never scored;
// hyphenated runs (cero-tres-cuatro) are scored word by word.
function tokenise(text: string): { toks: Tok[]; words: string[] } {
  const toks: Tok[] = []
  const words: string[] = []
  for (const t of text.split(/(\[[^\]]*\]|\s+|-)/).filter(Boolean)) {
    if (t.startsWith('[')) { toks.push({ t, w: null, stage: true }); continue }
    const c = clean(t)
    if (!c) { toks.push({ t, w: null }); continue }
    toks.push({ t, w: words.length }); words.push(c)
  }
  return { toks, words }
}

export default function DialogueReader({ lines, lang, student, narrator = 'Narrator', defaultRole, place, redBelow = 60, onFinish }: {
  lines: ReaderLine[]; lang: SpeakingLang; student: Student | null
  narrator?: string; defaultRole: string; place?: string
  redBelow?: number            // pronunciation score below this turns a word red (Azure 0-100)
  onFinish?: (s: { good: number; total: number; red: string[] }) => void
}) {
  const roles = useMemo(() => Array.from(new Set(lines.filter(l => l.who !== narrator).map(l => l.who))), [lines, narrator])
  const parsed = useMemo(() => lines.map(l => tokenise(l.text)), [lines])
  const [role, setRole] = useState(defaultRole)
  const [phase, setPhase] = useState<Phase>('ready')
  const [at, setAt] = useState(-1)                        // line being played or read
  const [mode, setMode] = useState<'listen' | 'speak' | 'scene' | ''>('')
  const [states, setStates] = useState<Record<number, WS[]>>({})
  const [clips, setClips] = useState<Record<number, string>>({})
  const [vol, setVol] = useState(0)
  const [quiet, setQuiet] = useState(false)
  const [err, setErr] = useState('')
  const [coach, setCoach] = useState<{ word: string; phrase: string } | null>(null)
  const [locked, setLocked] = useState<string[]>([])
  const [narrow, setNarrow] = useState(false)

  const runId = useRef(0)
  const audio = useRef<HTMLAudioElement | null>(null)
  const mic = useRef<{ stream: MediaStream; ctx: AudioContext; proc: ScriptProcessorNode } | null>(null)
  const turn = useRef<Turn | null>(null)
  const st = useRef<Record<number, WS[]>>({})
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const on = () => setNarrow(mq.matches)
    on(); mq.addEventListener('change', on)
    return () => { mq.removeEventListener('change', on); runId.current++; closeMic(); audio.current?.pause() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (at < 0) return
    const el = document.getElementById(`dlr-line-${at}`)
    const box = chatRef.current
    if (el && box) box.scrollTo({ top: el.offsetTop - box.clientHeight / 3, behavior: 'smooth' })
  }, [at])

  const setWord = (i: number, j: number, s: WS) => {
    const arr = (st.current[i] ??= parsed[i].words.map(() => 'idle' as WS))
    if (arr[j] === s) return
    arr[j] = s
    setStates({ ...st.current, [i]: [...arr] })
  }

  function closeMic() {
    const m = mic.current
    if (!m) return
    mic.current = null
    try { m.proc.disconnect() } catch { /* gone */ }
    m.stream.getTracks().forEach(t => t.stop())
    m.ctx.close().catch(() => {})
  }

  // One microphone pipeline for the whole dialogue, opened on the Start tap (browsers need
  // a tap for the mic and for sound). Audio only goes to Azure while it's the student's turn.
  async function openMic() {
    if (mic.current) return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true } })
    let ctx: AudioContext
    try { ctx = new AudioContext({ sampleRate: 16000 }) } catch { ctx = new AudioContext() }
    await ctx.resume().catch(() => {})
    const source = ctx.createMediaStreamSource(stream)
    const proc = ctx.createScriptProcessor(1024, 1, 1)
    let floor = 1
    proc.onaudioprocess = e => {
      const tr = turn.current
      if (!tr) return
      const input = e.inputBuffer.getChannelData(0)
      const pcm = toPcm16(input, ctx.sampleRate)
      tr.chunks.push(pcm)
      tr.push.write(pcm.buffer as ArrayBuffer)
      let sum = 0
      for (let i = 0; i < input.length; i++) sum += input[i] * input[i]
      const v = Math.min(1, Math.sqrt(sum / input.length) * 3.2)
      const now = Date.now()
      if (now - tr.t0 < 300) floor = Math.min(floor, v)
      const threshold = Math.max(0.07, Math.min(0.25, (floor === 1 ? 0.03 : floor) * 3))
      if (v > threshold) { if (!tr.voiceStart) tr.voiceStart = now; tr.lastVoice = now }
      setVol(v)
    }
    source.connect(proc); proc.connect(ctx.destination)
    mic.current = { stream, ctx, proc }
  }

  async function play(i: number) {
    const l = lines[i]
    const el = audio.current
    if (!el) return
    if (l.audio) { await playToEnd(el, l.audio); return }
    const url = await neuralUrl(parsed[i].words.join(' '), lang, student)   // only when no recording exists
    if (url) { await playToEnd(el, url); URL.revokeObjectURL(url) }
  }

  async function listen(i: number, id: number) {
    const words = parsed[i].words
    if (!words.length) return
    st.current[i] = words.map(() => 'idle')
    setStates({ ...st.current })
    const [{ token, region }, sdk] = await Promise.all([getSpeechToken(student), import('microsoft-cognitiveservices-speech-sdk')])
    if (runId.current !== id) return
    const push = sdk.AudioInputStream.createPushStream(sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1))
    const cfg = sdk.SpeechConfig.fromAuthorizationToken(token, region)
    cfg.speechRecognitionLanguage = lang.locale
    cfg.setProperty(sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, '1100')
    const rec = new sdk.SpeechRecognizer(cfg, sdk.AudioConfig.fromStreamInput(push))
    // Scripted assessment against the line; miscue on so skipped words come back as omissions.
    new sdk.PronunciationAssessmentConfig(words.join(' '), sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Word, true).applyTo(rec)

    let cursor = 0, live = 0
    rec.recognizing = (_s, e) => {
      let c = cursor
      for (const h of norm(e.result.text).split(' ').filter(Boolean)) {
        for (let j = c; j < Math.min(words.length, c + 3); j++) {
          if (sameWord(words[j], h)) { if ((st.current[i]?.[j] ?? 'idle') === 'idle') setWord(i, j, 'live'); c = j + 1; break }
        }
      }
      live = Math.max(live, c)
    }
    rec.recognized = (_s, e) => {
      if (e.result.reason !== sdk.ResultReason.RecognizedSpeech) return
      type W = { Word?: string; PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string } }
      let ws: W[] = []
      try { ws = (JSON.parse(e.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) || '{}') as { NBest?: { Words?: W[] }[] }).NBest?.[0]?.Words ?? [] } catch { /* unreadable */ }
      const omitted: number[] = []
      for (const w of ws) {
        const et = w.PronunciationAssessment?.ErrorType ?? 'None'
        if (et === 'Insertion') continue
        const h = clean(w.Word ?? '')
        let j = -1
        for (let k = cursor; k < Math.min(words.length, cursor + 4); k++) if (sameWord(words[k], h)) { j = k; break }
        if (j < 0) continue
        if (et === 'Omission') { omitted.push(j); continue }
        for (let k = cursor; k < j; k++) if (st.current[i][k] !== 'good') setWord(i, k, 'bad')   // skipped over
        const acc = w.PronunciationAssessment?.AccuracyScore ?? 100
        setWord(i, j, et === 'Mispronunciation' || acc < redBelow ? 'bad' : 'good')
        cursor = j + 1
      }
      // Omissions count only before the last word they actually said (Azure may flag the rest
      // of the line as omitted when it is still coming in the next phrase).
      for (const j of omitted) if (j < cursor && st.current[i][j] !== 'good') setWord(i, j, 'bad')
      live = Math.max(live, cursor)
    }
    let stopped = false
    rec.sessionStopped = () => { stopped = true }
    rec.canceled = () => { stopped = true }

    await new Promise<void>((res, rej) => rec.startContinuousRecognitionAsync(res, e => rej(new Error(String(e)))))
    const t0 = Date.now()
    turn.current = { push, chunks: [], t0, voiceStart: 0, lastVoice: 0 }
    setQuiet(false)
    const cap = Math.max(8000, words.length * 900 + 5000)
    // The turn ends when the last word has been heard, after a pause once they've started,
    // or when time runs out. Then the dialogue carries on either way.
    for (;;) {
      await sleep(100)
      if (runId.current !== id) break
      const tr = turn.current!
      const now = Date.now()
      if (!tr.voiceStart && now - t0 > 4000) setQuiet(true)
      if (tr.voiceStart) setQuiet(false)
      if (live >= words.length && now - tr.lastVoice > 500) break
      if (tr.voiceStart && now - tr.lastVoice > 1800) break
      if (!tr.voiceStart && now - t0 > 10000) break
      if (now - t0 > cap) break
    }
    const tr = turn.current
    turn.current = null
    setVol(0); setQuiet(false)
    push.close()
    for (let k = 0; k < 30 && !stopped; k++) await sleep(100)       // let the last phrase come back
    await new Promise<void>(res => rec.stopContinuousRecognitionAsync(() => res(), () => res()))
    rec.close()
    for (let k = 0; k < words.length; k++) if (st.current[i][k] !== 'good') setWord(i, k, 'bad')
    if (tr && tr.chunks.length) { const url = wavUrl(tr.chunks); setClips(c => ({ ...c, [i]: url })) }
  }

  async function runFrom(start: number) {
    const id = ++runId.current
    setPhase('running'); setErr('')
    try {
      for (let i = start; i < lines.length; i++) {
        if (runId.current !== id) return
        setAt(i)
        const l = lines[i]
        if (l.who === narrator) {
          setMode('scene')
          await sleep(Math.min(4500, 1400 + parsed[i].words.length * 170))
        } else if (l.who === role) {
          setMode('speak')
          await sleep(250)
          await listen(i, id)
          await sleep(500)
        } else {
          setMode('listen')
          await play(i)
          await sleep(250)
        }
      }
      if (runId.current !== id) return
      setMode(''); setAt(-1); setPhase('done')
      const mine = lines.map((l, i) => (l.who === role ? i : -1)).filter(i => i >= 0)
      const all = mine.flatMap(i => st.current[i] ?? [])
      onFinish?.({ good: all.filter(s => s === 'good').length, total: all.length, red: redWords().map(r => r.word) })
    } catch (e) {
      if (runId.current !== id) return
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
      setPhase('paused'); setMode('')
    }
  }

  async function start(from = 0) {
    setErr('')
    if (!student) { setErr("Sign in at Student's Corner first, so your reading can be checked."); return }
    setPhase('starting')
    try {
      // This tap unlocks sound and the microphone for the whole dialogue.
      if (!audio.current) audio.current = new Audio()
      const el = audio.current
      const first = lines.find(l => l.audio)?.audio
      if (first) { el.muted = true; el.src = first; await el.play().catch(() => {}); el.pause(); el.muted = false }
      await openMic()
      void getSpeechToken(student).catch(() => {})
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setErr(/permission|denied|NotAllowed|microphone/i.test(msg) ? 'Your browser blocked the microphone. Allow it (the icon by the address bar) and try again.' : msg || 'Could not open the microphone.')
      setPhase('ready'); return
    }
    if (from === 0) { st.current = {}; setStates({}); setClips({}); setCoach(null); setLocked([]) }
    void runFrom(from)
  }

  function pause() { runId.current++; turn.current = null; audio.current?.pause(); setVol(0); setMode(''); setPhase('paused') }
  function again(newRole?: string) {
    runId.current++; audio.current?.pause(); closeMic()
    if (newRole) setRole(newRole)
    st.current = {}; setStates({}); setClips({}); setCoach(null); setLocked([]); setAt(-1); setPhase('ready')
  }

  function redWords() {
    const seen = new Set<string>()
    const out: { word: string; line: number }[] = []
    lines.forEach((l, i) => {
      if (l.who !== role) return
      ;(st.current[i] ?? []).forEach((s, j) => {
        const w = parsed[i].words[j]
        if (s === 'bad' && w.length > 1 && !seen.has(w)) { seen.add(w); out.push({ word: w, line: i }) }
      })
    })
    return out
  }

  const mine = lines.map((l, i) => (l.who === role ? i : -1)).filter(i => i >= 0)
  const scored = mine.flatMap(i => states[i] ?? [])
  const good = scored.filter(s => s === 'good').length
  const reds = phase === 'done' ? redWords() : []
  const pct = scored.length ? Math.round((good / scored.length) * 100) : 0
  const current = at >= 0 ? lines[at] : null
  const coachEl = coach && (
    <WordCoachPanel word={coach.word} phrase={coach.phrase} lang={lang} student={student}
      onClose={() => setCoach(null)} onLocked={w => setLocked(l => (l.includes(w) ? l : [...l, w]))} />
  )

  return (
    <div className={`dlr dlr--${lang.code}`}>
      <div className="dlr-grid">
        <div className="dlr-phone">
          <div className="dlr-bar">
            <span className="dlr-bar__dot" aria-hidden />
            <span className="dlr-bar__text"><strong>{place ?? 'Read the dialogue'}</strong><small>You are <b>{role}</b></small></span>
            {phase === 'running' && <button type="button" className="dlr-pause" onClick={pause}>❚❚ Pause</button>}
          </div>
          <div className="dlr-chat" ref={chatRef}>
            {lines.map((l, i) => {
              const isNow = i === at
              if (l.who === narrator) {
                return <p key={i} id={`dlr-line-${i}`} className={`dlr-scene${isNow ? ' now' : ''}`}>{l.text}</p>
              }
              const you = l.who === role
              const ws = states[i]
              return (
                <div key={i} id={`dlr-line-${i}`} className={`dlr-msg ${you ? 'dlr-msg--you' : 'dlr-msg--them'}${isNow ? ' now' : ''}${isNow && mode === 'speak' ? ' speaking' : ''}`}>
                  {!you && <span className="dlr-avatar" aria-hidden>{l.who.slice(0, 1)}</span>}
                  <div className="dlr-bubble">
                    <span className="dlr-who">{you ? `${l.who} (you)` : l.who}{isNow && mode === 'listen' && <span className="dlr-eq" aria-hidden><i /><i /><i /></span>}</span>
                    <span className="dlr-text">
                      {parsed[i].toks.map((t, k) => t.stage
                        ? <em key={k} className="dlr-stage">{t.t}</em>
                        : t.w === null || !you ? <span key={k}>{t.t}</span>
                        : <span key={k} className={`dlr-w dlr-w--${ws?.[t.w] ?? 'idle'}`}>{t.t}</span>)}
                    </span>
                    {you && clips[i] && phase !== 'running' && (
                      <button type="button" className="dlr-me" onClick={() => { try { void new Audio(clips[i]).play() } catch { /* ignore */ } }}>▶ hear yourself</button>
                    )}
                  </div>
                  {!you && l.audio && phase !== 'running' && (
                    <button type="button" className="dlr-play" aria-label="Listen to this line" onClick={() => { const a = audio.current ?? (audio.current = new Audio()); void playToEnd(a, l.audio!) }}>▶</button>
                  )}
                </div>
              )
            })}
          </div>
          {phase === 'running' && mode === 'speak' && (
            <div className="dlr-mic" aria-live="polite">
              <span className="dlr-mic__dot" style={{ transform: `scale(${1 + vol * 0.9})` }} />
              <span>{quiet ? 'Your turn: read the line out loud' : 'Listening… read your line'}</span>
            </div>
          )}
        </div>

        <aside className="dlr-side">
          {phase === 'ready' || phase === 'starting' ? (
            <div className="dlr-card">
              <p className="dlr-kicker">Read it aloud</p>
              <p className="dlr-title">You read one part. The others speak to you.</p>
              <ol className="dlr-how">
                <li>Listen to the other person.</li>
                <li>When your line lights up, the microphone opens by itself: read it out loud.</li>
                <li>Words turn <b className="g">green</b> when they&apos;re clear and <b className="r">red</b> when they need work. Keep going.</li>
                <li>At the end, practise your red words.</li>
              </ol>
              {roles.length > 1 && (
                <>
                  <p className="dlr-label">Your part</p>
                  <div className="dlr-roles">
                    {roles.map(r => (
                      <button key={r} type="button" className={`dlr-role${r === role ? ' on' : ''}`} onClick={() => setRole(r)}>{r}</button>
                    ))}
                  </div>
                </>
              )}
              <button type="button" className="dlr-start" onClick={() => void start(0)} disabled={phase === 'starting' || !student}>
                <span className="dlr-start__dot" />{phase === 'starting' ? 'Opening the microphone…' : 'Start the dialogue'}
              </button>
              <p className="dlr-note">{student ? 'One tap, then hands-free. Use headphones if you can. Nothing is recorded or stored.' : "Sign in at Student's Corner to have your reading checked."}</p>
            </div>
          ) : phase === 'running' || phase === 'paused' ? (
            <div className="dlr-card">
              <p className="dlr-kicker">{phase === 'paused' ? 'Paused' : mode === 'speak' ? 'Your turn' : mode === 'listen' ? `${current?.who} is speaking` : 'Scene'}</p>
              <p className="dlr-title">{phase === 'paused' ? 'Ready when you are.' : mode === 'speak' ? 'Read your line out loud.' : 'Listen.'}</p>
              <div className="dlr-meter">
                <span style={{ width: `${scored.length ? (scored.filter(s => s !== 'idle').length / scored.length) * 100 : 0}%` }} />
              </div>
              <p className="dlr-note"><b className="g">{good}</b> clear words so far · {mine.length} lines to read</p>
              {phase === 'paused' && (
                <button type="button" className="dlr-start" onClick={() => void start(Math.max(0, at))}><span className="dlr-start__dot" />Carry on</button>
              )}
            </div>
          ) : (
            <>
              {!(narrow && coach) && coach ? coachEl : (
                <div className="dlr-card">
                  <p className="dlr-kicker">Done</p>
                  <p className="dlr-score"><b>{pct}%</b> of your words were clear</p>
                  {reds.length > 0 ? (
                    <>
                      <p className="dlr-label">Practise these words <small>tap one</small></p>
                      <div className="dlr-reds">
                        {reds.map(r => (
                          <button key={r.word} type="button" className={`dlr-red${locked.includes(r.word) ? ' ok' : ''}`}
                            onClick={() => setCoach({ word: r.word, phrase: phraseAround(r.word, lines[r.line].text.replace(/\[[^\]]*\]/g, '')) })}>
                            {locked.includes(r.word) ? '✓ ' : ''}{r.word}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : <p className="dlr-note">Every word was clear. ¡Muy bien!</p>}
                  <div className="dlr-again">
                    <button type="button" className="dlr-btn" onClick={() => again()}>Read it again</button>
                    {roles.filter(r => r !== role).map(r => (
                      <button key={r} type="button" className="dlr-btn dlr-btn--ghost" onClick={() => again(r)}>Be {r}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {err && <p className="dlr-err">{err}</p>}
        </aside>
      </div>
      {narrow && coach && createPortal(<div className="wc-sheet dlr">{coachEl}</div>, document.body)}
    </div>
  )
}
