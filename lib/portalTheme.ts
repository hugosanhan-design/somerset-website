// Design tokens for the "canonical teaching-deck" aesthetic (Hugo's 25 Sep 2026
// request, cloned from Somerset Worksheets/groups/2026-27/fce1/materials/
// Thu 24 Sep 2026/FCEI_Unit1_pp10-11_Answers_24Sep2026_VISTA.html — see
// feedback_teaching_deck_canonical_template.md). Light green/white throughout,
// no dark chrome anywhere: this replaced the earlier near-black-masthead look
// that matched the local Somerset Portal.app instead.
export const PORTAL = {
  green: '#6BAE2E',
  greenDeep: '#4D8120',
  dark: '#1A1A1A', // body ink, not a background — nothing in this theme uses dark chrome
  panel: '#F4F8EE', // the deck's .whybox background
  line: '#E2E2E2', // the deck's .mc-opt / footer border grey
  paper: '#FFFFFF',
  ink: '#1A1A1A',
  muted: '#666666',
  amber: '#E08A1E',
  amberBg: '#FDF3E4',
  amberLine: '#F0D9B8',
  red: '#A8321E',
  redBg: '#FBF0ED',
  // Cream + tan-bordered "premium" treatment, lifted from the public website
  // (somerset-website.vercel.app — body bg, .why-card bg/border, H2 ink) per
  // Hugo's 25 Sep 2026 request. pageBg replaces flat white; cardBg/cardLine
  // are for cards that should look like the website's why-cards rather than
  // the flatter teaching-deck tiles (worksheet-shelf rows keep PORTAL.paper).
  pageBg: '#F5F1E6',
  cardBg: '#FBF9F2',
  cardLine: '#D9D2BC',
  headingInk: '#17281B',
  serif: 'var(--font-fraunces), Georgia, serif', // set by next/font in app/layout.tsx
  shadow: 'none',
  shadowHover: 'none',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
  ready: { bg: '#DFF0CB', fg: PORTAL.greenDeep },
  part: { bg: PORTAL.amberBg, fg: PORTAL.amber },
  none: { bg: '#F0F0F0', fg: PORTAL.muted },
}
