'use client'
import { useState } from 'react'
import type { GapFillItem } from '@/lib/intake/types'

interface Props {
  items: GapFillItem[]
  onComplete: (choices: number[]) => void
}

export default function GapFillCard({ items, onComplete }: Props) {
  const [itemIdx, setItemIdx] = useState(0)
  const [choices, setChoices] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)

  const current = items[itemIdx]
  const total = items.length

  // Render the sentence with _____ replaced by a styled blank
  const parts = current.sentence.split('_____')

  function handleSelect(optionIdx: number) {
    if (selected !== null) return
    setSelected(optionIdx)
    setTimeout(() => {
      const newChoices = [...choices, optionIdx]
      if (itemIdx + 1 >= total) {
        onComplete(newChoices)
      } else {
        setChoices(newChoices)
        setItemIdx(itemIdx + 1)
        setSelected(null)
      }
    }, 400)
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 640, margin: '0 auto' }}>
      {/* Counter */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {itemIdx + 1} of {total}
        </span>
      </div>

      {/* Sentence with gap */}
      <div style={{
        fontSize: 18,
        color: '#111827',
        lineHeight: 1.8,
        marginBottom: 32,
        textAlign: 'center',
        fontWeight: 500,
      }}>
        {parts[0]}
        <span style={{
          display: 'inline-block',
          minWidth: 100,
          borderBottom: '2.5px solid #6BAE2E',
          marginLeft: 4,
          marginRight: 4,
          verticalAlign: 'bottom',
          textAlign: 'center',
          color: selected !== null ? '#6BAE2E' : 'transparent',
          fontWeight: 700,
          paddingBottom: 2,
        }}>
          {selected !== null ? items[itemIdx].options[selected] : ' '}
        </span>
        {parts[1]}
      </div>

      {/* Option chips — row of 3 */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {current.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={selected !== null}
            style={{
              flex: '1 1 80px',
              minWidth: 80,
              minHeight: 44,
              padding: '10px 14px',
              background: selected === idx ? '#6BAE2E' : '#fff',
              border: `1.5px solid ${selected === idx ? '#6BAE2E' : '#d1d5db'}`,
              borderRadius: 24,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              color: selected === idx ? '#fff' : '#374151',
              cursor: selected !== null ? 'default' : 'pointer',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent' as string,
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              textAlign: 'center',
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
