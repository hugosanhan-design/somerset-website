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

// One session of choice items for any engine. Options are shuffled (answer index remapped),
// so the right answer is not always the first card.
export function buildSession(game: GameDef, level: Level, n = SESSION_ITEMS): ChoiceItem[] {
  const raw = game.engine === 'pairs' ? pairsAsChoice((game.items[level] ?? []) as PairItem[]) : (game.items[level] ?? []) as ChoiceItem[]
  return shuffle(raw).slice(0, n).map(it => {
    const order = shuffle(it.options.map((_, i) => i))
    return { ...it, options: order.map(i => it.options[i]), answer: order.indexOf(it.answer) }
  })
}

// A pair becomes: question = the left card, options = its partner + 3 partners of other pairs.
function pairsAsChoice(bank: PairItem[]): ChoiceItem[] {
  return bank.map(p => {
    const others = shuffle(bank.filter(o => o.right !== p.right)).slice(0, 3).map(o => o.right)
    return { id: p.id, q: p.left, options: [p.right, ...others], answer: 0, why: p.why }
  })
}
