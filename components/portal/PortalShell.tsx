'use client'

import Sidebar from './Sidebar'
import UpdateBanner from './UpdateBanner'
import { PORTAL } from '@/lib/portalTheme'

export default function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: PORTAL.pageBg }}>
      <UpdateBanner />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  )
}
