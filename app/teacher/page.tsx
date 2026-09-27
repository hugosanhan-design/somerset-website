import { redirect } from 'next/navigation'

// Retired 27 Sep 2026 — this was the old pre-sidebar landing page. Every action it
// offered now lives in the portal Sidebar (Dashboard, Groups, Students, Scan work,
// To correct, Correct writing, Extras) or was already deliberately dropped (Class
// Materials, Context Lab — see components/portal/Sidebar.tsx's header comment).
// Keeping the route (redirecting rather than deleting it) so old bookmarks and the
// handful of internal "← Somerset" back-links some sub-pages still use don't 404.
export default function TeacherPortalRedirect() {
  redirect('/dashboard')
}
