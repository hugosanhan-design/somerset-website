'use client'

import { useEffect, useRef, useState } from 'react'
import { parseSegment, summarise, type Segment, type SpeakingSummary } from '@/lib/courses/speaking'
import { checkAnswer } from '@/lib/courses/b1u1'

const MAX_SECONDS = 90
type Fix = { sentence: string; original: string; fix: string; why: string }
type Feedback = { fixes: Fix[]; drill: { prompt: string; items: { q: string; a: string }[] }; sayAgain: string; praise: string; length: 'short' | 'good' }
type Phase = 'pick' | 'connecting' | 'recording' | 'review' | 'thinking' | 'feedback' | 'done'
type Rec = { stop: () => Promise<void> }
type PronExplain = { ipa: string; how: string; rule: string | null; why: string; similar: string[] }

function pronunciationClass(accuracy: number, error: string) {
  if (error === 'Omission') return 'pron-omit'
  if (accuracy >= 80) return 'pron-ok'
  if (accuracy >= 55) return 'pron-ok pron-amber'
  return 'pron-bad'
}

// Renders the "what we heard" transcript as tappable words, with pronunciation
// colour coding where Azure returned data for that word.
function HeardWords({ transcript, segs, onPractise }: { transcript: string; segs: Segment[]; onPractise: (word: string) => void }) {
  const pronMap = new Map<string, { accuracy: number; error: string }>()
  segs.flatMap(s => s.words).forEach(w => pronMap.set(w.word.toLowerCase().replace(/[^a-z']/g, ''), { accuracy: w.accuracy, error: w.error }))
  const tokens = transcript.split(/(\s+)/)
  return (
    <div className="heard-words">
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return <span key={i}> </span>
        const clean = tok.toLowerCase().replace(/[^a-z']/g, '')
        const p = pronMap.get(clean)
        const cls = p ? pronunciationClass(p.accuracy, p.error) : ''
        const isOmit = p?.error === 'Omission'
        return !isOmit ? (
          <button key={i} type="button" className={`heard-word-btn${cls ? ' ' + cls : ''}`}
            title={p ? `${Math.round(p.accuracy)}% — tap to practise` : 'Tap to practise'}
            onClick={() => onPractise(clean || tok)}>
            {tok}
          </button>
        ) : (
          <span key={i} className="pron-omit">{tok}</span>
        )
      })}
    </div>
  )
}

function WordPracticePanel({ word, score, phase, explain, explainLoading, onSay, onHear, onClose }: {
  word: string; score: number | null; phase: 'idle' | 'listening' | 'done'
  explain: PronExplain | null; explainLoading: boolean
  onSay: () => void; onHear: (w: string) => void; onClose: () => void
}) {
  const sc = score === null ? 'word-display--idle' : score >= 80 ? 'word-display--good' : score >= 55 ? 'word-display--amber' : 'word-display--bad'
  const msg = score === null ? null : score >= 80
    ? { emoji: '😊', text: 'Perfect! You\'ve got this one.' }
    : score >= 55
    ? { emoji: '🙂', text: 'Nearly there — try once more.' }
    : { emoji: '💪', text: 'Keep going — you\'ll get it.' }
  return (
    <div className="word-practice-panel">
      <button type="button" className="word-practice-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="word-display-wrap">
        <span className={`word-display ${sc}`}>{word}</span>
        {explain?.ipa && <span className="word-practice-ipa">{explain.ipa}</span>}
      </div>
      {msg && <p className={`word-msg word-msg--${score! >= 80 ? 'good' : score! >= 55 ? 'amber' : 'bad'}`}>{msg.emoji} {msg.text}</p>}
      <div className="word-practice-actions">
        <button type="button" className="help-btn" onClick={() => onHear(word)}>🔊 Hear it</button>
        <button type="button" className={`studio-mic studio-mic--sm${phase === 'listening' ? ' studio-mic--active' : ''}`} onClick={onSay} disabled={phase === 'listening'}>
          <span className="studio-mic-dot" />{phase === 'listening' ? 'Listening…' : '🎙️ Say it'}
        </button>
      </div>
      {explainLoading && <p className="word-practice-loading">Loading explanation…</p>}
      {explain && (
        <div className="word-practice-explain">
          <p className="word-practice-how">{explain.how}</p>
          {explain.rule && <p className="word-practice-rule"><strong>Rule:</strong> {explain.rule}</p>}
          <p className="word-practice-why"><strong>Why it sounds like this:</strong> {explain.why}</p>
          {explain.similar.length > 0 && (
            <p className="word-practice-similar">Same pattern: <em>{explain.similar.join(' · ')}</em></p>
          )}
        </div>
      )}
    </div>
  )
}

// The speaking loop, built on what worked in the Aoife prototype:
// speak → "this is what we heard" (fix only mishearings) → at most three fixes from
// your own words + one quick drill → say it again → see what got better.
// Audio streams from the microphone straight to Azure; nothing is stored.
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

export default function SpeakingStudio({ questions, student, onSpoken, onFixes, onSecondTry }: {
  questions: string[]
  student: { name: string; code: string } | null
  onSpoken: (s: SpeakingSummary) => void
  onFixes: (fixes: Fix[]) => void
  onSecondTry: (s: SpeakingSummary) => void
}) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [qi, setQi] = useState(0)
  const [, setAttempt] = useState<1 | 2>(1)
  const [live, setLive] = useState('')
  const [heard, setHeard] = useState('')
  const [secs, setSecs] = useState(0)
  const [err, setErr] = useState('')
  const [first, setFirst] = useState<SpeakingSummary | null>(null)
  const [second, setSecond] = useState<SpeakingSummary | null>(null)
  const [transcript, setTranscript] = useState('')
  const [fb, setFb] = useState<Feedback | null>(null)
  const [drill, setDrill] = useState<string[]>([])
  const [drillChecked, setDrillChecked] = useState(false)
  const [clip, setClip] = useState('')
  const [practiceWord, setPracticeWord] = useState<string | null>(null)
  const [wordPhase, setWordPhase] = useState<'idle' | 'listening' | 'done'>('idle')
  const [wordScore, setWordScore] = useState<number | null>(null)
  const [wordExplain, setWordExplain] = useState<PronExplain | null>(null)
  const [wordExplainLoading, setWordExplainLoading] = useState(false)
  const segs = useRef<Segment[]>([])
  const attemptRef = useRef<1 | 2>(1)
  const rec = useRef<Rec | null>(null)
  const media = useRef<{ mr: MediaRecorder; stream: MediaStream; chunks: Blob[] } | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { void rec.current?.stop(); stopMedia(); if (timer.current) clearInterval(timer.current) }, [])

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
    setAttempt(which); attemptRef.current = which; setPhase('connecting'); setLive(''); setHeard(''); setSecs(0); setClip('')
    segs.current = []
    try {
      // Microphone permission first, so a blocked mic never uses up a speaking session.
      await startMedia()
      const r = await fetch('/api/courses/speech-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(student) })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Speaking practice is unavailable right now.')
      const sdk = await import('microsoft-cognitiveservices-speech-sdk')
      const cfg = sdk.SpeechConfig.fromAuthorizationToken(d.token, d.region)
      cfg.speechRecognitionLanguage = 'en-GB'
      // B1 learners pause longer when thinking in English — give them more space.
      cfg.setProperty(sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, '2500')
      const recognizer = new sdk.SpeechRecognizer(cfg, sdk.AudioConfig.fromDefaultMicrophoneInput())
      // Empty reference text = unscripted: transcript + pronunciation scores in one pass.
      const pa = new sdk.PronunciationAssessmentConfig('', sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Word, false)
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
      setFirst(sum); setTranscript(sum.transcript); setPhase('review'); onSpoken(sum)
    } else {
      setSecond(sum); setPhase('done'); onSecondTry(sum)
    }
  }

  async function getFeedback() {
    setErr(''); setPhase('thinking')
    try {
      const r = await fetch('/api/courses/speaking-feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, question: questions[qi], transcript }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Feedback is unavailable right now.')
      setFb(d); setDrill(Array(d.drill.items.length).fill('')); setDrillChecked(false)
      onFixes(d.fixes)
      setPhase('feedback')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Feedback is unavailable right now.'); setPhase('review')
    }
  }

  function hear(word: string) {
    try {
      const u = new SpeechSynthesisUtterance(word)
      u.lang = 'en-GB'; u.rate = 0.85
      const v = speechSynthesis.getVoices().find(x => x.lang === 'en-GB')
      if (v) u.voice = v
      speechSynthesis.cancel(); speechSynthesis.speak(u)
    } catch { /* no speech synthesis: ignore */ }
  }

  async function openWordPractice(word: string) {
    setPracticeWord(word)
    setWordPhase('idle')
    setWordScore(null)
    setWordExplain(null)
    setWordExplainLoading(true)
    try {
      const r = await fetch('/api/courses/pronunciation-explain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      })
      if (r.ok) setWordExplain(await r.json())
    } catch { /* explanation is optional */ }
    setWordExplainLoading(false)
  }

  async function sayWord() {
    if (!practiceWord || !student) return
    setWordPhase('listening')
    setWordScore(null)
    try {
      const r = await fetch('/api/courses/speech-token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { setWordPhase('idle'); return }
      const sdk = await import('microsoft-cognitiveservices-speech-sdk')
      const cfg = sdk.SpeechConfig.fromAuthorizationToken(d.token, d.region)
      cfg.speechRecognitionLanguage = 'en-GB'
      const pa = new sdk.PronunciationAssessmentConfig(
        practiceWord,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        true,
      )
      const recognizer = new sdk.SpeechRecognizer(cfg, sdk.AudioConfig.fromDefaultMicrophoneInput())
      pa.applyTo(recognizer)
      recognizer.recognizeOnceAsync(result => {
        recognizer.close()
        try {
          const json = JSON.parse(result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) || '{}')
          const score: unknown = json.NBest?.[0]?.PronunciationAssessment?.AccuracyScore
          setWordScore(typeof score === 'number' ? score : null)
        } catch { setWordScore(null) }
        setWordPhase('done')
      }, () => { setWordPhase('idle') })
    } catch { setWordPhase('idle') }
  }

  const remaining = Math.max(0, MAX_SECONDS - secs)

  return (
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

      {phase === 'review' && first && (
        <>
          <div className="studio-stats">
            <div><strong>{first.seconds}s</strong><span>speaking</span></div>
            <div><strong>{first.wordCount}</strong><span>words</span></div>
            <div><strong className="small">{first.fluencyLabel}</strong><span>flow</span></div>
          </div>
          {clip && <audio className="studio-clip" controls src={clip} />}
          <label className="studio-label">Tap any word to practise its pronunciation. <small>Fix mishearings in the box below.</small></label>
          <HeardWords transcript={transcript} segs={segs.current} onPractise={openWordPractice} />
          {practiceWord && (
            <WordPracticePanel
              word={practiceWord}
              score={wordScore}
              phase={wordPhase}
              explain={wordExplain}
              explainLoading={wordExplainLoading}
              onSay={() => void sayWord()}
              onHear={hear}
              onClose={() => setPracticeWord(null)}
            />
          )}
          <label className="studio-label" style={{ marginTop: '0.75rem' }}><small>Correct only words we heard wrong (not your English):</small></label>
          <textarea className="writing studio-text" rows={5} value={transcript} onChange={e => setTranscript(e.target.value)} />
          {first.practise.length > 0 && (
            <div className="studio-practise">
              <span className="section-head">Words to practise saying</span>
              <div className="chips chips--static">{first.practise.map(w => <button key={w} type="button" className="chip studio-word" onClick={() => hear(w)}>🔊 {w}</button>)}</div>
            </div>
          )}
          <div className="row">
            <button type="button" className="btn" onClick={getFeedback}>Get my feedback →</button>
            <button type="button" className="help-btn" onClick={() => { setPhase('pick'); setFirst(null) }}>Record again</button>
          </div>
        </>
      )}

      {phase === 'thinking' && <p className="studio-note studio-wait">Reading what you said…</p>}

      {phase === 'done' && first && second && fb && (
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
            <button type="button" className="btn" onClick={() => { setFirst(second); setTranscript(second.transcript); setSecond(null); setFb(null); setPhase('review') }}>Get feedback on this answer →</button>
            <button type="button" className="help-btn" onClick={() => { setPhase('pick'); setFirst(null); setSecond(null); setFb(null) }}>Try another question</button>
          </div>
        </div>
      )}

      {phase === 'feedback' && fb && (
        <div className="studio-fb">
          <p className="studio-praise">👏 {fb.praise}</p>
          {fb.fixes.length > 0 ? (
            <div className="task-list">
              {fb.fixes.map((f, i) => (
                <div key={i} className="task-row studio-fix">
                  <span className="num">{i + 1}</span>
                  <span className="task-text">
                    <span>{f.sentence.split(f.original)[0]}<span className="struck">{f.original}</span> <strong className="spot-fix">{f.fix}</strong>{f.sentence.split(f.original).slice(1).join(f.original)}</span>
                    <span className="studio-why">{f.why}</span>
                  </span>
                </div>
              ))}
              <p className="studio-note">These go into your <strong>Revise in 5</strong>, so you&apos;ll see them again.</p>
            </div>
          ) : <p className="studio-note">No mistakes worth fixing. Lovely.</p>}

          {fb.drill.items.length > 0 && (
            <div className="studio-drill">
              <div className="section-head">{fb.drill.prompt}</div>
              {fb.drill.items.map((it, i) => {
                const ok = drillChecked ? checkAnswer(drill[i], [it.a]) !== 'wrong' : null
                return (
                  <div key={i} className={`task-row ${ok === null ? '' : ok ? 'ok' : 'bad'}`}>
                    <span className="task-text task-text--flow">
                      {it.q.split('___')[0]}
                      <input className="studio-gap" value={drill[i]} disabled={drillChecked} onChange={e => setDrill(d => d.map((x, k) => (k === i ? e.target.value : x)))} />
                      {it.q.split('___').slice(1).join('___')}
                      {drillChecked && !ok && <span className="mark bad mark--inline">✗ <em>{it.a}</em></span>}
                      {drillChecked && ok && <span className="mark ok mark--inline">✓</span>}
                    </span>
                  </div>
                )
              })}
              {!drillChecked && <div className="row"><button type="button" className="help-btn" onClick={() => setDrillChecked(true)}>Check</button></div>}
            </div>
          )}

          {(
            <div className="studio-again">
              <p><strong>Now say it again.</strong> {fb.sayAgain}</p>
              <button type="button" className="studio-mic" onClick={() => start(2)}><span className="studio-mic-dot" />🎙️ Say it again</button>
            </div>
          )}

        </div>
      )}

      {err && <p className="err">{err}</p>}
    </div>
  )
}
