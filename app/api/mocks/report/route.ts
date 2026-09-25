import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { buildReportHtml } from '@/lib/mockReport'

export const maxDuration = 180

// Full mock correction package (Function 4, Phase 3) — the actual generation logic
// lives in lib/mockReport.ts so it's callable directly (tests/scripts) without going
// through this auth-gated HTTP handler.
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const examId = req.nextUrl.searchParams.get('examId')
  const studentName = req.nextUrl.searchParams.get('student')
  if (!examId || !studentName) return NextResponse.json({ error: 'examId and student are required' }, { status: 400 })

  const { status, html } = await buildReportHtml(examId, studentName)
  return new NextResponse(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
