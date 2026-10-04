'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { checkAnswer, type FixItem } from '@/lib/courses/b1u1'

type Round = FixItem & { showWrong: boolean; shown: string }
type Phase = 'judge' | 'fix' | 'close' | 'result'

// Accept the bare verb form plus natural variants: "I know" for "know", "do not eat" for "don't eat".
function accepted(it: FixItem): string[] {
  const subject = it.pre.trim().split(' ').pop() ?? ''
  const base = it.fix.flatMap(f => [f, f.replace(/n't\b/g, ' not')])
  return Array.from(new Set([...base, ...base.map(f => `${subject} ${f}`)]))
}

// Each round shows one sentence with a highlighted verb. Is it right? If not, type the fix.
// Grammar items sometimes appear in their correct form, so "it's wrong" is never a safe guess.
export default function SpotMistake({ items, onRecord, onDone }: {
  items: FixItem[]
  onRecord: (id: string, clean: boolean) => void
  onDone: (summary: { clean: number; total: number }) => void
}) {
  const rounds = useMemo<Round[]>(() => items.map(it => {
    const showWrong = it.group === 'grammar' ? Math.random() > 0.3 : it.isWrong
    return { ...it, showWrong, shown: showWrong ? it.seg : (it.isWrong ? it.fix[0] : it.seg) }
  }), [items])
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<Phase>('judge')
  const [input, setInput] = useState('')
  const [ok, setOk] = useState<boolean | null>(null)
  const [clean, setClean] = useState(0)
  const [marks, setMarks] = useState<boolean[]>([])
  const [combo, setCombo] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const r = rounds[i]

  useEffect(() => {
    if (phase === 'fix' || phase === 'close') inputRef.current?.focus()
    if (phase === 'result') nextRef.current?.focus()
  }, [phase])

  function finish(correct: boolean) {
    setOk(correct); setPhase('result')
    setMarks(m => [...m, correct])
    onRecord(r.id, correct)
    if (correct) { setClean(c => c + 1); setCombo(c => c + 1) } else setCombo(0)
  }

  function judge(saysWrong: boolean) {
    if (saysWrong !== r.showWrong) { finish(false); return }
    if (!saysWrong) { finish(true); return }
    setPhase('fix')
  }

  function submitFix() {
    const v = checkAnswer(input, accepted(r))
    if (v === 'right') finish(true)
    else if (v === 'close' && phase === 'fix') setPhase('close')
    else finish(false)
  }

  function next() {
    if (i + 1 >= rounds.length) { onDone({ clean, total: rounds.length }); return }
    setI(i + 1); setPhase('judge'); setInput(''); setOk(null)
  }

  const correctSeg = r.isWrong || r.showWrong ? r.fix[0] : r.seg
  return (
    <div className="spot">
      <div className="deck-top">
        <div className="deck-dots">
          {rounds.map((x, k) => <span key={x.id + k} className={`deck-dot ${k < marks.length ? (marks[k] ? 'd-ok' : 'd-bad') : k === i ? 'd-now' : ''}`} />)}
        </div>
        <span className="deck-count">{i + 1} / {rounds.length}</span>
        {combo >= 3 && <span className="deck-combo" key={combo}>🔥 {combo} in a row</span>}
      </div>

      <div className={`spot-card ${phase === 'result' ? (ok ? 'right' : 'revealed') : ''}`} key={i}>
        <p className="spot-sentence">
          {r.pre}
          {phase === 'result'
            ? (r.showWrong
                ? <><span className="spot-seg struck">{r.shown}</span> <span className="spot-fix">{correctSeg}</span></>
                : <span className="spot-seg spot-good">{r.shown}</span>)
            : <span className={`spot-seg${phase !== 'judge' ? ' struck' : ''}`}>{r.shown}</span>}
          {r.post}
        </p>

        {phase === 'judge' && (
          <div className="spot-choices">
            <button type="button" className="spot-btn spot-btn--ok" onClick={() => judge(false)}>✓ It&apos;s right</button>
            <button type="button" className="spot-btn spot-btn--bad" onClick={() => judge(true)}>✗ It&apos;s wrong</button>
          </div>
        )}

        {(phase === 'fix' || phase === 'close') && (
          <form className="deck-form" onSubmit={e => { e.preventDefault(); submitFix() }}>
            <input ref={inputRef} className="deck-input" value={input} onChange={e => setInput(e.target.value)}
              placeholder={`Replace “${r.shown.trim()}”…`} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            <button type="submit" className="btn" disabled={!input.trim()}>Fix it</button>
          </form>
        )}
        {phase === 'fix' && <p className="fb fb-mid">Good eye. Now type the correct form.</p>}
        {phase === 'close' && <p className="fb fb-mid">Nearly: check the spelling.</p>}

        {phase === 'result' && (
          <div className="spot-result">
            <p className={`fb ${ok ? 'fb-ok' : 'fb-bad'}`}>
              {ok ? (r.showWrong ? '✓ Fixed!' : '✓ Right, nothing to fix.') : (r.showWrong ? 'This one was wrong.' : 'This one was actually right.')}
            </p>
            <p className="spot-why">{r.why}</p>
            <button ref={nextRef} type="button" className="btn" onClick={next}>{i + 1 >= rounds.length ? 'Finish' : 'Next →'}</button>
          </div>
        )}
      </div>
    </div>
  )
}
