import type { ReactNode } from 'react'

export type IconName =
  | 'visa' | 'supporting' | 'nie' | 'padron' | 'eu-cert' | 'tie' | 'nuss' | 'sip' | 'digital' | 'bank'
  | 'work' | 'nomad' | 'study' | 'retire' | 'family' | 'clock' | 'lock'

const P: Record<IconName, ReactNode> = {
  visa: <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 16h6" /></>,
  supporting: <><path d="M12 3a3 3 0 0 0-3 3c0 2 1 3 1 5H7a2 2 0 0 0-2 2v2h14v-2a2 2 0 0 0-2-2h-3c0-2 1-3 1-5a3 3 0 0 0-3-3z" /><path d="M5 20h14" /></>,
  nie: <><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></>,
  padron: <><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
  'eu-cert': <><rect x="3" y="3" width="18" height="14" rx="2" /><path d="M7 8h10M7 12h5" /><circle cx="16" cy="17" r="3" /><path d="m14.5 19.5-.5 2.5 2-1 2 1-.5-2.5" /></>,
  tie: <><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="11" r="2" /><path d="M5 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M14 10h5M14 14h4" /></>,
  nuss: <><path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
  sip: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8M8 12h8" /></>,
  digital: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /><circle cx="12" cy="16" r="1" /></>,
  bank: <><path d="M3 10 12 4l9 6M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M3 20h18" /></>,
  work: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></>,
  nomad: <><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></>,
  study: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11v5c2 2 10 2 12 0v-5M22 9v5" /></>,
  retire: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  family: <><circle cx="8" cy="7" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14.5 20c0-2.5 1.3-4.5 3-4.5s3 2 3 4.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
}

export function Icon({ name, size = 22, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {P[name]}
    </svg>
  )
}
