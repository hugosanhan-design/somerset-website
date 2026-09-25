'use client'
import { useEffect, useRef, useState } from 'react'
import type { Version } from '@/lib/intake/types'

interface Props {
  question: string
  readingText?: string
  onSubmit: (response: string) => void
  isScoring: boolean
  version: Version
}

const MIN_SECONDS = 8

const PLACEHOLDERS: Record<Version, string> = {
  children: 'Write your answer here...',
  teen: 'Your answer...',
  adult: 'Write as much or as little as you like...',
}

export default function QuestionCard({ question, readingText, onSubmit, isScoring, version }: Props) {
  const [response, setResponse] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [nudged, setNudged] = useState(false)
  const startRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    startRef.current = Date.now()
    setElapsed(0)
    setResponse('')
    setNudged(false)

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [question])

  const canSubmit = elapsed >= MIN_SECONDS && response.trim().length > 2 && !isScoring

  function handleSubmit() {
    if (elapsed < MIN_SECONDS || response.trim().length <= 2) {
      setNudged(true)
      return
    }
    onSubmit(response.trim())
  }

  const fontSize = version === 'children' ? 16 : 15

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {readingText && (
        <div
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '16px 18px',
            fontSize: 15,
            fontFamily: 'Arial, Liberation Sans, sans-serif',
            color: '#374151',
            lineHeight: 1.7,
          }}
        >
          {readingText}
        </div>
      )}

      <p
        style={{
          fontSize: fontSize,
          fontFamily: 'Arial, Liberation Sans, sans-serif',
          color: '#111827',
          fontWeight: 600,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {question}
      </p>

      <textarea
        value={response}
        onChange={e => { setResponse(e.target.value); setNudged(false) }}
        disabled={isScoring}
        placeholder={PLACEHOLDERS[version]}
        style={{
          width: '100%',
          minHeight: version === 'children' ? 100 : 130,
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          fontSize: 15,
          fontFamily: 'Arial, Liberation Sans, sans-serif',
          color: '#111827',
          resize: 'vertical',
          boxSizing: 'border-box',
          outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = '#6BAE2E' }}
        onBlur={e => { e.target.style.borderColor = '#d1d5db' }}
      />

      {nudged && (
        <p style={{ fontSize: 14, color: '#6BAE2E', fontFamily: 'Arial, Liberation Sans, sans-serif', margin: 0 }}>
          Tell us a bit more — we'd love to hear your thoughts!
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          padding: '13px 20px',
          backgroundColor: canSubmit ? '#6BAE2E' : '#d1d5db',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'Arial, Liberation Sans, sans-serif',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.2s',
          width: '100%',
        }}
      >
        {isScoring ? 'Just a moment...' : 'Continue →'}
      </button>
    </div>
  )
}
