'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PORTAL } from '@/lib/portalTheme'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Mixed']

interface Curriculum { id: string; name: string; level: string }
interface Group {
  id: string; name: string; level: string; curriculum_id: string | null
  curriculum_name: string | null; current_unit_title: string | null; current_unit_order: number | null
  total_units: number; student_count: number
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [level, setLevel] = useState('B2')
  const [curriculumId, setCurriculumId] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [gRes, cRes] = await Promise.all([fetch('/api/groups'), fetch('/api/curricula')])
    setGroups(await gRes.json())
    setCurricula(await cRes.json())
    setLoading(false)
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await fetch('/api/groups', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, level, curriculum_id: curriculumId || null }),
    })
    setName(''); setCurriculumId(''); setShowForm(false)
    load()
  }

  return (
      <div style={s.wrap}>
        <div style={s.pageHead}>
          <div style={s.pageTitle}>Groups</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/curricula" style={s.secondaryBtn}>Manage curricula</Link>
            <button onClick={() => setShowForm(v => !v)} style={s.primaryBtn}>
              {showForm ? 'Cancel' : '+ New group'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={createGroup} style={s.form}>
            <input style={{ ...s.input, flex: 2 }} placeholder="Group name — e.g. Tuesday Adults B2"
              value={name} onChange={e => setName(e.target.value)} autoFocus />
            <select style={{ ...s.input, flex: 1 }} value={level} onChange={e => setLevel(e.target.value)}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <select style={{ ...s.input, flex: 1.6 }} value={curriculumId} onChange={e => setCurriculumId(e.target.value)}>
              <option value="">No curriculum</option>
              {curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" style={s.addBtn}>Add</button>
          </form>
        )}

        {loading ? <p style={s.muted}>Loading…</p> : groups.length === 0 ? (
          <p style={s.muted}>No groups yet — use "+ New group" above.</p>
        ) : (
          <div style={s.grid}>
            {groups.map(g => (
              <Link key={g.id} href={`/groups/${g.id}`} style={s.tile}>
                <div style={s.tileLevel}>{g.level}</div>
                <div style={s.tileTitle}>{g.name}</div>
                <div style={s.tileSub}>
                  {g.student_count} student{g.student_count === 1 ? '' : 's'}
                  {g.curriculum_name ? ` · ${g.curriculum_name}` : ' · no curriculum'}
                </div>
                {g.curriculum_name && (
                  <div style={s.progressRow}>
                    <div style={s.progressTrack}>
                      <div style={{
                        ...s.progressFill,
                        width: g.total_units > 0 ? `${Math.round(((g.current_unit_order ?? 0) + 1) / g.total_units * 100)}%` : '0%',
                      }} />
                    </div>
                    <span style={s.progressLabel}>
                      {g.current_unit_title ? `Unit ${(g.current_unit_order ?? 0) + 1} of ${g.total_units}` : `0 of ${g.total_units} units`}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 1000, margin: '0 auto', padding: '28px 28px 60px' },
  pageHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: PORTAL.ink },
  secondaryBtn: {
    display: 'flex', alignItems: 'center', background: PORTAL.paper, color: PORTAL.ink,
    border: `2px solid ${PORTAL.line}`, borderRadius: 999, padding: '9px 18px', fontSize: 13.5,
    fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
  },
  primaryBtn: {
    background: PORTAL.green, color: '#fff', border: 'none', borderRadius: 999,
    padding: '9px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
  },
  form: {
    display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap', background: PORTAL.panel,
    border: `2px solid ${PORTAL.line}`, borderRadius: 14, padding: 14,
  },
  input: {
    border: `2px solid ${PORTAL.line}`, borderRadius: 10, padding: '10px 12px',
    fontSize: 13.5, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff', color: PORTAL.ink,
  },
  addBtn: {
    background: PORTAL.green, color: '#fff', border: 'none', borderRadius: 999,
    padding: '0 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
  },
  muted: { fontSize: 13, color: PORTAL.muted },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14,
  },
  tile: {
    display: 'flex', flexDirection: 'column', gap: 4, background: PORTAL.paper,
    border: `2px solid ${PORTAL.line}`, borderRadius: 14, padding: '18px 18px 16px',
    textDecoration: 'none', color: 'inherit', minHeight: 128,
  },
  tileLevel: {
    alignSelf: 'flex-start', background: PORTAL.panel, color: PORTAL.greenDeep, fontSize: 11,
    fontWeight: 700, borderRadius: 999, padding: '2px 10px', marginBottom: 6,
  },
  tileTitle: { fontSize: 16, fontWeight: 700, color: PORTAL.ink, lineHeight: 1.25 },
  tileSub: { fontSize: 12, color: PORTAL.muted },
  progressRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 10 },
  progressTrack: { width: 50, height: 5, background: PORTAL.line, borderRadius: 999, overflow: 'hidden', flexShrink: 0 },
  progressFill: { height: '100%', background: PORTAL.green },
  progressLabel: { fontSize: 11, color: PORTAL.muted },
}
