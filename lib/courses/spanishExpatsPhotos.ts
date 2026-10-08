// Real images for the Spanish for Expats vocabulary cards — every file is logged in
// public/courses/spanish-expats/images.json (source, licence, author).

export type CoursePhoto = { src: string; alt: string; caption: string; credit: string; creditUrl: string }

const DOCS = '/courses/spanish-expats/docs/'

const BANK: CoursePhoto = {
  src: DOCS + 'bank-branch.jpg',
  alt: 'A bank branch in Xàtiva, Valencia province',
  caption: 'A local bank branch. To open an account here you will need your NIE.',
  credit: 'B.N.Sanchez · CC BY-SA 4.0',
  creditUrl: 'https://commons.wikimedia.org/wiki/File:Caixa_Ontinyent.jpg',
}

// Keyed by VOCAB_M1 id. The caption is only shown after the learner answers (it names the term).
export const VOCAB_PHOTOS: Record<string, CoursePhoto> = {
  tie: {
    src: DOCS + 'tie-front.jpg',
    alt: 'Official specimen of the front of the Spanish residence card',
    caption: 'The TIE card (official EU specimen for Spain) — your photo, name and NIE go in the numbered boxes.',
    credit: 'European Union, EUR-Lex · CC BY 4.0 · cropped',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Aufenthaltstitel_Europa-Muster_2019.png',
  },
  empadronamiento: {
    src: DOCS + 'padron-form.jpg',
    alt: 'A blank padrón registration sheet',
    caption: 'The registration sheet you fill in to get on the padrón (this blank one is Sevilla\'s — Valencia\'s is filled in at the office).',
    credit: 'Ayuntamiento de Sevilla · blank official form',
    creditUrl: 'https://www.sevilla.org/servicios/empadronamiento/hoja-padronal-v6-formulario-web-1.pdf',
  },
  extranjeria: {
    src: DOCS + 'comisaria-zapadores.jpg',
    alt: 'The Policía Nacional station on Calle Zapadores, Valencia',
    caption: 'Permits are decided by the Oficina de Extranjería — but your NIE and TIE are done at police stations like this one on C/ Zapadores, Valencia (it is on the police booking list).',
    credit: '19Tarrestnom65 · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Comisar%C3%ADa_de_Zapadores,_Polic%C3%ADa_Nacional.jpg',
  },
  gestor: {
    src: DOCS + 'gestoria.jpg',
    alt: 'Shopfront of a gestoría office',
    caption: 'A gestoría — the office of a gestor, who handles paperwork for you.',
    credit: 'Xavier Badia Castellà · CC BY-SA 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Val%C3%A8ncia_408.jpg',
  },
  padron: {
    src: DOCS + 'volante-empadronamiento.jpg',
    alt: 'The official model of the volante de empadronamiento',
    caption: 'A volante de empadronamiento — the official model Spanish town halls use. It proves you are on the padrón.',
    credit: 'BOE-A-2020-4784, Annex IX · official text',
    creditUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-4784',
  },
  'numero-referencia': {
    src: DOCS + 'turno-ticket.jpg',
    alt: 'Waiting area of a public office with turn-number screens',
    caption: 'Public offices call you by number — keep your reference or turn number ready and watch the screens.',
    credit: 'Diario de Madrid (Ayuntamiento de Madrid) · CC BY 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:La_Oficina_de_Atenci%C3%B3n_a_la_Ciudadan%C3%ADa,_a_pleno_rendimiento_en_su_nueva_sede_03.jpg',
  },
  domiciliar: {
    src: DOCS + 'bank-branch.jpg',
    alt: 'A bank branch in Xàtiva, Valencia province',
    caption: 'At your bank you set up direct debits (domiciliaciones) for rent, bills and taxes.',
    credit: 'B.N.Sanchez · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Caixa_Ontinyent.jpg',
  },
}

// Words in a clue that open a pop-up with a related real image.
export const CLUE_POPUPS: Record<string, { phrase: string; photo: CoursePhoto }[]> = {
  empadronamiento: [{ phrase: 'local council', photo: {
    src: '/courses/spanish-expats/ayuntamiento.jpg',
    alt: 'The Ayuntamiento (town hall) of Valencia',
    caption: 'The Ajuntament de València — Valencia\'s city council, which keeps the padrón.',
    credit: 'Diego Delso · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Ayuntamiento_de_Valencia,_Espa%C3%B1a,_2014-06-30,_DD_120.JPG',
  } }],
  nie: [{ phrase: 'bank account', photo: BANK }],
  tasa: [{ phrase: 'first TIE', photo: {
    src: DOCS + 'tie-front.jpg',
    alt: 'Official specimen of the front of the Spanish residence card',
    caption: 'The TIE card (official EU specimen for Spain).',
    credit: 'European Union, EUR-Lex · CC BY 4.0 · cropped',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Aufenthaltstitel_Europa-Muster_2019.png',
  } }],
}
