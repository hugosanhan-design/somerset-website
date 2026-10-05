'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import RecallDeck, { type DeckResult } from './RecallDeck'
import SpeakingStudio from './SpeakingStudio'
import PersonalityDrag from './PersonalityDrag'
import { useProgress } from '@/lib/courses/useProgress'
import { useIsPhone } from '@/lib/courses/useIsPhone'
import { unitValue, petReadiness, plantStage, STAGE_FROM, COURSE_UNITS } from '@/lib/courses/readiness'
import Plant from './Plant'
import { photo, type PhotoKey } from '@/lib/courses/photos'
import PlantBadge from './PlantBadge'
import ExplainVideo from './ExplainVideo'
import GamesSection from './GamesSection'
import { recordAnswer, markActive, dueCount, type Progress } from '@/lib/courses/progress'
import {
  COURSE_ID, JOB_QS, PERS_QS, VIDEOS, GRAMMAR_QS, STATIVE_QS, WORD_ITEMS, ALL_ITEMS,
  stativeSentence, stativeCorrection,
} from '@/lib/courses/b1u1'

// ─── Data ─────────────────────────────────────────────────────────────────────

type RItem = { q: string; options: string[]; a: string }
const READING_QS: RItem[] = [
  { q: 'Why does Bruno have a camera with him?', options: ["He's filming the planetarium for another project", 'He is a professional photographer', 'He needs it for the guide job', 'He likes taking photos'], a: "He's filming the planetarium for another project" },
  { q: 'What does Aitana already do at the museum?', options: ['She demonstrates the space suits in the astronaut exhibit', 'She gives tours of the planetarium', 'She works in the café', 'She repairs the exhibits'], a: 'She demonstrates the space suits in the astronaut exhibit' },
  { q: 'Which word describes Bruno best, according to what he says?', options: ['reliable', 'confident', 'sociable', 'patient'], a: 'reliable' },
  { q: 'When will the interviewer make a decision?', options: ['By Friday', 'Today', 'Tomorrow', 'Next week'], a: 'By Friday' },
]

// Listening — Somerset recordings made for the PET I Unit 1 booklet (ElevenLabs, 2 Oct 2026).
// Every file already contains two plays of the recording, exam-style.
const L1_JOBS = ['baker', 'lifeguard', 'nurse', 'tour guide', 'tram driver']
const L1_ANS = ['tram driver', 'baker', 'tour guide']
type LItem = { q: string; options: string[]; a: string; track: string }
const L2_QS: LItem[] = [
  { q: "What time does the woman's train leave?", options: ['7.15', '7.45', '8.15'], a: '8.15', track: 'track-l2.1' },
  { q: 'What is Marta studying at the moment?', options: ['law', 'architecture', 'medicine'], a: 'law', track: 'track-l2.2' },
  { q: "Which man is Pedro's father?", options: ['the man in the apron', 'the man with the camera', 'the man in the uniform'], a: 'the man in the uniform', track: 'track-l2.3' },
  { q: 'How much sugar is there?', options: ['a lot', 'a little', 'none'], a: 'a little', track: 'track-l2.4' },
  { q: 'Where is Sofía living now?', options: ['Madrid', 'London', 'Valencia'], a: 'London', track: 'track-l2.5' },
  { q: 'What does the girl think of her new job?', options: ['boring', 'difficult but interesting', 'easy'], a: 'difficult but interesting', track: 'track-l2.6' },
]

const DIALOGUE: { who: string; line: string }[] = [
  { who: 'Narrator', line: "It's nine o'clock on a Tuesday morning. Inside the Ciudad de las Artes y las Ciencias, a small office is getting ready for three job interviews. The job is English-speaking guide." },
  { who: 'Interviewer', line: 'Good morning. Please, sit down. So, Marina, what do you do at the moment?' },
  { who: 'Marina', line: 'I work as a hairdresser in Ruzafa, but I want a change. I love talking to people, and I know a lot about science. I read about it every night.' },
  { who: 'Narrator', line: "Bruno, the second candidate, walks in. He's carrying a large camera." },
  { who: 'Interviewer', line: "Bruno, I see you're holding a camera. What's that for?" },
  { who: 'Bruno', line: "Sorry, I'm filming the planetarium this week for another project. I'm a camera operator there on Fridays. But I understand the exhibits really well; I explain them to my little cousins every visit." },
  { who: 'Interviewer', line: 'And what kind of person are you, Bruno?' },
  { who: 'Bruno', line: 'Honestly, quite shy at first, but reliable. I never miss a shift.' },
  { who: 'Narrator', line: "Finally, Aitana, the third candidate, sits down. She's smiling." },
  { who: 'Aitana', line: "I'm an astronaut. Well, not a real one! I work in the astronaut exhibit already; I demonstrate the space suits. I love this museum, and I believe I'm the right person for this job." },
  { who: 'Interviewer', line: 'What makes you a good guide?' },
  { who: 'Aitana', line: "I'm patient with children, and I'm cheerful even on a long, tiring day." },
  { who: 'Interviewer', line: "Thank you, all three of you. We're deciding by Friday. Good luck!" },
]

const WRITING_POINTS = ['what you usually do every day (your routine)', 'what you are doing differently this week', 'one thing you want to do in the future']

const SPEAKING_QS = [
  'What do you usually do on a typical day?',
  'What are you doing differently this week?',
  'What are your plans for the weekend?',
]

const STUDY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STUDY_GOALS = ['Pass the PET exam', 'Improve my everyday English', 'Prepare for FCE', 'Professional English']

