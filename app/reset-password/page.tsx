'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT, RADIUS, SHADOW } from '@/lib/theme'

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
    setDone(true)
    setTimeout(() => router.push('/login'), 2000)
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

        {done ? (
          <>
            <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 22, color: COLORS.ink, marginBottom: 6 }}>Password updated</h1>
            <p style={{ fontSize: 13.5, color: COLORS.muted }}>Taking you to sign in…</p>
          </>
        ) : !token ? (
          <>
            <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 22, color: COLORS.ink, marginBottom: 6 }}>Invalid link</h1>
            <p style={{ fontSize: 13.5, color: COLORS.muted, marginBottom: 16 }}>This reset link is missing its token.</p>
            <Link href="/forgot-password" style={{ fontSize: 13, color: COLORS.greenDk, fontWeight: 600, textDecoration: 'none' }}>Request a new link →</Link>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 22, color: COLORS.ink, marginBottom: 6 }}>Set a new password</h1>
            <p style={{ fontSize: 13.5, color: COLORS.muted, marginBottom: 22 }}>Choose a password you'll remember this time.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="password" placeholder="New password (min. 8 characters)" value={password} onChange={e => setPassword(e.target.value)}
                autoFocus required minLength={8} style={inputStyle}
              />
              {error && <p style={{ color: COLORS.danger, fontSize: 13, margin: 0 }}>{error}</p>}
              <button type="submit" disabled={loading} style={{
                background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill,
                padding: '12px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green,
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Saving…' : 'Set new password'}
              </button>
            </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
