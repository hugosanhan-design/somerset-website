// "Tu ruta" — Module 1 paperwork map for Valencia.
// Fact base: Somerset Special Courses/research/m1-documents-research.md
// Only OFFICIAL or clearly-labelled SECONDARY facts. Re-verify every October (fees change via BOE order).

export const RUTA_LAST_VERIFIED = '8 October 2026'

export type Nationality = 'eu' | 'uk-new' | 'uk-old' | 'noneu'
export type Purpose = 'work' | 'nomad' | 'study' | 'retire' | 'family'
export type DocId = 'visa' | 'supporting' | 'nie' | 'padron' | 'eu-cert' | 'tie' | 'nuss' | 'sip' | 'digital' | 'bank'

export const NATIONALITIES: { id: Nationality; label: string; sub: string }[] = [
  { id: 'eu', label: 'EU / EEA / Swiss', sub: 'Free movement — no visa' },
  { id: 'uk-new', label: 'UK — moving now', sub: 'Since 2021 Brits are non-EU' },
  { id: 'uk-old', label: 'UK — here before 2021', sub: 'Withdrawal Agreement' },
  { id: 'noneu', label: 'Other non-EU', sub: 'US, Canada, Australia, LatAm…' },
]

export const PURPOSES: { id: Purpose; label: string; emoji: string }[] = [
  { id: 'work', label: 'Work for a Spanish employer', emoji: '💼' },
  { id: 'nomad', label: 'Work remotely (digital nomad)', emoji: '💻' },
  { id: 'study', label: 'Study', emoji: '🎓' },
  { id: 'retire', label: 'Retire / live off savings', emoji: '🌅' },
  { id: 'family', label: 'Join family', emoji: '👨‍👩‍👧' },
]

// ─── Document cards ──────────────────────────────────────────────────────────

export type DocImage = { src: string; alt: string; caption: string; credit: string; creditUrl: string }
export type Source = { label: string; url: string }

export type DocCard = {
  id: DocId
  es: string
  en: string
  emoji: string
  images?: DocImage[]
  what: string
  who: string
  before: 'yes' | 'no' | 'partly'
  beforeNote: string
  where: string
  cost: string
  time: string
  steps: string[]
  needs?: string
  unlocks?: string
  watch?: string
  sources: Source[]
}

