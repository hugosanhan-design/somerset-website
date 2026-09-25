// Design tokens ported 1:1 from the local Somerset Portal (Somerset Worksheets/
// _apps/somerset-portal/index.html's :root custom properties) so the web app's
// calendar/day/lesson screens read as the same product, not a reskin — Hugo's
// request, 25 Sep 2026. Keep in sync if the local portal's palette ever changes.
export const PORTAL = {
  green: '#6BAE2E',
  greenDeep: '#3F6D18',
  dark: '#1A1A1A',
  panel: '#F2F7EC',
  line: '#D9E4CE',
  paper: '#FFFFFF',
  ink: '#1A1A1A',
  muted: '#5C6657',
  amber: '#B07908',
  amberBg: '#FDF6E3',
  amberLine: '#EBD9A8',
  red: '#A8321E',
  redBg: '#FBF0ED',
  pageBg: '#EFF2EB',
  shadow: '0 1px 2px rgba(26,26,26,.06), 0 4px 16px rgba(26,26,26,.06)',
  shadowHover: '0 2px 4px rgba(26,26,26,.08), 0 8px 24px rgba(26,26,26,.1)',
  font: 'Arial, "Liberation Sans", "Helvetica Neue", Helvetica, sans-serif',
}

export type Readiness = 'ready' | 'part' | 'none'

export function readinessFromStatus(status: string): Readiness {
  return status === 'ready' ? 'ready' : 'none'
}

export const READINESS_LABEL: Record<Readiness, string> = {
  ready: 'Ready',
  part: 'Partly ready',
  none: 'Not ready',
}

export const READINESS_CHIP: Record<Readiness, { bg: string; fg: string }> = {
  ready: { bg: '#E8F3DA', fg: PORTAL.greenDeep },
  part: { bg: PORTAL.amberBg, fg: PORTAL.amber },
  none: { bg: '#F0F0EE', fg: PORTAL.muted },
}
