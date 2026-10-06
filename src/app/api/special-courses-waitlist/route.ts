import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const SITUATION_LABELS: Record<string, string> = {
  arriving: 'Planning to move to Spain',
  recent: 'Just arrived (under a year)',
  settled: 'Been here a while, Spanish is stuck',
  work: 'Works / runs a business here',
  family: 'Has family or children here',
  retiring: 'Retiring here',
}

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
      situationLabel: SITUATION_LABELS[situation] ?? situation,
      timestamp: new Date().toISOString(),
    }

    // Always log — useful fallback if Resend isn't configured yet
    console.log('[special-courses-waitlist]', JSON.stringify(entry))

    // Send email notification via Resend if API key is set
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const resend = new Resend(resendKey)
      await resend.emails.send({
        from: 'Somerset Website <noreply@somersetlc.com>',
        to: 'hugosanhan@gmail.com',
        subject: `New waitlist signup: ${entry.name}`,
        html: `
          <h2>New Spanish for Expats waitlist signup</h2>
          <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:15px">
            <tr><td><strong>Name</strong></td><td>${entry.name}</td></tr>
            <tr><td><strong>Email</strong></td><td>${entry.email}</td></tr>
            <tr><td><strong>Situation</strong></td><td>${entry.situationLabel}</td></tr>
            <tr><td><strong>Time</strong></td><td>${entry.timestamp}</td></tr>
          </table>
        `,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[special-courses-waitlist] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
