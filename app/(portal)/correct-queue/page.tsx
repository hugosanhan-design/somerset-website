'use client'

// Laptop side of the scan → correct workflow. Everything captured from the phone
// via /scan and not yet reviewed shows up here, oldest first.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PORTAL } from '@/lib/portalTheme'
import { parseImageUrls } from '@/lib/workImages'

interface PendingEntry {
  id: string
  student_id: string
  student_name: string
  group_name: string | null
  type: string
  title: string
  date: string
  image_url: string
  image_urls?: string
  created_at?: string
}

const TYPE_LABELS: Record<string, string> = {
  exam: 'Exam', essay: 'Essay', class_exercise: 'Class exercise', homework: 'Homework', speaking: 'Speaking',
}

export default function CorrectQueue() {
  const [entries, setEntries] = useState<PendingEntry[] | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [merging, setMerging] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  function load() { fetch('/api/work-entries/pending').then(r => r.json()).then(setEntries) }
  useEffect(() => { load() }, [])

  // Scans of one student that were saved as separate entries can be joined into one
  // multi-page document. Only same-student scans can be merged (the API enforces it too).
  const pickedEntries = (entries || []).filter(e => picked.includes(e.id))
  const sameStudent = pickedEntries.length > 1 && pickedEntries.every(e => e.student_id === pickedEntries[0].student_id)

  async function merge() {
    setMerging(true); setMsg(null)
    const res = await fetch('/api/work-entries/merge', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryIds: picked }),
    })
    setMerging(false)
    if (!res.ok) { setMsg((await res.json().catch(() => ({}))).error || `Could not merge (error ${res.status})`); return }
    setPicked([]); load()
  }

  return (
      <div style={s.wrap}>
        <div style={s.pageTitle}>To correct</div>
        <p style={s.sub}>
          {entries === null ? 'Loading…' : entries.length === 0 ? 'Nothing waiting — all caught up.' : `${entries.length} scan${entries.length === 1 ? '' : 's'} waiting for review.`}
        </p>

        {picked.length > 0 && (
          <div style={s.mergeBar}>
            <span>{picked.length} selected</span>
            <button onClick={merge} disabled={!sameStudent || merging} style={{ ...s.mergeBtn, opacity: sameStudent && !merging ? 1 : 0.5 }}>
              {merging ? 'Merging…' : 'Merge into one document'}
            </button>
            <button onClick={() => setPicked([])} style={s.clearBtn}>Clear</button>
            {!sameStudent && picked.length > 1 && <span style={{ color: '#B23A2C', fontSize: 12 }}>Pick scans from the same student.</span>}
          </div>
        )}
        {msg && <p style={{ color: '#B23A2C', fontSize: 13, marginBottom: 12 }}>{msg}</p>}

        {entries && entries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.map(e => {
              const pages = parseImageUrls(e)
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    aria-label={`Select ${e.student_name}'s scan`}
                    checked={picked.includes(e.id)}
                    onChange={() => setPicked(p => (p.includes(e.id) ? p.filter(x => x !== e.id) : [...p, e.id]))}
                    style={{ width: 20, height: 20, flexShrink: 0 }}
                  />
                  <Link href={`/correct-queue/${e.id}?studentId=${e.student_id}`} style={{ ...s.row, flex: 1, minWidth: 0 }}>
                    <img src={pages[0] || e.image_url} alt="" style={s.thumb} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.rowTitle}>{e.student_name}</div>
                      <div style={s.rowSub}>
                        {[e.group_name, TYPE_LABELS[e.type] || e.type, e.title].filter(Boolean).join(' · ')} · {e.date}
                        {pages.length > 1 ? ` · ${pages.length} pages` : ''}
                      </div>
                    </div>
                    <span style={s.action}>Correct →</span>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '28px 28px 60px' },
  pageTitle: { fontSize: 22, fontWeight: 700, color: PORTAL.ink, marginBottom: 4 },
  sub: { color: PORTAL.muted, fontSize: 14, marginBottom: 22 },
  row: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
    border: `2px solid ${PORTAL.line}`, borderRadius: 14, textDecoration: 'none', color: 'inherit', background: PORTAL.paper,
  },
  thumb: { width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: `1px solid ${PORTAL.line}`, flexShrink: 0 },
  rowTitle: { fontWeight: 700, fontSize: 15, color: PORTAL.ink },
  rowSub: { fontSize: 13, color: PORTAL.muted },
  mergeBar: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 14px', marginBottom: 14, border: `2px solid ${PORTAL.green}`, borderRadius: 12, fontSize: 14, color: PORTAL.ink },
  mergeBtn: { padding: '8px 16px', borderRadius: 999, border: 'none', background: PORTAL.green, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  clearBtn: { background: 'none', border: 'none', color: PORTAL.muted, textDecoration: 'underline', cursor: 'pointer', fontSize: 13 },
  action: { color: PORTAL.green, fontWeight: 700, fontSize: 14 },
}