const S = {
  fees: { label: 'Policía Nacional — tasas (790-012)', url: 'https://sede.policia.gob.es/portalciudadano/_es/tramites_extranjeria_tasas.php' },
  boe: { label: 'BOE — Orden PJC/617/2025 (fees)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-12056' },
  leaflet: { label: 'Oficina de Extranjería Valencia — info leaflet (Oct 2026)', url: 'https://mptmd.gob.es/content/dam/mpt/delegaciones_gobierno/delegaciones/comunidad_valenciana/Informacio_basica_extranjeria.pdf' },
  offices: { label: 'Delegación del Gobierno — Valencia offices', url: 'https://mptmd.gob.es/portal/delegaciones_gobierno/delegaciones/comunidad_valenciana/servicios/extranjeria.html' },
  icp: { label: 'Police appointments (cita previa)', url: 'https://icp.administracionelectronica.gob.es/icpplus/index.html' },
  nieConsulate: { label: 'Spanish Consulate Edinburgh — NIE', url: 'https://exteriores.gob.es/Consulados/edimburgo/en/ServiciosConsulares/Paginas/Consular/NIE.aspx' },
  euCert: { label: 'Policía — EU registration certificate', url: 'https://sede.policia.gob.es/portalCiudadano/_es/tramites_extranjeria_tramite_certificadoregistro_ciudadanoue.php' },
  padron: { label: 'Ajuntament de València — empadronamiento', url: 'https://sede.valencia.es/sede/registro/procedimiento/PA.GP.11?lang=1' },
  nonLucrative: { label: 'Ministerio de Inclusión — non-lucrative residence', url: 'https://www.inclusion.gob.es/web/migraciones/w/autorizacion-inicial-de-residencia-temporal-no-lucrativa' },
  study: { label: 'Ministerio de Inclusión — study stay', url: 'https://www.inclusion.gob.es/web/migraciones/w/estancia-por-estudios' },
  work: { label: 'Ministerio de Inclusión — employed work', url: 'https://www.inclusion.gob.es/web/migraciones/w/autorizacion-inicial-de-residencia-temporal-y-trabajo-por-cuenta-ajena-hi-16-' },
  family: { label: 'Ministerio de Inclusión — family reunification', url: 'https://www.inclusion.gob.es/web/migraciones/w/autorizacion-de-residencia-temporal-por-reagrupacion-familiar' },
  nomad: { label: 'UGE — international teleworkers (digital nomads)', url: 'https://www.inclusion.gob.es/documents/d/unidadgrandesempresas/informacion-documentacion-titulares' },
  nuss: { label: 'Seguridad Social — get your NUSS (Import@ss)', url: 'https://portal.seg-social.gob.es/wps/portal/importass/importass/Categorias/Altas,+bajas+y+modificaciones/Altas+y+afiliacion+de+trabajadores/Solicitar+el+numero+de+la+Seguridad+Social' },
  sip: { label: 'GVA — SIP health card', url: 'https://www.san.gva.es/es/web/tarjeta-sanitaria/tramites-tarjeta-sip' },
  convenio: { label: 'Ministerio de Sanidad — convenio especial', url: 'https://www.sanidad.gob.es/servCiudadanos/internacional/convenioEspecial.htm' },
  fnmt: { label: 'FNMT — digital certificate', url: 'https://www.sede.fnmt.gob.es/certificados/persona-fisica/obtener-certificado-software' },
  clave: { label: 'Cl@ve — register', url: 'https://clave.gob.es/clave_Home/registro.html' },
  bde: { label: 'Banco de España — basic payment account', url: 'https://clientebancario.bde.es/f/webcb/RCL/ActualidadEducacionFinanciera/Iniciativas/GuiaCuentapagobasicaaccesible.pdf' },
  govuk: { label: 'GOV.UK — registering as a resident in Spain', url: 'https://www.gov.uk/guidance/spain-registering-as-a-resident-and-getting-a-tie' },
}

const IMG = '/courses/spanish-expats/docs/'

