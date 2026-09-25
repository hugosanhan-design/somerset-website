'use client'
import { useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PortalShell from '@/components/portal/PortalShell'

const MAX_FILE_MB = 10
const LEVELS = ['B1', 'B2', 'C1 (CAE)']
const TASK_TYPES = ['Essay', 'Email', 'Letter', 'Report', 'Article', 'Review']

function CorrectPageInner() {
  const params = useSearchParams()
  const studentId = params.get('studentId') || ''
  const studentName = params.get('studentName') || ''
  const anonymous = params.get('anonymous') === '1'

  const [level, setLevel] = useState('B1')
  const [taskType, setTaskType] = useState('Essay')
  const [taskPrompt, setTaskPrompt] = useState('')
  const [studentText, setStudentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingDocx, setGeneratingDocx] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [reportHtml, setReportHtml] = useState('')
  const [saved, setSaved] = useState(false)
  const [aiDetection, setAiDetection] = useState<{
    verdict: string; confidence: string; flags: string[]; note: string
  } | null>(null)
  const [detectingAi, setDetectingAi] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  async function handleFileExtract(file: File) {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setExtractError(`File too large — max ${MAX_FILE_MB} MB.`)
      return
    }
    setExtracting(true)
    setExtractError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/extract', { method: 'POST', body: form })
      const data = await res.json()
      if (data.error) { setExtractError(data.error); return }
      setStudentText(data.text)
    } catch {
      setExtractError('Extraction failed. Please try again.')
    } finally {
      setExtracting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!taskPrompt.trim() || !studentText.trim()) return
    setLoading(true)
    setReportHtml('')
    setSaved(false)
    setAiDetection(null)

    // Run AI detection in parallel with correction
    setDetectingAi(true)
    fetch('/api/detect-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, taskType, studentText }),
    }).then(r => r.json()).then(data => setAiDetection(data)).catch(() => {}).finally(() => setDetectingAi(false))

    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, level, taskType, taskPrompt, studentText }),
      })
      const data = await res.json()
      setReportHtml(data.html)

      // Auto-save to student ficha if a student was selected
      if (studentId) {
        await fetch(`/api/students/${studentId}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: taskType.toLowerCase(),
            title: taskPrompt.slice(0, 80),
            date: new Date().toISOString().slice(0, 10),
            score: data.score ?? null,
            ai_feedback: data.summary ?? '',
            ai_error_patterns: data.errors ?? [],
            image_filename: '',
            teacher_notes: '',
          }),
        })
        setSaved(true)
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    if (!iframeRef.current) return
    iframeRef.current.contentWindow?.print()
  }

  async function handleDownloadDocx() {
    if (!taskPrompt.trim() || !studentText.trim()) return
    setGeneratingDocx(true)
    try {
      const res = await fetch('/api/correct-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, level, taskType, taskPrompt, studentText }),
      })
      if (!res.ok) { alert('Word generation failed. Please try again.'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `correction-${(studentName || (anonymous ? 'anonymous' : 'student')).toLowerCase().replace(/\s+/g, '-')}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setGeneratingDocx(false)
    }
  }

  return (
    <PortalShell>
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoText}>Correct writing</div>
          <div style={styles.logoSub}>AI-assisted feedback report</div>
        </div>

        {/* Anonymous context banner — one-off correction, nothing saved */}
        {!studentName && anonymous && (
          <div style={styles.studentBanner}>
            <span style={{ fontSize: 16 }}>👤</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>Anonymous student</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Won&apos;t be saved to any ficha</div>
            </div>
          </div>
        )}

        {/* Student context banner */}
        {studentName && (
          <div style={styles.studentBanner}>
            <span style={{ fontSize: 16 }}>🎓</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{studentName}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {saved
                  ? '✓ Saved to ficha'
                  : 'Result will be saved to ficha'}
              </div>
            </div>
            {saved && (
              <Link
                href={`/students/${studentId}`}
                style={{ marginLeft: 'auto', fontSize: 12, color: '#6BAE2E', fontWeight: 600, textDecoration: 'none' }}
              >
                View ficha →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Level</label>
          <select style={styles.input} value={level} onChange={e => setLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>

          <label style={styles.label}>Task type</label>
          <select style={styles.input} value={taskType} onChange={e => setTaskType(e.target.value)}>
            {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>

          <label style={styles.label}>Task prompt <span style={styles.req}>*</span></label>
          <textarea
            style={{ ...styles.input, height: 90, resize: 'vertical' }}
            value={taskPrompt}
            onChange={e => setTaskPrompt(e.target.value)}
            placeholder="Paste the exact question or instruction the student received"
            required
          />

          <label style={styles.label}>Student's answer <span style={styles.req}>*</span></label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => pdfInputRef.current?.click()} disabled={extracting} style={styles.uploadBtn}>
              📄 Upload PDF
            </button>
            <button type="button" onClick={() => photoInputRef.current?.click()} disabled={extracting} style={styles.uploadBtn}>
              📷 Photo / Image
            </button>
            <input ref={pdfInputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileExtract(f); e.target.value = '' }} />
            <input ref={photoInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileExtract(f); e.target.value = '' }} />
          </div>

          {extracting && <p style={{ fontSize: 12, color: '#6BAE2E', margin: 0 }}>Reading file…</p>}
          {extractError && <p style={{ fontSize: 12, color: '#c0392b', margin: 0 }}>{extractError}</p>}

          <textarea
            style={{ ...styles.input, height: 200, resize: 'vertical' }}
            value={studentText}
            onChange={e => setStudentText(e.target.value)}
            placeholder="Paste the student's text here, or use the buttons above"
            required
          />

          <button type="submit" style={loading ? styles.buttonDisabled : styles.button} disabled={loading}>
            {loading ? 'Correcting…' : 'Generate report'}
          </button>

          {reportHtml && (
            <button type="button" onClick={handlePrint} style={styles.printButton}>
              🖨 Print / Save PDF
            </button>
          )}
          {reportHtml && (
            <button type="button" onClick={handleDownloadDocx} disabled={generatingDocx} style={styles.printButton}>
              {generatingDocx ? 'Generating…' : '📝 Download Word (.docx)'}
            </button>
          )}

          {/* AI Detection panel */}
          {(detectingAi || aiDetection) && (
            <div style={styles.aiPanel}>
              <div style={styles.aiPanelTitle}>🤖 AI Detection</div>
              {detectingAi && !aiDetection && (
                <p style={styles.aiAnalysing}>Analysing…</p>
              )}
              {aiDetection && (
                <>
                  <div style={{
                    ...styles.aiVerdict,
                    backgroundColor:
                      aiDetection.verdict === 'high' ? '#fef2f2' :
                      aiDetection.verdict === 'medium' ? '#fffbeb' : '#f0fae6',
                    borderColor:
                      aiDetection.verdict === 'high' ? '#fca5a5' :
                      aiDetection.verdict === 'medium' ? '#fcd34d' : '#86efac',
                  }}>
                    <span style={{
                      fontWeight: 700,
                      color:
                        aiDetection.verdict === 'high' ? '#dc2626' :
                        aiDetection.verdict === 'medium' ? '#d97706' : '#16a34a',
                    }}>
                      {aiDetection.verdict === 'high' ? '⚠ Likely AI' :
                       aiDetection.verdict === 'medium' ? '~ Uncertain' : '✓ Likely human'}
                    </span>
                    <span style={styles.aiConfidence}> · {aiDetection.confidence} confidence</span>
                  </div>
                  <p style={styles.aiNote}>{aiDetection.note}</p>
                  {aiDetection.flags?.length > 0 && (
                    <ul style={styles.aiFlags}>
                      {aiDetection.flags.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  )}
                  <p style={styles.aiDisclaimer}>AI detection is never definitive. Use as a starting point only.</p>
                </>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Preview pane */}
      <div style={styles.preview}>
        {!reportHtml && !loading && (
          <div style={styles.placeholder}>
            <p style={styles.placeholderText}>Fill in the form and click <strong>Generate report</strong>.</p>
            <p style={styles.placeholderSub}>The correction report will appear here, ready to print.</p>
          </div>
        )}
        {loading && (
          <div style={styles.placeholder}>
            <div style={styles.spinner} />
            <p style={styles.placeholderText}>Generating correction…</p>
          </div>
        )}
        {reportHtml && (
          <iframe ref={iframeRef} srcDoc={reportHtml} style={styles.iframe} title="Correction Report" />
        )}
      </div>
    </div>
    </PortalShell>
  )
}

export default function CorrectPage() {
  return (
    <Suspense>
      <CorrectPageInner />
    </Suspense>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', height: '100%', minHeight: '100vh', overflow: 'hidden' },
  sidebar: {
    width: 320, background: '#fff', borderRight: '2px solid #E2E2E2',
    display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto',
  },
  sidebarHeader: { padding: '18px 20px', borderBottom: '2px solid #E2E2E2' },
  logoText: { color: '#1A1A1A', fontWeight: 700, fontSize: 17 },
  logoSub: { color: '#666666', fontSize: 12, marginTop: 2 },
  studentBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 20px', backgroundColor: '#f0fae6',
    borderBottom: '1px solid #d4edba',
  },
  form: { padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 12, fontWeight: 600, color: '#444', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  req: { color: '#c0392b' },
  input: {
    border: '2px solid #E2E2E2', borderRadius: 10, padding: '8px 10px',
    fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%',
  },
  button: {
    background: '#6BAE2E', color: '#fff', border: 'none', borderRadius: 999,
    padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 6,
  },
  buttonDisabled: {
    background: '#a5c98a', color: '#fff', border: 'none', borderRadius: 999,
    padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'not-allowed', marginTop: 6,
  },
  printButton: {
    background: '#fff', color: '#6BAE2E', border: '2px solid #6BAE2E',
    borderRadius: 999, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  uploadBtn: {
    flex: 1, background: '#F4F8EE', color: '#374151', border: '2px solid #E2E2E2',
    borderRadius: 999, padding: '7px 6px', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  preview: {
    flex: 1, background: '#f0f0ee', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  placeholder: { textAlign: 'center', padding: 32 },
  placeholderText: { fontSize: 16, color: '#555', marginBottom: 8 },
  placeholderSub: { fontSize: 13, color: '#999' },
  spinner: {
    width: 36, height: 36, border: '4px solid #ddd', borderTop: '4px solid #6BAE2E',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
  },
  iframe: { width: '100%', height: '100%', border: 'none', background: '#fff' },
  aiPanel: {
    marginTop: 12,
    border: '1.5px solid #e5e7eb',
    borderRadius: 7,
    padding: '12px 14px',
    background: '#fafafa',
    fontSize: 13,
  },
  aiPanelTitle: { fontWeight: 700, fontSize: 12, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 },
  aiAnalysing: { color: '#9ca3af', fontSize: 13, margin: 0 },
  aiVerdict: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 5,
    border: '1.5px solid',
    fontSize: 13,
    marginBottom: 8,
  },
  aiConfidence: { fontSize: 12, color: '#6b7280', fontWeight: 400 },
  aiNote: { fontSize: 13, color: '#374151', margin: '4px 0 8px', lineHeight: 1.5 },
  aiFlags: { margin: '0 0 8px', paddingLeft: 18, color: '#4b5563', fontSize: 12, lineHeight: 1.7 },
  aiDisclaimer: { fontSize: 11, color: '#9ca3af', margin: 0, fontStyle: 'italic' },
}
