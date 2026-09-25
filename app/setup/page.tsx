'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT, RADIUS, SHADOW } from '@/lib/theme'

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/teachers/bootstrap', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Setup failed.')
      setLoading(false)
      return
    }
    const signInRes = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (signInRes?.error) {
      router.push('/login')
    } else {
      router.push('/teacher')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', fontFamily: FONT.sans, background: COLORS.paper,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: RADIUS.card, boxShadow: SHADOW.inkSoft,
        padding: '36px 32px', width: '100%', maxWidth: 420, border: `1px solid ${COLORS.line}`,
      }}>
        <div style={{ marginBottom: 24 }}>
          <SomersetLogo />
        </div>
        <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 22, color: COLORS.ink, marginBottom: 6 }}>Welcome — set up the first admin account</h1>
        <p style={{ fontSize: 13.5, color: COLORS.muted, marginBottom: 22, lineHeight: 1.5 }}>
          This runs once. This account gets admin access — it can see every teacher's groups and add new teacher logins afterwards.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password (min. 8 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle} />
          {error && <p style={{ color: COLORS.danger, fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill,
            padding: '12px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green,
            marginTop: 6, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating account…' : 'Create admin account'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 12, padding: '11px 14px',
  fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff', boxSizing: 'border-box',
}
