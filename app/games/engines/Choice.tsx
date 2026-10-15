'use client'
// SPRINT + REPAIR games: one sentence at a time, pick the right option. Built on the
// course kit's Deck, so feedback is instant (tick or cross, then the "why"), with no clock.
import { useMemo, useRef } from 'react'
import { Deck, type DeckItem } from '@/app/courses/_kit'
import type { ChoiceItem } from '@/lib/games/contract'

export type Outcome = { itemsTotal: number; itemsCorrect: number; wrong: { itemId: string; answered: string }[] }

export function ChoiceEngine({ items, onFinish }: { items: ChoiceItem[]; onFinish: (o: Outcome) => void }) {
  const wrong = useRef(new Map<string, string>())     // itemId -> first wrong answer
  const deck: DeckItem[] = useMemo(() => items.map(it => ({
    id: it.id, kind: 'choice', q: it.q, options: it.options, answer: it.answer,
    after: it.why,
  })), [items])

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
