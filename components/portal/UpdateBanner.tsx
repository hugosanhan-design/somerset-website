'use client'

import { useEffect, useState } from 'react'
import { PORTAL } from '@/lib/portalTheme'

// Checks /api/version every few minutes (and whenever the tab regains focus)
// against the build ID baked into this page load. If Hugo has deployed since
// this tab was opened, shows a small bar inviting a reload — otherwise it's
// invisible and does nothing.
const CHECK_INTERVAL_MS = 5 * 60 * 1000

export default function UpdateBanner() {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    const currentBuildId = process.env.NEXT_PUBLIC_BUILD_ID

    async function check() {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const { buildId } = await res.json()
        if (buildId && currentBuildId && buildId !== currentBuildId) {
          setAvailable(true)
        }
      } catch {
        // Offline or blip — never surface this as an error, just try again later.
      }
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (!available) return null

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      background: PORTAL.dark, color: '#fff', fontSize: 13.5, fontWeight: 600,
      padding: '9px 16px',
    }}>
      There's a new version of the Portal.
      <button
        onClick={() => window.location.reload()}
        style={{
          background: PORTAL.green, color: '#fff', border: 'none', borderRadius: 999,
          padding: '5px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}
      >
        Reload
      </button>
    </div>
  )
}
