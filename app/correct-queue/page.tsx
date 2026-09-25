'use client'

// Laptop side of the scan → correct workflow. Everything captured from the phone
// via /scan and not yet reviewed shows up here, oldest first.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'

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
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff' }}>
      <header style={{ background: '#1E4227', borderBottom: '3px solid #6BAE2E', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SomersetLogo variant="white" />
        <Link href="/teacher" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textDecoration: 'none' }}>← Teacher&apos;s Corner</Link>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 60px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 24, color: '#222', marginBottom: 4 }}>To correct</h1>
        <p style={{ color: '#777', fontSize: 14, marginBottom: 24 }}>
          {entries === null ? 'Loading…' : entries.length === 0 ? 'Nothing waiting — all caught up.' : `${entries.length} scan${entries.length === 1 ? '' : 's'} waiting for review.`}
        </p>

        {entries && entries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.map(e => (
              <Link
                key={e.id}
                href={`/correct-queue/${e.id}?studentId=${e.student_id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  border: '1.5px solid #DDDDDD', borderRadius: 10, textDecoration: 'none', color: 'inherit',
                }}
              >
                <img src={e.image_url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #DDDDDD', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#222' }}>{e.student_name}</div>
                  <div style={{ fontSize: 13, color: '#777' }}>
                    {[e.group_name, TYPE_LABELS[e.type] || e.type, e.title].filter(Boolean).join(' · ')} · {e.date}
                  </div>
                </div>
                <span style={{ color: '#6BAE2E', fontWeight: 700, fontSize: 14 }}>Correct →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
