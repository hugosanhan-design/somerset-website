// Every portal mini-game that is ready, by id. The list comes from data/games/index.ts,
// which scripts/games-import.mjs regenerates (drafts are left out). To add a game by hand:
// drop its JSON in data/games/, re-run the import script, run scripts/games-validate.mjs.
import type { GameDef } from './contract'
import { DRAFT_FILES, GAME_FILES } from '@/data/games'

const ALL = GAME_FILES as unknown as GameDef[]

export const GAMES: Record<string, GameDef> = Object.fromEntries(ALL.map(g => [g.id, g]))

const DRAFTS: Record<string, GameDef> = Object.fromEntries((DRAFT_FILES as unknown as GameDef[]).map(g => [g.id, g]))

// Drafts are never on a student's list and never saved; ?preview=1 opens them for review.
export function getGame(id: string, opts: { drafts?: boolean } = {}): GameDef | null {
  return GAMES[id] ?? (opts.drafts ? DRAFTS[id] ?? null : null)
}
