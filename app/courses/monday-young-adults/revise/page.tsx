'use client'

// Improve my mistakes: every item the student got wrong in the course comes back here,
// asked again with instant feedback. Two clean first-try answers (in different rounds)
// and the item leaves the list. What the student chose each time is kept for the teacher.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { useProgress } from '@/lib/courses/useProgress'
import { recordAnswer, addMistake, addFix, openMistakeIds, FIXED_AFTER, type Progress } from '@/lib/courses/progress'
import { ACTIVITIES, COURSE_ID, type Activity, type Exercise, type Item } from '@/lib/courses/mondayYoungAdults'
import { Listen, norm } from '../Exercise'

type Ref = { id: string; act: Activity; ex: Exercise; it: Item }
const REFS = new Map<string, Ref>()
for (const act of ACTIVITIES) for (const ex of act.exercises) for (const it of ex.items) {
  const id = `${act.id}.${ex.id}.${it.id}`.slice(0, 60)
  REFS.set(id, { id, act, ex, it })
}
const known = (id: string) => REFS.has(id)
const ROUND = 8
const CHEERS = ['Yes!', 'Perfect!', 'Spot on!', 'Great!', 'Nice one!', 'Fixed!']

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}

function rightText(r: Ref): string {
  const { it, ex } = r
  if (it.kind === 'gap') return it.answers[0]
  if (it.kind === 'choice') return it.options[it.answer]
  return ex.options?.[it.answer] ?? ''
}

