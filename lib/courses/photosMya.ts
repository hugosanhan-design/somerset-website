// Course header photos for Monday Young Adults. Register: public/courses/monday-young-adults/images.json (copied from the PET course, same photos and credits).
// public/courses/monday-young-adults/images.json, as the Somerset image rules require; this file
// reads it so credits on the page can never drift from the register.
import register from '@/public/courses/monday-young-adults/images.json'

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
  return { src: `/courses/monday-young-adults/${e.file}`, alt: e.alt, focus: FOCUS[key], author: e.author, licence: e.licence, licenceUrl: e.licence_url, page: e.url }
}
