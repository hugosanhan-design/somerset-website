'use client'

// The new home screen: a month calendar of real class days, computed from the
// migrated timetable + academic calendar (not hardcoded). Readiness per group per
// day is a manual toggle (click a chip to cycle ready/not ready) — see lib/db.ts's
// note on lesson_log for why this replaced the old local Portal's disk-scan.

import { useState, useEffect, useCallback } from 'react'
import PortalShell from '@/components/portal/PortalShell'

interface DayGroup {
  group_id: string
  group_name: string
  group_slug: string
  from_time: string
  to_time: string
  status: string
  note: string
}
interface Day { date: string; groups: DayGroup[] }

const STATUS_COLOR: Record<string, string> = {
  ready: '#6BAE2E',
  not_ready: '#DDDDDD',
}
const STATUS_LABEL: Record<string, string> = {
  ready: 'Ready',
  not_ready: 'Not ready',
}

function nextStatus(s: string) {
  return s === 'ready' ? 'not_ready' : 'ready'
}

export default function Dashboard() {
  const [ym, setYm] = useState(new Date().toISOString().slice(0, 7))
  const [days, setDays] = useState<Day[] | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setDays(null)
    fetch(`/api/calendar/month?ym=${ym}`)
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => setDays(data.days))
      .catch(() => setError('Could not load the calendar — has the academic year been set up yet?'))
  }, [ym])

  useEffect(() => { load() }, [load])

  async function toggle(groupId: string, date: string, current: string) {
    const status = nextStatus(current)
    await fetch('/api/calendar/day', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, date, status }),
    })
    load()
  }

  function shiftMonth(delta: number) {
    const [y, m] = ym.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setYm(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const byDate = new Map((days || []).map(d => [d.date, d]))
  const [y, m] = ym.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const firstWeekday = new Date(y, m - 1, 1).getDay() // 0=Sun
  const leadBlanks = (firstWeekday + 6) % 7 // make Monday the first column

  const cells: (string | null)[] = Array(leadBlanks).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${ym}-${String(d).padStart(2, '0')}`)
  }

  return (
    <PortalShell>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 28px 60px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 24, color: '#222', margin: 0 }}>
            {new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => shiftMonth(-1)} style={navBtn}>←</button>
            <button onClick={() => setYm(new Date().toISOString().slice(0, 7))} style={navBtn}>Today</button>
            <button onClick={() => shiftMonth(1)} style={navBtn}>→</button>
          </div>
        </div>

        {error && <p style={{ color: '#B23A2C', fontSize: 14 }}>{error}</p>}

        {days && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} style={{ fontSize: 11, fontWeight: 700, color: '#777', textTransform: 'uppercase', textAlign: 'center', paddingBottom: 4 }}>{d}</div>
            ))}
            {cells.map((date, i) => {
              if (!date) return <div key={i} />
              const day = byDate.get(date)
              const dayNum = Number(date.slice(-2))
              const isToday = date === new Date().toISOString().slice(0, 10)
              return (
                <div key={date} style={{
                  minHeight: 92, border: `1px solid ${isToday ? '#6BAE2E' : '#EEEEEE'}`,
                  borderWidth: isToday ? 2 : 1, borderRadius: 8, padding: 6, background: '#fff',
                }}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{dayNum}</div>
                  {day?.groups.map(g => (
                    <button
                      key={g.group_id}
                      onClick={() => toggle(g.group_id, date, g.status)}
                      title={`${g.from_time}–${g.to_time} · ${STATUS_LABEL[g.status]} · click to toggle`}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        fontSize: 10.5, padding: '3px 6px', marginBottom: 3, borderRadius: 5,
                        border: 'none', cursor: 'pointer',
                        background: g.status === 'ready' ? 'rgba(107,174,46,0.15)' : 'rgba(221,221,221,0.5)',
                        color: g.status === 'ready' ? '#3F6E17' : '#555',
                        borderLeft: `3px solid ${STATUS_COLOR[g.status]}`,
                      }}
                    >
                      {g.group_name}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PortalShell>
  )
}

const navBtn: React.CSSProperties = { padding: '6px 14px', borderRadius: 6, border: '1.5px solid #DDDDDD', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#222' }
