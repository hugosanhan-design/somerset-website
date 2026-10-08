import type { ReactNode, SVGAttributes } from 'react'

// Somerset icon set — shared by every course. Spec: Somerset Project/Somerset Icons/icon-inventory.md
// Each icon mirrors the emoji it replaces (🪪 💳 🏠 📅 🏛️ 🧾 💻 🔐 📋 🔢 💰 🏦 🎉 👍 💪 💡 🔊 🗣 🎬 …)
// variant "sello": solid cream drawing with cut-in details on a racing-green seal (Spanish for Expats, young-adults hybrid)
// variant "linea": racing-green outline version of the same drawing (PET)

export type IconName =
  | 'visa' | 'supporting' | 'nie' | 'padron' | 'eu-cert' | 'tie' | 'nuss' | 'sip' | 'digital' | 'bank'
  | 'calendar' | 'government' | 'documents' | 'device' | 'register' | 'digits' | 'money' | 'valencia'
  | 'work' | 'nomad' | 'study' | 'retire' | 'family'
  | 'correct' | 'wrong' | 'almost' | 'tip' | 'celebrate' | 'well-done'
  | 'listen' | 'speak' | 'read' | 'write' | 'video' | 'sound' | 'clock' | 'lock'

export type IconVariant = 'sello' | 'linea'

type Paint = SVGAttributes<SVGElement>
type Kit = { F: Paint; D: Paint; A: Paint; AL: Paint; ink: string }

const laptop = ({ F, D, A }: Kit) => <>
  <rect {...F} x="4" y="4.5" width="16" height="11" rx="1.5" />
  <path {...F} d="M1.5 17.5h21l-1.5 2.5H3z" />
  <rect {...D} x="6" y="6.5" width="12" height="7" rx=".6" />
  <rect {...A} x="7.2" y="7.7" width="5" height="2.2" rx=".6" />
</>

const temple = ({ F, A }: Kit, bank: boolean) => <>
  <path {...F} d="M2.5 8.5 12 3l9.5 5.5z" />
  <rect {...F} x="3.5" y="9.3" width="17" height="1.8" rx=".4" />
  {[5, 9, 13, 17].map(x => <rect key={x} {...F} x={x} y="12" width="2" height="6" rx=".4" />)}
  <rect {...F} x="2.5" y="18.6" width="19" height="2.4" rx=".5" />
  {bank
    ? <><circle {...A} cx="12" cy="6.7" r="1.7" /></>
    : <circle {...A} cx="12" cy="6.8" r="1.1" />}
</>

