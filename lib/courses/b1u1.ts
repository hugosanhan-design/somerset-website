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

// ─── Mirror of New Close-up B1 Unit 1 "Perfect for the job" (added 13 Oct 2026) ────────────
// The book's syllabus and task shapes; our own sentences (the book's texts stay in the book).
// Plain objects so this file stays free of React; the page maps them to Deck items.

export type PlainChoice = { id: string; kind: 'choice'; q: string; options: string[]; answer: number; after?: string }
export type PlainGap = { id: string; kind: 'gap'; before: string; after?: string; answers: string[]; bank?: string[] }
export type PlainDeckItem = PlainChoice | PlainGap

const ch = (id: string, q: string, options: string[], answer: number, after?: string): PlainChoice => ({ id, kind: 'choice', q, options, answer, after })
const gap = (id: string, before: string, answers: string[], after?: string, bank?: string[]): PlainGap => ({ id, kind: 'gap', before, after, answers, bank })

// Grammar 1b — the other uses of the two tenses (book p9 grammar guide)
export const TENSE_USE_QS: PlainChoice[] = [
  ch('use:0', 'Water ___ at 100 degrees.', ['boils', 'is boiling', 'boil'], 0, 'A fact or general truth: present simple.'),
  ch('use:1', 'The train to Castelló ___ at 8:15 tomorrow.', ['leaves', 'is leaving', 'leave'], 0, 'A timetable or schedule, even for the future: present simple.'),
  ch('use:2', "We ___ to a new flat in Benimaclet next week — it's all arranged.", ['are moving', 'move', 'moves'], 0, 'A fixed arrangement for the future: present continuous.'),
  ch('use:3', 'My brother ___ my headphones without asking!', ['is always taking', 'always takes', 'always take'], 0, 'An annoying habit: always + present continuous.'),
  ch('use:4', 'Núria ___ for the Ajuntament — she has been there for ten years.', ['works', 'is working', 'work'], 0, 'A permanent situation: present simple.'),
  ch('use:5', "Pau ___ English this term because he wants to pass PET.", ['is studying', 'studies', 'study'], 0, 'A temporary or changing situation: present continuous.'),
  ch('use:6', 'In this photo, my cousins ___ in front of the Micalet.', ['are standing', 'stand', 'stands'], 0, 'Describing a picture: present continuous.'),
  ch('use:7', 'The mascletà ___ at two o’clock every day in Fallas.', ['starts', 'is starting', 'start'], 0, 'A schedule: present simple.'),
  ch('use:8', 'Look at the baby — he ___ so fast!', ['is growing up', 'grows up', 'grow up'], 0, 'A changing situation: present continuous.'),
  ch('use:9', 'In the film, the detective ___ to Valencia and ___ a secret.', ['travels … finds', 'is travelling … is finding', 'travel … find'], 0, 'Narratives, plots and commentaries: present simple.'),
]

// Adverbs of frequency and time expressions (book p9)
export const FREQ_QS: PlainChoice[] = [
  ch('freq:0', 'Which sentence puts the adverb in the right place?', ['I always walk to school.', 'I walk always to school.', 'Always I walk to school.'], 0, 'Adverbs of frequency go before the main verb.'),
  ch('freq:1', 'Which sentence puts the adverb in the right place?', ["You're always late.", "You always're late.", 'You are late always.'], 0, 'But after the verb be.'),
  ch('freq:2', '"I practise the guitar ___." Which is a present-simple time expression?', ['twice a week', 'at the moment', 'this afternoon'], 0),
  ch('freq:3', '"Dad is working ___." Which fits the present continuous?', ['tonight', 'every Friday', 'on Sundays'], 0),
  ch('freq:4', 'Put these in order from most to least often: often · hardly ever · usually', ['usually, often, hardly ever', 'often, usually, hardly ever', 'hardly ever, often, usually'], 0),
  ch('freq:5', "She's ___ texting during dinner — it drives her mum mad.", ['constantly', 'seldom', 'never'], 0, 'Annoying habits: always / constantly / forever + continuous.'),
  ch('freq:6', 'We go to the Albufera ___.', ['every other weekend', 'right now', 'for the time being'], 0),
  ch('freq:7', '"I ___ eat meat." = almost never', ['hardly ever', 'usually', 'often'], 0),
]

