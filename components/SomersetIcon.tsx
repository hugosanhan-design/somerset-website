import type { ReactNode, SVGAttributes } from 'react'

// Somerset icon set — shared by every course. Spec: Somerset Project/Somerset Icons/icon-inventory.md
// Each icon keeps the look and colours of the emoji it replaces (🪪 💳 🏠 📅 🏛️ 🧾 💻 🔐 📋 🔢 💰 🏦 🎉 👍 💪 💡 🔊 🗣 🎬 …)
// Somerset signature, constant across the set: racing-green outlines, a cream seal disc with a racing-green ring,
// and fresh green as the brand accent (tick tile, € sign, the Valencian orange's leaf).
// variant "sello": full colour on the seal (Spanish for Expats, young-adults hybrid)
// variant "linea": racing-green outline of the same drawing (PET)

export type IconName =
  | 'visa' | 'supporting' | 'nie' | 'padron' | 'eu-cert' | 'tie' | 'nuss' | 'sip' | 'digital' | 'bank'
  | 'calendar' | 'government' | 'documents' | 'device' | 'register' | 'digits' | 'money' | 'valencia'
  | 'work' | 'nomad' | 'study' | 'retire' | 'family'
  | 'correct' | 'wrong' | 'almost' | 'tip' | 'celebrate' | 'well-done'
  | 'listen' | 'speak' | 'read' | 'write' | 'video' | 'sound' | 'clock' | 'lock'
  | 'exam' | 'resume' | 'test' | 'game' | 'books' | 'mic' | 'puzzle' | 'stopwatch'

export type IconVariant = 'sello' | 'linea'

type Paint = SVGAttributes<SVGElement>
// f = filled shape with outline · l = coloured line · d = small filled detail without outline
type Kit = { f: (c: string) => Paint; l: (c: string, w?: number) => Paint; d: (c: string) => Paint; colour: boolean }

const GREEN = '#1E4D3B'   // Somerset racing green — outlines, seal ring
const CREAM = '#F6F1E7'   // Somerset cream — seal disc
const FRESH = '#6BAE2E'   // Somerset fresh green — brand accent
const C = {
  white: '#FFFFFF', paper: '#FBFAF6', stone: '#D5D9DE', stoneDk: '#AEB5BD', grey: '#9AA4AE', dark: '#33393F',
  red: '#E2453C', brown: '#9A6236', wood: '#C98A52', tan: '#D9A55B', yellow: '#F7C948', gold: '#F2B33D',
  orange: '#F5A02A', blue: '#3B7DD8', sky: '#7CC0EA', navy: '#25467A', euBlue: '#1F4FA8', euGold: '#FFCC00',
  pink: '#F48FB1', skin: '#F2C49B', beige: '#F3D9A8', certGreen: '#9BD08A',
}

const laptop = ({ f, d }: Kit) => <>
  <rect {...f(C.grey)} x="4" y="4.5" width="16" height="11" rx="1.5" />
  <rect {...d(C.sky)} x="5.8" y="6.3" width="12.4" height="7.4" rx=".6" />
  <rect {...d(C.white)} x="7" y="7.5" width="5" height="2.2" rx=".6" />
  <path {...f(C.stone)} d="M1.5 17.5h21l-1.5 2.5H3z" />
</>

const temple = ({ f, l, d }: Kit, bank: boolean) => <>
  <path {...f(C.stone)} d="M2.5 8.5 12 3l9.5 5.5z" />
  <rect {...f(C.stone)} x="3.5" y="9.3" width="17" height="1.8" rx=".4" />
  {(bank ? [4.6, 17.4] : [5, 9, 13, 17]).map(x => <rect key={x} {...f(C.white)} x={x} y="12" width="2" height="6" rx=".4" />)}
  <rect {...f(C.stoneDk)} x="2.5" y="18.6" width="19" height="2.4" rx=".5" />
  {bank ? <>
    <circle {...f(C.gold)} cx="12" cy="14.6" r="4.3" />
    <path {...l(GREEN, 1.05)} d="M14.2 12.6a2.7 2.7 0 1 0 0 4M9.4 14h3.8M9.4 15.3h3.8" />
  </> : <circle {...d(FRESH)} cx="12" cy="6.8" r="1" />}
</>

