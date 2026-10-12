'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import Tour, { type TourStep } from './Tour'
import ExerciseCardBase from './Exercise'
import { useProgress } from '@/lib/courses/useProgress'
import { openMistakeIds, type Progress } from '@/lib/courses/progress'
import {
  ACTIVITIES, COURSE_ID, WEEKS,
  type Activity, type Exercise, type FreeTask, type Skill, type ReadText, type Track,
} from '@/lib/courses/soundTech'

// Same look as the PET course (b1-unit-1): dark header, lesson tabs, hero, segmented progress
// strip, white lesson cards. Styles come from ../b1-unit-1/course.css (.mag). The hero is a dark
// panel with a sound wave: no photo is needed.

type Meta = { nav: string; tag: string; title: string; aim: string; accent: string; accentLt: string }
const LOOK: Record<Skill, { nav: string; accent: string; accentLt: string }> = {
  words: { nav: 'Words', accent: '#E8A33D', accentLt: '#fef5e4' },
  grammar: { nav: 'Grammar', accent: '#3E8FB0', accentLt: '#e8f4f9' },
  reading: { nav: 'Reading', accent: '#E1614C', accentLt: '#fdf0ed' },
  listening: { nav: 'Listening', accent: '#8E6BC4', accentLt: '#efeaf6' },
  writing: { nav: 'Writing', accent: '#6BAE2E', accentLt: '#eaf4da' },
}
const COVER: Meta = { nav: 'Start', tag: 'Digital course', title: 'English for Sound Technicians', aim: 'The equipment, the problems and the people: the English you need for the job.', accent: '#6BAE2E', accentLt: '#eaf4da' }
const RESULT: Meta = { nav: 'Result', tag: 'Digital course', title: 'How did it go?', aim: 'Your scores, what to look at again, and the writing you sent to Hugo.', accent: '#6BAE2E', accentLt: '#eaf4da' }

const TOUR: TourStep[] = [
  { go: 0, sel: '[data-tour=corner]', title: 'Back to your courses', text: "This link takes you back to Student's Corner. Your work is saved under your name, so you can continue on your phone or on your computer." },
  { go: 0, sel: '[data-tour=weeks]', title: 'Three weeks', text: 'Each week has its own theme. Change week here. Do them in order if you can, but you can open any lesson at any time.' },
  { go: 0, sel: '[data-tour=tabs]', title: 'Five lessons a week', text: 'Words, Grammar, Reading, Listening and Writing. A tick appears when a lesson is finished.' },
  { go: 4, sel: '[data-tour=audio]', title: 'Listening', text: 'Press play and listen twice, like in the exam. Open the transcript only after you have tried the questions.' },
  { go: 1, sel: '[data-tour=exercise]', title: 'Exercises', text: 'Tap or type your answer. Right? It turns green at once. Wrong? It turns red and you try again, and the question is saved in Improve my mistakes. Hugo sees your first attempt, so do your best the first time.' },
  { go: 5, sel: '[data-tour=free]', title: 'Writing to Hugo', text: 'Type your text and press Send to Hugo. He reads it and gives you feedback when you are back in class.' },
  { go: 6, sel: '[data-tour=result]', title: 'Your result', text: 'Your scores and what to repeat. Come back here whenever you want to see how you are doing.' },
]

const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)

function LessonHead({ tag, title, aim }: { tag: string; title: string; aim?: string }) {
  return (
    <div className="lesson-header">
      <span className="lesson-tag">{tag}</span>
      <div className="lesson-head-text">
        <h2 className="lesson-title">{title}</h2>
        {aim && <p className="lesson-aim">{aim}</p>}
      </div>
    </div>
  )
}

function ExerciseCard(props: { act: Activity; ex: Exercise; progress: Progress; update: (fn: (p: Progress) => Progress) => void }) {
  const [tag, ...rest] = props.ex.title.split(' · ')
  return <ExerciseCardBase {...props} head={<LessonHead tag={tag} title={rest.join(' · ') || props.ex.title} aim={props.ex.how} />} />
}

