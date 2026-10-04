import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

// Real per-date lesson content (unit, pages, plan, grammar, vocab, play, arcade,
// and the shelf of material labels) for the groups migrated from the local
// Somerset Portal — see scripts/migrate-lesson-content.mjs. Groups not covered
// there (or dates outside the migrated range) simply return { content: null };
// the dashboard's lesson panel treats that as "not synced yet", same as before.
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groupSlug = req.nextUrl.searchParams.get('groupSlug')
  const date = req.nextUrl.searchParams.get('date')
  if (!groupSlug || !date) {
    return NextResponse.json({ error: 'groupSlug and date are required' }, { status: 400 })
  }

  const db = await getDb()
  const row = await db.prepare(
    'SELECT * FROM lesson_content WHERE group_slug = ? AND date = ?'
  ).get(groupSlug, date) as Record<string, unknown> | undefined

  if (!row) return NextResponse.json({ content: null })

  return NextResponse.json({
    content: {
      unit: row.unit,
      unitApprox: row.unit_approx === 1,
      title: row.title,
      pages: row.pages,
      grammar: row.grammar,
      vocab: row.vocab,
      warmer: row.warmer,
      plan: row.plan,
      print: row.print_note,
      flag: row.flag,
      note: row.note,
      play: JSON.parse((row.play_json as string) || 'null'),
      arcade: JSON.parse((row.arcade_json as string) || 'null'),
      shelves: JSON.parse((row.shelves_json as string) || 'null'),
      unitAudio: JSON.parse((row.unit_audio_json as string) || '[]'),
      bookletDigitalWeb: row.booklet_digital_web || null,
    },
  })
}
