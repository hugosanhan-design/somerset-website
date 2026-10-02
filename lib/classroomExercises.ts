// Tap-to-answer exercises for the iPad "Student input" screen (added 29 Sep 2026).
// The exercise files live in data/ (one per group + month) and are bundled with the app
// by a static import, so the correct answers never sit in /public: they stay server-side,
// and children only ever receive the questions and options.
//
// To add a month: build data/<group>-<yyyy-mm>-exercises.json (same shape as
// flyers-2026-10-exercises.json), import it here and add it to SETS.
import flyersOct2026 from '@/data/flyers-2026-10-exercises.json'

export interface ExOption { key: string; text: string }
export interface ExItem { n: number; q: string; options: ExOption[]; correct: string }
export interface Exercise {
  id: string; page: number; date: string; title: string; instruction: string
  type: string; items: ExItem[]
}
export interface ExerciseSet { group: string; month: string; exercises: Exercise[] }

const SETS: ExerciseSet[] = [flyersOct2026 as unknown as ExerciseSet]

// A group's DB name ("Flyers I", ...) -> the slug used by the exercise files.
export function slugForGroupName(name: string): string | null {
  const n = (name || '').toLowerCase()
  if (n.includes('flyers') || n.includes('children')) return 'flyers'
  return null
}

export function setsForGroupName(name: string): ExerciseSet[] {
  const slug = slugForGroupName(name)
  return slug ? SETS.filter(s => s.group === slug) : []
}

export function allExercises(name: string): Exercise[] {
  return setsForGroupName(name).flatMap(s => s.exercises)
}

export function findExercise(name: string, exerciseId: string, date: string): Exercise | null {
  return allExercises(name).find(e => e.id === exerciseId && e.date === date) || null
}

// Student-facing wording rule (CLAUDE.md): the word "test" never appears in a
// student-facing screen.
export function childSafeTitle(t: string): string {
  return t.replace(/\bunit (\d+) test\b/gi, 'Unit $1 check').replace(/\btest\b/gi, 'check').replace(/\bTest\b/g, 'Check')
}

// What a child's iPad receives: no correct answers.
export function forChild(e: Exercise) {
  return {
    id: e.id, page: e.page, date: e.date, type: e.type,
    title: childSafeTitle(e.title),
    instruction: childSafeTitle(e.instruction),
    items: e.items.map(i => ({ n: i.n, q: childSafeTitle(i.q), options: i.options })),
  }
}
