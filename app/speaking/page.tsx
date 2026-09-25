'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import type { CandidateSpeakingAssessment, SpeakingTurn } from '@/lib/speakingAssessment'

interface DiarisedTranscript {
  turns: SpeakingTurn[]
  speakerIds: string[]
  fullText: string
  languageCode?: string
}

const GREEN = '#6BAE2E'

export default function SpeakingPage() {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [numSpeakers, setNumSpeakers] = useState(3)
  const [examTitle, setExamTitle] = useState('B2 First — practice mock')

  const [transcript, setTranscript] = useState<DiarisedTranscript | null>(null)
  const [labels, setLabels] = useState<Record<string, string>>({})
  const [candidate, setCandidate] = useState('')
  const [assessment, setAssessment] = useState<CandidateSpeakingAssessment | null>(null)

  const [transcribing, setTranscribing] = useState(false)
  const [assessing, setAssessing] = useState(false)
  const [error, setError] = useState('')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function resetDownstream() {
    setTranscript(null); setLabels({}); setCandidate(''); setAssessment(null); setError('')
  }

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }
      rec.start()
      recorderRef.current = rec
      setRecording(true)
      setElapsed(0)
      resetDownstream()
      setAudioBlob(null); setAudioUrl('')
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } catch {
      setError('Could not access the microphone. Check the browser permission, or upload a file instead.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    resetDownstream()
    setAudioBlob(f)
    setAudioUrl(URL.createObjectURL(f))
  }

  async function doTranscribe() {
    if (!audioBlob) return
    setTranscribing(true); setError(''); setAssessment(null)
    try {
      const form = new FormData()
      form.append('file', audioBlob, 'recording.webm')
      form.append('numSpeakers', String(numSpeakers))
      const res = await fetch('/api/speaking/transcribe', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Transcription failed.'); return }
      const t = data as DiarisedTranscript
      setTranscript(t)
      // Sensible default labels: first speaker = Examiner, then Candidate 1, 2…
      const init: Record<string, string> = {}
      t.speakerIds.forEach((id, i) => { init[id] = i === 0 ? 'Examiner' : `Candidate ${i}` })
      setLabels(init)
    } catch {
      setError('Transcription request failed. Please try again.')
    } finally {
      setTranscribing(false)
    }
  }

  const candidateNames = transcript
    ? transcript.speakerIds.map((id) => labels[id] || id).filter((n) => n.toLowerCase() !== 'examiner')
    : []

  async function doAssess() {
    if (!transcript || !candidate) return
    setAssessing(true); setError(''); setAssessment(null)
    try {
      const relabelled: SpeakingTurn[] = transcript.turns.map((t) => ({
        speaker: labels[t.speaker] || t.speaker,
        text: t.text,
      }))
      const res = await fetch('/api/speaking/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, turns: relabelled, examTitle }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Assessment failed.'); return }
      setAssessment(data as CandidateSpeakingAssessment)
    } catch {
      setError('Assessment request failed. Please try again.')
    } finally {
      setAssessing(false)
    }
  }

  const speakerColour = (name: string) =>
    name.toLowerCase() === 'examiner' ? '#555' : name === candidate ? GREEN : '#2b6ca3'

  const mm = String(Math.floor(elapsed / 60)).padStart(1, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="wrap">
      <style>{`
        .wrap{max-width:820px;margin:0 auto;padding:0 20px 60px;font-family:Arial,'Liberation Sans',system-ui,sans-serif;color:#1A1A1A;}
        .top{display:flex;align-items:center;justify-content:space-between;padding:18px 0 14px;border-bottom:3px solid ${GREEN};margin-bottom:8px;}
        .top .brand{font-weight:800;font-size:22px;color:${GREEN};letter-spacing:-.5px;}
        .top a{font-size:13px;color:${GREEN};text-decoration:none;}
        h1{font-size:22px;margin:16px 0 2px;}
        .sub{color:#666;font-size:14px;margin-bottom:14px;}
        .step{border:1px solid #e4e4e4;border-radius:12px;padding:18px;margin-bottom:16px;}
        .step h2{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${GREEN};margin-bottom:12px;}
        .btn{background:${GREEN};color:#fff;border:none;border-radius:8px;padding:11px 20px;font-size:15px;font-weight:700;cursor:pointer;}
        .btn:disabled{background:#bcbcbc;cursor:default;}
        .btn.rec{background:#c0392b;}
        .btn.ghost{background:#fff;color:${GREEN};border:2px solid ${GREEN};}
        .row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
        .muted{color:#777;font-size:13px;}
        label.fld{display:block;font-size:12px;color:#666;margin:10px 0 3px;font-weight:700;}
        input[type=text],input[type=number],select{font-size:15px;padding:8px 10px;border:2px solid #d3dcc9;border-radius:7px;font-family:inherit;}
        .turn{padding:7px 0;border-bottom:1px dashed #eee;font-size:14.5px;line-height:1.5;}
        .turn .who{font-weight:700;}
        .lblgrid{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:12px;}
        .lblcard{border:1px solid #e0e0e0;border-radius:8px;padding:8px 12px;}
        .lblcard .id{font-size:11px;color:#999;}
        .err{background:#fdeeec;border-left:4px solid #c0392b;color:#a03227;padding:10px 14px;border-radius:6px;font-size:14px;margin:12px 0;}
        .note{background:#fff8ec;border:1px solid #e8c98a;border-left:4px solid #E8A93C;border-radius:0 6px 6px 0;padding:10px 14px;font-size:13px;line-height:1.55;margin-top:10px;}
        .report{border:2px solid ${GREEN};border-radius:12px;padding:20px;margin-top:4px;}
        .crit{border:1px solid #e6e6e6;border-radius:9px;padding:13px 15px;margin-bottom:12px;}
        .crit .h{display:flex;justify-content:space-between;align-items:baseline;}
        .crit .cn{font-weight:700;font-size:15px;}
        .crit .band{font-weight:800;color:${GREEN};font-size:16px;}
        .crit .comment{font-size:14px;line-height:1.6;margin-top:6px;}
        .crit ul{margin:6px 0 0 18px;font-size:13.5px;line-height:1.55;}
        .crit .good li{color:#2d6a0a;}
        .crit .bad li{color:#a33;}
        .pron{background:#f5faf0;border-radius:8px;padding:12px 15px;font-size:14px;line-height:1.6;margin:10px 0;}
        .glob{display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid #e0e0e0;padding-top:12px;margin-top:6px;}
        .prio{margin:10px 0 0 18px;font-size:14px;line-height:1.7;}
        .estimate{background:#EAF4DA;border-radius:8px;padding:10px 14px;font-weight:700;color:#33610f;font-size:14px;margin-top:12px;}
      `}</style>

      <div className="top">
        <span className="brand">Somerset · Speaking</span>
        <Link href="/teacher">← Teacher home</Link>
      </div>

      <h1>Speaking assessment</h1>
      <div className="sub">Record or upload a Cambridge B2 First speaking test, transcribe it (speakers separated automatically), then assess one candidate against the Cambridge criteria. Teacher tool — student voice recordings stay behind your login.</div>

      {/* STEP 1 — audio */}
      <div className="step">
        <h2>1 · Record or upload the exam audio</h2>
        <div className="row">
          {!recording
            ? <button className="btn rec" onClick={startRecording}>● Start recording</button>
            : <button className="btn rec" onClick={stopRecording}>■ Stop ({mm}:{ss})</button>}
          <span className="muted">or</span>
          <label className="btn ghost" style={{ display: 'inline-block' }}>
            Upload audio file
            <input type="file" accept="audio/*,video/*" onChange={onFile} style={{ display: 'none' }} />
          </label>
        </div>
        {audioUrl && <audio controls src={audioUrl} style={{ width: '100%', marginTop: 14 }} />}
        <div className="note"><b>First-test limit:</b> keep clips under ~4 MB (a few minutes) for now — they pass straight through the app. Full ~14-minute mocks need the Blob upload step, which is the next piece to wire in.</div>
        <div className="row" style={{ marginTop: 12 }}>
          <div>
            <label className="fld">People speaking (Examiner + candidates)</label>
            <input type="number" min={1} max={4} value={numSpeakers} onChange={(e) => setNumSpeakers(Number(e.target.value))} style={{ width: 70 }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="fld">Exam label (optional)</label>
            <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button className="btn" onClick={doTranscribe} disabled={!audioBlob || transcribing}>
            {transcribing ? 'Transcribing…' : 'Transcribe & separate speakers'}
          </button>
        </div>
      </div>

      {error && <div className="err">{error}</div>}

      {/* STEP 2 — transcript + labels */}
      {transcript && (
        <div className="step">
          <h2>2 · Who is who?</h2>
          <div className="muted" style={{ marginBottom: 10 }}>The system separated {transcript.speakerIds.length} speaker(s). Name each one — the interlocutor is the Examiner, the others are your students.</div>
          <div className="lblgrid">
            {transcript.speakerIds.map((id) => (
              <div className="lblcard" key={id}>
                <div className="id">{id}</div>
                <input type="text" value={labels[id] || ''} onChange={(e) => setLabels({ ...labels, [id]: e.target.value })} style={{ width: 150 }} />
              </div>
            ))}
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: '4px 14px' }}>
            {transcript.turns.map((t, i) => {
              const name = labels[t.speaker] || t.speaker
              return (
                <div className="turn" key={i}>
                  <span className="who" style={{ color: speakerColour(name) }}>{name}: </span>
                  {t.text}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 3 — assess */}
      {transcript && (
        <div className="step">
          <h2>3 · Assess a candidate</h2>
          <div className="row">
            <select value={candidate} onChange={(e) => setCandidate(e.target.value)}>
              <option value="">Choose candidate…</option>
              {candidateNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn" onClick={doAssess} disabled={!candidate || assessing}>
              {assessing ? 'Assessing…' : `Assess ${candidate || ''}`}
            </button>
          </div>
          <div className="note">Pronunciation is <b>not</b> scored — it can't be judged from a transcript. The report scores the three criteria that can be, and tells you what to listen for live.</div>
        </div>
      )}

      {/* REPORT */}
      {assessment && (
        <div className="report">
          <h2 style={{ color: GREEN, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Speaking report — {assessment.candidate}</h2>
          {assessment.estimate && <div className="estimate">{assessment.estimate}</div>}
          <div style={{ marginTop: 14 }}>
            {assessment.criteria.map((c) => (
              <div className="crit" key={c.criterion}>
                <div className="h"><span className="cn">{c.criterion}</span><span className="band">{c.band} / 5</span></div>
                <div className="comment">{c.comment}</div>
                {c.good.length > 0 && <ul className="good">{c.good.map((g, i) => <li key={i}>{g}</li>)}</ul>}
                {c.notSoGood.length > 0 && <ul className="bad">{c.notSoGood.map((g, i) => <li key={i}>{g}</li>)}</ul>}
              </div>
            ))}
          </div>
          <div className="pron"><b>Pronunciation (not scored):</b> {assessment.pronunciationNote}</div>
          <div className="glob"><span className="cn" style={{ fontWeight: 700 }}>Global Achievement</span><span className="band" style={{ color: GREEN, fontWeight: 800 }}>{assessment.globalAchievement.band} / 5</span></div>
          <div className="comment" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 4 }}>{assessment.globalAchievement.comment}</div>
          {assessment.priorities?.length > 0 && (
            <>
              <div style={{ fontWeight: 700, marginTop: 14, fontSize: 14 }}>Priorities</div>
              <ol className="prio">{assessment.priorities.map((p, i) => <li key={i}>{p}</li>)}</ol>
            </>
          )}
        </div>
      )}
    </div>
  )
}
