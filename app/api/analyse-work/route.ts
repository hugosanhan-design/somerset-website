import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { uploadWorkImage } from '@/lib/blob'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const WORK_TYPE_LABELS: Record<string, string> = {
  exam: 'a written exam',
  essay: 'a written essay or composition',
  class_exercise: 'a class exercise or worksheet',
  speaking: 'speaking or oral assessment notes',
  homework: 'homework',
}

type MediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

function mediaTypeFor(nameOrUrl: string): MediaType {
  const clean = nameOrUrl.split('?')[0]
  const ext = (clean.split('.').pop() || 'jpg').toLowerCase()
  const map: Record<string, MediaType> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  }
  return map[ext] || 'image/jpeg'
}

// Two callers use this route:
//  1. The old one-step upload (`/students/[id]/upload`) — sends a fresh `image` file,
//     gets score+feedback+image_url back immediately.
//  2. The correction queue (`/correct-queue/[entryId]`) — sends `imageUrl` for a photo
//     that was already scanned from the phone via /api/work-entries/quick and is sitting
//     at status='pending'; this route re-fetches it from Blob storage to analyse it,
//     rather than asking the teacher to re-upload a photo that's already saved.
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const imageFile = formData.get('image') as File | null
  const existingImageUrl = (formData.get('imageUrl') as string) || ''
  const workType = (formData.get('type') as string) || 'class_exercise'
  const level = (formData.get('level') as string) || 'B1'
  const title = (formData.get('title') as string) || ''

  if (!imageFile && !existingImageUrl) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  let imageUrl: string
  let buffer: Buffer
  let mediaType: MediaType

  if (imageFile) {
    // Persist to Blob storage — never fs.writeFileSync (Vercel's filesystem doesn't
    // survive a redeploy or cold start; see lib/blob.ts).
    imageUrl = await uploadWorkImage(imageFile)
    buffer = Buffer.from(await imageFile.arrayBuffer())
    mediaType = mediaTypeFor(imageFile.name)
  } else {
    imageUrl = existingImageUrl
    const res = await fetch(existingImageUrl)
    if (!res.ok) {
      return NextResponse.json({ error: 'Could not fetch the stored image' }, { status: 502 })
    }
    buffer = Buffer.from(await res.arrayBuffer())
    mediaType = mediaTypeFor(existingImageUrl)
  }

  const imageData = buffer.toString('base64')

  const prompt = `You are an experienced English language teacher at Somerset Language Centre, Valencia, Spain.
You are reviewing a photo of student work: ${WORK_TYPE_LABELS[workType] || workType}.
The student's approximate CEFR level is ${level}.
${title ? `Work title: "${title}"` : ''}

Please analyse the student's work carefully and provide:

1. A SCORE out of 100 (where 60 = adequate for level, 75 = good, 90+ = excellent)
2. A SHORT FEEDBACK paragraph (3-5 sentences) written directly to the teacher — constructive, specific, level-aware. Mention what the student does well and what to work on.
3. ERROR PATTERNS: List 2–4 recurring issues you can identify (e.g. "article use", "verb tense consistency", "spelling"). If the work is excellent with no clear patterns, return an empty list.

Respond in JSON only, with this exact structure:
{
  "score": <number 0-100>,
  "feedback": "<teacher-facing paragraph>",
  "error_patterns": ["<pattern 1>", "<pattern 2>", ...]
}

If the image is unreadable or not student work, return:
{"score": null, "feedback": "Could not analyse this image — please check the upload.", "error_patterns": []}`

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
          { type: 'text', text: prompt }
        ]
      }]
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: null, feedback: raw, error_patterns: [] }

    return NextResponse.json({
      score: parsed.score,
      feedback: parsed.feedback,
      error_patterns: parsed.error_patterns || [],
      image_url: imageUrl,
    })
  } catch (err) {
    console.error('Analysis error:', err)
    return NextResponse.json({
      score: null,
      feedback: 'AI analysis failed. You can add notes manually.',
      error_patterns: [],
      image_url: imageUrl,
    })
  }
}
