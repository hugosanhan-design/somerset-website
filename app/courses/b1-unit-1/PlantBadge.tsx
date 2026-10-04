'use client'

import { useEffect, useRef, useState } from 'react'
import Plant, { PLANT_NAMES } from './Plant'

// The small plant in the progress strip. Tap it to see what it means.
export default function PlantBadge({ stage, percent, showPercent }: { stage: number; percent: number; showPercent: boolean }) {
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const box = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  return (
    <span className="plant-badge-wrap" ref={box}>
      <button type="button" className="plant-badge" onClick={() => {
          // Open towards the side with room: the badge sits on the right of the strip on desktop.
          const r = box.current?.getBoundingClientRect()
          setAlignRight(!!r && r.left + 340 > window.innerWidth)
          setOpen(o => !o)
        }} aria-expanded={open} aria-label={`Your plant: ${PLANT_NAMES[stage]}. What does it mean?`}>
        <Plant stage={stage} size={34} />
        {showPercent && <span className="plant-badge-pct">{percent}%</span>}
      </button>
      {open && (
        <span className={`plant-pop${alignRight ? ' plant-pop--right' : ''}`} role="dialog">
          <span className="plant-pop-row">
            {PLANT_NAMES.map((n, i) => (
              <span key={n} className={`plant-pop-step${i === stage ? ' now' : ''}`}><Plant stage={i} size={36} /></span>
            ))}
          </span>
          <span className="plant-pop-text">
            <strong>This is your plant.</strong> It grows every time you finish a lesson. 🍎 An apple tree means you&apos;re ready for PET.
          </span>
        </span>
      )}
    </span>
  )
}
