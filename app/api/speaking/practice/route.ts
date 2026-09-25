import { NextRequest, NextResponse } from 'next/server'
import { transcribeDiarised } from '@/lib/transcription'
import { assessLongTurn } from '@/lib/longTurnPractice'
import { lookupStudent } from '@/lib/studentAccess'

export const runtime = 'nodejs'
export const maxDuration = 120

// PUBLIC endpoint (added to the middleware allow-list) so the standalone student
// practice page can call it with no login. The student records a ~1-min Part 2 long
// turn; we transcribe it (Scribe) and score the two criteria a solo turn can show.
//
// Privacy: the audio is transcribed in-memory and NOT stored. Nothing is persisted.
// Abuse control: if SPEAKING_PRACTICE_CODE is set, the request must include a matching
// `code` (so a deployed public URL isn't wide open). If it's unset, the route is open
// — fine for a local test.
//
// CORS is open (*) because the student may open the practice HTML as a local file
// (origin "null"); multipart POSTs are CORS-safelisted so no preflight is needed, but
// we answer OPTIONS anyway.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Expected a form upload.' }, { status: 400, headers: CORS })

  // Signed-in students only: validate the name + code issued in Student's Corner.
  const area = lookupStudent(String(form.get('name') || ''), String(form.get('code') || ''))
  if (!area) {
    return NextResponse.json({ error: "Please sign in at Student's Corner first — open this from your own area." }, { status: 401, headers: CORS })
  }
  const candidate = area.displayName

  const file = form.get('file')
  const question = String(form.get('question') || '').trim()
  const topic = String(form.get('topic') || '').trim() || undefined

  if (!(file instanceof Blob)) return NextResponse.json({ error: 'No audio recorded.' }, { status: 400, headers: CORS })
  if (!question) return NextResponse.json({ error: 'Missing the question.' }, { status: 400, headers: CORS })
  if (file.size > 4.4 * 1024 * 1024) {
    return NextResponse.json({ error: 'Recording too large — keep it to about a minute.' }, { status: 413, headers: CORS })
  }
  if (file.size < 2000) {
    return NextResponse.json({ error: 'That recording is too short. Try again and speak for about a minute.' }, { status: 400, headers: CORS })
  }

  try {
    const { fullText } = await transcribeDiarised(file, { numSpeakers: 1 })
    if (!fullText || fullText.trim().split(/\s+/).length < 8) {
      return NextResponse.json({ error: "We couldn't hear enough speech to score. Check the mic and try again." }, { status: 422, headers: CORS })
    }
    const assessment = await assessLongTurn({ candidate, transcript: fullText, question, topic })
    return NextResponse.json(assessment, { headers: CORS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Something went wrong scoring your answer.'
    return NextResponse.json({ error: msg }, { status: 502, headers: CORS })
  }
}
