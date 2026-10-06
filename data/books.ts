export type VocabSection = {
  name: string
  words: string[]
}

export type BookUnit = {
  unit: number
  title: string
  sbPages?: string
  grammar?: string[]
  vocab?: string[]
  strands?: string[]
  sections?: VocabSection[]
}

export type Book = {
  id: string
  name: string
  publisher?: string
  level: string
  exam?: string
  note?: string
  verified: boolean
  units: BookUnit[]
}

export const BOOKS: Book[] = [
  {
    id: 'close-up-b1',
    name: 'Close-Up',
    publisher: 'National Geographic Learning',
    level: 'B1',
    exam: 'PET/B1 Preliminary',
    verified: true,
    units: [
      {
        unit: 1, title: 'Me & My Day', sbPages: '6–17',
        grammar: ['present simple', 'present continuous'],
        vocab: ['teacher', 'nurse', 'engineer', 'journalist', 'chef', 'pilot', 'architect', 'accountant', 'doctor', 'lawyer', 'mechanic', 'programmer'],
        strands: ['jobs and work', 'daily routines', 'personality adjectives', 'present tenses contrast'],
      },
      {
        unit: 2, title: 'Family Matters', sbPages: '18–29',
        grammar: ['past simple', 'used to'],
        vocab: ['relative', 'sibling', 'niece', 'nephew', 'twin', 'stepmother', 'cousin', 'generation', 'raise', 'inherit'],
        strands: ['family relationships', 'childhood memories', 'past habits'],
      },
      {
        unit: 3, title: 'Out & About', sbPages: '30–41',
        grammar: ['going to', 'will', 'present continuous for future'],
        vocab: ['tube', 'tram', 'ferry', 'coach', 'crossroads', 'roundabout', 'junction', 'landmark', 'pedestrian', 'rush hour'],
        strands: ['transport and travel', 'giving directions', 'future plans and predictions'],
      },
      {
        unit: 4, title: 'Food & Health', sbPages: '42–53',
        grammar: ['countable and uncountable nouns', 'quantifiers'],
        vocab: ['ingredient', 'portion', 'recipe', 'nutritious', 'fibre', 'protein', 'dairy', 'wholegrain', 'processed', 'supplement'],
        strands: ['food and diet', 'health and wellbeing', 'cooking vocabulary'],
      },
      {
        unit: 5, title: 'Travel & Adventure', sbPages: '54–65',
        grammar: ['present perfect simple', 'past simple'],
        vocab: ['destination', 'itinerary', 'excursion', 'budget', 'souvenir', 'passport', 'customs', 'backpacker', 'expedition', 'trek'],
        strands: ['travel and tourism', 'adventure activities', 'present perfect vs past simple'],
      },
      {
        unit: 6, title: 'Work & Study', sbPages: '66–77',
        grammar: ['modal verbs for obligation and permission', 'passive voice simple'],
        vocab: ['qualification', 'internship', 'salary', 'deadline', 'colleague', 'overtime', 'promotion', 'graduate', 'apprentice', 'freelance'],
        strands: ['world of work', 'education systems', 'obligation and permission'],
      },
      {
        unit: 7, title: 'Technology', sbPages: '78–89',
        grammar: ['defining relative clauses', 'reported speech'],
        vocab: ['upload', 'download', 'software', 'hardware', 'app', 'bandwidth', 'wireless', 'cursor', 'interface', 'update'],
        strands: ['technology and the internet', 'gadgets and devices', 'reporting what people say'],
      },
      {
        unit: 8, title: 'Arts & Entertainment', sbPages: '90–101',
        grammar: ['first and second conditional', 'wishes and regrets'],
        vocab: ['gallery', 'exhibition', 'performance', 'rehearsal', 'soundtrack', 'plot', 'cast', 'premiere', 'critic', 'audience'],
        strands: ['arts and culture', 'film and music', 'conditional sentences'],
      },
    ],
  },
  {
    id: 'close-up-b2',
    name: 'Close-Up',
    publisher: 'National Geographic Learning',
    level: 'B2',
    exam: 'FCE/B2 First',
    verified: false,
    units: [
      {
        unit: 1, title: 'Identity', sbPages: '6–17',
        grammar: ['advanced tenses review', 'aspect'],
        vocab: ['identity', 'heritage', 'multicultural', 'prejudice', 'stereotype', 'perception', 'trait', 'individuality'],
        strands: ['personal identity and culture', 'tense and aspect revision'],
      },
      {
        unit: 2, title: 'Society', sbPages: '18–29',
        grammar: ['passive structures', 'causative have/get'],
        vocab: ['campaign', 'legislation', 'charity', 'volunteer', 'inequality', 'community', 'protest', 'initiative'],
        strands: ['society and social issues', 'passive voice advanced'],
      },
      {
        unit: 3, title: 'Science & Nature', sbPages: '30–41',
        grammar: ['third conditional', 'mixed conditionals'],
        vocab: ['species', 'habitat', 'ecosystem', 'conservation', 'biodiversity', 'endangered', 'renewable', 'sustainable'],
        strands: ['science and environment', 'hypothetical and unreal conditions'],
      },
      {
        unit: 4, title: 'Media', sbPages: '42–53',
        grammar: ['reported speech', 'reporting verbs'],
        vocab: ['broadcast', 'editorial', 'censorship', 'bias', 'circulation', 'paparazzi', 'podcast', 'viral'],
        strands: ['media and journalism', 'reporting and quoting'],
      },
      {
        unit: 5, title: 'Global Issues', sbPages: '54–65',
        grammar: ['emphasis and inversion', 'cleft sentences'],
        vocab: ['poverty', 'aid', 'conflict', 'refugee', 'migration', 'diplomacy', 'sanction', 'humanitarian'],
        strands: ['global challenges', 'emphasis structures'],
      },
      {
        unit: 6, title: 'Business & Economy', sbPages: '66–77',
        grammar: ['discourse markers', 'cohesion devices'],
        vocab: ['entrepreneur', 'revenue', 'investment', 'merger', 'dividend', 'startup', 'recession', 'inflation'],
        strands: ['business and finance', 'linking and cohesion'],
      },
      {
        unit: 7, title: 'Arts & Culture', sbPages: '78–89',
        grammar: ['participle clauses', 'nominalization'],
        vocab: ['curator', 'restoration', 'heritage', 'mural', 'installation', 'commission', 'portrayal', 'aesthetic'],
        strands: ['arts and culture', 'complex sentence structures'],
      },
      {
        unit: 8, title: 'Future Trends', sbPages: '90–101',
        grammar: ['future perfect', 'future continuous'],
        vocab: ['automation', 'artificial intelligence', 'renewable', 'biotechnology', 'urbanisation', 'innovation', 'disruption', 'wearable'],
        strands: ['technology and the future', 'future tenses'],
      },
    ],
  },
]

export function getUnit(bookId: string, unit: number): { book: Book; unit: BookUnit } | null {
  const book = BOOKS.find(b => b.id === bookId)
  if (!book) return null
  const unitData = book.units.find(u => u.unit === unit)
  if (!unitData) return null
  return { book, unit: unitData }
}

export function wordListForPrompt(unitData: BookUnit): string {
  if (unitData.sections?.length) {
    return unitData.sections.map(s => `${s.name}:\n${s.words.join(', ')}`).join('\n\n')
  }
  if (!unitData.vocab?.length) return '(no vocabulary recorded for this unit)'
  return unitData.vocab.join(', ')
}

export function strandsForPrompt(unitData: BookUnit): string {
  const parts: string[] = []
  if (unitData.strands?.length) parts.push(...unitData.strands)
  if (unitData.grammar?.length) parts.push(`Grammar: ${unitData.grammar.join(', ')}`)
  return parts.join('\n') || ''
}
