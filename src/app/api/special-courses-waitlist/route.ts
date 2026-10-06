import { NextResponse } from 'next/server'

// TODO: Connect to email service (Resend/SendGrid) or a Notion waitlist DB.
// For now: logs to console and returns success so the form works end-to-end.
// Each entry: { name, email, situation, timestamp }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, situation } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing name or email' }, { status: 400 })
    }

    const entry = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      situation: String(situation || 'unknown').trim(),
      timestamp: new Date().toISOString(),
    }

    // Log so Vercel Function logs capture it until proper storage is added
    console.log('[special-courses-waitlist]', JSON.stringify(entry))

    // TODO: Replace console.log above with one of:
    // 1. Resend email to info@somersetlc.com — easiest, add RESEND_API_KEY to Vercel env
    // 2. Notion DB insert — reuse NOTION_TOKEN, create a Waitlist DB in Somerset workspace
    // 3. Google Sheets via Apps Script webhook

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
