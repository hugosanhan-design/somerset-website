import type { Metadata } from 'next'

// Scan gets its OWN manifest (start_url + scope both "/scan"), separate from the
// site-wide one in app/layout.tsx (start_url "/dashboard", scope "/"). Without this
// override, installing "the app" from ANY page — including Hugo's own desktop
// Chrome on the Dashboard — picked up the scan-only manifest and opened straight
// to Scan with no way to reach the rest of the portal. Metadata set here overrides
// the parent layout's `manifest` field for everything under /scan; other routes
// (and a desktop install) keep the full-portal manifest. See feedback_somerset_app_pwa_install.md.
export const metadata: Metadata = {
  manifest: '/manifest-scan.json',
}

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return children
}
