'use client'
import { useState, useEffect } from 'react'
import type { Version } from '@/lib/intake/types'

interface Props {
  question: string
  sentence?: string        // for vocab cards — the fill-in-the-blank sentence
  readingText?: string     // for Phase 2 reading items
  options: [string, string, string]
  correctIndex: 0 | 1 | 2
  onSubmit: (isCorrect: boolean) => void
  version: Version
  timerSeconds?: number    // default: 15 if readingText present, 8 otherwise
}

export default function MCQCard({
  question,
  sentence,
  readingText,
  options,
  correctIndex,
  onSubmit,
  timerSeconds,
}: Props) {
  const duration = timerSeconds ?? (readingText ? 15 : 8)

  const [elapsed, setElapsed] = useState(0)
  const [selected, setSelected] = useState<0 | 1 | 2 | null>(null)
  const [revealed, setRevealed] = useState(false)

  const canAnswer = elapsed >= duration

  useEffect(() => {
    if (elapsed >= duration) return
    const t = setInterval(() => setElapsed(e => Math.min(e + 0.1, duration)), 100)
    return () => clearInterval(t)
  }, [elapsed, duration])

  function handleSelect(idx: 0 | 1 | 2) {
    if (!canAnswer || revealed) return
    setSelected(idx)
    setRevealed(true)
    const isCorrect = idx === correctIndex
    setTimeout(() => onSubmit(isCorrect), 1200)
  }

  function optionStyle(idx: 0 | 1 | 2): React.CSSProperties {
    const base: React.CSSProperties = {
      width: '100%',
      padding: '12px 16px',
      borderRadius: 8,
      border: '1.5px solid #d1d5db',
      background: '#fff',
      color: '#1a1a1a',
      fontSize: 15,
      fontFamily: 'inherit',
      textAlign: 'left',
      cursor: canAnswer && !revealed ? 'pointer' : 'default',
      transition: 'background 0.2s, border-color 0.2s, color 0.2s',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent' as string,
    }

    if (!revealed) {
      if (!canAnswer) {
        base.opacity = 0.5
        base.cursor = 'not-allowed'
      }
      return base
    }

    // Revealed state
    if (idx === correctIndex) {
      return { ...base, background: '#d4edda', borderColor: '#6BAE2E', color: '#155724', fontWeight: 600 }
    }
    if (idx === selected && selected !== correctIndex) {
      return { ...base, background: '#f8d7da', borderColor: '#c0392b', color: '#721c24' }
    }
    return { ...base, opacity: 0.4 }
  }

  const progressPct = Math.min((elapsed / duration) * 100, 100)

  return (
    <div style={{ padding: '24px 20px', maxWidth: 560, margin: '0 auto' }}>
      {readingText && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '16px 18px',
          marginBottom: 20,
          fontSize: 15,
          lineHeight: 1.75,
          color: '#1a1a1a',
        }}>
          {readingText}
        </div>
      )}

      {/* Progress bar — thin, subtle, fills over the timer duration */}
      <div style={{
        height: 3,
        background: '#e5e7eb',
        borderRadius: 2,
        marginBottom: 20,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: '#6BAE2E',
          transition: 'width 0.1s linear',
          borderRadius: 2,
        }} />
      </div>

      <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: sentence ? 12 : 20, lineHeight: 1.5 }}>
        {question}
      </p>

      {sentence && (
        <p style={{
          fontSize: 16,
          color: '#1a1a1a',
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          lineHeight: 1.6,
          fontStyle: 'italic',
        }}>
          {sentence}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx as 0 | 1 | 2)}
            disabled={!canAnswer || revealed}
            style={optionStyle(idx as 0 | 1 | 2)}
          >
            {opt}
          </button>
        ))}
      </div>

      {!canAnswer && (
        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 16 }}>
          Read the {readingText ? 'text' : 'sentence'} above, then choose your answer.
        </p>
      )}
    </div>
  )
}
