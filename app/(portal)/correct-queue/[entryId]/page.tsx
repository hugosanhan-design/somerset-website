'use client'

// The actual correction step for one pending scan: run the AI analysis against
// the photo already sitting in Blob storage (no re-upload needed), let the
// teacher edit the score/feedback, then mark it corrected.
//
// `criteria` is what this specific exercise required (e.g. "Uses 'I' as the
// subject", "Uses present continuous (-ing)", "Includes a future time reference"),
// one per line. Analysis without it can only give a holistic impression — it has
// no way to fail an answer that's missing one required piece but otherwise reads
// fluently (see CORRECTION 28 Sep 2026: Carla / "My Plan"). Left blank on purpose
// for genuinely open-ended work; otherwise, fill it in before running the AI.

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PORTAL } from '@/lib/portalTheme'

interface Entry {
  id: string
  student_id: string
  student_name: string
  student_level: string
  type: string
  title: string
  date: string
  image_url: string
  criteria?: string
}

interface CriteriaCheck {
  criterion: string
  met: boolean
  evidence: string
}

export default function CorrectEntry() {
  const { entryId } = useParams<{ entryId: string }>()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId') || ''
  const router = useRouter()

  const [entry, setEntry] = useState<Entry | null>(null)
  const [criteria, setCriteria] = useState('')
  const [analysing, setAnalysing] = useState(false)
  const [score, setScore] = useState<string>('')
  const [feedback, setFeedback] = useState('')
  const [errorPatterns, setErrorPatterns] = useState<string[]>([])
  const [transcription, setTranscription] = useState('')
  const [criteriaCheck, setCriteriaCheck] = useState<CriteriaCheck[]>([])
  const [saving, setSaving] = useState(false)
  const [analysed, setAnalysed] = useState(false)

  useEffect(() => {
    if (!studentId) return
    fetch(`/api/students/${studentId}/entries/${entryId}`).then(r => r.json()).then((e: Entry) => {
      setEntry(e)
      setCriteria(e.criteria || '')
    })
  }, [studentId, entryId])

  async function runAnalysis() {
    if (!entry) return
    setAnalysing(true)
    const fd = new FormData()
    fd.append('imageUrl', entry.image_url)
    fd.append('type', entry.type)
    fd.append('level', entry.student_level || 'B1')
    fd.append('title', entry.title)
    fd.append('criteria', criteria)

    const res = await fetch('/api/analyse-work', { method: 'POST', body: fd })
    const data = await res.json()
    setScore(data.score != null ? String(data.score) : '')
    setFeedback(data.feedback || '')
    setErrorPatterns(data.error_patterns || [])
    setTranscription(data.transcription || '')
    setCriteriaCheck(data.criteria_check || [])
    setAnalysed(true)
    setAnalysing(false)
  }

  async function markCorrected() {
    if (!entry) return
    setSaving(true)
    await fetch(`/api/students/${entry.student_id}/entries/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: score === '' ? null : Number(score),
        ai_feedback: feedback,
        ai_error_patterns: errorPatterns,
        criteria,
        transcribed_text: transcription,
        criteria_check: criteriaCheck,
        status: 'corrected',
      }),
    })
    setSaving(false)
    router.push('/correct-queue')
  }

  if (!entry) {
    return (
        <div style={{ padding: 40, color: PORTAL.muted }}>Loading…</div>
    )
  }

  return (
      <div style={s.wrap}>
        <Link href="/correct-queue" style={s.back}>← Queue</Link>
        <div style={s.grid}>
          <div>
            <h1 style={s.h1}>{entry.student_name}</h1>
            <p style={s.sub}>{entry.title || entry.type} · {entry.date}</p>
            <img src={entry.image_url} alt="Student work" style={s.image} />

            {!analysed && (
              <>
                <label style={s.label}>What must this answer include?</label>
                <textarea
                  value={criteria}
                  onChange={e => setCriteria(e.target.value)}
                  rows={4}
                  placeholder={"One requirement per line, e.g.:\nUses 'I' as the subject\nUses present continuous (-ing)\nIncludes a future time reference"}
                  style={{ ...s.input, resize: 'vertical', marginTop: 12 }}
                />
                <p style={s.hint}>
                  {criteria.trim()
                    ? 'The AI will check each line against what the student actually wrote, and cap the score if any is missing.'
                    : "Leave blank only for genuinely open-ended work. Without this, the AI can only give a general impression — it can't check for a specific missing word or structure."}
                </p>
              </>
            )}

            {analysed && transcription && (
              <>
                <label style={s.label}>Transcription (check this matches the photo)</label>
                <textarea
                  value={transcription}
                  onChange={e => setTranscription(e.target.value)}
                  rows={4}
                  style={{ ...s.input, resize: 'vertical' }}
                />
              </>
            )}

            {analysed && criteriaCheck.length > 0 && (
              <>
                <label style={s.label}>Criteria check</label>
                <ul style={s.checklist}>
                  {criteriaCheck.map((c, i) => (
                    <li key={i} style={{ ...s.checkItem, color: c.met ? '#2d6a0a' : '#c0392b' }}>
                      {c.met ? '✅' : '❌'} {c.criterion}
                      {c.evidence && <span style={s.evidence}> — “{c.evidence}”</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div>
            {!analysed ? (
              <>
                <button onClick={runAnalysis} disabled={analysing} style={s.btnPrimary}>
                  {analysing ? 'Analysing…' : 'Run AI analysis →'}
                </button>
                <button onClick={() => setAnalysed(true)} style={s.skipLink}>
                  Skip — I&apos;ll write it myself
                </button>
              </>
            ) : (
              <>
                <label style={s.label}>Score (out of 100)</label>
                <input value={score} onChange={e => setScore(e.target.value)} type="number" min={0} max={100} style={s.input} />

                <label style={s.label}>Feedback</label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={6} style={{ ...s.input, resize: 'vertical' }} />

                <label style={s.label}>Error patterns (one per line)</label>
                <textarea
                  value={errorPatterns.join('\n')}
                  onChange={e => setErrorPatterns(e.target.value.split('\n').filter(Boolean))}
                  rows={3}
                  style={{ ...s.input, resize: 'vertical' }}
                />

                <button onClick={markCorrected} disabled={saving} style={{ ...s.btnPrimary, width: '100%', marginTop: 12 }}>
                  {saving ? 'Saving…' : '✅ Mark corrected'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 900, margin: '0 auto', padding: '24px 28px 60px' },
  back: { fontSize: 13, color: PORTAL.muted, textDecoration: 'none', display: 'inline-block', marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 },
  h1: { fontSize: 20, fontWeight: 700, color: PORTAL.ink, marginBottom: 4 },
  sub: { color: PORTAL.muted, fontSize: 13, marginBottom: 16 },
  image: { width: '100%', borderRadius: 12, border: `2px solid ${PORTAL.line}` },
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: PORTAL.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 10, border: `2px solid ${PORTAL.line}`, marginBottom: 16, fontFamily: 'inherit', color: PORTAL.ink },
  hint: { fontSize: 12, color: PORTAL.muted, marginTop: -10, marginBottom: 16, lineHeight: 1.4 },
  checklist: { listStyle: 'none', padding: 0, margin: '0 0 16px' },
  checkItem: { fontSize: 13, marginBottom: 6, lineHeight: 1.4 },
  evidence: { color: PORTAL.muted, fontStyle: 'italic' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '13px 22px', borderRadius: 999, border: 'none', background: PORTAL.green, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  skipLink: { display: 'block', marginTop: 12, background: 'none', border: 'none', color: PORTAL.muted, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' },
}