// Spelling: he/she/it -s/-es/-ies and -ing forms (book p9)
export const SPELL_QS: PlainGap[] = [
  gap('sp:0', 'I watch TV. → He', ['watches'], 'TV.'),
  gap('sp:1', 'I try hard. → She', ['tries'], 'hard.'),
  gap('sp:2', 'I play padel. → He', ['plays'], 'padel.'),
  gap('sp:3', 'I go to Ruzafa. → She', ['goes'], 'to Ruzafa.'),
  gap('sp:4', 'I fix bikes. → He', ['fixes'], 'bikes.'),
  gap('sp:5', 'sit → I am', ['sitting'], 'by the river.'),
  gap('sp:6', 'make → She is', ['making'], 'horchata.'),
  gap('sp:7', 'admit → He is', ['admitting'], 'he was wrong.'),
  gap('sp:8', 'enter → They are', ['entering'], 'the Mercat.'),
  gap('sp:9', 'travel → We are', ['travelling', 'traveling'], 'to Alicante.'),
  gap('sp:10', 'wear → You are', ['wearing'], 'my jacket!'),
]

// Stative or action? Verbs with two meanings, plus have vs have got (book p9 + Look! box)
export const STATIVE2_QS: PlainChoice[] = [
  ch('st2:0', 'I ___ this paella is the best in El Palmar.', ['think', 'am thinking'], 0, 'think = opinion: stative.'),
  ch('st2:1', "Be quiet, I ___ about the answer.", ['am thinking', 'think'], 0, 'think about = have on your mind: action.'),
  ch('st2:2', 'This horchata ___ great.', ['tastes', 'is tasting'], 0, 'taste = has a flavour: stative.'),
  ch('st2:3', 'The chef ___ the soup to check the salt.', ['is tasting', 'tastes'], 0, 'taste = the action of trying: action.'),
  ch('st2:4', 'I ___ Marta at the Plaza de la Reina at six.', ['am seeing', 'see'], 0, 'see = meet: action.'),
  ch('st2:5', '"The bus is late again." "I ___."', ['see', 'am seeing'], 0, 'see = understand: stative.'),
  ch('st2:6', 'We ___ lunch at the moment — can I call you back?', ['are having', 'have'], 0, 'have = eat: action.'),
  ch('st2:7', 'My grandfather ___ a boat on the Albufera.', ['has', 'is having'], 0, 'have = own: stative.'),
  ch('st2:8', "Amina ___ just ___ silly today — she's usually very serious.", ['is … being', 'is … be', '… is'], 0, 'be + -ing for behaviour that is not normal: action.'),
  ch('st2:9', 'I ___ an email from the school about the exam.', ['am expecting', 'expect'], 0, 'expect = wait for: action.'),
]
export const HAVEGOT_QS: PlainChoice[] = [
  ch('hg:0', 'Which is correct?', ["I've got two sisters.", "I'm having two sisters."], 0, 'Possession and relationships: have / have got.'),
  ch('hg:1', 'Which is correct?', ["She's having a shower now.", "She's got a shower now."], 0, 'Actions (a shower, lunch, a party): have, never have got.'),
  ch('hg:2', 'Which is correct?', ["Have you got a bike?", "Do you have got a bike?"], 0, 'Question with have got: Have you got…?'),
  ch('hg:3', 'Which is correct?', ["We don't have much time.", "We don't have got much time."], 0, 'Negative with have: don’t have. With have got: haven’t got.'),
  ch('hg:4', 'Which is correct?', ["He hasn't got a job at the moment.", "He hasn't a job got at the moment."], 0),
  ch('hg:5', 'Which is correct?', ['They have breakfast at the bar every day.', 'They have got breakfast at the bar every day.'], 0, 'have breakfast = eat: an action, so no have got.'),
]

// Personality — the five book adjectives the picture lesson does not cover (book p8)
export const PERS2_QS: PlainChoice[] = [
  ch('pers2:0', 'Before an exam, Carla bites her nails and can’t sit still. She’s', ['nervous', 'relaxed', 'lazy'], 0),
  ch('pers2:1', 'On Sunday afternoons my dad lies on the sofa with no plans at all. He’s completely', ['relaxed', 'nervous', 'miserable'], 0),
  ch('pers2:2', 'The waiter shouted at the old man for being slow. That was', ['unkind', 'generous', 'cheerful'], 0),
  ch('pers2:3', 'Joan never does his homework and leaves everything to the last minute. He’s', ['lazy', 'hard-working', 'reliable'], 0),
  ch('pers2:4', 'It rained all week in Somerset and Tom didn’t smile once. He was', ['miserable', 'cheerful', 'sociable'], 0),
  ch('pers2:5', 'Opposites: hard-working ↔', ['lazy', 'unkind', 'nervous'], 0),
  ch('pers2:6', 'Opposites: cheerful ↔', ['miserable', 'relaxed', 'patient'], 0),
  ch('pers2:7', 'Opposites: nervous ↔', ['relaxed', 'reliable', 'confident'], 0),
]

