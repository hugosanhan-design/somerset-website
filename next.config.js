/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Baked into the client bundle at build time, so a loaded page can tell
    // if a newer deploy has since gone live (see components/portal/UpdateBanner.tsx).
    // VERCEL_URL is unique per deployment and set consistently for every
    // bundle Vercel builds (unlike VERCEL_GIT_COMMIT_SHA, which is only set
    // for git-integrated deployments — these are plain `vercel --prod` CLI
    // deploys, so that var is never present).
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_URL || 'dev',
  },
}
module.exports = nextConfig
