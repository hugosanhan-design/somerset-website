'use client'

import { useEffect, useRef, useState } from 'react'

// Function 6 — Aoife, the daily pen-pal. In-app page (premium design).
// Public page: signs in with name + code (Student's Corner), then drives the loop
// against /api/aoife/{next,transcribe,analyse,save}. Records in-browser (secure
// context on the deployed app, so the mic works).

const MAP: [string, string][] = [
  ['🏙️', 'Dublin'], ['🌉', 'The Liffey'], ['📚', 'Trinity'], ['🍳', 'Irish breakfast'], ['🦌', 'Phoenix Park'], ['🌧️', 'A soft day'], ['🎻', 'Temple Bar'],
  ['🍺', 'Guinness'], ['🌊', 'Sandymount'], ['🐟', 'Molly Malone'], ['⛰️', 'Howth'], ['🏑', 'Hurling'], ['☘️', "St Patrick's"], ['🚪', 'Georgian doors'],
  ['🎸', 'Grafton St'], ['🚆', 'The DART'], ['🎶', 'Galway'], ['🧗', 'Cliffs of Moher'], ['🗣️', 'Gaeilge'], ['🌋', "Giant's Causeway"], ['🧶', 'Aran Islands'],
  ['🧀', 'Cork market'], ['🍵', 'Irish tea'], ['✍️', 'Writers'], ['🦢', 'Children of Lir'], ['🎃', 'Samhain'], ['🥁', 'The bodhrán'], ['❤️', 'Grá'], ['🌅', 'Newgrange'], ['🏆', 'You did it!'],
]

interface DayData {
  finished?: boolean
  day: number
  week?: number
  title: string
  grammar?: string
  message: string
  questions?: string[]
  nugget?: { title: string; text: string }
  unlock?: { emoji: string; place: string; fact: string }
  daysDone?: number
  degraded?: boolean
}
interface Analysis {
  cleaned?: string
  errors: { original: string; fix: string; type: string; why: string }[]
  microExercise?: { prompt?: string; items?: { q: string; a: string }[] }
  rewriteHint?: string
  encouragement?: string
}

const LS = 'aoife_miriam'

