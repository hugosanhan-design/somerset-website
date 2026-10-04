'use client'

import { useEffect, useRef, useState } from 'react'
import { checkAnswer, type WordItem } from '@/lib/courses/b1u1'

const SECONDS = 60

// Speed round on words the student already knows: clue → type the word, as many as
// possible in a minute. Each right answer is a bang; the best score is kept.
export default function Mascleta({ items, best, onRecord, onDone }: {
  items: WordItem[]
  best: number
  onRecord: (id: string, clean: boolean) => void
  onDone: (summary: { score: number; isBest: boolean }) => void
}) {
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready')
  const [deck, setDeck] = useState<WordItem[]>([])
  const [k, setK] = useState(0)
  const [input, setInput] = useState('')
  const [left, setLeft] = useState(SECONDS)
  const [score, setScore] = useState(0)
  const [bangs, setBangs] = useState<number[]>([])
  const [flash, setFlash] = useState<'' | 'bad' | 'close'>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const recorded = useRef<Set<string>>(new Set())
  const [prevBest, setPrevBest] = useState(best)

  function start() {
    setDeck([...items].sort(() => Math.random() - 0.5))
    setPrevBest(best)
    setK(0); setScore(0); setBangs([]); setLeft(SECONDS); setInput(''); setPhase('play')
    recorded.current = new Set()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  useEffect(() => {
    if (phase !== 'play') return
    if (left <= 0) { setPhase('over'); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, left])

  useEffect(() => {
    if (phase === 'over') onDone({ score, isBest: score > prevBest })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const item = deck.length ? deck[k % deck.length] : null

  // Only the first appearance of a word in a round updates its revision level.
  function recordOnce(id: string, ok: boolean) {
    if (recorded.current.has(id)) return
    recorded.current.add(id)
    onRecord(id, ok)
  }

  function submit() {
    if (!item || phase !== 'play') return
    const v = checkAnswer(input, [item.answer])
    if (v === 'right') {
      recordOnce(item.id, true)
      setScore(s => s + 1)
      setBangs(b => [...b, Date.now()])
      setK(x => x + 1); setInput(''); setFlash('')
    } else {
      setFlash(v === 'close' ? 'close' : 'bad')
      setTimeout(() => setFlash(''), 450)
    }
  }

  function pass() {
    if (!item) return
    recordOnce(item.id, false)
    setK(x => x + 1); setInput('')
    inputRef.current?.focus()
  }

  if (phase === 'ready') {
    return (
      <div className="masc masc--ready">
        <div className="masc-big">💥</div>
        <h3>One minute. As many words as you can.</h3>
        <p>Read the clue, type the word, press Enter. Stuck? Pass. Spelling has to be right.</p>
        {best > 0 && <p className="masc-best">Your best: <strong>{best}</strong></p>}
        <button type="button" className="btn masc-go" onClick={start}>Light the fuse →</button>
      </div>
    )
  }

  if (phase === 'over') {
    return (
      <div className="masc masc--ready">
        <div className="masc-row">{bangs.map(b => <span key={b} className="masc-pop">💥</span>)}{!bangs.length && '🌫️'}</div>
        <h3>{score} {score === 1 ? 'bang' : 'bangs'}{score > prevBest ? ' · new best!' : ''}</h3>
        <p>{score > prevBest ? 'That’s your loudest mascletà yet.' : prevBest ? `Your best is ${prevBest}. Go again?` : 'Go again and beat it.'}</p>
        <button type="button" className="btn masc-go" onClick={start}>Again →</button>
      </div>
    )
  }

  return (
    <div className="masc">
      <div className="masc-hud">
        <div className="masc-timer"><span style={{ width: `${(left / SECONDS) * 100}%` }} className={left <= 10 ? 'hot' : ''} /></div>
        <span className="masc-left">{left}s</span>
        <span className="masc-score">💥 {score}</span>
      </div>
      <div className="masc-bangs" aria-hidden>{bangs.slice(-12).map(b => <span key={b} className="masc-pop">💥</span>)}</div>
      {item && (
        <div className={`masc-card ${flash}`} key={k}>
          <p className="masc-clue">{item.clue}</p>
          <p className="masc-len">{item.answer.replace(/[^ -]/g, '_ ').trim()}</p>
          <form className="deck-form" onSubmit={e => { e.preventDefault(); submit() }}>
            <input ref={inputRef} className="deck-input" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type it…" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            <button type="submit" className="btn">Go</button>
          </form>
          <button type="button" className="help-btn" onClick={pass}>Pass →</button>
          {flash === 'close' && <p className="fb fb-mid">Spelling!</p>}
        </div>
      )}
    </div>
  )
}
