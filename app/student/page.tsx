'use client'

// Student's Corner — public hub, no login. General tools (mock, placement, games) are
// open to everyone. "Your area" is gated by name + code, verified server-side
// (/api/student/access), and shows only that student's own content.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT, RADIUS, SHADOW, EASE } from '@/lib/theme'

interface StudentLink { emoji: string; title: string; desc: string; href: string }
interface StudentArea { displayName: string; links: StudentLink[] }

export default function StudentCorner() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [area, setArea] = useState<StudentArea | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  // Remember the student on this device and re-verify on load.
  useEffect(() => {
    let saved: { name?: string; code?: string } | null = null
    try { saved = JSON.parse(localStorage.getItem('somersetStudent') || 'null') } catch { saved = null }
    if (saved?.name && saved?.code) {
      setName(saved.name); setCode(saved.code)
      fetch('/api/student/access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saved),
      }).then(r => r.json()).then(d => { if (d?.ok) setArea(d.area) }).catch(() => {})
    }
  }, [])

  async function handleEnter(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const r = await fetch('/api/student/access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) { setErr(d.error || 'Name or code not recognised.'); return }
      setArea(d.area)
      try { localStorage.setItem('somersetStudent', JSON.stringify({ name, code })) } catch { /* ignore */ }
    } catch {
      setErr('Could not check right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    try { localStorage.removeItem('somersetStudent') } catch { /* ignore */ }
    setArea(null); setName(''); setCode(''); setErr('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: FONT.sans,
      backgroundImage: "url('/Somerset b-g.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div style={{ minHeight: '100vh', backgroundColor: 'rgba(23,40,27,0.55)' }}>

        <header style={{ backgroundColor: 'rgba(30,66,39,0.88)', padding: '16px 28px', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <SomersetLogo variant="white" />
          <Link href="/" style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600, textDecoration: 'none' }}>← Home</Link>
        </header>

        <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 24px' }}>

          <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 30, color: '#fff', marginBottom: 6, letterSpacing: '-0.01em' }}>Student&apos;s Corner</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14.5, marginBottom: 28 }}>
            Pick what your teacher has asked you to do.
          </p>

          {/* ── Your area (gated) ───────────────────────── */}
          <div style={panel}>
            {!area ? (
              <>
                <div style={panelTitle}>Who are you?</div>
                <div style={panelDesc}>Enter your name and the code your teacher gave you to open your own plan and practice.</div>
                <form onSubmit={handleEnter} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                  <input style={input} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} autoComplete="off" />
                  <input style={input} placeholder="Access code" value={code} onChange={e => setCode(e.target.value)} autoComplete="off" />
                  <button type="submit" disabled={loading} style={enterBtn}>{loading ? 'Checking…' : 'Enter'}</button>
                  {err && <div style={errBox}>{err}</div>}
                </form>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                  <div style={panelTitle}>Hi {area.displayName} — here&apos;s your work</div>
                  <button onClick={logout} style={notYou}>Not you?</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {area.links.map(l => (
                    <a key={l.href} href={l.href} style={card}>
                      <span style={{ fontSize: 24 }}>{l.emoji}</span>
                      <div>
                        <div style={cardTitle}>{l.title}</div>
                        <div style={cardDesc}>{l.desc}</div>
                      </div>
                      <span style={chev}>›</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={sectionLabel}>For everyone</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <Link href="/cbt" style={card}>
              <span style={{ fontSize: 24 }}>🖥️</span>
              <div>
                <div style={cardTitle}>Sit a Mock Exam</div>
                <div style={cardDesc}>Cambridge-style B2 First — Reading, Use of English, Writing and Listening.</div>
              </div>
              <span style={chev}>›</span>
            </Link>

            <Link href="/cbt" style={card}>
              <span style={{ fontSize: 24 }}>↩️</span>
              <div>
                <div style={cardTitle}>Continue an exam</div>
                <div style={cardDesc}>Started a mock and got cut off? Enter your resume code to carry on from where you left off — on any computer.</div>
              </div>
              <span style={chev}>›</span>
            </Link>

            <Link href="/intake" style={card}>
              <span style={{ fontSize: 24 }}>📋</span>
              <div>
                <div style={cardTitle}>Placement Quiz</div>
                <div style={cardDesc}>Quick adaptive quiz to find your level — for new students.</div>
              </div>
              <span style={chev}>›</span>
            </Link>

            <a href="/placement/index.html" style={card}>
              <span style={{ fontSize: 24 }}>📝</span>
              <div>
                <div style={cardTitle}>Placement Test</div>
                <div style={cardDesc}>Longer level test, A1–C1. Your result is sent to the centre.</div>
              </div>
              <span style={chev}>›</span>
            </a>

            <a href="/games/index.html" style={card}>
              <span style={{ fontSize: 24 }}>🎮</span>
              <div>
                <div style={cardTitle}>English Games</div>
                <div style={cardDesc}>Grammar sprint, irregular verbs, vocabulary and more — practise for fun.</div>
              </div>
              <span style={chev}>›</span>
            </a>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────
const card: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  backgroundColor: 'rgba(245,241,230,0.9)',
  border: `1px solid ${COLORS.line}`,
  borderRadius: 16,
  padding: '18px 20px',
  cursor: 'pointer',
  textDecoration: 'none',
  color: 'inherit',
  backdropFilter: 'blur(6px)',
  boxShadow: SHADOW.inkSoft,
  transition: `transform 0.18s ${EASE}`,
}
const cardTitle: React.CSSProperties = { fontFamily: FONT.serif, fontWeight: 500, fontSize: 16, color: COLORS.ink }
const cardDesc: React.CSSProperties = { fontSize: 12.5, color: COLORS.muted, marginTop: 2, lineHeight: 1.45 }
const chev: React.CSSProperties = { marginLeft: 'auto', fontSize: 22, color: '#c7cdbf' }

const panel: React.CSSProperties = {
  backgroundColor: 'rgba(245,241,230,0.94)',
  border: `1px solid ${COLORS.line}`,
  borderRadius: RADIUS.card,
  padding: '20px 22px',
  boxShadow: SHADOW.inkSoft,
  backdropFilter: 'blur(6px)',
  marginBottom: 8,
}
const panelTitle: React.CSSProperties = { fontFamily: FONT.serif, fontWeight: 500, fontSize: 18, color: COLORS.ink }
const panelDesc: React.CSSProperties = { fontSize: 13, color: COLORS.muted, marginTop: 4, lineHeight: 1.5 }
const input: React.CSSProperties = {
  fontFamily: FONT.sans, fontSize: 15, padding: '11px 13px',
  border: `1.5px solid ${COLORS.line}`, borderRadius: 10, backgroundColor: '#fff', color: COLORS.ink,
}
const enterBtn: React.CSSProperties = {
  fontFamily: FONT.sans, fontSize: 15, fontWeight: 700, color: '#fff',
  backgroundColor: COLORS.green, border: 'none', borderRadius: 10, padding: '11px 16px', cursor: 'pointer',
}
const notYou: React.CSSProperties = {
  fontSize: 12.5, color: COLORS.muted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0,
}
const errBox: React.CSSProperties = {
  fontSize: 13, color: '#a33', backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)',
  borderRadius: 8, padding: '9px 12px',
}
const sectionLabel: React.CSSProperties = {
  fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
  fontWeight: 700, margin: '26px 4px 12px',
}
