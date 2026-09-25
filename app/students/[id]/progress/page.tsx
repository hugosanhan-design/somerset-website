'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ProgressReportPage() {
  const { id } = useParams<{ id: string }>()
  const [html, setHtml] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => { generate() }, [id])

  async function generate() {
    setLoading(true); setError(''); setSent(false)
    const res = await fetch(`/api/progress/${id}`)
    const data = await res.json()
    if (data.error) { setError(data.error); setHtml('') } else { setHtml(data.html) }
    setLoading(false)
  }

  function handlePrint() {
    iframeRef.current?.contentWindow?.print()
  }

  async function sendEmail() {
    setSending(true)
    const res = await fetch(`/api/progress/${id}/email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html }),
    })
    const data = await res.json()
    if (data.error) { alert(data.error) } else { setSent(true) }
    setSending(false)
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link href={`/students/${id}`} style={s.headerLink}>← Back to ficha</Link>
        <div style={s.headerTitle}>Progress report</div>
        <div style={s.headerActions}>
          {html && <button onClick={handlePrint} style={s.headerBtn}>🖨 Print / Save PDF</button>}
          {html && <button onClick={sendEmail} disabled={sending} style={s.headerBtn}>{sending ? 'Sending…' : sent ? '✓ Sent' : '✉ Email to parent'}</button>}
          <button onClick={generate} disabled={loading} style={s.headerBtnGhost}>↻ Regenerate</button>
        </div>
      </header>

      <div style={s.preview}>
        {loading && <p style={s.msg}>Generating report…</p>}
        {error && <p style={s.errorMsg}>{error}</p>}
        {html && <iframe ref={iframeRef} srcDoc={html} style={s.iframe} title="Progress report" />}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, Liberation Sans, sans-serif' },
  header: {
    background: '#6BAE2E', color: '#fff', padding: '14px 18px',
    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
  },
  headerLink: { color: '#fff', textDecoration: 'none', fontSize: 13, opacity: 0.9 },
  headerTitle: { fontSize: 16, fontWeight: 700, flex: 1 },
  headerActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  headerBtn: {
    background: '#fff', color: '#2d6a0a', border: 'none', borderRadius: 6,
    padding: '7px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
  },
  headerBtnGhost: {
    background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: 6, padding: '7px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
  },
  preview: { flex: 1, background: '#f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  msg: { color: '#6b7280', fontSize: 14 },
  errorMsg: { color: '#c0392b', fontSize: 14, maxWidth: 420, textAlign: 'center', padding: 20 },
  iframe: { width: '100%', height: '100%', border: 'none', background: '#fff' },
}
