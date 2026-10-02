'use client'

// "Student input" for the iPad (29 Sep 2026). On the day the children do the tap-able
// exercises in their booklet (multiple choice, match, true/false, a/an, sort...), each child
// comes to the iPad on the table, taps their name, then taps the answers they chose on paper.
// Answers are marked on the server against the key and saved straight away; the child is
// never told right or wrong. The teacher sees the results in the "Results" tab.
//
// Kiosk: the iPad stays signed in as the teacher, so the kiosk covers the whole screen and
// leaving it needs a 2-second press on the small padlock. For extra safety use iPadOS
// Guided Access (Settings > Accessibility > Guided Access) on the Safari tab.
// Student-facing text never uses the word "test".

import { useCallback, useEffect, useRef, useState } from 'react'
import { PORTAL } from '@/lib/portalTheme'

interface Opt { key: string; text: string }
interface Item { n: number; q: string; options: Opt[] }
interface Ex { id: string; page: number; date: string; type: string; title: string; instruction: string; items: Item[] }
interface Student { id: string; name: string }
interface GroupLite { id: string; name: string }
interface Loaded {
  group: GroupLite; hasExercises: boolean; students: Student[]; dates: string[]
  exercises: Ex[]; done: Record<string, Record<string, number>>; mine?: Record<string, Record<string, string>>
}
interface ResultItem { n: number; q: string; correct: string; correctText: string; answered: number; right: number; commonWrong: { key: string; text: string; count: number } | null }
interface Results {
  students: Student[]
  exercises: { id: string; page: number; title: string; type: string; items: ResultItem[] }[]
  cells: Record<string, Record<string, { answered: number; correct: number; total: number }>>
}
interface QueuedSave { groupId: string; date: string; studentId: string; exerciseId: string; answers: Record<string, string>; at: number }

const QUEUE_KEY = 'somerset-classroom-queue-v1'
const isoToday = () => new Date().toISOString().slice(0, 10)
const niceDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

function readQueue(): QueuedSave[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}
function writeQueue(q: QueuedSave[]) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)) } catch { /* private mode: nothing to do */ }
}

