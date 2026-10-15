'use client'
// SPRINT + REPAIR games: one sentence at a time, pick the right option. Built on the
// course kit's Deck, so feedback is instant (tick or cross, then the "why"), with no clock.
import { useMemo, useRef } from 'react'
import { Deck, type DeckItem } from '@/app/courses/_kit'
import type { ChoiceItem } from '@/lib/games/contract'
import { ExplainButton, getExplainer } from '../Explain'

export type Outcome = { itemsTotal: number; itemsCorrect: number; wrong: { itemId: string; answered: string }[] }

export function ChoiceEngine({ items, onFinish, explain }: { items: ChoiceItem[]; onFinish: (o: Outcome) => void; explain?: string }) {
  const wrong = useRef(new Map<string, string>())     // itemId -> first wrong answer
  const allCards = useMemo(() => [...new Set(items.map(i => i.explain ?? explain).filter(Boolean))].sort() as string[], [items, explain])
  const deck: DeckItem[] = useMemo(() => items.map(it => ({
    id: it.id, kind: 'choice', q: it.q, options: it.options, answer: it.answer,
    // After answering: the why, plus the card for this question's grammar point.
    after: <>
      {it.why}
      {getExplainer(it.explain ?? explain) && <><br /><ExplainButton ids={[it.explain ?? explain]} variant="link" label={`Más sobre el ${getExplainer(it.explain ?? explain)!.title.toLowerCase()} →`} /></>}
    </>,
    // Before answering: every card in the set as tabs, so the button never gives the answer away.
    aside: <ExplainButton ids={allCards} />,
  })), [items, explain, allCards])

  return (
    <Deck
      items={deck}
      onAnswer={(item, ok, firstTry, chosen) => {
        if (!ok && firstTry && item.kind === 'choice') wrong.current.set(item.id, item.options[Number(chosen)] ?? chosen)
      }}
      manualNext
      onDone={(firsts, total) => onFinish({
        itemsTotal: total, itemsCorrect: firsts,
        wrong: [...wrong.current].map(([itemId, answered]) => ({ itemId, answered })),
      })}
    />
  )
}