const P: Record<IconName, (k: Kit) => ReactNode> = {
  // 🛂 passport
  visa: ({ F, D, A }) => <>
    <rect {...F} x="5" y="2.5" width="14" height="19" rx="2" />
    <circle {...D} cx="12" cy="10.5" r="3.6" />
    <ellipse {...D} cx="12" cy="10.5" rx="1.5" ry="3.6" />
    <path {...D} d="M8.4 10.5h7.2" />
    <rect {...A} x="9" y="16.4" width="6" height="1.5" rx=".75" />
  </>,
  // 📑 stamped document (apostille)
  supporting: ({ F, D, A }) => <>
    <rect {...F} x="3.5" y="2.5" width="13.5" height="17.5" rx="1.5" />
    <path {...D} d="M6.5 6.5h7.5M6.5 9.5h7.5M6.5 12.5h4.5" />
    <path {...A} d="M14.2 18.8 13.2 22l2.3-1.1 2.3 1.1-1-3.2z" />
    <circle {...A} cx="16.5" cy="16.2" r="3.6" />
  </>,
  // 🪪 identification card
  nie: ({ F, D, A }) => <>
    <rect {...F} x="2" y="5" width="20" height="14" rx="2.5" />
    <rect {...D} x="4.8" y="8.2" width="5.6" height="7" rx="1" />
    <circle {...A} cx="7.6" cy="10.6" r="1.3" />
    <path {...A} d="M5.6 14.4c.4-1.5 1.2-2.1 2-2.1s1.6.6 2 2.1z" />
    <path {...D} d="M13 9.5h6M13 12.5h6M13 15.5h3.8" />
  </>,
  // 🏠 house
  padron: ({ F, D, A }) => <>
    <rect {...F} x="15.8" y="4.5" width="2.6" height="5" rx=".4" />
    <path {...F} d="M2.8 11.2 12 3.5l9.2 7.7V20a1 1 0 0 1-1 1H3.8a1 1 0 0 1-1-1z" />
    <rect {...A} x="10.2" y="14.2" width="3.6" height="6.8" rx=".5" />
    <rect {...D} x="5.4" y="12.4" width="3" height="3" rx=".4" />
    <rect {...D} x="15.6" y="12.4" width="3" height="3" rx=".4" />
  </>,
  // 🟩 EU registration certificate (ring of stars)
  'eu-cert': ({ F, D, A }) => <>
    <rect {...F} x="2.5" y="4" width="19" height="15" rx="2" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const r = (a * Math.PI) / 180
      const x = (12 + 3.6 * Math.cos(r)).toFixed(2), y = (10.6 + 3.6 * Math.sin(r)).toFixed(2)
      return <path key={a} {...D} strokeWidth={1.9} d={`M${x} ${y}h.01`} />
    })}
    <rect {...A} x="8.5" y="15.6" width="7" height="1.4" rx=".7" />
  </>,
  // 💳 card
  tie: ({ F, D, A }) => <>
    <rect {...F} x="2" y="5" width="20" height="14" rx="2.5" />
    <path {...D} strokeWidth={2.6} d="M2.6 9.6h18.8" />
    <path {...D} d="M5 15.2h5.5" />
    <rect {...A} x="15" y="13" width="4" height="3.2" rx=".7" />
  </>,
  // 🛡 social security
  nuss: ({ F, D, A }) => <>
    <path {...F} d="M12 2.5 19.5 5.6v5.6c0 5-3.2 8.3-7.5 10.3-4.3-2-7.5-5.3-7.5-10.3V5.6z" />
    <path {...D} strokeWidth={2} d="m8.6 12 2.4 2.4 4.6-4.6" />
    <circle {...A} cx="12" cy="6.3" r="1" />
  </>,
  // 🏥 hospital
  sip: ({ F, D, AL }) => <>
    <rect {...F} x="7.5" y="3" width="9" height="5.5" rx=".6" />
    <rect {...F} x="3" y="7.8" width="18" height="13.2" rx="1" />
    <path {...AL} d="M12 3.9v3.6M10.2 5.7h3.6" />
    <path {...D} d="M6 11.5h2M16 11.5h2M6 15h2M16 15h2" />
    <path {...D} d="M10.5 21v-3.8h3V21" />
  </>,
  // 🔐 lock with key
  digital: ({ F, D, A, AL }) => <>
    <path {...F} fill="none" strokeWidth={2} d="M6 11V8a3.5 3.5 0 0 1 7 0v3" />
    <rect {...F} x="3.5" y="11" width="12" height="10" rx="2" />
    <circle {...D} cx="9.5" cy="15.2" r="1.1" />
    <path {...D} d="M9.5 16.3v2" />
    <circle {...A} cx="18.6" cy="8.6" r="2.5" />
    <path {...AL} d="M18.6 11v8M18.6 15h1.8M18.6 17.6h1.4" />
  </>,
  // 🏦 bank
  bank: k => temple(k, true),
  // 📅 calendar
  calendar: ({ F, D, A }) => <>
    <rect {...F} x="3" y="5" width="18" height="16" rx="2" />
    <path {...A} d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3z" />
    <path {...F} fill="none" strokeWidth={1.8} d="M8 2.8v4M16 2.8v4" />
    <path {...D} strokeWidth={2.2} d="M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01" />
  </>,
  // 🏛️ classical building
  government: k => temple(k, false),
  // 🧾 receipt
  documents: ({ F, D, A }) => <>
    <path {...F} d="M5 3h14v18l-2.3-1.5-2.4 1.5-2.3-1.5-2.3 1.5-2.4-1.5L5 21z" />
    <path {...D} d="M8 7.5h8M8 11h8M8 14.5h5" />
    <rect {...A} x="12.5" y="15.9" width="3.5" height="1.5" rx=".7" />
  </>,
  // 💻 laptop
  device: laptop,
  // 📋 clipboard
  register: ({ F, D, A }) => <>
    <rect {...F} x="4.5" y="4" width="15" height="18" rx="2" />
    <rect {...A} x="8.5" y="2.4" width="7" height="3.6" rx="1" />
    <path {...D} d="m7.8 10.6 1.1 1.1 2-2.1M13 10.6h4M7.8 15.2l1.1 1.1 2-2.1M13 15.2h4" />
  </>,
  // 🔢 1234
  digits: ({ F, A, ink }) => <>
    <rect {...F} x="2.5" y="2.5" width="8.5" height="8.5" rx="2" />
    <rect {...F} x="13" y="2.5" width="8.5" height="8.5" rx="2" />
    <rect {...F} x="2.5" y="13" width="8.5" height="8.5" rx="2" />
    <rect {...A} x="13" y="13" width="8.5" height="8.5" rx="2" />
    {(['1', '2', '3', '4'] as const).map((n, i) => (
      <text key={n} x={i % 2 ? 17.25 : 6.75} y={i < 2 ? 9.1 : 19.6} textAnchor="middle" fontSize="6.6" fontWeight={700}
        fontFamily="Arial, Helvetica, sans-serif" fill={i === 3 ? '#FFFFFF' : ink} stroke="none">{n}</text>
    ))}
  </>,
  // 💰 money bag
  money: ({ F, D, A }) => <>
    <path {...F} d="M9 3h6l-1.5 3c4 1.5 6.5 5 6.5 9 0 4-3 6-8 6s-8-2-8-6c0-4 2.5-7.5 6.5-9z" />
    <rect {...A} x="9" y="5.3" width="6" height="1.8" rx=".9" />
    <path {...D} d="M14.6 11.6a3 3 0 1 0 0 4.8M8.8 13.2h4.5M8.8 14.9h4.5" />
  </>,
  // 🍊 Valencian orange — the Somerset signature
  valencia: ({ F, D, A }) => <>
    <path {...F} fill="none" strokeWidth={1.6} d="M12 6.2c0-1.6.8-2.7 2-3.2" />
    <circle {...F} cx="12" cy="13.5" r="7.5" />
    <path {...D} d="M8.4 11a4 4 0 0 1 2.4-2.1" />
    <path {...A} d="M13.2 5.6c1.8-1.7 4.5-1.8 6.1-.6-1.3 2-4 2.4-6.1.6z" />
  </>,
  // 💼 briefcase
  work: ({ F, D, A }) => <>
    <path {...F} fill="none" strokeWidth={1.8} d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7" />
    <rect {...F} x="2.5" y="7" width="19" height="13" rx="2" />
    <path {...D} d="M2.5 12.6h19" />
    <rect {...A} x="10.5" y="11.3" width="3" height="2.7" rx=".6" />
  </>,
  // 💻 remote work
  nomad: laptop,
  // 🎓 graduation cap
  study: ({ F, A, AL }) => <>
    <path {...F} d="M6 11.3v4.2c2 2.3 10 2.3 12 0v-4.2L12 14z" />
    <path {...F} d="M1.5 9 12 4l10.5 5L12 14z" />
    <path {...AL} d="M20 9.6v4.6" />
    <circle {...A} cx="20" cy="15.2" r="1.1" />
  </>,
  // 🌅 sunset over the sea
  retire: ({ F, AL }) => <>
    <path {...F} d="M6.5 15a5.5 5.5 0 0 1 11 0z" />
    <path {...AL} d="M12 5v2M5.3 8l1.4 1.4M18.7 8l-1.4 1.4M2.8 15h2M19.2 15h2" />
    <path {...F} fill="none" strokeWidth={1.6} d="M3 18.3q2.2-1.2 4.5 0t4.5 0 4.5 0 4.5 0M6 21q1.6-.9 3.2 0t3.2 0 3.2 0" />
  </>,
  // 👨‍👩‍👧 family
  family: ({ F, A }) => <>
    <circle {...F} cx="6.8" cy="6.5" r="2.6" />
    <circle {...F} cx="17.2" cy="6.5" r="2.6" />
    <path {...F} d="M2.3 20v-4a4.5 4.5 0 0 1 9 0v4z" />
    <path {...F} d="M12.7 20v-4a4.5 4.5 0 0 1 9 0v4z" />
    <circle {...A} cx="12" cy="12" r="2" />
    <path {...A} d="M9 21.5v-2.4a3 3 0 0 1 6 0v2.4z" />
  </>,
  // ✅ tick
  correct: ({ F }) => <path {...F} fill="none" strokeWidth={2.8} d="M4.5 12.5 9.5 17.5 19.5 6.5" />,
  // ❌ cross
  wrong: ({ F }) => <path {...F} fill="none" strokeWidth={2.8} d="M6 6l12 12M18 6 6 18" />,
  // 💪 keep going
  almost: ({ F, D }) => <>
    <path {...F} d="M2 13.6C5 12.6 7 11.2 9.4 11.3c1.6-2.2 4.6-1.8 5.1.7l.3-2L14 6.6c-.5-2 1-3.6 3-3.4l2 .4c1.5.4 2 1.9 1.4 3.2l-.8 1.8 1.4 8.9c.3 2-1 3.5-3 3.5H2z" />
    <path {...D} d="M5.5 17c2.6-1.3 5.6-1.4 8.2-.3M15.5 5.6h3" />
  </>,
  // 💡 light bulb
  tip: ({ F, D, AL }) => <>
    <path {...F} d="M12 2.8a6.2 6.2 0 0 0-3.7 11.2c.7.6 1.1 1.4 1.1 2.3h5.2c0-.9.4-1.7 1.1-2.3A6.2 6.2 0 0 0 12 2.8z" />
    <rect {...F} x="9.4" y="17.2" width="5.2" height="1.6" rx=".5" />
    <rect {...F} x="10.2" y="19.6" width="3.6" height="1.6" rx=".6" />
    <path {...D} d="m10.4 12.6 1.6-2.2 1.6 2.2" />
    <path {...AL} d="M9.4 7.6a3 3 0 0 1 2-2" />
  </>,
  // 🎉 party popper
  celebrate: ({ F, D, A, AL }) => <>
    <path {...F} d="M3 21 8 9l7 7z" />
    <path {...D} d="m6.3 13.2 4.4 4.4M7.6 10.4l5.9 5.9" />
    <circle {...A} cx="15.2" cy="5" r="1.3" />
    <circle {...A} cx="20" cy="10.4" r="1.3" />
    <circle {...F} cx="19.4" cy="4" r=".9" />
    <circle {...F} cx="11.8" cy="3.6" r=".8" />
    <path {...AL} d="M10.8 7.4c1-2 3-2 3.6-4.2M16.6 13.2c2-.6 3.1.6 4.7-.4" />
  </>,
  // 👍 thumbs up
  'well-done': ({ F, D, A }) => <>
    <rect {...A} x="2.5" y="10" width="3.6" height="10.5" rx="1" />
    <path {...F} d="M7 10h3.4l2.3-5.2c.4-1 1.9-1 2.3.1.3.8.2 1.7-.1 2.5L14.3 10H19a2 2 0 0 1 2 2.3l-1.1 6.1a2.2 2.2 0 0 1-2.2 1.8H7z" />
    <path {...D} d="M15.6 13.4h4.6M15.3 16.6h4.2" />
  </>,
  // 🎧 headphones
  listen: ({ F, A }) => <>
    <path {...F} fill="none" strokeWidth={2} d="M4.5 15v-3a7.5 7.5 0 0 1 15 0v3" />
    <rect {...F} x="2.5" y="13.2" width="5" height="7.6" rx="2" />
    <rect {...F} x="16.5" y="13.2" width="5" height="7.6" rx="2" />
    <rect {...A} x="3.7" y="14.8" width="2.6" height="4.4" rx="1" />
    <rect {...A} x="17.7" y="14.8" width="2.6" height="4.4" rx="1" />
  </>,
  // 🗣 speaking head
  speak: ({ F, D, AL }) => <>
    <path {...F} d="M12.5 21v-3.4h-2.3a1.6 1.6 0 0 1-1.6-1.6v-2l-1.9-.7 1.7-2.6C8.4 6.3 10.9 3.5 14.4 3.5c3.6 0 6 2.6 6 6.3 0 2.6-1.3 4.5-3 5.6V21z" />
    <path {...D} d="M14.2 9.2h.01" strokeWidth={2} />
    <path {...AL} d="M4.6 9.4a4.4 4.4 0 0 0 0 5.4M2.2 7.4a7.4 7.4 0 0 0 0 9.4" />
  </>,
  // 📖 open book
  read: ({ F, D, A }) => <>
    <path {...F} d="M2.5 5.6c3.2-1.3 6.4-1.1 9.5 1.2v13.8c-3.1-2.2-6.3-2.4-9.5-1.2z" />
    <path {...F} d="M21.5 5.6c-3.2-1.3-6.4-1.1-9.5 1.2v13.8c3.1-2.2 6.3-2.4 9.5-1.2z" />
    <path {...D} d="M5 9.4h4.5M5 12.4h4.5M14.5 12.4h4.5M14.5 15.4h4.5" />
    <path {...A} d="M16.4 6.2v5.2l1.3-1 1.3 1V6.4z" />
  </>,
  // ✏️ pencil
  write: ({ F, D, A }) => <>
    <path {...F} d="m4 20 1.2-4.6L15.4 5.2l3.4 3.4L8.6 18.8z" />
    <path {...A} d="m15.4 5.2 1.5-1.5a1.6 1.6 0 0 1 2.3 0l1.1 1.1a1.6 1.6 0 0 1 0 2.3l-1.5 1.5z" />
    <path {...D} d="m13.6 7 3.4 3.4M5.2 15.4l3.4 3.4" />
  </>,
  // 🎬 clapperboard
  video: ({ F, D, A }) => <>
    <path {...F} d="M3.2 8.9 20.2 4.5l.7 2.7L3.9 11.6z" />
    <rect {...F} x="3" y="11" width="18" height="10" rx="1.5" />
    <path {...D} d="m8 7.6 1.2 2.4M12.5 6.4l1.2 2.4M17 5.3l1.2 2.4" />
    <path {...A} d="M10.5 13.4 15 16l-4.5 2.6z" />
  </>,
  // 🔊 speaker
  sound: ({ F, AL }) => <>
    <path {...F} d="M3 9h4l5.5-4.5v15L7 15H3z" />
    <path {...AL} d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
  </>,
  // ⏱ (small inline mark)
  clock: ({ F, D }) => <>
    <circle {...F} cx="12" cy="12" r="9" />
    <path {...D} d="M12 7v5l3 2" />
  </>,
  // 🔒 (small inline mark)
  lock: ({ F, D }) => <>
    <path {...F} fill="none" strokeWidth={1.8} d="M8 11V7a4 4 0 0 1 8 0v4" />
    <rect {...F} x="5" y="11" width="14" height="10" rx="2" />
    <path {...D} d="M12 15v2" />
  </>,
}