export const DOCS: Record<DocId, DocCard> = {
  visa: {
    id: 'visa', es: 'Visado nacional (tipo D)', en: 'Long-stay visa', emoji: '🛂',
    images: [{
      src: IMG + 'visa-d-sticker-specimen-eu.jpg',
      alt: 'Official specimen of the EU long-stay visa sticker',
      caption: 'The EU uniform visa sticker. This specimen is German — the Spanish one has the same layout but says VISADO / ESPAÑA.',
      credit: 'European Union, EUR-Lex · Public domain', creditUrl: 'https://commons.wikimedia.org/wiki/File:Schengenvisum-specimen.jpg',
    }],
    what: 'The sticker in your passport that lets a non-EU citizen enter Spain to live, not just visit.',
    who: 'Non-EU citizens, including Brits who move after 2020. Not EU/EEA/Swiss citizens.',
    before: 'yes',
    beforeNote: 'Only before. You apply in person at the Spanish consulate (or its agency, e.g. BLS) in your country of residence.',
    where: 'Spanish consulate in your home country. Digital nomads already in Spain legally can apply from Spain instead.',
    cost: 'Consulate fee — set per country and nationality, often in local currency. Non-lucrative and work routes also pay the 790-052 fee: €10.94.',
    time: 'The consulate must decide within 1 month. You collect the visa within 1 month (students: 2) and must enter Spain within its validity.',
    steps: [
      'Choose your route: work, study, non-lucrative (retire), digital nomad or family.',
      'Gather the supporting documents — apostilled and sworn-translated.',
      'Book and attend the consulate appointment in person.',
      'Collect the visa, then enter Spain within its validity (max. 3 months for non-lucrative).',
      'Within 1 month of arriving: apply for your TIE card.',
    ],
    unlocks: 'Entry to Spain to live. Your NIE number comes with it.',
    watch: 'A tourist offered a job in Spain must go home to get the visa — it cannot be done from Spain.',
    sources: [S.nonLucrative, S.study, S.work, S.nomad, S.leaflet],
  },

  supporting: {
    id: 'supporting', es: 'Apostilla y traducción jurada', en: 'Apostille & sworn translation', emoji: '📑',
    images: [{
      src: IMG + 'apostille-specimen-redacted.jpg',
      alt: 'An apostille certificate with ten numbered fields, personal details redacted',
      caption: 'An apostille. This one is from Hong Kong, but every apostille has the same 10 numbered boxes by international treaty.',
      credit: 'S 0524 · Wikimedia Commons · CC BY-SA 4.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Apostille_Sample_-_Hong_Kong,_China_in_2020.png',
    }],
    what: 'An apostille is an official stamp that makes a foreign public document (criminal record, birth certificate…) valid in Spain. A sworn translation (traducción jurada) is a certified Spanish translation.',
    who: 'Anyone applying for a visa: criminal record certificate, medical certificate, marriage/birth certificates. EU public documents are usually exempt from legalisation.',
    before: 'yes',
    beforeNote: 'Do this before you leave — the apostille comes from the country that issued the document.',
    where: 'Apostille: the issuing country\'s competent authority. Translation: a traductor jurado on the Spanish Foreign Ministry list.',
    cost: 'Translations: typically €150–400 in total (secondary estimate).',
    time: 'Allow several weeks — and check how recent your criminal record certificate must be with your consulate.',
    steps: [
      'Get the original documents (criminal record for every country you lived in during the last 5 years; nomads: last 2).',
      'Have each one apostilled in the country that issued it.',
      'Have each one translated by a traductor jurado.',
      'Medical certificate: states you have no disease with serious public-health consequences (International Health Regulations 2005).',
    ],
    watch: 'A normal translation, or a document without an apostille, is a common reason for refusal.',
    sources: [S.nonLucrative, S.nomad],
  },

  nie: {
    id: 'nie', es: 'NIE', en: 'Foreigner ID number', emoji: '🔢',
    what: 'Your foreigner identity number — for life. It appears on your tax papers, contracts and residence card. The NIE certificate (form EX-15) is just the paper proving the number.',
    who: 'Everyone. Residents get it automatically: EU citizens on their green certificate, non-EU on their visa/TIE. You only need a separate NIE certificate for one-off things (buying a flat, a car) before you are a resident.',
    before: 'yes',
    beforeNote: 'You can request it from a Spanish consulate — you must show why you need it (e.g. buying property).',
    where: 'In Valencia: a police station (Comisaría), booked online via cita previa. Abroad: the Spanish consulate.',
    cost: '€9.84 — modelo 790 código 012, box "Asignación de NIE a instancia del interesado". At a consulate the fee is set locally.',
    time: 'In Spain, usually issued at the appointment (if you can get one). At a consulate: about 10 days to 4 weeks.',
    steps: [
      'Get proof of why you need it (deposit contract, job offer, notary letter…).',
      'Fill in form EX-15.',
      'Pay the 790-012 fee (€9.84) online or at a bank — before the appointment.',
      'Book "Asignación de NIE" on the police cita previa website.',
      'Go in person: passport + copy, EX-15, paid fee, proof of need.',
    ],
    unlocks: 'Buying property or a car, some bank accounts, utility contracts, the digital certificate.',
    watch: '"I have my NIE, so I\'m a resident" — no. The NIE is only a number. It does not let you live in Spain.',
    sources: [S.fees, S.nieConsulate, S.icp, S.leaflet],
  },

  padron: {
    id: 'padron', es: 'Empadronamiento', en: 'Town hall registration', emoji: '🏠',
    what: 'Registering your address on the city\'s population register. The proof is the certificado de empadronamiento.',
    who: 'Everyone who lives in Valencia — EU, UK and non-EU. It\'s compulsory, and almost everything else needs it.',
    before: 'no',
    beforeNote: 'You need a real Valencia address first.',
    where: 'By appointment — call 010 (or 963 100 010) or book on valencia.es. Oficina del Padrón (entrance Periodista Azzati 2), OAC Tabacalera (C/ Amadeu de Savoia 11), or a district office (Junta Municipal). Mon–Fri 8:30–14:00.',
    cost: 'Free.',
    time: 'Often the same day if your papers are right. Legal maximum: 3 months.',
    steps: [
      'Sign a lease of MORE than 6 months that shows the referencia catastral (cadastral reference) — or get the IBI tax receipt from your landlord.',
      'Book the appointment (010 or valencia.es).',
      'Bring: passport (or TIE / EU ID), the lease, and your last rent receipt or transfer (from the last 2 months).',
      'Ask for the certificado de empadronamiento — you will need it for the TIE and SIP card.',
    ],
    unlocks: 'TIE card, SIP health card, schools, local services. Starts the clock for public health cover via convenio especial.',
    watch: 'Valencia rejects month-to-month leases, leases of 6 months or less, and leases without the cadastral reference. Renting a room? The lease must say which room. Renew: every 2 years if you are not in the Central Register of Foreigners.',
    sources: [S.padron],
  },

  'eu-cert': {
    id: 'eu-cert', es: 'Certificado de Registro de Ciudadano de la UE', en: 'EU registration ("green") certificate', emoji: '🟩',
    what: 'Registration as an EU resident in Spain. It carries your NIE.',
    who: 'EU, EEA and Swiss citizens staying more than 3 months. Not for Brits who arrived after 2020.',
    before: 'no',
    beforeNote: 'Only in Spain.',
    where: 'Comisaría de Bailén, C/ Bailén 9, València. Book "Certificado de Registro de Ciudadano de la UE" on the police cita previa website.',
    cost: '€12.00 — modelo 790 código 012.',
    time: 'Issued at the appointment. The wait is for the appointment itself.',
    steps: [
      'Get on the padrón first (strongly recommended).',
      'Collect proof of your situation: work contract or Social Security registration; or proof of funds + health insurance; or enrolment + insurance (students).',
      'Fill in form EX-18 and pay the 790-012 (€12).',
      'Book and attend Bailén 9 with your passport or ID card. You leave with the certificate.',
    ],
    unlocks: 'Social Security number, SIP card (if working), resident bank account, digital certificate.',
    watch: 'Deadline: within 3 months of arriving. Not working? The EHIC card does not prove residence — bring private insurance or an S1.',
    sources: [S.euCert, S.offices, S.fees],
  },

  tie: {
    id: 'tie', es: 'TIE', en: 'Foreigner identity card', emoji: '💳',
    images: [
      {
        src: IMG + 'tie-front.jpg',
        alt: 'Official specimen of the front of the TIE card',
        caption: 'TIE — front. Official EU specimen for Spain: the numbers mark where your photo, name, NIE and permit type go.',
        credit: 'European Union, EUR-Lex · CC BY 4.0 · cropped', creditUrl: 'https://commons.wikimedia.org/wiki/File:Aufenthaltstitel_Europa-Muster_2019.png',
      },
      {
        src: IMG + 'tie-back.jpg',
        alt: 'Official specimen of the back of the TIE card',
        caption: 'TIE — back, with the chip.',
        credit: 'European Union, EUR-Lex · CC BY 4.0 · cropped', creditUrl: 'https://commons.wikimedia.org/wiki/File:Aufenthaltstitel_Europa-Muster_2019.png',
      },
      {
        src: IMG + 'ex17-form-page1.jpg',
        alt: 'First page of the blank EX-17 form',
        caption: 'Form EX-17 — the application you bring to the fingerprint appointment.',
        credit: 'Gobierno de España · blank official form', creditUrl: 'https://ucraniaurgente.inclusion.gob.es/documents/d/migraciones/ex17-formulario-solicitud-tarjeta-de-identidad-de-extranjero',
      },
    ],
    what: 'Your physical residence card. You give your fingerprints (toma de huellas) and collect the card weeks later.',
    who: 'Non-EU residents staying more than 6 months — work, study, non-lucrative, nomad, family — including Brits.',
    before: 'no',
    beforeNote: 'Only in Spain.',
    where: 'Comisaría de Patraix, C/ dels Gremis 6, València. Book "Toma de huellas (expedición de tarjeta)" on the police cita previa website.',
    cost: '€16.08 first card · €19.30 renewal · €21.87 long-term · €12.00 UK Withdrawal Agreement — all modelo 790 código 012.',
    time: 'Fingerprint appointment: weeks. Then a second visit to collect the card.',
    steps: [
      'Get on the padrón and take the certificado de empadronamiento (ideally less than 3 months old).',
      'Pay the 790-012 fee — in the right box for your case.',
      'Book "toma de huellas" for Patraix.',
      'Attend with: form EX-17, passport, 1 recent passport photo, paid fee, padrón certificate, your visa or resolution. You get a receipt (resguardo).',
      'Return with the resguardo to collect your card.',
    ],
    needs: 'Visa or authorisation + padrón. Employed workers: Social Security registration (alta) first.',
    unlocks: 'Easy travel in and out of Schengen, resident bank account, digital certificate, Cl@ve.',
    watch: 'Deadline: within 1 month of entering Spain (employed workers: within 1 month of their Social Security alta). Moving flat? You need a new card with your new padrón.',
    sources: [S.leaflet, S.offices, S.fees, S.govuk],
  },

  nuss: {
    id: 'nuss', es: 'Número de la Seguridad Social (NUSS)', en: 'Social Security number', emoji: '🧾',
    what: 'Your lifetime Social Security number. Needed to work, be registered by an employer, or be self-employed.',
    who: 'Anyone who will work in Spain (employed or self-employed), and nomads who join Spanish Social Security.',
    before: 'partly',
    beforeNote: 'It\'s an online request, but in practice your employer usually does it once you\'re here.',
    where: 'Online on Import@ss — even without a digital certificate (ID photo + a selfie holding it). Or your employer requests it.',
    cost: 'Free.',
    time: 'Often a few days by email (secondary estimate).',
    steps: [
      'Fill in form TA.1.',
      'On Import@ss: "Solicitar el número de la Seguridad Social" → option without electronic ID.',
      'Upload your ID document and the selfie. The NUSS arrives by email.',
    ],
    unlocks: 'Your employer\'s registration (alta) → public healthcare → SIP card.',
    sources: [S.nuss],
  },

  sip: {
    id: 'sip', es: 'Tarjeta SIP', en: 'Valencian health card', emoji: '🏥',
    what: 'The card for the Valencian public health service. You need it at your local centro de salud.',
    who: 'People insured through work (and their family), pensioners with public cover (e.g. an S1), or people paying into the convenio especial. Private-insurance only (most non-lucrative, students, many nomads)? No SIP — you use your insurer.',
    before: 'no',
    beforeNote: 'Only in Spain.',
    where: 'Your nearest centro de salud, or online at sede.gva.es with a digital certificate / Cl@ve — then collect the card at the centre.',
    cost: 'Free. Convenio especial (paid public cover): €60/month under 65, €157/month from 65 — only after 1 year on the padrón.',
    time: 'Depends on your health centre.',
    steps: [
      'Workers: get your NUSS → your employer registers you → INSS recognises your right to healthcare.',
      'Take your NIE/TIE, padrón certificate and the INSS document to your centro de salud.',
      'Collect the card — and download the SIP Virtual app.',
    ],
    needs: 'Padrón + NIE/TIE + a right to public healthcare.',
    watch: 'Non-lucrative residents can\'t get the convenio especial in their first year. Keep that private insurance.',
    sources: [S.sip, S.convenio],
  },

  digital: {
    id: 'digital', es: 'Certificado digital y Cl@ve', en: 'Online government ID', emoji: '🔐',
    what: 'Two ways to prove who you are online: the FNMT digital certificate (installed in your browser) and Cl@ve (a login + app).',
    who: 'Everyone with a NIE. You will need one for renewals, padrón certificates, taxes and official notifications.',
    before: 'partly',
    beforeNote: 'You can start the FNMT request online anywhere, but you must confirm your identity in person in Spain.',
    where: 'FNMT: request online, then an "Oficina de Acreditación de Identidad" (tax or Social Security offices, by appointment). Cl@ve: online video ID or in person.',
    cost: 'Free.',
    time: 'FNMT: the certificate downloads about an hour after your identity check.',
    steps: [
      'FNMT: request online → you get a código de solicitud by email.',
      'Confirm your identity in person with your TIE (or green certificate) + passport.',
      'Download the certificate in the SAME browser — then make a backup.',
    ],
    needs: 'NIE + passport (and TIE or EU certificate).',
    watch: 'Valencia\'s Oficina de Extranjería sends decisions to your online Carpeta Ciudadana. The first time you open a notice there counts as being officially notified.',
    sources: [S.fnmt, S.clave, S.leaflet],
  },

  bank: {
    id: 'bank', es: 'Cuenta bancaria', en: 'Spanish bank account', emoji: '🏦',
    what: 'A Spanish IBAN — landlords, utilities and payroll will ask for one.',
    who: 'Everyone.',
    before: 'partly',
    beforeNote: 'Some banks open non-resident accounts remotely with a passport and NIE.',
    where: 'Any bank. Non-resident account: passport + NIE (sometimes a certificado de no residencia, €7.31 at the police). Resident account: NIE + padrón + proof of income.',
    cost: 'Varies by bank. By law, banks must offer a basic payment account (cuenta de pago básica) for max. €3/month.',
    time: 'Usually immediate once your papers are in order.',
    steps: [
      'Arrive with a non-resident account if you can — it makes renting easier.',
      'Once you have your padrón and TIE/green certificate, switch it to a resident account.',
    ],
    sources: [S.bde],
  },
}