export default function ClassroomPage() {
  const [groups, setGroups] = useState<GroupLite[]>([])
  const [groupId, setGroupId] = useState('')
  const [date, setDate] = useState(isoToday())
  const [data, setData] = useState<Loaded | null>(null)
  const [loadErr, setLoadErr] = useState('')
  const [tab, setTab] = useState<'setup' | 'results'>('setup')
  const [kiosk, setKiosk] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [queued, setQueued] = useState(0)

  useEffect(() => {
    fetch('/api/groups').then(r => r.json()).then((g: GroupLite[]) => {
      if (!Array.isArray(g)) return
      setGroups(g)
      const flyers = g.find(x => /flyers|children/i.test(x.name))
      setGroupId((flyers || g[0])?.id || '')
    }).catch(() => setLoadErr('Could not load groups.'))
  }, [])

  const load = useCallback(async () => {
    if (!groupId) return
    setLoadErr('')
    try {
      const r = await fetch(`/api/classroom/exercises?group=${groupId}&date=${date}`)
      if (!r.ok) throw new Error()
      const d: Loaded = await r.json()
      setData(d)
      // If today has no exercises but the group has other dates, jump to the nearest one.
      if (d.dates.length && !d.dates.includes(date)) {
        const next = d.dates.find(x => x >= date) || d.dates[d.dates.length - 1]
        setDate(next)
      }
    } catch { setLoadErr('Could not load this group. Are you signed in and online?') }
  }, [groupId, date])
  useEffect(() => { load() }, [load])

  const loadResults = useCallback(async () => {
    if (!groupId) return
    const r = await fetch(`/api/classroom/results?group=${groupId}&date=${date}`)
    if (r.ok) setResults(await r.json())
  }, [groupId, date])
  useEffect(() => { if (tab === 'results') loadResults() }, [tab, loadResults])

  // Offline queue: a save that fails (Wi-Fi drop) waits on the iPad and is retried.
  const flush = useCallback(async () => {
    const q = readQueue()
    if (!q.length) { setQueued(0); return }
    const rest: QueuedSave[] = []
    for (const s of q) {
      try {
        const r = await fetch('/api/classroom/answers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
        if (!r.ok && r.status >= 500) rest.push(s) // server trouble: keep; 4xx: drop, it can never succeed
      } catch { rest.push(s) }
    }
    writeQueue(rest); setQueued(rest.length)
  }, [])
  useEffect(() => {
    setQueued(readQueue().length)
    const t = setInterval(flush, 10000)
    return () => clearInterval(t)
  }, [flush])

  async function saveAnswers(studentId: string, exerciseId: string, answers: Record<string, string>): Promise<'saved' | 'queued'> {
    const payload: QueuedSave = { groupId, date, studentId, exerciseId, answers, at: Date.now() }
    try {
      const r = await fetch('/api/classroom/answers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (r.ok) return 'saved'
      if (r.status < 500) return 'saved' // rejected for good (bad data): do not keep retrying
      throw new Error()
    } catch {
      writeQueue([...readQueue(), payload]); setQueued(readQueue().length)
      return 'queued'
    }
  }

  const hasEx = !!data && data.exercises.length > 0
  const itemCount = data ? data.exercises.reduce((n, e) => n + e.items.length, 0) : 0

  return (
    <div style={{ padding: '28px 32px', fontFamily: PORTAL.font, color: PORTAL.ink, maxWidth: 1100 }}>
      <h1 style={{ fontFamily: PORTAL.serif, fontSize: 30, margin: '0 0 4px', color: PORTAL.headingInk }}>Student input</h1>
      <p style={{ margin: '0 0 18px', color: PORTAL.muted, fontSize: 15 }}>
        The children tap their booklet answers on the iPad. You see who answered what straight away.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
        <select value={groupId} onChange={e => { setGroupId(e.target.value); setData(null); setResults(null) }} style={sel}>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select value={date} onChange={e => { setDate(e.target.value); setResults(null) }} style={sel}>
          {(data?.dates.length ? data.dates : [date]).map(d => <option key={d} value={d}>{niceDate(d)}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {(['setup', 'results'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...pill, background: tab === t ? PORTAL.green : PORTAL.paper, color: tab === t ? '#fff' : PORTAL.ink }}>
              {t === 'setup' ? 'Start' : 'Results'}
            </button>
          ))}
        </div>
      </div>

      {loadErr && <div style={{ ...card, borderColor: PORTAL.red, background: PORTAL.redBg }}>{loadErr}</div>}
      {queued > 0 && <div style={{ ...card, background: PORTAL.amberBg, borderColor: PORTAL.amberLine }}>{queued} answer set{queued > 1 ? 's are' : ' is'} waiting on this iPad and will send when the connection is back.</div>}

      {tab === 'setup' && data && (
        <div style={card}>
          {!data.hasExercises ? (
            <p style={{ margin: 0 }}>No tap-to-answer exercises exist yet for <b>{data.group.name}</b>. (Only the Flyers October booklet is set up so far.)</p>
          ) : !hasEx ? (
            <p style={{ margin: 0 }}>Nothing to tap on {niceDate(date)}. Choose another date above.</p>
          ) : (
            <>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{niceDate(date)} · {data.students.length} children</div>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20, lineHeight: 1.7 }}>
                {data.exercises.map(e => <li key={e.id}>p.{e.page} · {e.title} <span style={{ color: PORTAL.muted }}>({e.items.length} questions)</span></li>)}
              </ul>
              <div style={{ color: PORTAL.muted, fontSize: 14, marginBottom: 14 }}>{data.exercises.length} exercises · {itemCount} questions in total</div>
              <button onClick={() => setKiosk(true)} style={{ ...bigGreen, width: 'auto', padding: '16px 34px' }}>Start student input</button>
              <p style={{ color: PORTAL.muted, fontSize: 13, margin: '12px 0 0' }}>
                Full-screen mode for the children. To leave it, press and hold the padlock (top right) for 2 seconds.
                Tip: switch on Guided Access on the iPad so they cannot leave the page.
              </p>
            </>
          )}
        </div>
      )}

      {tab === 'results' && (
        <ResultsView results={results} onRefresh={loadResults} />
      )}

      {kiosk && data && (
        <Kiosk
          data={data} date={date} groupId={groupId}
          onSave={saveAnswers}
          onExit={() => { setKiosk(false); load(); if (tab === 'results') loadResults() }}
          onDoneChange={load}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------- kiosk (children)
//
// The kiosk mirrors the printed booklet: the child picks a PAGE NUMBER, sees that page's
// exercises with the same running head, title, numbering and layout as on paper (lettered
// pills, T/F circles, match letters, word banks, a/an, sort boxes) and taps what they chose.

const PAGE_HEAD: Record<number, { kicker: string; title: string }> = {
  3: { kicker: 'Before we start · Unit 2 · Fresh food', title: 'What do I know?' },
  5: { kicker: 'Reading · From seed to plate', title: 'Grow Your Own' },
  6: { kicker: 'Words · Garden verbs', title: 'From seed to plate' },
  8: { kicker: 'Grammar · Practice', title: 'Three ways to practise' },
  11: { kicker: 'Words · At the market', title: 'Courgettes, chillis, cabbages' },
  12: { kicker: 'Words · Practice', title: 'What is it?' },
  14: { kicker: 'Words · How often?', title: 'Once, twice, every day' },
  15: { kicker: 'Grammar · Practice', title: 'Order it, say how often' },
  21: { kicker: 'Board game · How to play', title: 'Read the rules, then play' },
  23: { kicker: 'Check · Unit 2 · Fresh food', title: 'Unit 2 check' },
  24: { kicker: 'Check · Unit 2 · Fresh food', title: 'Unit 2 check' },
}
const headOf = (p: number) => PAGE_HEAD[p] || { kicker: 'Booklet', title: `Page ${p}` }

const GREEN_LINE = '#BFDCA0'
const kickerStyle: React.CSSProperties = { fontSize: 15, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: PORTAL.greenDeep }
const numStyle: React.CSSProperties = { fontFamily: PORTAL.serif, fontWeight: 800, color: PORTAL.greenDeep, fontSize: 28, minWidth: 40, lineHeight: 1.2 }

type Sel = Record<string, string>
interface BlockProps { ex: Ex; sel: Sel; pick: (n: number, key: string) => void }

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ background: PORTAL.cardBg, border: `2px solid ${GREEN_LINE}`, borderRadius: 22, padding: '18px 22px 12px', marginBottom: 22 }}>
      <div style={{ ...kickerStyle, marginBottom: 12 }}>{label}</div>
      {children}
    </section>
  )
}

