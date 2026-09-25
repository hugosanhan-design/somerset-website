'use client'

// Somerset CBT — computer-based mock exam (trial), Function 5 Phase A.
// Restyled 24 Jul 2026 to mirror the REAL Cambridge B2 First Digital exam UI
// (per Cambridge's official tutorial): cold institutional navy header with status
// chrome (connection dot, invigilator-message bell, settings, notes), white content
// cards, numbered question squares with the black completed-line, red review flags,
// green navigation arrows, and the same timer behaviour (minutes-only until 5:00,
// m:ss below, colour change in the final minute). Somerset appears discreetly.
// All exam logic (autosave, resume codes, flags, notes/highlights, drag-drop) is
// unchanged from the previous build — this is a skin, not a rewrite.
// Public route: students access /cbt directly with no login (middleware exception).
// Multi-exam since 23 Sep 2026: which exam loads is picked by ?exam=<examId> (default
// stays TEST4, so every existing bare /cbt and /cbt link keeps working unchanged).
// Add a new exam here by importing its data file and adding one line to EXAM_REGISTRY —
// nothing else in this file needs to know its id. Audio files for exam <id> must live
// under public/cbt-audio/<audioFolder>/.

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TEST4, CbtReadingPart, CbtListeningPart, CbtWritingTask } from '@/data/cbt/test4-b2first'
import { GEN01 } from '@/data/cbt/gen01-b2first'

// What this page actually reads off an exam — deliberately narrower than either exam's
// full data shape (e.g. TEST4 also carries a `speaking` section this page never uses,
// since Speaking is examiner-led; GEN01 has no such section by design).
interface ExamData {
  id: string
  title: string
  papers: Record<PaperId, { name: string; durationMin: number }>
  readingParts: CbtReadingPart[]
  listeningParts: CbtListeningPart[]
  writingTasks: CbtWritingTask[]
}
const EXAM_REGISTRY: Record<string, { data: ExamData; audioFolder: string }> = {
  [TEST4.id]: { data: TEST4, audioFolder: 'test4' },
  [GEN01.id]: { data: GEN01, audioFolder: 'gen01' },
}
const DEFAULT_EXAM_ID = TEST4.id

type PaperId = 'reading-uoe' | 'writing' | 'listening'
type Contrast = 'normal' | 'wob' | 'yob'   // normal · white-on-black · yellow-on-black

interface Palette {
  header: string; headerText: string; bg: string; panel: string; card: string
  sel: string; line: string; ink: string; accent: string; onAccent: string
  warn: string; grey: string; disabled: string; hl: string; ok: string; go: string
}

// Three palettes matching the tutorial's contrast options. Structural colours flow
// through this object, so switching contrast re-themes the whole paper at once.
const PALETTES: Record<Contrast, Palette> = {
  normal: {
    header: '#14263F', headerText: '#FFFFFF', bg: '#F2F4F7', panel: '#FFFFFF', card: '#FFFFFF',
    sel: '#E7F0FA', line: '#D5DAE1', ink: '#19212B', accent: '#1F5FA8', onAccent: '#FFFFFF',
    warn: '#C0392B', grey: '#5B6673', disabled: '#EEF0F3', hl: '#FFE58A', ok: '#2E7D32', go: '#2F9E44',
  },
  wob: {
    header: '#0B0B0B', headerText: '#FFFFFF', bg: '#000000', panel: '#0E0E0E', card: '#171717',
    sel: '#12314F', line: '#3C3C3C', ink: '#FFFFFF', accent: '#6FB2F2', onAccent: '#06263F',
    warn: '#FF6B6B', grey: '#B4B4B4', disabled: '#1E1E1E', hl: 'rgba(255,221,87,0.38)', ok: '#7CD98B', go: '#7CD98B',
  },
  yob: {
    header: '#0B0B0B', headerText: '#FFD400', bg: '#000000', panel: '#0A0A0A', card: '#151515',
    sel: '#3A340F', line: '#5E571F', ink: '#FFD400', accent: '#FFD400', onAccent: '#000000',
    warn: '#FF9166', grey: '#C8BE72', disabled: '#1A1A1A', hl: 'rgba(255,212,0,0.32)', ok: '#C8BE72', go: '#FFD400',
  },
}

const sans = '"Segoe UI", "Helvetica Neue", Arial, sans-serif'

function fmtTime(s: number) {
  const m = Math.floor(s / 60), ss = s % 60
  return `${m}:${ss.toString().padStart(2, '0')}`
}

const wordCount = (t: string) => (t.trim().match(/\S+/g) || []).length

// Gapped-text question numbers (Reading Part 6) — B2 First standard
const P6_GAPS = [37, 38, 39, 40, 41, 42]

const qDomId = (key: string) => 'q_' + key.replace(/[^a-zA-Z0-9]/g, '_')

// ── Session persistence ──
// Saved TWICE — server (resume on any device via a code, even after the machine dies) and
// localStorage (instant same-browser fallback). secondsLeft is the time remaining at the last
// save, not a deadline, so a resume gives back the time that was left (clock pauses during an
// outage). extras carries the study aids (flags/notes/highlights). Bump the suffix on shape change.
// Keyed per exam (see LS_KEY below) since 23 Sep 2026 — without that, a browser that has
// sat both TEST4 and GEN01 would surface one exam's saved answers/partIdx inside the other's
// question shape.
const LS_KEY_BASE = 'somerset-cbt-session-v3'
interface Extras {
  flags: Record<string, boolean>
  notes: string
  highlights: Record<string, [number, number][]>   // per text-fragment: char [start,end] ranges
  audioIdx?: number                                // listening: index of the recording in progress
}
const emptyExtras = (): Extras => ({ flags: {}, notes: '', highlights: {}, audioIdx: 0 })
function normalizeExtras(x: unknown): Extras {
  const e = (x || {}) as Partial<Extras>
  return {
    flags: (e.flags && typeof e.flags === 'object') ? e.flags : {},
    notes: typeof e.notes === 'string' ? e.notes : '',
    highlights: (e.highlights && typeof e.highlights === 'object') ? e.highlights : {},
    audioIdx: typeof e.audioIdx === 'number' ? e.audioIdx : 0,
  }
}

// One entry per recording in the listening paper, in exam order. preSec is the reading
// time the real exam gives before the recording starts; plays=2 mirrors "you will hear
// each recording twice" (instruction tracks play once).
interface AudioItem { file: string; partIdx: number; label: string; plays: 1 | 2; preSec: number }
interface SavedSession {
  code: string | null
  name: string
  paper: PaperId
  partIdx: number
  answers: Record<string, string>
  task2Choice: number
  secondsLeft: number
  extras: Extras
  startedAt: string
}

export default function CbtPage() {
  return (
    <Suspense fallback={null}>
      <CbtPageInner />
    </Suspense>
  )
}

