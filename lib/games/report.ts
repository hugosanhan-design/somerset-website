'use client'
// The ONE function every game calls when a session finishes. It saves the result under
// the signed-in Student's Corner account. If the phone is offline, the result waits in
// this browser and is sent with the next one.
import type { GameResult } from './contract'

const QUEUE = 'somersetGames:pending'

export type Student = { name: string; code: string }

export function readStudent(): Student | null {
  try {
    const s = JSON.parse(localStorage.getItem('somersetStudent') || 'null')
    return s?.name && s?.code ? { name: String(s.name), code: String(s.code) } : null
  } catch { return null }
}

function readQueue(): GameResult[] {
  try { const q = JSON.parse(localStorage.getItem(QUEUE) || '[]'); return Array.isArray(q) ? q : [] } catch { return [] }
}
function writeQueue(q: GameResult[]) {
  try { if (q.length) localStorage.setItem(QUEUE, JSON.stringify(q.slice(-20))); else localStorage.removeItem(QUEUE) } catch { /* ignore */ }
}

export async function reportResult(result: GameResult): Promise<'saved' | 'queued'> {
  const student = readStudent()
  const pending = [...readQueue(), result]
  if (!student) { writeQueue(pending); return 'queued' }
  const left: GameResult[] = []
  for (const r of pending) {
    try {
      const res = await fetch('/api/courses/game-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: student.name, code: student.code, result: r }),
      })
      if (!res.ok && res.status >= 500) left.push(r)   // server trouble: try again next time
    } catch { left.push(r) }                           // offline
  }
  writeQueue(left)
  return left.includes(result) ? 'queued' : 'saved'
}
