// Every portal mini-game, by id. To add a game: drop its JSON in data/games/, import it
// here, run `node scripts/games-validate.mjs`.
import type { GameDef } from './contract'
import storyTime from '@/data/games/story-time.json'
import whoDidIt from '@/data/games/who-did-it.json'

const ALL = [storyTime, whoDidIt] as unknown as GameDef[]

export const GAMES: Record<string, GameDef> = Object.fromEntries(ALL.map(g => [g.id, g]))

export function getGame(id: string): GameDef | null {
  return GAMES[id] ?? null
}
