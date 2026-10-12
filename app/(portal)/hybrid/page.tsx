'use client'

import { useEffect, useState } from 'react'
import { ACTIVITIES } from '@/lib/courses/mondayYoungAdults'

type Row = {
  student: string
  updatedAt: string
  days: string[]
  lessons: Record<string, { score: number; at: number }>
  writing: Record<string, { text: string; at: number }>
  mistakes?: Record<string, { n: number; picks: string[]; at: number; fixes: number }>
}

const ROSTER = ['miriam', 'alejandra', 'david']

// item id ('activity.exercise.item') -> what was asked and the right answer
const ITEMS = new Map<string, { lesson: string; ex: string; prompt: string; right: string }>()
for (const a of ACTIVITIES) for (const e of a.exercises) for (const it of e.items) {
  const prompt = it.kind === 'gap' ? `${it.before} ____ ${it.after ?? ''}`.trim() : it.q
  const right = it.kind === 'gap' ? it.answers[0] : it.kind === 'choice' ? it.options[it.answer] : (e.options?.[it.answer] ?? '')
  ITEMS.set(`${a.id}.${e.id}.${it.id}`.slice(0, 60), { lesson: a.title, ex: e.id, prompt, right })
}

export default function HybridResultsPage() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [err, setErr] = useState('')
  const [ficha, setFicha] = useState<Record<string, { ok: boolean; msg: string; id?: string }>>({})

  async function toFicha(n: string) {
    setFicha(f => ({ ...f, [n]: { ok: true, msg: 'Saving…' } }))
    try {
      const r = await fetch('/api/hybrid/to-ficha', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student: n }) })
      const d = await r.json()
      setFicha(f => ({ ...f, [n]: r.ok ? { ok: true, msg: `Ficha ${d.action} (${d.mistakes} mistakes).`, id: d.studentId } : { ok: false, msg: d.error || 'Error' } }))
    } catch { setFicha(f => ({ ...f, [n]: { ok: false, msg: 'Could not reach the server.' } })) }
  }

  useEffect(() => {
    fetch('/api/hybrid/results')
      .then(async r => { if (!r.ok) throw new Error((await r.json()).error || 'Error'); return r.json() })
      .then(d => setRows(d.students))
      .catch(e => setErr(String(e.message || e)))
  }, [])

  const byName = new Map((rows ?? []).map(r => [r.student, r]))
  const names = Array.from(new Set([...ROSTER, ...(rows ?? []).map(r => r.student)]))
  const cols = ACTIVITIES.flatMap(a => a.exercises.map(e => ({ key: `${a.id}.${e.id}`, label: `${a.no}${e.id}` })))
  const frees = ACTIVITIES.flatMap(a => (a.free ?? []).map(f => ({ key: `${a.id}:${f.id}`, label: `${a.title} · ${f.title}` })))

  return (
    <div style={{ padding: 24, maxWidth: 1000, fontSize: 16 }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Hybrid course · Monday Young Adults</h1>
      <p style={{ color: '#555' }}>Digital week, 8 to 15 October. Score = first attempt at each exercise.</p>
      {err && <p style={{ color: '#c4412e' }}>{err}</p>}
      {!rows && !err && <p>Loading…</p>}
      {rows && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={th}>Student</th><th style={th}>Days</th>
                  {cols.map(c => <th key={c.key} style={th} title={c.key}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {names.map(n => {
                  const r = byName.get(n)
                  return (
                    <tr key={n}>
                      <td style={td}><b style={{ textTransform: 'capitalize' }}>{n}</b></td>
                      <td style={td}>{r ? r.days.length : 0}</td>
                      {cols.map(c => {
                        const s = r?.lessons[c.key]
                        return <td key={c.key} style={{ ...td, background: s ? (s.score >= 70 ? '#eef7e3' : '#fdecea') : undefined }}>{s ? `${s.score}%` : '·'}</td>
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <h2 style={{ fontSize: 20, marginTop: 28 }}>Mistakes</h2>
          <p style={{ color: '#555', marginTop: 0 }}>Every wrong answer, with what they chose. Fixed = two clean answers in Improve my mistakes.</p>
          {names.map(n => {
            const ms = Object.entries(byName.get(n)?.mistakes ?? {}).filter(([id]) => ITEMS.has(id)).sort((a, b) => b[1].n - a[1].n)
            return (
              <div key={n} style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, margin: '0 0 6px', textTransform: 'capitalize' }}>{n} · {ms.length} {ms.length === 1 ? 'mistake' : 'mistakes'}, {ms.filter(([, m]) => m.fixes >= 2).length} fixed
                  {byName.get(n) && <button onClick={() => toFicha(n)} style={{ marginLeft: 12, padding: '4px 10px', fontSize: 14, cursor: 'pointer', textTransform: 'none' }}>Save to ficha</button>}
                  {ficha[n] && <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 400, textTransform: 'none', color: ficha[n].ok ? '#3d6b17' : '#c4412e' }}>
                    {ficha[n].msg}{ficha[n].id && <> <a href={`/students/${ficha[n].id}`}>Open ficha</a></>}
                  </span>}
                </h3>
                {ms.length > 0 && (
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead><tr><th style={th}>Lesson</th><th style={th}>Question</th><th style={th}>Right answer</th><th style={th}>They chose</th><th style={th}>Times</th><th style={th}>Fixed</th></tr></thead>
                    <tbody>
                      {ms.map(([id, m]) => {
                        const it = ITEMS.get(id)!
                        return (
                          <tr key={id}>
                            <td style={td}>{it.lesson} · {it.ex}</td><td style={td}>{it.prompt}</td><td style={td}>{it.right}</td>
                            <td style={{ ...td, color: '#c4412e' }}>{m.picks.join(' / ')}</td><td style={td}>{m.n}</td>
                            <td style={{ ...td, background: m.fixes >= 2 ? '#eef7e3' : undefined }}>{m.fixes >= 2 ? 'yes' : `${m.fixes}/2`}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
          <h2 style={{ fontSize: 20, marginTop: 28 }}>Writing sent</h2>
          {frees.map(f => (
            <div key={f.key} style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, margin: '0 0 6px' }}>{f.label}</h3>
              {names.map(n => {
                const w = byName.get(n)?.writing[f.key]
                return (
                  <div key={n} style={{ marginBottom: 8, padding: '8px 10px', background: '#f5f5f3', borderRadius: 6 }}>
                    <b style={{ textTransform: 'capitalize' }}>{n}</b>{' '}
                    <small style={{ color: '#666' }}>{w ? new Date(w.at).toLocaleString('en-GB') : 'nothing yet'}</small>
                    {w && <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', fontSize: 16 }}>{w.text}</p>}
                  </div>
                )
              })}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
const th: React.CSSProperties = { border: '1px solid #ddd', padding: '6px 10px', background: '#6BAE2E', color: '#fff', textAlign: 'left', fontSize: 14 }
const td: React.CSSProperties = { border: '1px solid #ddd', padding: '6px 10px', fontSize: 14 }
