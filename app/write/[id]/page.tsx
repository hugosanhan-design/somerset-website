'use client'

// Public student-facing writing correction page, gated by a catch-up pack ID.
// Students arrive here from /catchup/[id] — the pack ID proves they have a valid
// catch-up link from their teacher. The writing prompt is pre-filled from the pack.

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT, RADIUS, SHADOW, EASE } from '@/lib/theme'

interface Pack { id: string; unit_title: string; writing_prompt: string; group_name: string }

const TASK_TYPES = ['Essay', 'Email', 'Letter', 'Report', 'Article', 'Review']
const LEVELS = ['B1', 'B2', 'C1']

export default function StudentWritePage() {
  const { id } = useParams() as { id: string }
  const [pack, setPack] = useState<Pack | null>(null)
  const [fetchError, setFetchError] = useState('')

  const [name, setName] = useState('')
  const [level, setLevel] = useState('B1')
  const [taskType, setTaskType] = useState('Essay')
  const [studentText, setStudentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportHtml, setReportHtml] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/catchup/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((p: Pack) => { setPack(p); if (p.writing_prompt) setTaskType(guessTaskType(p.writing_prompt)) })
      .catch(() => setFetchError('This link has expired or is invalid.'))
  }, [id])

  function guessTaskType(prompt: string): string {
    const lower = prompt.toLowerCase()
    if (lower.includes('email')) return 'Email'
    if (lower.includes('letter')) return 'Letter'
    if (lower.includes('report')) return 'Report'
    if (lower.includes('article')) return 'Article'
    if (lower.includes('review')) return 'Review'
    return 'Essay'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!studentText.trim() || !name.trim()) return
    setLoading(true); setError(''); setReportHtml('')
    try {
      const r = await fetch('/api/correct-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_id: id, studentName: name, level, taskType,
          taskPrompt: pack?.writing_prompt || '',
          studentText,
        }),
      })
      if (!r.ok) throw new Error(await r.text())
      const d = await r.json()
      setReportHtml(d.html || d.feedback || '')
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: FONT.sans, backgroundColor: '#F4F7F0' }}>

      <header style={{ backgroundColor: COLORS.racing, padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <SomersetLogo variant="white" />
        {pack && (
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginLeft: 'auto' }}>
            {pack.group_name} · {pack.unit_title}
          </span>
        )}
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '36px 24px 64px' }}>

        {fetchError ? (
          <div style={{ ...card, color: COLORS.danger }}>{fetchError}</div>
        ) : !pack ? (
          <div style={{ ...card, color: COLORS.muted }}>Loading…</div>
        ) : reportHtml ? (
          <>
            <h2 style={{ fontFamily: FONT.serif, fontSize: 22, color: COLORS.ink, margin: '0 0 20px' }}>Your feedback</h2>
            <div style={card} dangerouslySetInnerHTML={{ __html: reportHtml }} />
            <button style={{ ...btn, marginTop: 20 }} onClick={() => { setReportHtml(''); setStudentText('') }}>
              Try again
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 24, color: COLORS.ink, margin: '0 0 6px' }}>
              Writing task
            </h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
              Write your answer below and submit for AI feedback marked against Cambridge criteria.
            </p>

            {pack.writing_prompt && (
              <div style={{ ...card, borderLeft: `4px solid ${COLORS.green}`, marginBottom: 24 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.green, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  Your task
                </div>
                <div style={{ fontSize: 15, color: COLORS.ink, lineHeight: 1.6 }}>{pack.writing_prompt}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div style={fieldRow}>
                <label style={fieldLabel}>Your name</label>
                <input style={input} placeholder="First name" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ ...fieldRow, flex: 1 }}>
                  <label style={fieldLabel}>Level</label>
                  <select style={input} value={level} onChange={e => setLevel(e.target.value)}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div style={{ ...fieldRow, flex: 1 }}>
                  <label style={fieldLabel}>Task type</label>
                  <select style={input} value={taskType} onChange={e => setTaskType(e.target.value)}>
                    {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={fieldRow}>
                <label style={fieldLabel}>
                  Your writing
                  <span style={{ fontWeight: 400, color: COLORS.muted, marginLeft: 8 }}>
                    ({studentText.trim().split(/\s+/).filter(Boolean).length} words)
                  </span>
                </label>
                <textarea
                  style={{ ...input, minHeight: 220, resize: 'vertical', lineHeight: 1.6 }}
                  placeholder="Write your answer here…"
                  value={studentText}
                  onChange={e => setStudentText(e.target.value)}
                  required
                />
              </div>

              {error && <div style={{ fontSize: 13.5, color: COLORS.danger }}>{error}</div>}

              <button type="submit" disabled={loading || !name.trim() || !studentText.trim()} style={btn}>
                {loading ? 'Marking your work…' : 'Submit for feedback'}
              </button>

            </form>
          </>
        )}
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  backgroundColor: '#fff',
  border: `1px solid ${COLORS.line}`,
  borderRadius: RADIUS.card,
  padding: '18px 20px',
  boxShadow: SHADOW.inkSoft,
  marginBottom: 8,
}
const fieldRow: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5 }
const fieldLabel: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: COLORS.inkSoft }
const input: React.CSSProperties = {
  fontFamily: FONT.sans, fontSize: 14.5, padding: '10px 12px',
  border: `1.5px solid ${COLORS.line}`, borderRadius: 9,
  backgroundColor: '#fff', color: COLORS.ink,
}
const btn: React.CSSProperties = {
  fontFamily: FONT.sans, fontSize: 15, fontWeight: 700, color: '#fff',
  backgroundColor: COLORS.green, border: 'none', borderRadius: 10,
  padding: '13px 22px', cursor: 'pointer',
}
