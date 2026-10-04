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

interface CriteriaCheck {
  criterion: string
  met: boolean
  evidence: string
}

// Step 1 — transcribe the photo before scoring anything. A vision model asked to
// "score this AND read the handwriting AND check the grammar" in one pass tends to
// judge the page holistically ("looks like decent B1 effort") instead of checking
// specific words. Transcribing first, as its own call, forces an exact text to check
// facts against — and gives the teacher something to audit the OCR against, since a
// misread word ("Im" read as "I'm") would otherwise silently clear a criterion.
async function transcribe(imageData: string, mediaType: MediaType): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
        {
          type: 'text',
          text: 'Transcribe all the handwritten or printed text in this image exactly as written — errors, missing words, crossings-out, and all. Do not correct or complete anything. Preserve paragraph/line breaks. Return only the transcribed text with no commentary.',
        },
      ],
    }],
  })
  const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
  return textBlock?.text.trim() || ''
}

// Two callers use this route:
//  1. The old one-step upload (`/students/[id]/upload`) — sends a fresh `image` file,
//     gets score+feedback+image_url back immediately.
//  2. The correction queue (`/correct-queue/[entryId]`) — sends `imageUrl` for a photo
//     that was already scanned from the phone via /api/work-entries/quick and is sitting
//     at status='pending'; this route re-fetches it from Blob storage to analyse it,
//     rather than asking the teacher to re-upload a photo that's already saved.
//
// `criteria` (optional, newline-separated) is what THIS specific exercise required —
// e.g. "Uses 'I' as the subject\nUses present continuous (-ing)\nIncludes a future time
// reference". Without it, this route has no way to know what the exercise was testing
// and can only give a holistic CEFR-ish impression, which is how a sentence missing its
// subject and its verb form still scored high before (CORRECTION 28 Sep 2026: Carla /
// "My Plan"). When criteria are given, the score is capped hard if any of them fail —
// fluency and effort never buy back a missing required structure.
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const imageFile = formData.get('image') as File | null
  const existingImageUrl = (formData.get('imageUrl') as string) || ''
  const workType = (formData.get('type') as string) || 'class_exercise'
  const level = (formData.get('level') as string) || 'B1'
  const title = (formData.get('title') as string) || ''
  const criteriaRaw = (formData.get('criteria') as string) || ''
  const criteriaList = criteriaRaw
    .split('\n')
    .map(c => c.trim())
    .filter(Boolean)

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

  let transcription = ''
  try {
    transcription = await transcribe(imageData, mediaType)
  } catch (err) {
    console.error('Transcription error:', err)
    // Fall through with an empty transcription — grading still runs off the image
    // directly below, it just loses the "check the exact words" guarantee.
  }

  const hasCriteria = criteriaList.length > 0

  const prompt = hasCriteria
    ? `You are an experienced English language teacher at Somerset Language Centre, Valencia, Spain.
You are checking a photo of student work: ${WORK_TYPE_LABELS[workType] || workType}.
The student's approximate CEFR level is ${level}.
${title ? `Exercise: "${title}"` : ''}

TRANSCRIPTION (produced separately by OCR from the photo — treat this as the authoritative text; use the photo only to resolve anything the transcription leaves unclear):
"""
${transcription || '(transcription failed — read directly from the photo)'}
"""

REQUIRED CRITERIA for this exercise — check each one individually against the transcription above:
${criteriaList.map((c, i) => `${i + 1}. ${c}`).join('\n')}

For EACH criterion, decide met (true/false) strictly from what the student actually wrote — not what they probably meant, not what would be needed to make the sentence work. A missing subject, a missing auxiliary, or a wrong verb form makes that criterion false even if the rest of the sentence reads fluently. Quote the exact words (or note their absence) as evidence.

Then give:
1. A SCORE out of 100. HARD RULE: if ANY required criterion is false, the score must be 50 or lower, however fluent or well-formed the rest of the writing is — this task was specifically testing those criteria, not general fluency. Only if ALL criteria are met should the score reflect overall quality (60 = adequate for level, 75 = good, 90+ = excellent).
2. A SHORT FEEDBACK paragraph (3-5 sentences) written directly to the teacher — name which criteria failed and why, in plain terms, before any general comment on fluency.
3. ERROR PATTERNS: 2-4 recurring issues (e.g. "missing subject pronoun", "verb tense consistency"). Include the failed criteria here too, phrased as error patterns.

Respond in JSON only, with this exact structure:
{
  "score": <number 0-100>,
  "feedback": "<teacher-facing paragraph>",
  "error_patterns": ["<pattern 1>", "<pattern 2>", ...],
  "criteria_check": [{"criterion": "<criterion text>", "met": <true|false>, "evidence": "<exact quote or 'not present'>"}]
}

If the image/transcription is unreadable or not student work, return:
{"score": null, "feedback": "Could not analyse this image — please check the upload.", "error_patterns": [], "criteria_check": []}`
    : `You are an experienced English language teacher at Somerset Language Centre, Valencia, Spain.
You are reviewing a photo of student work: ${WORK_TYPE_LABELS[workType] || workType}.
The student's approximate CEFR level is ${level}.
${title ? `Work title: "${title}"` : ''}

No specific grading criteria were given for this exercise, so this can only be a general impression of the writing — it is NOT a check against what the exercise was meant to practise. Say so plainly in the feedback rather than implying a more precise check was done.

TRANSCRIPTION (produced separately by OCR from the photo):
"""
${transcription || '(transcription failed — read directly from the photo)'}
"""

Please analyse the student's work carefully and provide:

1. A SCORE out of 100 (where 60 = adequate for level, 75 = good, 90+ = excellent)
2. A SHORT FEEDBACK paragraph (3-5 sentences) written directly to the teacher — constructive, specific, level-aware. Open by noting no specific criteria were set for this task. Mention what the student does well and what to work on.
3. ERROR PATTERNS: List 2–4 recurring issues you can identify (e.g. "article use", "verb tense consistency", "spelling"). If the work is excellent with no clear patterns, return an empty list.

Respond in JSON only, with this exact structure:
{
  "score": <number 0-100>,
  "feedback": "<teacher-facing paragraph>",
  "error_patterns": ["<pattern 1>", "<pattern 2>", ...],
  "criteria_check": []
}

If the image/transcription is unreadable or not student work, return:
{"score": null, "feedback": "Could not analyse this image — please check the upload.", "error_patterns": [], "criteria_check": []}`

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 900,
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
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: null, feedback: raw, error_patterns: [], criteria_check: [] }

    // Belt-and-braces: never trust the model's arithmetic blindly. If it reported a
    // failed criterion but still gave a score over 50, clamp it here too.
    const criteriaCheck: CriteriaCheck[] = parsed.criteria_check || []
    const anyCriterionFailed = criteriaCheck.some(c => c.met === false)
    let score = parsed.score
    if (anyCriterionFailed && typeof score === 'number' && score > 50) {
      score = 50
    }

    return NextResponse.json({
      score,
      feedback: parsed.feedback,
      error_patterns: parsed.error_patterns || [],
      criteria_check: criteriaCheck,
      transcription,
      image_url: imageUrl,
    })
  } catch (err) {
    console.error('Analysis error:', err)
    return NextResponse.json({
      score: null,
      feedback: 'AI analysis failed. You can add notes manually.',
      error_patterns: [],
      criteria_check: [],
      transcription,
      image_url: imageUrl,
    })
  }
}
