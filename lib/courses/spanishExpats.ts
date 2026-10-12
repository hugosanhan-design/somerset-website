import type { IconName } from '@/components/SomersetIcon'
// Spanish for Expats — Module 1: The First Month
// Content: NIE/TIE, empadronamiento, bank, key oficina phrases, poder + infinitive.
// Item ids are stored in students' saved progress, so never rename an existing id.

export const COURSE_ID = 'sexp'
export const MODULE_ID = 'm1'

// ─── Vocabulary ───────────────────────────────────────────────────────────────

export const VOCAB_M1: {
  id: string; icon: IconName; answer: string; clue: string; note: string
}[] = [
  {
    id: 'nie', icon: 'nie',
    answer: 'NIE',
    clue: 'The number every foreigner needs to work, open a bank account or sign a contract in Spain.',
    note: 'Número de Identidad de Extranjero',
  },
  {
    id: 'tie', icon: 'tie',
    answer: 'TIE',
    clue: 'The residence card for non-EU residents (including Brits since 2021). You give your fingerprints to get it.',
    note: 'Tarjeta de Identidad de Extranjero',
  },
  {
    id: 'empadronamiento', icon: 'padron',
    answer: 'empadronamiento',
    clue: 'The act of registering your address with the local council. Required for almost everything official.',
    note: 'empadronarse = to register; certificado de empadronamiento = the proof',
  },
  {
    id: 'cita-previa', icon: 'calendar',
    answer: 'cita previa',
    clue: 'An advance appointment — booked online through the government website. You cannot simply walk in.',
    note: 'cita = appointment; previa = prior/in advance',
  },
  {
    id: 'extranjeria', icon: 'government',
    answer: 'extranjería',
    clue: 'The government office that decides residence and work permits. (The NIE and TIE themselves are done at the police station.)',
    note: 'From extranjero/a = foreigner',
  },
  {
    id: 'gestor', icon: 'documents',
    answer: 'gestor',
    clue: 'An administrative agent who handles paperwork on your behalf. Worth every euro in your first year.',
    note: 'gestoría = the office; gestor/a = the person',
  },
  {
    id: 'sede-electronica', icon: 'device',
    answer: 'sede electrónica',
    clue: 'The official government online portal — where you book appointments and submit forms.',
    note: 'Literally: electronic seat/office. Full of frustration but unavoidable.',
  },
  {
    id: 'certificado-digital', icon: 'digital',
    answer: 'certificado digital',
    clue: 'A digital certificate that lets you sign documents and access government services online.',
    note: 'Essential for taxes, social security, and almost everything after year 1.',
  },
  {
    id: 'padron', icon: 'register',
    answer: 'padrón',
    clue: 'The municipal register of residents. Being on this list ("empadronado") unlocks most services.',
    note: 'Certificado de empadronamiento = printed proof from the Ayuntamiento',
  },
  {
    id: 'numero-referencia', icon: 'digits',
    answer: 'número de referencia',
    clue: 'The reference number the website gives you when you book an appointment. Screenshot it immediately.',
    note: 'You will hear "su número de referencia" the moment you arrive at any government office.',
  },
  {
    id: 'tasa', icon: 'money',
    answer: 'tasa',
    clue: 'The official fee you pay for a government service — €9.84 for the NIE, €16.08 for a first TIE. Paid before the appointment.',
    note: 'modelo 790 código 012 = the police fee form; pay at a bank or online',
  },
  {
    id: 'domiciliar', icon: 'bank',
    answer: 'domiciliar',
    clue: 'To set up a direct debit from your bank account. Landlords and utility companies will ask you to do this.',
    note: 'domiciliar el pago = set up the direct debit payment',
  },
]

// ─── Key phrases ──────────────────────────────────────────────────────────────

export const PHRASES_M1: {
  id: string; context: string; answer: string; translation: string
}[] = [
  {
    id: 'ph-cita',
    context: "Telling the clerk why you're there:",
    answer: 'Vengo a pedir el NIE.',
    translation: "I've come to apply for the NIE.",
  },
  {
    id: 'ph-ayuda',
    context: 'Asking for help at any government office:',
    answer: '¿Me puede ayudar?',
    translation: 'Can you help me?',
  },
  {
    id: 'ph-repite',
    context: 'When they speak too fast (and they will):',
    answer: '¿Puede repetir más despacio, por favor?',
    translation: 'Can you repeat more slowly, please?',
  },
  {
    id: 'ph-entiendo',
    context: "Honest about your level — clerks appreciate this:",
    answer: 'Perdona, no entiendo del todo.',
    translation: "Sorry, I don't quite understand.",
  },
  {
    id: 'ph-documentos',
    context: 'Asking what documents you need:',
    answer: '¿Qué documentos necesito?',
    translation: 'What documents do I need?',
  },
  {
    id: 'ph-tarda',
    context: 'Asking how long something will take:',
    answer: '¿Cuánto tiempo tarda?',
    translation: 'How long does it take?',
  },
  {
    id: 'ph-pagar',
    context: 'At the bank, paying the tasa (fee) before your appointment:',
    answer: '¿Puedo pagar con tarjeta?',
    translation: 'Can I pay by card?',
  },
  {
    id: 'ph-justificante',
    context: 'Asking for proof of your submission:',
    answer: 'Necesito un justificante, por favor.',
    translation: 'I need a receipt/proof, please.',
  },
]

