import { put } from '@vercel/blob'

// Persistent image storage for scanned student work. Vercel's own filesystem is
// read-only/ephemeral in production — the exact bug that broke local SQLite
// before the move to Neon Postgres (see lib/db.ts's header comment) — so photos
// must never be written with fs.writeFileSync again. Requires Blob storage to be
// enabled on the Vercel project (Storage tab → Create → Blob); that step sets
// BLOB_READ_WRITE_TOKEN automatically, nothing else to configure.
export async function uploadWorkImage(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const filename = `work/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const blob = await put(filename, file, { access: 'public' })
  return blob.url
}
