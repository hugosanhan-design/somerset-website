'use client'

// Splash screen for the unified Somerset Portal. Teachers land here, see the logo,
// and go straight into the sidebar+calendar app at /dashboard (middleware sends them
// to /login first if they're not signed in — see auth.config.ts for the 90-day
// "remember me" session that keeps this feeling like a normal desktop app rather than
// a browser tab). The Student's Corner (no-login placement quiz / exam) stays reachable
// from the small link at the bottom — it's a different audience, not the app's front door.

import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT } from '@/lib/theme'

export default function FrontDoor() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: FONT.sans, background: COLORS.paper, display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: COLORS.racing, borderBottom: `3px solid ${COLORS.green}`, padding: '20px 28px', display: 'flex', justifyContent: 'center' }}>
        <SomersetLogo variant="white" />
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px 60px' }}>
        <h1 style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 32, color: COLORS.ink, textAlign: 'center', marginBottom: 8, letterSpacing: '-0.01em' }}>
          Somerset Portal
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 15, textAlign: 'center', marginBottom: 32 }}>
          Everything for today&apos;s classes, in one place.
        </p>

        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '14px 32px', borderRadius: 50, background: COLORS.green, color: '#fff',
          fontFamily: FONT.sans, fontSize: 15, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 8px 20px rgba(107,174,46,0.28)',
        }}>
          Enter →
        </Link>

        <Link href="/student" style={{ marginTop: 28, fontSize: 13, color: COLORS.muted, textDecoration: 'underline' }}>
          I&apos;m a student
        </Link>
      </main>
    </div>
  )
}
