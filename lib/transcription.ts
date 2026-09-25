// Function 5, Phase A2 — speech-to-text + diarisation via ElevenLabs Scribe.
//
// Claude cannot take audio (confirmed against the Anthropic API reference), so an
// external transcription service is mandatory here. Scribe returns a per-word
// `speaker_id` when diarize=true; we group consecutive words into per-speaker turns
// so the assessment engine (lib/speakingAssessment.ts) can read "who said what".
//
// API: POST https://api.elevenlabs.io/v1/speech-to-text (multipart), header xi-api-key.
// Response: { text, language_code, words: [{ text, type, speaker_id, start, end }] }.

import type { SpeakingTurn } from './speakingAssessment'

const STT_URL = 'https://api.elevenlabs.io/v1/speech-to-text'
const MODEL_ID = 'scribe_v2'

export interface DiarisedTranscript {
  turns: SpeakingTurn[] // speaker = raw diarisation label, e.g. "speaker_0"
  speakerIds: string[]  // distinct labels, in order of first appearance
  fullText: string
  languageCode?: string
}

interface ScribeWord {
  text: string
  type?: string
  speaker_id?: string
  start?: number
  end?: number
}
interface ScribeResponse {
  text?: string
  language_code?: string
  words?: ScribeWord[]
}

export async function transcribeDiarised(
  audio: Blob,
  opts: { numSpeakers?: number; languageCode?: string } = {},
): Promise<DiarisedTranscript> {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) {
    throw new Error('ELEVENLABS_API_KEY is not set. Add it in the Vercel project settings before using Speaking.')
  }

  const form = new FormData()
  form.append('file', audio, 'recording.webm')
  form.append('model_id', MODEL_ID)
  form.append('diarize', 'true')
  form.append('timestamps_granularity', 'word')
  if (opts.numSpeakers) form.append('num_speakers', String(opts.numSpeakers))
  if (opts.languageCode) form.append('language_code', opts.languageCode)

  const res = await fetch(STT_URL, {
    method: 'POST',
    headers: { 'xi-api-key': key },
    body: form,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Transcription failed (${res.status}). ${detail.slice(0, 300)}`)
  }

  const data = (await res.json()) as ScribeResponse
  const words = data.words ?? []

  // Group consecutive words by speaker into turns.
  const turns: SpeakingTurn[] = []
  const seen: string[] = []
  let current: SpeakingTurn | null = null
  for (const w of words) {
    // Keep words and the spacing between them; skip tagged audio events like "(laughter)".
    if (w.type && w.type !== 'word' && w.type !== 'spacing') continue
    const spk = w.speaker_id || 'speaker_0'
    if (!seen.includes(spk)) seen.push(spk)
    if (!current || current.speaker !== spk) {
      current = { speaker: spk, text: '' }
      turns.push(current)
    }
    current.text += w.text
  }
  for (const t of turns) t.text = t.text.replace(/\s+/g, ' ').trim()

  return {
    turns: turns.filter((t) => t.text.length > 0),
    speakerIds: seen,
    fullText: data.text ?? turns.map((t) => t.text).join(' '),
    languageCode: data.language_code,
  }
}
