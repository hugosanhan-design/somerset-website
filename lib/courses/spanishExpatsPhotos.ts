// Real images for the Spanish for Expats vocabulary cards — every file is logged in
// public/courses/spanish-expats/images.json (source, licence, author).

export type CoursePhoto = { src: string; alt: string; caption: string; credit: string; creditUrl: string }

const DOCS = '/courses/spanish-expats/docs/'

// Keyed by VOCAB_M1 id. The caption is only shown after the learner answers (it names the term).
export const VOCAB_PHOTOS: Record<string, CoursePhoto> = {
  nie: {
    src: DOCS + 'ex15-form-page1.jpg',
    alt: 'First page of the blank EX-15 form',
    caption: 'Form EX-15 — the official application for your NIE number.',
    credit: 'Gobierno de España · blank official form',
    creditUrl: 'https://www.inclusion.gob.es/web/migraciones/modelos-generales',
  },
  tie: {
    src: DOCS + 'tie-front.jpg',
    alt: 'Official specimen of the front of the Spanish residence card',
    caption: 'The TIE card (official EU specimen for Spain) — your photo, name and NIE go in the numbered boxes.',
    credit: 'European Union, EUR-Lex · CC BY 4.0 · cropped',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Aufenthaltstitel_Europa-Muster_2019.png',
  },
  empadronamiento: {
    src: '/courses/spanish-expats/ayuntamiento.jpg',
    alt: 'The Ayuntamiento (town hall) of Valencia',
    caption: 'You register your address with the Ajuntament de València — the city council.',
    credit: 'Diego Delso · CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Ayuntamiento_de_Valencia,_Espa%C3%B1a,_2014-06-30,_DD_120.JPG',
  },
}
