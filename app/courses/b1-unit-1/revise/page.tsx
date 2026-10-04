'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { useProgress } from '@/lib/courses/useProgress'
import {
  recordAnswer, markActive, pickForReview, dueCount, masteredCount,
  weeklyGoal, daysThisWeek, weekStreak, MASTERED_BOX,
} from '@/lib/courses/progress'
import { COURSE_ID, WORD_ITEMS, FIX_ITEMS, ALL_ITEMS, type WordItem, type FixItem } from '@/lib/courses/b1u1'
import Crossword from './Crossword'
import SpotMistake from './SpotMistake'
import Mascleta from './Mascleta'
import { photo } from '@/lib/courses/photos'

type GameId = 'crossword' | 'spot' | 'mascleta'
type Playing =
  | { game: 'crossword'; items: WordItem[] }
  | { game: 'spot'; items: FixItem[] }
  | { game: 'mascleta'; items: WordItem[] }

const WORD_IDS = WORD_ITEMS.map(w => w.id)
const FIX_IDS = FIX_ITEMS.map(f => f.id)
// The crossword can only use single words ("camera operator" and "hard-working" don't fit a grid).
const GRID_WORD_IDS = WORD_ITEMS.filter(w => /^[a-z]+$/.test(w.answer)).map(w => w.id)
const SPEED_UNLOCK = 8

