'use client'

// Laptop side of the scan → correct workflow. Everything captured from the phone
// via /scan and not yet reviewed shows up here, oldest first.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PortalShell from '@/components/portal/PortalShell'
import { PORTAL } from '@/lib/portalTheme'

interface PendingEntry {
  id: string
  student_id: string
  student_name: string
  group_name: string | null
  type: string
  title: string
  date: string
  image_url: string
}

const TYPE_LABELS: Record<string, string> = {
  exam: 'Exam', essay: 'Essay', class_exercise: 'Class exercise', homework: 'Homework', speaking: 'Speaking',
}

export default function CorrectQueue() {
  const [entries, setEntries] = useState<PendingEntry[] | null>(null)

  useEffect(() => {
    fetch('/api/work-entries/pending').then(r => r.json()).then(setEntries)
  }, [])

  return (
    <PortalShell>
      <div style={s.wrap}>
        <div style={s.pageTitle}>To correct</div>
        <p style={s.sub}>
          {entries === null ? 'Loading…' : entries.length === 0 ? 'Nothing waiting — all caught up.' : `${entries.length} scan${entries.length === 1 ? '' : 's'} waiting for review.`}
        </p>

        {entries && entries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.map(e => (
              <Link key={e.id} href={`/correct-queue/${e.id}?studentId=${e.student_id}`} style={s.row}>
                <img src={e.image_url} alt="" style={s.thumb} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.rowTitle}>{e.student_name}</div>
                  <div style={s.rowSub}>
                    {[e.group_name, TYPE_LABELS[e.type] || e.type, e.title].filter(Boolean).join(' · ')} · {e.date}
                  </div>
                </div>
                <span style={s.action}>Correct →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
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
  action: { color: PORTAL.green, fontWeight: 700, fontSize: 14 },
}
