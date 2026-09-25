'use client'

// Left vertical nav for the unified Somerset Portal. Reorganised per Hugo's 25 Sep
// instruction: Placement Quiz + Sit the Exam move under "Extras"; Class Materials and
// Context Lab are deliberately NOT here any more — Class Materials is retired in favour
// of the Portal's own lesson/calendar system, and Context Lab becomes a per-student
// action (generate targeted material from a student's error patterns) rather than a
// standalone page. See project_somerset_app.md, "Update — 25 Sep 2026".

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import SomersetLogo from '@/components/SomersetLogo'

const GREEN = '#6BAE2E'
const RACING = '#1E4227'

const PRIMARY = [
  { href: '/dashboard', icon: '📅', label: 'Dashboard' },
  { href: '/groups', icon: '🏫', label: 'Groups' },
  { href: '/students', icon: '📊', label: 'Students' },
  { href: '/scan', icon: '📷', label: 'Scan work' },
  { href: '/correct-queue', icon: '✅', label: 'To correct' },
  { href: '/correct', icon: '✍️', label: 'Correct writing' },
]

const EXTRAS = [
  { href: '/intake', icon: '📋', label: 'Placement quiz' },
  { href: '/cbt', icon: '🖥️', label: 'Sit the exam' },
  { href: '/mocks', icon: '🖊️', label: 'Mock correction' },
  { href: '/qr', icon: '📲', label: 'Student QR' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav style={{
      width: 220,
      flexShrink: 0,
      minHeight: '100vh',
      background: RACING,
      display: 'flex',
      flexDirection: 'column',
      borderRight: `3px solid ${GREEN}`,
    }}>
      <div style={{ padding: '20px 18px' }}>
        <SomersetLogo variant="white" />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        {PRIMARY.map(item => <NavLink key={item.href} {...item} active={isActive(item.href)} />)}

        <div style={{ margin: '16px 10px 6px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
          Extras
        </div>
        {EXTRAS.map(item => <NavLink key={item.href} {...item} active={isActive(item.href)} />)}
      </div>

      {session?.user && (
        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
            {session.user.name}{session.user.role === 'admin' ? ' · Admin' : ''}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 12, cursor: 'pointer', padding: 0 }}
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 8,
        marginBottom: 2,
        fontSize: 13.5,
        fontWeight: active ? 700 : 500,
        color: active ? '#fff' : 'rgba(255,255,255,0.75)',
        background: active ? 'rgba(107,174,46,0.28)' : 'transparent',
        textDecoration: 'none',
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </Link>
  )
}