// ─── Grammar: poder + infinitive ─────────────────────────────────────────────

export type PoderItem = {
  id: string; context: string; pre: string; answer: string; post: string
  translation: string
}

export const PODER_QS: PoderItem[] = [
  {
    id: 'pod-1',
    context: 'Asking a clerk to help you',
    pre: '¿', answer: 'me puede ayudar', post: '?',
    translation: 'Can you help me?',
  },
  {
    id: 'pod-2',
    context: 'Asking if you can pay by card',
    pre: '¿', answer: 'puedo pagar con tarjeta', post: '?',
    translation: 'Can I pay by card?',
  },
  {
    id: 'pod-3',
    context: 'Asking them to repeat',
    pre: '¿', answer: 'puede repetir', post: ', por favor?',
    translation: 'Can you repeat, please?',
  },
  {
    id: 'pod-4',
    context: "Saying you can't open the email attachment",
    pre: 'No', answer: ' puedo abrir el archivo', post: '.',
    translation: "I can't open the file.",
  },
  {
    id: 'pod-5',
    context: 'Asking if the office can see you tomorrow',
    pre: '¿', answer: 'pueden atenderme mañana', post: '?',
    translation: 'Can you see me tomorrow?',
  },
]

// ─── Dialogue: at the Oficina de Extranjería, Valencia ───────────────────────

export const DIALOGUE_M1: { who: string; line: string; isYou?: boolean }[] = [
  { who: 'Narrator', line: "It's a Tuesday morning. Comisaría de Policía, Valencia — NIE appointments are at the police station. You arrive with your documents. There is a short queue." },
  { who: 'Funcionario', line: 'Buenos días. ¿Tiene cita previa?' },
  { who: 'You', line: 'Sí, buenos días. Tengo una cita a las diez. Me llamo Sarah Cooper.', isYou: true },
  { who: 'Funcionario', line: '¿Me puede dar el número de referencia, por favor?' },
  { who: 'You', line: 'Sí, claro. Es el... [checks phone] ...cero-tres-cuatro-siete-ocho-dos.', isYou: true },
  { who: 'Funcionario', line: 'Perfecto. Siéntese, por favor. Le llamamos en unos minutos.' },
  { who: 'Narrator', line: 'Twenty minutes later.' },
  { who: 'Funcionaria', line: '¿Sarah Cooper? Pase, por favor. ¿Viene a solicitar el NIE?' },
  { who: 'You', line: 'Perdona, no entiendo del todo. ¿Puede repetir más despacio?', isYou: true },
  { who: 'Funcionaria', line: '¿Viene a pedir el NIE? El número de identidad para extranjeros.' },
  { who: 'You', line: 'Sí, exacto. Vengo a pedir el NIE.', isYou: true },
  { who: 'Funcionaria', line: 'Bien. ¿Tiene el formulario EX-15, el pasaporte con una fotocopia y el documento que explica por qué necesita el NIE?' },
  { who: 'You', line: 'Sí, lo tengo todo aquí. ¿Puedo pagar la tasa con tarjeta?', isYou: true },
  { who: 'Funcionaria', line: 'Aquí no se paga. La tasa, el modelo 790, se paga antes: en el banco o por internet. ¿Tiene el justificante?' },
  { who: 'You', line: 'Sí, la pagué ayer en el banco. Nueve euros con ochenta y cuatro. Aquí está.', isYou: true },
  { who: 'Funcionaria', line: 'Perfecto. Un momento, por favor.' },
  { who: 'You', line: 'Gracias. ¿Cuánto tiempo tarda el proceso?', isYou: true },
  { who: 'Funcionaria', line: 'Si todo está correcto, le damos el certificado hoy mismo. Aquí tiene. Recuerde: el NIE es solo un número. No es la residencia.' },
  { who: 'You', line: 'Entendido. Muchas gracias.', isYou: true },
  { who: 'Funcionaria', line: 'De nada. ¡Buena suerte!' },
]

