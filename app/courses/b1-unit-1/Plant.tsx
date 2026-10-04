// The PET-readiness symbol: a plant in a flowerpot that grows, stage by stage, from a
// seed into an apple tree. The pot makes it read as "a plant" even at icon size, where a
// bare seed on soil looked like a hat. Stage 0 = seed … 5 = apple tree with apples.

const POT = '#C8673E'
const POT_DK = '#a9532f'
const SOIL = '#5b3a24'
const LEAF = '#6BAE2E'
const LEAF_DK = '#4d8520'
const LEAF_LT = '#86c24a'
const TRUNK = '#7a4b2a'
const APPLE = '#E1614C'

export const PLANT_NAMES = ['Seed', 'Sprout', 'Seedling', 'Young tree', 'Tree', 'Apple tree']

export default function Plant({ stage, size = 64 }: { stage: number; size?: number }) {
  const s = Math.max(0, Math.min(5, stage))
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={PLANT_NAMES[s]}>
      {s === 0 && (
        <g>
          <ellipse cx="50" cy="66" rx="10" ry="7" fill="#d8b07a" stroke={SOIL} strokeWidth="2" transform="rotate(-18 50 66)" />
          <path d="M44 66 q6 -4.5 12 0" stroke={SOIL} strokeWidth="2" fill="none" />
        </g>
      )}

      {s === 1 && (
        <g>
          <path d="M50 72 V54" stroke={LEAF_DK} strokeWidth="4" strokeLinecap="round" />
          <path d="M50 57 C40 55 34 47 37 41 C45 42 50 49 50 57 Z" fill={LEAF} />
          <path d="M50 55 C60 52 66 45 64 39 C56 40 50 46 50 55 Z" fill={LEAF_LT} />
        </g>
      )}

      {s === 2 && (
        <g>
          <path d="M50 72 V32" stroke={LEAF_DK} strokeWidth="4" strokeLinecap="round" />
          <path d="M50 62 C38 61 31 54 32 47 C42 47 49 54 50 62 Z" fill={LEAF} />
          <path d="M50 53 C62 51 69 44 68 37 C58 37 51 44 50 53 Z" fill={LEAF_LT} />
          <path d="M50 44 C40 42 35 35 37 29 C45 30 50 36 50 44 Z" fill={LEAF_DK} />
          <path d="M50 37 C57 34 61 28 60 23 C54 24 50 30 50 37 Z" fill={LEAF} />
        </g>
      )}

      {s === 3 && (
        <g>
          <path d="M50 72 V36" stroke={TRUNK} strokeWidth="5" strokeLinecap="round" />
          <path d="M50 52 L41 44" stroke={TRUNK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="28" r="16" fill={LEAF} />
          <circle cx="37" cy="37" r="10" fill={LEAF_DK} />
          <circle cx="62" cy="35" r="11" fill={LEAF_LT} />
        </g>
      )}

      {s >= 4 && (
        <g>
          <path d="M50 72 C48 62 48 50 50 38" stroke={TRUNK} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M49 52 L39 43 M51 49 L61 41" stroke={TRUNK} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="50" cy="24" r="20" fill={LEAF} />
          <circle cx="31" cy="35" r="14" fill={LEAF_DK} />
          <circle cx="69" cy="33" r="15" fill={LEAF} />
          <circle cx="41" cy="16" r="11" fill={LEAF_DK} opacity=".5" />
          <circle cx="62" cy="17" r="10" fill={LEAF_LT} />
        </g>
      )}

      {s === 5 && (
        <g>
          {[[37, 30], [57, 20], [66, 37], [45, 13], [28, 40], [52, 35]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4.6" fill={APPLE} />
              <path d={`M${x} ${y - 4.4} q1 -2.5 2.6 -3`} stroke={TRUNK} strokeWidth="1.2" fill="none" />
              <circle cx={x - 1.5} cy={y - 1.5} r="1.2" fill="#fff" opacity=".6" />
            </g>
          ))}
        </g>
      )}

      {/* the pot, drawn last so it covers the base of the stem */}
      <ellipse cx="50" cy="71" rx="20" ry="3.5" fill={SOIL} />
      <path d="M31 74 H69 L64 96 H36 Z" fill={POT} />
      <rect x="28" y="70" width="44" height="8" rx="2.5" fill={POT_DK} />
      <path d="M36 82 H64" stroke={POT_DK} strokeWidth="1.5" opacity=".5" />
    </svg>
  )
}
