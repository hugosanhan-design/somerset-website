// B1 Unit 1 "Me & My Day": lesson content plus the item bank the Revise games draw from.
// Item ids are stored in students' saved progress, so never rename an existing id.

export const COURSE_ID = 'b1-unit-1'

export const JOBS = ['architect', 'athlete', 'actor', 'astronaut', 'camera operator', 'cook', 'firefighter', 'hairdresser', 'lawyer', 'librarian', 'politician', 'soldier']

export const JOB_QS: { q: string; a: string; emoji: string }[] = [
  { q: 'This person designs buildings and plans how they will look.', a: 'architect', emoji: '📐' },
  { q: "This person cuts and styles people's hair.", a: 'hairdresser', emoji: '💇' },
  { q: 'This person trains hard and competes in a sport professionally.', a: 'athlete', emoji: '🏃' },
  { q: 'This person represents people in court and gives legal advice.', a: 'lawyer', emoji: '⚖️' },
  { q: 'This person is trained to put out fires and rescue people.', a: 'firefighter', emoji: '🚒' },
  { q: 'This person prepares food in a restaurant or a market stall.', a: 'cook', emoji: '🍳' },
  { q: 'This person serves in the army and follows a strict routine.', a: 'soldier', emoji: '🪖' },
  { q: 'This person performs roles in films, TV or theatre.', a: 'actor', emoji: '🎭' },
  { q: 'This person is elected to make decisions for a city or country.', a: 'politician', emoji: '🏛️' },
  { q: 'This person looks after books and helps people find information.', a: 'librarian', emoji: '📚' },
  { q: 'This person films scenes for a TV show or a movie.', a: 'camera operator', emoji: '🎥' },
  { q: 'This person travels into space to do scientific research.', a: 'astronaut', emoji: '🚀' },
]

export const PERS_OPTIONS = ['calm', 'cheerful', 'confident', 'generous', 'hard-working', 'honest', 'patient', 'reliable', 'shy', 'sociable']

// `who` + `role` draw the person in the drag-and-drop lesson; TRAIT_FACE is how they look
// once the right adjective lands on them.
export const PERS_QS: { before: string; after: string; a: string; who: string; role: string; img: string; alt: string }[] = [
  { before: 'A firefighter needs to stay', after: 'even when the situation is dangerous.', a: 'calm', who: 'The firefighter', role: '🚒', img: '/courses/b1-unit-1/people/calm-firefighter.png', alt: 'A calm Spanish firefighter in a helmet, with soft smoke behind him' },
  { before: "Marta never lies to her friends, she's completely", after: '.', a: 'honest', who: 'Marta', role: '👧', img: '/courses/b1-unit-1/people/honest-marta.png', alt: 'Marta, a teenage girl, with one hand on her heart and an open, trusting look' },
  { before: "My uncle always gives his old tools to neighbours who need them, he's very", after: '.', a: 'generous', who: 'My uncle', role: '🧰', img: '/courses/b1-unit-1/people/generous-uncle.png', alt: 'A smiling man holding out a toolbox as a gift' },
  { before: 'An actor has to feel', after: 'in front of a big audience.', a: 'confident', who: 'The actor', role: '🎭', img: '/courses/b1-unit-1/people/confident-actor.png', alt: 'A young actor on stage under a spotlight, chin up and smiling' },
  { before: "Pau doesn't like meeting new people, he's quite", after: '.', a: 'shy', who: 'Pau', role: '👦', img: '/courses/b1-unit-1/people/shy-pau.png', alt: 'Pau, a teenage boy half hiding in his hood, looking down with a nervous smile' },
  { before: 'My grandmother is so', after: ", she's always smiling, even early in the morning.", a: 'cheerful', who: 'My grandmother', role: '👵', img: '/courses/b1-unit-1/people/cheerful-grandmother.png', alt: 'A woman with silver hair from Sydney, laughing and holding a cup of tea in morning light' },
  { before: 'A good lawyer explains things slowly and stays', after: 'with worried clients.', a: 'patient', who: 'The lawyer', role: '⚖️', img: '/courses/b1-unit-1/people/patient-lawyer.png', alt: 'A lawyer in Nairobi in a dark jacket, listening carefully with a calm and kind face' },
  { before: "You can always trust Elena to turn up on time, she's very", after: '.', a: 'reliable', who: 'Elena', role: '⏰', img: '/courses/b1-unit-1/people/reliable-elena.png', alt: 'Elena at Somerset Language Centre glancing at her watch with a confident nod, a wall clock showing nine o\'clock' },
  { before: "The market seller talks to every customer, she's really", after: '.', a: 'sociable', who: 'The market seller', role: '🍊', img: '/courses/b1-unit-1/people/sociable-market-seller.png', alt: 'A market seller at a fruit stall in the Mercat Central laughing and waving to two customers' },
  { before: 'Building a house takes a', after: "team who don't give up easily.", a: 'hard-working', who: 'The builders', role: '🏗️', img: '/courses/b1-unit-1/people/hard-working-builders.png', alt: 'Two builders in hard hats carrying bricks on a London building site, Big Ben in the background' },
]

