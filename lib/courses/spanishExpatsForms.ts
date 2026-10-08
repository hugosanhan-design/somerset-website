// Step-by-step guides to the official immigration forms (EX-15, EX-17, EX-18).
// Page images: public/courses/spanish-expats/docs/forms/ (rendered from the official PDFs,
// inclusion.gob.es/web/migraciones/modelos-generales). Boxes are % of the page: [x, y, w, h],
// measured from the PDF's own text positions. Checked against the forms on 8 Oct 2026.

export type FormStep = { page: 1 | 2; box: [number, number, number, number]; title: string; text: string; words?: [string, string][] }
export type FormGuide = { id: 'ex15' | 'ex17' | 'ex18'; name: string; purpose: string; pdf: string; steps: FormStep[] }

const PAGES = '/courses/spanish-expats/docs/forms/'
export const formPage = (id: FormGuide['id'], page: 1 | 2) => `${PAGES}${id}-p${page}.jpg`

const start = (y: number): FormStep => ({
  page: 1, box: [32, 4.5, 28, y], title: 'Before you start',
  text: 'Write in CAPITAL LETTERS with a black pen — or type into the PDF on your computer (it is fillable) and print it. Bring the original AND a photocopy to your appointment.',
  words: [['mayúsculas', 'capital letters'], ['bolígrafo negro', 'black pen'], ['original y copia', 'original and a copy']],
})

// Section 1–3 + consent are laid out the same way on all three forms, just shifted down on EX-17/18.
const personal = (top: number, address: string, idH = 13.8): FormStep[] => [
  {
    page: 1, box: [5.5, top, 89.5, idH], title: '1 · You — identity',
    text: 'Passport number. N.I.E.: leave it empty if you don\'t have one yet. Surnames: if you only have one, write it in "1er Apellido". Sex: H = man, M = woman. Date of birth as dd/mm/yyyy. Place and country of birth, nationality, marital status, and your father\'s and mother\'s first names.',
    words: [['1er / 2º apellido', 'first / second surname'], ['nombre', 'first name'], ['fecha de nacimiento', 'date of birth'], ['estado civil: S C V D Sp', 'single, married, widowed, divorced, separated'], ['nombre del padre / de la madre', 'father\'s / mother\'s name']],
  },
  {
    page: 1, box: [5.5, top + idH, 89.5, 9.2], title: '1 · You — address and contact',
    text: `${address} Add your mobile number and email — they are used to tell you when there is a letter for you. "Representante legal" is only for children (a parent or guardian signs).`,
    words: [['domicilio', 'address'], ['Nº / Piso', 'number / floor'], ['localidad / C.P. / provincia', 'town / postcode / province'], ['teléfono móvil', 'mobile phone']],
  },
]

const others = (s2: number, s3: number, consent: number): FormStep[] => [
  {
    page: 1, box: [5.5, s2, 89.5, 13.5], title: '2 · Representative',
    text: 'Only if someone else hands the form in for you — for example a gestor or a lawyer. If you go yourself, leave this whole box empty.',
    words: [['representante', 'representative'], ['razón social', 'company name']],
  },
  {
    page: 1, box: [5.5, s3, 89.5, 11.5], title: '3 · Address for letters',
    text: 'Where official letters about this application should go. Usually your own name and address again.',
    words: [['domicilio a efectos de notificaciones', 'address for notifications']],
  },
  {
    page: 1, box: [5.5, consent, 89.5, 4], title: 'Online notifications?',
    text: 'Tick this ONLY if you already have a digital certificate or Cl@ve: then letters are sent online instead of by post, and the first time you open one counts as being notified. If you don\'t have either yet, leave it unticked.',
    words: [['consiento', 'I agree'], ['notificaciones', 'official notices']],
  },
]

const finish = (box: [number, number, number, number], extra = ''): FormStep[] => [
  {
    page: 2, box, title: 'Date and signature',
    text: `Write the place and date in Spanish — e.g. "Valencia, a 14 de octubre de 2026" — and sign in the box.${extra}`,
    words: [['a … de … de …', 'on (day) of (month) of (year)'], ['firma del solicitante', 'applicant\'s signature']],
  },
  {
    page: 2, box: [4, 93.6, 92, 2.8], title: '"Dirigida a" — who it is for',
    text: 'The office the form is addressed to. Write VALENCIA under PROVINCIA. If you don\'t know the office name or its DIR3 code, ask at your appointment — staff can tell you.',
    words: [['dirigida a', 'addressed to']],
  },
]

