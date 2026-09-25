/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Baked into the client bundle at build time. Vercel sets
    // VERCEL_GIT_COMMIT_SHA automatically for every deploy; falls back to the
    // build timestamp for local dev so the update banner still has something
    // to compare against.
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now()),
  },
}
module.exports = nextConfig
