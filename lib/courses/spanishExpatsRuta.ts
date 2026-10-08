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

export const PURPOSES: { id: Purpose; label: string }[] = [
  { id: 'work', label: 'Work for a Spanish employer' },
  { id: 'nomad', label: 'Work remotely (digital nomad)' },
  { id: 'study', label: 'Study' },
  { id: 'retire', label: 'Retire / live off savings' },
  { id: 'family', label: 'Join family' },
]

// ─── Document cards ──────────────────────────────────────────────────────────

export type DocImage = { src: string; alt: string; caption: string; credit: string; creditUrl: string }
export type Source = { label: string; url: string }
export type Booking = { how: string; url?: string; urlLabel?: string; office?: string; steps: string[]; links?: Source[]; checked?: string }
export type Phrase = { who: 'you' | 'them'; es: string; en: string }

export type DocCard = {
  id: DocId
  es: string
  en: string
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
  booking?: Booking
  bring?: string[]
  say?: Phrase[]
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

// Deep links — every one opened and checked on 8 Oct 2026. Labels say what the page does.
const L = {
  icpValencia: { label: 'Book: police cita previa — Valencia', url: 'https://icp.administracionelectronica.gob.es/icpplus/citar?p=46&locale=es' },
  fee790: { label: 'Pay: modelo 790-012 fee form', url: 'https://sede.policia.gob.es/Tasa790_012/' },
  ex15: { label: 'Form EX-15 (PDF, fillable)', url: 'https://www.inclusion.gob.es/documents/d/migraciones/ex15-formulario-solicitud-numero-de-identidad-de-extranjero-y-certificados-editable.pdf' },
  ex17: { label: 'Form EX-17 (PDF, fillable)', url: 'https://www.inclusion.gob.es/documents/d/migraciones/ex17-formulario-solicitud-tarjeta-de-identidad-de-extranjero-editable.pdf' },
  ex18: { label: 'Form EX-18 (PDF, fillable)', url: 'https://www.inclusion.gob.es/documents/d/migraciones/ex18-formulario-inscripcion-en-el-rce-residencia-ciudadano-de-la-ue-editable.pdf' },
  ex19: { label: 'Form EX-19 — non-EU family of EU citizens (PDF)', url: 'https://www.inclusion.gob.es/documents/d/migraciones/ex19-formulario-tarjeta-de-residencia-de-familiar-de-ciudadano-de-la-ue-editable.pdf' },
  ex20: { label: 'Form EX-20 — UK, resident before 2021 (PDF)', url: 'https://www.inclusion.gob.es/documents/d/migraciones/ex20-formulario-residencia-articulo-50-tue-para-nacionales-del-reino-unido-editable.pdf' },
  ex01: { label: 'Form EX-01 — non-lucrative residence (PDF)', url: 'https://www.inclusion.gob.es/documents/d/migraciones/ex01-formulario-autorizacion-de-residencia-temporal-no-lucrativa-editable-1.pdf' },
  allForms: { label: 'All official immigration forms', url: 'https://www.inclusion.gob.es/web/migraciones/modelos-generales' },
  padronMayoral: { label: 'Book: padrón — C/ Arzobispo Mayoral 1', url: 'https://www.valencia.es/QSIGE/apps/citaprevia/index.html?idioma=ES#!/newAppointment/99' },
  padronTabacalera: { label: 'Book: padrón — OAC Tabacalera', url: 'https://www.valencia.es/QSIGE/apps/citaprevia/index.html?idioma=ES#!/newAppointment/33' },
  padronJuntas: { label: 'Book: padrón — district offices (Juntas)', url: 'https://www.valencia.es/QSIGE/apps/citaprevia/index.html?idioma=ES#!/newAppointment/16' },
  padronOffices: { label: 'All padrón offices and phones', url: 'https://www.valencia.es/-/2020-padron-1' },
  padronOnline: { label: 'Register online instead (needs digital ID)', url: 'https://sede.valencia.es/sede/registro/procedimiento/PA.GP.11?lang=1' },
  padronCert: { label: 'Get your padrón certificate', url: 'https://www.valencia.es/cas/tramites/certificado-de-padron' },
  ta1: { label: 'Form TA.1 (Social Security)', url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10817/31190/572' },
  sipFinder: { label: 'Find your centro de salud', url: 'https://www.san.gva.es/es/web/portal-del-paciente/informacion-centros' },
  sipOnline: { label: 'Apply for SIP online (needs digital ID)', url: 'https://sede.gva.es/es/detall-tramit?id_proc=21561&version=red' },
  gvaApp: { label: 'GVA +Salut app (virtual SIP card)', url: 'https://www.san.gva.es/es/web/app-gva-mes-salut' },
  fnmtOffices: { label: 'FNMT — map of identity-check offices', url: 'https://mapaoficinascert.appspot.com/' },
  fnmtInPerson: { label: 'FNMT — in-person identity check explained', url: 'https://www.sede.fnmt.gob.es/certificados/persona-fisica/obtener-certificado-software/acreditar-identidad/presencial' },
  accvValencia: { label: 'Book: ACCV digital certificate at Valencia city hall', url: 'https://www.valencia.es/QSIGE/apps/citaprevia/index.html?idioma=ES#!/newAppointment/13' },
  mercurio: { label: 'MERCURIO — file permit applications online', url: 'https://mercurio.delegaciondelgobierno.gob.es/mercurio/inicioMercurio.html' },
  fileStatus: { label: 'Check the status of your immigration file', url: 'https://infoext2.delegaciondelgobierno.gob.es/infoext2/' },
  carpeta: { label: 'Carpeta Ciudadana — your official notifications', url: 'https://carpetaciudadana.gob.es' },
}

const IMG = '/courses/spanish-expats/docs/'

export const DOCS: Record<DocId, DocCard> = {
  visa: {
    id: 'visa', es: 'Visado nacional (tipo D)', en: 'Long-stay visa',
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
    booking: {
      how: 'Your Spanish consulate\'s website — most book through an outside agency (e.g. BLS).',
      url: 'https://www.exteriores.gob.es', urlLabel: 'Find your consulate (exteriores.gob.es)',
      links: [L.ex01, L.allForms],
      steps: [
        'Find the Spanish consulate that covers where you live, and open its visa page.',
        'Check its exact document list for your visa type — consulates add their own requirements.',
        'Book the appointment through the consulate or its agency. You must attend in person.',
        'Save the confirmation and write the date below.',
      ],
    },
    bring: [
      'Passport valid for at least 1 more year + copies',
      'National visa application form + photo',
      'Criminal record certificate — apostilled + sworn translation',
      'Medical certificate',
      'Proof of funds / income',
      'Health insurance certificate (no co-payments, no waiting periods)',
      'Proof of payment of the visa fee',
    ],
    say: [
      { who: 'you', es: 'Tengo cita para solicitar un visado nacional.', en: 'I have an appointment to apply for a national visa.' },
      { who: 'them', es: '¿Tiene el certificado de antecedentes penales apostillado?', en: 'Do you have the apostilled criminal record certificate?' },
      { who: 'you', es: 'Sí, y aquí está la traducción jurada.', en: 'Yes, and here is the sworn translation.' },
    ],
  },

  supporting: {
    id: 'supporting', es: 'Apostilla y traducción jurada', en: 'Apostille & sworn translation',
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
    id: 'nie', es: 'NIE', en: 'Foreigner ID number',
    images: [{
      src: IMG + 'ex15-form-page1.jpg', alt: 'First page of the blank EX-15 form',
      caption: 'Form EX-15 — the application you bring to your NIE appointment.',
      credit: 'Gobierno de España · blank official form', creditUrl: 'https://www.inclusion.gob.es/web/migraciones/modelos-generales',
    }],
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
    booking: {
      how: 'Online — police cita previa (in Spain) or your consulate (abroad).',
      url: L.icpValencia.url, urlLabel: 'Book the NIE appointment (Valencia)',
      checked: '8 Oct 2026',
      steps: [
        'Download and fill in form EX-15 (link below).',
        'Pay the fee first: on the 790-012 form choose "Asignación de NIE a instancia del interesado" (€9.84). Pay online or at a bank, and print the receipt.',
        'Open the booking link — Valencia is already selected.',
        'Leave the office on "Cualquier oficina" (any office) unless you need a specific one.',
        'Under "Trámites Policía Nacional" choose "POLICIA-CERTIFICADOS Y ASIGNACION NIE".',
        'Enter your passport details and pick a slot. Be quick: the session expires if you leave it idle.',
        'No slots? Try again at different times and days, and screenshot every attempt. Save the confirmation (justificante de cita).',
      ],
      links: [L.ex15, L.fee790, L.icpValencia],
    },
    bring: [
      'Form EX-15, filled in and signed + a copy',
      'Passport + a copy',
      'Paid 790-012 fee (€9.84)',
      'Proof of why you need the NIE (deposit contract, job offer, notary letter…)',
      'Appointment confirmation',
    ],
    say: [
      { who: 'you', es: 'Buenos días. Vengo a pedir el NIE.', en: 'Good morning. I\'ve come to apply for the NIE.' },
      { who: 'them', es: '¿Por qué necesita el NIE?', en: 'Why do you need the NIE?' },
      { who: 'you', es: 'Para comprar un piso. Aquí tiene el contrato de arras.', en: 'To buy a flat. Here is the deposit contract.' },
      { who: 'them', es: '¿Tiene el justificante de la tasa?', en: 'Do you have the fee receipt?' },
    ],
  },

  padron: {
    id: 'padron', es: 'Empadronamiento', en: 'Town hall registration',
    images: [{
      src: '/courses/spanish-expats/ayuntamiento.jpg', alt: 'The Ayuntamiento (town hall) of Valencia',
      caption: 'The padrón is kept by the Ajuntament de València — the city council on Plaza del Ayuntamiento.',
      credit: 'Diego Delso · CC BY-SA 4.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Ayuntamiento_de_Valencia,_Espa%C3%B1a,_2014-06-30,_DD_120.JPG',
    }],
    what: 'Registering your address on the city\'s population register. The proof is the certificado de empadronamiento.',
    who: 'Everyone who lives in Valencia — EU, UK and non-EU. It\'s compulsory, and almost everything else needs it.',
    before: 'no',
    beforeNote: 'You need a real Valencia address first.',
    where: 'By appointment at the Oficina del Padrón (C/ Arzobispo Mayoral 1), OAC Tabacalera (C/ Amadeo de Saboya 11) or a district office (Junta Municipal). No appointments available? You can go WITHOUT one to C/ Periodista Azzati 1 or OAC Tabacalera. Mon–Fri 8:30–14:00.',
    cost: 'Free.',
    time: 'Often the same day if your papers are right. Legal maximum: 3 months.',
    steps: [
      'Sign a lease of MORE than 6 months that shows the referencia catastral (cadastral reference) — or get the IBI tax receipt from your landlord.',
      'Book the appointment online (city booking system) or by phone (010). No slots? Go without one to C/ Periodista Azzati 1 or OAC Tabacalera.',
      'Bring: passport (or TIE / EU ID), the lease, and your last rent receipt or transfer (from the last 2 months).',
      'Ask for the certificado de empadronamiento — you will need it for the TIE and SIP card.',
    ],
    unlocks: 'TIE card, SIP health card, schools, local services. Starts the clock for public health cover via convenio especial.',
    watch: 'Valencia rejects month-to-month leases, leases of 6 months or less, and leases without the cadastral reference. Renting a room? The lease must say which room. Renew: every 2 years if you are not in the Central Register of Foreigners.',
    sources: [S.padron, L.padronOffices],
    booking: {
      how: 'Online on the city\'s booking system — or by phone (010 / 963 52 54 78).',
      url: L.padronTabacalera.url, urlLabel: 'Book the padrón (OAC Tabacalera)',
      office: 'OAC Tabacalera — C/ Amadeo de Saboya 11',
      checked: '8 Oct 2026',
      steps: [
        'Pick an office below — each link opens the city\'s booking form with that office already chosen.',
        'Book one appointment per person (a family can go together).',
        'Fill in your name and ID document, choose a day and time, and keep the confirmation.',
        'No appointments? Valencia says you can go WITHOUT one to C/ Periodista Azzati 1 (access) or OAC Tabacalera, 8:30–14:00 — or register online if you already have a digital ID.',
        'Questions about padrón procedures: 962 081 104.',
      ],
      links: [L.padronMayoral, L.padronTabacalera, L.padronJuntas, L.padronOnline, L.padronCert, L.padronOffices],
    },
    bring: [
      'Passport (or TIE / EU ID card)',
      'Lease — more than 6 months, signed by everyone, showing the referencia catastral',
      'Your last rent receipt or bank transfer (from the last 2 months)',
      'Renting a room or living in someone else\'s home? The authorisation form + the owner\'s ID and deeds or lease',
    ],
    say: [
      { who: 'you', es: 'Hola, buenos días. Quería pedir cita para empadronarme.', en: 'Hello. I\'d like an appointment to register on the padrón.' },
      { who: 'them', es: '¿En qué barrio vive?', en: 'Which neighbourhood do you live in?' },
      { who: 'you', es: 'Vivo en Russafa. ¿Qué documentos tengo que llevar?', en: 'I live in Russafa. What documents do I need to bring?' },
      { who: 'them', es: 'El pasaporte, el contrato de alquiler y el último recibo.', en: 'Your passport, the lease and the last rent receipt.' },
      { who: 'you', es: '¿Me da el certificado de empadronamiento, por favor?', en: 'Could I have the padrón certificate, please?' },
    ],
  },

  'eu-cert': {
    id: 'eu-cert', es: 'Certificado de Registro de Ciudadano de la UE', en: 'EU registration ("green") certificate',
    images: [{
      src: IMG + 'ex18-form-page1.jpg', alt: 'First page of the blank EX-18 form',
      caption: 'Form EX-18 — the application for the EU registration certificate.',
      credit: 'Gobierno de España · blank official form', creditUrl: 'https://www.inclusion.gob.es/web/migraciones/modelos-generales',
    }],
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
    booking: {
      how: 'Online — police cita previa.',
      url: L.icpValencia.url, urlLabel: 'Book the EU certificate appointment (Valencia)',
      office: 'Comisaría de Bailén — C/ Bailén 9',
      checked: '8 Oct 2026',
      steps: [
        'Download and fill in form EX-18 (link below).',
        'Pay the fee first: on the 790-012 form choose the EU registration certificate box (€12). Print the receipt.',
        'Open the booking link — Valencia is already selected.',
        'Office: "CNP-COMISARIA DE BAILEN, Bailen, 9" — or leave "Cualquier oficina" (any office) for more chances.',
        'Under "Trámites Policía Nacional" choose "POLICIA-CERTIFICADO DE REGISTRO DE CIUDADANO DE LA U.E.".',
        'Enter your passport/ID details and pick a slot. Be quick: the session expires if you leave it idle.',
        'No slots? Try again at different times and days, and screenshot every attempt — your 3-month deadline still applies.',
      ],
      links: [L.ex18, L.fee790, L.icpValencia, L.ex19],
    },
    bring: [
      'Form EX-18, filled in and signed',
      'Passport or national ID card + a copy',
      'Paid 790-012 fee (€12)',
      'Proof of your situation: work contract or Social Security registration; or funds + health insurance; or enrolment + insurance',
      'Padrón certificate (recommended)',
      'Appointment confirmation',
    ],
    say: [
      { who: 'them', es: '¿Tiene cita?', en: 'Do you have an appointment?' },
      { who: 'you', es: 'Sí, para el certificado de registro de ciudadano de la Unión.', en: 'Yes, for the EU registration certificate.' },
      { who: 'them', es: '¿Me da el pasaporte, el formulario y el justificante de la tasa?', en: 'Can you give me your passport, the form and the fee receipt?' },
      { who: 'you', es: 'Aquí tiene. También traigo mi contrato de trabajo.', en: 'Here you are. I\'ve also brought my work contract.' },
    ],
  },

  tie: {
    id: 'tie', es: 'TIE', en: 'Foreigner identity card',
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
    time: 'Fingerprint appointment: weeks. Then a second appointment ("Recogida de tarjeta") to collect the card.',
    steps: [
      'Get on the padrón and take the certificado de empadronamiento (ideally less than 3 months old).',
      'Pay the 790-012 fee — in the right box for your case.',
      'Book "toma de huellas" for Patraix.',
      'Attend with: form EX-17, passport, 1 recent passport photo, paid fee, padrón certificate, your visa or resolution. You get a receipt (resguardo).',
      'Book a second appointment ("Recogida de tarjeta") and bring the resguardo to collect your card.',
    ],
    needs: 'Visa or authorisation + padrón. Employed workers: Social Security registration (alta) first.',
    unlocks: 'Easy travel in and out of Schengen, resident bank account, digital certificate, Cl@ve.',
    watch: 'Deadline: within 1 month of entering Spain (employed workers: within 1 month of their Social Security alta). Moving flat? You need a new card with your new padrón.',
    sources: [S.leaflet, S.offices, S.fees, S.govuk],
    booking: {
      how: 'Online — police cita previa.',
      url: L.icpValencia.url, urlLabel: 'Book the TIE fingerprints (Valencia)',
      office: 'Comisaría de Patraix — C/ dels Gremis 6',
      checked: '8 Oct 2026',
      steps: [
        'Download and fill in form EX-17 (link below). UK resident before 2021? You also need form EX-20.',
        'Pay the fee first, in the right box of the 790-012 form (€16.08 for a first card; €12 for a UK Withdrawal Agreement card). Print the receipt.',
        'Open the booking link — Valencia is already selected.',
        'Office: "CNP COMISARIA PATRAIX EXTRANJERIA, GREMIS, 6" — or leave "Cualquier oficina" (any office). Other offices in the province (Sagunto, Alzira, Gandia, Ontinyent…) sometimes have slots.',
        'Under "Trámites Policía Nacional" choose "POLICÍA-TOMA DE HUELLAS (EXPEDICIÓN DE TARJETA) INICIAL, RENOVACIÓN, DUPLICADO Y LEY 14/2013".',
        'Enter your passport details and pick a slot. Be quick: the session expires if you leave it idle. Screenshot every attempt — your 1-month deadline still applies.',
        'After the fingerprints, book a SECOND appointment to collect the card: "POLICIA - RECOGIDA DE TARJETA DE IDENTIDAD DE EXTRANJERO (TIE)".',
      ],
      links: [L.ex17, L.fee790, L.icpValencia, L.ex20],
    },
    bring: [
      'Form EX-17, filled in and signed',
      'Passport + a copy',
      '1 recent passport-size photo',
      'Paid 790-012 fee (€16.08 for a first card)',
      'Padrón certificate (ideally less than 3 months old)',
      'Your visa, or the resolution granting your permit',
      'Appointment confirmation',
    ],
    say: [
      { who: 'you', es: 'Buenos días. Vengo a la toma de huellas para la TIE.', en: 'Good morning. I\'m here for the TIE fingerprints.' },
      { who: 'them', es: 'Ponga el dedo índice aquí, por favor.', en: 'Put your index finger here, please.' },
      { who: 'them', es: 'Este es su resguardo. Vuelva en unas semanas para recoger la tarjeta.', en: 'This is your receipt. Come back in a few weeks to collect the card.' },
      { who: 'you', es: '¿Tengo que pedir otra cita para recogerla?', en: 'Do I need to book another appointment to collect it?' },
      { who: 'them', es: 'Sí. Pida cita previa para la recogida de la tarjeta.', en: 'Yes. Book an appointment to collect the card.' },
    ],
  },

  nuss: {
    id: 'nuss', es: 'Número de la Seguridad Social (NUSS)', en: 'Social Security number',
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
    booking: {
      how: 'Online on Import@ss — no appointment needed. Or your employer requests it.',
      url: S.nuss.url, urlLabel: 'Request your NUSS on Import@ss',
      checked: '8 Oct 2026',
      links: [L.ta1, S.nuss],
      steps: [
        'Download and fill in form TA.1.',
        'On Import@ss choose "Solicitar el número de la Seguridad Social", then the option without electronic ID.',
        'Upload a photo of your ID and a selfie holding it.',
        'The number arrives by email — note the date below.',
      ],
    },
    bring: ['Passport or NIE/TIE (photo)', 'Form TA.1', 'A selfie holding your ID', 'An email address'],
  },

  sip: {
    id: 'sip', es: 'Tarjeta SIP', en: 'Valencian health card',
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
      'Collect the card — and download the GVA +Salut app (virtual SIP card).',
    ],
    needs: 'Padrón + NIE/TIE + a right to public healthcare.',
    watch: 'Non-lucrative residents can\'t get the convenio especial in their first year. Keep that private insurance.',
    sources: [S.sip, S.convenio],
    booking: {
      how: 'In person at your centro de salud — or online on sede.gva.es with a digital certificate or Cl@ve.',
      url: L.sipFinder.url, urlLabel: 'Find your centro de salud',
      checked: '8 Oct 2026',
      steps: [
        'Find your centro de salud — it depends on your address (search by address, no SIP number needed).',
        'Go in person — or apply online on sede.gva.es with a digital ID and collect the card there.',
        'Once registered, download the GVA +Salut app: it includes a virtual SIP card.',
      ],
      links: [L.sipFinder, L.sipOnline, L.gvaApp, S.sip],
    },
    bring: ['NIE / TIE / EU certificate', 'Passport', 'Padrón certificate', 'The INSS document confirming your right to healthcare'],
    say: [
      { who: 'you', es: 'Hola. Quería darme de alta para la tarjeta SIP.', en: 'Hello. I\'d like to register for the SIP card.' },
      { who: 'them', es: '¿Tiene el documento del INSS?', en: 'Do you have the INSS document?' },
      { who: 'you', es: 'Sí, y el certificado de empadronamiento.', en: 'Yes, and the padrón certificate.' },
    ],
  },

  digital: {
    id: 'digital', es: 'Certificado digital y Cl@ve', en: 'Online government ID',
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
    booking: {
      how: 'Online request on the FNMT website, then an identity check in person.',
      url: S.fnmt.url, urlLabel: 'Request the FNMT certificate',
      checked: '8 Oct 2026',
      steps: [
        'On the FNMT website, request a "certificado de persona física" — you get a código de solicitud by email.',
        'Find an identity-check office on the FNMT map (tax and Social Security offices need an appointment).',
        'After the check, download the certificate in the SAME browser (about 1 hour later) — then make a backup copy.',
        'Valencia alternative: the city hall issues the Valencian region\'s own digital certificate (ACCV) by appointment at C/ Arzobispo Mayoral 1 or OAC Tabacalera.',
      ],
      links: [S.fnmt, L.fnmtOffices, L.fnmtInPerson, L.accvValencia, S.clave],
    },
    bring: ['Your código de solicitud (email)', 'TIE or EU certificate', 'Passport'],
    say: [
      { who: 'you', es: 'Tengo cita para acreditar mi identidad para el certificado digital.', en: 'I have an appointment to verify my identity for the digital certificate.' },
      { who: 'them', es: '¿Me da el código de solicitud?', en: 'Can you give me the request code?' },
    ],
  },

  bank: {
    id: 'bank', es: 'Cuenta bancaria', en: 'Spanish bank account',
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
    booking: {
      how: 'Walk in, or book on the bank\'s website.',
      steps: [
        'Compare a couple of banks — ask about monthly fees, and about the basic payment account (cuenta de pago básica).',
        'Book an appointment or walk in with your documents.',
      ],
    },
    bring: ['Passport', 'NIE (certificate, TIE or EU certificate)', 'Padrón certificate (for a resident account)', 'Proof of income or job'],
    say: [
      { who: 'you', es: 'Quería abrir una cuenta. ¿Tienen una cuenta de pago básica?', en: 'I\'d like to open an account. Do you have a basic payment account?' },
      { who: 'them', es: '¿Es usted residente o no residente?', en: 'Are you resident or non-resident?' },
      { who: 'you', es: 'Todavía no soy residente. Tengo el NIE.', en: 'I\'m not resident yet. I have my NIE.' },
    ],
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
  week.push({ text: 'Book your padrón appointment (online or call 010) — it\'s free. No slots? Walk in at C/ Periodista Azzati 1.', doc: 'padron' })
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

// ─── Mi expediente: deadlines + calendar ──────────────────────────────────────

export type Deadline = { label: string; doc: DocId; date: Date | null; legal: boolean; note: string }

export function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export function addMonths(d: Date, n: number) {
  const x = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()
  x.setDate(Math.min(d.getDate(), last))
  return x
}
export function parseDay(s?: string): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}

export function deadlinesFor(nat: Nationality, purpose: Purpose, arrival: Date | null, alta: Date | null): Deadline[] {
  if (nat === 'uk-old') return []
  const out: Deadline[] = [
    { label: 'Padrón appointment', doc: 'padron', date: arrival && addDays(arrival, 7), legal: false, note: 'Our suggestion, not a legal deadline — almost everything else needs it.' },
  ]
  if (nat === 'eu') {
    out.push({ label: 'EU registration certificate', doc: 'eu-cert', date: arrival && addMonths(arrival, 3), legal: true, note: 'Within 3 months of arriving.' })
  } else if (purpose === 'work') {
    out.push({ label: 'Social Security registration (alta)', doc: 'nuss', date: arrival && addMonths(arrival, 3), legal: true, note: 'Within 3 months of entering Spain.' })
    out.push({ label: 'TIE fingerprints', doc: 'tie', date: alta && addMonths(alta, 1), legal: true, note: alta ? 'Within 1 month of your Social Security registration.' : 'Within 1 month of your Social Security registration — add that date when you have it.' })
  } else {
    out.push({ label: 'TIE fingerprints', doc: 'tie', date: arrival && addMonths(arrival, 1), legal: true, note: purpose === 'study' ? 'Within 1 month of entering Spain (if you stay more than 6 months).' : 'Within 1 month of entering Spain.' })
  }
  return out
}

const pad = (n: number) => String(n).padStart(2, '0')
const icsDay = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
const icsEsc = (s: string) => s.replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n')

export function buildIcs(ev: { title: string; day: Date; time?: string; location?: string; description?: string; alarm: string }) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Somerset Language Centre//Mi expediente//ES', 'BEGIN:VEVENT',
    `UID:${stamp}-${Math.random().toString(36).slice(2)}@somerset`, `DTSTAMP:${stamp}`]
  if (ev.time) {
    const [h, m] = ev.time.split(':').map(Number)
    const start = new Date(ev.day); start.setHours(h, m)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const dt = (d: Date) => `${icsDay(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`
    lines.push(`DTSTART:${dt(start)}`, `DTEND:${dt(end)}`)
  } else {
    lines.push(`DTSTART;VALUE=DATE:${icsDay(ev.day)}`, `DTEND;VALUE=DATE:${icsDay(addDays(ev.day, 1))}`)
  }
  lines.push(`SUMMARY:${icsEsc(ev.title)}`)
  if (ev.location) lines.push(`LOCATION:${icsEsc(ev.location)}`)
  if (ev.description) lines.push(`DESCRIPTION:${icsEsc(ev.description)}`)
  lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(ev.title)}`, `TRIGGER:${ev.alarm}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
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
    'No padrón appointments? The city says you can go without one to C/ Periodista Azzati 1 or OAC Tabacalera.',
  ],
  links: [L.icpValencia, L.fee790, L.fileStatus, L.carpeta, L.mercurio, L.allForms],
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
