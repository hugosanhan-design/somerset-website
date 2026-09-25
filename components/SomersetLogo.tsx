interface SomersetLogoProps {
  variant?: 'colour' | 'white'
}

// Canonical Somerset wordmark (see reference_somerset_logo.md): "Somerset" in
// bold green, "LANGUAGE / CENTRE" in small dark tracking caps. Arial only —
// never load a webfont for this, to avoid the metric-mismatch overlap bug
// that hit the old inline-SVG version.
export default function SomersetLogo({ variant = 'colour' }: SomersetLogoProps) {
  const isWhite = variant === 'white'
  const wordmarkColor = isWhite ? '#ffffff' : '#6BAE2E'
  const subtitleColor = isWhite ? 'rgba(255,255,255,0.85)' : '#1A1A1A'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: 700,
        fontSize: 28,
        color: wordmarkColor,
        letterSpacing: '-0.5px',
        lineHeight: 1,
      }}>Somerset</span>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
        <span style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: 600,
          fontSize: 9,
          color: subtitleColor,
          letterSpacing: '2px',
          lineHeight: 1,
          textTransform: 'uppercase',
        }}>Language</span>
        <span style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: 600,
          fontSize: 9,
          color: subtitleColor,
          letterSpacing: '2px',
          lineHeight: 1,
          textTransform: 'uppercase',
        }}>Centre</span>
      </div>
    </div>
  )
}