export const TRAIT_FACE: Record<string, string> = {
  calm: '😌', honest: '😇', generous: '🤗', confident: '😎', shy: '😳',
  cheerful: '😄', patient: '🧘', reliable: '🫡', sociable: '🥳', 'hard-working': '💪',
}

// Grammar: text uses [1] and [2] as blank markers; options[n][1] is the tempting wrong tense.
export type GItem = { text: string; answers: string[]; options: string[][] }
export const GRAMMAR_QS: GItem[] = [
  // Valencia and Spain (~60%)
  { text: "Tomàs usually [1] football on Saturdays, but this week he [2] Dragon Ball because it's raining.", answers: ['plays', 'is watching'], options: [['plays', 'is playing', 'play'], ['is watching', 'watches', 'watch']] },
  { text: 'Laia always [1] her homework first when she gets home.', answers: ['does'], options: [['does', 'is doing', 'do']] },
  { text: 'The Mercado Central [1] at 7:30 every morning.', answers: ['opens'], options: [['opens', 'is opening', 'open']] },
  { text: 'My cousin usually [1] to work, but this week she [2] the metro because her bike is broken.', answers: ['cycles', 'is taking'], options: [['cycles', 'is cycling', 'cycle'], ['is taking', 'takes', 'take']] },
  { text: 'Right now, the firefighters [1] the streets of Ruzafa before the mascletà.', answers: ['are checking'], options: [['are checking', 'check', 'checks']] },
  { text: 'This month, the Valencia CF players [1] twice a day.', answers: ['are training'], options: [['are training', 'train', 'trains']] },
  // International (~40%): Somerset UK, Kenya, Australia
  { text: 'Look! Callum [1] his Somerset Language Centre hoodie today.', answers: ['is wearing'], options: [['is wearing', 'wears', 'wear']] },
  { text: 'Amina usually [1] at the weekend, but these days she [2] her brothers with their maths.', answers: ['paints', 'is helping'], options: [['paints', 'is painting', 'paint'], ['is helping', 'helps', 'help']] },
  { text: 'I usually [1] sushi, but tonight I [2] fish and chips with my host family in Somerset.', answers: ["don't eat", 'am having'], options: [["don't eat", "doesn't eat", 'am not eating'], ['am having', 'have', 'has']] },
  { text: 'Kofi usually [1] to school by bus, but this week he [2] because the roads are flooded.', answers: ['travels', 'is walking'], options: [['travels', 'is travelling', 'travel'], ['is walking', 'walks', 'walk']] },
]

// Stative verbs: `seg` is the verb phrase the student judges and, if wrong, replaces with `fix`.
export type SItem = { pre: string; seg: string; post: string; isWrong: boolean; fix?: string[] }
export const STATIVE_QS: SItem[] = [
  { pre: 'I', seg: "'m knowing", post: ' the answer already.', isWrong: true, fix: ['know'] },
  { pre: 'My uncle ', seg: 'is owning', post: ' two flats in Ruzafa.', isWrong: true, fix: ['owns'] },
  { pre: 'We', seg: "'re walking", post: ' to the Mercado Central right now.', isWrong: false },
  { pre: 'He', seg: "'s believing", post: ' every word the politician says.', isWrong: true, fix: ['believes'] },
  { pre: 'They', seg: "'re cooking", post: ' paella for twenty people today.', isWrong: false },
  { pre: 'I', seg: "'m wanting", post: ' to be an architect when I finish school.', isWrong: true, fix: ['want'] },
  { pre: 'This soup ', seg: 'is tasting', post: ' amazing.', isWrong: true, fix: ['tastes'] },
  // International examples
  { pre: 'The students at Somerset Language Centre ', seg: 'are understanding', post: ' the grammar now.', isWrong: true, fix: ['understand'] },
  { pre: 'Amina ', seg: 'is preferring', post: ' Nairobi to London.', isWrong: true, fix: ['prefers'] },
  { pre: 'The volunteers ', seg: 'are helping', post: ' at the food bank in Melbourne every Saturday.', isWrong: false },
]
export const stativeSentence = (s: SItem) => s.pre + s.seg + s.post
export const stativeCorrection = (s: SItem) => s.fix ? s.pre.replace(/\s*$/, ' ') + s.fix[0] + s.post : stativeSentence(s)

// ─── Item bank ────────────────────────────────────────────────────────────────

export type WordItem = { id: string; kind: 'word'; group: 'jobs' | 'personality'; clue: string; answer: string; emoji?: string }
export type FixItem = {
  id: string; kind: 'fix'; group: 'grammar' | 'stative' | 'own'
  pre: string; seg: string; post: string; isWrong: boolean; fix: string[]; why: string
}
export type Item = WordItem | FixItem

const SIMPLE_WHY = 'Routine, habit or fact (usually, always, every morning): present simple.'
const CONT_WHY = 'Happening now, this week or for a temporary period: present continuous.'
const STATIVE_WHY = 'Stative verbs (know, own, believe, want, taste) describe states, so they stay in the present simple.'

