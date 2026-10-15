// Builds one "Got 3 minutes?" session from a game's bank. Pure: safe in the browser and on the server.
import { LEVELS, SESSION_ITEMS, type ChoiceItem, type GameDef, type Level, type PairItem } from './contract'

export function shuffle<T>(a: T[]): T[] {
  const b = a.slice()
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] }
  return b
}

// The student's level if the game has it, otherwise the nearest level it does have
// (one below first: easier is kinder than harder).
export function pickLevel(game: GameDef, wanted: Level): Level {
  const has = (l: Level) => (game.items[l]?.length ?? 0) > 0
  if (has(wanted)) return wanted
  const i = LEVELS.indexOf(wanted)
  for (let d = 1; d < LEVELS.length; d++) {
    const lower = LEVELS[i - d], higher = LEVELS[i + d]
    if (lower && has(lower)) return lower
    if (higher && has(higher)) return higher
  }
  return LEVELS.find(has) ?? wanted
}

// Choice items come back with their options shuffled (answer index remapped), so the
// right answer is not always the first card.
export function buildChoiceSession(game: GameDef, level: Level, n = SESSION_ITEMS): ChoiceItem[] {
  const bank = (game.items[level] ?? []) as ChoiceItem[]
  return shuffle(bank).slice(0, n).map(it => {
    const order = shuffle(it.options.map((_, i) => i))
    return { ...it, options: order.map(i => it.options[i]), answer: order.indexOf(it.answer) }
  })
}

// Pairs: 12 pairs split into two boards of 6.
export function buildPairsSession(game: GameDef, level: Level, n = SESSION_ITEMS): PairItem[][] {
  const bank = shuffle((game.items[level] ?? []) as PairItem[]).slice(0, n)
  const half = Math.ceil(bank.length / 2)
  return [bank.slice(0, half), bank.slice(half)].filter(b => b.length)
}
