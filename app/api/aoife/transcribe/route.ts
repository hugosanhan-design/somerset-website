import { NextRequest, NextResponse } from 'next/server'
import { lookupStudent } from '@/lib/studentAccess'
import { transcribeDiarised } from '@/lib/transcription'

export const runtime = 'nodejs'
export const maxDuration = 120

// PUBLIC (middleware allow-list). Step 1 of the daily loop: take her ~1-min recording,
// return the transcript ONLY. The page shows it back to her ("Is this what you said?")
// so she can fix any mishearings BEFORE any correction runs. Nothing is analysed or
// stored here. Audio is transcribed in memory and never persisted.

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

  const area = lookupStudent(String(form.get('name') || ''), String(form.get('code') || ''))
  if (!area) {
    return NextResponse.json({ error: 'Please sign in first with your name and code.' }, { status: 401, headers: CORS })
  }

  const file = form.get('file')
  if (!(file instanceof Blob)) return NextResponse.json({ error: 'No audio recorded.' }, { status: 400, headers: CORS })
  if (file.size > 4.4 * 1024 * 1024) {
    return NextResponse.json({ error: 'That recording is a bit long — keep it to about a minute.' }, { status: 413, headers: CORS })
  }
  if (file.size < 2000) {
    return NextResponse.json({ error: 'That recording is very short. Try again and speak for a little longer.' }, { status: 400, headers: CORS })
  }

  try {
    const { fullText } = await transcribeDiarised(file, { numSpeakers: 1 })
    if (!fullText || !fullText.trim()) {
      return NextResponse.json({ error: "We couldn't quite hear you. Check the mic and try once more." }, { status: 422, headers: CORS })
    }
    return NextResponse.json({ transcript: fullText.trim() }, { headers: CORS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Something went wrong hearing your answer.'
    return NextResponse.json({ error: msg }, { status: 502, headers: CORS })
  }
}