// Per-step magazine metadata: accent colour, lesson tag, photo, hero copy
type Device = 'phone' | 'computer' | 'either'
type StepMeta = { nav: string; tag: string; title: string; aim: string; accent: string; accentLt: string; photo: PhotoKey; device?: Device; why?: string; key?: string }
const STEPS: StepMeta[] = [
  { nav: 'Start', tag: 'Unit 1', title: 'Me & My Day', aim: 'Daily routines · Present tenses · Valencia mornings', accent: '#6BAE2E', accentLt: '#eaf4da', photo: 'mercat-central' },
  { nav: 'Jobs', tag: 'Lesson A', title: 'Jobs', aim: 'Twelve jobs, twelve clues. Read each one and type the job from memory.', accent: '#3E8FB0', accentLt: '#e8f4f9', photo: 'fruit-stall', device: 'phone', why: 'Short cards, one at a time.', key: 'jobs' },
  { nav: 'Personality', tag: 'Lesson B', title: 'What kind of person are you?', aim: 'Ten adjectives of personality, in sentences from everyday Valencia.', accent: '#E8A33D', accentLt: '#fef5e4', photo: 'fruit-stall', device: 'either', why: '', key: 'personality' },
  { nav: 'Grammar', tag: 'Lesson C', title: 'Usually… but this week', aim: 'Present simple for routines, present continuous for right now. Then catch the stative-verb mistakes.', accent: '#E1614C', accentLt: '#fdf0ed', photo: 'hemisferic', device: 'either', why: '', key: 'grammar' },
  { nav: 'Reading', tag: 'Lesson D', title: 'The interview at the Ciutat', aim: 'Three candidates, one job. Read the dialogue and answer four questions.', accent: '#4d8520', accentLt: '#eaf4da', photo: 'hemisferic', device: 'computer', why: 'The text and the questions sit side by side.', key: 'reading' },
  { nav: 'Listening', tag: 'Lesson E', title: 'Who is speaking?', aim: 'Three people talk about their jobs, then six short conversations. Each recording plays twice, like the exam.', accent: '#6A4C93', accentLt: '#efeaf6', photo: 'hemisferic', device: 'phone', why: 'Put your headphones on.', key: 'listening' },
  { nav: 'Speaking', tag: 'Lesson F', title: 'Talk about your day', aim: 'Sixty to ninety seconds about your routine, out loud.', accent: '#2C4A6E', accentLt: '#eaeff6', photo: 'glastonbury-tor', device: 'phone', why: 'Phone microphones are usually better than laptop ones.', key: 'speaking' },
  { nav: 'Writing', tag: 'Lesson G', title: 'An email to a penfriend', aim: '70 to 100 words. Your teacher reads it and sends you personal feedback.', accent: '#1A1A1A', accentLt: '#f5f5f3', photo: 'glastonbury-tor', device: 'computer', why: 'Writing 100 words is much easier on a keyboard.', key: 'writing' },
  { nav: 'Result', tag: 'Unit 1', title: 'How did Unit 1 go?', aim: 'Your scores across the unit, and how far along the road to PET you are.', accent: '#6BAE2E', accentLt: '#eaf4da', photo: 'mercat-central' },
]

const GREEN = '#6BAE2E'
const GREEN_DK = '#4d8520'
const AMBER = '#E8A33D'
const CORAL = '#E1614C'
const INK = '#1A1A1A'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreAnswers(given: string[], correct: string[]): number {
  if (!given.length) return 0
  const hits = given.filter((a, i) => a.trim().toLowerCase() === correct[i].toLowerCase()).length
  return Math.round((hits / correct.length) * 100)
}