export const FORM_GUIDES: Record<FormGuide['id'], FormGuide> = {
  ex15: {
    id: 'ex15', name: 'EX-15', purpose: 'Application for your NIE number',
    pdf: 'https://www.inclusion.gob.es/documents/d/migraciones/ex15-formulario-solicitud-numero-de-identidad-de-extranjero-y-certificados-editable.pdf',
    steps: [
      start(6),
      ...personal(17.5, 'Your current address ("domicilio de residencia") — in Spain, or abroad if you apply at a consulate.', 14.4),
      ...others(44, 61, 74),
      {
        page: 2, box: [7, 14.5, 86, 9.5], title: '4.1 · What you are asking for',
        text: 'Tick "NÚMERO DE IDENTIDAD DE EXTRANJERO (NIE)". The CERTIFICADO boxes are for a different request — a certificate saying you are resident or non-resident (banks sometimes ask for the non-resident one).',
        words: [['certificado de residente / de no residente', 'resident / non-resident certificate']],
      },
      {
        page: 2, box: [7, 25, 86, 11.5], title: '4.2 · Why you need it',
        text: 'Tick the reason: económicos (e.g. buying a home or a car, investing), profesionales (work), sociales — or "otros motivos" and write the reason. Bring a document that proves it, such as a deposit contract or a job offer.',
        words: [['por intereses económicos / profesionales / sociales', 'for economic / professional / social reasons'], ['especificar', 'specify']],
      },
      {
        page: 2, box: [7, 39, 86, 5], title: '4.3 · Where you hand it in',
        text: 'In Valencia, NIE appointments are at a Comisaría de Policía — tick that box. If you apply from abroad, tick Oficina Consular.',
        words: [['lugar de presentación', 'place of submission']],
      },
      {
        page: 2, box: [7, 46, 62, 5], title: '4.4 · Your situation in Spain',
        text: 'Estancia if you are in Spain for a stay (e.g. visiting); Residencia if you live here legally as a resident.',
        words: [['estancia', 'stay'], ['residencia', 'residence']],
      },
      ...finish([41, 57.5, 47, 18.5]),
    ],
  },
  ex17: {
    id: 'ex17', name: 'EX-17', purpose: 'Application for your TIE card (fingerprint appointment)',
    pdf: 'https://www.inclusion.gob.es/documents/d/migraciones/ex17-formulario-solicitud-tarjeta-de-identidad-de-extranjero-editable.pdf',
    steps: [
      start(6),
      ...personal(21.5, 'Your address in Spain ("domicilio en España") — the same one as on your padrón certificate.'),
      ...others(47, 64, 77),
      {
        page: 1, box: [7, 83.5, 88, 8], title: 'In person only',
        text: 'This form can only be handed in in person, at your Policía Nacional fingerprint appointment. It cannot be sent online or through a registry office.',
        words: [['de forma personal', 'in person']],
      },
      {
        page: 2, box: [8, 16, 64, 10], title: '4.1 · Which card',
        text: 'TARJETA INICIAL for your first card. RENOVACIÓN when you renew it. DUPLICADO if it was lost, stolen or damaged, or your details changed (for example a new address).',
        words: [['tarjeta inicial', 'first card'], ['renovación', 'renewal'], ['duplicado por pérdida / sustracción', 'replacement for loss / theft']],
      },
      ...finish([41, 39.5, 47, 20]),
    ],
  },
  ex18: {
    id: 'ex18', name: 'EX-18', purpose: 'Registration as an EU citizen (green certificate)',
    pdf: 'https://www.inclusion.gob.es/documents/d/migraciones/ex18-formulario-inscripcion-en-el-rce-residencia-ciudadano-de-la-ue-editable.pdf',
    steps: [
      start(7.5),
      ...personal(21.5, 'Your address in Spain ("domicilio en España") — ideally the one on your padrón certificate.'),
      ...others(47, 64, 77),
      {
        page: 2, box: [8, 14, 86, 5.2], title: '4 · How long you will stay',
        text: 'How long you plan to live in Spain, the date you started living here (dd/mm/yyyy), and how many family members are with you.',
        words: [['período previsto de residencia', 'planned period of residence'], ['fecha de inicio', 'start date'], ['nº de familiares', 'number of family members']],
      },
      {
        page: 2, box: [8, 19.2, 66, 13.3], title: 'Residencia temporal — your reason',
        text: 'On your first registration, tick RESIDENCIA TEMPORAL and ONE reason: employee (por cuenta ajena), self-employed (por cuenta propia), not working with enough money and health insurance, student with money and insurance, or family member of an EU citizen (add their ID number and your relationship).',
        words: [['trabajador por cuenta ajena / propia', 'employee / self-employed'], ['recursos suficientes', 'sufficient means'], ['seguro de enfermedad', 'health insurance'], ['vínculo', 'relationship']],
      },
      {
        page: 2, box: [8, 32.5, 86, 25.5], title: 'Residencia permanente — not yet',
        text: 'Permanent residence comes after 5 years (or in special retirement or incapacity cases). Skip this block on your first registration.',
        words: [['residencia permanente', 'permanent residence']],
      },
      {
        page: 2, box: [8, 58.5, 86, 13], title: 'Changes and leaving — later',
        text: 'MODIFICACIÓN is for later changes (new address, new passport); BAJA is when you leave. Skip both now.',
        words: [['cambio de domicilio', 'change of address'], ['baja', 'deregistration']],
      },
      ...finish([6, 72.5, 88, 17], ' Tick the declaration first (you confirm the information is true). The second signature box is only for the EU citizen when a family member is the one applying.'),
    ],
  },
}

// Which document card / tracker task gets which guide.
export const FORM_FOR: Partial<Record<string, FormGuide['id']>> = { nie: 'ex15', tie: 'ex17', 'eu-cert': 'ex18' }
