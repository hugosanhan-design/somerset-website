'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { emptyProgress, mergeProgress, sanitiseProgress, type Progress } from './progress'

type Student = { name: string; code: string }

function readStudent(): Student | null {
  try {
    const s = JSON.parse(localStorage.getItem('somersetStudent') || 'null')
    return s?.name && s?.code ? { name: String(s.name), code: String(s.code) } : null
  } catch { return null }
}

// Progress lives in this browser first (works offline, on the bus) and, when the
// student is signed in to Student's Corner, is merged with the copy in the database
// so the phone and the laptop share one record.
export function useProgress(course: string) {
  const storageKey = `somersetCourse:${course}`
  const [progress, setProgress] = useState<Progress>(emptyProgress)
  const [student, setStudent] = useState<Student | null>(null)
  const [synced, setSynced] = useState<'local' | 'saving' | 'saved' | 'offline'>('local')
  const latest = useRef<Progress>(emptyProgress())
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const push = useCallback((p: Progress, who: Student | null) => {
    if (!who) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSynced('saving')
      try {
        const r = await fetch('/api/courses/progress', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...who, course, data: p }),
        })
        if (!r.ok) throw new Error(await r.text())
        setSynced('saved')
      } catch { setSynced('offline') }
    }, 1200)
  }, [course])

  useEffect(() => {
    let local = emptyProgress()
    try { local = sanitiseProgress(JSON.parse(localStorage.getItem(storageKey) || 'null')) } catch { /* fresh */ }
    latest.current = local
    setProgress(local)
    const who = readStudent()
    setStudent(who)
    if (!who) return
    fetch('/api/courses/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...who, course }),
    })
      .then(async r => { if (!r.ok) throw new Error(await r.text()); return r.json() })
      .then(d => {
        const merged = mergeProgress(latest.current, sanitiseProgress(d.data))
        latest.current = merged
        setProgress(merged)
        try { localStorage.setItem(storageKey, JSON.stringify(merged)) } catch { /* ignore */ }
        setSynced('saved')
      })
      .catch(() => setSynced('offline'))
  }, [course, storageKey])

  const update = useCallback((fn: (p: Progress) => Progress) => {
    const next = fn(latest.current)
    latest.current = next
    setProgress(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* ignore */ }
    push(next, readStudent())
  }, [push, storageKey])

  return { progress, update, student, synced }
}
