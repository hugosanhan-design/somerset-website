'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'

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
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, Liberation Sans, sans-serif', backgroundColor: '#f9fafb' }}>

      {/* Header */}
      <header style={{ backgroundColor: '#6BAE2E', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SomersetLogo variant="white" />
        <Link href="/teacher" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textDecoration: 'none' }}>← Back</Link>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Student Progress Tracker</h1>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '4px 0 0' }}>{students.length} student{students.length !== 1 ? 's' : ''} registered</p>
          </div>
          <button onClick={() => setShowNew(true)} style={btnGreen}>+ New Student</button>
        </div>

        {/* Search */}
        <input
          placeholder="Search by name or group…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, marginBottom: 20, maxWidth: 340 }}
        />

        {/* New student form */}
        {showNew && (
          <div style={{ backgroundColor: '#fff', border: '1.5px solid #6BAE2E', borderRadius: 10, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginTop: 0, marginBottom: 16 }}>New Student</h2>
            <form onSubmit={createStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full name *</label>
                <input
                  required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle} placeholder="e.g. María García"
                />
              </div>
              <div>
                <label style={labelStyle}>Group</label>
                <select value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))} style={inputStyle}>
                  <option value="">— select —</option>
                  {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Level</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} style={inputStyle}>
                  <option value="">— select —</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Enrolled</label>
                <input type="date" value={form.enrolled_at} onChange={e => setForm(f => ({ ...f, enrolled_at: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={btnGreen}>{saving ? 'Saving…' : 'Create student'}</button>
                <button type="button" onClick={() => setShowNew(false)} style={btnGhost}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Student list */}
        {loading ? (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <p style={{ fontSize: 15 }}>{search ? 'No students match your search.' : 'No students yet. Add your first one above.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(s => (
              <Link key={s.id} href={`/students/${s.id}`} style={{ textDecoration: 'none' }}>
                <div style={studentCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                    <div style={avatarStyle}>{s.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{s.name}</div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                        {[s.group_name, s.level].filter(Boolean).join(' · ')}
                        {s.enrolled_at ? ` · enrolled ${s.enrolled_at}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
                    {s.avg_score != null && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(s.avg_score) }}>{s.avg_score}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>avg score</div>
                      </div>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#374151' }}>{s.entry_count}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>pieces</div>
                    </div>
                    <span style={{ color: '#6BAE2E', fontSize: 18 }}>›</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 80) return '#6BAE2E'
  if (score >= 65) return '#f59e0b'
  return '#ef4444'
}

const btnGreen: React.CSSProperties = {
  padding: '10px 20px', backgroundColor: '#6BAE2E', color: '#fff',
  border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'Arial, Liberation Sans, sans-serif',
}
const btnGhost: React.CSSProperties = {
  padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#374151',
  border: 'none', borderRadius: 7, fontSize: 14, cursor: 'pointer',
  fontFamily: 'Arial, Liberation Sans, sans-serif',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db',
  borderRadius: 7, fontSize: 14, fontFamily: 'Arial, Liberation Sans, sans-serif',
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5,
}
const studentCard: React.CSSProperties = {
  backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10,
  padding: '16px 20px', display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.15s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}
const avatarStyle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%', backgroundColor: '#e8f5d6',
  color: '#6BAE2E', fontSize: 18, fontWeight: 700, display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
