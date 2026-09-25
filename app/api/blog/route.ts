import { NextResponse } from 'next/server'

export const revalidate = 3600 // cache for 1 hour

interface BlogPost {
  id: string
  title: string
  published: string
  author: string
  summary: string
  link: string
  image: string | null
}

export async function GET() {
  try {
    const feedUrl =
      'https://somersetlanguagecentre.blogspot.com/feeds/posts/default?alt=json&max-results=12'

    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SomersetApp/1.0)',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Blogger fetch failed: ${res.status}`)
    }

    const data = await res.json()
    const entries = data.feed?.entry ?? []

    const posts: BlogPost[] = entries
      .map((entry: Record<string, unknown>) => {
        const title = (entry.title as { $t: string })?.$t ?? ''
        if (!title) return null

        const published = (entry.published as { $t: string })?.$t ?? ''
        const author =
          (entry.author as Array<{ name: { $t: string } }>)?.[0]?.name?.$t ?? 'Somerset Language Centre'
        const summary = stripHtml((entry.summary as { $t: string })?.$t ?? '')
        const links = (entry.link as Array<{ rel: string; href: string }>) ?? []
        const link = links.find((l) => l.rel === 'alternate')?.href ?? '#'
        const id = (entry.id as { $t: string })?.$t ?? link

        // Try to extract first image from content
        const content = (entry.content as { $t: string })?.$t ?? ''
        const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i)
        const image = imgMatch?.[1] ?? null

        return { id, title, published, author, summary, link, image }
      })
      .filter(Boolean) as BlogPost[]

    return NextResponse.json(posts)
  } catch (err) {
    console.error('Blog API error:', err)
    return NextResponse.json([], { status: 200 }) // return empty rather than 500
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().slice(0, 200)
}
