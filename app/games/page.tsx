import { GAMES } from '@/lib/games/registry'
import { ERROR_TAGS } from '@/data/errorTags'
import GamesHub, { type HubGame } from './GamesHub'

export const metadata = { title: 'Somerset Games' }

// Every ready game, grouped by the first error tag it trains (the order of data/errorTags.ts).
export default function GamesPage() {
  const games: HubGame[] = Object.values(GAMES).map(g => ({
    id: g.id, title: g.title, intro: g.intro, tags: g.tags,
    levels: Object.keys(g.items).filter(l => (g.items as Record<string, unknown[]>)[l]?.length),
    explain: !!g.explain || Object.values(g.items).flat().some(i => !!(i as { explain?: string }).explain),
  }))
  const groups = ERROR_TAGS
    .map(t => ({ key: t.key, label: t.label, games: games.filter(g => g.tags[0] === t.key).sort((a, b) => a.title.localeCompare(b.title)) }))
    .filter(gr => gr.games.length)
  return <GamesHub groups={groups} total={games.length} />
}
