import { NextRequest, NextResponse } from 'next/server'
import { lookupStudent } from '@/lib/studentAccess'
import { spineDay, TOTAL_DAYS } from '@/lib/aoifeContent'
import { getThread, cacheMessage, errorProfile, normaliseKey, daysDone, lastReply } from '@/lib/aoifeStore'
import { composeMessage } from '@/lib/aoifeTutor'

export const runtime = 'nodejs'
export const maxDuration = 60

// PUBLIC (middleware allow-list). Serves the learner's current day: Aoife's message
// (Claude-composed within the fixed spine, cached for the day), plus the day's Ireland
// nugget, questions, diary frames and map unlock. No login — name + code only.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; code?: string }
  const area = lookupStudent(String(body.name || ''), String(body.code || ''))
  if (!area) {
    return NextResponse.json({ error: 'Please sign in first with your name and code.' }, { status: 401, headers: CORS })
  }
  const key = normaliseKey(String(body.name || ''))

  try {
    const thread = await getThread(key)
    const done = await daysDone(key)

    if (thread.day > TOTAL_DAYS) {
      const last = spineDay(TOTAL_DAYS)
      return NextResponse.json(
        { finished: true, day: TOTAL_DAYS, daysDone: done, title: last.title, message: last.seedMessage },
        { headers: CORS },
      )
    }

    const spine = spineDay(thread.day)

    const composeAndCache = async () => {
      const [profile, prev] = await Promise.all([errorProfile(key), lastReply(key)])
      const msg = await composeMessage({ spine, storySummary: thread.story_summary, lastReply: prev, errorProfile: profile })
      await cacheMessage(key, msg)
      return msg
    }

    // Use the cached message for today if we already composed it; otherwise compose now.
    let payload: { message: string; questions: string[] }
    if (thread.last_message) {
      try {
        payload = JSON.parse(thread.last_message)
      } catch {
        payload = await composeAndCache()
      }
    } else {
      payload = await composeAndCache()
    }

    return NextResponse.json(
      {
        day: spine.day,
        week: spine.week,
        title: spine.title,
        grammar: spine.grammar,
        message: payload.message,
        questions: payload.questions,
        nugget: spine.nugget,
        diary: spine.diary,
        unlock: spine.unlock,
        daysDone: done,
        total: TOTAL_DAYS,
      },
      { headers: CORS },
    )
  } catch (err) {
    // Never leave the learner stranded — fall back to the fixed spine.
    const thread = await getThread(key).catch(() => ({ day: 1 } as any))
    const spine = spineDay(thread.day || 1)
    return NextResponse.json(
      {
        day: spine.day,
        week: spine.week,
        title: spine.title,
        grammar: spine.grammar,
        message: spine.seedMessage,
        questions: spine.seedQuestions.map((q) => q.q),
        nugget: spine.nugget,
        diary: spine.diary,
        unlock: spine.unlock,
        daysDone: 0,
        total: TOTAL_DAYS,
        degraded: true,
      },
      { headers: CORS },
    )
  }
}