function shortHash(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function B1Unit1Course() {
  const [step, setStep] = useState(0)
  const [studentName, setStudentName] = useState('')

  const [studyDays, setStudyDays] = useState<string[]>([])
  const [studyHours, setStudyHours] = useState('')
  const [studyGoal, setStudyGoal] = useState('')

  const [jobResults, setJobResults] = useState<DeckResult[] | null>(null)
  const jobChecked = jobResults !== null
  const { progress, update, student } = useProgress(COURSE_ID)
  const due = dueCount(progress, ALL_ITEMS.map(i => i.id))

  const [persResults, setPersResults] = useState<DeckResult[] | null>(null)

  const [gAns, setGAns] = useState<string[]>(Array(20).fill(''))
  const [gChecked, setGChecked] = useState(false)
  const [stativeAns, setStativeAns] = useState<boolean[]>(Array(7).fill(false))
  const [stativeChecked, setStativeChecked] = useState(false)

  const [readAns, setReadAns] = useState<string[]>(Array(4).fill(''))
  const [readChecked, setReadChecked] = useState(false)

  const [l1Ans, setL1Ans] = useState<string[]>(Array(3).fill(''))
  const [l2Ans, setL2Ans] = useState<string[]>(Array(6).fill(''))
  const [listenChecked, setListenChecked] = useState(false)

  const [speakingDone, setSpeakingDone] = useState(false)

  const [writingText, setWritingText] = useState('')
  const [writingSubmitted, setWritingSubmitted] = useState(false)
  const [writingLoading, setWritingLoading] = useState(false)
  const [writingError, setWritingError] = useState('')

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('somersetStudent') || 'null')
      if (s?.name) setStudentName(s.name)
    } catch { /* ignore */ }
    // Review shortcut: /courses/b1-unit-1?step=5 opens that lesson directly.
    const q = Number(new URLSearchParams(window.location.search).get('step'))
    if (Number.isInteger(q) && q > 0 && q < STEPS.length) setStep(q)
  }, [])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  // Register service worker and update last_seen every time the page loads
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})

    const s = (() => { try { return JSON.parse(localStorage.getItem('somersetStudent') || 'null') } catch { return null } })()
    if (!s?.name) return
    const key = s.name.trim().toLowerCase().replace(/\s+/g, '-')
    fetch('/api/courses/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentKey: key, course: COURSE_ID }),
    }).catch(() => {})
  }, [])

  // Ask for push permission once, after student saves their plan
  useEffect(() => {
    if (!progress.plan) return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission !== 'default') return
    try { if (localStorage.getItem('somerset-push-asked')) return } catch { return }
    try { localStorage.setItem('somerset-push-asked', '1') } catch {}

    Notification.requestPermission().then(async (perm) => {
      if (perm !== 'granted') return
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return

      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
        const raw = atob(base64)
        return Uint8Array.from(Array.from(raw).map(c => c.charCodeAt(0)))
      }

      try {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
        const s = JSON.parse(localStorage.getItem('somersetStudent') || 'null')
        if (!s?.name) return
        const key = s.name.trim().toLowerCase().replace(/\s+/g, '-')
        await fetch('/api/courses/push-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentKey: key, studentName: s.name, course: COURSE_ID, subscription: sub.toJSON() }),
        })
      } catch { /* user may have blocked or browser may not support */ }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.plan])

  useEffect(() => {
    if (!progress.plan || studyDays.length) return
    setStudyDays(progress.plan.days); setStudyHours(progress.plan.hours); setStudyGoal(progress.plan.goal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.plan])

  const onPhone = useIsPhone()
  const [anyway, setAnyway] = useState<Record<number, boolean>>({})
  const [editPlan, setEditPlan] = useState(false)

  // Local answers win; otherwise use what this student already finished on another device.
  const saved = (k: string) => progress.lessons[k]?.score ?? null
  const jobScore = jobResults ? Math.round(jobResults.reduce((a, r) => a + r.points, 0) / JOB_QS.length * 100) : saved('jobs')
  const persScore = persResults ? Math.round(persResults.reduce((a, r) => a + r.points, 0) / PERS_QS.length * 100) : saved('personality')

  const gFlat: string[] = []
  const gCorrect: string[] = []
  GRAMMAR_QS.forEach((q, qi) => q.answers.forEach((a, bi) => {
    gFlat.push(gAns[qi * 2 + bi] || '')
    gCorrect.push(a)
  }))
  const grammarScore = gChecked ? scoreAnswers(gFlat, gCorrect) : saved('grammar')

  const stativeScore = stativeChecked
    ? Math.round(STATIVE_QS.filter((q, i) => stativeAns[i] === q.isWrong).length / 7 * 100)
    : saved('stative')

  const readingScore = readChecked ? scoreAnswers(readAns, READING_QS.map(q => q.a)) : saved('reading')
  const listeningScore = listenChecked ? scoreAnswers([...l1Ans, ...l2Ans], [...L1_ANS, ...L2_QS.map(q => q.a)]) : saved('listening')
  const spokeDone = speakingDone || saved('speaking') !== null
  const wroteDone = writingSubmitted || saved('writing') !== null

  // Unit 1 is one of twelve: readiness is the PET journey, not the average of today's scores.
  const grammarLesson = grammarScore !== null && stativeScore !== null ? Math.round((grammarScore + stativeScore) / 2) : null
  const unit1Lessons = [jobScore, persScore, grammarLesson, readingScore, listeningScore, spokeDone ? 100 : null, wroteDone ? 100 : null]
  const lessonsDone = unit1Lessons.filter(x => x !== null).length
  const readiness = petReadiness([unitValue(unit1Lessons)])
  const stage = plantStage(readiness)

  // Which steps the student may jump back to from the nav
  const planDone = !!progress.plan
  const stepDone = [
    planDone,
    jobScore !== null, persScore !== null, grammarScore !== null && stativeScore !== null,
    readingScore !== null, listeningScore !== null, spokeDone, wroteDone, false,
  ]
  // Lessons open in any order once the plan is set: a phone day skips the computer lessons.
  const maxReachable = planDone ? STEPS.length - 1 : 0

  const wordCount = writingText.trim().split(/\s+/).filter(Boolean).length

  function record(pairs: [string, boolean][], lesson: string, score: number) {
    update(p => {
      let next = p
      for (const [id, ok] of pairs) next = recordAnswer(next, id, ok)
      return { ...markActive(next), lessons: { ...next.lessons, [lesson]: { score, at: Date.now() } } }
    })
  }
  function checkGrammar() {
    setGChecked(true)
    const pairs: [string, boolean][] = []
    GRAMMAR_QS.forEach((g, qi) => g.answers.forEach((a, bi) => pairs.push([`gram:${qi}:${bi}`, gAns[qi * 2 + bi] === a])))
    record(pairs, 'grammar', Math.round(pairs.filter(x => x[1]).length / pairs.length * 100))
  }
  function checkStative() {
    setStativeChecked(true)
    const pairs = STATIVE_QS.map((q, i): [string, boolean] => [`stat:${i}`, stativeAns[i] === q.isWrong])
    record(pairs, 'stative', Math.round(pairs.filter(x => x[1]).length / pairs.length * 100))
  }
  function checkReading() {
    setReadChecked(true)
    record([], 'reading', scoreAnswers(readAns, READING_QS.map(q => q.a)))
  }
  function checkListening() {
    setListenChecked(true)
    record([], 'listening', scoreAnswers([...l1Ans, ...l2Ans], [...L1_ANS, ...L2_QS.map(q => q.a)]))
  }
  function savePlanAndStart() {
    update(p => markActive({ ...p, plan: { days: studyDays, hours: studyHours, goal: studyGoal, at: Date.now() } }))
    setStep(1)
  }

  async function submitWriting() {
    if (writingLoading || wordCount < 30) return
    setWritingLoading(true)
    setWritingError('')
    try {
      const r = await fetch('/api/courses/b1u1-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, text: writingText }),
      })
      if (!r.ok) throw new Error()
      setWritingSubmitted(true)
      record([], 'writing', 100)
    } catch {
      setWritingError("Couldn't send right now. Try again in a moment.")
    } finally {
      setWritingLoading(false)
    }
  }

  const m = STEPS[step]
  const isCover = step === 0
  const accentVars = { '--accent': m.accent, '--accent-lt': m.accentLt } as React.CSSProperties

  return (
    <div className="mag" style={accentVars}>

      {/* ── Sticky header ── */}
      <header className="site-header">
        <div className="site-header__top">
          <SomersetLogo variant="white" />
          <span className="unit-label">B1 · Unit 1 · Online course</span>
          <Link href="/courses/b1-unit-1/revise" className="revise-pill">⚡ Revise<span className="hide-sm"> in 5</span>{due > 0 && <span className="revise-due">{due}</span>}</Link>
          <Link href="/student" className="corner-link" aria-label="Back to Student&apos;s Corner">←<span className="hide-sm"> Student&apos;s Corner</span></Link>
        </div>
        <nav className="lesson-nav" aria-label="Lessons">
          {STEPS.map((s, i) => {
            const reachable = i <= maxReachable
            return (
              <button key={s.nav} disabled={!reachable} onClick={() => reachable && setStep(i)}
                className={`nav-btn${i === step ? ' active' : ''}${stepDone[i] ? ' done' : ''}`}
                style={i === step ? { borderBottomColor: s.accent } : undefined}>
                {stepDone[i] && i !== step ? <span className="nav-tick">✓</span> : <span className="nav-num">{i === 0 ? '◆' : i}</span>}
                {s.nav}
              </button>
            )
          })}
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className={`hero${isCover ? ' hero--cover' : ''}`} key={`hero-${step}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo(m.photo).src} alt={photo(m.photo).alt} style={{ objectPosition: photo(m.photo).focus }} />
        <PhotoCredit k={m.photo} />
        <div className="hero-overlay">
          <p className="hero-label" style={{ color: m.accent }}>Somerset B1 · {m.tag}</p>
          <h1 className="hero-title">{m.title}</h1>
          <p className="hero-sub">{m.aim}</p>
          {m.device && m.device !== 'either' && <p className="hero-device">{m.device === 'phone' ? '📱 Great on your phone' : '💻 Best on a computer'}</p>}
        </div>
      </section>

      {/* ── Progress strip ── */}
      <div className="goals-strip">
        <div className="goals-inner">
          <div className="seg-bar" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <span key={i} className={`seg${i < step || stepDone[i] ? ' seg--done' : ''}${i === step ? ' seg--now' : ''}`} style={i === step ? { background: s.accent } : undefined} />
            ))}
          </div>
          <div className="goals-row">
            <span className="goal-text">Step {step + 1} of {STEPS.length} · <strong>{m.nav}</strong></span>
            {planDone && (
              <span className="goal-text goal-text--right">
                <PlantBadge stage={stage.index} percent={readiness} showPercent={stage.showPercent} /> Unit 1: {lessonsDone} of {unit1Lessons.length} lessons
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="page-wrap">
        <div className="lesson" key={`step-${step}`}>

          {onPhone && m.device === 'computer' && !anyway[step] && (
            <section className="card device-note">
              <div className="device-note-icon">💻</div>
              <div>
                <h2 className="lesson-title">This one is easier on a computer</h2>
                <p className="lesson-aim">{m.why} It&apos;s saved for when you&apos;re at your computer, and your progress follows you there.</p>
                <div className="row">
                  <button type="button" className="btn" onClick={() => setStep(0)}>Show me phone lessons</button>
                  <button type="button" className="help-btn" onClick={() => setAnyway(a => ({ ...a, [step]: true }))}>Do it here anyway</button>
                </div>
              </div>
            </section>
          )}
          {!(onPhone && m.device === 'computer' && !anyway[step]) && <>

          {/* ── Step 0: Cover + study plan ── */}
          {step === 0 && (<>
            <div className="two-col-40">
              <aside className="intro-card">
                <p className="dropcap-text">
                  <span className="dropcap">H</span>i{studentName ? ` ${cap(studentName)}` : ''}! This unit is about your everyday life: the jobs people do, the kind of person you are, and the difference between what you <em>usually</em> do and what you&apos;re doing <em>this week</em>.
                </p>
                <p className="intro-sub">Seven short lessons, in any order. Some are made for your phone, some for your computer. You check your own answers, speak out loud, and send one piece of writing to your teacher. At the end you see how close you are to PET.</p>
                <ul className="goal-list">
                  <li>Twelve jobs and ten personality adjectives</li>
                  <li>Present simple vs present continuous</li>
                  <li>Stative verbs: the ones that never take <em>-ing</em></li>
                  <li>A reading, a listening, a speaking task and an email</li>
                </ul>
                <div className="intro-video"><ExplainVideo video={VIDEOS.welcome} label="How this course works" /></div>
              </aside>

              {planDone && !editPlan ? (
                <section className="card">
                  <LessonHead tag="Your lessons" title={onPhone ? 'On your phone today' : 'Pick up where you left off'}
                    aim={onPhone ? 'These work well on a small screen. The computer ones will wait for you.' : 'Do them in any order. Everything you finish is saved to your account.'} />
                  <LessonMap
                    lessons={STEPS.map((s, i) => ({ ...s, i, done: stepDone[i] })).filter(l => l.i > 0 && l.i < STEPS.length - 1)}
                    onPhone={onPhone}
                    scoreOf={i => [null, jobScore, persScore, grammarScore, readingScore, listeningScore, spokeDone ? 100 : null, wroteDone ? 100 : null][i] ?? null}
                    onOpen={i => setStep(i)}
                  />
                  <div className="row">
                    <Link href="/courses/b1-unit-1/revise" className="btn">⚡ Revise in 5</Link>
                    <button type="button" className="help-btn" onClick={() => setEditPlan(true)}>Change my study plan</button>
                  </div>
                </section>

              ) : (
              <section className="card">
                <LessonHead tag="Before you start" title="Your study plan" aim="Thirty seconds. It helps us pace the course for you." />

                <Label>Which days can you study?</Label>
                <div className="chips">
                  {STUDY_DAYS.map(d => <Chip key={d} active={studyDays.includes(d)} onClick={() => setStudyDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}>{d}</Chip>)}
                </div>

                <Label>How long per session?</Label>
                <div className="chips">
                  {['30 min', '1 hour', '1.5 hours', '2+ hours'].map(h => <Chip key={h} active={studyHours === h} onClick={() => setStudyHours(h)}>{h}</Chip>)}
                </div>

                <Label>Main goal</Label>
                <div className="chips chips--last">
                  {STUDY_GOALS.map(g => <Chip key={g} active={studyGoal === g} onClick={() => setStudyGoal(g)}>{g}</Chip>)}
                </div>

                {studyDays.length > 0 && studyHours && (
                  <p className="plan-summary">
                    {studyDays.length} {studyDays.length === 1 ? 'day' : 'days'} a week · {studyHours} a session{studyGoal ? ` · ${studyGoal}` : ''}
                  </p>
                )}

                <Btn disabled={!studyDays.length || !studyHours || !studyGoal} onClick={() => { savePlanAndStart(); setEditPlan(false) }}>{planDone ? 'Save my plan →' : 'Start the course →'}</Btn>
              </section>
              )}
            </div>

            {planDone && <GamesSection progress={progress} />}
          </>)}

          {/* ── Step 1: Jobs ── */}
          {step === 1 && (
            <section className="card">
              <LessonHead tag="A · Vocabulary" title="Jobs" aim="Read the clue and type the job. No list to choose from: you remember it, you own it." />
              {!jobResults ? (
                <RecallDeck
                  items={WORD_ITEMS.filter(w => w.group === 'jobs')}
                  wordBank={[...JOB_QS.map(j => j.a)].sort()}
                  placeholder="Type the job…"
                  onRecord={(id, clean) => update(p => recordAnswer(p, id, clean))}
                  onFinish={results => {
                    setJobResults(results)
                    update(p => ({ ...p, lessons: { ...p.lessons, jobs: { score: Math.round(results.reduce((a, r) => a + r.points, 0) / JOB_QS.length * 100), at: Date.now() } } }))
                  }}
                />
              ) : (
                <DeckSummary results={jobResults} onRetry={() => setJobResults(null)} />
              )}
              {jobResults && (
                <Row>
                  <ScoreBadge score={jobScore!} />
                  <Btn onClick={() => setStep(2)}>Next: Personality →</Btn>
                </Row>
              )}
            </section>
          )}

          {/* ── Step 2: Personality ── */}
          {step === 2 && (
            <section className="card">
              <LessonHead tag="B · Vocabulary" title="What kind of person are they?" aim="Read the sentence and give the person the right adjective. Watch their face change." />
              {!persResults ? (
                <PersonalityDrag
                  onRecord={(id, clean) => update(p => recordAnswer(p, id, clean))}
                  onFinish={results => {
                    setPersResults(results)
                    record([], 'personality', Math.round(results.reduce((a, r) => a + r.points, 0) / PERS_QS.length * 100))
                  }}
                />
              ) : (
                <DeckSummary results={persResults} onRetry={() => setPersResults(null)} />
              )}
              {persResults && (
                <Row>
                  <ScoreBadge score={persScore!} />
                  <Btn onClick={() => setStep(3)}>Next: Grammar →</Btn>
                </Row>
              )}
            </section>
          )}

          {/* ── Step 3: Grammar ── */}
          {step === 3 && (
            <>
              <section className="card">
                <LessonHead tag="C · Grammar" title="Usually… but this week" aim="Choose the present simple or the present continuous." extra={<ExplainVideo video={VIDEOS.tenses} />} />
                <div className="grammar-box">
                  <h4>Remember</h4>
                  <table>
                    <tbody>
                      <tr><th>Present simple</th><td>routines, habits, facts</td><td><code>usually</code> <code>always</code> <code>every day</code></td></tr>
                      <tr><th>Present continuous</th><td>right now, this week, temporary</td><td><code>now</code> <code>this week</code> <code>Look!</code></td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="task-list">
                  {GRAMMAR_QS.map((item, qi) => {
                    let blankIdx = 0
                    const parts = item.text.split(/(\[\d+\])/)
                    return (
                      <div key={qi} className="task-row">
                        <span className="num">{qi + 1}</span>
                        <span className="task-text task-text--flow">
                          {parts.map((part, pi) => {
                            if (!/^\[\d+\]$/.test(part)) return <span key={pi}>{part}</span>
                            const bi = blankIdx++
                            const idx = qi * 2 + bi
                            const state = rowState(gChecked, gAns[idx], item.answers[bi])
                            return (
                              <span key={pi} className={`blank-wrap ${state}`}>
                                <select className="sel sel--inline" value={gAns[idx]} disabled={gChecked} onChange={e => { const v = [...gAns]; v[idx] = e.target.value; setGAns(v) }}>
                                  <option value="">______</option>
                                  {item.options[bi].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <Mark state={state} answer={item.answers[bi]} inline />
                              </span>
                            )
                          })}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <Row>
                  {!gChecked
                    ? <Btn disabled={gFlat.some(a => !a)} onClick={checkGrammar}>Check answers</Btn>
                    : <ScoreBadge score={grammarScore!} />}
                </Row>
              </section>

              <section className="card">
                <LessonHead tag="D · Grammar" title="Stative verbs: find the mistakes" aim="Five of these sentences use a stative verb in the continuous. Tick the wrong ones." extra={<ExplainVideo video={VIDEOS.stative} />} />
                <div className="tip-box">
                  <strong>Language tip</strong>
                  <p>Verbs of thinking, feeling, owning and the senses (<em>know, believe, want, own, taste, smell</em>) describe states, not actions. They stay in the present simple even when we mean &ldquo;now&rdquo;.</p>
                </div>
                <div className="task-list">
                  {STATIVE_QS.map((item, i) => {
                    const state = !stativeChecked ? '' : stativeAns[i] === item.isWrong ? 'ok' : 'bad'
                    return (
                      <label key={i} className={`task-row task-row--check ${state}${stativeAns[i] ? ' ticked' : ''}`}>
                        <input type="checkbox" checked={stativeAns[i]} disabled={stativeChecked} onChange={() => { const v = [...stativeAns]; v[i] = !v[i]; setStativeAns(v) }} />
                        <span className="task-text">
                          <span className={stativeChecked && item.isWrong ? 'struck' : ''}>{stativeSentence(item)}</span>
                          {stativeChecked && item.isWrong && <span className="fix">{stativeCorrection(item)}</span>}
                        </span>
                        {stativeChecked && <span className={`mark ${state}`}>{state === 'ok' ? '✓' : '✗'}</span>}
                      </label>
                    )
                  })}
                </div>
                <Row>
                  {!stativeChecked
                    ? <Btn onClick={checkStative}>Check answers</Btn>
                    : <><ScoreBadge score={stativeScore!} /><Btn onClick={() => setStep(4)}>Next: Reading →</Btn></>}
                </Row>
              </section>
            </>
          )}

          {/* ── Step 4: Reading ── */}
          {step === 4 && (
            <section className="card">
              <LessonHead tag="D · Reading" title="The interview at the Ciutat" aim="Read the dialogue, then answer the four questions." />
              <div className="two-col-60">
                <article className="script">
                  {DIALOGUE.map((d, i) => (
                    <p key={i} className={d.who === 'Narrator' ? 'script-narr' : 'script-line'}>
                      {d.who !== 'Narrator' && <span className="who">{d.who}</span>}
                      {d.line}
                    </p>
                  ))}
                </article>
                <div className="q-stack">
                  {READING_QS.map((item, i) => (
                    <div key={i} className="q-block">
                      <div className="q-title"><span className="num">{i + 1}</span>{item.q}</div>
                      <div className="opts">
                        {item.options.map(opt => {
                          const isCorrect = readChecked && opt === item.a
                          const isWrong = readChecked && opt === readAns[i] && opt !== item.a
                          const picked = readAns[i] === opt
                          return (
                            <label key={opt} className={`opt${picked ? ' picked' : ''}${isCorrect ? ' ok' : ''}${isWrong ? ' bad' : ''}`}>
                              <input type="radio" name={`rq${i}`} value={opt} checked={picked} disabled={readChecked} onChange={() => { const v = [...readAns]; v[i] = opt; setReadAns(v) }} />
                              <span>{opt}</span>
                              {isCorrect && <span className="mark ok">✓</span>}
                              {isWrong && <span className="mark bad">✗</span>}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  <Row>
                    {!readChecked
                      ? <Btn disabled={readAns.some(a => !a)} onClick={checkReading}>Check answers</Btn>
                      : <><ScoreBadge score={readingScore!} /><Btn onClick={() => setStep(5)}>Next: Listening →</Btn></>}
                  </Row>
                </div>
              </div>
            </section>
          )}

          {/* ── Step 5: Listening ── */}
          {step === 5 && (
            <>
              <section className="card">
                <LessonHead tag="E · Listening" title="Who is speaking?" aim="Listen to three people talking about their jobs. Match each speaker with a job. You do not need two of the jobs." />
                <div className="audio-block">
                  <div className="track-label"><span className="track-badge">🎧 Track L1</span><span className="track-title">Three speakers · plays twice</span></div>
                  <audio controls preload="none" src="/courses/b1-unit-1/audio/track-l1.mp3" />
                </div>
                <WordBank words={L1_JOBS} />
                <div className="task-list">
                  {L1_ANS.map((ans, i) => {
                    const state = rowState(listenChecked, l1Ans[i], ans)
                    return (
                      <div key={i} className={`task-row task-row--inline ${state}`}>
                        <span className="num">{i + 1}</span>
                        <span className="task-text">Speaker {i + 1}</span>
                        <select className="sel" value={l1Ans[i]} disabled={listenChecked} onChange={e => { const v = [...l1Ans]; v[i] = e.target.value; setL1Ans(v) }}>
                          <option value="">choose…</option>
                          {L1_JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                        <Mark state={state} answer={ans} />
                      </div>
                    )
                  })}
                </div>
                <div className="tip-box">
                  <strong>Exam tip</strong>
                  <p>Speakers often mention <em>other</em> jobs, other times and other places. They say something and then change it. Don&apos;t choose the first thing you hear; wait for the end of the sentence.</p>
                </div>
              </section>

              <section className="card">
                <LessonHead tag="Listening Part 1" title="Six short conversations" aim="For each question, choose the correct answer. In the real exam the options are pictures." />
                <div className="q-stack">
                  {L2_QS.map((item, i) => (
                    <div key={i} className="q-block">
                      <div className="q-title"><span className="num">{i + 1}</span>{item.q}</div>
                      <audio className="q-audio" controls preload="none" src={`/courses/b1-unit-1/audio/${item.track}.mp3`} />
                      <div className="opts opts--row">
                        {item.options.map((opt, oi) => {
                          const isCorrect = listenChecked && opt === item.a
                          const isWrong = listenChecked && opt === l2Ans[i] && opt !== item.a
                          const picked = l2Ans[i] === opt
                          return (
                            <label key={opt} className={`opt${picked ? ' picked' : ''}${isCorrect ? ' ok' : ''}${isWrong ? ' bad' : ''}`}>
                              <input type="radio" name={`lq${i}`} value={opt} checked={picked} disabled={listenChecked} onChange={() => { const v = [...l2Ans]; v[i] = opt; setL2Ans(v) }} />
                              <span><b className="opt-letter">{'ABC'[oi]}</b>{opt}</span>
                              {isCorrect && <span className="mark ok">✓</span>}
                              {isWrong && <span className="mark bad">✗</span>}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <Row>
                  {!listenChecked
                    ? <Btn disabled={l1Ans.some(a => !a) || l2Ans.some(a => !a)} onClick={checkListening}>Check answers</Btn>
                    : <><ScoreBadge score={listeningScore!} /><Btn onClick={() => setStep(6)}>Next: Speaking →</Btn></>}
                </Row>
              </section>
            </>
          )}

          {/* ── Step 6: Speaking ── */}
          {step === 6 && (
            <section className="card">
              <LessonHead tag="F · Speaking" title="Talk about your day" aim="Answer one question out loud for 60 to 90 seconds. You'll see what we heard, get three tips, then say it again." />
              <div className="two-col-60">
                <SpeakingStudio
                  questions={SPEAKING_QS}
                  student={student}
                  onSpoken={sum => {
                    setSpeakingDone(true)
                    record([], 'speaking', 100)
                    update(p => ({ ...p, speaking: [...(p.speaking ?? []), { at: Date.now(), accuracy: sum.accuracy, fluency: sum.fluency, words: sum.wordCount }] }))
                  }}
                  onSecondTry={sum => update(p => ({ ...p, speaking: [...(p.speaking ?? []), { at: Date.now(), accuracy: sum.accuracy, fluency: sum.fluency, words: sum.wordCount }] }))}
                  onFixes={fixes => update(p => {
                    const personal = { ...(p.personal ?? {}) }
                    let next: Progress = { ...p, personal }
                    for (const f of fixes) {
                      const [pre, ...rest] = f.sentence.split(f.original)
                      const id = 'own:' + shortHash(f.sentence + '|' + f.original)
                      personal[id] = { pre, seg: f.original, post: rest.join(f.original), fix: f.fix, why: f.why, at: Date.now() }
                      next = recordAnswer(next, id, false)
                    }
                    return next
                  })}
                />
                <div>
                  <div className="section-head">Useful language</div>
                  <div className="chips chips--static">
                    {['I usually…', 'Every day I…', 'At the moment I\'m…', 'This week is different because…', 'At the weekend I\'m going to…'].map(p => <span key={p} className="chip chip--static">{p}</span>)}
                  </div>
                  <div className="noticing-box">
                    <strong>Noticing:</strong> present simple for what you <em>usually</em> do, present continuous for what you&apos;re doing <em>this week</em>.
                  </div>
                  {!spokeDone && (
                    <p className="studio-note">No microphone right now? Practise out loud anyway, then{' '}
                      <button type="button" className="sc-link-btn" onClick={() => { setSpeakingDone(true); record([], 'speaking', 100) }}>mark it as done</button>.
                    </p>
                  )}
                </div>
              </div>
              {spokeDone && (
                <Row><span className="done-pill">✓ Speaking done</span><Btn onClick={() => setStep(7)}>Next: Writing →</Btn></Row>
              )}
            </section>
          )}

          {/* ── Step 7: Writing ── */}
          {step === 7 && (
            <section className="card">
              <LessonHead tag="G · Writing" title="An email to a penfriend" aim="Write 70 to 100 words. Your teacher reviews it and emails you personal feedback." />
              {!writingSubmitted ? (
                <div className="two-col-40">
                  <div>
                    <div className="exam-focus">
                      <strong>The task</strong>
                      <p>Write an email to a new penfriend. Tell them:</p>
                      <ol className="task-points">
                        {WRITING_POINTS.map(p => <li key={p}>{p}</li>)}
                      </ol>
                    </div>
                    <div className="score-grid">
                      <div className="score-item"><strong>Length</strong>70 to 100 words</div>
                      <div className="score-item"><strong>Tone</strong>informal, friendly</div>
                      <div className="score-item"><strong>Grammar</strong>simple + continuous</div>
                      <div className="score-item"><strong>Opening</strong>Hi … , How are you?</div>
                    </div>
                  </div>
                  <div>
                    <textarea className="writing" value={writingText} onChange={e => setWritingText(e.target.value)} rows={13} placeholder="Hi Sam, how are you? …" />
                    <div className="writing-foot">
                      <WordRing count={wordCount} />
                      <Btn disabled={writingLoading || wordCount < 30} onClick={submitWriting}>
                        {writingLoading ? 'Sending…' : 'Submit to my teacher →'}
                      </Btn>
                    </div>
                    {writingLoading && <p className="note">Checking your writing and sending it to your teacher. This can take up to a minute.</p>}
                    {writingError && <p className="err">{writingError}</p>}
                  </div>
                </div>
              ) : (
                <div className="sent">
                  <div className="sent-icon">📬</div>
                  <h3>Sent to your teacher</h3>
                  <p>They&apos;ll read it, check the feedback, and email you a full report with your mistakes and how to improve.</p>
                  <Btn onClick={() => setStep(8)}>See your results →</Btn>
                </div>
              )}
            </section>
          )}

          {/* ── Step 8: Results ── */}
          {step === 8 && (
            <>
              <section className="i-can">
                <div className="i-can-top">
                  <div className="plant-hero"><Plant stage={stage.index} size={132} /></div>
                  <div>
                    <div className="i-can-kicker">Unit 1 · {lessonsDone} of {unit1Lessons.length} lessons{stage.showPercent ? ` · ${readiness}% of the way to PET` : ''}</div>
                    <h2>{lessonsDone < unit1Lessons.length ? 'Keep growing' : 'Unit 1 done'}</h2>
                    <p className="sub">
                      {lessonsDone < unit1Lessons.length
                        ? `Finish the last ${unit1Lessons.length - lessonsDone === 1 ? 'lesson' : `${unit1Lessons.length - lessonsDone} lessons`} of Unit 1 and your plant grows.`
                        : `1 of ${COURSE_UNITS} units. Every unit makes it grow, until it's an apple tree: ready for PET.`}
                    </p>
                  </div>
                </div>
                <div className="plant-row" aria-label="How your plant grows on the way to PET">
                  {STAGE_FROM.map((_, i) => (
                    <div key={i} className={`plant-step${i < stage.index ? ' past' : ''}${i === stage.index ? ' now' : ''}`}>
                      <Plant stage={i} size={54} />
                    </div>
                  ))}
                </div>
                <div className="i-can-grid">
                  {[
                    { label: 'Jobs vocabulary', score: jobScore, go: 1 },
                    { label: 'Personality adjectives', score: persScore, go: 2 },
                    { label: 'Present simple vs continuous', score: grammarScore, go: 3 },
                    { label: 'Stative verbs', score: stativeScore, go: 3 },
                    { label: 'Reading comprehension', score: readingScore, go: 4 },
                    { label: 'Listening', score: listeningScore, go: 5 },
                    { label: 'Speaking practice', score: speakingDone ? 100 : null, go: 6 },
                    { label: 'Writing task', score: writingSubmitted ? 100 : null, go: 7 },
                  ].map(({ label, score, go }) => (
                    <button key={label} className="i-can-item" onClick={() => setStep(go)}>
                      <span className="i-can-label">{label}</span>
                      <span className="i-can-bar"><span style={{ width: `${score ?? 0}%` }} /></span>
                      <span className="i-can-score">{score !== null ? `${score}%` : 'not done'}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="review-strip">
                <h3>What happens next</h3>
                <p>Your writing is with your teacher. You&apos;ll get a personal report by email with your mistakes, the rules behind them and what to practise. When you&apos;re ready, you can take the Unit 1 progress check from your Student&apos;s Corner.</p>
                <Link href="/student" className="btn btn--light">← Back to Student&apos;s Corner</Link>
              </div>
            </>
          )}

          </>}

          {step > 0 && step < STEPS.length - 1 && (
            <div className="back-row">
              <button onClick={() => setStep(s => s - 1)} className="btn btn--ghost">← Back</button>
            </div>
          )}
        </div>
      </main>

      <footer className="mag-foot">
        <span>Somerset Language Centre · Valencia</span>
        <span>B1 · Unit 1 · Me &amp; My Day</span>
      </footer>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function rowState(checked: boolean, given: string, answer: string) {
  if (!checked) return ''
  return given === answer ? 'ok' : 'bad'
}

function PhotoCredit({ k }: { k: PhotoKey }) {
  const p = photo(k)
  return (
    <a className="photo-credit" href={p.page} target="_blank" rel="noopener noreferrer">
      Photo: {p.author} · {p.licence}
    </a>
  )
}

function LessonMap({ lessons, onPhone, scoreOf, onOpen }: {
  lessons: (StepMeta & { i: number; done: boolean })[]
  onPhone: boolean
  scoreOf: (i: number) => number | null
  onOpen: (i: number) => void
}) {
  const card = (l: StepMeta & { i: number; done: boolean }) => {
    const score = scoreOf(l.i)
    return (
      <button key={l.i} type="button" className={`lm-item${l.done ? ' done' : ''}`} onClick={() => onOpen(l.i)}
        style={{ '--accent': l.accent, '--accent-lt': l.accentLt } as React.CSSProperties}>
        <span className="lm-num">{l.done ? '✓' : l.i}</span>
        <span className="lm-body">
          <span className="lm-title">{l.nav}</span>
          <span className="lm-meta">{l.device === 'phone' ? '📱 phone' : l.device === 'computer' ? '💻 computer' : '📱💻 either'}{l.done && score !== null && score < 100 ? ` · ${score}%` : l.done ? ' · done' : ''}</span>
        </span>
        <span className="sc-chev">›</span>
      </button>
    )
  }
  if (!onPhone) return <div className="lm-grid">{lessons.map(card)}</div>
  const here = lessons.filter(l => l.device !== 'computer')
  const later = lessons.filter(l => l.device === 'computer')
  return (
    <>
      <div className="lm-grid">{here.map(card)}</div>
      <div className="lm-later-head">💻 Saved for your computer</div>
      <div className="lm-grid lm-later">{later.map(card)}</div>
    </>
  )
}

function DeckSummary({ results, onRetry }: { results: DeckResult[]; onRetry: () => void }) {
  const first = results.filter(r => r.points === 1).length
  const helped = results.filter(r => r.points === 0.5).length
  const missed = results.filter(r => r.points === 0)
  const word = (id: string) => id.split(':')[1]
  return (
    <div className="deck-summary">
      <div className="ds-stats">
        <div className="ds-stat ok"><strong>{first}</strong><span>first time</span></div>
        <div className="ds-stat mid"><strong>{helped}</strong><span>with help</span></div>
        <div className="ds-stat bad"><strong>{missed.length}</strong><span>to learn</span></div>
      </div>
      {results.some(r => r.points < 1) ? (
        <p className="ds-note">
          These come back in <strong>Revise in 5</strong> tomorrow:{' '}
          {results.filter(r => r.points < 1).map(r => <span key={r.id} className="chip chip--static ds-chip">{word(r.id)}</span>)}
        </p>
      ) : <p className="ds-note">A perfect round. They&apos;ll still come back in a few days, so they stick.</p>}
      <button type="button" className="help-btn" onClick={onRetry}>↻ Try the whole deck again</button>
    </div>
  )
}

function LessonHead({ tag, title, aim, extra }: { tag: string; title: string; aim: string; extra?: React.ReactNode }) {
  return (
    <div className="lesson-header">
      <span className="lesson-tag">{tag}</span>
      <div className="lesson-head-text">
        <h2 className="lesson-title">{title}</h2>
        <p className="lesson-aim">{aim}</p>
      </div>
      {extra && <div className="lesson-head-extra">{extra}</div>}
    </div>
  )
}

function WordBank({ words }: { words: string[] }) {
  return (
    <div className="vocab-group">
      <h4>Word box</h4>
      <div className="chips chips--static">
        {words.map(w => <span key={w} className="chip chip--static">{w}</span>)}
      </div>
    </div>
  )
}

function Mark({ state, answer, inline }: { state: string; answer: string; inline?: boolean }) {
  if (!state) return null
  if (state === 'ok') return <span className={`mark ok${inline ? ' mark--inline' : ''}`}>✓</span>
  return <span className={`mark bad${inline ? ' mark--inline' : ''}`}>✗ <em>{answer}</em></span>
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="label">{children}</div>
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`chip${active ? ' chip--on' : ''}`}>{children}</button>
}

function Btn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="btn">{children}</button>
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="row">{children}</div>
}

function ScoreBadge({ score }: { score: number }) {
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Keep practising'
  const cls = score >= 80 ? 'ok' : score >= 60 ? 'mid' : 'bad'
  return <span className={`score-badge ${cls}`}><strong>{score}%</strong>{label}</span>
}

function WordRing({ count }: { count: number }) {
  const pct = Math.min(count / 100, 1)
  const r = 17
  const c = 2 * Math.PI * r
  const good = count >= 70 && count <= 100
  const color = good ? GREEN_DK : count > 100 ? CORAL : AMBER
  const note = count < 70 ? `${70 - count} more to go` : count > 100 ? 'a little long' : 'good length'
  return (
    <div className="word-ring">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#e8e6e0" strokeWidth="4" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 22 22)" style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s' }} />
      </svg>
      <div>
        <div className="wr-count" style={{ color }}>{count} words</div>
        <div className="wr-note">{note}</div>
      </div>
    </div>
  )
}

