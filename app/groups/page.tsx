'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { COLORS, FONT, RADIUS, SHADOW, EASE } from '@/lib/theme'

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
    setName(''); setCurriculumId('')
    load()
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link href="/teacher" style={s.headerLink}>← Somerset</Link>
        <div style={s.headerTitle}>Groups</div>
        <Link href="/curricula" style={s.headerRightLink}>Manage curricula</Link>
      </header>

      <div style={s.wrap}>
        <form onSubmit={createGroup} style={s.form}>
          <input style={{ ...s.input, flex: 2 }} placeholder="Group name — e.g. Tuesday Adults B2"
            value={name} onChange={e => setName(e.target.value)} />
          <select style={{ ...s.input, flex: 1 }} value={level} onChange={e => setLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select style={{ ...s.input, flex: 1.6 }} value={curriculumId} onChange={e => setCurriculumId(e.target.value)}>
            <option value="">No curriculum</option>
            {curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" style={s.addBtn}>+ Add</button>
        </form>

        {loading ? <p style={s.muted}>Loading…</p> : groups.length === 0 ? (
          <p style={s.muted}>No groups yet. Add one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groups.map(g => (
              <Link key={g.id} href={`/groups/${g.id}`} style={s.card}>
                <div>
                  <div style={s.cardTitle}>{g.name}</div>
                  <div style={s.cardSub}>
                    {g.level} · {g.student_count} student{g.student_count === 1 ? '' : 's'}
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
                        {g.current_unit_title ? `Unit ${(g.current_unit_order ?? 0) + 1} of ${g.total_units} · ${g.current_unit_title}` : `0 of ${g.total_units} units started`}
                      </span>
                    </div>
                  )}
                </div>
                <span style={s.chevron}>›</span>
              </Link>
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
  headerTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 19, flex: 1 },
  headerRightLink: { color: '#fff', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.5)' },
  wrap: { maxWidth: 640, margin: '0 auto', padding: '24px 16px 60px' },
  form: { display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' },
  input: {
    borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 12, padding: '10px 12px',
    fontSize: 13.5, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff',
  },
  addBtn: { background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill, padding: '0 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green, transition: `all 0.22s ${EASE}` },
  muted: { fontSize: 13, color: COLORS.muted },
  card: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    background: '#fff', borderRadius: RADIUS.card, padding: '16px 20px', boxShadow: SHADOW.inkSoft,
    textDecoration: 'none', color: 'inherit', border: `1px solid ${COLORS.line}`, transition: `transform 0.18s ${EASE}, box-shadow 0.18s ${EASE}`,
  },
  cardTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 17, color: COLORS.ink },
  cardSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  progressRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 },
  progressTrack: { width: 60, height: 5, background: COLORS.paper2, borderRadius: RADIUS.pill, overflow: 'hidden', flexShrink: 0 },
  progressFill: { height: '100%', background: COLORS.green },
  progressLabel: { fontSize: 11.5, color: COLORS.muted },
  chevron: { fontSize: 18, color: COLORS.brass },
}
