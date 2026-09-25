import type { Metadata, Viewport } from 'next'
import { Fraunces } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

// House style: Georgia (headings) + Arial (body/UI/data), the same pairing as
// the PET/FCE Level Ladder decks. Both are system fonts — no Google Fonts load,
// so no offline/PDF-export font-fallback risk (see reference_somerset_logo.md).
// EXCEPTION (25 Sep 2026): Fraunces, matching the public website's heading
// font, for the Portal pages Hugo wants to look "premium" (Dashboard etc via
// lib/portalTheme.ts's PORTAL.serif). next/font downloads and self-hosts it
// at Vercel BUILD time (normal internet access there), not through this
// sandbox's restricted proxy, so the reference_pdf_generation_pipeline.md
// Google Fonts block does not apply here — that block is specific to the
// weasyprint PDF pipeline, which never touches this app.
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
//
// PWA: manifest + icons (public/manifest.json, public/icons/) let teachers add
// the Portal to their phone/desktop home screen via the browser's own "Install
// app" / "Add to Dock" prompt — no native wrapper needed. See
// feedback_somerset_app_pwa_install.md.

export const metadata: Metadata = {
  title: 'Somerset Portal',
  description: 'Somerset Language Centre — Teacher Tools',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Somerset',
  },
}

export const viewport: Viewport = {
  themeColor: '#1E4227',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
