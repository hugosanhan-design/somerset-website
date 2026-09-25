'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import SomersetLogo from '@/components/SomersetLogo'
import { SKILLS, Skill } from '@/data/errorTags'

interface Student {
  id: string
  name: string
  group_name: string
  level: string
  notes: string
  enrolled_at: string
  parent_email: string
}

interface WorkEntry {
  id: string
  type: string
  title: string
  date: string
  score: number | null
  ai_feedback: string
  ai_error_patterns: string
  image_filename: string
  image_url: string
  teacher_notes: string
  by_skill: string | null
  cefr_estimate: string
}

const CEFR_BANDS: Record<string, [number, number]> = {
  A1: [0, 20], A2: [20, 40], B1: [40, 60], B2: [60, 80], C1: [80, 100],
}

const TYPE_LABELS: Record<string, string> = {
  exam: '📝 Exam',
  essay: '✍️ Essay',
  class_exercise: '📄 Exercise',
  speaking: '🎙 Speaking',
  homework: '🏠 Homework',
}

export default function StudentFicha() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editEmail, setEditEmail] = useState('')
  const [editingEmail, setEditingEmail] = useState(false)

  useEffect(() => {
    if (id) load()
  }, [id])

  async function load() {
    setLoading(true)
    const [sRes, eRes] = await Promise.all([
      fetch(`/api/students/${id}`),
      fetch(`/api/students/${id}/entries`),
    ])
    const s = await sRes.json()
    const e = await eRes.json()
    setStudent(s)
    setEntries(e)
    setEditNote(s.notes || '')
    setEditEmail(s.parent_email || '')
    setLoading(false)
  }

  async function saveNotes() {
    if (!student) return
    setSaving(true)
    await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...student, notes: editNote })
    })
    setStudent(s => s ? { ...s, notes: editNote } : s)
    setEditingNotes(false)
    setSaving(false)
  }

  async function saveParentEmail() {
    if (!student) return
    setSaving(true)
    await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...student, parent_email: editEmail })
    })
    setStudent(s => s ? { ...s, parent_email: editEmail } : s)
    setEditingEmail(false)
    setSaving(false)
  }

  async function deleteStudent() {
    if (!confirm(`Delete ${student?.name} and all their records? This cannot be undone.`)) return
    await fetch(`/api/students/${id}`, { method: 'DELETE' })
    router.push('/students')
  }

  if (loading) return <div style={loadingStyle}>Loading…</div>
  if (!student) return <div style={loadingStyle}>Student not found.</div>

  const scoredEntries = entries.filter(e => e.score != null)
  const avgScore = scoredEntries.length
    ? Math.round(scoredEntries.reduce((s, e) => s + (e.score ?? 0), 0) / scoredEntries.length)
    : null

  // Error pattern frequency
  const patternCount: Record<string, number> = {}
  entries.forEach(e => {
    let patterns: string[] = []
    try { patterns = JSON.parse(e.ai_error_patterns || '[]') } catch { patterns = [] }
    patterns.forEach(p => { patternCount[p] = (patternCount[p] || 0) + 1 })
  })
  const topPatterns = Object.entries(patternCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const checkins = entries.filter(e => e.type === 'checkin' && e.score != null)
  const latestCheckin = checkins[0] || null
  let latestBySkill: Record<string, number> | null = null
  if (latestCheckin?.by_skill) {
    try { latestBySkill = JSON.parse(latestCheckin.by_skill) } catch { latestBySkill = null }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, Liberation Sans, sans-serif', backgroundColor: '#f9fafb' }}>

      {/* Header */}
      <header style={{ backgroundColor: '#6BAE2E', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SomersetLogo variant="white" />
        <Link href="/students" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textDecoration: 'none' }}>← All students</Link>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

        {/* Student header card */}
        <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
            <div style={bigAvatar}>{student.name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{student.name}</h1>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                {[student.group_name, student.level].filter(Boolean).join(' · ')}
                {student.enrolled_at ? ` · enrolled ${student.enrolled_at}` : ''}
              </div>
              {/* Stats */}
              <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
                <Stat label="Pieces of work" value={entries.length.toString()} />
                {avgScore != null && <Stat label="Average score" value={`${avgScore}/100`} color={scoreColor(avgScore)} />}
                {scoredEntries.length > 0 && (
                  <Stat label="Best score" value={`${Math.max(...scoredEntries.map(e => e.score ?? 0))}/100`} />
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href={`/students/${id}/upload`} style={btnGreen}>+ Add work</Link>
              <Link href={`/students/${id}/progress`} style={btnGhostLink}>📊 Progress report</Link>
            </div>
          </div>
        </div>

        {/* Two-column layout for larger screens */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

          {/* Monthly check-in progress — the ONLY chart that plots comparable checkpoints */}
          {checkins.length > 0 && (
            <div style={card}>
              <h2 style={sectionTitle}>Monthly check-in progress</h2>
              {checkins.length >= 2 ? (
                <CheckinChart entries={[...checkins].reverse()} targetLevel={student.level} />
              ) : (
                <p style={{ fontSize: 13, color: '#9ca3af' }}>One check-in logged so far. The trend line appears from the second monthly check-in.</p>
              )}
              {latestBySkill && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Latest by skill {latestCheckin?.date ? `(${latestCheckin.date})` : ''}
                  </div>
                  {SKILLS.map(sk => {
                    const val = latestBySkill?.[sk]
                    if (val == null) return null
                    return (
                      <div key={sk} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <span style={{ width: 74, fontSize: 12, color: '#374151', textTransform: 'capitalize', flexShrink: 0 }}>{sk}</span>
                        <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${val}%`, height: '100%', background: scoreColor(val) }} />
                        </div>
                        <span style={{ fontSize: 11.5, color: '#6b7280', width: 28, textAlign: 'right', flexShrink: 0 }}>{val}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* General activity chart — every scored piece of work, not just checkpoints */}
          {scoredEntries.length >= 2 && (
            <div style={card}>
              <h2 style={sectionTitle}>Progress chart</h2>
              <ProgressChart entries={[...scoredEntries].reverse()} />
            </div>
          )}

          {/* Error patterns */}
          {topPatterns.length > 0 && (
            <div style={card}>
              <h2 style={sectionTitle}>Recurring areas to work on</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topPatterns.map(([p, count]) => (
                  <div key={p} style={patternChip}>
                    {p} <span style={{ opacity: 0.65, marginLeft: 4 }}>×{count}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>Identified across AI analyses. Review regularly.</p>
            </div>
          )}

          {/* Parent email — for sending the progress report */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ ...sectionTitle, margin: 0 }}>Parent email</h2>
              {!editingEmail && <button onClick={() => setEditingEmail(true)} style={btnSmall}>Edit</button>}
            </div>
            {editingEmail ? (
              <div>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="parent@example.com"
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={saveParentEmail} disabled={saving} style={btnGreen}>{saving ? 'Saving…' : 'Save'}</button>
                  <button onClick={() => { setEditingEmail(false); setEditEmail(student.parent_email || '') }} style={btnGhost}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: student.parent_email ? '#374151' : '#9ca3af', margin: 0 }}>
                {student.parent_email || 'No parent email on file — add one to send progress reports.'}
              </p>
            )}
          </div>

          {/* Teacher notes */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ ...sectionTitle, margin: 0 }}>Teacher notes</h2>
              {!editingNotes && (
                <button onClick={() => setEditingNotes(true)} style={btnSmall}>Edit</button>
              )}
            </div>
            {editingNotes ? (
              <div>
                <textarea
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  placeholder="Private notes about this student's progress, behaviour, goals…"
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={saveNotes} disabled={saving} style={btnGreen}>{saving ? 'Saving…' : 'Save'}</button>
                  <button onClick={() => { setEditingNotes(false); setEditNote(student.notes || '') }} style={btnGhost}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: student.notes ? '#374151' : '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                {student.notes || 'No notes yet. Click Edit to add private teacher notes.'}
              </p>
            )}
          </div>

          {/* Work history */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ ...sectionTitle, margin: 0 }}>Work history</h2>
              <Link href={`/students/${id}/upload`} style={{ ...btnSmall, textDecoration: 'none' }}>+ Add</Link>
            </div>
            {entries.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 14 }}>No work recorded yet. Upload the first piece above.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {entries.map(entry => {
                  let patterns: string[] = []
                  try { patterns = JSON.parse(entry.ai_error_patterns || '[]') } catch {}
                  return (
                    <div key={entry.id} style={entryCard}>
                      <div
                        onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                          <span style={{ fontSize: 14, color: '#6b7280', flexShrink: 0 }}>{entry.date}</span>
                          <span style={{ fontSize: 13, color: '#6b7280', flexShrink: 0 }}>{TYPE_LABELS[entry.type] || entry.type}</span>
                          {entry.title && <span style={{ fontSize: 14, color: '#374151', fontWeight: 600 }}>{entry.title}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {entry.score != null && (
                            <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor(entry.score) }}>{entry.score}</span>
                          )}
                          <span style={{ color: '#9ca3af' }}>{expanded === entry.id ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {expanded === entry.id && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
                          {(entry.image_url || entry.image_filename) && (
                            <img
                              src={entry.image_url || `/uploads/${entry.image_filename}`}
                              alt="Student work"
                              style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 6, marginBottom: 12, border: '1px solid #e5e7eb' }}
                            />
                          )}
                          {entry.ai_feedback && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#6BAE2E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Feedback</div>
                              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>{entry.ai_feedback}</p>
                            </div>
                          )}
                          {patterns.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#6BAE2E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Areas to work on</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {patterns.map(p => <span key={p} style={patternChip}>{p}</span>)}
                              </div>
                            </div>
                          )}
                          {entry.teacher_notes && (
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teacher note</div>
                              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>{entry.teacher_notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div style={{ ...card, border: '1.5px solid #fecaca' }}>
            <h2 style={{ ...sectionTitle, color: '#ef4444' }}>Danger zone</h2>
            <button onClick={deleteStudent} style={btnDanger}>Delete this student and all records</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || '#111827' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{label}</div>
    </div>
  )
}

function ProgressChart({ entries }: { entries: WorkEntry[] }) {
  const scores = entries.map(e => e.score ?? 0)
  const max = 100
  const h = 100
  const w = 600
  const pad = 30

  const points = scores.map((s, i) => {
    const x = pad + (i / Math.max(scores.length - 1, 1)) * (w - 2 * pad)
    const y = h - pad - ((s / max) * (h - 2 * pad))
    return { x, y, s }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: w, height: 'auto', display: 'block' }}>
        {/* Gridlines */}
        {[25, 50, 75, 100].map(v => {
          const y = h - pad - ((v / max) * (h - 2 * pad))
          return (
            <g key={v}>
              <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={pad - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{v}</text>
            </g>
          )
        })}
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#6BAE2E" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Fill */}
        <polygon
          points={`${points[0].x},${h - pad} ${polyline} ${points[points.length - 1].x},${h - pad}`}
          fill="#6BAE2E" fillOpacity="0.08"
        />
        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#6BAE2E" />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">{p.s}</text>
            <text x={p.x} y={h - 4} textAnchor="middle" fontSize="8" fill="#9ca3af">
              {entries[i]?.date?.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function CheckinChart({ entries, targetLevel }: { entries: WorkEntry[]; targetLevel: string }) {
  const scores = entries.map(e => e.score ?? 0)
  const max = 100
  const h = 100
  const w = 600
  const pad = 30

  const points = scores.map((s, i) => {
    const x = pad + (i / Math.max(scores.length - 1, 1)) * (w - 2 * pad)
    const y = h - pad - ((s / max) * (h - 2 * pad))
    return { x, y, s }
  })
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const band = CEFR_BANDS[targetLevel]
  const bandY1 = band ? h - pad - ((band[1] / max) * (h - 2 * pad)) : 0
  const bandY2 = band ? h - pad - ((band[0] / max) * (h - 2 * pad)) : 0

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: w, height: 'auto', display: 'block' }}>
        {band && (
          <rect x={pad} y={bandY1} width={w - 2 * pad} height={bandY2 - bandY1} fill="#6BAE2E" fillOpacity="0.08" />
        )}
        {[25, 50, 75, 100].map(v => {
          const y = h - pad - ((v / max) * (h - 2 * pad))
          return (
            <g key={v}>
              <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={pad - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{v}</text>
            </g>
          )
        })}
        {band && (
          <text x={w - pad} y={(bandY1 + bandY2) / 2 + 3} textAnchor="end" fontSize="9" fill="#6BAE2E" fontWeight="700">
            {targetLevel} target band
          </text>
        )}
        <polyline points={polyline} fill="none" stroke="#6BAE2E" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#6BAE2E" />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">{p.s}</text>
            <text x={p.x} y={h - 4} textAnchor="middle" fontSize="8" fill="#9ca3af">{entries[i]?.date?.slice(5)}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 80) return '#6BAE2E'
  if (score >= 65) return '#f59e0b'
  return '#ef4444'
}

const bigAvatar: React.CSSProperties = {
  width: 56, height: 56, borderRadius: '50%', backgroundColor: '#e8f5d6',
  color: '#6BAE2E', fontSize: 24, fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
const card: React.CSSProperties = {
  backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12,
  padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}
const sectionTitle: React.CSSProperties = {
  fontSize: 15, fontWeight: 700, color: '#111827', marginTop: 0, marginBottom: 14,
}
const entryCard: React.CSSProperties = {
  border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '12px 16px',
}
const patternChip: React.CSSProperties = {
  backgroundColor: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600,
  padding: '3px 10px', borderRadius: 99,
}
const btnGreen: React.CSSProperties = {
  padding: '10px 18px', backgroundColor: '#6BAE2E', color: '#fff',
  border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'Arial, Liberation Sans, sans-serif', textDecoration: 'none',
  display: 'inline-block',
}
const btnGhostLink: React.CSSProperties = {
  padding: '10px 18px', backgroundColor: '#fff', color: '#6BAE2E',
  border: '1.5px solid #6BAE2E', borderRadius: 7, fontSize: 13, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'Arial, Liberation Sans, sans-serif', textDecoration: 'none',
  display: 'inline-block', textAlign: 'center',
}
const btnGhost: React.CSSProperties = {
  padding: '9px 14px', backgroundColor: '#f3f4f6', color: '#374151',
  border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer',
  fontFamily: 'Arial, Liberation Sans, sans-serif',
}
const btnSmall: React.CSSProperties = {
  padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#374151',
  border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, cursor: 'pointer',
  fontFamily: 'Arial, Liberation Sans, sans-serif',
}
const btnDanger: React.CSSProperties = {
  padding: '9px 16px', backgroundColor: '#fff', color: '#ef4444',
  border: '1.5px solid #ef4444', borderRadius: 7, fontSize: 13, cursor: 'pointer',
  fontFamily: 'Arial, Liberation Sans, sans-serif',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db',
  borderRadius: 7, fontSize: 14, fontFamily: 'Arial, Liberation Sans, sans-serif',
  outline: 'none', boxSizing: 'border-box',
}
const loadingStyle: React.CSSProperties = {
  fontFamily: 'Arial, Liberation Sans, sans-serif', padding: 40, color: '#9ca3af', fontSize: 14,
}