// Vocabulary 2 — employment words and life events with phrasal verbs (book p12)
export const EMPLOY_QS: PlainChoice[] = [
  ch('emp:0', 'A person who is trying to get a particular job:', ['candidate', 'qualification', 'retired'], 0),
  ch('emp:1', 'Working all the usual hours of the week, not just some of them:', ['full-time', 'unemployed', 'out of work'], 0),
  ch('emp:2', 'A certificate or exam you have passed:', ['qualification', 'candidate', 'career'], 0),
  ch('emp:3', 'No longer working because you are 65 or older:', ['retired', 'unemployed', 'full-time'], 0),
  ch('emp:4', 'Without a job:', ['unemployed', 'retired', 'full-time'], 0),
  ch('emp:5', 'To write to a company asking for a job:', ['apply', 'retire', 'qualify'], 0),
  ch('emp:6', '"My uncle is ___ work at the moment, but he has an interview on Friday."', ['out of', 'off', 'without'], 0),
]
export const LIFE_QS: PlainGap[] = [
  gap('life:0', 'Sara was born in Bristol but she grew', ['up'], 'in Valencia.', ['up', 'out', 'to', 'for', 'with', 'married']),
  gap('life:1', 'My parents got', ['married'], 'in the Basílica in 1998.', ['up', 'out', 'to', 'for', 'with', 'married']),
  gap('life:2', 'Pau started going out', ['with'], 'Laia at the Fallas last year.', ['up', 'out', 'to', 'for', 'with', 'married']),
  gap('life:3', 'They split', ['up'], 'after six months, but they are still friends.', ['up', 'out', 'to', 'for', 'with', 'married']),
  gap('life:4', 'She left school at eighteen and went', ['to'], 'university in Castelló.', ['up', 'out', 'to', 'for', 'with', 'married']),
  gap('life:5', 'My grandmother was brought', ['up'], 'by her aunt in Morocco.', ['up', 'out', 'to', 'for', 'with', 'married']),
  gap('life:6', 'He applied', ['for'], 'a job as a lifeguard at the Malvarrosa.', ['up', 'out', 'to', 'for', 'with', 'married']),
  gap('life:7', 'After university she got a job and moved', ['out'], 'of her parents’ flat.', ['up', 'out', 'to', 'for', 'with', 'married']),
]

// Grammar 2 — countable and uncountable nouns (book p13)
export const COUNT_QS: PlainChoice[] = [
  ch('cu:0', 'advice', ['uncountable', 'countable'], 0, 'Abstract nouns like advice, information, news are uncountable: a piece of advice.'),
  ch('cu:1', 'qualification', ['countable', 'uncountable'], 0),
  ch('cu:2', 'traffic', ['uncountable', 'countable'], 0),
  ch('cu:3', 'candidate', ['countable', 'uncountable'], 0),
  ch('cu:4', 'homework', ['uncountable', 'countable'], 0, 'Even though it ends in -s in your head: homework, not homeworks.'),
  ch('cu:5', 'news — "The news ___ bad."', ['is', 'are'], 0, 'news looks plural but is uncountable: it takes a singular verb.'),
  ch('cu:6', 'furniture', ['uncountable', 'countable'], 0),
  ch('cu:7', '"Two ___, please!" — in a bar', ['coffees', 'coffee'], 0, 'coffee = the drink is uncountable; coffees = cups: countable.'),
  ch('cu:8', '"This window is made of ___."', ['glass', 'glasses', 'a glass'], 0, 'glass = the material: uncountable.'),
  ch('cu:9', '"She studies ___ at the university."', ['medicine', 'medicines', 'a medicine'], 0, 'medicine = the subject: uncountable; medicines = pills: countable.'),
  ch('cu:10', '"There isn’t much ___ in this flat." (space)', ['room', 'rooms', 'a room'], 0, 'room = space: uncountable. a room = a part of a house: countable.'),
  ch('cu:11', '"Can I give you a ___ of advice?"', ['piece', 'slice', 'bit'], 0, 'To count an uncountable noun: a piece of.'),
]
export const PLURAL_QS: PlainGap[] = [
  gap('pl:0', 'one person → two', ['people']),
  gap('pl:1', 'one child → three', ['children']),
  gap('pl:2', 'one woman → two', ['women']),
  gap('pl:3', 'one foot → two', ['feet']),
  gap('pl:4', 'one tooth → thirty-two', ['teeth']),
  gap('pl:5', 'one mouse → ten', ['mice']),
  gap('pl:6', 'one knife → six', ['knives']),
  gap('pl:7', 'one fish → a lot of', ['fish']),
  gap('pl:8', 'one leaf → many', ['leaves']),
]
export const QUANT_QS: PlainChoice[] = [
  ch('qt:0', '"Have you got ___ milk?" "Yes, there’s ___ in the fridge."', ['any … a little', 'some … a few', 'many … some'], 0, 'any in questions; a little with uncountable nouns.'),
  ch('qt:1', '"How ___ oranges do you want?" "Just ___ ."', ['many … a few', 'much … a little', 'many … a little'], 0, 'many / a few with countable nouns.'),
  ch('qt:2', 'There wasn’t ___ sugar in the horchata.', ['much', 'many', 'a few'], 0, 'much with uncountable, in negatives and questions.'),
  ch('qt:3', 'We’ve got ___ bread, but no cheese.', ['some', 'any', 'many'], 0, 'some in affirmative sentences.'),
  ch('qt:4', 'Not ___ people came to the concert at the Palau.', ['many', 'much', 'a little'], 0),
  ch('qt:5', 'There are ___ children in the park today — it’s empty.', ['no', 'any', 'some'], 0, 'no = affirmative sentence with a negative meaning.'),
  ch('qt:6', 'Would you like ___ coffee?', ['some', 'any', 'many'], 0, 'Offers and requests use some, even in questions.'),
  ch('qt:7', 'He doesn’t do ___ exercise.', ['enough', 'many', 'a few'], 0),
  ch('qt:8', 'We need ___ kilo of tomatoes for the gazpacho.', ['a', 'some', 'many'], 0, 'A specific quantity: a kilo of, two litres of.'),
  ch('qt:9', '___ students didn’t turn up — only three.', ['A few', 'A little', 'Much'], 0),
  ch('qt:10', 'You only need to add ___ salt.', ['a bit of', 'a few', 'several'], 0, 'a bit of / a great deal of with uncountable nouns.'),
  ch('qt:11', 'There are ___ reasons to visit the Albufera.', ['plenty of', 'much', 'a little'], 0, 'plenty of / lots of / a lot of go with both.'),
]