// ─── Personal route ─────────────────────────────────────────────────────────

export type RouteItem = { text: string; doc?: DocId; deadline?: boolean }
export type Route = { before: RouteItem[]; week: RouteItem[]; month: RouteItem[]; note?: string }

export function routeFor(nat: Nationality, purpose: Purpose): Route {
  if (nat === 'uk-old') {
    return {
      note: 'You keep your rights under the Withdrawal Agreement. The job now is to have the right card.',
      before: [],
      week: [
        { text: 'Still on the old green paper certificate? Book an appointment to exchange it for a TIE marked "Artículo 50 TUE" — €12.', doc: 'tie', deadline: true },
        { text: 'No document at all? Apply with form EX-20, with proof of padrón and health cover from before 1 January 2021.', doc: 'tie' },
      ],
      month: [
        { text: 'Why it matters: the green certificate is not accepted at Schengen borders under the new Entry/Exit System — you could be flagged as overstaying.', doc: 'tie' },
        { text: 'Keep your padrón up to date.', doc: 'padron' },
        { text: 'Get a digital certificate or Cl@ve.', doc: 'digital' },
      ],
    }
  }

  const eu = nat === 'eu'
  const before: RouteItem[] = []
  const week: RouteItem[] = []
  const month: RouteItem[] = []
  const working = purpose === 'work' || purpose === 'nomad'

  if (eu) {
    before.push({ text: 'Valid passport or national ID card.' })
    if (purpose === 'work') before.push({ text: 'Job contract or offer — you will need it to register.' })
    if (purpose === 'retire' || purpose === 'nomad') before.push({ text: 'Proof of funds and private health insurance (or an S1 if you are a pensioner). The EHIC card is not enough to register.' })
    if (purpose === 'study') before.push({ text: 'Proof of enrolment, health insurance and enough funds.' })
    if (purpose === 'family') before.push({ text: 'Non-EU marriage or birth certificates need an apostille + sworn translation.', doc: 'supporting' })
  } else {
    before.push({ text: 'Passport valid for at least 1 more year.' })
    if (purpose === 'work') {
      before.push({ text: 'Your employer applies for your work permit in Spain (online, MERCURIO).' })
      before.push({ text: 'Once approved: apply for the visa at the consulate within 1 month.', doc: 'visa', deadline: true })
    }
    if (purpose === 'nomad') {
      before.push({ text: 'Prove 3+ months with your employer or clients, a company active 1+ year, and a degree or 3 years\' experience.' })
      before.push({ text: 'Income: €2,442/month gross (2026: twice the minimum wage) + extra per family member.' })
      before.push({ text: 'Apply at the consulate — or enter Spain legally and apply from here.', doc: 'visa' })
    }
    if (purpose === 'study') {
      before.push({ text: 'Apply at least 2 months before your course starts.', doc: 'visa', deadline: true })
      before.push({ text: 'Funds: €600/month (2026) — unless your accommodation is prepaid.' })
      before.push({ text: 'Language school? Since 2025, private academies only support a student visa if accredited by the Instituto Cervantes. Check before you pay.' })
    }
    if (purpose === 'retire') {
      before.push({ text: 'Funds: €2,400/month — €28,800/year — plus €600/month per family member (2026). Some consulates calculate higher: prepare for it.' })
      before.push({ text: 'Apply at the consulate (form EX-01, €10.94 + consulate fee). Enter Spain within 3 months.', doc: 'visa', deadline: true })
      before.push({ text: 'Remember: this visa does not allow any work — not even remote work.' })
    }
    if (purpose === 'family') {
      before.push({ text: 'Your family member in Spain applies first — after 1 year of legal residence, with €900/month for 2 people (2026).' })
      before.push({ text: 'Then you apply for your visa at the consulate.', doc: 'visa' })
    }
    if (purpose !== 'work' && purpose !== 'family') {
      before.push({ text: 'Health insurance: complete cover, no co-payments, no waiting periods — travel policies are refused.' })
    }
    before.push({ text: 'Criminal record + medical certificate — apostilled and sworn-translated.', doc: 'supporting' })
    if (nat === 'uk-new') before.push({ text: 'Visiting first? Watch the 90/180-day rule.' })
  }
  before.push({ text: 'Optional: get your NIE at the consulate if you need it to buy or rent before you move.', doc: 'nie' })

  week.push({ text: 'Rent with a lease of MORE than 6 months showing the referencia catastral.', doc: 'padron' })
  week.push({ text: 'Book your padrón appointment (call 010) — it\'s free.', doc: 'padron' })
  if (eu) week.push({ text: 'Book your EU certificate appointment at Comisaría Bailén.', doc: 'eu-cert' })
  else week.push({
    text: purpose === 'work'
      ? 'Book your TIE fingerprint appointment (Patraix) as soon as your Social Security registration is done.'
      : 'Book your TIE fingerprint appointment (Patraix) NOW — your 1-month clock is running.',
    doc: 'tie', deadline: true,
  })
  if (working) week.push({ text: 'Get your Social Security number (NUSS) — often your employer does it.', doc: 'nuss' })
  week.push({ text: 'Open a bank account (non-resident is fine to start).', doc: 'bank' })

  if (eu) month.push({ text: 'EU certificate at Bailén 9 — €12. Deadline: 3 months from arrival.', doc: 'eu-cert', deadline: true })
  else month.push({ text: purpose === 'work'
    ? 'Social Security registration within 3 months of arrival → then TIE fingerprints within 1 month (€16.08).'
    : 'TIE fingerprints — €16.08 — then collect the card weeks later.', doc: 'tie', deadline: true })
  if (purpose === 'work') month.push({ text: 'SIP health card at your centro de salud.', doc: 'sip' })
  else if (purpose === 'family') month.push({ text: 'SIP card if your family member works in Spain (you are covered as their beneficiary). Otherwise keep your private insurance.', doc: 'sip' })
  else month.push({ text: 'No SIP card on private insurance — keep it. (Pensioner with an S1? You can register it for public cover.)', doc: 'sip' })
  if (purpose === 'study' && !eu) month.push({ text: 'You can work up to 30 hours a week.' })
  month.push({ text: 'Digital certificate or Cl@ve — you\'ll need it for almost everything online.', doc: 'digital' })
  month.push({ text: 'Switch to a resident bank account.', doc: 'bank' })

  return { before, week, month }
}

