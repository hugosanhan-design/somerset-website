// Course header photos. The register (source, licence, author, alt) lives in
// public/courses/b1-unit-1/images.json, as the Somerset image rules require; this file
// reads it so credits on the page can never drift from the register.
import register from '@/public/courses/b1-unit-1/images.json'

export type PhotoKey = 'mercat-central' | 'fruit-stall' | 'hemisferic' | 'glastonbury-tor'
type Entry = { file: string; alt: string; author: string; licence: string; licence_url: string; url: string }

// Where to anchor the crop in thin lesson headers, so the subject stays in frame.
const FOCUS: Record<PhotoKey, string> = {
  'mercat-central': 'center 30%',
  'fruit-stall': 'center 55%',
  hemisferic: 'center 55%',
  'glastonbury-tor': '60% 72%',
}

export function photo(key: PhotoKey) {
  const e = (register as Entry[]).find(x => x.file === `${key}.jpg`)!
  return { src: `/courses/b1-unit-1/${e.file}`, alt: e.alt, focus: FOCUS[key], author: e.author, licence: e.licence, licenceUrl: e.licence_url, page: e.url }
}
