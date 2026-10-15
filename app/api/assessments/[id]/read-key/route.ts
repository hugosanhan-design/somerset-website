import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export const maxDuration = 120

// Turns the uploaded answer key (PDF or photos) into plain text the correction step can
// mark against. The result is saved UNCONFIRMED: the teacher must read it and confirm,
// because a misread key silently mis-marks every student.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const a = await db.prepare('SELECT * FROM assessments WHERE id = ?').get(params.id) as { key_urls: string; title: string } | undefined
    if (!a) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const urls: string[] = JSON.parse(a.key_urls || '[]')

    const blocks: Anthropic.ContentBlockParam[] = []
    for (const url of urls) {
      const res = await fetch(url)
      if (!res.ok) return NextResponse.json({ error: 'Could not fetch the stored key' }, { status: 502 })
      const data = Buffer.from(await res.arrayBuffer()).toString('base64')
      const ext = (url.split('?')[0].split('.').pop() || '').toLowerCase()
      if (ext === 'pdf') blocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } })
      else blocks.push({ type: 'image', source: { type: 'base64', media_type: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg', data } })
    }
    blocks.push({
      type: 'text',
      text: `This is the teacher's ANSWER KEY for the test "${a.title}". Transcribe it as plain text a marker can use, exactly as printed:
- Keep the test's section names and question numbers.
- One line per question: "<number>. <correct answer>" and, if given, accepted alternatives and the marks for that item.
- Keep any marking notes, accepted spellings and writing/speaking criteria verbatim.
- End with a line "TOTAL OBJECTIVE MARKS: <n>" if the key states it (or add them up and say you did).
Do not add commentary. If anything is unreadable, write [UNREADABLE] in its place instead of guessing.`,
    })

    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 4000,
      messages: [{ role: 'user', content: blocks }],
    })
    const text = response.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text.trim() || ''
    await db.prepare('UPDATE assessments SET key_text = ?, key_confirmed = 0 WHERE id = ?').run(text, params.id)
    return NextResponse.json({ key_text: text })
  } catch (err) {
    console.error('read-key failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
