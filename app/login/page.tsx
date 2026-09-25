'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT, RADIUS, SHADOW } from '@/lib/theme'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, remember: String(remember), redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('Incorrect email or password.')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', fontFamily: FONT.sans,
      background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        position: 'relative', background: 'rgba(245,241,230,0.98)', borderRadius: RADIUS.card,
        boxShadow: SHADOW.ink, padding: '36px 32px', width: '100%', maxWidth: 380,
      }}>
        <div style={{ marginBottom: 24 }}>
          <SomersetLogo />
        </div>
        <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 22, color: COLORS.ink, marginBottom: 6 }}>Teacher sign in</h1>
        <p style={{ fontSize: 13.5, color: COLORS.muted, marginBottom: 22 }}>Sign in to see your groups and students.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            autoFocus required style={inputStyle}
          />
          <input
            type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            required style={inputStyle}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: COLORS.ink, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              style={{ width: 17, height: 17, accentColor: COLORS.green, cursor: 'pointer' }}
            />
            Keep me signed in on this device
          </label>
          {error && <p style={{ color: COLORS.danger, fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill,
            padding: '12px 0', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green,
            marginTop: 6, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <Link href="/forgot-password" style={{ fontSize: 12.5, color: COLORS.muted, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 16 }}>
          Forgot your password?
        </Link>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 12, padding: '11px 14px',
  fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff', boxSizing: 'border-box',
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
