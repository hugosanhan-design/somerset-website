'use client'

// The actual correction step for one pending scan: run the AI analysis against
// the photo already sitting in Blob storage (no re-upload needed), let the
// teacher edit the score/feedback, then mark it corrected.

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'

interface Entry {
  id: string
  student_id: string
  student_name: string
  student_level: string
  type: string
  title: string
  date: string
  image_url: string
}

export default function CorrectEntry() {
  const { entryId } = useParams<{ entryId: string }>()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId') || ''
  const router = useRouter()

  const [entry, setEntry] = useState<Entry | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [score, setScore] = useState<string>('')
  const [feedback, setFeedback] = useState('')
  const [errorPatterns, setErrorPatterns] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [analysed, setAnalysed] = useState(false)

  useEffect(() => {
    if (!studentId) return
    fetch(`/api/students/${studentId}/entries/${entryId}`).then(r => r.json()).then(setEntry)
  }, [studentId, entryId])

  async function runAnalysis() {
    if (!entry) return
    setAnalysing(true)
    const fd = new FormData()
    fd.append('imageUrl', entry.image_url)
    fd.append('type', entry.type)
    fd.append('level', entry.student_level || 'B1')
    fd.append('title', entry.title)

    const res = await fetch('/api/analyse-work', { method: 'POST', body: fd })
    const data = await res.json()
    setScore(data.score != null ? String(data.score) : '')
    setFeedback(data.feedback || '')
    setErrorPatterns(data.error_patterns || [])
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
        status: 'corrected',
      }),
    })
    setSaving(false)
    router.push('/correct-queue')
  }

  if (!entry) {
    return <div style={{ padding: 40, fontFamily: 'Arial, Helvetica, sans-serif', color: '#777' }}>Loading…</div>
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff' }}>
      <header style={{ background: '#1E4227', borderBottom: '3px solid #6BAE2E', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SomersetLogo variant="white" />
        <Link href="/correct-queue" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textDecoration: 'none' }}>← Queue</Link>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 20, color: '#222', marginBottom: 4 }}>{entry.student_name}</h1>
          <p style={{ color: '#777', fontSize: 13, marginBottom: 16 }}>{entry.title || entry.type} · {entry.date}</p>
          <img src={entry.image_url} alt="Student work" style={{ width: '100%', borderRadius: 8, border: '1px solid #DDDDDD' }} />
        </div>

        <div>
          {!analysed ? (
            <>
              <button onClick={runAnalysis} disabled={analysing} style={btnPrimary}>
                {analysing ? 'Analysing…' : 'Run AI analysis →'}
              </button>
              <button
                onClick={() => setAnalysed(true)}
                style={{ display: 'block', marginTop: 12, background: 'none', border: 'none', color: '#777', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Skip — I&apos;ll write it myself
              </button>
            </>
          ) : (
            <>
              <label style={labelStyle}>Score (out of 100)</label>
              <input value={score} onChange={e => setScore(e.target.value)} type="number" min={0} max={100} style={inputStyle} />

              <label style={labelStyle}>Feedback</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={6} style={{ ...inputStyle, resize: 'vertical' }} />

              <label style={labelStyle}>Error patterns (one per line)</label>
              <textarea
                value={errorPatterns.join('\n')}
                onChange={e => setErrorPatterns(e.target.value.split('\n').filter(Boolean))}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />

              <button onClick={markCorrected} disabled={saving} style={{ ...btnPrimary, width: '100%', marginTop: 12 }}>
                {saving ? 'Saving…' : '✅ Mark corrected'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 8, border: '1.5px solid #DDDDDD', marginBottom: 16, fontFamily: 'Arial, Helvetica, sans-serif', color: '#222' }
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '13px 22px', borderRadius: 50, border: 'none', background: '#6BAE2E', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }
