import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { transcribeDiarised } from '@/lib/transcription'

export const runtime = 'nodejs'
export const maxDuration = 300

// Teacher-only (middleware protects /api by default; we also check the session here).
// Accepts ONE audio file (multipart) and returns a diarised transcript.
//
// NOTE: the file passes through the serverless request body, which Vercel caps at
// ~4.5 MB. That's fine for a short diarisation TEST clip (a few minutes). A full
// ~14-min paired mock exceeds the limit and needs the Vercel Blob direct-upload path
// (the next step — see ROADMAP Function 5 / Phase A2).
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 })
  }
  if (file.size > 4.4 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'This test route accepts clips under ~4.4 MB (a few minutes). A full mock needs the Blob upload step.' },
      { status: 413 },
    )
  }

  const numSpeakers = Number(form?.get('numSpeakers')) || undefined
  try {
    const result = await transcribeDiarised(file, { numSpeakers })
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Transcription failed.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
