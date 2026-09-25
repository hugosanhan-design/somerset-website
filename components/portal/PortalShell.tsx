'use client'

import Sidebar from './Sidebar'
import { PORTAL } from '@/lib/portalTheme'

export default function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: PORTAL.pageBg }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  )
}
