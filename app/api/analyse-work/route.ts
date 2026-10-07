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

function buildPrompt(
  workType: string, level: string, title: string,
  transcription: string, criteriaList: string[], hasCriteria: boolean,
): string {
  if (hasCriteria) {
    return `You are an experienced English language teacher at Somerset Language Centre, Valencia, Spain.
You are checking student work: ${WORK_TYPE_LABELS[workType] || workType}.
The student's approximate CEFR level is ${level}.
${title ? `Exercise: "${title}"` : ''}

STUDENT TEXT:
"""
${transcription || '(text not available)'}
"""

REQUIRED CRITERIA for this exercise — check each one individually:
${criteriaList.map((c, i) => `${i + 1}. ${c}`).join('\n')}

For EACH criterion, decide met (true/false) strictly from what the student actually wrote. Quote exact words (or note absence) as evidence.

Then give:
1. A SCORE out of 100. HARD RULE: if ANY criterion is false, score must be 50 or lower. Only if ALL are met should score reflect overall quality (60 = adequate, 75 = good, 90+ = excellent).
2. A SHORT FEEDBACK paragraph (3-5 sentences) written to the teacher — name which criteria failed and why.
3. ERROR PATTERNS: 2-4 recurring issues. Include failed criteria phrased as error patterns.

Respond in JSON only:
{"score": <0-100>, "feedback": "<paragraph>", "error_patterns": ["<p1>", ...], "criteria_check": [{"criterion": "<text>", "met": <bool>, "evidence": "<quote or 'not present'>"}]}

If text is unreadable: {"score": null, "feedback": "Could not analyse — please check the upload.", "error_patterns": [], "criteria_check": []}`
  }
  return `You are an experienced English language teacher at Somerset Language Centre, Valencia, Spain.
You are reviewing student work: ${WORK_TYPE_LABELS[workType] || workType}.
The student's approximate CEFR level is ${level}.
${title ? `Work title: "${title}"` : ''}

No specific grading criteria were given, so this is a general impression only — say so plainly in the feedback.

STUDENT TEXT:
"""
${transcription || '(text not available)'}
"""

Provide:
1. A SCORE out of 100 (60 = adequate, 75 = good, 90+ = excellent)
2. A SHORT FEEDBACK paragraph (3-5 sentences) to the teacher — constructive, specific, level-aware. Note that no specific criteria were set.
3. ERROR PATTERNS: 2-4 recurring issues. Empty list if the work is excellent.

Respond in JSON only:
{"score": <0-100>, "feedback": "<paragraph>", "error_patterns": ["<p1>", ...], "criteria_check": []}

If text is unreadable: {"score": null, "feedback": "Could not analyse — please check the upload.", "error_patterns": [], "criteria_check": []}`
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
  const directText = (formData.get('text') as string) || ''
  const workType = (formData.get('type') as string) || 'class_exercise'
  const level = (formData.get('level') as string) || 'B1'
  const title = (formData.get('title') as string) || ''
  const criteriaRaw = (formData.get('criteria') as string) || ''
  const criteriaList = criteriaRaw
    .split('\n')
    .map(c => c.trim())
    .filter(Boolean)

  if (!imageFile && !existingImageUrl && !directText) {
    return NextResponse.json({ error: 'No image or text provided' }, { status: 400 })
  }

  // Text-only path — teacher pasted the student's typed work; skip image upload and OCR.
  if (directText && !imageFile && !existingImageUrl) {
    const transcription = directText
    const hasCriteria = criteriaList.length > 0
    const prompt = buildPrompt(workType, level, title, transcription, criteriaList, hasCriteria)
    try {
      const response = await client.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: null, feedback: raw, error_patterns: [], criteria_check: [] }
      const criteriaCheck: CriteriaCheck[] = parsed.criteria_check || []
      const anyCriterionFailed = criteriaCheck.some(c => c.met === false)
      let score = parsed.score
      if (anyCriterionFailed && typeof score === 'number' && score > 50) score = 50
      return NextResponse.json({ score, feedback: parsed.feedback, error_patterns: parsed.error_patterns || [], criteria_check: criteriaCheck, transcription, image_url: '' })
    } catch (err) {
      console.error('Analysis error (text-only):', err)
      return NextResponse.json({ score: null, feedback: 'AI analysis failed. You can add notes manually.', error_patterns: [], criteria_check: [], transcription, image_url: '' })
    }
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
  const prompt = buildPrompt(workType, level, title, transcription, criteriaList, hasCriteria)

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