export const WORD_ITEMS: WordItem[] = [
  ...JOB_QS.map(j => ({ id: `job:${j.a}`, kind: 'word' as const, group: 'jobs' as const, clue: j.q, answer: j.a, emoji: j.emoji })),
  ...PERS_QS.map(p => ({ id: `pers:${p.a}`, kind: 'word' as const, group: 'personality' as const, clue: `${p.before} ____ ${p.after}`.replace(' .', '.'), answer: p.a })),
]

// Each grammar blank becomes one item, shown with the tempting wrong tense in place.
function grammarFixItems(): FixItem[] {
  const out: FixItem[] = []
  GRAMMAR_QS.forEach((g, qi) => {
    g.answers.forEach((ans, bi) => {
      const marker = `[${bi + 1}]`
      let filled = g.text
      g.answers.forEach((a, k) => { if (k !== bi) filled = filled.replace(`[${k + 1}]`, a) })
      const [pre, post] = filled.split(marker)
      const wrong = g.options[bi][1]
      out.push({
        id: `gram:${qi}:${bi}`, kind: 'fix', group: 'grammar',
        pre, seg: wrong, post, isWrong: true, fix: [ans],
        why: /\b(is|are|am)\b.*ing\b/.test(ans) ? CONT_WHY : SIMPLE_WHY,
      })
    })
  })
  return out
}

export const FIX_ITEMS: FixItem[] = [
  ...grammarFixItems(),
  ...STATIVE_QS.map((s, i) => ({
    id: `stat:${i}`, kind: 'fix' as const, group: 'stative' as const,
    pre: s.pre, seg: s.seg, post: s.post, isWrong: s.isWrong, fix: s.fix ?? [],
    why: s.isWrong ? STATIVE_WHY : 'Correct: cooking and walking are actions, so the continuous is fine for right now.',
  })),
]

export const ALL_ITEMS: Item[] = [...WORD_ITEMS, ...FIX_ITEMS]
export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ALL_ITEMS.map(i => [i.id, i]))

// ─── Answer checking ──────────────────────────────────────────────────────────

export function normalise(s: string): string {
  return s.trim().toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '')
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

// 'right' | 'close' (one or two letters off: a spelling slip) | 'wrong'
export function checkAnswer(given: string, accepted: string[]): 'right' | 'close' | 'wrong' {
  const g = normalise(given).replace(/-/g, ' ')
  if (!g) return 'wrong'
  let best = Infinity
  for (const a of accepted) {
    const n = normalise(a).replace(/-/g, ' ')
    if (g === n || g.replace(/ /g, '') === n.replace(/ /g, '')) return 'right'
    best = Math.min(best, levenshtein(g, n))
  }
  const longest = Math.max(...accepted.map(a => a.length))
  return best <= (longest >= 7 ? 2 : 1) ? 'close' : 'wrong'
}

// "camera operator" -> "c _ _ _ _ _   _ _ _ _ _ _ _ _"
export function letterHint(answer: string): string {
  return answer.split(' ').map((w, wi) => w.split('').map((ch, i) => (i === 0 && wi === 0) || ch === '-' ? ch : '_').join(' ')).join('   ')
}

// ─── Explainer videos (Hugo) ──────────────────────────────────────────────────
// Scripts: Somerset Worksheets/_COURSEBOOK_BLUEPRINT/B1-coursebook/pilot/video-scripts/.
// Until a video is recorded, the button shows the key points instead. To add one, put
// its unlisted YouTube video id in `youtube`.
export type ExplainerVideo = { title: string; youtube: string; points: string[] }
export const VIDEOS: Record<'welcome' | 'tenses' | 'stative', ExplainerVideo> = {
  welcome: {
    title: 'Welcome to Unit 1',
    youtube: '',
    points: [
      'Seven short lessons, in any order.',
      'Some lessons are great on your phone, some on a computer.',
      'Your plant grows every time you finish a lesson.',
      'An apple tree means you’re ready for PET.',
      'Press Revise in 5 every day: five minutes, even on the bus.',
    ],
  },
  tenses: {
    title: 'Usually… but this week',
    youtube: '',
    points: [
      'Present simple is the ALWAYS box: routines, habits, facts. I work, she works (don’t forget the s).',
      'Present continuous is the NOW box: this moment, this week, for a short time. I’m working, she’s working.',
      'Clue words: usually, always, every day → present simple. Now, at the moment, this week, Look! → present continuous.',
      'Spanish trap: “This year I’m studying in London”, not “This year I study in London”.',
    ],
  },
  stative: {
    title: 'Verbs that never take -ing',
    youtube: '',
    points: [
      'Some verbs are states, not actions: know, understand, want, like, love, own, taste, seem.',
      'They stay in the present simple, even for right now: I know, not I’m knowing.',
      'The trick: can you film it? If you can’t, don’t add -ing.',
      '“I have a dog” is a state, but “I’m having lunch” is an action (eating), so it’s fine.',
    ],
  },
}
