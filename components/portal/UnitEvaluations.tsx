'use client'
import { useEffect, useState } from 'react'

type Row = { id: string; unit: string; part: string; score: number; max: number; detail: string; position: number }

// Per-unit evaluation card. Rows are stored as "Part · Sub-part". Each sub-part is shown on its
// own, grouped under its exam part. A part subtotal is shown (e.g. Grammar 14/23); there is no
// grand total and no average across parts.
export default function UnitEvaluations({ studentId, card, sectionTitle }: {
  studentId: string
  card: React.CSSProperties
  sectionTitle: React.CSSProperties
}) {
  const [rows, setRows] = useState<Row[]>([])
  useEffect(() => {
    fetch(`/api/students/${studentId}/unit-evaluations`)
      .then(r => (r.ok ? r.json() : []))
      .then(d => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
  }, [studentId])
  if (rows.length === 0) return null
  const units = Array.from(new Set(rows.map(r => r.unit)))
  const colour = (p: number) => (p >= 70 ? '#6BAE2E' : p >= 50 ? '#f59e0b' : '#dc2626')
  const split = (p: string) => {
    const i = p.indexOf(' · ')
    return i < 0 ? { head: p, sub: '' } : { head: p.slice(0, i), sub: p.slice(i + 3) }
  }
  return (
    <div style={card}>
      <h2 style={sectionTitle}>Unit evaluation</h2>
      {units.map(u => {
        const urows = rows.filter(r => r.unit === u).sort((a, b) => a.position - b.position)
        const heads = Array.from(new Set(urows.map(r => split(r.part).head)))
        return (
          <div key={u} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{u}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {heads.map(h => {
                const items = urows.filter(r => split(r.part).head === h)
                const s = items.reduce((a, r) => a + r.score, 0)
                const m = items.reduce((a, r) => a + r.max, 0)
                const pct = m ? Math.round((100 * s) / m) : 0
                return (
                  <div key={h}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#111827' }}>
                      <span>{h}</span>
                      <span style={{ color: colour(pct) }}>{s}/{m} · {pct}%</span>
                    </div>
                    {items.map(r => {
                      const p = r.max ? Math.round((100 * r.score) / r.max) : 0
                      return (
                        <div key={r.id} style={{ marginTop: 6, paddingLeft: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#374151' }}>{split(r.part).sub || r.part}</span>
                            <span style={{ color: colour(p), fontWeight: 600 }}>{r.score}/{r.max}</span>
                          </div>
                          <div style={{ height: 5, background: '#e5e7eb', borderRadius: 3, marginTop: 2 }}>
                            <div style={{ width: `${p}%`, height: '100%', background: colour(p), borderRadius: 3 }} />
                          </div>
                          {r.detail && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{r.detail}</div>}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
