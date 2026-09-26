'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PORTAL } from '@/lib/portalTheme'

interface Student {
  id: string
  name: string
  group_name: string
  level: string
  enrolled_at: string
  entry_count: number
  last_activity: string | null
  avg_score: number | null
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const GROUPS = ['Monday Adults', 'Tuesday Adults', 'Wednesday Adults', 'Friday Teenagers', 'Children Mon/Wed', 'Other']

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', group_name: '', level: '', enrolled_at: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadStudents() }, [])

  async function loadStudents() {
    setLoading(true)
    const res = await fetch('/api/students')
    const data = await res.json()
    setStudents(data)
    setLoading(false)
  }

  async function createStudent(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ name: '', group_name: '', level: '', enrolled_at: '' })
    setShowNew(false)
    setSaving(false)
    loadStudents()
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.group_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.wrap}>
      <div style={s.pageHead}>
        <div>
          <div style={s.pageTitle}>Students</div>
          <div style={s.pageSub}>{students.length} student{students.length !== 1 ? 's' : ''} registered</div>
        </div>
        <button onClick={() => setShowNew(v => !v)} style={s.primaryBtn}>
          {showNew ? 'Cancel' : '+ New student'}
        </button>
      </div>

      <input
        placeholder="Search by name or group…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...s.input, marginBottom: 20, maxWidth: 340 }}
      />

      {showNew && (
        <form onSubmit={createStudent} style={s.form}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={s.label}>Full name *</label>
            <input
              required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={s.input} placeholder="e.g. María García"
            />
          </div>
          <div>
            <label style={s.label}>Group</label>
            <select value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} style={s.input}>
              <option value="">— select —</option>
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Level</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} style={s.input}>
              <option value="">— select —</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Enrolled</label>
            <input type="date" value={form.enrolled_at} onChange={e => setForm(f => ({ ...f, enrolled_at: e.target.value }))} style={s.input} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving} style={s.primaryBtn}>{saving ? 'Saving…' : 'Create student'}</button>
            <button type="button" onClick={() => setShowNew(false)} style={s.secondaryBtn}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={s.muted}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: PORTAL.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
          <p style={{ fontSize: 15 }}>{search ? 'No students match your search.' : 'No students yet. Add your first one above.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(st => (
            <Link key={st.id} href={`/students/${st.id}`} style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                <div style={s.avatar}>{st.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: PORTAL.ink }}>{st.name}</div>
                  <div style={{ fontSize: 13, color: PORTAL.muted, marginTop: 2 }}>
                    {[st.group_name, st.level].filter(Boolean).join(' · ')}
                    {st.enrolled_at ? ` · enrolled ${st.enrolled_at}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
                {st.avg_score != null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(st.avg_score) }}>{st.avg_score}</div>
                    <div style={{ fontSize: 11, color: PORTAL.muted }}>avg score</div>
                  </div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: PORTAL.ink }}>{st.entry_count}</div>
                  <div style={{ fontSize: 11, color: PORTAL.muted }}>pieces</div>
                </div>
                <span style={{ color: PORTAL.green, fontSize: 18 }}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 80) return PORTAL.green
  if (score >= 65) return PORTAL.amber
  return PORTAL.red
}

const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 900, margin: '0 auto', padding: '28px 28px 60px' },
  pageHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: PORTAL.ink },
  pageSub: { color: PORTAL.muted, fontSize: 14, marginTop: 4 },
  primaryBtn: {
    background: PORTAL.green, color: '#fff', border: 'none', borderRadius: 999,
    padding: '9px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
  },
  secondaryBtn: {
    background: PORTAL.panel, color: PORTAL.ink, border: 'none', borderRadius: 999,
    padding: '9px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  form: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: PORTAL.panel,
    border: `2px solid ${PORTAL.line}`, borderRadius: 14, padding: 20, marginBottom: 24,
  },
  input: {
    width: '100%', border: `2px solid ${PORTAL.line}`, borderRadius: 10, padding: '9px 12px',
    fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff', color: PORTAL.ink,
    boxSizing: 'border-box',
  },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: PORTAL.ink, marginBottom: 5 },
  muted: { fontSize: 13, color: PORTAL.muted },
  card: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none',
    background: PORTAL.paper, border: `2px solid ${PORTAL.line}`, borderRadius: 14,
    padding: '16px 20px', color: 'inherit', cursor: 'pointer',
  },
  avatar: {
    width: 40, height: 40, borderRadius: '50%', background: PORTAL.panel,
    color: PORTAL.greenDeep, fontSize: 18, fontWeight: 700, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
}