function Pill({ on, onClick, dot, children, dashed }: { on: boolean; onClick: () => void; dot?: string; children: React.ReactNode; dashed?: boolean }) {
  return (
    <button onClick={onClick} style={{ minHeight: 60, padding: '8px 22px 8px 12px', borderRadius: 40, fontSize: 25, fontWeight: 700, border: `3px ${dashed ? 'dashed' : 'solid'} ${on ? PORTAL.greenDeep : PORTAL.cardLine}`, background: on ? PORTAL.green : '#fff', color: on ? '#fff' : PORTAL.headingInk, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {dot !== undefined && (
        <span style={{ width: 34, height: 34, borderRadius: 17, background: on ? '#fff' : '#EAF5DC', color: PORTAL.greenDeep, fontSize: 19, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{dot}</span>
      )}
      {children}
    </button>
  )
}

function Circle({ on, onClick, children, size = 60 }: { on: boolean; onClick: () => void; children: React.ReactNode; size?: number }) {
  return (
    <button onClick={onClick} style={{ width: size, height: size, borderRadius: size / 2, flex: 'none', fontSize: size > 55 ? 24 : 22, fontWeight: 800, border: `3px solid ${on ? PORTAL.greenDeep : PORTAL.cardLine}`, background: on ? PORTAL.green : '#fff', color: on ? '#fff' : PORTAL.headingInk }}>{children}</button>
  )
}

const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px dashed ${PORTAL.cardLine}`, flexWrap: 'wrap' }

// "T / F": statement on the left, two circles on the right, like the printed pages
function TrueFalse({ ex, sel, pick }: BlockProps) {
  return (
    <Card label={ex.title}>
      {ex.items.map(i => (
        <div key={i.n} style={{ ...rowStyle, flexWrap: 'nowrap' }}>
          <span style={numStyle}>{i.n}</span>
          <span style={{ flex: 1, fontSize: 25, lineHeight: 1.3 }}>{i.q}</span>
          {i.options.map(o => <Circle key={o.key} on={sel[String(i.n)] === o.key} onClick={() => pick(i.n, o.key)}>{o.key}</Circle>)}
        </div>
      ))}
    </Card>
  )
}

// Match: numbered words on the left with the letter to choose; the a-h list stays visible
function Match({ ex, sel, pick }: BlockProps) {
  const opts = ex.items[0].options
  return (
    <Card label={ex.title}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 28px' }}>
        <div style={{ flex: '1 1 560px' }}>
          {ex.items.map(i => (
            <div key={i.n} style={rowStyle}>
              <span style={numStyle}>{i.n}</span>
              <span style={{ fontFamily: PORTAL.serif, fontWeight: 700, fontSize: 25, flex: '1 1 110px' }}>{i.q}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {opts.map(o => <Circle key={o.key} size={46} on={sel[String(i.n)] === o.key} onClick={() => pick(i.n, o.key)}>{o.key}</Circle>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: '1 1 270px', paddingTop: 8 }}>
          {opts.map(o => (
            <div key={o.key} style={{ display: 'flex', gap: 12, padding: '8px 0', fontSize: 22, lineHeight: 1.25 }}>
              <span style={{ fontFamily: PORTAL.serif, fontWeight: 800, color: PORTAL.greenDeep, minWidth: 24 }}>{o.key}</span>
              <span>{o.text}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// Multiple choice, three printed styles: a/b/c pills; circle-the-word inside the sentence;
// odd one out (loose word pills)
function Choice({ ex, sel, pick }: BlockProps) {
  return (
    <Card label={ex.title}>
      {ex.items.map(item => {
        const on = (k: string) => sel[String(item.n)] === k
        const lettered = item.options.every(o => o.key.length === 1)
        const odd = /^circle the odd/i.test(item.q)
        const parts = item.q.split('___')
        if (!lettered && !odd && parts.length === 2) {
          return (
            <div key={item.n} style={{ ...rowStyle, fontSize: 26, lineHeight: 1.9 }}>
              <span style={numStyle}>{item.n}</span>
              <span style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                {parts[0] && <span>{parts[0].trim()}</span>}
                {item.options.map((o, idx) => (
                  <span key={o.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {idx > 0 && <span style={{ color: PORTAL.muted }}>/</span>}
                    <Pill on={on(o.key)} onClick={() => pick(item.n, o.key)}>{o.text}</Pill>
                  </span>
                ))}
                {parts[1] && <span>{parts[1].trim()}</span>}
              </span>
            </div>
          )
        }
        return (
          <div key={item.n} style={{ padding: '12px 0', borderBottom: `1px dashed ${PORTAL.cardLine}` }}>
            <div style={{ display: 'flex', gap: 14, fontSize: 25, lineHeight: 1.35, marginBottom: odd ? 0 : 10 }}>
              <span style={numStyle}>{item.n}</span>
              {!odd && <span>{item.q}</span>}
              {odd && (
                <span style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {item.options.map(o => <Pill key={o.key} on={on(o.key)} onClick={() => pick(item.n, o.key)}>{o.text}</Pill>)}
                </span>
              )}
            </div>
            {!odd && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingLeft: 54 }}>
                {item.options.map(o => <Pill key={o.key} on={on(o.key)} dot={lettered ? o.key : undefined} onClick={() => pick(item.n, o.key)}>{o.text}</Pill>)}
              </div>
            )}
          </div>
        )
      })}
    </Card>
  )
}

// Word bank: the words sit in a sticky bank at the top (like the printed chips); tap the
// highlighted line's word. The next empty line lights up by itself.
function Bank({ ex, sel, pick }: BlockProps) {
  const bank = ex.items[0].options
  const firstEmpty = ex.items.find(i => !sel[String(i.n)])?.n ?? ex.items[0].n
  const [active, setActive] = useState<number | null>(null)
  const cur = active ?? firstEmpty
  function tap(key: string) {
    pick(cur, key)
    const next = ex.items.find(i => i.n !== cur && !sel[String(i.n)])
    setActive(next ? next.n : cur)
  }
  const textOf = (n: number) => bank.find(o => o.key === sel[String(n)])?.text
  return (
    <Card label={ex.title}>
      <div style={{ position: 'sticky', top: 0, zIndex: 3, background: PORTAL.cardBg, padding: '6px 0 12px', margin: '0 0 6px', borderBottom: `2px solid ${GREEN_LINE}`, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {bank.map(o => (
          <button key={o.key} onClick={() => tap(o.key)} style={{ minHeight: 56, padding: '6px 22px', borderRadius: 40, fontSize: 24, fontWeight: 700, border: `3px solid ${PORTAL.green}`, background: '#EAF5DC', color: PORTAL.headingInk }}>{o.text}</button>
        ))}
      </div>
      {ex.items.map(i => {
        const isCur = i.n === cur
        const gap = (
          <span style={{ display: 'inline-block', minWidth: 150, textAlign: 'center', borderBottom: `3px solid ${isCur ? PORTAL.greenDeep : PORTAL.headingInk}`, fontWeight: 800, color: PORTAL.greenDeep, padding: '0 8px', margin: '0 6px' }}>{textOf(i.n) || ' '}</span>
        )
        const parts = i.q.split('___')
        return (
          <div key={i.n} onClick={() => setActive(i.n)} style={{ ...rowStyle, flexWrap: 'nowrap', padding: '14px 10px', margin: '0 -10px', borderRadius: 14, background: isCur ? '#EAF5DC' : 'transparent', fontSize: 25, lineHeight: 1.5 }}>
            <span style={numStyle}>{i.n}</span>
            <span style={{ flex: 1 }}>
              {parts.length === 2 ? <>{parts[0]}{gap}{parts[1]}</> : <>{i.q} {gap}</>}
            </span>
          </div>
        )
      })}
    </Card>
  )
}

// a / an
function AAn({ ex, sel, pick }: BlockProps) {
  return (
    <Card label={ex.title}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '0 30px' }}>
        {ex.items.map(i => {
          const chosen = i.options.find(o => o.key === sel[String(i.n)])?.text
          const [, word] = i.q.split('___')
          return (
            <div key={i.n} style={{ ...rowStyle, flexWrap: 'nowrap' }}>
              <span style={numStyle}>{i.n}</span>
              <span style={{ flex: 1, fontSize: 26 }}>
                <span style={{ display: 'inline-block', minWidth: 64, textAlign: 'center', borderBottom: `3px solid ${PORTAL.headingInk}`, fontWeight: 800, color: PORTAL.greenDeep }}>{chosen || ' '}</span>{word}
              </span>
              {i.options.map(o => <Pill key={o.key} on={sel[String(i.n)] === o.key} onClick={() => pick(i.n, o.key)}>{o.text}</Pill>)}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// Sort: the two dashed boxes of the printed page become two buttons per word
function Sort({ ex, sel, pick }: BlockProps) {
  return (
    <Card label={ex.title}>
      {ex.items.map(i => (
        <div key={i.n} style={rowStyle}>
          <span style={numStyle}>{i.n}</span>
          <span style={{ fontFamily: PORTAL.serif, fontWeight: 700, fontSize: 26, flex: '1 1 160px' }}>{i.q}</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {i.options.map(o => <Pill key={o.key} dashed on={sel[String(i.n)] === o.key} onClick={() => pick(i.n, o.key)}>{o.text}</Pill>)}
          </div>
        </div>
      ))}
    </Card>
  )
}

function Block(p: BlockProps) {
  switch (p.ex.type) {
    case 'tf': return <TrueFalse {...p} />
    case 'match': return <Match {...p} />
    case 'bank': return <Bank {...p} />
    case 'aan': return <AAn {...p} />
    case 'sort': return <Sort {...p} />
    default: return <Choice {...p} />
  }
}

function Kiosk({ data, date, groupId, onSave, onExit, onDoneChange }: {
  data: Loaded; date: string; groupId: string
  onSave: (studentId: string, exerciseId: string, answers: Record<string, string>) => Promise<'saved' | 'queued'>
  onExit: () => void; onDoneChange: () => void
}) {
  const [student, setStudent] = useState<Student | null>(null)
  const [page, setPage] = useState<number | null>(null)
  const [picked, setPicked] = useState<Record<string, Sel>>({})
  const [previous, setPrevious] = useState<Record<string, Sel>>({})
  const [flash, setFlash] = useState('')
  const [doneLocal, setDoneLocal] = useState<Record<string, Record<string, number>>>({})
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null)

  // The children choose by PAGE NUMBER, so exercises are grouped page by page.
  const pages: { page: number; exercises: Ex[] }[] = []
  for (const e of data.exercises) {
    const g = pages.find(p => p.page === e.page)
    if (g) g.exercises.push(e); else pages.push({ page: e.page, exercises: [e] })
  }
  pages.sort((a, b) => a.page - b.page)
  const current = pages.find(p => p.page === page) || null

  const doneOf = (sid: string, eid: string) => (doneLocal[sid]?.[eid] ?? data.done[sid]?.[eid] ?? 0)
  const pageDone = (sid: string, p: { exercises: Ex[] }) => p.exercises.every(e => doneOf(sid, e.id) > 0)
  const finishedCount = (sid: string) => pages.filter(p => pageDone(sid, p)).length

  // Back to the name screen after 90 s without a touch, so the next child starts clean.
  const bump = useCallback(() => {
    if (idle.current) clearTimeout(idle.current)
    idle.current = setTimeout(() => { setStudent(null); setPage(null); setPicked({}) }, 90000)
  }, [])
  useEffect(() => { bump(); return () => { if (idle.current) clearTimeout(idle.current) } }, [bump])

  async function chooseStudent(s: Student) {
    setStudent(s); setPage(null); setPicked({})
    try {
      const r = await fetch(`/api/classroom/exercises?group=${groupId}&date=${date}&student=${s.id}`)
      if (r.ok) { const d: Loaded = await r.json(); setPrevious(d.mine || {}) }
    } catch { setPrevious({}) }
  }

  function openPage(p: { page: number; exercises: Ex[] }) {
    const start: Record<string, Sel> = {}
    for (const e of p.exercises) start[e.id] = { ...(previous[e.id] || {}) }
    setPicked(start); setPage(p.page)
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }

  const pick = (exId: string) => (n: number, key: string) =>
    setPicked(p => ({ ...p, [exId]: { ...(p[exId] || {}), [String(n)]: key } }))

  async function submit() {
    if (!student || !current) return
    let queued = false
    for (const e of current.exercises) {
      const answers = picked[e.id] || {}
      if (Object.keys(answers).length === 0) continue
      const res = await onSave(student.id, e.id, answers)
      if (res === 'queued') queued = true
      setDoneLocal(d => ({ ...d, [student.id]: { ...(d[student.id] || {}), [e.id]: Object.keys(answers).length } }))
      setPrevious(pv => ({ ...pv, [e.id]: answers }))
    }
    setFlash(queued ? 'Saved on the iPad ✓' : 'Saved ✓')
    setPage(null); setPicked({})
    onDoneChange()
    setTimeout(() => setFlash(''), 1800)
  }

  const total = current ? current.exercises.reduce((n, e) => n + e.items.length, 0) : 0
  const answered = current ? current.exercises.reduce((n, e) => n + Object.keys(picked[e.id] || {}).length, 0) : 0
  const scrollBox: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 1000, background: PORTAL.pageBg, overflowY: 'auto', fontFamily: PORTAL.font, WebkitUserSelect: 'none', userSelect: 'none', touchAction: 'manipulation' }

  return (
    <div onPointerDown={bump} style={scrollBox}>
      {/* padlock: hold 2 s to leave */}
      <button
        aria-label="Teacher exit: hold for 2 seconds"
        onPointerDown={() => { hold.current = setTimeout(onExit, 2000) }}
        onPointerUp={() => { if (hold.current) clearTimeout(hold.current) }}
        onPointerLeave={() => { if (hold.current) clearTimeout(hold.current) }}
        style={{ position: 'fixed', top: 10, right: 12, zIndex: 1001, width: 44, height: 44, borderRadius: 22, border: `1px solid ${PORTAL.cardLine}`, background: PORTAL.paper, fontSize: 18, opacity: 0.55 }}
      >🔒</button>

      {flash && (
        <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1002, background: PORTAL.green, color: '#fff', padding: '14px 32px', borderRadius: 40, fontSize: 26, fontWeight: 800 }}>{flash}</div>
      )}

      {!student && (
        <div style={{ padding: '36px 28px 60px', maxWidth: 1000, margin: '0 auto' }}>
          <h1 style={{ fontFamily: PORTAL.serif, fontSize: 44, textAlign: 'center', margin: '0 0 6px', color: PORTAL.headingInk }}>Who are you?</h1>
          <p style={{ textAlign: 'center', fontSize: 22, color: PORTAL.muted, margin: '0 0 28px' }}>Tap your name</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
            {data.students.map(s => {
              const n = finishedCount(s.id)
              const all = n === pages.length
              return (
                <button key={s.id} onClick={() => chooseStudent(s)} style={{ minHeight: 96, borderRadius: 22, border: `3px solid ${all ? PORTAL.green : PORTAL.cardLine}`, background: all ? '#EAF5DC' : PORTAL.paper, fontSize: 30, fontWeight: 800, color: PORTAL.headingInk }}>
                  {s.name}
                  <div style={{ fontSize: 15, fontWeight: 600, color: PORTAL.muted, marginTop: 4 }}>{all ? '✓ all done' : n > 0 ? `${n} of ${pages.length} pages done` : ''}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {student && !current && (
        <div style={{ padding: '36px 28px 60px', maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontFamily: PORTAL.serif, fontSize: 42, margin: '0 0 6px', color: PORTAL.headingInk }}>Hello, {student.name}!</h1>
          <p style={{ fontSize: 22, color: PORTAL.muted, margin: '0 0 24px' }}>Tap the page number you did in your booklet.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {pages.map(p => {
              const done = pageDone(student.id, p)
              return (
                <button key={p.page} onClick={() => openPage(p)} style={{ textAlign: 'left', minHeight: 130, borderRadius: 22, border: `3px solid ${done ? PORTAL.green : PORTAL.cardLine}`, background: done ? '#EAF5DC' : PORTAL.cardBg, padding: '14px 20px', position: 'relative' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: PORTAL.muted }}>Page</div>
                  <div style={{ fontFamily: PORTAL.serif, fontSize: 56, fontWeight: 800, lineHeight: 1, color: PORTAL.greenDeep }}>{p.page}</div>
                  <div style={{ fontFamily: PORTAL.serif, fontSize: 20, fontWeight: 700, color: PORTAL.headingInk, marginTop: 6 }}>{headOf(p.page).title}</div>
                  {done && <span style={{ position: 'absolute', top: 12, right: 16, fontSize: 30, color: PORTAL.greenDeep, fontWeight: 800 }}>✓</span>}
                </button>
              )
            })}
          </div>
          <button onClick={() => { setStudent(null); setPrevious({}) }} style={{ ...bigGreen, marginTop: 30, background: PORTAL.paper, color: PORTAL.headingInk, border: `3px solid ${PORTAL.cardLine}` }}>
            I have finished · next child
          </button>
        </div>
      )}

      {student && current && (
        <div style={{ padding: '24px 28px 130px', maxWidth: 980, margin: '0 auto' }}>
          <button onClick={() => { setPage(null); setPicked({}) }} style={{ border: 'none', background: 'none', fontSize: 22, color: PORTAL.greenDeep, fontWeight: 700, padding: '8px 0' }}>← Back</button>
          <div style={{ ...kickerStyle, marginTop: 4 }}>{headOf(current.page).kicker}</div>
          <h1 style={{ fontFamily: PORTAL.serif, fontSize: 46, lineHeight: 1.05, margin: '6px 0 6px', color: PORTAL.headingInk }}>{headOf(current.page).title}</h1>
          <p style={{ fontSize: 20, color: PORTAL.muted, margin: '0 0 20px' }}>{student.name} · page {current.page} · tap what you chose in your booklet</p>

          {current.exercises.map(e => (
            <Block key={e.id} ex={e} sel={picked[e.id] || {}} pick={pick(e.id)} />
          ))}

          <div style={{ textAlign: 'right', fontFamily: PORTAL.serif, fontSize: 30, fontWeight: 800, color: PORTAL.greenDeep, borderTop: `2px solid ${PORTAL.cardLine}`, paddingTop: 8 }}>{current.page}</div>

          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: PORTAL.pageBg, borderTop: `2px solid ${PORTAL.cardLine}`, padding: '14px 28px', textAlign: 'center', zIndex: 5 }}>
            <button onClick={submit} disabled={answered === 0} style={{ ...bigGreen, opacity: answered ? 1 : 0.4, maxWidth: 560 }}>
              {answered === total ? 'Save my answers' : `Save (${answered} of ${total} done)`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- results (teacher)

function ResultsView({ results, onRefresh }: { results: Results | null; onRefresh: () => void }) {
  if (!results) return <div style={card}>Loading…</div>
  if (!results.exercises.length) return <div style={card}>No tap-to-answer exercises on this date.</div>
  const tint = (c: number, t: number) => (t ? (c / t >= 0.8 ? '#DFF0CB' : c / t >= 0.5 ? PORTAL.amberBg : PORTAL.redBg) : 'transparent')
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={onRefresh} style={pill}>Refresh</button>
      </div>
      <div style={{ ...card, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 15 }}>
          <thead>
            <tr>
              <th style={th}>Child</th>
              {results.exercises.map(e => <th key={e.id} style={th}>p.{e.page}<div style={{ fontWeight: 500, color: PORTAL.muted, fontSize: 12 }}>{e.title}</div></th>)}
            </tr>
          </thead>
          <tbody>
            {results.students.map(s => (
              <tr key={s.id}>
                <td style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{s.name}</td>
                {results.exercises.map(e => {
                  const c = results.cells[s.id]?.[e.id]
                  return <td key={e.id} style={{ ...td, background: c ? tint(c.correct, c.total) : 'transparent' }}>{c ? `${c.correct}/${c.total}` : '–'}{c && c.answered < c.total ? <span style={{ color: PORTAL.amber }} title="some questions left empty"> *</span> : null}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontFamily: PORTAL.serif, fontSize: 22, margin: '24px 0 10px' }}>Hardest questions · correct these together</h2>
      {results.exercises.map(e => {
        const hard = e.items.filter(i => i.answered > 0 && i.right / i.answered < 0.7).sort((a, b) => a.right / a.answered - b.right / b.answered)
        if (!hard.length) return null
        return (
          <div key={e.id} style={{ ...card, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>p.{e.page} · {e.title}</div>
            {hard.map(i => (
              <div key={i.n} style={{ padding: '6px 0', borderTop: `1px solid ${PORTAL.line}`, fontSize: 15 }}>
                <b>{i.n}.</b> {i.q} → <b style={{ color: PORTAL.greenDeep }}>{i.correct}: {i.correctText}</b>
                <span style={{ color: PORTAL.muted }}> · {i.right}/{i.answered} right{i.commonWrong ? ` · most chose ${i.commonWrong.key}: ${i.commonWrong.text} (${i.commonWrong.count})` : ''}</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

const sel: React.CSSProperties = { padding: '10px 14px', fontSize: 16, borderRadius: 10, border: `1px solid ${PORTAL.cardLine}`, background: PORTAL.paper }
const pill: React.CSSProperties = { padding: '9px 20px', fontSize: 15, fontWeight: 700, borderRadius: 999, border: `1px solid ${PORTAL.cardLine}`, background: PORTAL.paper, cursor: 'pointer' }
const card: React.CSSProperties = { background: PORTAL.cardBg, border: `1px solid ${PORTAL.cardLine}`, borderRadius: 14, padding: '18px 22px', marginBottom: 14 }
const bigGreen: React.CSSProperties = { width: '100%', minHeight: 72, borderRadius: 40, border: 'none', background: PORTAL.green, color: '#fff', fontSize: 26, fontWeight: 800, cursor: 'pointer' }
const th: React.CSSProperties = { textAlign: 'center', padding: '8px 10px', borderBottom: `2px solid ${PORTAL.cardLine}`, fontSize: 14, verticalAlign: 'bottom' }
const td: React.CSSProperties = { textAlign: 'center', padding: '9px 10px', borderBottom: `1px solid ${PORTAL.line}` }