const GREEN = '#1E4D3B'
const CREAM = '#F6F1E7'
const FRESH = '#6BAE2E'

const KITS: Record<IconVariant, Kit> = {
  sello: {
    F: { fill: CREAM, stroke: CREAM, strokeWidth: 1.1 },
    D: { fill: 'none', stroke: GREEN, strokeWidth: 1.5 },
    A: { fill: FRESH, stroke: 'none' },
    AL: { fill: 'none', stroke: FRESH, strokeWidth: 1.8 },
    ink: GREEN,
  },
  linea: {
    F: { fill: 'none', stroke: GREEN, strokeWidth: 1.6 },
    D: { fill: 'none', stroke: GREEN, strokeWidth: 1.4 },
    A: { fill: FRESH, stroke: 'none' },
    AL: { fill: 'none', stroke: FRESH, strokeWidth: 1.6 },
    ink: GREEN,
  },
}

export function SomersetIcon({ name, variant = 'sello', size = 24, className, title }: {
  name: IconName; variant?: IconVariant; size?: number; className?: string; title?: string
}) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const, focusable: 'false' as const }
  const drawing = P[name](KITS[variant])
  if (variant === 'linea') {
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...a11y}>
        {drawing}
      </svg>
    )
  }
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...a11y}>
      <circle cx="12" cy="12" r="11.5" fill={GREEN} />
      <circle cx="12" cy="12" r="10.3" fill="none" stroke={CREAM} strokeWidth={0.45} opacity={0.6} />
      <g transform="translate(12 12) scale(.64) translate(-12 -12)">{drawing}</g>
    </svg>
  )
}
