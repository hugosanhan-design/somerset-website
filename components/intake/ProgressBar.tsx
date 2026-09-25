interface Props {
  phase: 1 | 2 | 3
  phaseLabel: string
  current: number
  total: number
}

export default function ProgressBar({ phase, phaseLabel, current, total }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div style={{ marginBottom: 28, fontFamily: 'Arial, Liberation Sans, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
        <span>Part {phase} of 3 — {phaseLabel}</span>
        <span>{current} / {total}</span>
      </div>
      <div style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 9999, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: '#6BAE2E',
            borderRadius: 9999,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
