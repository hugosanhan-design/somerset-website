import register from '@/public/courses/spanish-expats/images.json'

export type PhotoKeySE = 'ayuntamiento' | 'plaza-ayuntamiento' | 'plaza-reina'

type Entry = {
  file: string; alt: string; author: string; licence: string; licence_url: string; url: string
}

const FOCUS: Record<PhotoKeySE, string> = {
  'ayuntamiento': 'center 40%',
  'plaza-ayuntamiento': 'center 60%',
  'plaza-reina': 'center 55%',
}

export function photoSE(key: PhotoKeySE) {
  const e = (register as Entry[]).find(x => x.file === `${key}.jpg`)!
  return {
    src: `/courses/spanish-expats/${e.file}`,
    alt: e.alt,
    focus: FOCUS[key],
    author: e.author,
    licence: e.licence,
    licenceUrl: e.licence_url,
    page: e.url,
  }
}