function Card({ r, n, total, progress, update, onDone }: {
  r: Ref; n: number; total: number; progress: Progress
  update: (fn: (p: Progress) => Progress) => void
  onDone: (id: string, clean: boolean) => void
}) {
  const { it, ex } = r
  const [misses, setMisses] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [typed, setTyped] = useState('')
  const [shake, setShake] = useState(false)
  const was = progress.mistakes?.[r.id]

  const options: string[] = it.kind === 'choice' ? it.options : it.kind === 'match' ? (ex.options ?? []) : []

  function attempt(val: string) {
    if (done || val === '' || wrong.includes(norm(val))) return
    const ok = it.kind === 'gap' ? it.answers.map(norm).includes(norm(val)) : Number(val) === it.answer
    const first = misses === 0
    if (first) update(p => recordAnswer(p, r.id, ok))
    if (ok) {
      setDone(true)
      if (first) update(p => addFix(p, r.id))
      onDone(r.id, first)
    } else {
      setMisses(m => m + 1)
      setWrong(w => [...w, norm(val)])
      setShake(true); setTimeout(() => setShake(false), 450)
      const pick = it.kind === 'gap' ? val : (options[Number(val)] ?? val)
      update(p => addMistake(p, r.id, pick))
    }
  }

  return (
    <section className="card" data-tour="exercise">
      <div className="lesson-header">
        <span className="lesson-tag">{n} / {total}</span>
        <div className="lesson-head-text">
          <h2 className="lesson-title">{r.act.title}</h2>
          <p className="lesson-aim">{r.ex.title.replace(' · ', ': ')}{was ? ` · missed ${was.n} ${was.n === 1 ? 'time' : 'times'}` : ''}</p>
        </div>
      </div>

      {it.kind === 'gap' && ex.bank && <div className="chips chips--static">{ex.bank.map(w => <span key={w} className="chip chip--static">{w}</span>)}</div>}

      <div className={`task-row ex-row${done && misses === 0 ? ' ex-win' : ''}${done && misses > 0 ? ' ex-redo' : ''}${shake ? ' bad' : ''}`}>
        <div className="task-text">
          {it.kind === 'gap' && (
            <>
              {it.before}{' '}
              {done
                ? <b className="ex-word">{it.answers[0]}</b>
                : <input className={`gap-input${shake ? ' gap-bad' : ''}`} value={typed}
                    onChange={e => { const v = e.target.value; setTyped(v); if (it.answers.map(norm).includes(norm(v))) attempt(v) }}
                    onBlur={e => attempt(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') attempt((e.target as HTMLInputElement).value) }}
                    autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label="Your answer" />}
              {it.after ? ` ${it.after}` : ''}
            </>
          )}
          {it.kind !== 'gap' && <span>{it.q}</span>}
          {it.kind !== 'gap' && done && <> <b className="ex-word">{rightText(r)}</b></>}
          {it.kind !== 'gap' && !done && (
            <div className={`oc-grid${options.join('').length > 60 ? ' oc-grid--long' : ''}`}>
              {options.map((o, i) => (
                <div key={i} className={`oc-card${wrong.includes(String(i)) ? ' oc-bad' : ''}`}>
                  <button type="button" className="oc-main" disabled={wrong.includes(String(i))} onClick={() => attempt(String(i))}>
                    <span className="oc-text">{o}</span>
                  </button>
                  <Listen text={o} />
                </div>
              ))}
            </div>
          )}
          {done && misses === 0 && <span className="ex-cheer">{CHEERS[n % CHEERS.length]}</span>}
          {done && misses > 0 && <span className="ex-revise">it will come back in your next round</span>}
        </div>
      </div>
      {done && <div className="tip-box"><strong>En español</strong><p>{ex.es}</p></div>}
    </section>
  )
}

export default function ImproveMyMistakes() {
  const { progress, update, student, synced } = useProgress(COURSE_ID)
  const open = useMemo(() => openMistakeIds(progress, known), [progress])
  const everMissed = Object.keys(progress.mistakes ?? {}).filter(known).length
  const [queue, setQueue] = useState<string[] | null>(null)
  const [pos, setPos] = useState(0)
  const [cleanCount, setCleanCount] = useState(0)
  const [answered, setAnswered] = useState(false)

  function start() {
    // Least-practised first, then oldest miss; a shuffle inside that keeps rounds from feeling identical.
    const ids = shuffle(open).sort((a, b) => (progress.mistakes![a].fixes - progress.mistakes![b].fixes) || (progress.mistakes![a].at - progress.mistakes![b].at))
    setQueue(ids.slice(0, ROUND)); setPos(0); setCleanCount(0); setAnswered(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Per-lesson count for the start screen.
  const byLesson = ACTIVITIES.map(a => ({ a, n: open.filter(id => REFS.get(id)?.act.id === a.id).length })).filter(x => x.n > 0)
  const finished = queue !== null && pos >= queue.length
  const first = student?.name ? student.name.charAt(0).toUpperCase() + student.name.slice(1) : ''

  return (
    <div className="mag" style={{ '--accent': '#E1614C', '--accent-lt': '#fdf0ed' } as React.CSSProperties}>
      <header className="site-header">
        <div className="site-header__top">
          <SomersetLogo variant="white" />
          <span className="unit-label">Monday Young Adults · Improve my mistakes</span>
          <Link href="/courses/monday-young-adults" className="corner-link" aria-label="Back to the course">←<span className="hide-sm"> Back to the course</span></Link>
        </div>
      </header>

      <main className="page-wrap">
        <div className="lesson">
          {!student && (
            <section className="card">
              <div className="lesson-header"><span className="lesson-tag">Sign in</span>
                <div className="lesson-head-text"><h2 className="lesson-title">Open Student&apos;s Corner first</h2>
                  <p className="lesson-aim">Type your name and your code there, then come back. Your mistakes are saved under your name.</p></div></div>
              <div className="row"><Link className="btn" href="/student">Go to Student&apos;s Corner</Link></div>
            </section>
          )}

          {student && queue === null && (
            <section className="card">
              <div className="lesson-header"><span className="lesson-tag">Improve</span>
                <div className="lesson-head-text">
                  <h2 className="lesson-title">{open.length ? `${first ? first + ', ' : ''}${open.length} to improve` : 'Nothing to improve yet'}</h2>
                  <p className="lesson-aim">{open.length
                    ? `The questions you got wrong come back here. Get one right first time ${FIXED_AFTER} times and it leaves your list.`
                    : everMissed
                      ? 'You have fixed every mistake so far. Well done. New ones will appear here as you do the lessons.'
                      : 'When you get an answer wrong in a lesson, it comes back here so you can practise it again.'}</p>
                </div>
              </div>
              {byLesson.length > 0 && (
                <ul className="mist-list">
                  {byLesson.map(({ a, n }) => <li key={a.id}><b>{a.title}</b> · {n}</li>)}
                </ul>
              )}
              <p className="saved-note">{synced === 'saved' ? 'Saved' : synced === 'saving' ? 'Saving…' : synced === 'offline' ? 'Saved on this device' : ''}</p>
              <div className="row">
                {open.length > 0 && <button className="btn" onClick={start}>Start: {Math.min(open.length, ROUND)} questions</button>}
                <Link className="btn btn--ghost" href="/courses/monday-young-adults">Back to the lessons</Link>
              </div>
            </section>
          )}

          {student && queue !== null && !finished && (
            <>
              <Card key={queue[pos]} r={REFS.get(queue[pos])!} n={pos + 1} total={queue.length} progress={progress} update={update}
                onDone={(_, clean) => { setAnswered(true); if (clean) setCleanCount(c => c + 1) }} />
              {answered && (
                <div className="row">
                  <button className="btn" onClick={() => { setPos(p => p + 1); setAnswered(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                    {pos + 1 < queue.length ? 'Next →' : 'Finish'}
                  </button>
                </div>
              )}
            </>
          )}

          {student && finished && queue && (
            <section className="card">
              <div className="lesson-header"><span className="lesson-tag">Done</span>
                <div className="lesson-head-text">
                  <h2 className="lesson-title">{cleanCount} of {queue.length} right first time</h2>
                  <p className="lesson-aim">{open.length ? `${open.length} still on your list. Another round?` : 'Your list is empty. Well done!'}</p>
                </div>
              </div>
              <div className="row">
                {open.length > 0 && <button className="btn" onClick={start}>Another round</button>}
                <Link className="btn btn--ghost" href="/courses/monday-young-adults">Back to the lessons</Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
