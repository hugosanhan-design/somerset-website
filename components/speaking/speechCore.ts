'use client'
// Shared speech helpers for the reusable speaking components (DialogueReader, WordCoachPanel).
// Same techniques as the PET SpeakingStudio: the browser streams 16 kHz PCM straight to Azure
// with a short-lived token from /api/courses/speech-token; nothing passes through our server.

import type { SpeakingLang } from '@/lib/courses/speakingLang'

export type Student = { name: string; code: string }

// Letters include accented Latin ones, so Spanish words (está, años) stay whole.
export const clean = (w: string) => w.toLowerCase().replace(/[^a-zà-öø-ÿ']/g, '')
export const norm = (t: string) => t.toLowerCase().replace(/[^a-zà-öø-ÿ']+/g, ' ').trim()

let tokenCache: { token: string; region: string; at: number } | null = null

// One Azure token lasts ten minutes; reuse it so a whole dialogue costs one session.
export async function getSpeechToken(student: Student | null) {
  if (tokenCache && Date.now() - tokenCache.at < 8 * 60_000) return tokenCache
  const r = await fetch('/api/courses/speech-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(student) })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.error || 'Speaking practice is unavailable right now.')
  tokenCache = { token: d.token, region: d.region, at: Date.now() }
  return tokenCache
}

// Float audio at any sample rate → 16 kHz 16-bit mono PCM, the format Azure expects.
export function toPcm16(input: Float32Array, rate: number): Int16Array {
  const ratio = rate / 16000
  const len = Math.floor(input.length / ratio)
  const out = new Int16Array(len)
  for (let i = 0; i < len; i++) {
    const a = Math.floor(i * ratio), b = Math.max(a + 1, Math.floor((i + 1) * ratio))
    let sum = 0
    for (let j = a; j < b && j < input.length; j++) sum += input[j]
    const v = Math.max(-1, Math.min(1, sum / (b - a)))
    out[i] = v < 0 ? v * 0x8000 : v * 0x7fff
  }
  return out
}

// The exact audio Azure scored, as a playable WAV, so the student can hear themselves.
export function wavUrl(chunks: Int16Array[]): string {
  const n = chunks.reduce((a, c) => a + c.length, 0)
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const tag = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)) }
  tag(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); tag(8, 'WAVE'); tag(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  tag(36, 'data'); v.setUint32(40, n * 2, true)
  let o = 44
  for (const c of chunks) for (let i = 0; i < c.length; i++, o += 2) v.setInt16(o, c[i], true)
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

// A short stretch of the line around the word: a word on its own gives the recogniser
// nothing to go on; in a phrase it is recognised far more reliably (PET calibration, Oct 2026).
export function phraseAround(word: string, text: string): string {
  const target = norm(word)
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text]
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/)
    const k = words.findIndex(w => norm(w) === target)
    if (k < 0) continue
    const chunk = words.length <= 9 ? words : words.slice(Math.max(0, k - 3), k + 4)
    return chunk.join(' ').replace(/[.!?,;:¿¡]+$/, '').replace(/^[¿¡]+/, '')
  }
  return word
}

// Which recognised word lines up with the target word? (Word-level edit-distance alignment.)
export function alignedWord(expected: string[], heard: string[], t: number): string | null {
  const n = expected.length, m = heard.length
  const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1))
  let i = n, j = m
  while (i > 0) {
    if (j > 0 && d[i][j] === d[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1)) {
      if (i - 1 === t) return heard[j - 1]
      i--; j--
    } else if (d[i][j] === d[i - 1][j] + 1) {
      if (i - 1 === t) return null
      i--
    } else j--
  }
  return null
}

export function levenshtein(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

// Same word, allowing one slip in longer words (recogniser spelling, plural -s).
export function sameWord(a: string, b: string) {
  if (!a || !b) return false
  if (a === b) return true
  const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (strip(a) === strip(b)) return true
  return Math.min(a.length, b.length) >= 5 && levenshtein(strip(a), strip(b)) <= 1
}

// Play a URL to the end on one element, so the next step only starts when the sound has stopped
// (the microphone must never open while the speaker is still talking).
export function playToEnd(el: HTMLAudioElement, url: string): Promise<void> {
  return new Promise(resolve => {
    let done = false
    const finish = () => { if (done) return; done = true; el.onended = null; el.onerror = null; resolve() }
    el.onended = finish
    el.onerror = finish
    el.src = url
    el.play().catch(finish)
    // Safety net in case "ended" never fires (backgrounded tab, broken file).
    el.onloadedmetadata = () => { const s = isFinite(el.duration) ? el.duration : 15; setTimeout(finish, (s + 2) * 1000) }
  })
}

// Azure neural voice, rendered to an MP3 blob and played on the given element. Used only for
// text we cannot record in advance (a single word in the coach). Recorded audio always wins.
export async function neuralUrl(text: string, lang: SpeakingLang, student: Student | null, rate = 0.9): Promise<string | null> {
  try {
    if (!student) return null
    const { token, region } = await getSpeechToken(student)
    const sdk = await import('microsoft-cognitiveservices-speech-sdk')
    const cfg = sdk.SpeechConfig.fromAuthorizationToken(token, region)
    cfg.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3
    const synth = new sdk.SpeechSynthesizer(cfg, null as never)   // null = return the audio, don't play it
    const r = rate <= 0.4 ? 'x-slow' : rate <= 0.7 ? 'slow' : 'medium'
    const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang.locale}"><voice name="${lang.voice}"><prosody rate="${r}">${esc}</prosody></voice></speak>`
    const data = await new Promise<ArrayBuffer | null>(resolve => {
      synth.speakSsmlAsync(ssml, res => { synth.close(); resolve(res.audioData && res.audioData.byteLength ? res.audioData : null) }, () => { synth.close(); resolve(null) })
    })
    return data ? URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' })) : null
  } catch { return null }
}
