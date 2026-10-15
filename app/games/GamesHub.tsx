'use client'
// The portal games page: every ready game, grouped by what it practises, with one level choice
// (remembered on this device) that every game link carries.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SomersetIcon, type IconName } from '@/components/SomersetIcon'
import '@/app/courses/_kit/tokens.css'
import '@/app/courses/_kit/kit.css'
import './games.css'

export type HubGame = { id: string; title: string; intro: string; tags: string[]; levels: string[]; explain: boolean }
type Group = { key: string; label: string; games: HubGame[] }

const LEVELS = ['A2', 'B1', 'B2', 'C1']
const KEY = 'somersetGames:level'
const GROUP_ICON: Record<string, IconName> = {
  tense: 'clock', agreement: 'puzzle', article: 'books', preposition: 'puzzle', 'word-order': 'speak',
  spelling: 'pen', punctuation: 'pen', vocabulary: 'books', register: 'mailbox', other: 'tip',
}
const GROUP_LABEL: Record<string, string> = {
  tense: 'Tenses', agreement: 'Countable and uncountable', article: 'Articles', preposition: 'Prepositions and phrasal verbs',
  'word-order': 'Word order', spelling: 'Spelling', punctuation: 'Punctuation', vocabulary: 'Vocabulary',
  register: 'Formal and informal', other: 'Modals, linking words and more',
}

export default function GamesHub({ groups, total }: { groups: Group[]; total: number }) {
  const [level, setLevel] = useState('B2')
  useEffect(() => { try { const l = localStorage.getItem(KEY); if (l && LEVELS.includes(l)) setLevel(l) } catch { /* ignore */ } }, [])
  function pick(l: string) { setLevel(l); try { localStorage.setItem(KEY, l) } catch { /* ignore */ } }

  return (
    <div className="course gm">
      <header className="gm-top">
        <span className="gm-brand">Somerset <b>Games</b></span>
        <Link className="gm-back" href="/student">My area</Link>
      </header>
      <main className="gm-main gm-hub">
        <div className="gm-center">
          <SomersetIcon name="game" size={72} />
          <p className="gm-kicker">Got 3 minutes?</p>
          <h1 className="gm-title">Somerset Games</h1>
          <p className="gm-lead">{total} short games, about 12 questions each. No clock: take your time.</p>
        </div>
        <div className="gm-levelbar" role="radiogroup" aria-label="Your level">
          <span>Your level</span>
          {LEVELS.map(l => (
            <button key={l} type="button" role="radio" aria-checked={l === level} className={`gm-tab${l === level ? ' is-on' : ''}`} onClick={() => pick(l)}>{l}</button>
          ))}
        </div>
        {groups.map(g => (
          <section key={g.key} className="gm-hub__group">
            <h2 className="gm-hub__head"><SomersetIcon name={GROUP_ICON[g.key] ?? 'game'} size={34} /> {GROUP_LABEL[g.key] ?? g.label}</h2>
            <div className="gm-hub__grid">
              {g.games.map(game => (
                <Link key={game.id} className="gm-hub__card" href={`/games/${game.id}?level=${game.levels.includes(level) ? level : game.levels[game.levels.length - 1]}`}>
                  <span className="gm-hub__title">{game.title}</span>
                  <span className="gm-hub__intro">{game.intro}</span>
                  <span className="gm-hub__meta">
                    {game.levels.join(' · ')}
                    {game.explain && <span className="gm-hub__es">Explícamelo</span>}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
