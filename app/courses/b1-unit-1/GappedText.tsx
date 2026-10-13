'use client'
// Reading Part 4 (gapped text): tap a sentence, then tap the gap it belongs in (or the other way round).
// Right: the sentence locks into the text. Wrong: it flashes red and you try again. First-time answers score.
import { useState } from 'react'
import { OptionCard, ChoiceGrid, Feedback } from '../_kit'

export type GapOption = { id: string; text: string }

function rich(s: string) {
  return s.split('*').map((part, i) => (i % 2 ? <i key={i}>{part}</i> : <span key={i}>{part}</span>))
}

export default function GappedText({ paragraphs, options, answers, why, onAttempt, onDone }: {
  paragraphs: string[]; options: GapOption[]; answers: string[]; why?: string[]
  onAttempt?: (gap: number, ok: boolean, firstTry: boolean) => void
  onDone?: (firsts: number, total: number) => void
}) {
  const total = answers.length
  const [placed, setPlaced] = useState<(string | null)[]>(answers.map(() => null))
  const [tries, setTries] = useState<number[]>(answers.map(() => 0))
  const [firstOk, setFirstOk] = useState<boolean[]>(answers.map(() => false))
  const [selOpt, setSelOpt] = useState<string | null>(null)
  const [selGap, setSelGap] = useState<number | null>(null)
  const [badGap, setBadGap] = useState<number | null>(null)
  const [badOpt, setBadOpt] = useState<string | null>(null)
  const [last, setLast] = useState<{ gap: number; ok: boolean } | null>(null)
  const done = placed.every(Boolean)
  const text = (id: string) => options.find(o => o.id === id)?.text ?? ''

  function attempt(g: number, opt: string) {
    if (placed[g]) return
    const ok = answers[g] === opt
    const firstTry = tries[g] === 0
    onAttempt?.(g, ok, firstTry)
    setSelOpt(null); setSelGap(null)
    if (ok) {
      const np = placed.map((p, i) => (i === g ? opt : p))
      const nf = firstOk.map((f, i) => (i === g ? firstTry : f))
      setPlaced(np); setFirstOk(nf); setLast({ gap: g, ok: true })
      if (np.every(Boolean)) onDone?.(nf.filter(Boolean).length, total)
    } else {
      setTries(tries.map((t, i) => (i === g ? t + 1 : t)))
      setBadGap(g); setBadOpt(opt); setLast({ gap: g, ok: false })
      setTimeout(() => { setBadGap(null); setBadOpt(null) }, 600)
    }
  }
  const pickGap = (g: number) => { if (placed[g]) return; selOpt ? attempt(g, selOpt) : setSelGap(g === selGap ? null : g) }
  const pickOpt = (id: string) => { if (placed.includes(id)) return; selGap !== null ? attempt(selGap, id) : setSelOpt(id === selOpt ? null : id) }

  return (
    <div className="gt two-col-60">
      <article className="script gt-text">
        {paragraphs.map((p, pi) => (
          <p key={pi} className="script-line">
            {p.split(/(\{\d+\})/).map((part, i) => {
              const m = part.match(/^\{(\d+)\}$/)
              if (!m) return <span key={i}>{rich(part)}</span>
              const g = Number(m[1]) - 1
              return placed[g]
                ? <span key={i} className="gt-filled"><b>{g + 1}</b> {text(placed[g] as string)}</span>
                : <button key={i} type="button" className={`gt-gap${selGap === g ? ' is-sel' : ''}${badGap === g ? ' is-bad' : ''}`} onClick={() => pickGap(g)} aria-label={`Gap ${g + 1}`}>{g + 1}</button>
            })}
          </p>
        ))}
      </article>
      <div className="gt-side">
        <p className="ck-label">Sentences<small>{selOpt || selGap !== null ? 'Now tap the matching gap, or sentence.' : 'Tap a sentence, then tap its gap. Three are extra.'}</small></p>
        <ChoiceGrid cols={1}>
          {options.map(o => (
            <OptionCard key={o.id} icon={<b className="gt-letter">{o.id}</b>} text={o.text}
              state={placed.includes(o.id) ? 'used' : badOpt === o.id ? 'wrong' : selOpt === o.id ? 'selected' : 'idle'}
              onPick={() => pickOpt(o.id)} />
          ))}
        </ChoiceGrid>
        {last && last.ok && <Feedback kind={firstOk[last.gap] ? 'win' : 'quiet'} n={last.gap} revise={!firstOk[last.gap]} text={why?.[last.gap] ? <>{why[last.gap]}</> : undefined} />}
        {last && !last.ok && !done && <Feedback kind="wrong" text="Not that one. Read the sentences before and after the gap." />}
      </div>
    </div>
  )
}
