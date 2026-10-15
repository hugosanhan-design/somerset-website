'use client'
// Embedded portal game: no website header, no name or level screen. The student is the
// Student's Corner sign-in; the level comes from the portal link (?level=B2).
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Btn } from '@/app/courses/_kit'
import { SomersetIcon } from '@/components/SomersetIcon'
import type { ChoiceItem, GameDef, Level } from '@/lib/games/contract'
import { buildSession, pickLevel } from '@/lib/games/session'
import { readStudent, reportResult, type Student } from '@/lib/games/report'
import { ChoiceEngine, type Outcome } from './engines/Choice'
import { ExplainButton } from './Explain'
import './games.css'

type Phase = 'intro' | 'play' | 'end' | 'again'

export default function GamePlayer({ game, level: wanted }: { game: GameDef; level: Level }) {
  const level = pickLevel(game, wanted)
  const [student, setStudent] = useState<Student | null | undefined>(undefined)
  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [saved, setSaved] = useState<'saving' | 'saved' | 'queued' | 'draft'>('saving')
  const [practised, setPractised] = useState(false)

  useEffect(() => { setStudent(readStudent()) }, [])
  const items = useMemo(() => buildSession(game, level), [game, level, round])
  const missed = useMemo(() => {
    if (!outcome) return [] as ChoiceItem[]
    const ids = new Set(outcome.wrong.map(w => w.itemId))
    return items.filter(i => ids.has(i.id))
  }, [outcome, items])

  function finish(o: Outcome) {
    setOutcome(o); setPhase('end'); setSaved('saving'); setPractised(false)
    if (game.draft) { setSaved('draft'); return }   // drafts are for review only: nothing is stored
    reportResult({ gameId: game.id, tags: game.tags, level, ...o }).then(setSaved)
  }

  const header = (
    <header className="gm-top">
      <span className="gm-brand">Somerset <b>Games</b></span>
      <Link className="gm-back" href="/student">My area</Link>
    </header>
  )

  if (student === undefined) return <div className="course gm">{header}</div>
  if (!student) return (
    <div className="course gm">{header}
      <main className="gm-main"><div className="ck-card gm-card gm-center">
        <SomersetIcon name="lock" size={72} />
        <h1 className="gm-title">Sign in first</h1>
        <p className="gm-lead">Open Student&rsquo;s Corner and sign in with your name and code, then come back here.</p>
        <Link className="ck-btn ck-btn--accent" href="/student">Go to Student&rsquo;s Corner</Link>
      </div></main>
    </div>
  )

  return (
    <div className="course gm">
      {header}
      <main className="gm-main">
        {game.draft && <p className="gm-draft">Draft preview — not on any student&rsquo;s list yet</p>}
        {phase === 'intro' && (
          <div className="ck-card gm-card gm-center">
            <SomersetIcon name="game" size={84} />
            <p className="gm-kicker">Got 3 minutes?</p>
            <h1 className="gm-title">{game.title}</h1>
            <p className="gm-lead">{game.intro}</p>
            <p className="gm-meta">{items.length} short questions · no clock · take your time</p>
            <Btn variant="accent" className="gm-start" onClick={() => setPhase('play')}>Let&rsquo;s go</Btn>
          </div>
        )}

        {phase === 'play' && (
          <>
            <p className="gm-kicker gm-kicker--play">{game.title}</p>
            {game.engine === 'pairs' && <p className="gm-ask">Which one goes with it?</p>}
            <ChoiceEngine key={`play-${round}`} items={items} onFinish={finish} explain={game.explain} />
          </>
        )}

        {phase === 'again' && (
          <>
            <p className="gm-kicker gm-kicker--play">One more look</p>
            <ChoiceEngine key={`again-${round}`} items={missed} onFinish={() => { setPractised(true); setPhase('end') }} explain={game.explain} />
          </>
        )}

        {phase === 'end' && outcome && (
          <div className="ck-card gm-card">
            <div className="gm-center">
              <SomersetIcon name={missed.length === 0 || practised ? 'celebrate' : 'well-done'} size={84} />
              <h1 className="gm-title">{missed.length === 0 ? 'Every one first time.' : practised ? 'Fixed.' : 'Nice work.'}</h1>
              <p className="gm-lead">
                {practised ? (missed.length === 1 ? 'You have been through that one again. Here it is once more, to keep:' : `You have been through those ${missed.length} again. Here they are once more, to keep:`)
                  : missed.length === 0
                  ? `${student.name.split(' ')[0]}, that was clean from start to finish.`
                  : missed.length === 1 ? 'Just one is worth another look:' : `These ${missed.length} are worth another look:`}
              </p>
            </div>
            {missed.length > 0 && (
              <ul className="gm-review">
                {missed.map(m => (
                  <li key={m.id}>
                    <p className="gm-review__q">{m.q.replace(/_{3,}/, `${m.options[m.answer]}`)}</p>
                    {m.why && <p className="gm-review__why">{m.why}</p>}
                    <ExplainButton ids={[m.explain ?? game.explain]} variant="link" label="Explícamelo →" />
                  </li>
                ))}
              </ul>
            )}
            <div className="gm-actions">
              {missed.length > 0 && !practised && <Btn variant="accent" onClick={() => setPhase('again')}>Practise {missed.length === 1 ? 'it' : `these ${missed.length}`} again</Btn>}
              <Btn variant="ghost" onClick={() => { setOutcome(null); setRound(r => r + 1); setPhase('play') }}>New set of questions</Btn>
              <Link className="ck-btn ck-btn--ghost" href="/student">Back to my area</Link>
            </div>
            <p className="gm-saved" aria-live="polite">
              {saved === 'draft' ? 'Draft preview: nothing was saved.' : saved === 'saving' ? 'Saving…' : saved === 'saved' ? 'Saved to your area.' : 'Saved on this phone. It will reach your area next time you are online.'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
