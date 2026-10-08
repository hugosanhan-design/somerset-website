import type { ReactNode } from 'react'

// Somerset icon set — shared by every course. Spec: Somerset Project/Somerset Icons/icon-inventory.md
// variant "sello": cream drawing on a racing-green seal (Spanish for Expats, young-adults hybrid)
// variant "linea": racing-green line icon (PET)

export type IconName =
  // documents & life
  | 'visa' | 'supporting' | 'nie' | 'padron' | 'eu-cert' | 'tie' | 'nuss' | 'sip' | 'digital' | 'bank'
  | 'calendar' | 'government' | 'documents' | 'device' | 'register' | 'ticket' | 'money' | 'valencia'
  // purposes
  | 'work' | 'nomad' | 'study' | 'retire' | 'family'
  // feedback
  | 'correct' | 'wrong' | 'almost' | 'tip' | 'celebrate' | 'well-done'
  // skills & interface
  | 'listen' | 'speak' | 'read' | 'write' | 'video' | 'sound' | 'clock' | 'lock'

export type IconVariant = 'sello' | 'linea'

const P: Record<IconName, ReactNode> = {
  visa: <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 16h6" /></>,
  supporting: <><path d="M12 3a3 3 0 0 0-3 3c0 2 1 3 1 5H7a2 2 0 0 0-2 2v2h14v-2a2 2 0 0 0-2-2h-3c0-2 1-3 1-5a3 3 0 0 0-3-3z" /><path d="M5 20h14" /></>,
  nie: <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />,
  padron: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  'eu-cert': <><rect x="3" y="3" width="18" height="14" rx="2" /><path d="M7 8h10M7 12h5" /><circle cx="16" cy="17" r="3" /><path d="m14.5 19.5-.5 2.5 2-1 2 1-.5-2.5" /></>,
  tie: <><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="11" r="2" /><path d="M5 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M14 10h5M14 14h4" /></>,
  nuss: <><path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
  sip: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8M8 12h8" /></>,
  digital: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /><circle cx="12" cy="16" r="1" /></>,
  bank: <path d="M3 10 12 4l9 6M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M3 20h18" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  government: <path d="M3 9l9-5 9 5M5 9v9M9.7 9v9M14.3 9v9M19 9v9M3 20h18" />,
  documents: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  device: <><rect x="2" y="5" width="15" height="10" rx="1.5" /><path d="M1 18h16" /><rect x="18" y="9" width="4.5" height="9" rx="1" /></>,
  register: <><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2.5" width="6" height="3" rx="1" /><path d="M8.5 10h7M8.5 14h7M8.5 17.5h4" /></>,
  ticket: <path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM9 9v1.5M9 13.5V15" />,
  money: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" /></>,
  valencia: <><circle cx="12" cy="13.5" r="7.5" /><path d="M12 6c0-1.5.8-2.6 2-3" /><path fill="#6BAE2E" stroke="#6BAE2E" d="M13 5.5c1.8-1.6 4.4-1.7 6-.5-1.3 1.9-3.9 2.3-6 .5z" /></>,
  work: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></>,
  nomad: <><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></>,
  study: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11v5c2 2 10 2 12 0v-5M22 9v5" /></>,
  retire: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  family: <><circle cx="8" cy="7" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14.5 20c0-2.5 1.3-4.5 3-4.5s3 2 3 4.5" /></>,
  correct: <path d="M5 12.5l4.5 4.5L19 7" />,
  wrong: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  almost: <><circle cx="11" cy="13" r="8" /><circle cx="11" cy="13" r="3.5" /><path d="M14.5 9.5 20 4M17 4h3v3" /></>,
  tip: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" /></>,
  celebrate: <><path d="M11 6l1.9 3.9 4.3.6-3.1 3 .7 4.3L11 15.8l-3.8 2 .7-4.3-3.1-3 4.3-.6z" /><path d="M19 3v3M17.5 4.5h3M20 15v3M18.5 16.5h3" /></>,
  'well-done': <><circle cx="12" cy="15" r="5" /><path d="M9 3l3 6 3-6M12 13v4" /></>,
  listen: <><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></>,
  speak: <><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /><path d="M8 10h8M8 13h5" /></>,
  read: <><path d="M3 6c3-1.2 6-1 9 1v13c-3-2-6-2.2-9-1z" /><path d="M21 6c-3-1.2-6-1-9 1v13c3-2 6-2.2 9-1z" /></>,
  write: <><path d="M4 20l1.2-4.8L15.5 4.9a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L8.8 18.8z" /><path d="M14 6.5l3.5 3.5" /></>,
  video: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M10.5 8.2l4 2.3-4 2.3z" /><path d="M8 21h8" /></>,
  sound: <path d="M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
}

const GREEN = '#1E4D3B'
const CREAM = '#F6F1E7'

export function SomersetIcon({ name, variant = 'sello', size = 24, className, title }: {
  name: IconName; variant?: IconVariant; size?: number; className?: string; title?: string
}) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const, focusable: 'false' as const }
  if (variant === 'linea') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GREEN}
        strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...a11y}>
        {P[name]}
      </svg>
    )
  }
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      strokeLinecap="round" strokeLinejoin="round" {...a11y}>
      <circle cx="12" cy="12" r="11.5" fill={GREEN} />
      <circle cx="12" cy="12" r="10.2" stroke={CREAM} strokeWidth={0.45} opacity={0.7} />
      <g transform="translate(12 12) scale(.58) translate(-12 -12)" stroke={CREAM} strokeWidth={2.3}>
        {P[name]}
      </g>
    </svg>
  )
}
