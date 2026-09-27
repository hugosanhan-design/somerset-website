'use client'

// Small fixed "← Dashboard" pill for standalone pages that have no header nav of
// their own (Scan, Student QR) or are shared with anonymous students (Placement
// Quiz, Sit the Exam — no-login public links, see middleware.ts's matcher).
// Renders nothing for a signed-out visitor, since a student following a QR code
// or exam link has no dashboard to go back to and the pill would just be a dead
// end. Added 27 Sep 2026 — installing the Portal as a desktop app removes the
// browser's own back button, so these pages had no way out at all.
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function BackToDashboard() {
  const { data: session } = useSession()
  if (!session?.user) return null

  return (
    <Link
      href="/dashboard"
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 1000,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 999,
        background: 'rgba(30,66,39,0.9)',
        color: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 12.5,
        fontWeight: 600,
        textDecoration: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      ← Dashboard
    </Link>
  )
}
