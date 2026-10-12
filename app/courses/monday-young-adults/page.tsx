'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CourseShell, NavLink } from '../_kit'
import Tour, { type TourStep } from './Tour'
import ExerciseCardBase from './Exercise'
import { useProgress } from '@/lib/courses/useProgress'
import { recordAnswer, openMistakeIds, type Progress } from '@/lib/courses/progress'
import { photo, type PhotoKey } from '@/lib/courses/photosMya'
import {
  ACTIVITIES, COURSE_ID, FACT_FILE, LAMU_TRANSCRIPT,
  type Activity, type Exercise, type FreeTask, type Item,
} from '@/lib/courses/mondayYoungAdults'

// Same look as the PET course (b1-unit-1): dark header, lesson tabs, photo hero, segmented
// progress strip, white lesson cards. Styles come from ../b1-unit-1/course.css (.mag).

type Meta = { nav: string; tag: string; title: string; aim: string; accent: string; accentLt: string; photo: PhotoKey }
const COVER: Meta = { nav: 'Start', tag: 'Digital course', title: 'Festivals Around the World', aim: 'Valencia · Lamu · Glastonbury · comparing and talking about the past', accent: '#6BAE2E', accentLt: '#eaf4da', photo: 'glastonbury-tor' }
const LOOK: Record<string, { nav: string; accent: string; accentLt: string; photo: PhotoKey }> = {
  'lamu-listen': { nav: 'Listening', accent: '#6A4C93', accentLt: '#efeaf6', photo: 'hemisferic' },
  compare: { nav: 'Comparing', accent: '#E1614C', accentLt: '#fdf0ed', photo: 'mercat-central' },
  'then-now': { nav: 'Then & now', accent: '#3E8FB0', accentLt: '#e8f4f9', photo: 'fruit-stall' },
  words: { nav: 'Words', accent: '#E8A33D', accentLt: '#fef5e4', photo: 'glastonbury-tor' },
  'small-words': { nav: 'Small words', accent: '#4d8520', accentLt: '#eaf4da', photo: 'mercat-central' },
  writing: { nav: 'Writing', accent: '#1A1A1A', accentLt: '#f5f5f3', photo: 'fruit-stall' },
}
const RESULT: Meta = { nav: 'Result', tag: 'Digital course', title: 'How did it go?', aim: 'Your scores, what to look at again, and the writing you sent to Hugo.', accent: '#6BAE2E', accentLt: '#eaf4da', photo: 'glastonbury-tor' }
const STEPS: Meta[] = [
  COVER,
  ...ACTIVITIES.map(a => ({ ...LOOK[a.id], tag: `Lesson ${String.fromCharCode(64 + a.no)}`, title: a.title, aim: a.blurb })),
  RESULT,
]

const TOUR: TourStep[] = [
  { go: 0, sel: '[data-tour=corner]', title: 'Back to your courses', text: "This link takes you back to Student's Corner, where all your courses are. Your work is saved under your name, so you can continue on your phone or on your computer." },
  { go: 0, sel: '[data-tour=tabs]', title: 'The tabs are your lessons', text: 'Start, six lessons and Result. Do them in any order, whenever you want. A tick appears when a lesson is finished.' },
  { go: 0, sel: '[data-tour=lessons]', title: 'Your lessons', text: 'Or pick a lesson here. Each one shows how long it takes and your score when you finish it.' },
  { go: 0, sel: '[data-tour=worksheet]', title: 'The printed worksheet', text: 'The Festivals Practice Pack as a PDF, with the answers in Spanish and the transcript at the back.' },
  { go: 1, sel: '[data-tour=audio]', title: 'Listening', text: 'Press play and listen twice. Open the transcript only after you have tried the exercises.' },
  { go: 1, sel: '[data-tour=exercise]', title: 'Exercises', text: 'Tap or type your answer. Right? It turns green at once. Wrong? It turns red and you try again, and the question is saved in the Improve my mistakes tab. Hugo sees your first attempt, so do your best the first time.' },
  { go: 1, sel: '[data-tour=free]', title: 'Writing to Hugo', text: 'Type your sentences and press Send to Hugo. He reads them and gives you feedback in class.' },
  { go: 7, sel: '[data-tour=result]', title: 'Your result', text: 'Your scores and what to repeat. Come back here whenever you want to see how you are doing.' },
]

type Answers = Record<string, string>
const norm = (s: string) => s.toLowerCase().replace(/[.,;:!?"']+$/g, '').replace(/\s+/g, ' ').trim()
const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)

function isRight(item: Item, a: string | undefined): boolean {
  if (a === undefined || a === '') return false
  if (item.kind === 'gap') return item.answers.map(norm).includes(norm(a))
  return Number(a) === item.answer
}

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
          {(task.prompts.length > 1 || pr !== 'Your text') && <span className="write-label">{pr}</span>}
          <textarea className="write-area" rows={task.prompts.length === 1 ? 9 : 2} value={lines[i]}
            onChange={e => { setSent(false); setLines(l => l.map((x, n) => (n === i ? e.target.value.replace(/\n/g, ' ') : x))) }} />
        </label>
      ))}
      <div className="row">
        <button className="btn" onClick={send} disabled={words === 0}>Send to Hugo</button>
        <span className={`words-count${words >= task.minWords ? ' enough' : ''}`}>{words} / {task.minWords} words</span>
        {sent && stored && <span className="saved-note">Sent ✓</span>}
      </div>
      {sent && task.model && <div className="tip-box"><strong>Modelo</strong><p>{task.model}</p></div>}
    </section>
  )
}