function TextCard({ t }: { t: ReadText }) {
  const [tag, ...rest] = t.title.split(' · ')
  return (
    <section className="card reading-card">
      <LessonHead tag={tag} title={rest.join(' · ') || t.title} aim="Read the text first. You can look at it while you answer." />
      <div className="reading-text">{t.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
    </section>
  )
}

function TrackCard({ k }: { k: Track }) {
  const [open, setOpen] = useState(false)
  const [tag, ...rest] = k.title.split(' · ')
  return (
    <section className="card">
      <LessonHead tag={tag} title={rest.join(' · ') || k.title} aim={`${k.intro} Listen twice.`} />
      <div className="audio-block" data-tour="audio">
        <audio controls preload="none" style={{ width: '100%' }} src={k.src} />
      </div>
      <button type="button" className="help-btn" onClick={() => setOpen(v => !v)}>
        {open ? 'Hide' : 'Show'} the transcript <small>(after you have tried the questions)</small>
      </button>
      {open && (
        <div className="script" style={{ position: 'static', marginTop: '1rem' }}>
          {k.script.map((l, i) => <div key={i} className="script-line"><span className="who">{l.who}</span>{l.text}</div>)}
        </div>
      )}
    </section>
  )
}

function FreeCard({ act, task, progress, update }: {
  act: Activity; task: FreeTask; progress: Progress; update: (fn: (p: Progress) => Progress) => void
}) {
  const key = `${act.id}:${task.id}`
  const stored = progress.writing?.[key]
  const [lines, setLines] = useState<string[]>(task.prompts.map(() => ''))
  const [loaded, setLoaded] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (stored && !loaded) {
      const parts = stored.text.split('\n')
      setLines(task.prompts.map((_, i) => parts[i] ?? ''))
      setLoaded(true); setSent(true)
    }
  }, [stored, loaded, task.prompts])

  const words = wordCount(lines.join(' '))
  const [tag, ...rest] = task.title.split(' · ')
  function send() {
    update(p => ({ ...p, writing: { ...(p.writing ?? {}), [key]: { text: lines.join('\n'), at: Date.now() } } }))
    setSent(true)
  }

  return (
    <section className="card" data-tour="free">
      <LessonHead tag={rest.length ? tag : 'Writing'} title={rest.join(' · ') || task.title} aim={task.how} />
      {task.prompts.map((pr, i) => (
        <label key={i} className="write-field">
          {(task.prompts.length > 1 || pr !== 'Your email') && <span className="write-label">{pr}</span>}
          <textarea className="write-area" rows={task.prompts.length === 1 ? 12 : 2} value={lines[i]}
            onChange={e => { setSent(false); setLines(l => l.map((x, n) => (n === i ? e.target.value : x))) }} />
        </label>
      ))}
      <div className="row">
        <button className="btn" onClick={send} disabled={words === 0}>Send to Hugo</button>
        <span className={`words-count${words >= task.minWords ? ' enough' : ''}`}>{words} / {task.minWords} words</span>
        {sent && stored && <span className="saved-note">Sent ✓</span>}
      </div>
      {sent && task.model && (
        <div className="tip-box"><strong>A model to compare with</strong>{task.model.split('\n').map((l, i) => <p key={i}>{l}</p>)}</div>
      )}
    </section>
  )
}

function Wave({ seed }: { seed: number }) {
  const bars = Array.from({ length: 84 }, (_, i) => 14 + Math.abs(Math.sin((i + seed) * 0.52) * Math.cos((i + seed) * 0.19)) * 78)
  return <div className="wave" aria-hidden>{bars.map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}</div>
}

