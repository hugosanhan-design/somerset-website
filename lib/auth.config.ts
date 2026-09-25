import type { NextAuthConfig } from 'next-auth'

// Edge-runtime-safe half of the Auth.js config — used by middleware.ts. Must NOT import
// anything that pulls in better-sqlite3 (a native Node module the Edge runtime can't load).
// The actual Credentials provider (which needs DB access) lives in lib/auth.ts instead,
// and only runs in normal Node.js API routes / server components, never in middleware.
// "Remember me" lives here: a ticked box gives a 30-day persistent login; unticked
// shortens the session to ~1 day (see the jwt callback in auth.ts, which caps the
// token's expiry when the user didn't ask to be remembered).
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 90   // 90 days — "sign in once, behaves like a native app"
export const SESSION_MAX_AGE = 60 * 60 * 24         // 1 day (not remembered)

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt', maxAge: REMEMBER_MAX_AGE },
  pages: { signIn: '/login' },
  providers: [],
}