function CbtPageInner() {
  const searchParams = useSearchParams()
  const examEntry = EXAM_REGISTRY[searchParams.get('exam') || DEFAULT_EXAM_ID] || EXAM_REGISTRY[DEFAULT_EXAM_ID]
  const EXAM = examEntry.data
  const audioFolder = examEntry.audioFolder
  const LS_KEY = `${LS_KEY_BASE}-${EXAM.id}`

  const [screen, setScreen] = useState<'welcome' | 'exam' | 'done'>('welcome')
  const [name, setName] = useState('')
  const [paper, setPaper] = useState<PaperId | null>(null)
  const [partIdx, setPartIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [task2Choice, setTask2Choice] = useState(2)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [resumable, setResumable] = useState<SavedSession | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resumeCode, setResumeCode] = useState<string | null>(null)
  const [resumeInput, setResumeInput] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [resumeBusy, setResumeBusy] = useState(false)

  // Study aids
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState('')
  const [highlights, setHighlights] = useState<Record<string, [number, number][]>>({})

  // Display settings
  const [contrast, setContrast] = useState<Contrast>('normal')
  const [textScale, setTextScale] = useState(1)
  const [timerHidden, setTimerHidden] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  // Exam chrome: live connection state (real — autosave depends on it)
  const [online, setOnline] = useState(true)

  // Selection menu (highlight / note), passage split, active question
  const [selMenu, setSelMenu] = useState<{ x: number; y: number; frag: string; start: number; end: number } | null>(null)
  const [splitPct, setSplitPct] = useState(52)
  const [pendingOption, setPendingOption] = useState<string | null>(null)   // Part 6 click-to-place
  const [activeQ, setActiveQ] = useState<string | null>(null)               // square around the current question

  // ── Listening sequencer (exam-realistic: audio runs itself, volume is the only control) ──
  const [aStage, setAStage] = useState<'idle' | 'run' | 'done'>('idle')
  const [aIdx, setAIdx] = useState(0)
  const [aPass, setAPass] = useState(1)
  const [aMsg, setAMsg] = useState('')
  const [aPrepUntil, setAPrepUntil] = useState<number | null>(null)   // reading-time countdown target
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)
  const aIdxRef = useRef(0)
  const aPassRef = useRef(1)
  const aTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const volumeRef = useRef(1)
  const audioQueueRef = useRef<AudioItem[]>([])

  const startedAt = useRef<string>('')
  const submitted = useRef(false)
  const submitRef = useRef<(auto?: boolean) => Promise<void>>(async () => {})
  const secondsLeftRef = useRef(0)
  const resumeCodeRef = useRef<string | null>(null)
  const saveDraftRef = useRef<() => Promise<void>>(async () => {})
  const paneRowRef = useRef<HTMLDivElement>(null)

  const C = PALETTES[contrast]
  const extras: Extras = useMemo(() => ({ flags, notes, highlights, audioIdx: aIdx }), [flags, notes, highlights, aIdx])

  const parts: (CbtReadingPart | CbtListeningPart)[] = useMemo(() => {
    if (paper === 'reading-uoe') return EXAM.readingParts
    if (paper === 'listening') return EXAM.listeningParts
    return []
  }, [paper])

  // Exam-order playlist. Part 1 has spoken instructions (once) then one recording per
  // question (each twice); Parts 2–4 have a continuous recording per part (twice).
  const audioQueue: AudioItem[] = useMemo(() => {
    if (paper !== 'listening') return []
    const items: AudioItem[] = []
    parts.forEach((p, pi) => {
      const rp = p as CbtReadingPart
      const lp = p as CbtListeningPart
      const perQ = !!rp.mcqs?.some(m => m.audio)
      if (perQ) {
        // Part 1: instructions once, then "You now have 45 seconds to look at Part One"
        // before the first extract; ~3s between extracts thereafter.
        lp.audio?.forEach(f => items.push({ file: f, partIdx: pi, label: `${p.title} — instrucciones`, plays: 1, preSec: 6 }))
        let first = true
        rp.mcqs!.forEach(m => {
          if (m.audio) { items.push({ file: m.audio, partIdx: pi, label: `${p.title} — Pregunta ${m.q}`, plays: 2, preSec: first ? 45 : 3 }); first = false }
        })
      } else {
        // Parts 2–4: 45 seconds to look through the part before its recording starts.
        (lp.audio || []).forEach((f, fi) => items.push({ file: f, partIdx: pi, label: p.title, plays: 2, preSec: fi === 0 ? 45 : 4 }))
      }
    })
    return items
  }, [paper, parts])
  audioQueueRef.current = audioQueue

  // The state machine: reading pause → play → 4s gap → play again → next recording.
  // Driven by the <audio> element's `ended` event plus timeouts; refs avoid stale closures.
  function scheduleA(delayMs: number, fn: () => void) {
    if (aTimer.current) clearTimeout(aTimer.current)
    aTimer.current = setTimeout(fn, delayMs)
  }
  function playCurrentA() {
    const a = audioRef.current
    const item = audioQueueRef.current[aIdxRef.current]
    if (!a || !item) { setAStage('done'); setAMsg(''); return }
    a.src = `/cbt-audio/${audioFolder}/${item.file}`
    a.volume = volumeRef.current
    setAMsg('')
    setAPrepUntil(null)
    void a.play().catch(() => {
      // Browser blocked the play (user activation expired) — fall back to a resume button.
      setAStage('idle')
      setAMsg('Pulsa ▶ para continuar la reproducción')
    })
  }
  function beginItemA(idx: number) {
    aIdxRef.current = idx
    setAIdx(idx)
    aPassRef.current = 1
    setAPass(1)
    const item = audioQueueRef.current[idx]
    if (!item) { setAStage('done'); setAMsg(''); setAPrepUntil(null); return }
    setAMsg(`Prepárate — ${item.label}`)
    setAPrepUntil(Date.now() + item.preSec * 1000)
    scheduleA(item.preSec * 1000, playCurrentA)
  }
  function handleAudioEnded() {
    const item = audioQueueRef.current[aIdxRef.current]
    if (!item) { setAStage('done'); return }
    if (item.plays === 2 && aPassRef.current === 1) {
      aPassRef.current = 2
      setAPass(2)
      setAMsg('Segunda reproducción en unos segundos…')
      scheduleA(4000, playCurrentA)
    } else {
      beginItemA(aIdxRef.current + 1)
    }
  }
  function startListeningA() {
    setAStage('run')
    beginItemA(aIdxRef.current)
  }
  // Kill any pending audio work on unmount.
  useEffect(() => () => { if (aTimer.current) clearTimeout(aTimer.current); audioRef.current?.pause() }, [])

  // ── Connection indicator ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    setOnline(navigator.onLine)
    const up = () => setOnline(true), down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  // ── Timer ── absolute end time, so a reload can't hand back free time.
  useEffect(() => {
    if (screen !== 'exam' || !paper || endsAt == null) return
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000))
      setSecondsLeft(left)
      secondsLeftRef.current = left
      if (left <= 0) { clearInterval(iv); void submitRef.current(true) }
    }
    const iv = setInterval(tick, 1000)
    tick()
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, paper, endsAt])

  // Restore an unfinished session on load from the same-browser copy.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      const s = JSON.parse(raw) as SavedSession
      if (s && typeof s.secondsLeft === 'number' && s.secondsLeft > 0 && s.name) setResumable(s)
      else localStorage.removeItem(LS_KEY)
    } catch { /* ignore corrupt/blocked storage */ }
  }, [])

  // Local autosave: instant, free, same-browser fallback.
  useEffect(() => {
    if (screen !== 'exam' || !paper) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        code: resumeCodeRef.current, name, paper, partIdx, answers, task2Choice,
        secondsLeft: secondsLeftRef.current, extras, startedAt: startedAt.current,
      }))
    } catch { /* storage full or blocked — the exam still runs from memory */ }
  }, [screen, paper, partIdx, answers, task2Choice, name, extras])

  // Server autosave: debounced + 15s heartbeat, for cross-device resume.
  async function saveDraft() {
    if (screen !== 'exam' || !paper || !name.trim()) return
    try {
      const res = await fetch('/api/cbt/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: resumeCodeRef.current, examId: EXAM.id, studentName: name, paper,
          partIdx, answers, task2Choice, secondsLeft: secondsLeftRef.current, extras, startedAt: startedAt.current,
        }),
      })
      if (!res.ok) return
      const d = await res.json() as { code?: string }
      if (d.code && d.code !== resumeCodeRef.current) { resumeCodeRef.current = d.code; setResumeCode(d.code) }
    } catch { /* offline or server down — localStorage still holds the session */ }
  }
  saveDraftRef.current = saveDraft

  useEffect(() => {
    if (screen !== 'exam' || !paper) return
    const t = setTimeout(() => { void saveDraftRef.current() }, 1500)
    return () => clearTimeout(t)
  }, [screen, paper, partIdx, answers, task2Choice, name, extras])

  useEffect(() => {
    if (screen !== 'exam' || !paper) return
    const iv = setInterval(() => { void saveDraftRef.current() }, 15000)
    return () => clearInterval(iv)
  }, [screen, paper])

  function startPaper(p: PaperId) {
    const totalSec = EXAM.papers[p].durationMin * 60
    setPaper(p)
    setPartIdx(0)
    setAnswers({})
    setTask2Choice(2)
    setFlags({}); setNotes(''); setHighlights({})
    setAStage('idle'); setAIdx(0); aIdxRef.current = 0; setAPass(1); aPassRef.current = 1; setAMsg(''); setAPrepUntil(null)
    setEndsAt(Date.now() + totalSec * 1000)
    setSecondsLeft(totalSec)
    secondsLeftRef.current = totalSec
    resumeCodeRef.current = null
    setResumeCode(null)
    startedAt.current = new Date().toISOString()
    submitted.current = false
    setScreen('exam')
  }

  function resumeSession(s: SavedSession) {
    const secs = Math.max(0, Math.round(s.secondsLeft || 0))
    const ex = normalizeExtras(s.extras)
    setName(s.name)
    setPaper(s.paper)
    setPartIdx(s.partIdx || 0)
    setAnswers(s.answers || {})
    setTask2Choice(s.task2Choice || 2)
    setFlags(ex.flags); setNotes(ex.notes); setHighlights(ex.highlights)
    // Listening: pick the audio back up at the start of the recording that was playing.
    const ai = Math.max(0, ex.audioIdx || 0)
    setAStage('idle'); setAIdx(ai); aIdxRef.current = ai; setAPass(1); aPassRef.current = 1; setAMsg(''); setAPrepUntil(null)
    setEndsAt(Date.now() + secs * 1000)
    setSecondsLeft(secs)
    secondsLeftRef.current = secs
    resumeCodeRef.current = s.code || null
    setResumeCode(s.code || null)
    startedAt.current = s.startedAt || new Date().toISOString()
    submitted.current = false
    setResumable(null)
    setScreen('exam')
  }

  async function resumeByCode() {
    const code = resumeInput.trim().toUpperCase()
    if (!code) return
    setResumeBusy(true)
    setResumeError('')
    try {
      const res = await fetch(`/api/cbt/draft?code=${encodeURIComponent(code)}`)
      const d = await res.json() as { draft?: {
        code: string; examId: string; studentName: string; paper: PaperId; partIdx: number
        answers: Record<string, string>; task2Choice: number; secondsLeft: number; extras: unknown; startedAt: string | null
      } | null }
      if (!res.ok || !d.draft) { setResumeError('No encontramos un examen con ese código.'); return }
      if (d.draft.examId !== EXAM.id) { setResumeError('Ese código pertenece a otro examen.'); return }
      resumeSession({
        code: d.draft.code, name: d.draft.studentName, paper: d.draft.paper, partIdx: d.draft.partIdx,
        answers: d.draft.answers, task2Choice: d.draft.task2Choice, secondsLeft: d.draft.secondsLeft,
        extras: normalizeExtras(d.draft.extras), startedAt: d.draft.startedAt || '',
      })
    } catch {
      setResumeError('No se pudo conectar. Inténtalo otra vez.')
    } finally {
      setResumeBusy(false)
    }
  }

  function discardSaved() {
    try { localStorage.removeItem(LS_KEY) } catch { /* ignore */ }
    setResumable(null)
  }

  const setAns = (key: string, value: string) => setAnswers(a => ({ ...a, [key]: value }))

  async function submit(auto = false) {
    if (submitted.current) return
    submitted.current = true
    setSubmitting(true)
    setError('')
    try {
      const payload: Record<string, string> = { ...answers }
      if (paper === 'writing') payload['task2#choice'] = String(task2Choice)
      const res = await fetch('/api/cbt/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: EXAM.id, studentName: name, paper, answers: payload, startedAt: startedAt.current }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Submit failed')
      if (resumeCodeRef.current) {
        try { await fetch(`/api/cbt/draft?code=${encodeURIComponent(resumeCodeRef.current)}`, { method: 'DELETE' }) } catch { /* best effort */ }
      }
      try { localStorage.removeItem(LS_KEY) } catch { /* ignore */ }
      setScreen('done')
    } catch (err) {
      submitted.current = false
      setError((err instanceof Error ? err.message : 'Could not submit.') + (auto ? ' (time expired — press Submit to retry)' : ''))
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }
  submitRef.current = submit

  // ── Flags ──
  const flagged = (key: string) => !!flags[key]
  const toggleFlag = (key: string) => setFlags(f => ({ ...f, [key]: !f[key] }))
  const flagBtn = (key: string) => (
    <button className="cbt-flag" onClick={() => toggleFlag(key)} title="Marcar para revisar" style={{
      border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1,
      color: flagged(key) ? C.warn : C.grey, opacity: flagged(key) ? 1 : 0.4, padding: 2, marginLeft: 6,
    }}>⚑</button>
  )
  const jumpTo = (key: string) => {
    setActiveQ(key)
    const el = typeof document !== 'undefined' ? document.getElementById(qDomId(key)) : null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Cambridge-style question-number square, shown at the start of each question.
  const qSquare = (q: number) => (
    <span style={{
      display: 'inline-flex', minWidth: 27, height: 27, padding: '0 4px', marginRight: 10, flexShrink: 0,
      alignItems: 'center', justifyContent: 'center', borderRadius: 4,
      background: C.header, color: C.headerText, fontWeight: 700, fontSize: 13.5,
    }}>{q}</span>
  )

  // ── Highlighting ──
  function fragOffsets(container: HTMLElement): { start: number; end: number } | null {
    const sel = typeof window !== 'undefined' ? window.getSelection() : null
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null
    const range = sel.getRangeAt(0)
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null
    const pre = document.createRange()
    pre.selectNodeContents(container)
    pre.setEnd(range.startContainer, range.startOffset)
    const start = pre.toString().length
    const end = start + range.toString().length
    return end > start ? { start, end } : null
  }
  function onFragMouseUp(frag: string, e: React.MouseEvent<HTMLElement>) {
    const off = fragOffsets(e.currentTarget)
    if (!off) { setSelMenu(null); return }
    setSelMenu({ x: e.clientX, y: e.clientY, frag, start: off.start, end: off.end })
  }
  function addHighlight(frag: string, start: number, end: number) {
    setHighlights(h => {
      const list = [...(h[frag] || []), [start, end] as [number, number]].sort((a, b) => a[0] - b[0])
      const merged: [number, number][] = []
      for (const r of list) {
        const last = merged[merged.length - 1]
        if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
        else merged.push([r[0], r[1]])
      }
      return { ...h, [frag]: merged }
    })
  }
  function removeHighlightAt(frag: string, pos: number) {
    setHighlights(h => {
      const list = (h[frag] || []).filter(([s, e]) => !(pos >= s && pos < e))
      const next = { ...h }
      if (list.length) next[frag] = list; else delete next[frag]
      return next
    })
  }
  function clearSelection() {
    try { window.getSelection()?.removeAllRanges() } catch { /* ignore */ }
    setSelMenu(null)
  }
  function renderFrag(text: string, frag: string) {
    const ranges = (highlights[frag] || []).slice().sort((a, b) => a[0] - b[0])
    if (!ranges.length) return text
    const out: React.ReactNode[] = []
    let i = 0
    ranges.forEach(([s, e], k) => {
      const s2 = Math.max(s, i), e2 = Math.min(e, text.length)
      if (s2 > i) out.push(<span key={`t${k}`}>{text.slice(i, s2)}</span>)
      if (e2 > s2) out.push(
        <mark key={`h${k}`} onClick={() => removeHighlightAt(frag, s2)} title="Quitar resaltado"
          style={{ background: C.hl, color: 'inherit', cursor: 'pointer', borderRadius: 2 }}>{text.slice(s2, e2)}</mark>
      )
      i = Math.max(i, e2)
    })
    if (i < text.length) out.push(<span key="tail">{text.slice(i)}</span>)
    return out
  }

  // ── Passage divider drag ──
  function startDividerDrag(e: React.MouseEvent) {
    e.preventDefault()
    const move = (ev: MouseEvent) => {
      const el = paneRowRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const pct = Math.max(30, Math.min(75, ((ev.clientX - r.left) / r.width) * 100))
      setSplitPct(pct)
    }
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  // ── Objective-question helpers ──
  function letterButtons(partId: string, q: number, options: { letter: string; text: string }[], compact = false) {
    const key = `${partId}#${q}`
    return (
      <div style={{ display: 'flex', flexDirection: compact ? 'row' : 'column', gap: compact ? 6 : 8, flexWrap: 'wrap' }}>
        {options.map(o => {
          const sel = answers[key] === o.letter
          return (
            <button key={o.letter} className="cbt-opt" onClick={() => { setActiveQ(key); setAns(key, sel ? '' : o.letter) }} style={{
              display: 'flex', alignItems: compact ? 'center' : 'flex-start', gap: 10, textAlign: 'left',
              padding: compact ? '8px 12px' : '10px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: sans,
              fontSize: 14.5, lineHeight: 1.5, width: compact ? undefined : '100%',
              border: `1.5px solid ${sel ? C.accent : C.line}`,
              background: sel ? C.sel : C.card, color: C.ink,
              boxShadow: sel ? 'none' : '0 1px 2px rgba(16,24,40,0.04)',
            }}>
              <span style={{
                minWidth: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, border: `1.5px solid ${sel ? C.accent : C.grey}`,
                background: sel ? C.accent : C.card, color: sel ? C.onAccent : C.grey, flexShrink: 0,
                transition: 'background 0.12s ease',
              }}>{o.letter}</span>
              {o.text && <span style={{ paddingTop: compact ? 0 : 3 }}>{o.text}</span>}
            </button>
          )
        })}
      </div>
    )
  }

  const textInput = (key: string, width = 260, placeholder = 'Type your answer') => (
    <input
      value={answers[key] || ''}
      onFocus={() => setActiveQ(key)}
      onChange={e => setAns(key, e.target.value)}
      placeholder={placeholder}
      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
      className="cbt-input"
      style={{
        width, padding: '9px 12px', fontSize: 14.5, fontFamily: sans, color: C.ink,
        border: `1.5px solid ${(answers[key] || '').trim() ? C.accent : C.line}`, borderRadius: 6, outline: 'none', background: C.card,
      }}
    />
  )

  // ── Per-part question numbers (for the bottom navigator) ──
  function partQuestionKeys(p: CbtReadingPart | CbtListeningPart): { q: number; key: string }[] {
    const rp = p as CbtReadingPart
    const lp = p as CbtListeningPart
    const qs: { q: number; key: string }[] = []
    rp.mcqs?.forEach(m => qs.push({ q: m.q, key: `${p.part}#${m.q}` }))
    rp.openGaps?.forEach(q => qs.push({ q, key: `${p.part}#${q}` }))
    if (rp.gapOptions) P6_GAPS.forEach(q => qs.push({ q, key: `${p.part}#${q}` }))
    rp.transformations?.forEach(t => qs.push({ q: t.q, key: `${p.part}#${t.q}` }))
    rp.matchQuestions?.forEach(m => qs.push({ q: m.q, key: `${p.part}#${m.q}` }))
    lp.sentences?.forEach(s => qs.push({ q: s.q, key: `${p.part}#${s.q}` }))
    lp.speakers?.forEach(s => qs.push({ q: s.q, key: `${p.part}#${s.q}` }))
    return qs.sort((a, b) => a.q - b.q)
  }

  const answeredCount = (keys: { key: string }[]) => keys.filter(k => (answers[k.key] || '').trim()).length

  // Global hover/focus polish — inline styles can't express :hover, so one small stylesheet.
  const styleTag = (
    <style>{`
      .cbt-opt { transition: border-color 0.12s ease, background 0.12s ease, box-shadow 0.12s ease, transform 0.06s ease; }
      .cbt-opt:hover { border-color: ${C.accent} !important; box-shadow: 0 2px 8px rgba(16,24,40,0.10) !important; }
      .cbt-opt:active { transform: scale(0.995); }
      .cbt-input { transition: border-color 0.12s ease, box-shadow 0.12s ease; }
      .cbt-input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.sel}; }
      .cbt-flag { transition: opacity 0.12s ease, transform 0.1s ease; }
      .cbt-flag:hover { opacity: 1 !important; transform: scale(1.15); }
      .cbt-nav { transition: border-color 0.12s ease, background 0.12s ease, transform 0.06s ease; }
      .cbt-nav:hover { border-color: ${C.accent} !important; }
      .cbt-nav:active { transform: scale(0.94); }
      .cbt-chrome { transition: background 0.12s ease; }
      .cbt-chrome:hover { background: rgba(255,255,255,0.22) !important; }
      .cbt-go { transition: transform 0.08s ease, filter 0.12s ease; }
      .cbt-go:hover { filter: brightness(1.1); }
      .cbt-go:active { transform: scale(0.94); }
      .cbt-card { transition: box-shadow 0.15s ease, border-color 0.12s ease; }
      .cbt-card:hover { box-shadow: 0 4px 16px rgba(16,24,40,0.10); border-color: ${C.accent} !important; }
      ::selection { background: ${C.sel}; }

      /* Somerset teaching-deck skin — welcome/done screens only (not the timed exam UI). */
      .som-input { transition: border-color 0.12s ease, box-shadow 0.12s ease; }
      .som-input:focus { border-color: #6BAE2E !important; box-shadow: 0 0 0 3px #EAF4DA; }
      .som-paper-btn { transition: border-color 0.12s ease, box-shadow 0.12s ease, transform 0.06s ease; }
      .som-paper-btn:hover:not(:disabled) { border-color: #6BAE2E !important; box-shadow: 0 4px 14px rgba(107,174,46,0.16); }
      .som-paper-btn:active:not(:disabled) { transform: scale(0.995); }
      .som-btn-solid { transition: filter 0.12s ease, transform 0.06s ease; }
      .som-btn-solid:hover { filter: brightness(1.08); }
      .som-btn-solid:active { transform: scale(0.96); }
    `}</style>
  )

  // ════════════════════════ SCREENS ════════════════════════

  // Somerset teaching-deck header — welcome/done screens only. The CSS-text wordmark
  // (never a data-URI <img>, per reference_somerset_logo) mirrors the canonical HTML
  // teaching-deck template used for PET/First class slides: white bg, 4px green
  // bottom border, "Somerset" bold green + tracked dark-green "LANGUAGE CENTRE".
  const somerHeader = (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '18px clamp(20px,4vw,56px)', borderBottom: '4px solid #6BAE2E', background: '#fff', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <span style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 800, fontSize: 26, letterSpacing: '-1px', lineHeight: 0.9, color: '#6BAE2E' }}>Somerset</span>
        <span style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: '2.2px', lineHeight: 1.15, paddingBottom: 3, color: '#4d8120' }}>LANGUAGE<br />CENTRE</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#777' }}>Computer-Based Exam</div>
    </header>
  )

  if (screen === 'welcome') {
    return (
      <div style={{ minHeight: '100vh', background: '#F2F7EC', fontFamily: sans, color: '#1a1a1a' }}>
        {styleTag}
        {somerHeader}
        <main style={{ maxWidth: 620, margin: '0 auto', padding: '44px 20px' }}>
          {resumable && (
            <div style={{ background: '#FDF3E7', border: '1.5px solid #E08A1E', borderRadius: 14, padding: '18px 22px', marginBottom: 18 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>Hay un examen sin terminar en este ordenador</div>
              <div style={{ fontSize: 13.5, color: '#7a5a20', marginBottom: 14 }}>
                {resumable.name} — {EXAM.papers[resumable.paper].name} · quedan {fmtTime(Math.max(0, Math.round(resumable.secondsLeft)))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => resumeSession(resumable)} className="som-btn-solid" style={{ padding: '10px 22px', borderRadius: 999, border: 'none', background: '#6BAE2E', color: '#fff', fontFamily: sans, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Continuar</button>
                <button onClick={discardSaved} style={{ padding: '10px 18px', borderRadius: 999, border: '1.5px solid #C9CFD6', background: '#fff', color: '#1a1a1a', fontFamily: sans, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Empezar de nuevo</button>
              </div>
            </div>
          )}
          <div className="cbt-card" style={{ background: '#fff', border: '2px solid #6BAE2E', borderRadius: 16, padding: '36px 40px', boxShadow: '0 2px 20px rgba(107,174,46,0.10)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6BAE2E', marginBottom: 8 }}>Cambridge English · B2 First</div>
            <h1 style={{ fontSize: 25, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em', color: '#1a1a1a' }}>{EXAM.title}</h1>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 26, lineHeight: 1.6 }}>
              Enter your name, then choose the paper your teacher has told you to do. The timer starts as soon as you open the paper.
            </p>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Your name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="First name and surname" className="som-input"
              style={{ width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: sans, border: '1.5px solid #D8E4C8', borderRadius: 10, marginBottom: 26, background: '#fff', color: '#1a1a1a', outline: 'none' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(Object.entries(EXAM.papers) as [PaperId, { name: string; durationMin: number }][]).map(([id, p]) => (
                <button key={id} disabled={!name.trim()} onClick={() => startPaper(id)} className={name.trim() ? 'som-paper-btn' : undefined} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px',
                  borderRadius: 10, border: '1.5px solid #D8E4C8', background: name.trim() ? '#fff' : '#F2F7EC',
                  cursor: name.trim() ? 'pointer' : 'not-allowed', fontFamily: sans, fontSize: 15.5, fontWeight: 600, color: '#1a1a1a',
                }}>
                  <span>{p.name}</span>
                  <span style={{ fontSize: 13, color: '#6BAE2E', fontWeight: 700 }}>{p.durationMin} min</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cross-device resume: type the code shown when the exam was started. */}
          <div className="cbt-card" style={{ background: '#fff', border: '2px solid #6BAE2E', borderRadius: 16, padding: '22px 26px', marginTop: 18, boxShadow: '0 2px 20px rgba(107,174,46,0.10)' }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>¿Ya empezaste un examen?</div>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              Escribe el código que se te dio para continuar desde donde lo dejaste — en este o en otro ordenador.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                value={resumeInput}
                onChange={e => setResumeInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') void resumeByCode() }}
                placeholder="Ej. 4F2KP"
                autoComplete="off" autoCapitalize="characters" spellCheck={false} className="som-input"
                style={{ flex: 1, minWidth: 160, padding: '11px 14px', fontSize: 15, letterSpacing: '0.14em', fontWeight: 700, fontFamily: sans, textTransform: 'uppercase', border: '1.5px solid #D8E4C8', borderRadius: 10, color: '#1a1a1a', background: '#fff', outline: 'none' }}
              />
              <button disabled={!resumeInput.trim() || resumeBusy} onClick={() => void resumeByCode()} className="som-btn-solid" style={{
                padding: '11px 24px', borderRadius: 999, border: 'none',
                background: resumeInput.trim() ? '#6BAE2E' : '#EEF0F3', color: resumeInput.trim() ? '#fff' : '#999',
                fontFamily: sans, fontSize: 14, fontWeight: 700, cursor: resumeInput.trim() ? 'pointer' : 'not-allowed',
              }}>{resumeBusy ? 'Buscando…' : 'Continuar'}</button>
            </div>
            {resumeError && <div style={{ fontSize: 13, color: '#C0392B', fontWeight: 600, marginTop: 10 }}>{resumeError}</div>}
          </div>
        </main>
      </div>
    )
  }

  if (screen === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: '#F2F7EC', fontFamily: sans, display: 'flex', flexDirection: 'column' }}>
        {styleTag}
        {somerHeader}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="cbt-card" style={{ background: '#fff', border: '2px solid #6BAE2E', borderRadius: 16, padding: '52px 60px', textAlign: 'center', boxShadow: '0 2px 24px rgba(107,174,46,0.12)' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto', borderRadius: '50%', background: '#6BAE2E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✓</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '18px 0 8px', color: '#1a1a1a' }}>Answers submitted</h1>
            <p style={{ fontSize: 14.5, color: '#666' }}>Thank you, {name}. Your teacher has received your answers.</p>
            <button onClick={() => { setScreen('welcome'); setPaper(null) }} className="som-btn-solid" style={{
              marginTop: 26, padding: '11px 28px', borderRadius: 999, border: 'none', background: '#6BAE2E',
              color: '#fff', fontFamily: sans, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>Back to start</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Exam screen ──
  const paperMeta = paper ? EXAM.papers[paper] : null
  const low = secondsLeft < 300
  const veryLow = secondsLeft < 60
  const timerText = secondsLeft >= 300 ? `${Math.ceil(secondsLeft / 60)} min` : fmtTime(secondsLeft)
  const navKeys = paper !== 'writing' && parts[partIdx] ? partQuestionKeys(parts[partIdx]) : []
  const flaggedInPart = navKeys.filter(k => flagged(k.key))

  const chromeBtn = (label: string, title: string, onClick: () => void, active = false) => (
    <button className="cbt-chrome" onClick={onClick} title={title} style={{
      background: active ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.10)', color: C.headerText,
      border: 'none', borderRadius: 6, width: 34, height: 32, cursor: 'pointer', fontSize: 15, fontFamily: sans, lineHeight: 1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', height: '100vh', background: C.bg, fontFamily: sans, color: C.ink, display: 'flex', flexDirection: 'column' }}>
      {styleTag}
      {/* ── Exam header: title left · status chrome right (like the real digital exam) ── */}
      <header style={{ background: C.header, color: C.headerText, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6, whiteSpace: 'nowrap' }}>Somerset</div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.25)' }} />
          <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{EXAM.title} — {paperMeta?.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 13, opacity: 0.85, marginRight: 4, whiteSpace: 'nowrap' }}>{name}</span>

          {/* Connection dot — real: green when online, red when the network drops */}
          <span title={online ? 'Conectado — tus respuestas se están guardando' : 'Sin conexión — se guardan en este ordenador'} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.10)', borderRadius: 6, height: 32, padding: '0 10px', fontSize: 12,
          }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: online ? '#3DDC84' : '#FF5252', boxShadow: online ? '0 0 6px rgba(61,220,132,0.8)' : '0 0 6px rgba(255,82,82,0.8)' }} />
            <span style={{ opacity: 0.8 }}>{online ? '' : 'offline'}</span>
          </span>

          {/* Invigilator messages bell */}
          {chromeBtn('🔔', 'Mensajes del profesor', () => { setBellOpen(o => !o); setSettingsOpen(false) }, bellOpen)}
          {chromeBtn('✎', 'Notas y resaltados', () => setNotesOpen(o => !o), notesOpen)}
          {chromeBtn('☰', 'Ajustes de pantalla', () => { setSettingsOpen(o => !o); setBellOpen(false) }, settingsOpen)}

          {!timerHidden && (
            <span style={{
              fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums', padding: '0 14px', height: 32, display: 'inline-flex', alignItems: 'center', borderRadius: 6,
              background: veryLow ? C.warn : low ? '#E0A800' : 'rgba(255,255,255,0.12)', color: (veryLow || low) ? '#fff' : C.headerText,
              transition: 'background 0.3s ease',
            }}>⏱ {timerText}</span>
          )}
          {timerHidden && chromeBtn('⏱', 'Mostrar temporizador', () => setTimerHidden(false))}

          <button onClick={() => setConfirmOpen(true)} disabled={submitting} title="Entregar el examen" style={{
            padding: '0 18px', height: 32, borderRadius: 6, border: 'none', background: C.go, color: '#fff',
            fontFamily: sans, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          }} className="cbt-go">{submitting ? 'Enviando…' : '✓ Submit'}</button>
        </div>
      </header>

      {/* Bell dropdown */}
      {bellOpen && (
        <div style={{ position: 'absolute', top: 50, right: 150, zIndex: 60, background: C.panel, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.25)', padding: '16px 18px', width: 240, fontFamily: sans }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.grey, marginBottom: 8 }}>Mensajes del profesor</div>
          <div style={{ fontSize: 13.5, color: C.grey, fontStyle: 'italic' }}>No hay mensajes.</div>
        </div>
      )}

      {/* Settings panel */}
      {settingsOpen && (
        <div style={{ position: 'absolute', top: 50, right: 12, zIndex: 60, background: C.panel, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.25)', padding: '16px 18px', width: 250, fontFamily: sans }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.grey, marginBottom: 6 }}>Contraste</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {([['normal', 'Aa', '#fff', '#1A1A1A'], ['wob', 'Aa', '#000', '#fff'], ['yob', 'Aa', '#000', '#FFD400']] as [Contrast, string, string, string][]).map(([mode, t, bg, fg]) => (
              <button key={mode} onClick={() => setContrast(mode)} style={{
                flex: 1, padding: '8px 0', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                border: `2px solid ${contrast === mode ? C.accent : C.line}`, background: bg, color: fg,
              }}>{t}</button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.grey, marginBottom: 6 }}>Tamaño del texto</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {([['A', 1], ['A+', 1.15], ['A++', 1.35]] as [string, number][]).map(([t, s]) => (
              <button key={t} onClick={() => setTextScale(s)} style={{
                flex: 1, padding: '8px 0', borderRadius: 6, cursor: 'pointer', fontWeight: 700,
                border: `2px solid ${textScale === s ? C.accent : C.line}`, background: textScale === s ? C.sel : C.card, color: C.ink,
              }}>{t}</button>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, cursor: 'pointer' }}>
            <input type="checkbox" checked={timerHidden} onChange={e => setTimerHidden(e.target.checked)} />
            Ocultar el temporizador
          </label>
        </div>
      )}

      {/* Resume-code bar */}
      {resumeCode && (
        <div style={{ background: contrast === 'normal' ? '#EAF4DA' : C.panel, borderBottom: `1px solid ${C.line}`, padding: '6px 20px', fontSize: 12.5, color: contrast === 'normal' ? '#3D5A1E' : C.ink, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          <span>Se guarda solo. Si se apaga el ordenador, continúa con el código</span>
          <strong style={{ fontSize: 14, letterSpacing: '0.16em', color: C.accent }}>{resumeCode}</strong>
        </div>
      )}

      {/* Part tabs */}
      {paper !== 'writing' && (
        <nav style={{ background: C.panel, borderBottom: `1px solid ${C.line}`, padding: '0 16px', display: 'flex', gap: 4, overflowX: 'auto', flexShrink: 0 }}>
          {parts.map((p, i) => {
            const keys = partQuestionKeys(p)
            const done = answeredCount(keys)
            const complete = done === keys.length && keys.length > 0
            return (
              <button key={p.part} onClick={() => setPartIdx(i)} style={{
                padding: '11px 16px', border: 'none', borderBottom: `3px solid ${i === partIdx ? C.accent : 'transparent'}`,
                background: 'none', fontFamily: sans, fontSize: 13.5, fontWeight: i === partIdx ? 700 : 500,
                color: i === partIdx ? C.accent : C.grey, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.12s ease',
              }}>
                {p.title}{' '}
                <span style={{ fontSize: 11.5, opacity: 0.85, color: complete ? C.go : undefined, fontWeight: complete ? 800 : undefined }}>
                  {complete ? '✓' : `(${done}/${keys.length})`}
                </span>
              </button>
            )
          })}
        </nav>
      )}

      {/* ── Listening control bar — the audio runs itself, like the real exam. Volume only. ── */}
      {paper === 'listening' && (
        <div style={{ background: C.card, borderBottom: `1px solid ${C.line}`, padding: '9px 20px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, flexWrap: 'wrap' }}>
          <audio ref={audioRef} onEnded={handleAudioEnded} preload="auto" style={{ display: 'none' }} />
          {aStage === 'idle' && (
            <>
              <button onClick={startListeningA} className="cbt-go" style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', background: C.go, color: '#fff',
                fontFamily: sans, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              }}>▶ {aIdx > 0 ? 'Continuar la prueba de Listening' : 'Comenzar la prueba de Listening'}</button>
              <span style={{ fontSize: 12.5, color: C.grey }}>
                {aMsg || 'Como en el examen real: cada grabación se reproduce dos veces y no se puede pausar ni rebobinar.'}
              </span>
            </>
          )}
          {aStage === 'run' && (() => {
            const item = audioQueue[aIdx]
            const prepLeft = aPrepUntil ? Math.max(0, Math.ceil((aPrepUntil - Date.now()) / 1000)) : 0
            return (
              <>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: C.ink }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.go, boxShadow: `0 0 6px ${C.go}`, animation: 'none' }} />
                  🎧 {item?.label}
                </span>
                {prepLeft > 0
                  ? <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>Tiempo para leer las preguntas: {prepLeft}s</span>
                  : <span style={{ fontSize: 13, color: C.grey }}>{aMsg || `Reproducción ${aPass} de ${item?.plays ?? 2}`}</span>}
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.grey }}>
                  🔉
                  <input type="range" min={0} max={1} step={0.05} value={volume} aria-label="Volumen"
                    onChange={e => { const v = Number(e.target.value); setVolume(v); volumeRef.current = v; if (audioRef.current) audioRef.current.volume = v }}
                    style={{ width: 120 }} />
                </span>
              </>
            )
          })()}
          {aStage === 'done' && (
            <span style={{ fontSize: 13, color: C.ok, fontWeight: 700 }}>✓ Audio finalizado — usa el tiempo restante para revisar tus respuestas.</span>
          )}
        </div>
      )}

      {error && <div style={{ background: '#FBE9E7', color: '#C0392B', padding: '10px 20px', fontSize: 13.5, fontWeight: 600, flexShrink: 0 }}>{error}</div>}

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', zoom: textScale } as React.CSSProperties}>
        {/* Called as functions, NOT <ObjectivePaper /> — element identity changes every render
            (1s timer tick) would remount the subtree and kill audio playback. */}
        {paper === 'writing' ? WritingPaper() : ObjectivePaper()}

        {/* Notes drawer */}
        {notesOpen && (
          <aside style={{ width: 300, flexShrink: 0, borderLeft: `1px solid ${C.line}`, background: C.panel, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 14 }}>Mis notas</strong>
              <button onClick={() => setNotesOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: C.grey }}>×</button>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Escribe aquí tus notas…"
              style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', padding: '14px 16px', fontSize: 14, fontFamily: sans, lineHeight: 1.6, background: C.panel, color: C.ink }} />
          </aside>
        )}
      </main>

      {/* ── Bottom question navigator — Cambridge style: square per question, black line
            underneath when answered, red flag corner, box around the active question. ── */}
      {paper !== 'writing' && navKeys.length > 0 && (
        <footer style={{ background: C.panel, borderTop: `1px solid ${C.line}`, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, overflowX: 'auto' }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.grey, whiteSpace: 'nowrap' }}>{parts[partIdx]?.title}</span>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>
            {navKeys.map(({ q, key }) => {
              const done = (answers[key] || '').trim().length > 0
              const fl = flagged(key)
              const active = activeQ === key
              return (
                <button key={key} className="cbt-nav" onClick={() => jumpTo(key)} title={fl ? 'Marcada para revisar' : done ? 'Contestada' : 'Sin contestar'} style={{
                  position: 'relative', minWidth: 32, height: 34, borderRadius: 6, cursor: 'pointer', fontFamily: sans, fontSize: 12.5, fontWeight: 700,
                  border: active ? `2px solid ${C.ink}` : `1.5px solid ${fl ? C.warn : C.line}`,
                  background: C.card, color: C.ink, paddingBottom: 6,
                }}>
                  {q}
                  {/* the tutorial's black completion line */}
                  <span style={{ position: 'absolute', left: 5, right: 5, bottom: 4, height: 3, borderRadius: 2, background: done ? C.ink : 'transparent', border: done ? 'none' : `1px dashed ${C.line}` }} />
                  {fl && <span style={{ position: 'absolute', top: -7, right: -4, fontSize: 11, color: C.warn }}>⚑</span>}
                </button>
              )
            })}
          </div>
          {flaggedInPart.length > 0 && (
            <button onClick={() => jumpTo(flaggedInPart[0].key)} style={{ whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700, color: C.warn, background: 'none', border: `1.5px solid ${C.warn}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
              ⚑ {flaggedInPart.length}
            </button>
          )}
          {/* Green navigation arrows, like the real exam */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="cbt-go" disabled={partIdx === 0} onClick={() => setPartIdx(i => i - 1)} title="Parte anterior" style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: partIdx === 0 ? 'default' : 'pointer',
              background: partIdx === 0 ? C.disabled : C.go, color: partIdx === 0 ? C.grey : '#fff', fontSize: 16, fontWeight: 700,
            }}>‹</button>
            {partIdx < parts.length - 1 ? (
              <button className="cbt-go" onClick={() => setPartIdx(i => i + 1)} title="Parte siguiente" style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', background: C.go, color: '#fff', fontSize: 16, fontWeight: 700,
              }}>›</button>
            ) : (
              <button className="cbt-go" onClick={() => setConfirmOpen(true)} title="Entregar" style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', background: C.go, color: '#fff', fontSize: 15, fontWeight: 800,
              }}>✓</button>
            )}
          </div>
        </footer>
      )}

      {/* Selection menu (Nota | Resaltar) */}
      {selMenu && (
        <div style={{ position: 'fixed', left: Math.min(selMenu.x, (typeof window !== 'undefined' ? window.innerWidth : 900) - 170), top: selMenu.y + 8, zIndex: 70, background: C.header, color: C.headerText, borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.35)', display: 'flex', overflow: 'hidden' }}>
          <button onMouseDown={e => e.preventDefault()} onClick={() => { setNotesOpen(true); clearSelection() }}
            style={{ padding: '9px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.headerText }}>Nota</button>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.25)' }} />
          <button onMouseDown={e => e.preventDefault()} onClick={() => { addHighlight(selMenu.frag, selMenu.start, selMenu.end); clearSelection() }}
            style={{ padding: '9px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.headerText }}>Resaltar</button>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,16,26,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: C.panel, color: C.ink, borderRadius: 12, padding: '30px 34px', maxWidth: 420, fontFamily: sans, boxShadow: '0 12px 48px rgba(0,0,0,0.35)' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Submit your answers?</h2>
            <p style={{ fontSize: 14, color: C.grey, marginBottom: 22, lineHeight: 1.6 }}>
              You cannot change anything after submitting.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmOpen(false)} style={{ padding: '9px 18px', borderRadius: 8, border: `1.5px solid ${C.line}`, background: C.card, fontFamily: sans, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: C.ink }}>Keep working</button>
              <button onClick={() => submit()} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: C.go, color: '#fff', fontFamily: sans, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>✓ Submit now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ════════════════════════ PAPER RENDERERS ════════════════════════

  function ObjectivePaper() {
    const p = parts[partIdx]
    if (!p) return null
    const rp = p as CbtReadingPart
    const lp = p as CbtListeningPart
    const hasPassage = !!rp.passage || !!rp.matchTexts

    return (
      <div ref={paneRowRef} style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Passage pane */}
        {hasPassage && (
          <>
            <section style={{ flexBasis: `${splitPct}%`, flexGrow: 0, flexShrink: 0, overflowY: 'auto', background: C.panel, padding: '26px 32px' }}>
              {rp.passageTitle && <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14, letterSpacing: '-0.01em' }}>{rp.passageTitle}</h2>}
              {rp.passage && rp.passage.split('\n\n').map((para, i) => {
                const frag = `${p.part}:p${i}`
                return (
                  <p key={i} data-frag={frag} onMouseUp={e => onFragMouseUp(frag, e)} style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 15 }}>{renderFrag(para, frag)}</p>
                )
              })}
              {rp.matchTexts?.map(t => {
                const frag = `${p.part}:mt${t.letter}`
                return (
                  <div key={t.letter} style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                      <span style={{ display: 'inline-flex', width: 25, height: 25, borderRadius: 4, background: C.header, color: C.headerText, alignItems: 'center', justifyContent: 'center', fontSize: 12.5, marginRight: 8 }}>{t.letter}</span>
                      {t.title}
                    </h3>
                    <p data-frag={frag} onMouseUp={e => onFragMouseUp(frag, e)} style={{ fontSize: 14.5, lineHeight: 1.75 }}>{renderFrag(t.text, frag)}</p>
                  </div>
                )
              })}
            </section>
            {/* Draggable divider + widen toggle */}
            <div onMouseDown={startDividerDrag} title="Arrastra para ensanchar" style={{ width: 9, cursor: 'col-resize', background: C.line, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button onClick={() => setSplitPct(pc => (pc >= 70 ? 52 : 72))} onMouseDown={e => e.stopPropagation()} title="Ensanchar / restaurar" style={{
                position: 'absolute', width: 24, height: 40, borderRadius: 6, border: `1px solid ${C.line}`, background: C.card, color: C.grey, cursor: 'pointer', fontSize: 12, lineHeight: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              }}>⟷</button>
            </div>
          </>
        )}

        {/* Questions pane */}
        <section style={{ flex: '1 1 auto', overflowY: 'auto', padding: '26px 32px' }}>
          {/* Instructions box, like the real exam's top box */}
          <div style={{ background: C.sel, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.accent}`, borderRadius: 6, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>{p.instructions}</p>
          </div>

          {/* MCQs — during listening, a 🎧 marks the question whose recording is playing */}
          {rp.mcqs && rp.mcqs.map(m => {
            const key = `${p.part}#${m.q}`
            const nowPlaying = paper === 'listening' && aStage === 'run' && audioQueue[aIdx]?.file === m.audio
            return (
              <div key={m.q} id={qDomId(key)} onMouseDown={() => setActiveQ(key)} style={{ scrollMarginTop: 16, marginBottom: 24, paddingBottom: m.audio ? 18 : 0, borderBottom: m.audio ? `1px solid ${C.line}` : 'none' }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'flex-start' }}>
                  {qSquare(m.q)}<span style={{ flex: 1, paddingTop: 3 }}>{m.text || ''}</span>
                  {nowPlaying && <span title="Sonando ahora" style={{ fontSize: 14, marginRight: 4 }}>🎧</span>}
                  {flagBtn(key)}
                </div>
                {m.question && <div style={{ fontSize: 14, marginBottom: 8, fontStyle: 'italic' }}>{m.question}</div>}
                {letterButtons(p.part, m.q, m.options)}
              </div>
            )
          })}

          {/* Open cloze / word formation */}
          {rp.openGaps && rp.openGaps.map(q => {
            const key = `${p.part}#${q}`
            return (
              <div key={q} id={qDomId(key)} onMouseDown={() => setActiveQ(key)} style={{ scrollMarginTop: 16, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {qSquare(q)}
                {textInput(key, 240, rp.stems ? `Form of: ${rp.stems[q]}` : 'One word')}
                {rp.stems && <span style={{ fontSize: 13, fontWeight: 700, color: C.grey, letterSpacing: '0.06em' }}>{rp.stems[q]}</span>}
                {flagBtn(key)}
              </div>
            )
          })}

          {/* Key word transformations */}
          {rp.transformations && rp.transformations.map(t => {
            const key = `${p.part}#${t.q}`
            return (
              <div key={t.q} id={qDomId(key)} onMouseDown={() => setActiveQ(key)} style={{ scrollMarginTop: 16, marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 14.5, marginBottom: 8, display: 'flex', alignItems: 'flex-start' }}>
                  {qSquare(t.q)}<span style={{ flex: 1, paddingTop: 3 }}>{t.sentence}</span>{flagBtn(key)}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>{t.keyword}</div>
                <div style={{ fontSize: 14.5, marginBottom: 8, color: C.grey }}>{t.gapped}</div>
                {textInput(key, 340, '2–5 words including the word given')}
              </div>
            )
          })}

          {/* Gapped text (p6) — drag a sentence into each gap, or click an option then a gap. */}
          {rp.gapOptions && gappedText(rp, p.part)}

          {/* Multiple matching (p7) */}
          {rp.matchQuestions && rp.matchQuestions.map(m => {
            const key = `${p.part}#${m.q}`
            return (
              <div key={m.q} id={qDomId(key)} onMouseDown={() => setActiveQ(key)} style={{ scrollMarginTop: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 14.5, marginBottom: 8, display: 'flex', alignItems: 'flex-start' }}>
                  {qSquare(m.q)}<span style={{ flex: 1, paddingTop: 3 }}>Which person {m.text}</span>{flagBtn(key)}
                </div>
                {letterButtons(p.part, m.q, ['A', 'B', 'C', 'D'].map(l => ({ letter: l, text: '' })), true)}
              </div>
            )
          })}

          {/* Listening sentence completion (p2) */}
          {lp.sentences && lp.sentences.map(s => {
            const key = `${p.part}#${s.q}`
            return (
              <div key={s.q} id={qDomId(key)} onMouseDown={() => setActiveQ(key)} style={{ scrollMarginTop: 16, marginBottom: 16, fontSize: 14.5, lineHeight: 2.1 }}>
                {qSquare(s.q)}
                {s.before}{' '}{textInput(key, 220, 'word or short phrase')}{' '}{s.after}{flagBtn(key)}
              </div>
            )
          })}

          {/* Listening multiple matching (p3) */}
          {lp.speakers && (
            <>
              <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 8, padding: '14px 16px', marginBottom: 18, boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}>
                {lp.speakerOptions!.map(o => (
                  <p key={o.letter} style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 6 }}>
                    <strong style={{ marginRight: 6 }}>{o.letter}</strong>{o.text}
                  </p>
                ))}
              </div>
              {lp.speakers.map(s => {
                const key = `${p.part}#${s.q}`
                return (
                  <div key={s.q} id={qDomId(key)} onMouseDown={() => setActiveQ(key)} style={{ scrollMarginTop: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, minWidth: 90, fontSize: 14 }}>{s.label} <span style={{ color: C.grey, fontSize: 12.5 }}>({s.q})</span></span>
                    {letterButtons(p.part, s.q, lp.speakerOptions!.map(o => ({ letter: o.letter, text: '' })), true)}
                    {flagBtn(key)}
                  </div>
                )
              })}
            </>
          )}

          <div style={{ paddingBottom: 30 }} />
        </section>
      </div>
    )
  }

  // Gapped text (Reading Part 6): drag-and-drop, with click-to-place as a touch/fallback path.
  function gappedText(rp: CbtReadingPart, part: string) {
    const options = rp.gapOptions!
    const usedByGap: Record<number, string> = {}
    P6_GAPS.forEach(q => { const v = answers[`${part}#${q}`]; if (v) usedByGap[q] = v })
    const usedLetters = new Set(Object.values(usedByGap))

    const place = (q: number, letter: string) => {
      const next = { ...answers }
      for (const g of P6_GAPS) if (next[`${part}#${g}`] === letter) delete next[`${part}#${g}`]
      next[`${part}#${q}`] = letter
      setAnswers(next)
      setPendingOption(null)
    }
    const clearGap = (q: number) => setAns(`${part}#${q}`, '')

    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Gaps */}
        <div style={{ flex: '1 1 320px' }}>
          {P6_GAPS.map(q => {
            const key = `${part}#${q}`
            const letter = usedByGap[q]
            const opt = options.find(o => o.letter === letter)
            return (
              <div key={q} id={qDomId(key)} onMouseDown={() => setActiveQ(key)} style={{ scrollMarginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ paddingTop: 10 }}>{qSquare(q)}</span>
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const l = e.dataTransfer.getData('text/plain'); if (l) place(q, l) }}
                  onClick={() => { if (pendingOption) place(q, pendingOption); else if (letter) clearGap(q) }}
                  style={{
                    flex: 1, minHeight: 48, borderRadius: 8, padding: '11px 13px', cursor: 'pointer',
                    border: `1.5px ${letter ? 'solid' : 'dashed'} ${letter ? C.accent : (pendingOption ? C.accent : C.line)}`,
                    background: letter ? C.sel : C.card, color: C.ink, fontSize: 13.5, lineHeight: 1.55,
                    transition: 'border-color 0.12s ease, background 0.12s ease',
                  }}>
                  {opt ? (
                    <span style={{ display: 'flex', gap: 8 }}>
                      <strong>{opt.letter}</strong><span style={{ flex: 1 }}>{opt.text}</span>
                      <button onClick={e => { e.stopPropagation(); clearGap(q) }} title="Quitar" style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.grey, fontSize: 15 }}>×</button>
                    </span>
                  ) : (
                    <span style={{ color: C.grey, fontStyle: 'italic' }}>{pendingOption ? 'Toca aquí para colocar' : 'Arrastra una frase aquí'}</span>
                  )}
                </div>
                {flagBtn(key)}
              </div>
            )
          })}
        </div>

        {/* Available sentences */}
        <div style={{ flex: '1 1 260px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.grey, marginBottom: 8 }}>Frases (arrastra o toca, luego el hueco)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options.map(o => {
              const used = usedLetters.has(o.letter)
              const selectedPend = pendingOption === o.letter
              return (
                <div key={o.letter}
                  draggable={!used}
                  onDragStart={e => { e.dataTransfer.setData('text/plain', o.letter); setPendingOption(o.letter) }}
                  onClick={() => { if (!used) setPendingOption(selectedPend ? null : o.letter) }}
                  className={used ? undefined : 'cbt-opt'}
                  style={{
                    display: 'flex', gap: 8, padding: '11px 13px', borderRadius: 8, fontSize: 13.5, lineHeight: 1.55,
                    border: `1.5px solid ${selectedPend ? C.accent : C.line}`,
                    background: used ? C.disabled : selectedPend ? C.sel : C.card, color: used ? C.grey : C.ink,
                    opacity: used ? 0.5 : 1, cursor: used ? 'default' : 'grab',
                    boxShadow: used ? 'none' : '0 1px 3px rgba(16,24,40,0.06)',
                  }}>
                  <strong>{o.letter}</strong><span>{o.text}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  function WritingPaper() {
    const task1 = EXAM.writingTasks[0]
    const chosen = EXAM.writingTasks.find(t => t.taskNumber === task2Choice)!
    const t1 = answers['writing#task1'] || ''
    const t2 = answers['writing#task2'] || ''

    const taskBox = (t: typeof task1) => (
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${C.accent}`, borderRadius: 8, padding: '18px 20px', marginBottom: 14, boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}>
        <p style={{ fontSize: 14, lineHeight: 1.65, marginBottom: 10 }}>{t.prompt}</p>
        {t.box && <p style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.65, marginBottom: t.notes ? 8 : 0 }}>{t.box}</p>}
        {t.notes && (
          <ul style={{ paddingLeft: 22, fontSize: 14, lineHeight: 1.75 }}>
            {t.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        )}
      </div>
    )

    const area = (key: string, value: string) => (
      <>
        <textarea value={value} onFocus={() => setActiveQ(key)} onChange={e => setAns(key, e.target.value)}
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} className="cbt-input"
          placeholder="Write your answer here (140–190 words)"
          style={{ width: '100%', minHeight: 280, padding: '16px 18px', fontSize: 15, fontFamily: sans, lineHeight: 1.75, border: `1.5px solid ${C.line}`, borderRadius: 8, resize: 'vertical', color: C.ink, background: C.card, outline: 'none' }} />
        <div style={{ fontSize: 12.5, color: wordCount(value) >= 140 && wordCount(value) <= 190 ? C.ok : C.grey, fontWeight: 600, marginTop: 4 }}>
          {wordCount(value)} words {wordCount(value) > 0 && (wordCount(value) < 140 ? '(minimum 140)' : wordCount(value) > 190 ? '(maximum 190)' : '✓')}
        </div>
      </>
    )

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 0 44px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Part 1 — compulsory</h2>
          {taskBox(task1)}
          {area('writing#task1', t1)}

          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '34px 0 10px' }}>Part 2 — choose ONE task</h2>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {EXAM.writingTasks.filter(t => !t.compulsory).map(t => (
              <button key={t.taskNumber} onClick={() => setTask2Choice(t.taskNumber)} className="cbt-opt" style={{
                padding: '9px 18px', borderRadius: 8, fontFamily: sans, fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                border: `1.5px solid ${task2Choice === t.taskNumber ? C.accent : C.line}`,
                background: task2Choice === t.taskNumber ? C.sel : C.card,
                color: task2Choice === t.taskNumber ? C.accent : C.grey,
              }}>Question {t.taskNumber} — {t.type}</button>
            ))}
          </div>
          {taskBox(chosen)}
          {area('writing#task2', t2)}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 26 }}>
            <button onClick={() => setConfirmOpen(true)} className="cbt-go" style={{ padding: '11px 26px', borderRadius: 8, border: 'none', background: C.go, color: '#fff', fontFamily: sans, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✓ Finish &amp; submit</button>
          </div>
        </div>
      </div>
    )
  }
}
