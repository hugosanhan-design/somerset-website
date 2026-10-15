import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { uploadWorkImage } from '@/lib/blob'
import { parseImageUrls } from '@/lib/workImages'
import { getDb } from '@/lib/db'

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

// Marking a registered test: the model gets the paper (reference), the teacher-confirmed
// answer key as text, and the student's transcription. Objective items are marked
// strictly against the key, one criteria_check row per question.
function buildTestPrompt(title: string, level: string, keyText: string, keyConfirmed: boolean, transcription: string): string {
  return `You are an experienced English language teacher at Somerset Language Centre, Valencia, Spain, marking the end-of-unit test "${title}". The student's approximate CEFR level is ${level}.

The first images or documents are the TEST PAPER (reference only: the questions). The later images are the STUDENT'S ANSWER PAGES.

OFFICIAL ANSWER KEY${keyConfirmed ? ' (confirmed by the teacher)' : ' (NOT yet confirmed by the teacher: say so in the feedback)'}:
"""
${keyText}
"""

STUDENT TRANSCRIPTION (exactly as written):
"""
${transcription || '(not available: read the answer pages)'}
"""

Rules:
- Mark every objective question one by one against the key. Accept an alternative only if the key lists it. If spelling is clearly part of what is tested, a misspelt answer is wrong.
- If the student's answer for an item cannot be read, mark it not met with evidence "unreadable". Never guess.
- Do not give marks for Writing or Speaking unless the key states criteria; say in the feedback that those parts need the teacher.
- Score = round(100 x marks earned / total objective marks).

Respond in JSON only:
{"score": <0-100>, "feedback": "<3-5 sentences to the teacher: which sections went well or badly and the pattern behind the mistakes>", "error_patterns": ["<p1>", ...], "criteria_check": [{"criterion": "<question number and section>", "met": <bool>, "evidence": "student: <answer> | key: <answer>"}]}`
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
  // Multi-page scans: the queue sends every page, in order, as a JSON array.
  const existingImageUrls = parseImageUrls({ image_url: existingImageUrl, image_urls: (formData.get('imageUrls') as string) || '[]' })
  const directText = (formData.get('text') as string) || ''
  const workType = (formData.get('type') as string) || 'class_exercise'
  const level = (formData.get('level') as string) || 'B1'
  const title = (formData.get('title') as string) || ''
  const criteriaRaw = (formData.get('criteria') as string) || ''
  const assessmentId = (formData.get('assessmentId') as string) || ''
  const criteriaList = criteriaRaw
    .split('\n')
    .map(c => c.trim())
    .filter(Boolean)

  if (!imageFile && existingImageUrls.length === 0 && !directText) {
    return NextResponse.json({ error: 'No image or text provided' }, { status: 400 })
  }

  // Text-only path — teacher pasted the student's typed work; skip image upload and OCR.
  if (directText && !imageFile && existingImageUrls.length === 0) {
    const transcription = directText
    const hasCriteria = criteriaList.length > 0
    const prompt = buildPrompt(workType, level, title, transcription, criteriaList, hasCriteria)
    try {
      const response = await client.messages.create({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = response.content.find(b => b.type === 'text')?.text ?? ''
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

  // Collect every page as base64. A fresh upload is a single page; a queued scan can
  // have many, and they are read in order so a 3-page exam is graded as one piece of work.
  let imageUrl: string
  const pages: { data: string; mediaType: MediaType }[] = []

  if (imageFile) {
    // Persist to Blob storage — never fs.writeFileSync (Vercel's filesystem doesn't
    // survive a redeploy or cold start; see lib/blob.ts).
    imageUrl = await uploadWorkImage(imageFile)
    pages.push({ data: Buffer.from(await imageFile.arrayBuffer()).toString('base64'), mediaType: mediaTypeFor(imageFile.name) })
  } else {
    imageUrl = existingImageUrls[0]
    for (const url of existingImageUrls) {
      const res = await fetch(url)
      if (!res.ok) {
        return NextResponse.json({ error: 'Could not fetch the stored image' }, { status: 502 })
      }
      pages.push({ data: Buffer.from(await res.arrayBuffer()).toString('base64'), mediaType: mediaTypeFor(url) })
    }
  }

  // Transcribe each page as its own call, in parallel, then join with page markers.
  let transcription = ''
  try {
    const texts = await Promise.all(pages.map(p => transcribe(p.data, p.mediaType)))
    transcription = pages.length === 1
      ? texts[0]
      : texts.map((t, i) => `--- Page ${i + 1} ---\n${t}`).join('\n\n')
  } catch (err) {
    console.error('Transcription error:', err)
    // Fall through with an empty transcription — grading still runs off the images
    // directly below, it just loses the "check the exact words" guarantee.
  }

  // Registered test? Then mark against its key, with the paper shown as reference.
  let prompt: string
  let paperBlocks: Anthropic.ContentBlockParam[] = []
  let testMode = false
  const loaded = assessmentId
    ? await (await getDb()).prepare('SELECT title, test_urls, key_text, key_confirmed FROM assessments WHERE id = ?').get(assessmentId) as
        { title: string; test_urls: string; key_text: string; key_confirmed: number } | undefined
    : undefined
  if (loaded && loaded.key_text.trim()) {
    testMode = true
    prompt = buildTestPrompt(loaded.title, level, loaded.key_text, loaded.key_confirmed === 1, transcription)
    try {
      for (const url of JSON.parse(loaded.test_urls || '[]') as string[]) {
        const r = await fetch(url)
        if (!r.ok) continue
        const data = Buffer.from(await r.arrayBuffer()).toString('base64')
        const ext = (url.split('?')[0].split('.').pop() || '').toLowerCase()
        if (ext === 'pdf') paperBlocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } })
        else paperBlocks.push({ type: 'image', source: { type: 'base64', media_type: ext === 'png' ? 'image/png' : 'image/jpeg', data } })
      }
    } catch { paperBlocks = [] }
  } else {
    const hasCriteria = criteriaList.length > 0
    prompt = buildPrompt(workType, level, title, transcription, criteriaList, hasCriteria)
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: testMode ? 3000 : 900,
      messages: [{
        role: 'user',
        content: [
          ...paperBlocks,
          ...pages.map(p => ({ type: 'image' as const, source: { type: 'base64' as const, media_type: p.mediaType, data: p.data } })),
          { type: 'text' as const, text: prompt }
        ]
      }]
    })

    const raw = response.content.find(b => b.type === 'text')?.text ?? ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: null, feedback: raw, error_patterns: [], criteria_check: [] }

    // Belt-and-braces: never trust the model's arithmetic blindly. If it reported a
    // failed criterion but still gave a score over 50, clamp it here too.
    const criteriaCheck: CriteriaCheck[] = parsed.criteria_check || []
    const anyCriterionFailed = criteriaCheck.some(c => c.met === false)
    let score = parsed.score
    if (!testMode && anyCriterionFailed && typeof score === 'number' && score > 50) {
      score = 50
    }

    return NextResponse.json({
      score,
      feedback: parsed.feedback,
      error_patterns: parsed.error_patterns || [],
      criteria_check: criteriaCheck,
      transcription,
      image_url: imageUrl,
      marked_against: testMode ? loaded!.title : null,
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
