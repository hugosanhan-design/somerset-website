// Shared design system for the teacher-portal pages — Somerset "house style"
// (the light PET/FCE Level Ladder look: white ground, green header band, Georgia
// serif for headings, Arial for body/UI/data). Tokens are lifted from the real
// pptx build scripts in Somerset Worksheets/_method/level-ladder-results-scripts/
// (RGBColor values, not guessed) so the app matches the actual PET/FCE decks,
// not just their vibe. This intentionally overrides the "Vista is for adults"
// rule for this one product — Hugo's call, 25 Sep 2026.
import type { CSSProperties } from 'react'

export const COLORS = {
  paper: '#FFFFFF',
  paper2: '#F4F7F0',      // faint green-tinted panel, for zebra rows / side panels
  ink: '#222222',          // body text — matches the pptx data rows
  inkSoft: '#3A3A3A',
  racing: '#1E4227',       // deep green — header band, dark surfaces
  racing2: '#3F6E17',      // "kicker" tag green, correct-answer green
  green: '#6BAE2E',        // primary brand green — CTAs, active states, logo
  greenDk: '#3F6E17',
  leaf: '#A8D77E',
  amber: '#E08A1E',        // "not yet" / attention accent from the real decks
  brass: '#E08A1E',        // kept as an alias so any old references still resolve
  muted: '#777777',
  line: '#DDDDDD',
  danger: '#B23A2C',
}

export const FONT = {
  // Georgia/Arial are system fonts — no Google Fonts load, no offline/PDF-export
  // font-fallback bug (see reference_somerset_logo.md). Matches the real decks.
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'Arial, Helvetica, "Instrument Sans", system-ui, sans-serif',
  brand: 'Arial, Helvetica, sans-serif',
}

export const RADIUS = { pill: 50, card: 14, popover: 12 }

export const SHADOW = {
  green: '0 8px 20px rgba(107,174,46,0.28)',
  greenHover: '0 12px 24px rgba(107,174,46,0.34)',
  ink: '0 18px 40px rgba(30,66,39,0.16)',
  inkSoft: '0 4px 16px rgba(30,66,39,0.08)',
  lift: '0 6px 18px rgba(0,0,0,0.10)',
}

export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// ── Reusable style objects — spread these into a page's own style map ──

export const page: CSSProperties = {
  minHeight: '100vh',
  background: COLORS.paper,
  fontFamily: FONT.sans,
  color: COLORS.ink,
}

// Green header band — white wordmark + white bold serif title, as on every
// interior Level Ladder slide.
export const header: CSSProperties = {
  background: COLORS.racing,
  color: '#fff',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  borderBottom: `3px solid ${COLORS.green}`,
}

export const headerBrand: CSSProperties = {
  fontFamily: FONT.brand,
  fontWeight: 700,
  fontSize: 17,
  color: '#fff',
  textDecoration: 'none',
  letterSpacing: '0.01em',
}

export const headerLink: CSSProperties = {
  color: 'rgba(255,255,255,0.85)',
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 600,
}

export const h1: CSSProperties = {
  fontFamily: FONT.serif,
  fontWeight: 700,
  fontSize: 26,
  color: COLORS.ink,
  letterSpacing: '-0.01em',
}

export const h2: CSSProperties = {
  fontFamily: FONT.serif,
  fontWeight: 700,
  fontSize: 17,
  color: COLORS.ink,
}

// The dark-green rectangular "kicker" tag from the Level Ladder decks
// (e.g. "PART 1 OF THE LADDER"). Use for section labels above a heading.
export const kicker: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 12px',
  borderRadius: 4,
  background: COLORS.racing2,
  color: '#fff',
  fontFamily: FONT.sans,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

export const eyebrow: CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: COLORS.muted,
}

export const card: CSSProperties = {
  background: '#fff',
  borderRadius: RADIUS.card,
  padding: '20px 22px',
  boxShadow: SHADOW.inkSoft,
  border: `1px solid ${COLORS.line}`,
}

export const btnPrimary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '11px 22px',
  borderRadius: RADIUS.pill,
  border: '1.5px solid transparent',
  background: COLORS.green,
  color: '#fff',
  fontFamily: FONT.sans,
  fontSize: 13.5,
  fontWeight: 700,
  letterSpacing: '0.01em',
  cursor: 'pointer',
  boxShadow: SHADOW.green,
  transition: `all 0.22s ${EASE}`,
  textDecoration: 'none',
}

export const btnGhost: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '10px 20px',
  borderRadius: RADIUS.pill,
  border: `1.5px solid ${COLORS.line}`,
  background: 'transparent',
  color: COLORS.ink,
  fontFamily: FONT.sans,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  transition: `all 0.22s ${EASE}`,
  textDecoration: 'none',
}

export const btnSmall: CSSProperties = {
  padding: '7px 16px',
  borderRadius: RADIUS.pill,
  border: 'none',
  background: COLORS.paper2,
  color: COLORS.racing2,
  fontFamily: FONT.sans,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  transition: `all 0.22s ${EASE}`,
}

export const chip: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 14px',
  borderRadius: RADIUS.pill,
  border: `1.5px solid ${COLORS.line}`,
  background: '#fff',
  color: COLORS.ink,
  fontFamily: FONT.sans,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  transition: `all 0.18s ${EASE}`,
}

export const chipActive: CSSProperties = {
  background: COLORS.green,
  borderColor: COLORS.green,
  color: '#fff',
}

export const input: CSSProperties = {
  borderWidth: 1.5,
  borderStyle: 'solid',
  borderColor: COLORS.line,
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  fontFamily: FONT.sans,
  outline: 'none',
  width: '100%',
  background: '#fff',
  color: COLORS.ink,
}

export const progressTrack: CSSProperties = {
  height: 6,
  background: COLORS.paper2,
  borderRadius: RADIUS.pill,
  overflow: 'hidden',
}

export const progressFill: CSSProperties = {
  height: '100%',
  background: COLORS.green,
  borderRadius: RADIUS.pill,
}