export default function AoifePage() {
  const [screen, setScreen] = useState<'signin' | 'home' | 'day' | 'loading'>('loading')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [creds, setCreds] = useState<{ name: string; code: string } | null>(null)
  const [signinErr, setSigninErr] = useState('')
  const [busy, setBusy] = useState(false)

  const [day, setDay] = useState<DayData | null>(null)
  const [step, setStep] = useState<'record' | 'confirm' | 'feedback' | 'done'>('record')
  const [recording, setRecording] = useState(false)
  const [hasClip, setHasClip] = useState(false)
  const [clipUrl, setClipUrl] = useState('')
  const [recNote, setRecNote] = useState('')
  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [rewrite, setRewrite] = useState('')
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [reaction, setReaction] = useState('')
  const [stepErr, setStepErr] = useState('')

  const recRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const blobRef = useRef<Blob | null>(null)

  // ---- boot: restore creds ----
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LS) || 'null')
      if (s && s.name && s.code) {
        setCreds(s)
        loadNext(s).then((ok) => setScreen(ok ? 'home' : 'signin'))
        return
      }
    } catch {}
    setScreen('signin')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- api ----
  async function post(path: string, body: unknown, isForm = false) {
    const opts: RequestInit = { method: 'POST' }
    if (isForm) opts.body = body as FormData
    else {
      opts.headers = { 'Content-Type': 'application/json' }
      opts.body = JSON.stringify(body)
    }
    const r = await fetch(path, opts)
    const data = await r.json().catch(() => ({ error: 'Network error' }))
    if (!r.ok) throw new Error((data as { error?: string }).error || 'Something went wrong.')
    return data
  }
  async function loadNext(c: { name: string; code: string }) {
    try {
      const d = (await post('/api/aoife/next', { name: c.name, code: c.code })) as DayData
      setDay(d)
      return true
    } catch {
      return false
    }
  }

  // ---- sign in ----
  async function signIn() {
    setSigninErr('')
    if (!name.trim() || !code.trim()) { setSigninErr('Please type your name and code.'); return }
    const c = { name: name.trim(), code: code.trim() }
    setBusy(true)
    const ok = await loadNext(c)
    setBusy(false)
    if (ok) { setCreds(c); localStorage.setItem(LS, JSON.stringify(c)); setScreen('home') }
    else setSigninErr("That name and code didn't match. Check with Hugo.")
  }

  // ---- day flow ----
  function openDay() {
    if (!day || day.finished) return
    setStep('record'); resetRecorder(); setTranscript(''); setAnalysis(null); setRewrite(''); setRevealed(new Set()); setReaction(''); setStepErr('')
    setScreen('day'); window.scrollTo(0, 0)
  }
  async function goHome() {
    stopStream()
    if (creds) await loadNext(creds)
    setScreen('home'); window.scrollTo(0, 0)
  }

  // ---- recording ----
  async function toggleRec() {
    if (recRef.current && recRef.current.state === 'recording') { recRef.current.stop(); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      recRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        blobRef.current = blob
        setClipUrl(URL.createObjectURL(blob))
        setHasClip(true); setRecording(false); setRecNote('')
      }
      mr.start(); setRecording(true); setHasClip(false); setRecNote('Listening… speak your answer, then press Stop.')
    } catch {
      setRecNote('The microphone is blocked. Please allow the mic in your browser.')
    }
  }
  function resetRecorder() { blobRef.current = null; setHasClip(false); setClipUrl(''); setRecording(false); setRecNote('') }
  function stopStream() { if (recRef.current && recRef.current.state === 'recording') recRef.current.stop(); streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null }

  async function sendAudio() {
    if (!blobRef.current || !creds || !day) return
    setBusy(true); setStepErr('')
    try {
      const fd = new FormData()
      fd.append('name', creds.name); fd.append('code', creds.code); fd.append('file', blobRef.current, 'recording.webm')
      const data = (await post('/api/aoife/transcribe', fd, true)) as { transcript: string }
      setTranscript(data.transcript || '')
      setStep('confirm')
    } catch (e) { setRecNote((e as Error).message) } finally { setBusy(false) }
  }

  async function analyse() {
    if (!creds || !day) return
    const text = transcript.trim()
    if (text.split(/\s+/).length < 3) { setStepErr('Say a little more first — a full sentence or two.'); return }
    setBusy(true); setStepErr('')
    try {
      const a = (await post('/api/aoife/analyse', { name: creds.name, code: creds.code, day: day.day, text, question: day.questions?.[0] || '' })) as Analysis
      setAnalysis(a)
      setRewrite(a.cleaned || text)
      setStep('feedback')
    } catch (e) { setStepErr((e as Error).message) } finally { setBusy(false) }
  }

  async function saveDay() {
    if (!creds || !day) return
    setBusy(true); setStepErr('')
    try {
      const errorTypes = (analysis?.errors || []).map((e) => e.type).filter(Boolean)
      const errorFixes = (analysis?.errors || []).map((e) => e.fix).filter(Boolean)
      const res = (await post('/api/aoife/save', {
        name: creds.name, code: creds.code, day: day.day, question: day.questions?.[0] || '',
        transcript: transcript.trim(), rewrite: rewrite.trim(), errorTypes, errorFixes,
      })) as { daysDone: number; reaction?: string }
      setReaction(res.reaction || 'That reads so much better — well done!')
      setDay({ ...day, daysDone: res.daysDone })
      setStep('done')
    } catch (e) { setStepErr((e as Error).message) } finally { setBusy(false) }
  }

  // ---------------------------------------------------------------- render
  const done = day?.daysDone || 0
  const cur = day?.day || done + 1

  return (
    <div className="aoife-root">
      <style>{CSS}</style>
      <div className="wrap">
        <div className="logo">
          <span className="word">Somerset</span>
          <span className="lc">LANGUAGE<br />CENTRE</span>
          <span className="rt"><b>Speak Up! · Ireland</b><br />{creds?.name || 'Miriam'}</span>
        </div>

        {screen === 'loading' && <div className="card2" style={{ textAlign: 'center' }}><span className="spin" /> Loading…</div>}

        {/* SIGN IN */}
        {screen === 'signin' && (
          <>
            <div className="hero">
              <div className="k">Ten minutes a day · every day</div>
              <h1>30 Days with Aoife 🍀</h1>
              <p>Your friend in Dublin, Aoife (say it “EE-fa”), writes to you every day. You answer out loud. Sign in with the name and code Hugo gave you.</p>
            </div>
            <div className="card2">
              <label className="fl">Your name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Miriam" />
              <label className="fl">Your code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="MIRIAM-EIRE" onKeyDown={(e) => e.key === 'Enter' && signIn()} />
              <button className="btn big" disabled={busy} onClick={signIn}>{busy ? <><span className="spin" /> Checking…</> : 'Start →'}</button>
              {signinErr && <div className="err">{signinErr}</div>}
            </div>
          </>
        )}

        {/* HOME */}
        {screen === 'home' && day && (
          <>
            <div className="dash">
              <div className="big"><span className="n">{done}</span><span className="of">of 30 days done</span></div>
              <div className="barwrap"><div className="bar" style={{ width: `${(done / 30) * 100}%` }} /></div>
              <div className="proj">
                {day.finished ? '🏆 Thirty days done. You finished. Look how far you’ve come.'
                  : done === 0 ? 'Your first day is the hardest. After that, it’s just a habit.'
                  : `Keep going — ${30 - done} ${30 - done === 1 ? 'day' : 'days'} to a full month of English. 💪`}
              </div>
              {!day.finished && done > 0 && <div className="soft">Missed a day? It doesn’t matter at all — nothing resets. Every day you do counts forever.</div>}
            </div>
            <div className="maptitle">Your map of Ireland — a place a day</div>
            <div className="imap">
              {MAP.map((m, i) => {
                const dn = i + 1
                const isDone = dn <= done
                const isToday = dn === cur && !day.finished
                const locked = dn > cur && !isDone
                return (
                  <div key={dn} className={`tile${isDone ? ' done' : ''}${locked ? ' locked' : ''}${isToday ? ' today' : ''}`}>
                    <span className="dn">{dn}</span><span className="em">{m[0]}</span><span className="pl">{m[1]}</span>
                  </div>
                )
              })}
            </div>
            {!day.finished && <button className="btn big" onClick={openDay}>{done === 0 ? 'Start Day 1 →' : `Continue — Day ${cur} →`}</button>}
          </>
        )}

        {/* DAY */}
        {screen === 'day' && day && (
          <>
            <span className="backlink" onClick={goHome}>← Back to the map</span>
            <div className="daybar">
              <div className="wk">Week {day.week} · Day {day.day} of 30</div>
              <h2>{day.title}</h2>
              <div className="fc">Focus: {day.grammar}</div>
            </div>

            <div className="sec">
              <div className="sh"><span className="ic">💌</span><span className="tt">A message from Aoife</span></div>
              <div className="sb">
                <div className="msg">{day.message}<span className="sig">— Aoife 🍀</span></div>
                {day.nugget && <div className="nugget"><div className="t">🇮🇪 {day.nugget.title}</div><div className="x">{day.nugget.text}</div></div>}
              </div>
            </div>

            <div className="sec">
              <div className="sh"><span className="ic">🎙️</span><span className="tt">Answer her — out loud</span></div>
              <div className="sb">
                <div className="qlist">{(day.questions || []).map((q, i) => <div key={i} className="qitem">{i + 1}. {q}</div>)}</div>

                {step === 'record' && (
                  <div>
                    <p className="muted" style={{ margin: '12px 0 8px' }}>Say your answer out loud, then record it. Speak for about a minute.</p>
                    <div className="rec">
                      <button className="btn sm" onClick={toggleRec}>{recording ? '■ Stop' : hasClip ? '● Record again' : '● Record'}</button>
                      {recording && <span className="recdot on" />}
                      {clipUrl && <audio src={clipUrl} controls />}
                      {hasClip && !recording && <button className="btn sm ghost" disabled={busy} onClick={sendAudio}>{busy ? <><span className="spin" /> Listening…</> : 'Use this recording →'}</button>}
                    </div>
                    {recNote && <div className="recnote">{recNote}</div>}
                  </div>
                )}

                {step === 'confirm' && (
                  <div>
                    <label className="fl">Is this what you said? Fix anything the computer heard wrong.</label>
                    <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} />
                    <div className="row" style={{ marginTop: 10 }}>
                      <button className="btn" disabled={busy} onClick={analyse}>{busy ? <><span className="spin" /> Reading…</> : 'Yes, look at it →'}</button>
                      <button className="btn ghost sm" onClick={() => { setStep('record'); resetRecorder() }}>↻ Record again</button>
                    </div>
                    {stepErr && <div className="err">{stepErr}</div>}
                  </div>
                )}

                {step === 'feedback' && analysis && (
                  <div>
                    <div className="msg" style={{ fontSize: 16, marginBottom: 12 }}>{analysis.encouragement || 'Lovely work.'}</div>
                    {(analysis.errors || []).length ? analysis.errors.map((e, i) => (
                      <div key={i} className="errcard"><span className="o">{e.original}</span> → <span className="f">{e.fix}</span><div className="w">{e.why}</div></div>
                    )) : <div className="errcard" style={{ background: 'var(--greensoft)' }}>Nothing to fix here — that was clear and correct. 🌟</div>}
                    {analysis.microExercise?.items?.length ? (
                      <div className="drill">
                        <div className="p">{analysis.microExercise.prompt || 'Try these:'}</div>
                        {analysis.microExercise.items.map((it, i) => (
                          <div key={i} className="item">{i + 1}. {it.q}{' '}
                            {revealed.has(i) ? <>→ <b>{it.a}</b></> : <span className="rev" onClick={() => setRevealed(new Set(revealed).add(i))}>show</span>}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <label className="fl">Now write it again — a little better</label>
                    <div className="muted" style={{ marginBottom: 6 }}>{analysis.rewriteHint || 'Write your answer again, a little fuller.'}</div>
                    <textarea value={rewrite} onChange={(e) => setRewrite(e.target.value)} />
                    <button className="btn big" disabled={busy} onClick={saveDay}>{busy ? <><span className="spin" /> Sending…</> : '✓ Send to Aoife & finish today'}</button>
                    {stepErr && <div className="err">{stepErr}</div>}
                  </div>
                )}

                {step === 'done' && day.unlock && (
                  <div>
                    <div className="msg" style={{ fontSize: 16, marginBottom: 12 }}>{reaction}<span className="sig">— Aoife 🍀</span></div>
                    <div className="unlock on"><div className="em">{day.unlock.emoji}</div><div className="pl">{day.unlock.place} — unlocked!</div><div className="fx">{day.unlock.fact}</div></div>
                    <div className="done-banner on">{(day.daysDone || 0) >= 30 ? '🏆 That’s 30! You finished. Aoife is so proud.' : `🍀 Day ${day.day} done — ${day.daysDone} of 30. Come back tomorrow!`}</div>
                    <button className="btn big" onClick={goHome}>Back to the map →</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="foot">Somerset Language Centre · València · Speak Up! Intensivo · Ireland · your recordings are never stored, only what you write</div>
      </div>
    </div>
  )
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
.aoife-root{--green:#6BAE2E;--green-deep:#3f6d18;--green-ink:#2b4d10;--paper:#f6f4ee;--card:#fff;--ink:#23261f;--muted:#7c7c72;--hair:#e7e3d8;--gold:#9a6b12;--goldsoft:#f6efdf;--terra:#9e4430;--terrasoft:#f6eae4;--greensoft:#eef4ec;--shadow:0 1px 2px rgba(40,40,30,.04),0 12px 34px -14px rgba(40,45,30,.22);--shadow-sm:0 1px 2px rgba(40,40,30,.05),0 6px 16px -12px rgba(40,45,30,.28);
  font-family:'Inter',-apple-system,Arial,sans-serif;color:var(--ink);background:var(--paper);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;min-height:100vh;}
.aoife-root *{box-sizing:border-box;}
.aoife-root .wrap{max-width:820px;margin:0 auto;padding:22px 24px 60px;}
.aoife-root h1,.aoife-root h2{font-family:'Fraunces',Georgia,serif;margin:0;}
.aoife-root .logo{display:flex;align-items:flex-end;gap:11px;border-bottom:1px solid var(--hair);padding-bottom:14px;}
.aoife-root .logo .word{font-family:'Fraunces',serif;font-weight:600;font-size:26px;letter-spacing:-.5px;line-height:.95;}
.aoife-root .logo .lc{font-weight:600;font-size:9px;color:var(--muted);letter-spacing:3.5px;text-transform:uppercase;line-height:1.25;padding-bottom:4px;}
.aoife-root .logo .rt{margin-left:auto;text-align:right;font-size:12px;color:var(--muted);}.aoife-root .logo .rt b{color:var(--ink);}
.aoife-root .hero{background:linear-gradient(120deg,#22400f,#33590f 46%,#4b7c1c);color:#fff;border-radius:22px;padding:32px;margin:20px 0;box-shadow:var(--shadow);}
.aoife-root .hero .k{font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,.72);}
.aoife-root .hero h1{margin:10px 0 0;font-weight:600;font-size:32px;line-height:1.1;letter-spacing:-.5px;}
.aoife-root .hero p{margin:12px 0 0;font-size:15px;max-width:620px;color:rgba(255,255,255,.9);}
.aoife-root .card2{background:var(--card);border:1px solid var(--hair);border-radius:20px;padding:22px 24px;margin:16px 0;box-shadow:var(--shadow-sm);}
.aoife-root label.fl{display:block;font-weight:600;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:var(--green-deep);margin:12px 0 5px;}
.aoife-root input[type=text]{width:100%;border:1px solid var(--hair);border-radius:11px;padding:12px 14px;font-size:16px;font-family:inherit;background:#fdfcf9;}
.aoife-root input:focus,.aoife-root textarea:focus{outline:none;border-color:#c9d9b6;background:#fff;}
.aoife-root .btn{font-family:'Inter';border:1px solid var(--green-deep);background:var(--green-deep);color:#fff;border-radius:12px;padding:12px 20px;font-size:15px;font-weight:600;cursor:pointer;transition:all .16s;box-shadow:0 6px 16px -10px rgba(63,109,24,.7);}
.aoife-root .btn:hover{background:#365f14;}.aoife-root .btn:disabled{opacity:.45;cursor:not-allowed;}
.aoife-root .btn.ghost{background:var(--card);color:#55554d;border-color:var(--hair);box-shadow:none;}
.aoife-root .btn.sm{padding:8px 15px;font-size:13px;border-radius:11px;}.aoife-root .btn.big{width:100%;padding:16px;font-size:16px;margin-top:16px;}
.aoife-root .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
.aoife-root .err{color:var(--terra);font-weight:600;font-size:14px;margin-top:10px;}
.aoife-root .muted{color:var(--muted);font-size:13.5px;}
.aoife-root .dash{background:var(--card);border:1px solid var(--hair);border-radius:20px;padding:22px 24px;margin:16px 0;box-shadow:var(--shadow);}
.aoife-root .dash .big{display:flex;align-items:baseline;gap:12px;}
.aoife-root .dash .big .n{font-family:'Fraunces';font-size:52px;font-weight:600;color:var(--green-deep);line-height:1;}
.aoife-root .dash .big .of{font-size:16px;color:var(--muted);}
.aoife-root .barwrap{background:#ece9df;border-radius:20px;height:12px;margin:14px 0 8px;overflow:hidden;}
.aoife-root .bar{height:100%;background:linear-gradient(90deg,#6f9e2f,var(--green-deep));border-radius:20px;transition:width .6s;}
.aoife-root .proj{font-size:14.5px;color:var(--green-ink);font-weight:600;}.aoife-root .soft{font-size:13.5px;color:var(--muted);font-style:italic;margin-top:7px;}
.aoife-root .maptitle{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin:26px 0 10px;}
.aoife-root .imap{display:grid;grid-template-columns:repeat(6,1fr);gap:9px;}
@media(max-width:620px){.aoife-root .imap{grid-template-columns:repeat(5,1fr);}}
.aoife-root .tile{aspect-ratio:1;border:1px solid var(--hair);border-radius:14px;background:#fbfaf6;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4px;position:relative;box-shadow:0 1px 1px rgba(40,40,30,.03);}
.aoife-root .tile .em{font-size:21px;}.aoife-root .tile .pl{font-size:8.5px;font-weight:600;color:var(--green-ink);margin-top:3px;line-height:1.05;}
.aoife-root .tile .dn{position:absolute;top:3px;left:6px;font-size:9px;font-weight:700;color:#c7c0af;font-family:'Fraunces';}
.aoife-root .tile.locked{background:#f3f1ea;}.aoife-root .tile.locked .em{filter:grayscale(1);opacity:.3;}.aoife-root .tile.locked .pl{visibility:hidden;}
.aoife-root .tile.done{background:var(--greensoft);border-color:#bcd3a6;}
.aoife-root .tile.today{border-color:var(--green-deep);border-width:2px;box-shadow:0 0 0 3px rgba(63,109,24,.15);}
.aoife-root .backlink{font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--green-deep);cursor:pointer;display:inline-block;margin:8px 0 12px;}
.aoife-root .daybar{background:var(--card);border:1px solid var(--hair);border-radius:18px;padding:20px 24px;margin-bottom:14px;box-shadow:var(--shadow-sm);}
.aoife-root .daybar .wk{font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--green-deep);}
.aoife-root .daybar h2{font-weight:600;font-size:27px;margin-top:5px;letter-spacing:-.5px;}
.aoife-root .daybar .fc{font-size:13px;color:var(--muted);margin-top:5px;}
.aoife-root .sec{background:var(--card);border:1px solid var(--hair);border-radius:20px;margin:14px 0;overflow:hidden;box-shadow:var(--shadow-sm);}
.aoife-root .sh{display:flex;align-items:center;gap:11px;border-bottom:1px solid var(--hair);padding:15px 22px;}
.aoife-root .sh .ic{font-size:19px;}.aoife-root .sh .tt{font-family:'Fraunces';font-size:17px;font-weight:600;}
.aoife-root .sb{padding:18px 22px 22px;}
.aoife-root .msg{font-family:'Fraunces',Georgia,serif;background:#fbfaf6;border:1px solid var(--hair);border-radius:14px;padding:18px 20px;font-size:17px;line-height:1.68;color:#33332c;}
.aoife-root .msg .sig{display:block;margin-top:12px;font-style:italic;color:var(--green-deep);font-weight:500;}
.aoife-root .nugget{border-left:3px solid var(--green);padding:5px 0 5px 15px;margin-top:16px;}
.aoife-root .nugget .t{font-size:10.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--green-deep);}.aoife-root .nugget .x{font-size:14.5px;color:#4a4a42;}
.aoife-root .qlist{margin:8px 0 0;}.aoife-root .qitem{font-family:'Fraunces';font-size:17px;font-weight:500;padding:8px 0;border-bottom:1px dashed var(--hair);}.aoife-root .qitem:last-child{border:none;}
.aoife-root .rec{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:6px 0;}
.aoife-root .recdot{width:11px;height:11px;border-radius:50%;background:var(--terra);}.aoife-root .recdot.on{animation:aoblink 1s infinite;}
@keyframes aoblink{50%{opacity:.25;}}
.aoife-root audio{height:34px;}.aoife-root .recnote{font-size:12.5px;color:var(--muted);font-style:italic;}
.aoife-root textarea{width:100%;border:1px solid var(--hair);border-radius:12px;padding:12px 14px;font-size:15.5px;font-family:inherit;background:#fdfcf9;min-height:90px;resize:vertical;}
.aoife-root .errcard{border:1px solid var(--hair);border-radius:12px;padding:12px 15px;margin:9px 0;background:#fdfcf9;}
.aoife-root .errcard .o{color:var(--terra);text-decoration:line-through;}.aoife-root .errcard .f{color:var(--green-ink);font-weight:600;}.aoife-root .errcard .w{font-size:13.5px;color:var(--muted);margin-top:4px;}
.aoife-root .drill{background:var(--greensoft);border-radius:12px;padding:13px 15px;margin:10px 0;}
.aoife-root .drill .p{font-weight:600;font-size:14px;margin-bottom:8px;}.aoife-root .drill .item{font-size:15px;margin:6px 0;}.aoife-root .drill .rev{color:var(--green-deep);font-weight:600;cursor:pointer;}
.aoife-root .unlock{border:1px solid #e6d5a8;border-radius:16px;background:var(--goldsoft);padding:18px;margin:16px 0;text-align:center;box-shadow:var(--shadow-sm);}
.aoife-root .unlock .em{font-size:38px;}.aoife-root .unlock .pl{font-family:'Fraunces';font-size:19px;font-weight:600;color:var(--gold);margin:5px 0 3px;}.aoife-root .unlock .fx{font-size:14px;color:#6b5a2c;}
.aoife-root .done-banner{font-family:'Fraunces';background:linear-gradient(120deg,#33590f,#4b7c1c);color:#fff;border-radius:16px;padding:18px;text-align:center;font-size:18px;font-weight:500;margin-top:16px;box-shadow:var(--shadow);}
.aoife-root .foot{text-align:center;color:var(--muted);font-size:11px;letter-spacing:.3px;margin-top:32px;border-top:1px solid var(--hair);padding-top:16px;}
.aoife-root .spin{display:inline-block;width:15px;height:15px;border:2px solid #cfd6c6;border-top-color:var(--green-deep);border-radius:50%;animation:aospin .7s linear infinite;vertical-align:-2px;}
@keyframes aospin{to{transform:rotate(360deg);}}
`
