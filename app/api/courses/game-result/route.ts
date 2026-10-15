import { NextRequest, NextResponse } from 'next/server'
import { lookupStudent } from '@/lib/studentAccess'
import { getDb, newId } from '@/lib/db'
import { getGame } from '@/lib/games/registry'
import { LEVELS, TAGS } from '@/lib/games/contract'

export const runtime = 'nodejs'

// PUBLIC (api/courses is on the middleware allow-list). Saves one finished mini-game
// session under the signed-in Student's Corner account. Name + code are verified on
// every call, exactly like /api/courses/progress.
// Body: { name, code, result: GameResult }

// Kept here rather than in lib/db.ts so the games feature is self-contained.
let ready: Promise<void> | null = null
function ensureTable() {
  ready ??= getDb().then(db => db.exec(`
    CREATE TABLE IF NOT EXISTS game_results (
      id            TEXT PRIMARY KEY,
      student_key   TEXT NOT NULL,
      game_id       TEXT NOT NULL,
      tags          TEXT NOT NULL DEFAULT '[]',
      level         TEXT NOT NULL DEFAULT '',
      items_total   INTEGER NOT NULL,
      items_correct INTEGER NOT NULL,
      wrong         TEXT NOT NULL DEFAULT '[]',
      created_at    TEXT DEFAULT (now()::text)
    );
    CREATE INDEX IF NOT EXISTS game_results_student ON game_results (student_key, created_at);
  `))
  return ready
}

function studentKey(name: string) {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; code?: string; result?: any }
  const name = String(body.name || '')
  if (!lookupStudent(name, String(body.code || ''))) {
    return NextResponse.json({ error: 'Please sign in at Student’s Corner first.' }, { status: 401 })
  }
  const r = body.result || {}
  const game = getGame(String(r.gameId || ''))
  if (!game) return NextResponse.json({ error: 'Unknown game.' }, { status: 400 })
  const total = Number(r.itemsTotal), correct = Number(r.itemsCorrect)
  if (!Number.isInteger(total) || !Number.isInteger(correct) || total < 1 || total > 50 || correct < 0 || correct > total) {
    return NextResponse.json({ error: 'Bad result.' }, { status: 400 })
  }
  const level = LEVELS.includes(r.level) ? r.level : ''
  // Tags always come from the game definition, never from the browser.
  const tags = game.tags.filter(t => TAGS.includes(t))
  const wrong = (Array.isArray(r.wrong) ? r.wrong : []).slice(0, 50).map((w: any) => ({
    itemId: String(w?.itemId || '').slice(0, 80), answered: String(w?.answered || '').slice(0, 200),
  }))

  await ensureTable()
  const db = await getDb()
  await db.prepare(
    'INSERT INTO game_results (id, student_key, game_id, tags, level, items_total, items_correct, wrong) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(newId(), studentKey(name), game.id, JSON.stringify(tags), level, total, correct, JSON.stringify(wrong))
  return NextResponse.json({ ok: true })
}
