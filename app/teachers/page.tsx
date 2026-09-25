'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { COLORS, FONT, RADIUS, SHADOW, EASE } from '@/lib/theme'

interface Teacher { id: string; name: string; email: string; role: string; group_count: number; created_at: string }

export default function TeachersPage() {
  const { data: session, status } = useSession()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'teacher' | 'admin'>('teacher')
  const [error, setError] = useState('')

  useEffect(() => { if (status === 'authenticated') load() }, [status])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/teachers')
    if (res.ok) setTeachers(await res.json())
    setLoading(false)
  }

  async function createTeacher(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/teachers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to create teacher'); return }
    setName(''); setEmail(''); setPassword(''); setRole('teacher')
    load()
  }

  async function removeTeacher(id: string) {
    if (!confirm('Remove this teacher? Their groups will become unassigned, not deleted.')) return
    await fetch(`/api/teachers/${id}`, { method: 'DELETE' })
    load()
  }

  if (status === 'loading') return null
  if (status === 'authenticated' && session.user.role !== 'admin') {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: COLORS.muted }}>Admin access required.</p>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link href="/teacher" style={s.headerLink}>← Somerset</Link>
        <div style={s.headerTitle}>Teacher accounts</div>
      </header>

      <div style={s.wrap}>
        <form onSubmit={createTeacher} style={s.form}>
          <input style={s.input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input style={s.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={s.input} type="password" placeholder="Password (min. 8 chars)" value={password} onChange={e => setPassword(e.target.value)} />
          <select style={s.input} value={role} onChange={e => setRole(e.target.value as 'teacher' | 'admin')}>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" style={s.addBtn}>+ Add teacher</button>
        </form>
        {error && <p style={{ color: COLORS.danger, fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {loading ? <p style={s.muted}>Loading…</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {teachers.map(t => (
              <div key={t.id} style={s.card}>
                <div>
                  <div style={s.cardTitle}>{t.name} {t.role === 'admin' && <span style={s.adminTag}>Admin</span>}</div>
                  <div style={s.cardSub}>{t.email} · {t.group_count} group{t.group_count === 1 ? '' : 's'}</div>
                </div>
                <button onClick={() => removeTeacher(t.id)} style={s.removeBtn}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: COLORS.paper, fontFamily: FONT.sans },
  header: { background: COLORS.racing, color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 },
  headerLink: { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  headerTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 19 },
  wrap: { maxWidth: 560, margin: '0 auto', padding: '24px 16px 60px' },
  form: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  input: {
    borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 12, padding: '10px 12px',
    fontSize: 13.5, fontFamily: 'inherit', outline: 'none', flex: '1 1 160px', background: '#fff',
  },
  addBtn: { background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill, padding: '0 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green },
  muted: { fontSize: 13, color: COLORS.muted },
  card: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    background: '#fff', borderRadius: RADIUS.card, padding: '14px 18px', boxShadow: SHADOW.inkSoft,
    border: `1px solid ${COLORS.line}`,
  },
  cardTitle: { fontSize: 14.5, fontWeight: 700, color: COLORS.ink, display: 'flex', alignItems: 'center', gap: 8 },
  cardSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  adminTag: { fontSize: 10, fontWeight: 700, color: COLORS.racing, background: COLORS.paper2, padding: '2px 8px', borderRadius: RADIUS.pill, textTransform: 'uppercase', letterSpacing: '0.05em' },
  removeBtn: { background: 'none', border: 'none', color: COLORS.danger, fontSize: 13, cursor: 'pointer', padding: '2px 6px' },
}
