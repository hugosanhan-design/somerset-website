'use client'

// Function 4, Phase 0 — Answer key entry (revised 17 Jul 2026).
// The answer key comes straight from the book, in clear — so it's entered directly:
// click the letter for letter parts, type the word/phrase for text parts. No photo
// scanning for keys. The vision reading pipeline (api/mocks/read-key) is reserved for
// Phase 1, where student pencil sheets have no printed source and must be photographed.

import { useEffect, useMemo, useState } from 'react'
import { COLORS, FONT, card, h1, h2, eyebrow, btnPrimary, btnGhost, btnSmall, input as inputStyle, page as pageStyle } from '@/lib/theme'
import type { ExamPartDefinition } from '@/lib/mocks'

interface ExamListItem {
  id: string
  title: string
  parts: ExamPartDefinition[]
  hasKey: boolean
  reviewedBy: string | null
  reviewedAt: string | null
}

interface CbtResult {
  id: string
  examId: string
  studentName: string
  paper: string
  score: Record<string, { correct: number; outOf: number; points: number; pointsOutOf: number }> | null
  answers: Record<string, string>
  submittedAt: string
}

const qKey = (part: string, q: number) => `${part}#${q}`

// submitted_at arrives as Postgres now()::text (e.g. "2026-07-23 21:40:12.12+00") —
// not ISO, so normalise before parsing; fall back to the raw date part if parsing fails.
function fmtWhen(raw: string | null | undefined): string {
  if (!raw) return ''
  const iso = raw.replace(' ', 'T').replace(/(\+\d{2})$/, '$1:00')
  const d = new Date(iso)
  if (isNaN(d.getTime())) return raw.slice(0, 10)
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function groupSubmissions(results: CbtResult[]) {
  const groups = new Map<string, { examId: string; studentName: string; papers: CbtResult[] }>()
  for (const r of results) {
    const key = `${r.examId}::${r.studentName}`
    const g = groups.get(key) || { examId: r.examId, studentName: r.studentName, papers: [] }
    g.papers.push(r)
    groups.set(key, g)
  }
  return Array.from(groups.values()).sort((a, b) =>
    a.studentName.localeCompare(b.studentName) || a.examId.localeCompare(b.examId))
}

export default function MocksPage() {
  const [exams, setExams] = useState<ExamListItem[]>([])
  const [loadingExams, setLoadingExams] = useState(true)
  const [exam, setExam] = useState<ExamListItem | null>(null)
  const [stage, setStage] = useState<'pick' | 'entry' | 'saved'>('pick')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [results, setResults] = useState<CbtResult[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/cbt/results').then(r => r.ok ? r.json() : []).then(setResults).catch(() => {})
  }, [])

  async function deleteSubmission(r: CbtResult) {
    if (!confirm(`Delete ${r.studentName}'s ${r.paper} submission? This can't be undone.`)) return
    setDeletingId(r.id)
    setError('')
    try {
      const res = await fetch(`/api/cbt/results?id=${encodeURIComponent(r.id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Delete failed')
      setResults(list => list.filter(x => x.id !== r.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete — try again.')
    } finally {
      setDeletingId(null)
    }
  }

  function loadExams() {
    fetch('/api/mocks/exams')
      .then(r => r.json())
      .then(data => { setExams(data); setLoadingExams(false) })
      .catch(() => { setError('Could not load exams.'); setLoadingExams(false) })
  }
  useEffect(loadExams, [])

  async function pickExam(e: ExamListItem) {
    setExam(e)
    setError('')
    setAnswers({})
    if (e.hasKey) {
      try {
        const res = await fetch(`/api/mocks/answer-key?examId=${encodeURIComponent(e.id)}`)
        if (res.ok) {
          const key = await res.json()
          if (key?.answers) setAnswers(key.answers)
        }
      } catch { /* start blank if the existing key can't be fetched */ }
    }
    setStage('entry')
  }

  const allQuestions = useMemo(() => {
    if (!exam) return []
    return exam.parts.flatMap(p =>
      Array.from({ length: p.qTo - p.qFrom + 1 }, (_, i) => ({ part: p, qNumber: p.qFrom + i, key: qKey(p.part.toString(), p.qFrom + i) }))
    )
  }, [exam])

  const answeredCount = allQuestions.filter(q => (answers[q.key] || '').trim() !== '').length
  const missingCount = allQuestions.length - answeredCount

  function setAnswer(key: string, value: string) {
    setAnswers(a => ({ ...a, [key]: value }))
  }

  async function saveKey() {
    if (!exam) return
    setSaving(true)
    setError('')
    try {
      const clean: Record<string, string> = {}
      for (const q of allQuestions) {
        const v = (answers[q.key] || '').trim()
        if (v) clean[q.key] = v
      }
      const res = await fetch('/api/mocks/answer-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: exam.id, answers: clean }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      setStage('saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving failed — try again.')
    } finally {
      setSaving(false)
    }
  }

  function QuestionRow({ part, qNumber }: { part: ExamPartDefinition; qNumber: number }) {
    const key = qKey(part.part, qNumber)
    const value = answers[key] ?? ''

    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 12,
        background: '#fff', border: `1.5px solid ${COLORS.line}`, flexWrap: 'wrap',
      }}>
        <div style={{ width: 34, fontWeight: 700, fontSize: 14, color: COLORS.racing }}>{qNumber}</div>

        {part.options ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {part.options.map(opt => (
              <button key={opt} onClick={() => setAnswer(key, value === opt ? '' : opt)} style={{
                width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
                fontFamily: FONT.sans, fontWeight: 700, fontSize: 14,
                border: `1.5px solid ${value === opt ? COLORS.green : COLORS.line}`,
                background: value === opt ? COLORS.green : '#fff',
                color: value === opt ? '#fff' : COLORS.ink,
              }}>{opt}</button>
            ))}
          </div>
        ) : (
          <input
            defaultValue={value}
            onBlur={e => { if (e.target.value !== value) setAnswer(key, e.target.value) }}
            placeholder="answer — use / for accepted alternatives"
            style={{ ...inputStyle, width: 280, padding: '8px 12px', fontSize: 14 }}
          />
        )}
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '28px 28px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink }}>Mock correction</div>
        {error && (
          <div style={{ ...card, borderColor: COLORS.danger, color: COLORS.danger, fontWeight: 600, fontSize: 14 }}>{error}</div>
        )}

        {/* ── Stage: pick exam ── */}
        {stage === 'pick' && (
          <>
            <div>
              <div style={eyebrow}>Step 1 of 2</div>
              <h1 style={h1}>Which exam?</h1>
              <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 6 }}>
                Enter the answer key once per exam, straight from the book — every student sheet is then checked against it.
              </p>
            </div>

            <a href="/cbt" style={{
              ...card, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
              borderColor: COLORS.green, background: '#F3F9EC',
            }}>
              <span style={{ fontSize: 22 }}>🖥️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: COLORS.ink }}>Looking for the exam students actually sit?</div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
                  This page is for entering answer keys. The Cambridge-style computer-based exam — full text + listening — is at <strong>/cbt</strong>. Open it →
                </div>
              </div>
            </a>
            {loadingExams && <div style={{ ...card, color: COLORS.muted }}>Loading exams…</div>}
            {exams.map(e => (
              <button key={e.id} onClick={() => pickExam(e)} style={{ ...card, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ ...h2, marginBottom: 4 }}>{e.title}</div>
                  <div style={{ fontSize: 13, color: COLORS.muted }}>
                    {e.hasKey ? `✓ Key entered by ${e.reviewedBy}${e.reviewedAt ? ` · ${e.reviewedAt.slice(0, 10)}` : ''} — open to view or edit` : 'No answer key yet'}
                  </div>
                </div>
                <span style={{ ...btnSmall }}>{e.hasKey ? 'Edit key' : 'Enter key'}</span>
              </button>
            ))}

            {/* ── CBT submissions, grouped by student + exam ── */}
            <div style={{ marginTop: 16 }}>
              <div style={eyebrow}>Computer-based exam submissions</div>
              {results.length === 0 && (
                <p style={{ fontSize: 13.5, color: COLORS.muted, marginTop: 8 }}>
                  None yet. Students sit the exam at <strong>/cbt</strong> — no login needed. Enter the exam&apos;s answer
                  key above and submissions are scored automatically.
                </p>
              )}
              {groupSubmissions(results).map(g => {
                const total = g.papers.reduce((s, p) => s + (p.score ? Object.values(p.score).reduce((a, v) => a + v.points, 0) : 0), 0)
                const totalOutOf = g.papers.reduce((s, p) => s + (p.score ? Object.values(p.score).reduce((a, v) => a + v.pointsOutOf, 0) : 0), 0)
                const paperNames: Record<string, string> = { 'reading-uoe': 'Reading & UoE', writing: 'Writing', listening: 'Listening' }
                return (
                  <div key={`${g.examId}::${g.studentName}`} style={{ ...card, marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.ink }}>
                          {g.studentName} <span style={{ fontWeight: 400, color: COLORS.muted, fontSize: 13 }}>· {g.examId}</span>
                        </div>
                        <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
                          {g.papers.map(p => `${paperNames[p.paper] || p.paper} ✓ ${fmtWhen(p.submittedAt)}`).join(' · ')}
                          {['reading-uoe', 'writing', 'listening'].filter(p => !g.papers.some(x => x.paper === p)).map(p => ` · ${paperNames[p]} —`).join('')}
                        </div>
                      </div>
                      {totalOutOf > 0 && (
                        <div style={{ fontFamily: FONT.serif, fontSize: 22, color: COLORS.racing, fontWeight: 600 }}>
                          {total}<span style={{ fontSize: 13, color: COLORS.muted }}>/{totalOutOf}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                      <a href={`/api/mocks/report?examId=${encodeURIComponent(g.examId)}&student=${encodeURIComponent(g.studentName)}`}
                        target="_blank" rel="noopener noreferrer" style={{ ...btnSmall, textDecoration: 'none', display: 'inline-block' }}>
                        View full report →
                      </a>
                      <span style={{ fontSize: 12, color: COLORS.muted }}>opens in a new tab · print to save as PDF</span>
                      <div style={{ flex: 1 }} />
                      {g.papers.map(p => (
                        <button key={p.id} onClick={() => deleteSubmission(p)} disabled={deletingId === p.id}
                          title={`Delete ${paperNames[p.paper] || p.paper} submission`} aria-label={`Delete ${g.studentName}'s ${p.paper} submission`}
                          style={{
                            background: 'none', border: `1.5px solid ${COLORS.line}`, borderRadius: 10,
                            padding: '6px 10px', cursor: deletingId === p.id ? 'default' : 'pointer',
                            fontSize: 13, color: COLORS.danger, opacity: deletingId === p.id ? 0.5 : 1, lineHeight: 1,
                          }}
                        >{deletingId === p.id ? '…' : `🗑 ${paperNames[p.paper] || p.paper}`}</button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── Stage: enter/edit key ── */}
        {stage === 'entry' && exam && (
          <>
            <div>
              <div style={eyebrow}>Step 2 of 2 · {exam.title}</div>
              <h1 style={h1}>Enter the answer key</h1>
              <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 6 }}>
                Copy from the book&apos;s key: click the letter, or type the word/phrase. Where the key accepts
                alternatives, separate them with &quot;/&quot; (e.g. &quot;which / that&quot;).
              </p>
            </div>

            {exam.parts.map(part => (
              <div key={part.part} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={h2}>{part.label}</div>
                {Array.from({ length: part.qTo - part.qFrom + 1 }, (_, i) => (
                  <QuestionRow key={qKey(part.part, part.qFrom + i)} part={part} qNumber={part.qFrom + i} />
                ))}
              </div>
            ))}

            <div style={{ position: 'sticky', bottom: 14, display: 'flex', gap: 10, alignItems: 'center', background: COLORS.paper, padding: '10px 0' }}>
              <button onClick={saveKey} disabled={answeredCount === 0 || saving}
                style={{ ...btnPrimary, opacity: answeredCount === 0 || saving ? 0.55 : 1 }}>
                {saving ? 'Saving…' : `Save answer key (${answeredCount}/${allQuestions.length})`}
              </button>
              {missingCount > 0 && answeredCount > 0 && (
                <span style={{ fontSize: 12.5, color: '#8A6210', fontWeight: 600 }}>
                  {missingCount} still blank — fine if that paper wasn&apos;t sat
                </span>
              )}
              <button onClick={() => { setStage('pick'); setExam(null) }} style={btnGhost}>Back</button>
            </div>
          </>
        )}

        {/* ── Stage: saved ── */}
        {stage === 'saved' && exam && (
          <div style={{ ...card, textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 40 }}>✅</div>
            <h1 style={{ ...h1, marginTop: 10 }}>Answer key saved</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, margin: '10px 0 22px' }}>
              {exam.title} — {answeredCount} answers stored. Every student sheet for this exam will be checked against this key.
            </p>
            <button onClick={() => { setStage('pick'); setExam(null); loadExams() }} style={btnPrimary}>
              Done
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
