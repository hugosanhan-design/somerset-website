// English for Sound Technicians · Ivan's digital course (private class, Tuesday).
// Three weekly modules. In class Ivan and Hugo only speak, so everything else lives here:
// words, grammar, reading, listening and writing, all about the job. Reading, listening
// and writing follow the shape of his exam (reading: 5 questions + true/false; listening:
// three speakers, four items each; writing: about 100 and 140-180 words). No speaking step.
// Pure data: no window access at module level.

import { W1 } from './soundTechW1'
import { W2 } from './soundTechW2'
import { W3 } from './soundTechW3'

export type Item =
  | { id: string; kind: 'choice'; q: string; options: string[]; answer: number }
  | { id: string; kind: 'gap'; before: string; after?: string; answers: string[] }
  | { id: string; kind: 'match'; q: string; answer: number }

export type Exercise = {
  id: string
  title: string
  how: string
  bank?: string[]
  options?: string[] // shared options for 'match' items
  gloss?: string[] // Spanish for each item (same order), shown with the "Mostrar español" switch
  items: Item[]
  es: string // Spanish explanation, shown after the exercise is finished
  text?: string // id of a reading text (in Activity.texts) shown above this exercise
  track?: string // id of a listening track (in Activity.tracks) shown above this exercise
}

export type FreeTask = { id: string; title: string; how: string; prompts: string[]; minWords: number; model?: string }

export type ReadText = { id: string; title: string; paragraphs: string[] }
export type Track = { id: string; title: string; intro: string; src: string; script: { who: string; text: string }[] }

export type Skill = 'words' | 'grammar' | 'reading' | 'listening' | 'writing'

export type Activity = {
  id: string
  week: 1 | 2 | 3
  skill: Skill
  no: number // 1..5 inside the week
  title: string
  time: string
  blurb: string
  texts?: ReadText[]
  tracks?: Track[]
  exercises: Exercise[]
  free?: FreeTask[]
}

export const COURSE_ID = 'sound-tech-english'

export const WEEKS = [
  { n: 1 as const, title: 'Kit and signal path', aim: 'From the microphone to the speakers: the equipment, and how to give clear instructions.' },
  { n: 2 as const, title: 'When things go wrong', aim: 'Name a problem, find the cause and fix it, in English.' },
  { n: 3 as const, title: 'Working with people', aim: 'Polite requests, schedules and safety rules: the language of a real crew.' },
]

export const ACTIVITIES: Activity[] = [...W1, ...W2, ...W3]
