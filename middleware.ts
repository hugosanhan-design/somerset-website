import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth.config'

// Uses the edge-safe config only — never imports lib/auth.ts (which pulls in
// better-sqlite3, a native Node module the Edge runtime can't load). This means
// middleware can only check "is there a valid session", not hit the database; all
// per-resource ownership checks (does this teacher own this group/student) happen in
// the actual API route handlers, which run in the normal Node.js runtime.
const { auth } = NextAuth(authConfig)

// Protects everything by default — new routes are safe unless explicitly excluded below.
// Public exceptions: the login/setup flow itself, the student-facing placement quiz and
// intake flow (filled in unsupervised, often via a QR code on someone else's device),
// Sara's standalone no-login correction page and the stateless AI routes it shares with
// /correct (those routes self-protect via requireSessionOrCode — either a real session
// or Sara's access code, checked server-side inside each route), the break-glass account
// recovery endpoint (self-guards via RECOVERY_SECRET — has to work with zero valid
// sessions, that's the whole point), and static assets.
export default auth((req) => {
  // Public front door + Student's Corner: the two-door splash at "/" and the
  // no-login student hub at "/student" (and its children) are open to everyone.
  const { pathname } = req.nextUrl
  if (pathname === '/' || pathname === '/student' || pathname.startsWith('/student/')) return

  if (!req.auth) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: [
    '/((?!api/auth|api/intake|api/teachers/bootstrap|api/admin/recover|api/correct|api/correct-docx|api/extract|api/detect-ai|api/cbt/submit|api/cbt/draft|api/speaking/practice|api/aoife|aoife|api/student/access|cbt|login|setup|forgot-password|reset-password|intake|placement|games|uploads|sara|cbt-audio|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|mp3|html)$).*)',
  ],
}
