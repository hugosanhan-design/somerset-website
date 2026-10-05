export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { getDb } from '@/lib/db'
import { ITEM_BY_ID } from '@/lib/courses/b1u1'
import type { Progress } from '@/lib/courses/progress'

// Deferred — env vars aren't available at build time during static analysis
function initVapid() {
  webpush.setVapidDetails(
    'mailto:hugosanhan@gmail.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
}

function worstError(progress: Progress): string | null {
  const items = progress.items ?? {}
  const errors = Object.entries(items)
    .filter(([id, s]) => (id.startsWith('gram:') || id.startsWith('stat:')) && s.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
  if (!errors.length) return null

  const [id] = errors[0]
  const item = ITEM_BY_ID[id]
  if (!item || item.kind !== 'fix') return null
  return `"${item.seg}" → "${item.fix[0]}"`
}

function buildMessage(name: string, errorLabel: string | null): { title: string; body: string } {
  const first = name.split(' ')[0]
  if (errorLabel) {
    return {
      title: `Quick question, ${first} 👋`,
      body: `You mixed up ${errorLabel}. 2 minutes in Grammar Sprint and it's gone.`,
    }
  }
  return {
    title: `Time to revise, ${first} ⚡`,
    body: "2 minutes of Grammar Sprint — your mistakes, your pace.",
  }
}

export async function GET(req: NextRequest) {
  initVapid()

  // Protect the cron endpoint
  // Vercel sends Authorization: Bearer <CRON_SECRET>; manual calls can use ?secret= or x-cron-secret
  const authHeader = req.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const secret = bearerToken ?? req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  const validSecrets = [process.env.PUSH_CRON_SECRET, process.env.CRON_SECRET].filter(Boolean)
  if (!validSecrets.includes(secret ?? '')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const db = await getDb()

  // Find subscriptions not seen in the last 2 days
  const subs = await db.prepare(
    `SELECT id, student_key, student_name, course, endpoint, p256dh, auth
     FROM push_subscriptions
     WHERE last_seen < NOW() - INTERVAL '2 days'`
  ).all() as Array<{ id: number; student_key: string; student_name: string; course: string; endpoint: string; p256dh: string; auth: string }>

  const results = { sent: 0, skipped: 0, removed: 0, errors: [] as string[] }

  for (const sub of subs) {
    // Load their progress to find worst error
    const row = await db.prepare(
      `SELECT data FROM course_progress WHERE student_key = $1 AND course = $2`
    ).get(sub.student_key, sub.course) as { data: string } | undefined

    let progress: Progress | null = null
    try { progress = row ? JSON.parse(row.data) : null } catch { /* ignore */ }

    // Only notify if they have grammar errors (have actually used the course)
    const hasErrors = progress && Object.entries(progress.items ?? {})
      .some(([id, s]) => (id.startsWith('gram:') || id.startsWith('stat:')) && s.wrong > 0)

    if (!hasErrors) { results.skipped++; continue }

    const errorLabel = progress ? worstError(progress) : null
    const { title, body } = buildMessage(sub.student_name, errorLabel)

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url: `/courses/${sub.course}` }),
        { TTL: 86400 }
      )
      results.sent++
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      if (e.statusCode === 410 || e.statusCode === 404) {
        // Subscription expired — remove it
        await db.prepare(`DELETE FROM push_subscriptions WHERE id = $1`).run(sub.id)
        results.removed++
      } else {
        results.errors.push(e.message ?? String(e))
      }
    }
  }

  return NextResponse.json(results)
}
