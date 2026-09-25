'use client'
import { useState } from 'react'
import type { Version } from '@/lib/intake/types'
import SomersetLogo from '@/components/SomersetLogo'

interface Props {
  onSubmit: (name: string, age: number, version: Version) => void
}

export default function OnboardingCard({ onSubmit }: Props) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')

  const canStart = name.trim().length > 0 && age.trim().length > 0

  function handleSubmit() {
    if (!canStart) return
    const n = name.trim()
    const a = parseInt(age, 10)
    const version: Version = a < 18 ? 'teen' : 'adult'
    onSubmit(n, a, version)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canStart) handleSubmit()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      padding: '40px 24px',
      fontFamily: 'Arial, Liberation Sans, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ transform: 'scale(1.4)', transformOrigin: 'center' }}>
            <SomersetLogo variant="colour" />
          </div>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#111827',
          marginBottom: 12,
          textAlign: 'center',
        }}>
          Welcome to Somerset
        </h1>
        <p style={{
          fontSize: 16,
          color: '#6b7280',
          lineHeight: 1.7,
          marginBottom: 40,
          textAlign: 'center',
          maxWidth: 420,
          margin: '0 auto 40px',
        }}>
          Before your first class, we&apos;d love to find out a little about you.
          This should take around 15 minutes.
        </p>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
            }}>
              Your first name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Your first name"
              autoFocus
              style={{
                width: '100%',
                padding: '13px 16px',
                border: '1.5px solid #d1d5db',
                borderRadius: 10,
                fontSize: 16,
                fontFamily: 'inherit',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
            }}>
              Your age
            </label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Your age"
              min={10}
              max={70}
              style={{
                width: '100%',
                padding: '13px 16px',
                border: '1.5px solid #d1d5db',
                borderRadius: 10,
                fontSize: 16,
                fontFamily: 'inherit',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canStart}
            style={{
              marginTop: 8,
              width: '100%',
              padding: '15px',
              background: canStart ? '#6BAE2E' : '#d1d5db',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 17,
              fontWeight: 700,
              cursor: canStart ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent' as string,
              transition: 'background 0.2s',
            }}
          >
            Let&apos;s go →
          </button>
        </div>
      </div>
    </div>
  )
}
