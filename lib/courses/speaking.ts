// Turns Azure pronunciation-assessment results into what a student sees. Research
// (2026-10-04): scores compare learners with native speakers, so students get flagged
// words and plain labels, never raw numbers.

export type WordScore = { word: string; accuracy: number; error: string }
export type Segment = { text: string; words: WordScore[]; accuracy: number; fluency: number; durationSec: number }

type AzurePhoneme = { Phoneme?: string; PronunciationAssessment?: { AccuracyScore?: number } }
type AzureWord = { Word?: string; AccuracyScore?: number; ErrorType?: string; PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string }; Phonemes?: AzurePhoneme[] }
type AzureJson = {
  DisplayText?: string
  Duration?: number
  NBest?: { Display?: string; AccuracyScore?: number; FluencyScore?: number; PronunciationAssessment?: { AccuracyScore?: number; FluencyScore?: number }; Words?: AzureWord[] }[]
}

function wordAccuracy(w: AzureWord): number {
  const azureScore = Number(w.PronunciationAssessment?.AccuracyScore ?? w.AccuracyScore ?? 100)
  const phonemes = (w.Phonemes ?? [])
    .map(p => p.PronunciationAssessment?.AccuracyScore)
    .filter((s): s is number => typeof s === 'number')
  if (phonemes.length >= 2) {
    const avg = phonemes.reduce((a, b) => a + b, 0) / phonemes.length
    return Math.round(Math.min(azureScore, avg))
  }
  return azureScore
}

// One recognised phrase from the SDK's JSON result (SpeechServiceResponse_JsonResult).
export function parseSegment(json: string): Segment | null {
  let d: AzureJson
  try { d = JSON.parse(json) } catch { return null }
  const best = d.NBest?.[0]
  if (!best) return null
  const pa = best.PronunciationAssessment ?? best
  const words = (best.Words ?? []).map(w => ({
    word: String(w.Word ?? ''),
    accuracy: wordAccuracy(w),
    error: String(w.PronunciationAssessment?.ErrorType ?? w.ErrorType ?? 'None'),
  })).filter(w => w.word)
  return {
    text: String(best.Display ?? d.DisplayText ?? ''),
    words,
    accuracy: Number(pa.AccuracyScore ?? 0),
    fluency: Number(pa.FluencyScore ?? 0),
    durationSec: (d.Duration ?? 0) / 10_000_000,
  }
}

export type SpeakingSummary = {
  transcript: string
  wordCount: number
  seconds: number
  accuracy: number      // word-weighted, kept for the teacher and for "better than last time"
  fluency: number
  fluencyLabel: string
  practise: string[]    // words to practise, most unclear first
}

const SKIP = new Set(['a', 'an', 'the', 'i', 'to', 'of', 'and', 'in', 'on', 'at', 'is', 'it'])

export function summarise(segments: Segment[]): SpeakingSummary {
  const words = segments.flatMap(s => s.words)
  const n = words.length || 1
  const weighted = (k: 'accuracy' | 'fluency') =>
    Math.round(segments.reduce((a, s) => a + s[k] * (s.words.length || 1), 0) / segments.reduce((a, s) => a + (s.words.length || 1), 0) || 0)
  const fluency = weighted('fluency')
  const unclear = words
    .filter(w => (w.error === 'Mispronunciation' || w.accuracy < 60) && !SKIP.has(w.word.toLowerCase()))
    .sort((a, b) => a.accuracy - b.accuracy)
  const practise = Array.from(new Set(unclear.map(w => w.word.toLowerCase()))).slice(0, 5)
  return {
    transcript: segments.map(s => s.text).join(' ').trim(),
    wordCount: words.length,
    seconds: Math.round(segments.reduce((a, s) => a + s.durationSec, 0)),
    accuracy: segments.length ? weighted('accuracy') : 0,
    fluency,
    fluencyLabel: fluency >= 80 ? 'Smooth and steady' : fluency >= 60 ? 'A few long pauses' : 'Lots of pauses: that’s normal at first',
    practise: n ? practise : [],
  }
}