export default function Revise() {
  const { progress, update, student, synced } = useProgress(COURSE_ID)
  const [playing, setPlaying] = useState<Playing | null>(null)
  const [summary, setSummary] = useState<{ title: string; line: string } | null>(null)

  const seenWords = WORD_IDS.filter(id => progress.items[id]).length
  const seenGrid = GRID_WORD_IDS.filter(id => progress.items[id]).length
  // The student's own speaking mistakes join the course's grammar items.
  const ownItems: FixItem[] = Object.entries(progress.personal ?? {}).map(([id, f]) => ({
    id, kind: 'fix', group: 'own', pre: f.pre, seg: f.seg, post: f.post, isWrong: true, fix: [f.fix], why: `From your speaking: ${f.why}`,
  }))
  const fixPool = [...FIX_ITEMS, ...ownItems]
  const seenFix = fixPool.filter(f => progress.items[f.id]).length
  const rightWords = WORD_IDS.filter(id => (progress.items[id]?.right ?? 0) > 0).length
  const due = dueCount(progress, [...ALL_ITEMS.map(i => i.id), ...ownItems.map(o => o.id)])
  const owned = masteredCount(progress, WORD_IDS)
  const goal = weeklyGoal(progress)
  const thisWeek = daysThisWeek(progress)
  const streak = weekStreak(progress)

  const games: { id: GameId; emoji: string; title: string; desc: string; mins: string; locked: string | null; accent: string; accentLt: string }[] = useMemo(() => [
    { id: 'crossword', emoji: '🧩', title: 'Crossword', desc: 'The words you met, back on a grid. Read the clue, fill it in.', mins: '4 min', accent: '#3E8FB0', accentLt: '#e8f4f9',
      locked: seenGrid >= 4 ? null : `Meet ${4 - seenGrid} more words in the lessons first.` },
    { id: 'spot', emoji: '🔍', title: 'Spot the mistake', desc: ownItems.length ? `Right or wrong? Fix the verb. Includes ${ownItems.length} from your own speaking.` : 'Right or wrong? If it’s wrong, fix the verb. Present simple, continuous and stative verbs.', mins: '3 min', accent: '#E1614C', accentLt: '#fdf0ed',
      locked: seenFix >= 4 ? null : 'Do the Grammar lesson first.' },
    { id: 'mascleta', emoji: '💥', title: 'La Mascletà', desc: 'One minute, as many words as you can. Every right answer is a bang.', mins: '1 min', accent: '#E8A33D', accentLt: '#fef5e4',
      locked: rightWords >= SPEED_UNLOCK ? null : `Unlocks when you know ${SPEED_UNLOCK} words (you have ${rightWords}).` },
  ], [seenGrid, seenFix, rightWords, ownItems.length])

  function play(id: GameId) {
    setSummary(null)
    if (id === 'crossword') {
      const ids = pickForReview(progress, GRID_WORD_IDS, 7)
      setPlaying({ game: 'crossword', items: ids.map(i => WORD_ITEMS.find(w => w.id === i)!) })
    } else if (id === 'spot') {
      const ids = pickForReview(progress, fixPool.map(f => f.id), 8)
      setPlaying({ game: 'spot', items: ids.map(i => fixPool.find(f => f.id === i)!) })
    } else {
      const known = WORD_ITEMS.filter(w => progress.items[w.id])
      setPlaying({ game: 'mascleta', items: known })
    }
    update(p => markActive(p))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function surprise() {
    const open = games.filter(g => !g.locked)
    if (open.length) play(open[Math.floor(Math.random() * open.length)].id)
  }

  const record = (id: string, clean: boolean) => update(p => recordAnswer(p, id, clean))
  const anyOpen = games.some(g => !g.locked)
  const accent = playing ? games.find(g => g.id === playing.game)!.accent : '#6BAE2E'
  const accentLt = playing ? games.find(g => g.id === playing.game)!.accentLt : '#eaf4da'

  return (
    <div className="mag" style={{ '--accent': accent, '--accent-lt': accentLt } as React.CSSProperties}>
      <header className="site-header">
        <div className="site-header__top">
          <SomersetLogo variant="white" />
          <span className="unit-label">B1 · Unit 1 · Revise in 5</span>
          <Link href="/courses/b1-unit-1" className="corner-link">← Back to the course</Link>
        </div>
      </header>

      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo('fruit-stall').src} alt={photo('fruit-stall').alt} style={{ objectPosition: photo('fruit-stall').focus }} />
        <a className="photo-credit" href={photo('fruit-stall').page} target="_blank" rel="noopener noreferrer">Photo: {photo('fruit-stall').author} · {photo('fruit-stall').licence}</a>
        <div className="hero-overlay">
          <p className="hero-label" style={{ color: '#6BAE2E' }}>Somerset B1 · Unit 1</p>
          <h1 className="hero-title">Revise in 5</h1>
          <p className="hero-sub">Five minutes on the bus, every day you planned. That&apos;s what makes the words stay.</p>
        </div>
      </section>
      <div className="goals-strip"><div className="goals-inner rv-strip">
        <span className="goal-text">{due > 0 ? <><strong>{due}</strong> {due === 1 ? 'thing is' : 'things are'} due for review today</> : 'Nothing due today. Play anyway to keep them warm.'}</span>
        <span className="goal-text goal-text--right">{student ? (synced === 'offline' ? '⚠ Saved on this device; will sync later' : '✓ Saved to your account') : 'Saved on this device only'}</span>
      </div></div>

      <main className="page-wrap">
        <div className="lesson" key={playing ? playing.game + String(summary) : 'hub'}>
          {playing && !summary ? (
            <section className="card">
              <div className="rv-gamehead">
                <button type="button" className="help-btn" onClick={() => setPlaying(null)}>← All games</button>
                <span className="lesson-tag">{games.find(g => g.id === playing.game)!.title}</span>
              </div>
              {playing.game === 'crossword' && (
                <Crossword items={playing.items} onRecord={record}
                  onDone={({ clean, total }) => setSummary({ title: 'Crossword complete', line: `${clean} of ${total} words right first time.` })} />
              )}
              {playing.game === 'spot' && (
                <SpotMistake items={playing.items} onRecord={record}
                  onDone={({ clean, total }) => setSummary({ title: `${clean} / ${total} spotted`, line: clean === total ? 'A clean sweep.' : 'The ones you missed come back tomorrow.' })} />
              )}
              {playing.game === 'mascleta' && (
                <Mascleta items={playing.items} best={progress.best.mascleta ?? 0} onRecord={record}
                  onDone={({ score }) => update(p => ({ ...p, best: { ...p.best, mascleta: Math.max(p.best.mascleta ?? 0, score) } }))} />
              )}
            </section>
          ) : (
            <>
              {summary && (
                <section className="card rv-summary">
                  <div className="rv-summary-icon">🎉</div>
                  <h2 className="lesson-title">{summary.title}</h2>
                  <p className="lesson-aim">{summary.line} Every answer moved its word up or down, so tomorrow&apos;s round is built for you.</p>
                  <div className="row" style={{ justifyContent: 'center' }}>
                    <button type="button" className="btn" onClick={() => playing && play(playing.game)}>Play again</button>
                    <button type="button" className="help-btn" onClick={() => { setPlaying(null); setSummary(null) }}>Choose another game</button>
                  </div>
                </section>
              )}

              <div className="rv-stats">
                <div className="rv-stat">
                  <span className="rv-k">This week</span>
                  <div className="rv-dots">{Array.from({ length: goal }, (_, i) => <span key={i} className={i < thisWeek ? 'on' : ''} />)}</div>
                  <span className="rv-v">{Math.min(thisWeek, goal)} of {goal} {goal === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="rv-stat">
                  <span className="rv-k">Streak</span>
                  <span className="rv-big">{streak > 0 ? '🔥' : '🌱'} {streak}</span>
                  <span className="rv-v">{streak === 1 ? 'week' : 'weeks'} on target</span>
                </div>
                <div className="rv-stat">
                  <span className="rv-k">Words you own</span>
                  <span className="rv-big">{owned}<small>/{WORD_IDS.length}</small></span>
                  <div className="rv-bar"><span style={{ width: `${owned / WORD_IDS.length * 100}%` }} /></div>
                </div>
              </div>

              {!anyOpen ? (
                <section className="card rv-empty">
                  <h2 className="lesson-title">Nothing to revise yet</h2>
                  <p className="lesson-aim">Revise brings back what you&apos;ve already met, at the moment you&apos;re about to forget it. Start with the Jobs lesson: it takes five minutes.</p>
                  <div className="row"><Link href="/courses/b1-unit-1?step=1" className="btn">Go to the Jobs lesson →</Link></div>
                </section>
              ) : (
                <button type="button" className="rv-surprise" onClick={surprise}>
                  <span className="rv-surprise-emoji">🎲</span>
                  <span><strong>Surprise me</strong><small>A random game from your words. About five minutes.</small></span>
                  <span className="sc-chev">›</span>
                </button>
              )}

              <div className="rv-games">
                {games.map(g => (
                  <button key={g.id} type="button" className={`rv-game${g.locked ? ' locked' : ''}`} disabled={!!g.locked}
                    onClick={() => play(g.id)} style={{ '--accent': g.accent, '--accent-lt': g.accentLt } as React.CSSProperties}>
                    <span className="rv-game-emoji">{g.locked ? '🔒' : g.emoji}</span>
                    <span className="rv-game-body">
                      <span className="rv-game-mins">{g.mins}</span>
                      <span className="rv-game-title">{g.title}</span>
                      <span className="rv-game-desc">{g.locked ?? g.desc}</span>
                      {g.id === 'mascleta' && !g.locked && progress.best.mascleta ? <span className="rv-game-best">Best: {progress.best.mascleta} 💥</span> : null}
                    </span>
                  </button>
                ))}
              </div>

              <section className="card">
                <div className="lesson-header">
                  <span className="lesson-tag">Word wallet</span>
                  <div>
                    <h2 className="lesson-title">Your Unit 1 words</h2>
                    <p className="lesson-aim">Each word climbs a level when you get it right first time and drops back when you miss it. Three levels up and it&apos;s yours.</p>
                  </div>
                </div>
                <div className="wallet-legend">
                  <span><i className="wallet--own" /> yours</span>
                  <span><i className="wallet--mid" /> getting there</span>
                  <span><i className="wallet--new" /> missed last time</span>
                </div>
                <div className="chips chips--static">
                  {WORD_ITEMS.map(w => {
                    const s = progress.items[w.id]
                    const lvl = !s ? 'unseen' : s.box >= MASTERED_BOX ? 'own' : s.ok === false ? 'new' : 'mid'
                    return <span key={w.id} className={`chip wallet wallet--${lvl}`} title={s ? `Level ${s.box} of 5` : 'Not met yet'}>{s ? w.answer : '· · ·'}</span>
                  })}
                </div>
                <p className="ds-note">
                  {seenWords < WORD_IDS.length ? `${WORD_IDS.length - seenWords} words still to meet in the lessons. ` : ''}
                  {!student && <>Sign in at <Link href="/student">Student&apos;s Corner</Link> to keep your progress on your phone and your computer.</>}
                </p>
              </section>
            </>
          )}
        </div>
      </main>

      <footer className="mag-foot">
        <span>Somerset Language Centre · Valencia</span>
        <span>B1 · Unit 1 · Revise in 5</span>
      </footer>
    </div>
  )
}
