'use client'

import { useEffect, useRef, useState } from 'react'
import { checkAnswer, letterHint, type WordItem } from '@/lib/courses/b1u1'

type Status = 'asking' | 'close' | 'retry' | 'right' | 'revealed'
export type DeckResult = { id: string; points: number }

// One card at a time: read the clue, type the word. A clean first answer scores 1;
// using the hint or peeking at the word box, or needing a second try, scores ½;
// two misses reveal the answer and score 0. Every answer is reported to onRecord.
export default function RecallDeck({
  items, wordBank, onRecord, onFinish, placeholder = 'Type the word…',
}: {
  items: WordItem[]
  wordBank: string[]
  onRecord: (id: string, clean: boolean) => void
  onFinish: (results: DeckResult[]) => void
  placeholder?: string
}) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<Status>('asking')
  const [helped, setHelped] = useState(false)
  const [hint, setHint] = useState(false)
  const [peek, setPeek] = useState(false)
  const [closeUsed, setCloseUsed] = useState(false)
  const [missed, setMissed] = useState(false)
  const [results, setResults] = useState<DeckResult[]>([])
  const [combo, setCombo] = useState(0)
  const [shake, setShake] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const item = items[idx]

  useEffect(() => {
    if (status === 'revealed') nextRef.current?.focus()
    else inputRef.current?.focus()
  }, [idx, status])

  function finishCard(points: number) {
    setResults(r => [...r, { id: item.id, points }])
    onRecord(item.id, points === 1)
    setCombo(c => (points === 1 ? c + 1 : 0))
  }

  function advance() {
    if (idx + 1 >= items.length) { onFinish(results); return }
    setIdx(idx + 1); setInput(''); setStatus('asking')
    setHelped(false); setHint(false); setPeek(false); setCloseUsed(false); setMissed(false)
  }

  function submit() {
    if (status === 'right' || status === 'revealed') { advance(); return }
    const verdict = checkAnswer(input, [item.answer])
    if (verdict === 'right') {
      setStatus('right')
      finishCard(helped || missed || closeUsed ? 0.5 : 1)
      return
    }
    setShake(s => s + 1)
    // A first spelling slip doesn't cost a try; it just asks them to look again.
    if (verdict === 'close' && !closeUsed) { setCloseUsed(true); setStatus('close'); return }
    if (missed) { setStatus('revealed'); finishCard(0); return }
    setMissed(true); setStatus('retry'); setHint(true); setHelped(true)
  }

  // Auto-advance after a right answer so a good run keeps its rhythm.
  useEffect(() => {
    if (status !== 'right') return
    const t = setTimeout(advance, 1100)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, idx])

  const lastPoints = results[results.length - 1]?.points
  const answered = status === 'right' || status === 'revealed'
  return (
    <div className="deck">
      <div className="deck-top">
        <div className="deck-dots" aria-label={`Card ${idx + 1} of ${items.length}`}>
          {items.map((it, i) => {
            const r = results[i]
            const cls = r ? (r.points === 1 ? 'd-ok' : r.points > 0 ? 'd-mid' : 'd-bad') : i === idx ? 'd-now' : ''
            return <span key={it.id} className={`deck-dot ${cls}`} />
          })}
        </div>
        <span className="deck-count">{Math.min(idx + 1, items.length)} / {items.length}</span>
        {combo >= 3 && <span className="deck-combo" key={combo}>🔥 {combo} in a row</span>}
      </div>

      <div className={`deck-card ${status}`} key={`${idx}-${shake}`}>
        <div className="deck-clue">{item.clue}</div>

        {answered ? (
          <div className="deck-answer">
            {item.emoji && <span className="deck-emoji">{item.emoji}</span>}
            <span className="deck-word">{item.answer}</span>
            <span className={`deck-verdict ${status}`}>
              {status === 'right' ? (lastPoints === 1 ? '✓ First time!' : '✓ Got it') : 'Learn this one: it comes back in Revise'}
            </span>
          </div>
        ) : (
          <form className="deck-form" onSubmit={e => { e.preventDefault(); submit() }}>
            <input ref={inputRef} className="deck-input" value={input} onChange={e => setInput(e.target.value)}
              placeholder={placeholder} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            <button type="submit" className="btn" disabled={!input.trim()}>Check</button>
          </form>
        )}

        {!answered && (
          <div className="deck-feedback">
            {status === 'retry' && <p className="fb fb-bad">Not quite. One more try. Here&apos;s a start:</p>}
            {status === 'close' && <p className="fb fb-mid">So close! Check the spelling: spelling counts in PET.</p>}
            {hint && <p className="deck-hint">{letterHint(item.answer)}</p>}
          </div>
        )}

        {status === 'revealed' && <button ref={nextRef} type="button" className="btn" onClick={advance}>Next →</button>}
      </div>

      {!answered && (
        <div className="deck-help">
          {!hint && <button type="button" className="help-btn" onClick={() => { setHint(true); setHelped(true) }}>💡 First letter <small>½ point</small></button>}
          <button type="button" className="help-btn" onClick={() => { setPeek(!peek); setHelped(true) }}>👀 {peek ? 'Hide' : 'Peek at'} the word box <small>½ point</small></button>
        </div>
      )}
      {peek && !answered && (
        <div className="chips chips--static deck-peek">
          {wordBank.map(w => <span key={w} className={`chip chip--static${results.some(r => r.id.endsWith(':' + w)) ? ' chip--used' : ''}`}>{w}</span>)}
        </div>
      )}
    </div>
  )
}
