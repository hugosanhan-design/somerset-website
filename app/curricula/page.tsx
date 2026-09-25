'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { COLORS, FONT, RADIUS, SHADOW } from '@/lib/theme'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Mixed']

interface Unit { id: string; title: string; grammar_focus: string; vocab_focus: string; notes: string; order_index: number }
interface Curriculum { id: string; name: string; level: string; unit_count: number }

export default function CurriculaPage() {
  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [level, setLevel] = useState('B2')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [unitsLoading, setUnitsLoading] = useState(false)
  const [unitTitle, setUnitTitle] = useState('')
  const [unitGrammar, setUnitGrammar] = useState('')
  const [unitVocab, setUnitVocab] = useState('')

  useEffect(() => { loadCurricula() }, [])

  async function loadCurricula() {
    setLoading(true)
    const res = await fetch('/api/curricula')
    setCurricula(await res.json())
    setLoading(false)
  }

  async function createCurriculum(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await fetch('/api/curricula', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, level }),
    })
    setName('')
    loadCurricula()
  }

  async function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    setUnitsLoading(true)
    const res = await fetch(`/api/curricula/${id}`)
    const data = await res.json()
    setUnits(data.units || [])
    setUnitsLoading(false)
  }

  async function addUnit(e: React.FormEvent) {
    e.preventDefault()
    if (!expanded || !unitTitle.trim()) return
    await fetch(`/api/curricula/${expanded}/units`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: unitTitle, grammar_focus: unitGrammar, vocab_focus: unitVocab }),
    })
    setUnitTitle(''); setUnitGrammar(''); setUnitVocab('')
    const res = await fetch(`/api/curricula/${expanded}`)
    setUnits((await res.json()).units || [])
    loadCurricula()
  }

  async function deleteUnit(unitId: string) {
    if (!expanded) return
    await fetch(`/api/curricula/${expanded}/units/${unitId}`, { method: 'DELETE' })
    setUnits(units.filter(u => u.id !== unitId))
    loadCurricula()
  }

  async function moveUnit(unit: Unit, dir: -1 | 1) {
    if (!expanded) return
    const sorted = [...units].sort((a, b) => a.order_index - b.order_index)
    const idx = sorted.findIndex(u => u.id === unit.id)
    const swapWith = sorted[idx + dir]
    if (!swapWith) return
    await Promise.all([
      fetch(`/api/curricula/${expanded}/units/${unit.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_index: swapWith.order_index }),
      }),
      fetch(`/api/curricula/${expanded}/units/${swapWith.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_index: unit.order_index }),
      }),
    ])
    const res = await fetch(`/api/curricula/${expanded}`)
    setUnits((await res.json()).units || [])
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link href="/teacher" style={s.headerLink}>← Somerset</Link>
        <div style={s.headerTitle}>Curricula</div>
      </header>

      <div style={s.wrap}>
        <form onSubmit={createCurriculum} style={s.form}>
          <input style={{ ...s.input, flex: 2 }} placeholder="Curriculum name — e.g. Cambridge B2 First Coursebook"
            value={name} onChange={e => setName(e.target.value)} />
          <select style={{ ...s.input, flex: 1 }} value={level} onChange={e => setLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <button type="submit" style={s.addBtn}>+ Add</button>
        </form>

        {loading ? <p style={s.muted}>Loading…</p> : curricula.length === 0 ? (
          <p style={s.muted}>No curricula yet. Add one above, then add its units.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {curricula.map(c => (
              <div key={c.id} style={s.card}>
                <button onClick={() => toggleExpand(c.id)} style={s.cardHeaderBtn}>
                  <div>
                    <div style={s.cardTitle}>{c.name}</div>
                    <div style={s.cardSub}>{c.level} · {c.unit_count} unit{c.unit_count === 1 ? '' : 's'}</div>
                  </div>
                  <span style={s.chevron}>{expanded === c.id ? '▲' : '▼'}</span>
                </button>

                {expanded === c.id && (
                  <div style={s.unitsPanel}>
                    {unitsLoading ? <p style={s.muted}>Loading units…</p> : units.length === 0 ? (
                      <p style={s.muted}>No units yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                        {[...units].sort((a, b) => a.order_index - b.order_index).map((u, i) => (
                          <div key={u.id} style={s.unitRow}>
                            <div style={s.unitMove}>
                              <button onClick={() => moveUnit(u, -1)} disabled={i === 0} style={s.moveBtn}>↑</button>
                              <button onClick={() => moveUnit(u, 1)} disabled={i === units.length - 1} style={s.moveBtn}>↓</button>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={s.unitTitle}>Unit {i + 1} · {u.title}</div>
                              {(u.grammar_focus || u.vocab_focus) && (
                                <div style={s.unitMeta}>
                                  {u.grammar_focus && <span>📐 {u.grammar_focus}</span>}
                                  {u.vocab_focus && <span>📖 {u.vocab_focus}</span>}
                                </div>
                              )}
                            </div>
                            <button onClick={() => deleteUnit(u.id)} style={s.deleteBtn}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={addUnit} style={s.unitForm}>
                      <input style={s.input} placeholder="Unit title — e.g. The Environment"
                        value={unitTitle} onChange={e => setUnitTitle(e.target.value)} />
                      <input style={s.input} placeholder="Grammar focus (optional)"
                        value={unitGrammar} onChange={e => setUnitGrammar(e.target.value)} />
                      <input style={s.input} placeholder="Vocab focus (optional)"
                        value={unitVocab} onChange={e => setUnitVocab(e.target.value)} />
                      <button type="submit" style={s.addUnitBtn}>+ Add unit</button>
                    </form>
                  </div>
                )}
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
  wrap: { maxWidth: 640, margin: '0 auto', padding: '24px 16px 60px' },
  form: { display: 'flex', gap: 8, marginBottom: 22 },
  input: {
    borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 12, padding: '10px 12px',
    fontSize: 13.5, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff',
  },
  addBtn: { background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill, padding: '0 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green },
  muted: { fontSize: 13, color: COLORS.muted },
  card: { background: '#fff', borderRadius: RADIUS.card, boxShadow: SHADOW.inkSoft, overflow: 'hidden', border: `1px solid ${COLORS.line}` },
  cardHeaderBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
  },
  cardTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 16, color: COLORS.ink },
  cardSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  chevron: { fontSize: 11, color: COLORS.brass },
  unitsPanel: { padding: '0 20px 18px', borderTop: `1px solid ${COLORS.paper2}` },
  unitRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${COLORS.paper2}` },
  unitMove: { display: 'flex', flexDirection: 'column', gap: 2 },
  moveBtn: { width: 22, height: 18, fontSize: 10, border: `1px solid ${COLORS.line}`, background: COLORS.paper2, borderRadius: 4, cursor: 'pointer' },
  unitTitle: { fontSize: 13.5, fontWeight: 600, color: COLORS.ink },
  unitMeta: { fontSize: 11.5, color: COLORS.muted, display: 'flex', gap: 10, marginTop: 2 },
  deleteBtn: { background: 'none', border: 'none', color: COLORS.danger, fontSize: 13, cursor: 'pointer', padding: '2px 6px' },
  unitForm: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 },
  addUnitBtn: { background: COLORS.paper2, color: COLORS.racing, border: 'none', borderRadius: RADIUS.pill, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}
