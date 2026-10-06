// Spanish for Expats — Module 1: The First Month
// Content: NIE/TIE, empadronamiento, bank, key oficina phrases, poder + infinitive.
// Item ids are stored in students' saved progress, so never rename an existing id.

export const COURSE_ID = 'sexp'
export const MODULE_ID = 'm1'

// ─── Vocabulary ───────────────────────────────────────────────────────────────

export const VOCAB_M1: {
  id: string; emoji: string; answer: string; clue: string; note: string
}[] = [
  {
    id: 'nie', emoji: '🪪',
    answer: 'NIE',
    clue: 'The number every foreigner needs to work, open a bank account or sign a contract in Spain.',
    note: 'Número de Identidad de Extranjero',
  },
  {
    id: 'tie', emoji: '💳',
    answer: 'TIE',
    clue: 'The physical card you receive after registering as a resident — replaces the old green residency card.',
    note: 'Tarjeta de Identidad de Extranjero',
  },
  {
    id: 'empadronamiento', emoji: '🏠',
    answer: 'empadronamiento',
    clue: 'The act of registering your address with the local council. Required for almost everything official.',
    note: 'empadronarse = to register; certificado de empadronamiento = the proof',
  },
  {
    id: 'cita-previa', emoji: '📅',
    answer: 'cita previa',
    clue: 'An advance appointment — booked online through the government website. You cannot simply walk in.',
    note: 'cita = appointment; previa = prior/in advance',
  },
  {
    id: 'extranjeria', emoji: '🏛️',
    answer: 'extranjería',
    clue: 'The government office that processes residency applications, NIE and TIE.',
    note: 'From extranjero/a = foreigner',
  },
  {
    id: 'gestor', emoji: '🧾',
    answer: 'gestor',
    clue: 'An administrative agent who handles paperwork on your behalf. Worth every euro in your first year.',
    note: 'gestoría = the office; gestor/a = the person',
  },
  {
    id: 'sede-electronica', emoji: '💻',
    answer: 'sede electrónica',
    clue: 'The official government online portal — where you book appointments and submit forms.',
    note: 'Literally: electronic seat/office. Full of frustration but unavoidable.',
  },
  {
    id: 'certificado-digital', emoji: '🔐',
    answer: 'certificado digital',
    clue: 'A digital certificate that lets you sign documents and access government services online.',
    note: 'Essential for taxes, social security, and almost everything after year 1.',
  },
  {
    id: 'padron', emoji: '📋',
    answer: 'padrón',
    clue: 'The municipal register of residents. Being on this list ("empadronado") unlocks most services.',
    note: 'Certificado de empadronamiento = printed proof from the Ayuntamiento',
  },
  {
    id: 'numero-referencia', emoji: '🔢',
    answer: 'número de referencia',
    clue: 'The reference number the website gives you when you book an appointment. Screenshot it immediately.',
    note: 'You will hear "su número de referencia" the moment you arrive at any government office.',
  },
  {
    id: 'tasa', emoji: '💰',
    answer: 'tasa',
    clue: 'The official fee you pay for government services — there is one for the NIE, one for the TIE.',
    note: 'modelo 790 = the payment form for most tasas',
  },
  {
    id: 'domiciliar', emoji: '🏦',
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
    context: 'At the window, paying the tasa (fee):',
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
  { who: 'Narrator', line: "It's a Tuesday morning. Oficina de Extranjería, Valencia. You arrive with your documents. There is a short queue." },
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
  { who: 'Funcionaria', line: 'Bien. ¿Tiene el formulario EX-15, el pasaporte y una fotocopia?' },
  { who: 'You', line: 'Sí, lo tengo todo aquí.', isYou: true },
  { who: 'Funcionaria', line: 'Perfecto. También necesita pagar la tasa. Son diez euros con setenta.' },
  { who: 'You', line: '¿Puedo pagar con tarjeta?', isYou: true },
  { who: 'Funcionaria', line: 'Sí, con tarjeta es posible. Un momento.' },
  { who: 'You', line: 'Gracias. ¿Cuánto tiempo tarda el proceso?', isYou: true },
  { who: 'Funcionaria', line: 'Normalmente de diez a quince días hábiles. Le enviamos el NIE por correo.' },
  { who: 'You', line: 'Necesito un justificante, por favor.', isYou: true },
  { who: 'Funcionaria', line: 'Claro. Aquí tiene. ¡Buena suerte!' },
]

export type DialogueQ = { q: string; options: string[]; a: string }
export const DIALOGUE_QS: DialogueQ[] = [
  {
    q: 'What does the first funcionario ask for straight away?',
    options: ['Your passport', 'Your reference number', 'Your NIE form', 'Your appointment time'],
    a: 'Your reference number',
  },
  {
    q: 'Why does Sarah ask the second official to speak more slowly?',
    options: ["She doesn't know the vocabulary", "She doesn't understand completely", 'The office is too noisy', 'She forgot her Spanish'],
    a: "She doesn't understand completely",
  },
  {
    q: 'How does Sarah pay the tasa?',
    options: ['Cash', 'By card', 'Bank transfer', 'Online before arriving'],
    a: 'By card',
  },
  {
    q: 'How long will the NIE process take?',
    options: ['Same day', '3–5 working days', '10–15 working days', 'A month'],
    a: '10–15 working days',
  },
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

export type VocabItemSE = { id: string; kind: 'vocab'; answer: string; clue: string; emoji: string }
export type PhraseItemSE = { id: string; kind: 'phrase'; answer: string; context: string; translation: string }
export type ItemSE = VocabItemSE | PhraseItemSE

export const VOCAB_ITEMS_SE: VocabItemSE[] = VOCAB_M1.map(v => ({
  id: `m1:vocab:${v.id}`, kind: 'vocab' as const, answer: v.answer, clue: v.clue, emoji: v.emoji,
}))
export const PHRASE_ITEMS_SE: PhraseItemSE[] = PHRASES_M1.map(p => ({
  id: `m1:phrase:${p.id}`, kind: 'phrase' as const, answer: p.answer, context: p.context, translation: p.translation,
}))
export const ALL_ITEMS_SE: ItemSE[] = [...VOCAB_ITEMS_SE, ...PHRASE_ITEMS_SE]

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
