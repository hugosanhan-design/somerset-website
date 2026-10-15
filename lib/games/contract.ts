// The game contract every portal mini-game meets. Spec: Somerset App/games-portal-task1-proposal.md
// Content lives in data/games/<id>.json (one file per game, editable without code);
// scripts/games-validate.mjs checks every file against these rules before it ships.
import { ERROR_TAGS } from '@/data/errorTags'

// The 10 error tags, from the one list the writing correction already uses.
export type Tag = 'tense' | 'agreement' | 'article' | 'preposition' | 'word-order' | 'spelling' | 'punctuation' | 'vocabulary' | 'register' | 'other'
export const TAGS = ERROR_TAGS.map(t => t.key) as Tag[]

export type Level = 'A2' | 'B1' | 'B2' | 'C1'
export const LEVELS: Level[] = ['A2', 'B1', 'B2', 'C1']

// choice = one sentence, pick the right option (website SPRINT + REPAIR games)
// pairs  = a word and its partner (website MATCH games). Played as a choice: the word is the
//          question, its partner plus 3 partners from other pairs are the options.
export type Engine = 'choice' | 'pairs'

export type ChoiceItem = { id: string; q: string; options: string[]; answer: number; why?: string; explain?: string }
export type PairItem = { id: string; left: string; right: string; why?: string }

export type GameDef = {
  id: string
  title: string
  tags: Tag[]
  engine: Engine
  intro: string
  source?: string                       // website file it was imported from, if any
  explain?: string                      // default Explícamelo card (data/explainers.json) for items without their own
  draft?: boolean                       // a level has fewer than 10 items: kept out of the registry
  items: Partial<Record<Level, (ChoiceItem | PairItem)[]>>
}

// A session is the "Got 3 minutes?" promise: 12 items, 10 if a bank is short.
export const SESSION_ITEMS = 12
export const SESSION_MIN = 10

// What a game reports when it finishes. No mark is shown to the student.
export type GameResult = {
  gameId: string
  tags: Tag[]
  level: Level
  itemsTotal: number
  itemsCorrect: number                  // right first time
  wrong: { itemId: string; answered: string }[]
}
