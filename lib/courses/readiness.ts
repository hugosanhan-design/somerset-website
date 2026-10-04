// PET readiness as a journey, not a grade. Each of the course's units is worth an equal
// share, weighted by how well it went, so one good unit can never read as "94% ready".
// Students see a plant that grows from a seed into an apple tree: a symbol that needs
// no reading (Hugo, 4 Oct 2026, after text metaphors didn't land with Spanish learners).
// The percentage only appears from halfway, when it's encouraging rather than deflating.

export const COURSE_UNITS = 12
export const SHOW_PERCENT_FROM = 50

// Readiness % at which each plant stage begins: seed, sprout, seedling, young tree,
// tree, apple tree. A good Unit 1 (about 8%) reaches the sprout.
export const STAGE_FROM = [0, 5, 25, 50, 75, 90]

// One unit's contribution: how much of it is done × how well the done parts went.
export function unitValue(lessonScores: (number | null)[]): number {
  const done = lessonScores.filter((s): s is number => s !== null)
  if (!done.length) return 0
  const avg = done.reduce((a, b) => a + b, 0) / done.length
  return (done.length / lessonScores.length) * avg
}

export function petReadiness(unitValues: number[]): number {
  return Math.round(unitValues.reduce((a, b) => a + b, 0) / COURSE_UNITS)
}

export function plantStage(percent: number): { index: number; showPercent: boolean } {
  let index = 0
  STAGE_FROM.forEach((from, i) => { if (percent >= from) index = i })
  return { index, showPercent: percent >= SHOW_PERCENT_FROM }
}