export default function MondayYoungAdultsPage() {
  const { progress, update, student, synced } = useProgress(COURSE_ID)
  const [step, setStep] = useState(0)
  const [showScript, setShowScript] = useState(false)
  const [showFacts, setShowFacts] = useState(false)
  const [tour, setTour] = useState(false)

  const done = ACTIVITIES.map(a =>
    a.exercises.every(e => progress.lessons[`${a.id}.${e.id}`]) &&
    (a.free ?? []).every(f => progress.writing?.[`${a.id}:${f.id}`]) &&
    a.exercises.length + (a.free?.length ?? 0) > 0)
  const doneCount = done.filter(Boolean).length
  const toImprove = openMistakeIds(progress).length
  const m = STEPS[step]
  const act = step > 0 && step <= ACTIVITIES.length ? ACTIVITIES[step - 1] : null
  const isResult = step === STEPS.length - 1
  const ph = photo(m.photo)
  const first = student?.name ? student.name.charAt(0).toUpperCase() + student.name.slice(1) : ''

  function go(i: number) {
    setStep(i); setShowScript(false)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <CourseShell
      scope="mag"
      accent={m.accent} accentLt={m.accentLt}
      label="Monday Young Adults · Digital course"
      links={[{ href: '/student', label: <>←<span className="ck-hide-sm"> Student&apos;s Corner</span></>, tour: 'corner', ariaLabel: "Back to Student's Corner" }]}
      steps={STEPS} step={step} onGo={go} canGo={() => true} isDone={i => i > 0 && done[i - 1]}
      navExtra={<NavLink href="/courses/monday-young-adults/revise" badge={toImprove} tour="revise">Improve my mistakes</NavLink>}
      hero={{
        src: ph.src, alt: ph.alt, focus: ph.focus,
        credit: { author: ph.author, licence: ph.licence, page: ph.page },
        tag: `Somerset Young Adults · ${m.tag}`, title: m.title, aim: m.aim,
      }}
      stripLeft={<>Step {step + 1} of {STEPS.length} · <strong>{m.nav}</strong></>}
      stripRight={<>
        {doneCount} of {ACTIVITIES.length} lessons done
        {student ? ` · ${synced === 'saved' ? 'saved' : synced === 'saving' ? 'saving…' : synced === 'offline' ? 'saved on this device' : ''}` : ''}
      </>}
    >
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
                    <span className="dropcap">H</span>i{first ? ` ${first}` : ''}! This course is about festivals: the ones in Valencia, one on an island in Kenya, and the big names in England and Australia. You compare them, talk about how they began, and write about one you know.
                  </p>
                  <p className="intro-sub">Six short lessons, in any order and at your own pace. You check your own answers, you hear a real-sounding conversation from Lamu, and you send one piece of writing to Hugo.</p>
                  <ul className="goal-list">
                    <li>Comparatives and superlatives: bigger, older, the most famous</li>
                    <li>Past simple for how things began, present simple for how they are now</li>
                    <li>Festival vocabulary and British spelling</li>
                    <li>A listening, a writing and the small words after verbs</li>
                  </ul>
                  <div className="intro-video"><button type="button" className="explain-btn" onClick={() => setTour(true)}><span className="explain-play" aria-hidden>▶</span>How this course works</button></div>
                </aside>
                <div>
                  <section className="card" data-tour="lessons">
                    <LessonHead tag="Your lessons" title="Pick up where you left off" aim="Do them in any order. Everything you finish is saved to your account." />
                    <div className="lm-grid">
                      {ACTIVITIES.map((a, i) => {
                        const l = STEPS[i + 1]
                        const scores = a.exercises.map(e => progress.lessons[`${a.id}.${e.id}`]?.score).filter((x): x is number => x !== undefined)
                        const avg = scores.length ? Math.round(scores.reduce((p, c) => p + c, 0) / scores.length) : null
                        return (
                          <button key={a.id} type="button" className={`lm-item${done[i] ? ' done' : ''}`} onClick={() => go(i + 1)}
                            style={{ '--accent': l.accent, '--accent-lt': l.accentLt } as React.CSSProperties}>
                            <span className="lm-num">{done[i] ? '✓' : i + 1}</span>
                            <span className="lm-body">
                              <span className="lm-title">{l.nav}</span>
                              <span className="lm-meta">{a.time}{done[i] && avg !== null ? ` · ${avg}%` : ''}</span>
                            </span>
                            <span className="sc-chev">›</span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                  <section className="card" data-tour="worksheet">
                    <LessonHead tag="Worksheet" title="Festivals Practice Pack" aim="The printed sheet: answers in Spanish and the transcript at the back." />
                    <div className="row" style={{ marginTop: 0 }}>
                      <a className="btn" href="/courses/monday-young-adults/festivals-practice-pack.pdf" target="_blank" rel="noopener">Open the worksheet (PDF)</a>
                      <button type="button" className="help-btn" onClick={() => setShowFacts(v => !v)}>{showFacts ? 'Hide' : 'Show'} the fact file</button>
                    </div>
                    {showFacts && (
                      <div className="grammar-box" style={{ marginTop: '1rem', overflowX: 'auto' }}>
                        <h4>Six festivals</h4>
                        <table>
                          <thead><tr>{FACT_FILE.head.map(h => <th key={h}>{h}</th>)}</tr></thead>
                          <tbody>{FACT_FILE.rows.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
                        </table>
                        <p className="fact-note">{FACT_FILE.note}</p>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </>
          )}

          {act && (
            <>
              {act.audio && (
                <section className="card">
                  <LessonHead tag="Listen" title="Inés meets Juma in Lamu" aim="Inés is a tourist from Valencia. Juma is a guide on Lamu, an island in Kenya. Listen twice." />
                  <div className="audio-block" data-tour="audio">
                    <audio controls preload="none" style={{ width: '100%' }} src="/courses/monday-young-adults/audio/lamu-listening.mp3" />
                  </div>
                  <button type="button" className="help-btn" onClick={() => setShowScript(v => !v)}>
                    {showScript ? 'Hide' : 'Show'} the transcript <small>(after you have tried the exercises)</small>
                  </button>
                  {showScript && (
                    <div className="script" style={{ position: 'static', marginTop: '1rem' }}>
                      {LAMU_TRANSCRIPT.map((l, i) => <div key={i} className="script-line"><span className="who">{l.who}</span>{l.text}</div>)}
                    </div>
                  )}
                </section>
              )}
              {act.exercises.map(e => <ExerciseCard key={`${act.id}${e.id}`} act={act} ex={e} progress={progress} update={update} />)}
              {(act.free ?? []).map(f => <FreeCard key={`${act.id}${f.id}`} act={act} task={f} progress={progress} update={update} />)}
              <div className="row">
                {step > 1 && <button className="btn btn--ghost" onClick={() => go(step - 1)}>← Back</button>}
                <button className="btn" onClick={() => go(step + 1)}>{step < ACTIVITIES.length ? 'Next lesson →' : 'See my result →'}</button>
              </div>
            </>
          )}

          {isResult && (
            <>
              <section className="card">
                <LessonHead tag="Improve" title={toImprove ? `${toImprove} to improve` : 'Improve my mistakes'} aim="Every question you got wrong comes back here, so you can practise it again." />
                <div className="row"><Link className="btn" href="/courses/monday-young-adults/revise">Improve my mistakes{toImprove ? ` (${toImprove})` : ''}</Link></div>
              </section>
              <section className="card" data-tour="result">
                <LessonHead tag="Scores" title="Your first attempts" aim="The first time you checked each exercise. You can always try again for practice." />
                <div className="task-list">
                  {ACTIVITIES.flatMap((a, ai) => a.exercises.map(e => {
                    const sc = progress.lessons[`${a.id}.${e.id}`]
                    const low = sc && sc.score < 70
                    return (
                      <div key={`${a.id}${e.id}`} className={`task-row task-row--inline${sc ? (low ? ' bad' : ' ok') : ''}`}>
                        <span className="num">{ai + 1}</span>
                        <div className="task-text">{STEPS[ai + 1].nav} · {e.title.split(' · ').slice(1).join(' · ') || e.title}</div>
                        <span className={`mark ${low ? 'bad' : sc ? 'ok' : ''}`}>{sc ? `${sc.score}%` : 'not done'}</span>
                        <button className="help-btn" onClick={() => go(ai + 1)}>{sc ? 'Open' : 'Start'}</button>
                      </div>
                    )
                  }))}
                </div>
              </section>
              <section className="card">
                <LessonHead tag="Writing" title="What you sent to Hugo" aim="Hugo reads it and gives you feedback in class." />
                <div className="task-list">
                  {ACTIVITIES.flatMap((a, ai) => (a.free ?? []).map(f => {
                    const w = progress.writing?.[`${a.id}:${f.id}`]
                    return (
                      <div key={`${a.id}${f.id}`} className={`task-row task-row--inline${w ? ' ok' : ''}`}>
                        <span className="num">{ai + 1}</span>
                        <div className="task-text">{STEPS[ai + 1].nav} · {f.title.split(' · ').slice(1).join(' · ') || f.title}</div>
                        <span className={`mark ${w ? 'ok' : ''}`}>{w ? 'sent ✓' : 'not sent'}</span>
                        <button className="help-btn" onClick={() => go(ai + 1)}>{w ? 'Open' : 'Write'}</button>
                      </div>
                    )
                  }))}
                </div>
                <div className="row"><button className="btn btn--ghost" onClick={() => go(0)}>Back to the start</button></div>
              </section>
            </>
          )}
      {tour && <Tour steps={TOUR} onGo={i => setStep(i)} onClose={() => { setTour(false); go(0) }} />}
    </CourseShell>
  )
}
