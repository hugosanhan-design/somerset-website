'use client'

import Link from 'next/link'
import type { Progress } from '@/lib/courses/progress'
import { ITEM_BY_ID } from '@/lib/courses/b1u1'

export type GameRec = {
  id: string
  title: string
  why: string             // one-line reason tied to this student's actual errors
  href: string
  accent: string
  time: string
  icon: string
}

// Finds the label of the most-missed item for a human-readable reason
function worstLabel(id: string): string {
  const item = ITEM_BY_ID[id]
  if (!item) return ''
  if (item.kind === 'word') return item.answer
  if (item.kind === 'fix') {
    // Reconstruct the key mistake phrase from the fix item
    const wrong = item.seg
    const right = item.fix[0]
    if (wrong && right) return `"${wrong}" → "${right}"`
    return item.fix[0] ?? ''
  }
  return ''
}

function pluralise(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

export function recommendGames(progress: Progress): GameRec[] {
  const items = progress.items
  const recs: GameRec[] = []

  // ── Grammar Sprint ───────────────────────────────────────────────────────────
  // Recommend when the student has errors in gram:* or stat:* items.
  const gramErrors = Object.entries(items)
    .filter(([id, s]) => (id.startsWith('gram:') || id.startsWith('stat:')) && s.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)

  if (gramErrors.length >= 1) {
    const topLabel = worstLabel(gramErrors[0][0])
    const extra = gramErrors.length - 1
    const why = topLabel
      ? `You mixed up ${topLabel}${extra > 0 ? ` (and ${pluralise(extra, 'other')} like it)` : ''}`
      : `${pluralise(gramErrors.length, 'grammar mistake')} still coming back in Revise`
    recs.push({
      id: 'grammar-sprint',
      title: 'Grammar Sprint',
      why,
      href: '/courses/b1-unit-1/games/grammar-sprint',
      accent: '#E3A33A',
      time: '2 min',
      icon: '⏱',
    })
  }

  // ── Vocab Match ──────────────────────────────────────────────────────────────
  // Recommend when job:* or pers:* items are in weak boxes (box ≤ 2, any wrong).
  const vocabWeak = Object.entries(items)
    .filter(([id, s]) => (id.startsWith('job:') || id.startsWith('pers:')) && s.wrong > 0)
    .sort((a, b) => a[1].box - b[1].box)

  if (vocabWeak.length >= 2) {
    const topLabel = worstLabel(vocabWeak[0][0])
    const why = topLabel
      ? `"${topLabel}" and ${pluralise(vocabWeak.length - 1, 'other word')} still to master`
      : `${pluralise(vocabWeak.length, 'word')} still weak — match them to lock them in`
    recs.push({
      id: 'vocab-match',
      title: 'Vocab Match',
      why,
      href: '/games/vocab-match.html',
      accent: '#6BAE2E',
      time: '1 min',
      icon: '🃏',
    })
  }

  // ── Correction Clinic ────────────────────────────────────────────────────────
  // Recommend when personal (own:*) errors exist from the speaking lesson.
  const personalErrors = Object.entries(items)
    .filter(([id, s]) => id.startsWith('own:') && s.wrong > 0)

  if (personalErrors.length >= 1) {
    recs.push({
      id: 'correction-clinic',
      title: 'Correction Clinic',
      why: `${pluralise(personalErrors.length, 'mistake')} from your speaking session — spot them again`,
      href: '/games/correction-clinic.html',
      accent: '#2A5636',
      time: 'No clock',
      icon: '🔍',
    })
  }

  return recs.slice(0, 3)
}

export default function GamesSection({ progress }: { progress: Progress }) {
  const recs = recommendGames(progress)
  if (!recs.length) return null

  return (
    <section className="card games-section">
      <div className="games-header">
        <span className="games-eyebrow">Based on your mistakes</span>
        <h2 className="games-title">Quick drills</h2>
        <p className="games-sub">Five minutes, your specific errors. Tap one to play.</p>
      </div>
      <div className="games-list">
        {recs.map(rec => (
          <Link key={rec.id} href={rec.href} className="game-rec" style={{ '--g-accent': rec.accent } as React.CSSProperties}>
            <span className="game-rec-icon">{rec.icon}</span>
            <div className="game-rec-body">
              <span className="game-rec-title">{rec.title}</span>
              <span className="game-rec-why">{rec.why}</span>
            </div>
            <span className="game-rec-time">{rec.time}</span>
          </Link>
        ))}
      </div>
      <div className="games-more">
        <a href="/games" className="help-btn">All Somerset games →</a>
      </div>
    </section>
  )
}
