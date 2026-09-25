'use client'
import { useState } from 'react'
import type { PuzzleScenario } from '@/lib/intake/types'

interface Props {
  scenario: PuzzleScenario
  onComplete: (choices: number[]) => void
}

export default function PuzzleCard({ scenario, onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [choices, setChoices] = useState<number[]>([])
  const [builtLines, setBuiltLines] = useState<string[]>([])
  const [flashing, setFlashing] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const totalSteps = scenario.steps.length
  const currentStep = scenario.steps[stepIdx]

  function handleChoice(optionIdx: number) {
    if (flashing !== null) return
    setFlashing(optionIdx)
    setTimeout(() => {
      setFlashing(null)
      const chosenText = currentStep.options[optionIdx]
      const newLines = [...builtLines, chosenText]
      const newChoices = [...choices, optionIdx]

      if (stepIdx + 1 >= totalSteps) {
        setBuiltLines(newLines)
        setChoices(newChoices)
        setDone(true)
      } else {
        setBuiltLines(newLines)
        setChoices(newChoices)
        setStepIdx(stepIdx + 1)
      }
    }, 100)
  }

  if (done) {
    const fullText = scenario.startText + '\n\n' + builtLines.join('\n\n')
    return (
      <div style={{ padding: '24px 20px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 10,
          padding: '20px 22px',
          marginBottom: 24,
          fontSize: 15,
          lineHeight: 1.9,
          color: '#1a1a1a',
          whiteSpace: 'pre-wrap',
        }}>
          {fullText}
        </div>
        <p style={{
          fontSize: 16,
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: 28,
          lineHeight: 1.6,
        }}>
          {scenario.completionMessage}
        </p>
        <button
          onClick={() => onComplete(choices)}
          style={{
            width: '100%',
            padding: '14px',
            background: '#6BAE2E',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent' as string,
          }}
        >
          Keep going →
        </button>
      </div>
    )
  }

  const displayText = scenario.startText + (builtLines.length > 0 ? '\n\n' + builtLines.join('\n\n') : '')

  return (
    <div style={{ padding: '24px 20px', maxWidth: 640, margin: '0 auto' }}>
      {/* Step counter + scenario */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, maxWidth: '75%', lineHeight: 1.5 }}>
          {scenario.scenario}
        </p>
        <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0, marginLeft: 12 }}>
          Step {stepIdx + 1} of {totalSteps}
        </span>
      </div>

      {/* Built text so far */}
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: '16px 18px',
        marginBottom: 20,
        fontSize: 14,
        lineHeight: 1.85,
        color: '#1a1a1a',
        whiteSpace: 'pre-wrap',
        minHeight: 80,
      }}>
        {displayText}
        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}> ▌</span>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {currentStep.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(idx)}
            style={{
              width: '100%',
              minHeight: 56,
              padding: '12px 16px',
              background: flashing === idx ? '#e8f5d9' : '#fff',
              border: `1.5px solid ${flashing === idx ? '#6BAE2E' : '#d1d5db'}`,
              borderRadius: 10,
              fontSize: 15,
              fontFamily: 'inherit',
              textAlign: 'left',
              cursor: flashing !== null ? 'default' : 'pointer',
              color: '#1a1a1a',
              lineHeight: 1.5,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent' as string,
              transition: 'background 0.1s, border-color 0.1s',
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