// line = index in DIALOGUE_M1 of the line that proves the answer (lit up when they get it right).
export type DialogueQ = { q: string; options: string[]; a: string; line: number }
export const DIALOGUE_QS: DialogueQ[] = [
  {
    q: 'What does the first funcionario ask for straight away?',
    options: ['Your passport', 'Your reference number', 'Your NIE form', 'Your appointment time'],
    a: 'Your reference number',
    line: 3,
  },
  {
    q: 'Why does Sarah ask the second official to speak more slowly?',
    options: ["She doesn't know the vocabulary", "She doesn't understand completely", 'The office is too noisy', 'She forgot her Spanish'],
    a: "She doesn't understand completely",
    line: 8,
  },
  {
    q: 'How did Sarah pay the tasa?',
    options: ['Cash at the window', 'By card at the window', 'In advance, at the bank', "She didn't need to pay"],
    a: 'In advance, at the bank',
    line: 14,
  },
  {
    q: 'If everything is correct, when does Sarah get her NIE certificate?',
    options: ['The same day', '3–5 working days', '10–15 working days', 'A month later, by post'],
    a: 'The same day',
    line: 17,
  },
]

// Phrases from this module that appear in the dialogue. They light up as the student
// reaches them. "text" must appear exactly inside DIALOGUE_M1[line].line.
export const DIALOGUE_SPOTS: { text: string; line: number; en: string }[] = [
  { text: 'Tengo una cita', line: 2, en: 'I have an appointment' },
  { text: 'número de referencia', line: 3, en: 'reference number' },
  { text: 'no entiendo del todo', line: 8, en: "I don't quite understand" },
  { text: '¿Puede repetir más despacio?', line: 8, en: 'Can you repeat more slowly?' },
  { text: 'Vengo a pedir el NIE', line: 10, en: "I've come to apply for the NIE" },
  { text: '¿Puedo pagar la tasa con tarjeta?', line: 12, en: 'Can I pay the fee by card?' },
  { text: 'justificante', line: 13, en: 'proof of payment' },
  { text: '¿Cuánto tiempo tarda', line: 16, en: 'How long does it take?' },
]

// ─── Level check ──────────────────────────────────────────────────────────────

export type LevelQ = {
  q: string
  options: { label: string; points: number }[]
}

export const LEVEL_QS: LevelQ[] = [
  {
    q: 'Someone greets you with "Buenos días, ¿cómo está?" You…',
    options: [
      { label: 'Have no idea what they said', points: 0 },
      { label: 'Understand and can reply "Bien, gracias"', points: 1 },
      { label: 'Can have a short conversation', points: 2 },
    ],
  },
  {
    q: 'You need to book a cita previa online. You…',
    options: [
      { label: "Have never done this and don't know what it means", points: 0 },
      { label: 'Know what it is but find the website confusing', points: 1 },
      { label: 'Have done this before — no problem', points: 2 },
    ],
  },
  {
    q: 'The clerk speaks too fast. You…',
    options: [
      { label: 'Go completely blank', points: 0 },
      { label: "Want to ask them to slow down but don't know how", points: 1 },
      { label: 'Say "¿Puede repetir más despacio?" confidently', points: 2 },
    ],
  },
  {
    q: 'How much Spanish have you studied before?',
    options: [
      { label: 'None at all', points: 0 },
      { label: 'A few lessons or an app (Duolingo, etc.)', points: 1 },
      { label: 'Classes or self-study for six months or more', points: 2 },
    ],
  },
  {
    q: 'You see "apellidos" on a form. You…',
    options: [
      { label: 'Have no idea what it means', points: 0 },
      { label: "Think it might be 'surname' but aren't sure", points: 1 },
      { label: "Know it's surname, know 'nombre' too", points: 2 },
    ],
  },
]

export function getLevelLabel(score: number): { level: string; label: string; note: string } {
  if (score <= 3) return {
    level: 'A1',
    label: 'Complete Beginner',
    note: 'This module will give you everything you need from scratch. Take it one step at a time.',
  }
  if (score <= 6) return {
    level: 'A2',
    label: 'Survival Level',
    note: "You've got the basics. This module will fill the gaps and give you real confidence.",
  }
  return {
    level: 'B1',
    label: 'Getting There',
    note: "You're in good shape. Focus on the phrases and the dialogue for the most value.",
  }
}

// ─── Item bank for spaced repetition ─────────────────────────────────────────

export type VocabItemSE = { id: string; kind: 'vocab'; answer: string; clue: string; icon: IconName }
export type PhraseItemSE = { id: string; kind: 'phrase'; answer: string; context: string; translation: string }
export type ItemSE = VocabItemSE | PhraseItemSE

export const VOCAB_ITEMS_SE: VocabItemSE[] = VOCAB_M1.map(v => ({
  id: `m1:vocab:${v.id}`, kind: 'vocab' as const, answer: v.answer, clue: v.clue, icon: v.icon,
}))
export const PHRASE_ITEMS_SE: PhraseItemSE[] = PHRASES_M1.map(p => ({
  id: `m1:phrase:${p.id}`, kind: 'phrase' as const, answer: p.answer, context: p.context, translation: p.translation,
}))
export const ALL_ITEMS_SE: ItemSE[] = [...VOCAB_ITEMS_SE, ...PHRASE_ITEMS_SE]

