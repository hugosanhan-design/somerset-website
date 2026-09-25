'use client'
import { useEffect, useState } from 'react'
import type { IntakeSession, Version } from '@/lib/intake/types'
import IntakeFlow from './IntakeFlow'
import SomersetLogo from '@/components/SomersetLogo'

interface Config {
  version: Version
  heading: string
  subheading: string
  ageMin: number
  ageMax: number
}

interface Props {
  config: Config
}

type Screen = 'loading' | 'resume' | 'intro' | 'flow'

const HEADER: React.CSSProperties = {
  borderBottom: '3px solid #6BAE2E',
  padding: '14px 24px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff',
}

const CONTAINER: React.CSSProperties = {
  maxWidth: 540,
  margin: '0 auto',
  padding: '40px 24px 64px',
  fontFamily: 'Arial, Liberation Sans, sans-serif',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 15,
  fontFamily: 'Arial, Liberation Sans, sans-serif',
  boxSizing: 'border-box',
  color: '#111827',
}

const BTN_PRIMARY: React.CSSProperties = {
  width: '100%',
  padding: '13px',
  backgroundColor: '#6BAE2E',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 700,
  fontFamily: 'Arial, Liberation Sans, sans-serif',
  cursor: 'pointer',
  marginTop: 8,
}

const BTN_SECONDARY: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#f3f4f6',
  color: '#374151',
  border: 'none',
  borderRadius: 8,
  fontSize: 15,
  fontFamily: 'Arial, Liberation Sans, sans-serif',
  cursor: 'pointer',
}

function SomersetHeader() {
  return (
    <header style={HEADER}>
      <SomersetLogo variant="colour" />
    </header>
  )
}

export default function VersionPageShell({ config }: Props) {
  const { version, heading, subheading, ageMin, ageMax } = config
  const [screen, setScreen] = useState<Screen>('loading')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [resumeSession, setResumeSession] = useState<IntakeSession | null>(null)
  const [confirmed, setConfirmed] = useState<{ name: string; age: number } | null>(null)

  useEffect(() => {
    // If arriving from the gate page, name+age are already collected — go straight to flow
    try {
      const init = sessionStorage.getItem('somerset-intake-init')
      if (init) {
        const { name: n, age: a } = JSON.parse(init)
        sessionStorage.removeItem('somerset-intake-init')
        if (n && a) {
          setConfirmed({ name: n, age: a })
          setScreen('flow')
          return
        }
      }
    } catch {}

    // No gate data — check for a resumable in-progress session
    try {
      const saved = localStorage.getItem(`somerset-intake-${version}`)
      if (saved) {
        const parsed: IntakeSession = JSON.parse(saved)
        const hoursOld = (Date.now() - parsed.lastSavedAt) / 3600000
        if (!parsed.completed && hoursOld < 24) {
          setResumeSession(parsed)
          setName(parsed.studentName)
          setAge(String(parsed.studentAge))
          setScreen('resume')
          return
        }
      }
    } catch {}

    // Neither — show the name/age form
    setScreen('intro')
  }, [version])

  function handleStartFresh() {
    localStorage.removeItem(`somerset-intake-${version}`)
    setResumeSession(null)
    setScreen('intro')
  }

  function handleResume() {
    if (!resumeSession) return
    setConfirmed({ name: resumeSession.studentName, age: resumeSession.studentAge })
    setScreen('flow')
  }

  function handleFormSubmit() {
    const n = name.trim()
    const a = parseInt(age, 10)
    if (!n) { setError('Please enter your name.'); return }
    if (!a || a < ageMin || a > ageMax + 4) {
      setError(`Please enter a valid age between ${ageMin} and ${ageMax}.`)
      return
    }
    setConfirmed({ name: n, age: a })
    setScreen('flow')
  }

  if (screen === 'loading') return null

  if (screen === 'resume' && resumeSession) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        <SomersetHeader />
        <div style={CONTAINER}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Welcome back, {resumeSession.studentName}!
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            You started this earlier. Would you like to continue where you left off?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={handleResume} style={BTN_PRIMARY}>
              Continue where I left off
            </button>
            <button onClick={handleStartFresh} style={BTN_SECONDARY}>
              Start again from the beginning
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (screen === 'flow' && confirmed) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        <SomersetHeader />
        <div style={CONTAINER}>
          <IntakeFlow />
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <SomersetHeader />
      <div style={CONTAINER}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 10, lineHeight: 1.3 }}>
          {heading}
        </h1>
        <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          {subheading}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              {version === 'children' ? "What's your name?" : 'Your name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder={version === 'children' ? 'Write your name here' : 'First name'}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              {version === 'children' ? 'How old are you?' : 'Age'}
            </label>
            <input
              type="number"
              value={age}
              onChange={e => { setAge(e.target.value); setError('') }}
              min={ageMin}
              max={ageMax + 4}
              placeholder={`e.g. ${ageMin + 1}`}
              style={INPUT_STYLE}
            />
          </div>

          {error && (
            <p style={{ fontSize: 14, color: '#dc2626', fontFamily: 'Arial, Liberation Sans, sans-serif' }}>
              {error}
            </p>
          )}

          <button onClick={handleFormSubmit} style={BTN_PRIMARY}>
            {version === 'children' ? "Let's go! →" : "Let's start →"}
          </button>
        </div>
      </div>
    </main>
  )
}
