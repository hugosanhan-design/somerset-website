'use client'
import { useState, useRef, useEffect } from 'react'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT, RADIUS, SHADOW, EASE } from '@/lib/theme'

const MAX_FILE_MB = 10
const LEVELS = ['B1', 'B2', 'C1 (CAE)']
const TASK_TYPES = ['Essay', 'Email', 'Letter', 'Report', 'Article', 'Review']
const CODE_STORAGE_KEY = 'sara-access-code'

export default function SaraPage() {
  const [code, setCode] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem(CODE_STORAGE_KEY)
    if (saved) setCode(saved)
  }, [])

  const [level, setLevel] = useState('B1')
  const [taskType, setTaskType] = useState('Essay')
  const [taskPrompt, setTaskPrompt] = useState('')
  const [studentText, setStudentText] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingDocx, setGeneratingDocx] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [reportHtml, setReportHtml] = useState('')
  const [aiDetection, setAiDetection] = useState<{
    verdict: string; confidence: string; flags: string[]; note: string
  } | null>(null)
  const [detectingAi, setDetectingAi] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    sessionStorage.setItem(CODE_STORAGE_KEY, codeInput)
    setCode(codeInput)
    setCodeError('')
  }

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
      const res = await fetch('/api/extract', { method: 'POST', headers: { 'x-access-code': code }, body: form })
      if (res.status === 401) { setCode(''); setCodeError('That code stopped working. Try again.'); return }
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
    setAiDetection(null)

    setDetectingAi(true)
    fetch('/api/detect-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-access-code': code },
      body: JSON.stringify({ level, taskType, studentText }),
    }).then(r => r.json()).then(data => setAiDetection(data)).catch(() => {}).finally(() => setDetectingAi(false))

    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-code': code },
        body: JSON.stringify({ studentName: '', level, taskType, taskPrompt, studentText }),
      })
      if (res.status === 401) { setCode(''); setCodeError('That code stopped working. Try again.'); return }
      const data = await res.json()
      setReportHtml(data.html)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    iframeRef.current?.contentWindow?.print()
  }

  async function handleDownloadDocx() {
    if (!taskPrompt.trim() || !studentText.trim()) return
    setGeneratingDocx(true)
    try {
      const res = await fetch('/api/correct-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-code': code },
        body: JSON.stringify({ studentName: '', level, taskType, taskPrompt, studentText }),
      })
      if (!res.ok) { alert('Word generation failed. Please try again.'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'correction.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setGeneratingDocx(false)
    }
  }

  if (!code) {
    return (
      <div style={s.codeWrap}>
        <div style={s.codeCard}>
          <div style={{ marginBottom: 24 }}><SomersetLogo /></div>
          <h1 style={s.codeTitle}>Hola, Sara 👋</h1>
          <p style={s.codeSub}>Enter the access code to open the writing correction tool.</p>
          <form onSubmit={handleCodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password" placeholder="Access code" value={codeInput} onChange={e => setCodeInput(e.target.value)}
              autoFocus required style={s.codeInput}
            />
            {codeError && <p style={{ color: COLORS.danger, fontSize: 13, margin: 0 }}>{codeError}</p>}
            <button type="submit" style={s.codeBtn}>Continue</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.logoText}>Somerset</div>
          <div style={s.logoSub}>Writing Correction — Sara</div>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Level</label>
          <select style={s.input} value={level} onChange={e => setLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>

          <label style={s.label}>Task type</label>
          <select style={s.input} value={taskType} onChange={e => setTaskType(e.target.value)}>
            {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>

          <label style={s.label}>Task prompt <span style={s.req}>*</span></label>
          <textarea
            style={{ ...s.input, height: 90, resize: 'vertical' }}
            value={taskPrompt}
            onChange={e => setTaskPrompt(e.target.value)}
            placeholder="Paste the exact question or instruction the student received"
            required
          />

          <label style={s.label}>Student's answer <span style={s.req}>*</span></label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => pdfInputRef.current?.click()} disabled={extracting} style={s.uploadBtn}>
              📄 Upload PDF
            </button>
            <button type="button" onClick={() => photoInputRef.current?.click()} disabled={extracting} style={s.uploadBtn}>
              📷 Photo / Image
            </button>
            <input ref={pdfInputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileExtract(f); e.target.value = '' }} />
            <input ref={photoInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileExtract(f); e.target.value = '' }} />
          </div>

          {extracting && <p style={{ fontSize: 12, color: COLORS.greenDk, margin: 0 }}>Reading file…</p>}
          {extractError && <p style={{ fontSize: 12, color: COLORS.danger, margin: 0 }}>{extractError}</p>}

          <textarea
            style={{ ...s.input, height: 200, resize: 'vertical' }}
            value={studentText}
            onChange={e => setStudentText(e.target.value)}
            placeholder="Paste the student's text here, or use the buttons above"
            required
          />

          <button type="submit" style={loading ? s.buttonDisabled : s.button} disabled={loading}>
            {loading ? 'Correcting…' : 'Generate report'}
          </button>

          {reportHtml && (
            <button type="button" onClick={handlePrint} style={s.printButton}>
              🖨 Print / Save PDF
            </button>
          )}
          {reportHtml && (
            <button type="button" onClick={handleDownloadDocx} disabled={generatingDocx} style={s.printButton}>
              {generatingDocx ? 'Generating…' : '📝 Download Word (.docx)'}
            </button>
          )}

          {(detectingAi || aiDetection) && (
            <div style={s.aiPanel}>
              <div style={s.aiPanelTitle}>🤖 AI Detection</div>
              {detectingAi && !aiDetection && <p style={s.aiAnalysing}>Analysing…</p>}
              {aiDetection && (
                <>
                  <div style={{
                    ...s.aiVerdict,
                    backgroundColor: aiDetection.verdict === 'high' ? '#fef2f2' : aiDetection.verdict === 'medium' ? '#fffbeb' : COLORS.paper2,
                    borderColor: aiDetection.verdict === 'high' ? '#fca5a5' : aiDetection.verdict === 'medium' ? '#fcd34d' : COLORS.green,
                  }}>
                    <span style={{
                      fontWeight: 700,
                      color: aiDetection.verdict === 'high' ? '#dc2626' : aiDetection.verdict === 'medium' ? '#d97706' : COLORS.greenDk,
                    }}>
                      {aiDetection.verdict === 'high' ? '⚠ Likely AI' : aiDetection.verdict === 'medium' ? '~ Uncertain' : '✓ Likely human'}
                    </span>
                    <span style={s.aiConfidence}> · {aiDetection.confidence} confidence</span>
                  </div>
                  <p style={s.aiNote}>{aiDetection.note}</p>
                  {aiDetection.flags?.length > 0 && (
                    <ul style={s.aiFlags}>{aiDetection.flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  )}
                  <p style={s.aiDisclaimer}>AI detection is never definitive. Use as a starting point only.</p>
                </>
              )}
            </div>
          )}
        </form>
      </div>

      <div style={s.preview}>
        {!reportHtml && !loading && (
          <div style={s.placeholder}>
            <p style={s.placeholderText}>Fill in the form and click <strong>Generate report</strong>.</p>
            <p style={s.placeholderSub}>The correction report will appear here, ready to print.</p>
          </div>
        )}
        {loading && (
          <div style={s.placeholder}>
            <div style={s.spinner} />
            <p style={s.placeholderText}>Generating correction…</p>
          </div>
        )}
        {reportHtml && (
          <iframe ref={iframeRef} srcDoc={reportHtml} style={s.iframe} title="Correction Report" />
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  codeWrap: {
    minHeight: '100vh', fontFamily: FONT.sans,
    backgroundImage: "url('/Somerset b-g.jpg')", backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative',
  },
  codeCard: {
    position: 'relative', background: 'rgba(245,241,230,0.98)', borderRadius: RADIUS.card,
    boxShadow: SHADOW.ink, padding: '36px 32px', width: '100%', maxWidth: 380,
  },
  codeTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 24, color: COLORS.ink, marginBottom: 6 },
  codeSub: { fontSize: 13.5, color: COLORS.muted, marginBottom: 22 },
  codeInput: {
    borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 12, padding: '11px 14px',
    fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff', boxSizing: 'border-box',
  },
  codeBtn: {
    background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill,
    padding: '12px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green,
  },

  page: { display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: FONT.sans },
  sidebar: {
    width: 340, background: '#fff', borderRight: `1px solid ${COLORS.line}`,
    display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto',
  },
  sidebarHeader: { background: COLORS.racing, padding: '18px 20px' },
  logoText: { color: '#fff', fontWeight: 700, fontSize: 17, fontFamily: FONT.brand },
  logoSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  form: { padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.1em' },
  req: { color: COLORS.danger },
  input: {
    border: `1.5px solid ${COLORS.line}`, borderRadius: 10, padding: '9px 12px',
    fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff',
  },
  button: {
    background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill,
    padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 6, boxShadow: SHADOW.green,
  },
  buttonDisabled: {
    background: '#B9D9A6', color: '#fff', border: 'none', borderRadius: RADIUS.pill,
    padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'not-allowed', marginTop: 6,
  },
  printButton: {
    background: '#fff', color: COLORS.greenDk, border: `1.5px solid ${COLORS.green}`,
    borderRadius: RADIUS.pill, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  uploadBtn: {
    flex: 1, background: COLORS.paper2, color: COLORS.ink, border: `1.5px solid ${COLORS.line}`,
    borderRadius: 10, padding: '7px 6px', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  preview: {
    flex: 1, background: COLORS.paper2, overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  placeholder: { textAlign: 'center', padding: 32 },
  placeholderText: { fontSize: 16, color: COLORS.ink, marginBottom: 8, fontFamily: FONT.serif },
  placeholderSub: { fontSize: 13, color: COLORS.muted },
  spinner: {
    width: 36, height: 36, border: `4px solid ${COLORS.line}`, borderTop: `4px solid ${COLORS.green}`,
    borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
  },
  iframe: { width: '100%', height: '100%', border: 'none', background: '#fff' },
  aiPanel: {
    marginTop: 12, border: `1.5px solid ${COLORS.line}`, borderRadius: 12,
    padding: '12px 14px', background: COLORS.paper, fontSize: 13,
  },
  aiPanelTitle: { fontWeight: 700, fontSize: 12, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
  aiAnalysing: { color: COLORS.muted, fontSize: 13, margin: 0 },
  aiVerdict: { display: 'inline-block', padding: '4px 10px', borderRadius: RADIUS.pill, border: '1.5px solid', fontSize: 13, marginBottom: 8 },
  aiConfidence: { fontSize: 12, color: COLORS.muted, fontWeight: 400 },
  aiNote: { fontSize: 13, color: COLORS.inkSoft, margin: '4px 0 8px', lineHeight: 1.5 },
  aiFlags: { margin: '0 0 8px', paddingLeft: 18, color: COLORS.muted, fontSize: 12, lineHeight: 1.7 },
  aiDisclaimer: { fontSize: 11, color: COLORS.muted, margin: 0, fontStyle: 'italic' },
}
