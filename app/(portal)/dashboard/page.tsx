'use client'

// The Portal's home screen — day / week / month views of real class days, styled to
// the "canonical teaching-deck" aesthetic (light green/white, Hugo's 25 Sep request —
// see lib/portalTheme.ts). Readiness per group per day is a manual toggle (click a
// class, then the button) — see lib/db.ts's note on lesson_log for why this replaced
// the old local Portal's disk-scan.
//
// Clicking a class opens a lesson panel with real synced lesson content for FCE I and
// PET I (unit/pages/plan/grammar/vocab/arcade/shelf labels — see migrate-lesson-content.mjs);
// other groups get an honest "not synced yet" message rather than a fake one.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { PORTAL, readinessFromStatus, READINESS_LABEL, READINESS_CHIP } from '@/lib/portalTheme'

interface DayGroup {
  group_id: string
  group_name: string
  group_slug: string
  group_level: string
  from_time: string
  to_time: string
  status: string
  note: string
}

type DaysMap = Record<string, DayGroup[]>

type View = 'day' | 'week' | 'month'

const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DOW_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
function ymOf(iso: string) {
  return iso.slice(0, 7)
}
function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
function monthAdd(ym: string, delta: number) {
  const [y, m] = ym.split('-').map(Number)
  const dt = new Date(y, m - 1 + delta, 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}
function startOfWeekMonday(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const jsDow = dt.getDay() // 0=Sun..6=Sat
  const back = (jsDow + 6) % 7 // days since Monday
  return addDays(iso, -back)
}
function fmtLong(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return { dow: DOW_LONG[dt.getDay()], long: `${d} ${MONTHS[m - 1]} ${y}` }
}

export default function Dashboard() {
  const [view, setView] = useState<View>('day')
  const [anchor, setAnchor] = useState(todayISO())
  const [daysMap, setDaysMap] = useState<DaysMap>({})
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<{ date: string; group: DayGroup } | null>(null)

  const loadMonths = useCallback((yms: string[]) => {
    Promise.all(
      yms.map(ym => fetch(`/api/calendar/month?ym=${ym}`).then(r => (r.ok ? r.json() : Promise.reject(r))))
    )
      .then(results => {
        setDaysMap(prev => {
          const next = { ...prev }
          for (const res of results) {
            for (const d of res.days as { date: string; groups: DayGroup[] }[]) next[d.date] = d.groups
          }
          return next
        })
        setError('')
      })
      .catch(() => setError('Could not load the calendar — has the academic year been set up yet?'))
  }, [])

  useEffect(() => {
    const ym = ymOf(anchor)
    loadMonths([monthAdd(ym, -1), ym, monthAdd(ym, 1)])
  }, [anchor, loadMonths])

  async function toggle(groupId: string, date: string, current: string) {
    const status = current === 'ready' ? 'not_ready' : 'ready'
    await fetch('/api/calendar/day', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, date, status }),
    })
    setDaysMap(prev => ({
      ...prev,
      [date]: (prev[date] || []).map(g => (g.group_id === groupId ? { ...g, status } : g)),
    }))
    setSelected(sel => (sel && sel.date === date && sel.group.group_id === groupId ? { ...sel, group: { ...sel.group, status } } : sel))
  }

  const weekDates = useMemo(() => {
    const start = startOfWeekMonday(anchor)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [anchor])

  return (
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '22px 20px 64px', fontFamily: PORTAL.font, color: PORTAL.ink }}>
        <ViewTabs view={view} setView={setView} />
        {error && <p style={{ color: PORTAL.red, fontSize: 14 }}>{error}</p>}

        {view === 'day' && (
          <DayView
            date={anchor}
            groups={daysMap[anchor] || []}
            onPrev={() => setAnchor(addDays(anchor, -1))}
            onNext={() => setAnchor(addDays(anchor, 1))}
            onToday={() => setAnchor(todayISO())}
            onSelect={g => setSelected({ date: anchor, group: g })}
          />
        )}

        {view === 'week' && (
          <WeekView
            dates={weekDates}
            daysMap={daysMap}
            onPrev={() => setAnchor(addDays(anchor, -7))}
            onNext={() => setAnchor(addDays(anchor, 7))}
            onToday={() => setAnchor(todayISO())}
            onSelect={(date, g) => setSelected({ date, group: g })}
          />
        )}

        {view === 'month' && (
          <MonthView
            ym={ymOf(anchor)}
            daysMap={daysMap}
            onPrev={() => setAnchor(monthAdd(ymOf(anchor), -1) + '-01')}
            onNext={() => setAnchor(monthAdd(ymOf(anchor), 1) + '-01')}
            onToday={() => setAnchor(todayISO())}
            onSelect={(date, g) => setSelected({ date, group: g })}
          />
        )}

        {selected && (
          <LessonPanel
            date={selected.date}
            group={selected.group}
            onClose={() => setSelected(null)}
            onToggle={() => toggle(selected.group.group_id, selected.date, selected.group.status)}
          />
        )}
      </div>
  )
}