const P: Record<IconName, (k: Kit) => ReactNode> = {
  // 🛂 passport
  visa: ({ f, l, d }) => <>
    <rect {...f(C.navy)} x="5" y="2.5" width="14" height="19" rx="2" />
    <circle {...l(C.gold, 1.3)} cx="12" cy="10.5" r="3.6" />
    <ellipse {...l(C.gold, 1.1)} cx="12" cy="10.5" rx="1.5" ry="3.6" />
    <path {...l(C.gold, 1.1)} d="M8.4 10.5h7.2" />
    <rect {...d(C.gold)} x="9" y="16.4" width="6" height="1.5" rx=".75" />
  </>,
  // 📑 stamped document (apostille)
  supporting: ({ f, l }) => <>
    <rect {...f(C.paper)} x="3.5" y="2.5" width="13.5" height="17.5" rx="1.5" />
    <path {...l(C.grey, 1.2)} d="M6.5 6.5h7.5M6.5 9.5h7.5M6.5 12.5h4.5" />
    <path {...f(C.red)} d="M14.2 18.8 13.2 22l2.3-1.1 2.3 1.1-1-3.2z" />
    <circle {...f(C.red)} cx="16.5" cy="16.2" r="3.6" />
    <circle {...l(C.gold, 1)} cx="16.5" cy="16.2" r="1.8" />
  </>,
  // 🪪 identification card
  nie: ({ f, l, d }) => <>
    <rect {...f(C.sky)} x="2" y="5" width="20" height="14" rx="2.5" />
    <rect {...f(C.white)} x="4.6" y="8" width="6" height="7.4" rx="1" />
    <circle {...d(C.orange)} cx="7.6" cy="10.5" r="1.4" />
    <path {...d(C.orange)} d="M5.4 14.8c.4-1.6 1.2-2.2 2.2-2.2s1.8.6 2.2 2.2z" />
    <path {...l(C.white, 1.4)} d="M13 9.5h6M13 12.5h6M13 15.5h3.8" />
  </>,
  // 🏠 house
  padron: ({ f }) => <>
    <rect {...f(C.brown)} x="15.8" y="4.5" width="2.6" height="5" rx=".4" />
    <path {...f(C.beige)} d="M4.5 10.2h15V20a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z" />
    <path {...f(C.red)} d="M2 11.5 12 3.2l10 8.3-1.4 1.4L12 5.9l-8.6 7z" />
    <rect {...f(C.brown)} x="10.2" y="14.2" width="3.6" height="6.8" rx=".5" />
    <rect {...f(C.sky)} x="5.8" y="12.6" width="2.8" height="2.8" rx=".4" />
    <rect {...f(C.sky)} x="15.4" y="12.6" width="2.8" height="2.8" rx=".4" />
  </>,
  // 🟩 EU registration certificate
  'eu-cert': ({ f, d }) => <>
    <rect {...f(C.certGreen)} x="2.5" y="4" width="19" height="15" rx="2" />
    <circle {...f(C.euBlue)} cx="12" cy="10.6" r="4.6" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const r = (a * Math.PI) / 180
      return <circle key={a} {...d(C.euGold)} cx={(12 + 3.1 * Math.cos(r)).toFixed(2)} cy={(10.6 + 3.1 * Math.sin(r)).toFixed(2)} r=".6" />
    })}
    <rect {...d(C.white)} x="8.5" y="16" width="7" height="1.4" rx=".7" />
  </>,
  // 💳 card
  tie: ({ f, d }) => <>
    <rect {...f(C.blue)} x="2" y="5" width="20" height="14" rx="2.5" />
    <rect {...d(C.dark)} x="2.6" y="8.3" width="18.8" height="2.6" />
    <rect {...d(C.white)} x="5" y="14.6" width="5.5" height="1.3" rx=".6" />
    <rect {...f(C.gold)} x="15" y="13" width="4" height="3.2" rx=".7" />
  </>,
  // 🛡 social security
  nuss: ({ f, l }) => <>
    <path {...f(C.blue)} d="M12 2.5 19.5 5.6v5.6c0 5-3.2 8.3-7.5 10.3-4.3-2-7.5-5.3-7.5-10.3V5.6z" />
    <path {...l(C.white, 2)} d="m8.6 12 2.4 2.4 4.6-4.6" />
  </>,
  // 🏥 hospital
  sip: ({ f, l }) => <>
    <rect {...f(C.white)} x="7.5" y="3" width="9" height="5.5" rx=".6" />
    <rect {...f('#F6E4E4')} x="3" y="7.8" width="18" height="13.2" rx="1" />
    <path {...l(C.red, 1.8)} d="M12 3.9v3.6M10.2 5.7h3.6" />
    <path {...l(C.sky, 1.6)} d="M6 11.5h2M16 11.5h2M6 15h2M16 15h2" />
    <rect {...f(C.sky)} x="10.5" y="17.2" width="3" height="3.8" rx=".3" />
  </>,
  // 🔐 lock with key
  digital: ({ f, l, d }) => <>
    <path {...l(C.grey, 2)} d="M6 11V8a3.5 3.5 0 0 1 7 0v3" />
    <rect {...f(C.gold)} x="3.5" y="11" width="12" height="10" rx="2" />
    <circle {...d(C.dark)} cx="9.5" cy="15.2" r="1.1" />
    <path {...l(C.dark, 1.4)} d="M9.5 16.3v2" />
    <circle {...f(C.gold)} cx="18.6" cy="8.6" r="2.4" />
    <path {...l(C.gold, 1.8)} d="M18.6 11v8M18.6 15h1.8M18.6 17.6h1.4" />
  </>,
  // 🏦 bank
  bank: k => temple(k, true),
  // 📅 calendar
  calendar: ({ f, l, d }) => <>
    <rect {...f(C.white)} x="3" y="5" width="18" height="16" rx="2" />
    <path {...f(C.red)} d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3z" />
    <path {...l(C.grey, 1.8)} d="M8 2.8v4M16 2.8v4" />
    {[[7.5, 14], [12, 14], [16.5, 14], [7.5, 17.5], [12, 17.5]].map(([x, y]) => <circle key={`${x}${y}`} {...d(C.dark)} cx={x} cy={y} r=".9" />)}
    <circle {...d(FRESH)} cx="16.5" cy="17.5" r=".9" />
  </>,
  // 🏛️ classical building
  government: k => temple(k, false),
  // 🧾 receipt
  documents: ({ f, l }) => <>
    <path {...f(C.white)} d="M5 3h14v18l-2.3-1.5-2.4 1.5-2.3-1.5-2.3 1.5-2.4-1.5L5 21z" />
    <path {...l(C.grey, 1.3)} d="M8 7.5h8M8 11h8M8 14.5h5" />
    <path {...l(FRESH, 1.5)} d="M13.2 16.7h2.8" />
  </>,
  // 💻 laptop
  device: laptop,
  // 📋 clipboard
  register: ({ f, l }) => <>
    <rect {...f(C.wood)} x="4.5" y="4" width="15" height="18" rx="2" />
    <rect {...f(C.white)} x="6.3" y="6.6" width="11.4" height="13.6" rx=".8" />
    <rect {...f(C.grey)} x="8.5" y="2.4" width="7" height="3.6" rx="1" />
    <path {...l(FRESH, 1.4)} d="m7.9 10.6 1 1 1.8-1.9M7.9 15.2l1 1 1.8-1.9" />
    <path {...l(C.grey, 1.3)} d="M12.8 10.6h3.6M12.8 15.2h3.6" />
  </>,
  // 🔢 1234
  digits: ({ f, colour }) => <>
    {[[2.5, 2.5], [13, 2.5], [2.5, 13], [13, 13]].map(([x, y]) => <rect key={`${x}${y}`} {...f(C.blue)} x={x} y={y} width="8.5" height="8.5" rx="2" />)}
    {(['1', '2', '3', '4'] as const).map((n, i) => (
      <text key={n} x={i % 2 ? 17.25 : 6.75} y={i < 2 ? 9.1 : 19.6} textAnchor="middle" fontSize="6.6" fontWeight={700}
        fontFamily="Arial, Helvetica, sans-serif" fill={colour ? C.white : GREEN} stroke="none">{n}</text>
    ))}
  </>,
  // 💰 money bag
  money: ({ f, l }) => <>
    <path {...f(C.tan)} d="M9 3h6l-1.5 3c4 1.5 6.5 5 6.5 9 0 4-3 6-8 6s-8-2-8-6c0-4 2.5-7.5 6.5-9z" />
    <rect {...f(C.brown)} x="9" y="5.3" width="6" height="1.8" rx=".9" />
    <path {...l(FRESH, 1.6)} d="M14.6 11.6a3 3 0 1 0 0 4.8M8.8 13.2h4.5M8.8 14.9h4.5" />
  </>,
  // 🍊 Valencian orange — the Somerset signature
  valencia: ({ f, l, d }) => <>
    <path {...l(C.brown, 1.6)} d="M12 6.2c0-1.6.8-2.7 2-3.2" />
    <circle {...f(C.orange)} cx="12" cy="13.5" r="7.5" />
    <path {...l('#FFD08A', 1.3)} d="M8.4 11a4 4 0 0 1 2.4-2.1" />
    <path {...f(FRESH)} d="M13.2 5.6c1.8-1.7 4.5-1.8 6.1-.6-1.3 2-4 2.4-6.1.6z" />
    <circle {...d('#E08A1E')} cx="15" cy="16" r=".5" />
  </>,
  // 💼 briefcase
  work: ({ f, l }) => <>
    <path {...l(C.dark, 1.8)} d="M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7" />
    <rect {...f(C.brown)} x="2.5" y="7" width="19" height="13" rx="2" />
    <path {...l('#7A4A26', 1.2)} d="M2.8 12.6h18.4" />
    <rect {...f(C.gold)} x="10.5" y="11.3" width="3" height="2.7" rx=".6" />
  </>,
  // 💻 remote work
  nomad: laptop,
  // 🎓 graduation cap
  study: ({ f, l }) => <>
    <path {...f(C.dark)} d="M6 11.3v4.2c2 2.3 10 2.3 12 0v-4.2L12 14z" />
    <path {...f(C.dark)} d="M1.5 9 12 4l10.5 5L12 14z" />
    <path {...l(C.gold, 1.4)} d="M20 9.6v4.6" />
    <circle {...f(C.gold)} cx="20" cy="15.3" r="1.1" />
  </>,
  // 🌅 sunrise over the sea
  retire: ({ f, l }) => <>
    <path {...f(C.orange)} d="M6.5 15a5.5 5.5 0 0 1 11 0z" />
    <path {...l(C.gold, 1.6)} d="M12 5v2M5.3 8l1.4 1.4M18.7 8l-1.4 1.4M2.8 15h2M19.2 15h2" />
    <path {...l(C.blue, 1.6)} d="M3 18.3q2.2-1.2 4.5 0t4.5 0 4.5 0 4.5 0M6 21q1.6-.9 3.2 0t3.2 0 3.2 0" />
  </>,
  // 👨‍👩‍👧 family
  family: ({ f }) => <>
    <path {...f(C.blue)} d="M2.3 20v-4a4.5 4.5 0 0 1 9 0v4z" />
    <path {...f(C.pink)} d="M12.7 20v-4a4.5 4.5 0 0 1 9 0v4z" />
    <circle {...f(C.skin)} cx="6.8" cy="6.5" r="2.6" />
    <circle {...f(C.skin)} cx="17.2" cy="6.5" r="2.6" />
    <path {...f(C.gold)} d="M9 21.5v-2.4a3 3 0 0 1 6 0v2.4z" />
    <circle {...f(C.skin)} cx="12" cy="12" r="2" />
  </>,
  // ✅ tick — Somerset fresh green tile
  correct: ({ f, l, colour }) => <>
    {colour && <rect {...f(FRESH)} x="2.5" y="2.5" width="19" height="19" rx="4" />}
    <path {...l(colour ? C.white : GREEN, colour ? 2.8 : 2.4)} d="M6.5 12.5 10.2 16.2 17.5 8" />
  </>,
  // ❌ cross
  wrong: ({ l }) => <path {...l(C.red, 3)} d="M6 6l12 12M18 6 6 18" />,
  // 💪 keep going
  almost: ({ f, l }) => <>
    <path {...f(C.yellow)} d="M2 13.6C5 12.6 7 11.2 9.4 11.3c1.6-2.2 4.6-1.8 5.1.7l.3-2L14 6.6c-.5-2 1-3.6 3-3.4l2 .4c1.5.4 2 1.9 1.4 3.2l-.8 1.8 1.4 8.9c.3 2-1 3.5-3 3.5H2z" />
    <path {...l('#D9A520', 1.3)} d="M5.5 17c2.6-1.3 5.6-1.4 8.2-.3M15.5 5.6h3" />
  </>,
  // 💡 light bulb
  tip: ({ f, l }) => <>
    <path {...f(C.yellow)} d="M12 2.8a6.2 6.2 0 0 0-3.7 11.2c.7.6 1.1 1.4 1.1 2.3h5.2c0-.9.4-1.7 1.1-2.3A6.2 6.2 0 0 0 12 2.8z" />
    <rect {...f(C.grey)} x="9.4" y="17.2" width="5.2" height="1.6" rx=".5" />
    <rect {...f(C.grey)} x="10.2" y="19.6" width="3.6" height="1.6" rx=".6" />
    <path {...l(C.orange, 1.3)} d="m10.4 12.6 1.6-2.2 1.6 2.2" />
    <path {...l(C.white, 1.3)} d="M9.4 7.6a3 3 0 0 1 2-2" />
  </>,
  // 🎉 party popper
  celebrate: ({ f, l, d }) => <>
    <path {...f(C.gold)} d="M3 21 8 9l7 7z" />
    <path {...l(C.red, 1.5)} d="m6.3 13.2 4.4 4.4M7.6 10.4l5.9 5.9" />
    <circle {...d(C.blue)} cx="15.2" cy="5" r="1.3" />
    <circle {...d(C.red)} cx="20" cy="10.4" r="1.3" />
    <circle {...d(FRESH)} cx="19.4" cy="4" r="1" />
    <circle {...d(C.pink)} cx="11.8" cy="3.6" r=".9" />
    <path {...l(FRESH, 1.6)} d="M10.8 7.4c1-2 3-2 3.6-4.2" />
    <path {...l(C.blue, 1.6)} d="M16.6 13.2c2-.6 3.1.6 4.7-.4" />
  </>,
  // 👍 thumbs up
  'well-done': ({ f, l }) => <>
    <rect {...f(FRESH)} x="2.5" y="10" width="3.6" height="10.5" rx="1" />
    <path {...f(C.yellow)} d="M7 10h3.4l2.3-5.2c.4-1 1.9-1 2.3.1.3.8.2 1.7-.1 2.5L14.3 10H19a2 2 0 0 1 2 2.3l-1.1 6.1a2.2 2.2 0 0 1-2.2 1.8H7z" />
    <path {...l('#D9A520', 1.2)} d="M15.6 13.4h4.6M15.3 16.6h4.2" />
  </>,
  // 🎧 headphones
  listen: ({ f, l }) => <>
    <path {...l(C.dark, 2.2)} d="M4.5 15v-3a7.5 7.5 0 0 1 15 0v3" />
    <rect {...f(C.dark)} x="2.5" y="13.2" width="5" height="7.6" rx="2" />
    <rect {...f(C.dark)} x="16.5" y="13.2" width="5" height="7.6" rx="2" />
    <rect {...f(C.red)} x="5" y="14.6" width="2.4" height="4.8" rx="1" />
    <rect {...f(C.red)} x="16.6" y="14.6" width="2.4" height="4.8" rx="1" />
  </>,
  // 🗣 speaking head
  speak: ({ f, l, d }) => <>
    <path {...f('#5B6B7C')} d="M12.5 21v-3.4h-2.3a1.6 1.6 0 0 1-1.6-1.6v-2l-1.9-.7 1.7-2.6C8.4 6.3 10.9 3.5 14.4 3.5c3.6 0 6 2.6 6 6.3 0 2.6-1.3 4.5-3 5.6V21z" />
    <circle {...d(C.white)} cx="14.2" cy="9.2" r=".9" />
    <path {...l(C.blue, 1.7)} d="M4.6 9.4a4.4 4.4 0 0 0 0 5.4M2.2 7.4a7.4 7.4 0 0 0 0 9.4" />
  </>,
  // 📖 open book
  read: ({ f, l }) => <>
    <path {...f(C.white)} d="M2.5 5.6c3.2-1.3 6.4-1.1 9.5 1.2v13.8c-3.1-2.2-6.3-2.4-9.5-1.2z" />
    <path {...f(C.white)} d="M21.5 5.6c-3.2-1.3-6.4-1.1-9.5 1.2v13.8c3.1-2.2 6.3-2.4 9.5-1.2z" />
    <path {...l(C.grey, 1.2)} d="M5 9.4h4.5M5 12.4h4.5M14.5 12.4h4.5M14.5 15.4h4.5" />
    <path {...f(C.red)} d="M16.4 6.2v5.2l1.3-1 1.3 1V6.4z" />
  </>,
  // ✏️ pencil
  write: ({ f, l }) => <>
    <path {...f(C.yellow)} d="m5.2 15.4 10.2-10.2 3.4 3.4L8.6 18.8z" />
    <path {...f('#E8C39E')} d="M4 20l1.2-4.6 3.4 3.4z" />
    <path {...f(C.pink)} d="m15.4 5.2 1.5-1.5a1.6 1.6 0 0 1 2.3 0l1.1 1.1a1.6 1.6 0 0 1 0 2.3l-1.5 1.5z" />
    <path {...l(C.grey, 1.2)} d="m13.6 7 3.4 3.4" />
  </>,
  // 🎬 clapperboard
  video: ({ f, l }) => <>
    <path {...f(C.dark)} d="M3.2 8.9 20.2 4.5l.7 2.7L3.9 11.6z" />
    <rect {...f(C.dark)} x="3" y="11" width="18" height="10" rx="1.5" />
    <path {...l(C.white, 1.5)} d="m8 7.6 1.2 2.4M12.5 6.4l1.2 2.4M17 5.3l1.2 2.4" />
    <path {...f(C.white)} d="M10.5 13.4 15 16l-4.5 2.6z" />
  </>,
  // 🔊 speaker
  sound: ({ f, l }) => <>
    <path {...f(C.grey)} d="M3 9h4l5.5-4.5v15L7 15H3z" />
    <path {...l(C.blue, 1.8)} d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
  </>,
  // 🖥️ desktop computer (mock exam)
  exam: ({ f, d }) => <>
    <rect {...f(C.grey)} x="2.5" y="3.5" width="19" height="12.5" rx="1.5" />
    <rect {...d(C.sky)} x="4.2" y="5.2" width="15.6" height="9.1" rx=".6" />
    <rect {...d(C.white)} x="6" y="7" width="7" height="1.3" rx=".6" />
    <rect {...d(C.white)} x="6" y="9.5" width="10" height="1.3" rx=".6" />
    <rect {...d(FRESH)} x="6" y="12" width="4.5" height="1.3" rx=".6" />
    <path {...f(C.grey)} d="M10 16h4l.8 3H9.2z" />
    <rect {...f(C.stone)} x="7" y="19" width="10" height="1.9" rx=".9" />
  </>,
  // ↩️ continue / resume
  resume: ({ f, l }) => <>
    <rect {...f(C.blue)} x="2.5" y="2.5" width="19" height="19" rx="4" />
    <path {...l(C.white, 2.4)} d="M7.8 9.2h6.7a3.8 3.8 0 0 1 0 7.6h-3.3M10.6 6.4 7.8 9.2l2.8 2.8" />
  </>,
  // 📝 memo with pencil (placement test)
  test: ({ f, l }) => <>
    <rect {...f(C.white)} x="3.5" y="3" width="13" height="17.5" rx="1.5" />
    <path {...l(C.grey, 1.3)} d="M6.5 7.5h7M6.5 10.5h7M6.5 13.5h4.5" />
    <path {...f(C.yellow)} d="m11.6 18.2 7.4-7.4 2.4 2.4-7.4 7.4z" />
    <path {...f('#E8C39E')} d="m11.6 18.2-.9 3.3 3.3-.9z" />
    <path {...f(C.pink)} d="m19 10.8 1-1a1.3 1.3 0 0 1 1.8 0l.6.6a1.3 1.3 0 0 1 0 1.8l-1 1z" />
  </>,
  // 🎮 game controller
  game: ({ f, l, d }) => <>
    <path {...f(C.dark)} d="M7 7.5h10a5 5 0 0 1 4.8 6.4l-1.3 4.4a2.3 2.3 0 0 1-3.9.9L14.4 17H9.6l-2.2 2.2a2.3 2.3 0 0 1-3.9-.9l-1.3-4.4A5 5 0 0 1 7 7.5z" />
    <path {...l(C.white, 1.7)} d="M7.6 10.6v4M5.6 12.6h4" />
    <circle {...d(C.red)} cx="16.2" cy="11.4" r="1.1" />
    <circle {...d(FRESH)} cx="18.4" cy="13.6" r="1.1" />
    <circle {...d(C.gold)} cx="14" cy="13.6" r="1.1" />
  </>,
  // 📚 stack of books (online course)
  books: ({ f, l }) => <>
    <rect {...f(C.red)} x="2.5" y="16" width="19" height="4.5" rx="1" />
    <rect {...f(C.blue)} x="4" y="11.3" width="16.5" height="4.7" rx="1" />
    <rect {...f(FRESH)} x="3.2" y="6.6" width="15.5" height="4.7" rx="1" />
    <rect {...f(C.gold)} x="6" y="2.6" width="11" height="4" rx="1" />
    <path {...l(C.white, 1.3)} d="M5 18.2h3.5M6.5 13.6h3.5M5.7 8.9h3.5" />
  </>,
  // 🎙️ studio microphone (speaking plan)
  mic: ({ f, l }) => <>
    <rect {...f(C.grey)} x="8.5" y="2.5" width="7" height="11.5" rx="3.5" />
    <path {...l(C.dark, 1.2)} d="M9 6h6M9 8.5h6M9 11h6" />
    <path {...l(C.dark, 1.7)} d="M6 10.5v1a6 6 0 0 0 12 0v-1M12 17.5V20" />
    <rect {...f(C.dark)} x="8" y="20" width="8" height="1.8" rx=".9" />
  </>,
  // 🧩 puzzle piece (word formation)
  puzzle: ({ f, l }) => <>
    <path {...f(FRESH)} d="M4 8h4.2a2.3 2.3 0 1 1 4.6 0H17v4.2a2.3 2.3 0 1 1 0 4.6V21H4z" />
    <path {...l('#4D8520', 1.2)} d="M6.5 11.5c0 2 1 3.4 2.5 4" />
  </>,
  // ⏱️ stopwatch (warm-up)
  stopwatch: ({ f, l }) => <>
    <rect {...f(C.grey)} x="10.5" y="2.4" width="3" height="2.4" rx=".6" />
    <rect {...f(C.grey)} x="17.2" y="5.4" width="2.6" height="1.9" rx=".5" transform="rotate(45 18.5 6.35)" />
    <circle {...f(C.stone)} cx="12" cy="13.6" r="7.8" />
    <circle {...f(C.white)} cx="12" cy="13.6" r="6.1" />
    <path {...l(C.red, 1.7)} d="M12 13.6V9.2" />
    <path {...l(C.dark, 1.4)} d="m12 13.6 3 1.8" />
  </>,
  // ⏱ (small inline mark)
  clock: ({ f, l }) => <>
    <circle {...f(C.white)} cx="12" cy="12" r="9" />
    <path {...l(C.red, 1.6)} d="M12 7v5l3 2" />
  </>,
  // 🔒 (small inline mark)
  lock: ({ f, l }) => <>
    <path {...l(C.grey, 1.8)} d="M8 11V7a4 4 0 0 1 8 0v4" />
    <rect {...f(C.gold)} x="5" y="11" width="14" height="10" rx="2" />
  </>,
}

const KITS: Record<IconVariant, Kit> = {
  sello: {
    f: c => ({ fill: c, stroke: GREEN, strokeWidth: 1 }),
    l: (c, w = 1.5) => ({ fill: 'none', stroke: c, strokeWidth: w }),
    d: c => ({ fill: c, stroke: 'none' }),
    colour: true,
  },
  linea: {
    f: () => ({ fill: 'none', stroke: GREEN, strokeWidth: 1.5 }),
    l: (_c, w = 1.5) => ({ fill: 'none', stroke: GREEN, strokeWidth: Math.min(w, 1.6) }),
    d: () => ({ fill: GREEN, stroke: 'none' }),
    colour: false,
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
      <circle cx="12" cy="12" r="11.3" fill={CREAM} stroke={GREEN} strokeWidth={1.1} />
      <circle cx="12" cy="12" r="10.1" fill="none" stroke={FRESH} strokeWidth={0.4} opacity={0.8} />
      <g transform="translate(12 12) scale(.68) translate(-12 -12)">{drawing}</g>
    </svg>
  )
}
