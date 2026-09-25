import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { encode as defaultEncode } from '@auth/core/jwt'
import bcrypt from 'bcryptjs'
import { getDb } from './db'
import { authConfig, REMEMBER_MAX_AGE, SESSION_MAX_AGE } from './auth.config'

interface TeacherRow {
  id: string
  name: string
  email: string
  password_hash: string
  role: string
}

// Full config — Node runtime only (Credentials provider hits Postgres). Used by the
// /api/auth route handler and by auth() calls inside API routes/server components.
// middleware.ts uses the edge-safe authConfig directly instead of this file.
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // Per-login session length. Auth.js always stamps the token's expiry from a single
  // maxAge, so "remember me" has to be applied here at encode time: a ticked box gets
  // the 30-day token, an unticked one gets a ~1-day token that lapses the next day.
  jwt: {
    encode(params) {
      const remember = (params.token as { remember?: boolean } | undefined)?.remember !== false
      return defaultEncode({ ...params, maxAge: remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE })
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember me', type: 'text' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string || '').trim().toLowerCase()
        const password = credentials?.password as string
        if (!email || !password) return null

        const db = await getDb()
        const teacher = await db.prepare('SELECT * FROM teachers WHERE email = ?').get(email) as TeacherRow | undefined
        if (!teacher) return null

        const valid = await bcrypt.compare(password, teacher.password_hash)
        if (!valid) return null

        return { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role, remember: credentials?.remember === 'true' }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id
        token.role = (user as { role: string }).role
        // Read by the custom jwt.encode above to pick the token's lifetime.
        token.remember = (user as { remember?: boolean }).remember ?? true
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