// ─── Match drag data ──────────────────────────────────────────────────────────
// 6 of the 8 phrases used in a situation-matching drag activity (step 3).
// Item IDs use m1:match: prefix — never rename once stored in progress.

export type MatchItem = { id: string; situation: string; phrase: string }
export const MATCH_QS: MatchItem[] = [
  { id: 'match-nie', situation: "You've just arrived. Tell the clerk why you're there.", phrase: 'Vengo a pedir el NIE.' },
  { id: 'match-repite', situation: "The clerk is speaking too fast — ask them to slow down.", phrase: '¿Puede repetir más despacio, por favor?' },
  { id: 'match-entiendo', situation: "You caught some words but not everything — be honest.", phrase: 'Perdona, no entiendo del todo.' },
  { id: 'match-docs', situation: "You're not sure what paperwork to bring — ask.", phrase: '¿Qué documentos necesito?' },
  { id: 'match-pagar', situation: "You'd prefer not to use cash for the tasa — ask.", phrase: '¿Puedo pagar con tarjeta?' },
  { id: 'match-justificante', situation: "You always want proof you were there — ask for a receipt.", phrase: 'Necesito un justificante, por favor.' },
]
export const MATCH_OPTIONS: string[] = MATCH_QS.map(q => q.phrase)
export type MatchItemSE = { id: string; kind: 'match'; phrase: string; situation: string }
export const MATCH_ITEMS_SE: MatchItemSE[] = MATCH_QS.map(q => ({
  id: `m1:match:${q.id}`, kind: 'match' as const, phrase: q.phrase, situation: q.situation,
}))

// ─── Answer checking ──────────────────────────────────────────────────────────

export function normaliseSE(s: string): string {
  return s.trim().toLowerCase()
    .replace(/[''`´]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?¿¡]+/g, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    [i, ...Array(b.length).fill(0)]
  )
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
  return dp[a.length][b.length]
}

export function checkAnswerSE(given: string, answer: string): 'right' | 'close' | 'wrong' {
  const g = normaliseSE(given)
  const a = normaliseSE(answer)
  if (!g) return 'wrong'
  if (g === a) return 'right'
  const dist = levenshtein(g, a)
  return dist <= (a.length >= 7 ? 2 : 1) ? 'close' : 'wrong'
}

// ─── Writing: one short real message (Module 1, step "Escribir") ─────────────
// Item ids are stored in progress.writing as `m1:<id>`; never rename an existing id.

export type WritingTaskSE = {
  id: string; icon: IconName; title: string; to: string; channel: 'email' | 'whatsapp'
  situation: string; include: string[]; phrases: string[]
}

export const WRITING_TASKS_M1: WritingTaskSE[] = [
  {
    id: 'w-gestoria', icon: 'documents', title: 'Ask a gestoría for help', to: 'A gestoría near your flat', channel: 'email',
    situation: 'You want a gestoría to help you with your NIE. Write a short email.',
    include: ['Say hello and who you are', 'Say what you need help with', 'Ask what documents you need', 'Ask how much it costs'],
    phrases: ['Buenos días:', 'Me llamo… y soy de…', 'Necesito ayuda con el NIE.', '¿Qué documentos necesito?', '¿Cuánto cuesta?', 'Muchas gracias. Un saludo,'],
  },
  {
    id: 'w-ayto', icon: 'government', title: 'Ask the town hall for a padrón appointment', to: 'The padrón office, Ayuntamiento de València', channel: 'email',
    situation: 'You have just moved to a new flat in Valencia and need to register on the padrón. Write a short email.',
    include: ['Say hello and who you are', 'Say you have a new address in Valencia', 'Ask for a cita previa for the padrón', 'Ask what you need to bring'],
    phrases: ['Buenos días:', 'Vivo en un piso nuevo en…', 'Quiero empadronarme.', '¿Puedo pedir una cita previa?', '¿Qué tengo que llevar?', 'Un saludo,'],
  },
  {
    id: 'w-casero', icon: 'phone', title: 'Message your landlord', to: 'Your landlord, Vicente', channel: 'whatsapp',
    situation: 'The padrón office needs a copy of your rental contract. Send your landlord a short WhatsApp.',
    include: ['Say hello', 'Say why you need the contract', 'Ask if he can send it to you', 'Say thank you'],
    phrases: ['Hola, Vicente:', 'Necesito el contrato de alquiler', 'para el padrón.', '¿Me lo puede enviar por email?', 'Muchas gracias.'],
  },
]

// Short stable id for a student's own mistake (stored in progress.personal).
export function shortHashSE(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}
