import PortalShell from '@/components/portal/PortalShell'

// Shared layout for the pages using the new teaching-deck design (Dashboard,
// Groups, To correct — see project memory for the scope decision). Putting
// PortalShell here instead of inside each page.tsx means the Sidebar (and
// UpdateBanner) stay mounted across navigations between these pages: no
// remount flicker, no lost scroll position, and any future Sidebar state
// (collapse, active-section memory) survives clicking between them.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>
}