// ─── Reading Part 4 (gapped text), approved by Hugo 14 Oct 2026 ─────────────────────────────
// B1 Preliminary Reading Part 4: one text, five sentences removed, eight options, three distractors.
// Our own text (the syllabus of New Close-up B1 Unit 1: jobs, personality, present tenses).
export const READING_PART4 = {
  title: 'A new job at the Ciutat',
  paragraphs: [
    "Last month I saw an advert on the Ciutat de les Arts i les Ciències website: *Guides wanted for the Science Museum. Part-time, weekends. Candidates must speak Spanish and English.* I love science and I'm quite sociable, so I decided to apply. {1}",
    'The interview was on a Tuesday morning. I’m usually very confident, but that day I was nervous. There were three candidates: me, a hairdresser from Ruzafa called Marina, and a man called Bruno who was carrying a large camera. “I’m filming the planetarium this week for another project,” he explained. {2}',
    'The interviewer asked us about our jobs. Marina said she cuts hair every day but wants a change, because she talks to people all day and knows a lot about science. Bruno said he is a camera operator on Fridays and is quite shy at first, but reliable: he never misses a shift. {3} I said that I’m studying biology at the moment and that I demonstrate the space suits at the astronaut exhibit on Saturdays, so I already know the museum well.',
    'Then she asked a difficult question: “What kind of person are you?” {4} In the end I said “patient”, because I spend hours explaining things to my little brother, and he never listens the first time.',
    'At the end, the interviewer said, “Thank you all. I’m making my decision by Friday.” {5} On Friday afternoon my phone rang. It was the museum. I start next Saturday.',
  ],
  options: [
    { id: 'A', text: "I thought about it for a long time, because I didn't want to say something that wasn't true." },
    { id: 'B', text: 'Everyone laughed, and the interviewer told him to put it on the floor.' },
    { id: 'C', text: 'The museum is open every day of the year except Christmas.' },
    { id: 'D', text: 'I filled in the online form that evening and sent my CV.' },
    { id: 'E', text: 'I went home and tried not to think about it, but I checked my phone constantly.' },
    { id: 'F', text: 'He also said he enjoys working alone, which I thought was a strange thing to say for a guide.' },
    { id: 'G', text: 'My brother is three years older than me and works in a bank.' },
    { id: 'H', text: "The hairdresser's in Ruzafa closes at eight o'clock on Saturdays." },
  ],
  answers: ['D', 'B', 'F', 'A', 'E'],
  why: [
    'Sequence: "I decided to apply" is followed by "that evening" I filled in the form.',
    '"him" and "it" point back to Bruno and his camera.',
    '"He also said" continues Bruno’s answer; the next sentence starts a new speaker, "I said".',
    '"A difficult question" is followed by "I thought about it"; "In the end I said" comes next.',
    'Time link: "by Friday" then "I checked my phone constantly" then "On Friday afternoon my phone rang".',
  ],
}
