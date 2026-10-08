'use client'

import { useEffect, useState } from 'react'
import {
  DOCS, docsFor, deadlinesFor, parseDay, buildIcs,
  type DocId, type Nationality, type Purpose, type Route,
} from '@/lib/courses/spanishExpatsRuta'
import { Icon } from './icons'

type Status = 'todo' | 'booked' | 'done'
type Task = { status: Status; date?: string; time?: string; office?: string; ref?: string; bring?: Record<number, boolean> }
type Store = { arrival?: string; alta?: string; tasks: Partial<Record<DocId, Task>> }

const KEY = 'sexp:expediente'
const STATUS_LABEL: Record<Status, string> = { todo: 'To do', booked: 'Booked', done: 'Done' }

function fmtDay(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function countdown(d: Date): { text: string; tone: 'ok' | 'soon' | 'late' } {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (days < 0) return { text: `${-days} day${days === -1 ? '' : 's'} overdue`, tone: 'late' }
  if (days === 0) return { text: 'today', tone: 'late' }
  if (days === 1) return { text: 'tomorrow', tone: 'soon' }
  return { text: `in ${days} days`, tone: days <= 7 ? 'soon' : 'ok' }
}

const sayAudio = (id: DocId, i: number) => `/courses/spanish-expats/audio/say/${id}-${i}.mp3`

let current: HTMLAudioElement | null = null
function playSeq(srcs: string[]) {
  current?.pause()
  const next = (k: number) => {
    if (k >= srcs.length) return
    const a = new Audio(srcs[k])
    current = a
    a.onended = () => setTimeout(() => next(k + 1), 350)
    a.play().catch(() => {})
  }
  next(0)
}

function downloadIcs(name: string, ics: string) {
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function MiExpediente({ route, nat, purpose, onRead }: {
  route: Route; nat: Nationality; purpose: Purpose | null; onRead: (id: DocId) => void
}) {
  const [store, setStore] = useState<Store>({ tasks: {} })
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState<DocId | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
      if (saved?.tasks) setStore(saved)
    } catch { /* fresh */ }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* ignore */ }
  }, [store, loaded])

  const privateCover = purpose === 'retire' || purpose === 'study' || purpose === 'nomad'
  const ids = docsFor(route).filter(id => DOCS[id].booking && !(id === 'sip' && privateCover))
  const task = (id: DocId): Task => store.tasks[id] ?? { status: 'todo' }
  const setTask = (id: DocId, patch: Partial<Task>) =>
    setStore(s => ({ ...s, tasks: { ...s.tasks, [id]: { ...task(id), ...patch } } }))

  const done = ids.filter(id => task(id).status === 'done').length
  const arrival = parseDay(store.arrival)
  const alta = parseDay(store.alta)
  const deadlines = deadlinesFor(nat, purpose ?? 'retire', arrival, alta)
  const needsAlta = nat !== 'eu' && nat !== 'uk-old' && purpose === 'work'

  function clearAll() {
    if (window.confirm('Clear your expediente on this device? This cannot be undone.')) setStore({ tasks: {} })
  }

  return (
    <div className="card exp">
      <div className="exp-head">
        <div>
          <p className="exp-kicker">Mi expediente</p>
          <h2 className="exp-title">Your paperwork tracker</h2>
          <p className="exp-sub">Deadlines, appointments and what to bring — in one place. Come back to it as you go.</p>
        </div>
        <div className="exp-progress" aria-label={`${done} of ${ids.length} done`}>
          <strong>{done}<span>/{ids.length}</span></strong>
          <span>done</span>
          <div className="exp-bar"><div style={{ width: `${ids.length ? (done / ids.length) * 100 : 0}%` }} /></div>
        </div>
      </div>

      {nat !== 'uk-old' && (
        <div className="exp-dates">
          <label>
            <span>When do (or did) you arrive in Spain?</span>
            <input type="date" value={store.arrival ?? ''} onChange={e => setStore(s => ({ ...s, arrival: e.target.value || undefined }))} />
          </label>
          {needsAlta && (
            <label>
              <span>Social Security registration date (alta), when you have it</span>
              <input type="date" value={store.alta ?? ''} onChange={e => setStore(s => ({ ...s, alta: e.target.value || undefined }))} />
            </label>
          )}
        </div>
      )}

      {deadlines.length > 0 && (
        <ul className="exp-deadlines">
          {deadlines.map(d => {
            const isDone = task(d.doc).status === 'done'
            const cd = d.date ? countdown(d.date) : null
            return (
              <li key={d.label} className={isDone ? 'exp-dl--done' : undefined}>
                <div className="exp-dl__main">
                  <span className="exp-dl__label">{d.label}</span>
                  <span className={`exp-tag exp-tag--${d.legal ? 'legal' : 'tip'}`}>{d.legal ? 'Legal deadline' : 'Suggested'}</span>
                  <span className="exp-dl__note">{d.note}</span>
                </div>
                <div className="exp-dl__when">
                  {d.date ? (
                    <>
                      <span className="exp-dl__date">{fmtDay(d.date)}</span>
                      {isDone
                        ? <span className="exp-pill exp-pill--done">✓ done</span>
                        : <span className={`exp-pill exp-pill--${cd!.tone}`}>{cd!.text}</span>}
                      {!isDone && (
                        <button className="exp-mini" onClick={() => downloadIcs(`deadline-${d.doc}.ics`, buildIcs({
                          title: `Deadline: ${d.label}`, day: d.date!, alarm: '-P7D',
                          description: `${d.note} — Somerset · Mi expediente`,
                        }))}>Add to calendar</button>
                      )}
                    </>
                  ) : (
                    <span className="exp-dl__date exp-muted">{needsAlta && d.doc === 'tie' ? 'Add your alta date' : 'Add your arrival date'}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="exp-tasks">
        {ids.map(id => {
          const doc = DOCS[id]
          const t = task(id)
          const isOpen = open === id
          const bringDone = doc.bring ? doc.bring.filter((_, i) => t.bring?.[i]).length : 0
          const apptDay = parseDay(t.date)
          return (
            <div key={id} className={`exp-task exp-task--${t.status}${isOpen ? ' exp-task--open' : ''}`}>
              <button className="exp-task__head" onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen}>
                <span className="exp-dot" aria-hidden>{t.status === 'done' ? '✓' : ''}</span>
                <span className="exp-task__icon"><Icon name={id} size={30} /></span>
                <span className="exp-task__names">
                  <span className="exp-task__es">{doc.es}</span>
                  <span className="exp-task__en">
                    {t.status === 'booked' && apptDay ? `Appointment ${fmtDay(apptDay)}${t.time ? ` · ${t.time}` : ''}` : doc.en}
                  </span>
                </span>
                <span className={`exp-status exp-status--${t.status}`}>{STATUS_LABEL[t.status]}</span>
              </button>

              {isOpen && (
                <div className="exp-task__body">
                  <div className="exp-seg" role="group" aria-label="Status">
                    {(['todo', 'booked', 'done'] as Status[]).map(s => (
                      <button key={s} className={t.status === s ? 'on' : undefined} onClick={() => setTask(id, { status: s })}>{STATUS_LABEL[s]}</button>
                    ))}
                  </div>

                  {doc.booking && (
                    <section>
                      <h3>How to book</h3>
                      <p className="exp-muted">{doc.booking.how}</p>
                      <ol className="exp-steps">{doc.booking.steps.map(s => <li key={s}>{s}</li>)}</ol>
                      {doc.booking.url && (
                        <a className="btn btn--terra exp-go" href={doc.booking.url} target="_blank" rel="noopener noreferrer">
                          {doc.booking.urlLabel ?? 'Open the official website'} ↗
                        </a>
                      )}
                      {doc.booking.links && (
                        <div className="exp-links">
                          {doc.booking.links.filter(l => l.url !== doc.booking!.url).map(l => (
                            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                          ))}
                        </div>
                      )}
                      {doc.booking.checked && (
                        <p className="exp-checked">✓ Steps checked on the official website on {doc.booking.checked}. Websites change — if a label looks different, look for the closest match.</p>
                      )}
                    </section>
                  )}

                  <section>
                    <h3>Your appointment</h3>
                    <div className="exp-fields">
                      <label><span>Date</span><input type="date" value={t.date ?? ''} onChange={e => setTask(id, { date: e.target.value || undefined, status: e.target.value && t.status === 'todo' ? 'booked' : t.status })} /></label>
                      <label><span>Time</span><input type="time" value={t.time ?? ''} onChange={e => setTask(id, { time: e.target.value || undefined })} /></label>
                      <label className="exp-wide"><span>Office</span><input type="text" placeholder={doc.booking?.office ?? 'Where is it?'} value={t.office ?? ''} onChange={e => setTask(id, { office: e.target.value })} /></label>
                      <label className="exp-wide"><span>Appointment reference</span><input type="text" placeholder="From your confirmation" value={t.ref ?? ''} onChange={e => setTask(id, { ref: e.target.value })} /></label>
                    </div>
                    {apptDay && (
                      <button className="btn btn--outline" onClick={() => downloadIcs(`cita-${id}.ics`, buildIcs({
                        title: `Cita: ${doc.es}`, day: apptDay, time: t.time, alarm: '-P1D',
                        location: t.office || doc.booking?.office,
                        description: [t.ref && `Ref: ${t.ref}`, doc.bring && `Bring: ${doc.bring.join('; ')}`].filter(Boolean).join('\n'),
                      }))}>Add to calendar (reminder the day before)</button>
                    )}
                  </section>

                  {doc.bring && (
                    <section>
                      <h3>What to bring <span className="exp-count">{bringDone}/{doc.bring.length}</span></h3>
                      <ul className="exp-bring">
                        {doc.bring.map((b, i) => (
                          <li key={b}>
                            <label>
                              <input type="checkbox" checked={!!t.bring?.[i]} onChange={e => setTask(id, { bring: { ...t.bring, [i]: e.target.checked } })} />
                              <span>{b}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {doc.say && (
                    <section>
                      <h3>
                        Say it in Spanish
                        <button className="exp-mini exp-playall" onClick={() => playSeq(doc.say!.map((_, i) => sayAudio(id, i)))}>▶ Play the conversation</button>
                      </h3>
                      <ul className="exp-say">
                        {doc.say.map((p, i) => (
                          <li key={p.es} className={`exp-say--${p.who}`}>
                            <span className="exp-say__who">{p.who === 'you' ? 'You' : 'They say'}</span>
                            <span className="exp-say__es">
                              <button className="exp-play" onClick={() => playSeq([sayAudio(id, i)])} aria-label={`Listen: ${p.es}`}>▶</button>
                              {p.es}
                            </span>
                            <span className="exp-say__en">{p.en}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <button className="ruta-link" onClick={() => onRead(id)}>Read the full guide for {doc.es} →</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="exp-foot">
        <span className="exp-privacy"><Icon name="lock" size={15} variant="linea" /> Saved only on this device. Never type passport or NIE numbers here.</span>
        <button className="exp-mini" onClick={clearAll}>Clear</button>
      </div>
    </div>
  )
}
