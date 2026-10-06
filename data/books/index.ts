// The book shelf. One entry per coursebook the academy actually teaches from.
//
// Adding a book: drop a JSON file next to this one in the shape of BookFile and
// register it below. Nothing else in the app needs to change.
//
// The rule that matters: a book entry must be TRANSCRIBED from the publisher's own
// vocabulary reference and contents page, never reconstructed from a teacher's book
// or from memory. On 15 Sep 2026 a worksheet built from teacher's-book notes alone
// used two personality adjectives that are not in the unit and missed two that are.
// That is the failure this file exists to prevent.

import legacyCloseUpB1 from './closeUpB1.json'
import newCloseUpB2SplitA from './newCloseUpB2SplitA.json'

export interface Word {
  w: string
  /** The publisher's own example sentence. Preferred: it fixes register and level. */
  ex?: string
  pos?: string
  def?: string
}

export interface VocabSection {
  name: string
  words: Word[]
}

export interface BookUnit {
  unit: number
  title: string
  /** Student's Book page range, e.g. "5-16". */
  sbPages?: string
  /** Page in the teacher's book where this unit's notes start. */
  tbPage?: number
  grammar?: string[]
  reading?: string
  listening?: string
  speaking?: string
  writing?: string
  useOfEnglish?: string
  liveWell?: string
  video?: string
  sections: VocabSection[]
}

export interface Book {
  id: string
  name: string
  level: string
  exam?: string
  publisher?: string
  note?: string
  source?: string
  teachersBook?: string
  /** true when the unit data came from the publisher's own pages. */
  verified: boolean
  units: BookUnit[]
}

interface LegacyUnit { unit: number; title: string; words: Word[] }

const b1Legacy: Book = {
  id: 'closeup-b1-legacy',
  name: 'Close-up B1 (old edition)',
  level: 'B1',
  publisher: 'National Geographic Learning',
  note: 'The previous edition. Kept only for material built before Sep 2026. The 2026-27 B1 groups use New Close-up B1, which is not on the shelf yet.',
  verified: false,
  units: (legacyCloseUpB1 as LegacyUnit[]).map(u => ({
    unit: u.unit,
    title: u.title,
    sections: [{ name: 'Unit wordlist', words: u.words }],
  })),
}

const b2SplitA = newCloseUpB2SplitA as unknown as Omit<Book, 'verified'>

export const BOOKS: Book[] = [
  { ...b2SplitA, verified: true },
  b1Legacy,
]

export function getBook(id: string): Book | undefined {
  return BOOKS.find(b => b.id === id)
}

export function getUnit(bookId: string, unit: number): { book: Book; unit: BookUnit } | undefined {
  const book = getBook(bookId)
  const found = book?.units.find(u => u.unit === Number(unit))
  return book && found ? { book, unit: found } : undefined
}

/** The word list as the prompt sees it: grouped by the book's own section headings. */
export function wordListForPrompt(unit: BookUnit): string {
  return unit.sections
    .map(section => {
      const lines = section.words.map(w => {
        if (w.ex) return `  ${w.w}, e.g. "${w.ex}"`
        if (w.def) return `  ${w.w}${w.pos ? ` (${w.pos})` : ''}: ${w.def}`
        return `  ${w.w}`
      })
      return `${section.name.toUpperCase()}\n${lines.join('\n')}`
    })
    .join('\n\n')
}

/** Everything the book says this unit teaches, other than the vocabulary. */
export function strandsForPrompt(unit: BookUnit): string {
  const rows: [string, string | undefined][] = [
    ['Grammar', unit.grammar?.join(' · ')],
    ['Reading skill', unit.reading],
    ['Listening skill', unit.listening],
    ['Speaking', unit.speaking],
    ['Writing', unit.writing],
    ['Use of English', unit.useOfEnglish],
    ['Live well, study well', unit.liveWell],
    ['Video', unit.video],
  ]
  return rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')
}
