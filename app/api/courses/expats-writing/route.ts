import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { lookupStudent } from '@/lib/studentAccess'
import { WRITING_TASKS_M1 } from '@/lib/courses/spanishExpats'

export const runtime = 'nodejs'
export const maxDuration = 60

// PUBLIC (api/courses allow-list), signed-in students only. Corrects a short real message
// in Spanish (email / WhatsApp) from an English-speaking A1-A2 expat and returns a version
// ready to send. Each fix becomes a personal Repaso item on the client.

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a warm, precise Spanish teacher at Somerset Language Centre in Valencia. Your student is an English-speaking adult who has just moved to Spain (CEFR A1 to A2). They have written a SHORT real message in Spanish (an email or a WhatsApp) that they could actually send this week. Return strict JSON only.

YOUR JOB: correct what matters for a real message, then give them a version ready to send.

WHAT TO FIX (in this order of importance, at most 6 fixes):
1. Anything that stops a Spanish reader understanding the message.
2. Wrong verb forms (persons, poder + infinitive: "¿Puedo pago?" → "¿Puedo pagar?"), ser/estar.
3. Gender and agreement, missing articles Spanish needs ("necesito NIE" → "necesito el NIE").
4. Anglicisms and false friends ("aplicar para el NIE" → "solicitar el NIE", "tomar una cita" → "pedir cita").
5. Register: a message to an office or a landlord must be polite. Missing greeting or closing, or something that sounds rude or too blunt.
If there are more than 6 problems, fix the 6 that matter most and silently correct the rest in "corrected".

DO NOT list as fixes: missing accent marks or ¿ ¡ (fix them silently in "corrected"), unless the accent changes the meaning (esta / está). Tú vs usted is not an error in itself; only fix a verb that does not match the form they chose. Never invent errors. Never add new ideas to their message.

RULES:
- Explanations in plain English, British spelling, one short sentence each.
- Never use dashes (— or –): use commas, colons or full stops.
- Never use the words "test", "exam", "score", "grade", "fail".
- Praise must be true and small.

FIELDS:
- "fixes": [{ "sentence": the student's sentence copied exactly from their text; "original": the exact wrong word(s), which MUST appear verbatim inside "sentence"; "fix": the corrected Spanish; "why": one plain English sentence }]
- "corrected": the whole message corrected and ready to send. Keep their ideas, order and voice; add only a greeting or closing if missing. Natural Spanish from Spain. Keep it short.
- "missing": the task points (from the list given) that the message does not cover yet, copied as given. Empty array if all covered.
- "level": "below" if a reader would struggle to understand it; "starting" if understandable with several errors; "solid" if clear with small slips.
- "verdict": one honest English sentence (max 20 words) on the message and the ONE thing to improve.
- "praise": one short English sentence on something they really did well.

Return ONLY valid JSON:
{"fixes":[{"sentence":"...","original":"...","fix":"...","why":"..."}],"corrected":"...","missing":["..."],"level":"starting","verdict":"...","praise":"..."}`

type Fix = { sentence: string; original: string; fix: string; why: string }

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; code?: string; taskId?: string; text?: string }
  if (!lookupStudent(String(body.name || ''), String(body.code || ''))) {
    return NextResponse.json({ error: "Sign in at Student's Corner first." }, { status: 401 })
  }
  const task = WRITING_TASKS_M1.find(t => t.id === body.taskId)
  const text = String(body.text || '').trim().slice(0, 2000)
  if (!task) return NextResponse.json({ error: 'Unknown task.' }, { status: 400 })
  if (text.split(/\s+/).length < 8) return NextResponse.json({ error: 'Write a little more first: three or four short sentences.' }, { status: 400 })

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 3000,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Task: ${task.situation}\nWritten to: ${task.to} (${task.channel})\nTask points: ${JSON.stringify(task.include)}\n\nThe student's message:\n"""\n${text}\n"""\n\nGive the JSON now.` }],
    })
    const raw = msg.content.find((c): c is Anthropic.TextBlock => c.type === 'text')?.text || ''
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '{}')
    // Keep only fixes we can find in their own text: these become Repaso items.
    const fixes: Fix[] = (Array.isArray(json.fixes) ? json.fixes : [])
      .filter((f: Fix) => f && typeof f.sentence === 'string' && typeof f.original === 'string' && typeof f.fix === 'string'
        && f.original && f.sentence.includes(f.original) && text.includes(f.sentence))
      .slice(0, 6)
    return NextResponse.json({
      fixes,
      corrected: String(json.corrected || text).slice(0, 3000),
      missing: Array.isArray(json.missing) ? json.missing.map(String).filter((m: string) => task.include.includes(m)) : [],
      level: ['below', 'starting', 'solid'].includes(json.level) ? json.level : 'starting',
      verdict: String(json.verdict || ''),
      praise: String(json.praise || 'You wrote a real message in Spanish.'),
    })
  } catch (e) {
    console.error('[expats-writing]', e)
    return NextResponse.json({ error: 'Correction is taking a break. Your text is still here: try again in a minute.' }, { status: 502 })
  }
}