export function docsFor(route: Route): DocId[] {
  const ids = new Set<DocId>()
  for (const i of [...route.before, ...route.week, ...route.month]) if (i.doc) ids.add(i.doc)
  ids.add('padron'); ids.add('digital'); ids.add('bank')
  const order: DocId[] = ['visa', 'supporting', 'nie', 'padron', 'eu-cert', 'tie', 'nuss', 'sip', 'digital', 'bank']
  return order.filter(id => ids.has(id))
}

// ─── Valencia reality check ─────────────────────────────────────────────────

export const REALITY = {
  systems: [
    { name: 'Police (Policía Nacional)', does: 'NIE, TIE fingerprints, EU certificate', how: 'Book only on the police cita previa website. Appointments are scarce — check often.' },
    { name: 'Oficina de Extranjería', does: 'Residence & work permits, renewals, family, students', how: 'In-person appointments are currently requested by email (citaextran.valencia@correo.gob.es). Gestores and lawyers file online.' },
  ],
  backlogDate: '5 October 2026',
  backlog: [
    { what: 'Initial work permit (employed)', upTo: 'February 2026' },
    { what: 'Family reunification', upTo: 'July 2026' },
    { what: 'Initial student authorisation', upTo: 'August 2026' },
  ],
  tips: [
    'Screenshot every attempt to book — legal deadlines still apply when there are no appointments.',
    'Try other offices in the province: Sagunto, Alzira, Gandia, Ontinyent.',
    'Never pay anyone who "sells" an appointment.',
    'A granted permit is fully valid even while you wait for the card.',
  ],
  source: S.leaflet,
}

export const GOTCHAS: string[] = [
  'The NIE is a number, not residence.',
  'Paying the wrong 790-012 box (e.g. €12 instead of €16.08 for a first TIE) — you pay again.',
  'Wrong office: EU certificate = Bailén 9. Non-EU card = Patraix. Permits = Extranjería.',
  'Insurance with co-payments or waiting periods — refused for non-lucrative, student and nomad visas.',
  'Not opening your Carpeta Ciudadana: the first view counts as being notified.',
  'Forgetting to renew the padrón — you can be removed from the register.',
]

export const GESTOR = {
  worth: [
    'Permit applications at the Oficina de Extranjería — they file online and skip the email queue.',
    'Digital nomad applications (heavy paperwork, all online).',
    'Any refusal or request for more documents.',
  ],
  notWorth: ['Padrón', 'EU certificate', 'Social Security number', 'SIP card'],
  limits: 'A gestor can\'t give your fingerprints for you, and can\'t create police appointments that don\'t exist. Ask for a fixed written quote.',
  price: 'NIE/TIE support: roughly €150–500. Full non-lucrative visa: roughly €800–1,500 (national estimates — no Valencia price list exists).',
}
