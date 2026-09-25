'use client'
import { useState } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT, RADIUS, SHADOW } from '@/lib/theme'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div style={{
      minHeight: '100vh', fontFamily: FONT.sans,
      backgroundImage: "url('/Somerset b-g.jpg')", backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,40,27,0.6)' }} />
      <div style={{
        position: 'relative', background: 'rgba(245,241,230,0.98)', borderRadius: RADIUS.card,
        boxShadow: SHADOW.ink, padding: '36px 32px', width: '100%', maxWidth: 380,
      }}>
        <div style={{ marginBottom: 24 }}><SomersetLogo /></div>

        {sent ? (
          <>
            <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 22, color: COLORS.ink, marginBottom: 6 }}>Check your email</h1>
            <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.5 }}>
              If that email has an account, a reset link is on its way — it works for 1 hour.
            </p>
            <Link href="/login" style={{ fontSize: 13, color: COLORS.greenDk, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 16 }}>← Back to sign in</Link>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 22, color: COLORS.ink, marginBottom: 6 }}>Reset your password</h1>
            <p style={{ fontSize: 13.5, color: COLORS.muted, marginBottom: 22 }}>Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                autoFocus required style={inputStyle}
              />
              <button type="submit" disabled={loading} style={{
                background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill,
                padding: '12px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green,
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <Link href="/login" style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 16 }}>← Back to sign in</Link>
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 12, padding: '11px 14px',
  fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff', boxSizing: 'border-box',
}