// ---------------------------------------------------------------- chrome

function ViewTabs({ view, setView }: { view: View; setView: (v: View) => void }) {
  const tabs: { k: View; label: string }[] = [
    { k: 'day', label: 'Today' },
    { k: 'week', label: 'Week' },
    { k: 'month', label: 'Month' },
  ]
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {tabs.map(t => (
        <button
          key={t.k}
          onClick={() => setView(t.k)}
          style={{
            font: 'inherit', fontSize: 14, fontWeight: 700, padding: '9px 20px', borderRadius: 999,
            border: `2px solid ${view === t.k ? PORTAL.green : PORTAL.line}`,
            background: view === t.k ? PORTAL.green : PORTAL.paper,
            color: view === t.k ? '#fff' : PORTAL.ink,
            cursor: 'pointer',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function Btn({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        font: 'inherit', fontSize: 14, background: primary ? PORTAL.green : PORTAL.paper,
        color: primary ? '#fff' : PORTAL.ink, border: `2px solid ${primary ? PORTAL.green : PORTAL.line}`,
        borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontWeight: primary ? 700 : 600,
      }}
    >
      {children}
    </button>
  )
}

function Chip({ status }: { status: string }) {
  const r = readinessFromStatus(status)
  const c = READINESS_CHIP[r]
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '.02em', textTransform: 'uppercase',
      padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap', background: c.bg, color: c.fg,
    }}>
      {READINESS_LABEL[r]}
    </span>
  )
}

// ---------------------------------------------------------------- day view

function DayView({ date, groups, onPrev, onNext, onToday, onSelect }: {
  date: string; groups: DayGroup[]; onPrev: () => void; onNext: () => void; onToday: () => void
  onSelect: (g: DayGroup) => void
}) {
  const f = fmtLong(date)
  const isToday = date === todayISO()
  const sorted = [...groups].sort((a, b) => a.from_time.localeCompare(b.from_time))

  return (
    <div>
      <div style={dayBarStyle}>
        <h1 style={{ margin: 0, fontSize: 23, fontFamily: PORTAL.serif, fontWeight: 500, color: PORTAL.headingInk, flex: '1 1 auto', minWidth: 200 }}>
          <span style={{ color: PORTAL.greenDeep }}>{f.dow}</span> {f.long}
          {isToday && <small style={{ display: 'block', fontSize: 13, fontFamily: PORTAL.font, fontWeight: 400, color: PORTAL.muted, marginTop: 4 }}>Today</small>}
        </h1>
        <Btn onClick={onPrev}>&larr; Previous</Btn>
        <Btn onClick={onToday} primary>Today</Btn>
        <Btn onClick={onNext}>Next &rarr;</Btn>
      </div>

      {sorted.length === 0 ? (
        <div style={emptyStyle}>No classes scheduled on this day.</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {sorted.map(g => (
            <ClassCard key={g.group_id} g={g} onClick={() => onSelect(g)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ClassCard({ g, onClick }: { g: DayGroup; onClick: () => void }) {
  const r = readinessFromStatus(g.status)
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', textAlign: 'left', width: '100%', textDecoration: 'none', color: 'inherit',
        background: PORTAL.cardBg, border: `1px solid ${PORTAL.cardLine}`,
        borderLeft: `5px solid ${r === 'none' ? PORTAL.amberLine : PORTAL.green}`,
        borderRadius: 18, padding: '18px 20px', cursor: 'pointer', font: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: PORTAL.greenDeep, fontVariantNumeric: 'tabular-nums' }}>{g.from_time}</span>
        <h2 style={{ margin: 0, fontSize: 19, fontFamily: PORTAL.serif, fontWeight: 500, color: PORTAL.headingInk, flex: '1 1 auto' }}>{g.group_name}</h2>
        <Chip status={g.status} />
      </div>
      {g.group_level && <div style={{ color: PORTAL.muted, fontSize: 14, marginTop: 5 }}>{g.group_level}</div>}
    </button>
  )
}

// ---------------------------------------------------------------- week view

function WeekView({ dates, daysMap, onPrev, onNext, onToday, onSelect }: {
  dates: string[]; daysMap: DaysMap; onPrev: () => void; onNext: () => void; onToday: () => void
  onSelect: (date: string, g: DayGroup) => void
}) {
  const f0 = fmtLong(dates[0]), f6 = fmtLong(dates[6])
  return (
    <div>
      <div style={dayBarStyle}>
        <h1 style={{ margin: 0, fontSize: 19, flex: '1 1 auto', minWidth: 200 }}>{f0.long} &ndash; {f6.long}</h1>
        <Btn onClick={onPrev}>&larr; Previous</Btn>
        <Btn onClick={onToday} primary>This week</Btn>
        <Btn onClick={onNext}>Next &rarr;</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {dates.map(date => {
          const isToday = date === todayISO()
          const groups = [...(daysMap[date] || [])].sort((a, b) => a.from_time.localeCompare(b.from_time))
          const [, , d] = date.split('-')
          return (
            <div key={date} style={{
              minHeight: 140, background: PORTAL.paper, border: `1px solid ${isToday ? PORTAL.green : PORTAL.line}`,
              borderWidth: isToday ? 2 : 1, borderRadius: 10, padding: 8, display: 'flex', flexDirection: 'column', gap: 5,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: PORTAL.muted }}>{DOW_SHORT[dates.indexOf(date)]} {Number(d)}</div>
              {groups.length === 0 && <div style={{ fontSize: 11, color: PORTAL.muted }}>&mdash;</div>}
              {groups.map(g => {
                const r = readinessFromStatus(g.status), c = READINESS_CHIP[r]
                return (
                  <button
                    key={g.group_id}
                    onClick={() => onSelect(date, g)}
                    title={`${g.from_time}–${g.to_time} · ${READINESS_LABEL[r]}`}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', font: 'inherit', fontSize: 11,
                      padding: '4px 7px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: c.bg, color: c.fg, fontWeight: 700,
                    }}
                  >
                    {g.from_time} {g.group_name}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- month view

function MonthView({ ym, daysMap, onPrev, onNext, onToday, onSelect }: {
  ym: string; daysMap: DaysMap; onPrev: () => void; onNext: () => void; onToday: () => void
  onSelect: (date: string, g: DayGroup) => void
}) {
  const [y, m] = ym.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const firstWeekday = new Date(y, m - 1, 1).getDay()
  const leadBlanks = (firstWeekday + 6) % 7
  const today = todayISO()

  const cells: (string | null)[] = Array(leadBlanks).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${ym}-${String(d).padStart(2, '0')}`)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <div style={dayBarStyle}>
        <h1 style={{ margin: 0, fontSize: 21, flex: '1 1 auto', minWidth: 180 }}>{MONTHS[m - 1]} {y}</h1>
        <Btn onClick={onPrev}>&larr; Prev</Btn>
        <Btn onClick={onToday} primary>This month</Btn>
        <Btn onClick={onNext}>Next &rarr;</Btn>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: PORTAL.muted, marginBottom: 14 }}>
        <Legend color="#E8F3DA" border={PORTAL.greenDeep} label="Ready" />
        <Legend color={PORTAL.amberBg} border={PORTAL.amber} label="Partly ready" />
        <Legend color="#F0F0EE" border={PORTAL.muted} label="Nothing built" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 7 }}>
        {DOW_SHORT.map(d => (
          <div key={d} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: PORTAL.muted, textAlign: 'center', paddingBottom: 2 }}>{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const isToday = date === today
          const groups = [...(daysMap[date] || [])].sort((a, b) => a.from_time.localeCompare(b.from_time))
          const dayNum = Number(date.slice(-2))
          return (
            <div key={date} style={{
              minHeight: 88, background: PORTAL.paper, border: `1px solid ${isToday ? PORTAL.green : PORTAL.line}`,
              borderWidth: isToday ? 2 : 1, borderRadius: 9, padding: 6, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, alignSelf: 'flex-start' }}>{dayNum}</span>
              {groups.map(g => {
                const r = readinessFromStatus(g.status), c = READINESS_CHIP[r]
                return (
                  <button
                    key={g.group_id}
                    onClick={() => onSelect(date, g)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', font: 'inherit', fontSize: 10,
                      fontWeight: 700, padding: '2px 6px', borderRadius: 5, border: 'none', cursor: 'pointer',
                      background: c.bg, color: c.fg, lineHeight: 1.3,
                    }}
                  >
                    {g.group_slug || g.group_name}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Legend({ color, border, label }: { color: string; border: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <i style={{ width: 9, height: 9, borderRadius: '50%', display: 'inline-block', background: color, border: `1px solid ${border}` }} />
      {label}
    </span>
  )
}

// ---------------------------------------------------------------- lesson panel

interface ShelfItem { stem: string; role: string; label: string; files: Record<string, string> }
interface Shelves { plan: ShelfItem[]; worksheet: ShelfItem[]; key: ShelfItem[]; slides: ShelfItem[]; audio: ShelfItem[]; notes: ShelfItem[]; other: ShelfItem[] }
interface LessonContent {
  unit: string | null; unitApprox: boolean; title: string | null; pages: string | null
  grammar: string | null; vocab: string | null; warmer: string | null; plan: string | null
  print: string | null; flag: string | null; note: string | null
  play: { label: string; href: string } | { label: string; href: string }[] | null
  arcade: { unit: string; game: string; href?: string; missing?: false } | { missing: true; why: string } | null
  shelves: Shelves | null
  unitAudio: { label: string; track?: number; path: string }[]
}

function LessonPanel({ date, group, onClose, onToggle }: {
  date: string; group: DayGroup; onClose: () => void; onToggle: () => void
}) {
  const f = fmtLong(date)
  const r = readinessFromStatus(group.status)
  const [content, setContent] = useState<LessonContent | null | undefined>(undefined) // undefined = loading

  useEffect(() => {
    setContent(undefined)
    fetch(`/api/lesson-content?groupSlug=${group.group_slug}&date=${date}`)
      .then(res => (res.ok ? res.json() : { content: null }))
      .then(data => setContent(data.content))
      .catch(() => setContent(null))
  }, [group.group_slug, date])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,26,26,.45)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '5vh 20px',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: PORTAL.paper, borderRadius: 16, padding: '22px 24px', maxWidth: 640, width: '100%',
          boxShadow: '0 20px 60px rgba(26,26,26,.35)', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h1 style={{ margin: '0 0 3px', fontSize: 22 }}>{group.group_name}</h1>
            <div style={{ color: PORTAL.muted, fontSize: 14 }}>
              {[f.dow + ' ' + f.long, group.from_time + '–' + group.to_time, group.group_level].filter(Boolean).join(' · ')}
            </div>
          </div>
          <button onClick={onClose} style={{ font: 'inherit', fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: PORTAL.muted, lineHeight: 1 }}>&times;</button>
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Chip status={group.status} />
          <Btn onClick={onToggle}>{r === 'ready' ? 'Mark not ready' : 'Mark ready'}</Btn>
        </div>

        {content === undefined && <p style={{ color: PORTAL.muted, fontSize: 14, marginTop: 16 }}>Loading lesson content…</p>}

        {content === null && (
          <div style={{
            marginTop: 18, background: PORTAL.panel, borderRadius: 10, padding: '14px 16px', fontSize: 14, color: PORTAL.ink, lineHeight: 1.55,
          }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>No lesson content synced for this class yet</strong>
            Only FCE I and PET I have been brought over from the local Somerset Portal so far. Run
            <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 4 }}> node scripts/migrate-lesson-content.mjs</code> after
            rebuilding the local portal to sync more, or open <strong>Somerset Portal.app</strong> on your Mac
            for this class&rsquo;s material.
          </div>
        )}

        {content && (
          <div style={{ marginTop: 16 }}>
            {(content.unit || content.title) && (
              <div style={{ background: PORTAL.panel, borderRadius: 10, padding: '13px 15px', fontSize: 15, marginBottom: 14 }}>
                {content.unit && <div><strong style={{ color: PORTAL.greenDeep }}>{content.unit}</strong>{content.pages ? ` · pages ${content.pages}` : ''}{content.unitApprox ? <span style={{ color: PORTAL.muted, fontSize: 13 }}> (unit target — not planned in detail yet)</span> : ''}</div>}
                {content.title && content.title !== content.unit && <div style={{ marginTop: 4 }}>{content.title}</div>}
              </div>
            )}

            {content.plan && (
              <ShelfBox title="The plan" text={content.plan} />
            )}
            {content.flag && (
              <div style={{ background: PORTAL.amberBg, border: `1px solid ${PORTAL.amberLine}`, borderRadius: 10, padding: '12px 15px', fontSize: 14, color: '#6B4B05', marginBottom: 14 }}>
                <strong>Watch out.</strong> {content.flag}
              </div>
            )}
            {content.note && (
              <div style={{ background: PORTAL.amberBg, border: `1px solid ${PORTAL.amberLine}`, borderRadius: 10, padding: '12px 15px', fontSize: 14, color: '#6B4B05', marginBottom: 14 }}>
                <strong>Note.</strong> {content.note}
              </div>
            )}

            {(content.grammar || content.vocab || content.warmer) && (
              <div style={{ fontSize: 14, color: PORTAL.muted, marginBottom: 14 }}>
                {content.grammar && <div><strong style={{ color: PORTAL.ink }}>Grammar:</strong> {content.grammar}</div>}
                {content.vocab && <div><strong style={{ color: PORTAL.ink }}>Vocabulary:</strong> {content.vocab}</div>}
                {content.warmer && <div><strong style={{ color: PORTAL.ink }}>Warmer:</strong> {content.warmer}</div>}
              </div>
            )}

            <ShelfList title="Student worksheet" items={content.shelves?.worksheet} />
            <ShelfList title="Teacher key" items={content.shelves?.key} />
            <ShelfList title="Slides" items={content.shelves?.slides} />
            <ShelfList title="Class audio" items={content.shelves?.audio} />

            {content.unitAudio && content.unitAudio.length > 0 && (
              <ShelfSection title="Book audio">
                <div style={{ display: 'grid', gap: 6 }}>
                  {content.unitAudio.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 90 }}>{a.label}</span>
                      {a.path?.startsWith('http')
                        ? <audio controls preload="none" src={a.path} style={{ height: 28, flex: 1, maxWidth: 320 }} />
                        : <span style={{ fontSize: 12, color: PORTAL.muted }}>not synced yet</span>}
                    </div>
                  ))}
                </div>
              </ShelfSection>
            )}

            {content.arcade && !content.arcade.missing && 'unit' in content.arcade && (
              <ShelfSection title="Somerset Arcade">
                <LinkRow label={`Point Grab — ${content.arcade.unit}`} href={content.arcade.href} openLabel="Play" />
              </ShelfSection>
            )}
            {content.arcade && content.arcade.missing && (
              <ShelfSection title="Somerset Arcade">
                <div style={{ fontSize: 13, color: PORTAL.muted }}>{content.arcade.why}</div>
              </ShelfSection>
            )}

            {content.play && (
              <ShelfSection title="Review play">
                <div style={{ display: 'grid', gap: 8 }}>
                  {Array.isArray(content.play)
                    ? content.play.map((p, i) => <LinkRow key={i} label={p.label} href={p.href} openLabel="Open" />)
                    : <LinkRow label={content.play.label} href={content.play.href} openLabel="Open" />}
                </div>
              </ShelfSection>
            )}


          </div>
        )}
      </div>
    </div>
  )
}

function ShelfBox({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ background: PORTAL.panel, borderRadius: 9, padding: '13px 15px', fontSize: 15, marginBottom: 14 }}>
      <h3 style={{ margin: '0 0 5px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', color: PORTAL.muted }}>{title}</h3>
      {text}
    </div>
  )
}

function ShelfSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 14 }}>
      <h2 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: PORTAL.muted, margin: '0 0 8px', paddingBottom: 5, borderBottom: `1px solid ${PORTAL.line}` }}>{title}</h2>
      {children}
    </section>
  )
}

function LinkRow({ label, href, openLabel }: { label: string; href?: string; openLabel: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      background: PORTAL.paper, border: `1px solid ${PORTAL.line}`, borderRadius: 9,
      padding: '10px 13px', fontSize: 14, fontWeight: 700,
    }}>
      <span>{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={{
          fontSize: 12, fontWeight: 700, textTransform: 'uppercase', textDecoration: 'none',
          color: PORTAL.green, border: `1px solid ${PORTAL.green}`, borderRadius: 999,
          padding: '3px 10px', flexShrink: 0,
        }}>{openLabel}</a>
      ) : (
        <span style={{ fontSize: 12, color: PORTAL.muted, flexShrink: 0 }}>not synced yet</span>
      )}
    </div>
  )
}

function ShelfList({ title, items }: { title: string; items?: ShelfItem[] }) {
  if (!items || items.length === 0) return null
  return (
    <ShelfSection title={title}>
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map(it => {
          const fileEntries = Object.entries(it.files || {}).filter(([, url]) => url)
          return (
            <div key={it.stem} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              background: PORTAL.paper, border: `1px solid ${PORTAL.line}`, borderRadius: 9,
              padding: '10px 13px', fontSize: 14, fontWeight: 700,
            }}>
              <span>{it.label}</span>
              {fileEntries.length > 0 && (
                <span style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {fileEntries.map(([kind, url]) => (
                    <a key={kind} href={url} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 12, fontWeight: 700, textTransform: 'uppercase', textDecoration: 'none',
                      color: PORTAL.green, border: `1px solid ${PORTAL.green}`, borderRadius: 999,
                      padding: '3px 10px',
                    }}>{kind}</a>
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </ShelfSection>
  )
}

const dayBarStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: PORTAL.cardBg,
  border: `1px solid ${PORTAL.cardLine}`, borderRadius: 20, padding: '18px 20px', marginBottom: 18,
}
const emptyStyle: React.CSSProperties = { textAlign: 'center', padding: '44px 20px', color: PORTAL.muted, fontSize: 16 }
