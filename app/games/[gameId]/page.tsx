import { notFound } from 'next/navigation'
import { getGame } from '@/lib/games/registry'
import { LEVELS, type Level } from '@/lib/games/contract'
import GamePlayer from '../GamePlayer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { gameId: string } }) {
  const g = getGame(params.gameId)
  return { title: g ? `${g.title} · Somerset` : 'Somerset Games' }
}

export default function GamePage({ params, searchParams }: { params: { gameId: string }; searchParams: { level?: string } }) {
  const game = getGame(params.gameId)
  if (!game) notFound()
  const level = (LEVELS as string[]).includes(String(searchParams.level)) ? (searchParams.level as Level) : 'B2'
  return <GamePlayer game={game} level={level} />
}
