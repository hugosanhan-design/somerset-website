// Curated B2 topic word bank, converted from Somerset Worksheets/B2 intensive/b2_topic_vocab.py
// (Sara's course-wide "B2 Topic Vocab" bank). Used as an exam-aligned anchor when the
// Context Lab generates a B2 lesson pack for one of these topics — the model is told to
// prefer these words. Not used for other levels or custom topics (those are pure AI generation).

export const TOPIC_PRESETS = [
  'Crime',
  'Travel',
  'Food',
  'Environment',
  'Work',
  'City & Country',
  'Technology',
  'Health',
  'Entertainment',
  'Money',
  'Family',
  'Festivals',
  'Education',
  'Sport',
] as const

// Maps a preset (or its lowercase form) to a key in B2_SEED_VOCAB below.
const TOPIC_TO_SEED_KEY: Record<string, string> = {
  crime: 'crime',
  travel: 'holidays',
  food: 'food',
  environment: 'environment',
  work: 'work',
  'city & country': 'city',
  technology: 'technology',
  health: 'health',
  entertainment: 'entertainment',
  money: 'money',
  family: 'family',
  festivals: 'festivals',
  education: 'education',
  sport: 'sport',
}

// Raw word/collocation lists, flattened from the Python bank. Sentence-like entries
// ("How did you do in your exams?") are dropped — these become individual target
// words/collocations, not full sentences.
const B2_SEED_VOCAB: Record<string, string[]> = {
  crime: ['crime', 'murder', 'theft', 'robbery', 'burglary', 'break into', 'under arrest', 'go to court', 'jury', 'the guilty party', 'guilty of', 'put the blame on', 'steal', 'rob a bank', 'burgle'],
  city: ['a block of flats', 'detached', 'semi-detached', 'terraced', 'tenant', 'landlord', 'on the outskirts', 'leafy suburb', 'public transport', 'within walking distance', 'bustling neighbourhood', 'tree-lined avenues', 'rush hour', 'traffic jams', 'a no-go area', 'run-down buildings'],
  environment: ['thunderstorm', 'a light shower', 'rainforest', 'waterfall', 'scenery', 'fossil fuels', 'greenhouse gases', 'the ozone layer', 'climate change', 'droughts', 'cut down trees', 'energy-efficient', 'recycle', 'plant trees', 'resources'],
  entertainment: ['fashionable', 'a street market', 'bargains', 'window shopping', 'go clubbing', 'sightseeing', 'a superb performance', 'starring', "what's on at the cinema", 'not my cup of tea', 'a documentary', 'a reality show', 'a live performance', 'a catchy tune', 'a cover version'],
  family: ['the in-laws', 'a stepfamily', 'get on with', 'a close relationship', 'curly hair', 'slim build', 'a toddler', 'in his early forties', 'outgoing', 'a good sense of humour', 'hard-working', 'painfully shy', 'rather reserved', 'tactless', 'talkative'],
  festivals: ['a firework display', 'dress up as', 'commemorate', 'a parade', 'a float', 'traditional dress', 'street performers', 'engagement', 'get married', 'bride', 'groom', 'best man', 'reception', 'bouquet', 'honeymoon'],
  food: ['flavour', 'stale', 'additives', 'a balanced diet', 'utensils', 'appliances', 'a saucepan', 'main course', 'value for money', 'trendy', 'a starter', 'the set menu', 'eat à la carte'],
  health: ['yawn', 'sneeze', 'twist your ankle', 'ache', 'an injury', 'a wound', 'a sore throat', 'feel run down', 'a bandage', 'have an operation', 'the casualty department', 'make an appointment', 'a prescription', 'cut down on', 'put on weight', 'go on a diet'],
  holidays: ['a trip', 'departures', 'boarding pass', 'book in advance', 'budget flights', 'cabin crew', 'go sightseeing', 'stroll', 'get lost', 'off the beaten track', 'a resort', 'get a tan', 'get sunburnt', 'suntan lotion'],
  money: ['currency', 'spend on', 'waste', 'save', 'cashpoint', 'borrow', 'lend', 'interest rate', 'pay back', 'a loan', 'save up for', 'make ends meet'],
  sport: ['jogging', 'paragliding', 'take exercise', 'get fit', 'beat', 'draw', 'take up', 'give up', 'dangerous', 'adventurous', 'take risks', 'an injury'],
  education: ['a wide vocabulary', 'a degree', 'take an exam', 'pass an exam', 'fail an exam', 'revise', 'a good mark', 'do well in', 'a lecture', 'attend classes', 'an assignment', 'do research'],
  technology: ['hard drive', 'a memory stick', 'a laptop', 'make a backup copy', 'install software', 'anti-virus', 'log on', 'surf the web', 'instant messaging', 'a hacker', 'a blogger', 'a video clip', 'looking for likes'],
  work: ['earn', 'salary', 'wages', 'income tax', 'a pay rise', 'set up a company', 'in charge of', 'commute to work', 'apply for a job', 'be promoted', 'be sacked', 'quit', 'part-time', 'unemployed', 'an internship'],
}

/** Returns the school's curated B2 word list for a topic preset, or null if none exists (custom topic / not curated). */
export function getSeedWords(topic: string): string[] | null {
  const key = TOPIC_TO_SEED_KEY[topic.trim().toLowerCase()]
  if (!key) return null
  return B2_SEED_VOCAB[key] || null
}

export const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A2: 'Elementary — everyday topics, simple sentences',
  B1: 'Intermediate — familiar topics, some complexity',
  B2: 'Upper-intermediate — abstract topics, wide range',
  C1: 'Advanced — nuanced, idiomatic, sophisticated',
}

export const LEVEL_GRAMMAR_MENU: Record<string, string> = {
  A2: 'present simple, present continuous, past simple, going to (future), can/must for ability & obligation, there is/are, basic comparatives',
  B1: 'present perfect (simple), past continuous, will (future), first conditional, comparatives & superlatives, linkers (because, so, although), used to',
  B2: 'passive voice, second & third conditional, reported speech, relative clauses, a range of past forms (incl. past perfect), modals of deduction (must have, might have)',
  C1: 'inversion for emphasis, cleft sentences, mixed conditionals, hedging language, advanced cohesion devices, nuanced idiomatic usage',
}