export default function SoundTechPage() {
  const { progress, update, student, synced } = useProgress(COURSE_ID)
  const [week, setWeek] = useState(1)
  const [step, setStep] = useState(0)
  const [tour, setTour] = useState(false)

  const weekActs = ACTIVITIES.filter(a => a.week === week)
  const STEPS: Meta[] = [
    COVER,
    ...weekActs.map(a => ({ ...LOOK[a.skill], tag: `Week ${a.week} · Lesson ${a.no}`, title: a.title, aim: a.blurb })),
    RESULT,
  ]
  const isDone = (a: Activity) =>
    a.exercises.every(e => progress.lessons[`${a.id}.${e.id}`]) &&
    (a.free ?? []).every(f => progress.writing?.[`${a.id}:${f.id}`]) &&
    a.exercises.length + (a.free?.length ?? 0) > 0
  const doneIds = new Set(ACTIVITIES.filter(isDone).map(a => a.id))
  const toImprove = openMistakeIds(progress).length
  const m = STEPS[step]
  const act = step > 0 && step <= weekActs.length ? weekActs[step - 1] : null
  const isResult = step === STEPS.length - 1
  const vars = { '--accent': m.accent, '--accent-lt': m.accentLt } as React.CSSProperties
  const first = student?.name ? student.name.charAt(0).toUpperCase() + student.name.slice(1) : ''
  const weekDone = (n: number) => ACTIVITIES.filter(a => a.week === n && doneIds.has(a.id)).length

  function go(i: number) {
    setStep(i)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function openLesson(w: number, i: number) {
    setWeek(w); go(i)
  }
  function changeWeek(w: number) {
    setWeek(w); setStep(0)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mag" style={vars}>
      <header className="site-header">
        <div className="site-header__top">
          <SomersetLogo variant="white" />
          <span className="unit-label">English for Sound Technicians · Digital course</span>
          <Link href="/student" className="corner-link" data-tour="corner" aria-label="Back to Student's Corner">←<span className="hide-sm"> Student&apos;s Corner</span></Link>
        </div>
        <div className="week-switch" data-tour="weeks" role="tablist" aria-label="Weeks">
          {WEEKS.map(w => (
            <button key={w.n} type="button" role="tab" aria-selected={w.n === week} className={`week-btn${w.n === week ? ' on' : ''}`} onClick={() => changeWeek(w.n)}>
              <span className="week-n">Week {w.n}</span>
              <span className="week-t">{w.title}</span>
              {weekDone(w.n) === 5 && <span className="nav-tick">✓</span>}
            </button>
          ))}
        </div>
        <nav className="lesson-nav" aria-label="Lessons" data-tour="tabs">
          {STEPS.map((s, i) => {
            const a = i > 0 && i <= weekActs.length ? weekActs[i - 1] : null
            const d = a ? doneIds.has(a.id) : false
            return (
              <button key={`${s.nav}${i}`} onClick={() => go(i)}
                className={`nav-btn${i === step ? ' active' : ''}${d ? ' done' : ''}`}
                style={i === step ? { borderBottomColor: s.accent } : undefined}>
                {d && i !== step ? <span className="nav-tick">✓</span> : <span className="nav-num">{i === 0 ? '◆' : i}</span>}
                {s.nav}
              </button>
            )
          })}
          <Link href="/courses/sound-tech-english/revise" className="nav-btn nav-btn--revise" data-tour="revise">
            Improve my mistakes{toImprove > 0 && <span className="nav-badge">{toImprove}</span>}
          </Link>
        </nav>
      </header>

      <section className={`hero hero--wave${step === 0 ? ' hero--cover' : ''}`} key={`hero-${week}-${step}`}>
        <Wave seed={week * 7 + step * 3} />
        <div className="hero-overlay">
          <p className="hero-label" style={{ color: m.accentLt }}>Somerset Language Centre · {m.tag}</p>
          <h1 className="hero-title">{m.title}</h1>
          <p className="hero-sub">{m.aim}</p>
        </div>
      </section>

      <div className="goals-strip">
        <div className="goals-inner">
          <div className="seg-bar" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => {
              const a = i > 0 && i <= weekActs.length ? weekActs[i - 1] : null
              return <span key={i} className={`seg${a && doneIds.has(a.id) ? ' seg--done' : ''}${i === step ? ' seg--now' : ''}`}
                style={i === step ? { background: s.accent } : undefined} />
            })}
          </div>
          <div className="goals-row">
            <span className="goal-text">Week {week} · Step {step + 1} of {STEPS.length} · <strong>{m.nav}</strong></span>
            <span className="goal-text goal-text--right">
              {weekDone(week)} of {weekActs.length} lessons done this week
              {student ? ` · ${synced === 'saved' ? 'saved' : synced === 'saving' ? 'saving…' : synced === 'offline' ? 'saved on this device' : ''}` : ''}
            </span>
          </div>
        </div>
      </div>

      <main className="page-wrap">
        <div className="lesson" key={`step-${week}-${step}`}>
          {step === 0 && (
            <>
              {!student && (
                <section className="card">
                  <LessonHead tag="Sign in" title="Open Student's Corner first" aim="Type your name and your code there, then come back. That way your work is saved and Hugo can see it." />
                  <div className="row"><Link className="btn" href="/student">Go to Student&apos;s Corner</Link></div>
                </section>
              )}
              <div className="two-col-40">
                <aside className="intro-card">
                  <p className="dropcap-text">
                    <span className="dropcap">H</span>i{first ? ` ${first}` : ''}! This course is about the English a sound technician needs: the equipment, the problems, and the people you will work with. Your internship in Bratislava is the goal.
                  </p>
                  <p className="intro-sub">In class we only speak, so everything else is here: words, grammar, reading, listening and writing. Do it between our classes, whenever you want. Your answers are checked at once, and your writing goes to Hugo.</p>
                  <ul className="goal-list">
                    <li>Week 1: the kit, and how to give clear instructions</li>
                    <li>Week 2: describing problems, finding causes, fixing them</li>
                    <li>Week 3: polite requests, schedules and safety rules</li>
                    <li>Reading, listening and writing in the shape of your exam</li>
                  </ul>
                  <div className="intro-video"><button type="button" className="explain-btn" onClick={() => setTour(true)}><span className="explain-play" aria-hidden>▶</span>How this course works</button></div>
                </aside>
                <div>
                  {WEEKS.map(w => (
                    <section key={w.n} className="card" data-tour={w.n === 1 ? 'lessons' : undefined}>
                      <LessonHead tag={`Week ${w.n}`} title={w.title} aim={w.aim} />
                      <div className="lm-grid">
                        {ACTIVITIES.filter(a => a.week === w.n).map((a, i) => {
                          const l = LOOK[a.skill]
                          const scores = a.exercises.map(e => progress.lessons[`${a.id}.${e.id}`]?.score).filter((x): x is number => x !== undefined)
                          const avg = scores.length ? Math.round(scores.reduce((p, c) => p + c, 0) / scores.length) : null
                          const d = doneIds.has(a.id)
                          return (
                            <button key={a.id} type="button" className={`lm-item${d ? ' done' : ''}`} onClick={() => openLesson(w.n, i + 1)}
                              style={{ '--accent': l.accent, '--accent-lt': l.accentLt } as React.CSSProperties}>
                              <span className="lm-num">{d ? '✓' : i + 1}</span>
                              <span className="lm-body">
                                <span className="lm-title">{l.nav}</span>
                                <span className="lm-meta">{a.time}{d && avg !== null ? ` · ${avg}%` : ''}</span>
                              </span>
                              <span className="sc-chev">›</span>
                            </button>
                          )
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </>
          )}

          {act && (
            <>
              {act.exercises.map(e => {
                const t = e.text ? act.texts?.find(x => x.id === e.text) : undefined
                const k = e.track ? act.tracks?.find(x => x.id === e.track) : undefined
                return (
                  <div key={`${act.id}${e.id}`}>
                    {t && <TextCard t={t} />}
                    {k && <TrackCard k={k} />}
                    <ExerciseCard act={act} ex={e} progress={progress} update={update} />
                  </div>
                )
              })}
              {(act.free ?? []).map(f => <FreeCard key={`${act.id}${f.id}`} act={act} task={f} progress={progress} update={update} />)}
              <div className="row">
                {step > 1 && <button className="btn btn--ghost" onClick={() => go(step - 1)}>← Back</button>}
                <button className="btn" onClick={() => go(step + 1)}>{step < weekActs.length ? 'Next lesson →' : 'See my result →'}</button>
              </div>
            </>
          )}

          {isResult && (
            <>
              <section className="card">
                <LessonHead tag="Improve" title={toImprove ? `${toImprove} to improve` : 'Improve my mistakes'} aim="Every question you got wrong comes back here, so you can practise it again." />
                <div className="row"><Link className="btn" href="/courses/sound-tech-english/revise">Improve my mistakes{toImprove ? ` (${toImprove})` : ''}</Link></div>
              </section>
              <section className="card" data-tour="result">
                <LessonHead tag="Scores" title={`Week ${week}: your first attempts`} aim="The first time you answered each exercise. You can always try again for practice." />
                <div className="task-list">
                  {weekActs.flatMap((a, ai) => a.exercises.map(e => {
                    const sc = progress.lessons[`${a.id}.${e.id}`]
                    const low = sc && sc.score < 70
                    return (
                      <div key={`${a.id}${e.id}`} className={`task-row task-row--inline${sc ? (low ? ' bad' : ' ok') : ''}`}>
                        <span className="num">{ai + 1}</span>
                        <div className="task-text">{LOOK[a.skill].nav} · {e.title.split(' · ').slice(1).join(' · ') || e.title}</div>
                        <span className={`mark ${low ? 'bad' : sc ? 'ok' : ''}`}>{sc ? `${sc.score}%` : 'not done'}</span>
                        <button className="help-btn" onClick={() => go(ai + 1)}>{sc ? 'Open' : 'Start'}</button>
                      </div>
                    )
                  }))}
                </div>
              </section>
              <section className="card">
                <LessonHead tag="Writing" title="What you sent to Hugo" aim="Hugo reads it and gives you feedback when you are back in class." />
                <div className="task-list">
                  {ACTIVITIES.flatMap(a => (a.free ?? []).map(f => {
                    const w = progress.writing?.[`${a.id}:${f.id}`]
                    return (
                      <div key={`${a.id}${f.id}`} className={`task-row task-row--inline${w ? ' ok' : ''}`}>
                        <span className="num">{a.week}</span>
                        <div className="task-text">Week {a.week} · {f.title.split(' · ').slice(1).join(' · ') || f.title}</div>
                        <span className={`mark ${w ? 'ok' : ''}`}>{w ? 'sent ✓' : 'not sent'}</span>
                        <button className="help-btn" onClick={() => openLesson(a.week, a.no)}>{w ? 'Open' : 'Write'}</button>
                      </div>
                    )
                  }))}
                </div>
                <div className="row"><button className="btn btn--ghost" onClick={() => go(0)}>Back to the start</button></div>
              </section>
            </>
          )}
        </div>
      </main>
      {tour && <Tour steps={TOUR} onGo={i => setStep(i)} onClose={() => { setTour(false); go(0) }} />}
    </div>
  )
}
