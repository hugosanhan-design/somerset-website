import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadWorkImage } from '@/lib/blob'

// Uploads ONE page of a scan and returns its Blob URL. A multi-page document can be
// well over Vercel's ~4.5MB request-body limit if sent in one go, so the phone sends
// pages one at a time and then saves the entry with the list of URLs.
async function handle(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const image = formData.get('image') as File | null
  if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  const url = await uploadWorkImage(image)
  return NextResponse.json({ url }, { status: 201 })
}

// Surface the real error text instead of a bare 500, so a failure on the phone or in the
// queue says what broke (and shows in the Vercel function log).
export async function POST(req: NextRequest) {
  try {
    return await handle(req)
  } catch (err) {
    console.error('work-entries/page-upload failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
