import Anthropic, { toFile } from '@anthropic-ai/sdk'
import type { DocumentBlockParam, ImageBlockParam, TextBlockParam } from '@anthropic-ai/sdk/resources/messages'
import { NextRequest, NextResponse } from 'next/server'
import { requireSessionOrCode } from '@/lib/authz'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  if (!(await requireSessionOrCode(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const textPrompt: TextBlockParam = {
      type: 'text',
      text: 'Extract all the text exactly as written. Return only the text, preserving paragraph breaks. No commentary.',
    }

    // ── PDF ────────────────────────────────────────────────────────────────
    if (file.type === 'application/pdf') {
      const docBlock: DocumentBlockParam = {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      }
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        messages: [{ role: 'user', content: [docBlock, textPrompt] }],
      })
      const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
      const text = textBlock?.text.trim() || ''
      return NextResponse.json({ text })
    }

    // ── Image (photo OCR) ──────────────────────────────────────────────────
    if (file.type.startsWith('image/')) {
      const mediaType = (
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
          ? file.type
          : 'image/jpeg'
      ) as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

      const imageBlock: ImageBlockParam = {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      }
      const ocrPrompt: TextBlockParam = {
        type: 'text',
        text: 'Transcribe all the handwritten or printed text in this image exactly as written — errors, crossings-out, and all. Preserve paragraph breaks. Return only the transcribed text with no commentary.',
      }
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: [imageBlock, ocrPrompt] }],
      })
      const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
      const text = textBlock?.text.trim() || ''
      return NextResponse.json({ text })
    }

    return NextResponse.json({ error: 'Unsupported file type. Upload a PDF or an image.' }, { status: 400 })
  } catch (err) {
    console.error('[extract]', err)
    return NextResponse.json({ error: 'Extraction failed. Please try again.' }, { status: 500 })
  }
}
