// Monday Young Adults · Digital week 1 ("Festivals around the world").
// Content is the Festivals Practice Pack (Wed 07 Oct 2026) turned into self-checking
// activities, plus the Lamu listening. Pure data: no window access at module level.

export type Item =
  | { id: string; kind: 'choice'; q: string; options: string[]; answer: number }
  | { id: string; kind: 'gap'; before: string; after?: string; answers: string[] }
  | { id: string; kind: 'match'; q: string; answer: number }

export type Exercise = {
  id: string
  title: string
  how: string
  bank?: string[]
  options?: string[] // shared options for 'match' items
  gloss?: string[] // Spanish for each item (same order), shown with the "Mostrar español" switch
  items: Item[]
  es: string // Spanish explanation, shown after checking
}

export type FreeTask = { id: string; title: string; how: string; prompts: string[]; minWords: number; model?: string }

export type Activity = {
  id: string
  no: number
  title: string
  time: string
  when: string
  blurb: string
  audio?: boolean
  exercises: Exercise[]
  free?: FreeTask[]
}

export const COURSE_ID = 'monday-young-adults'
export const OPEN_FROM = '2026-10-08'
export const OPEN_TO = '2026-10-15'

export const FACT_FILE = {
  head: ['Festival (place)', 'Started', 'When', 'Lasts', 'People (about)'],
  rows: [
    ['The Fallas (Valencia, Spain)', 'many years ago', '15-19 March', '5 days', 'no figure'],
    ['La Tomatina (Buñol, Spain)', '1945', 'last Wednesday of August', '1 hour', '20,000'],
    ['Glastonbury (Pilton, Somerset, England)', '1970', 'usually late June', '5 days', '200,000'],
    ['Notting Hill Carnival (London, England)', '1966', 'August bank holiday weekend', '3 days', 'up to 2 million (an estimate)'],
    ['Vivid Sydney (Sydney, Australia)', '2009', 'May and June', '23 nights', '3.28 million (in 2023)'],
    ['Cape Town International Jazz Festival (South Africa)', '2000', 'usually March', '2 days', '34,000 (in 2013)'],
  ],
  note: "Figures are approximate. Sources: the festivals' own information, Wikipedia and news reports, checked in October 2026.",
}

export const LAMU_TRANSCRIPT: { who: string; text: string }[] = [
  { who: 'Inés', text: 'Excuse me, are you Juma? The hotel said you can tell me about the festival.' },
  { who: 'Juma', text: 'Yes, that is me. Welcome to Lamu! Are you here for the festival?' },
  { who: 'Inés', text: 'I would like to be, but I think I came too early. When is it?' },
  { who: 'Juma', text: 'It is in November, every year. It lasts three or four days. Last year was the twenty-third festival.' },
  { who: 'Inés', text: 'Twenty-three! When did it begin?' },
  { who: 'Juma', text: 'In two thousand and one. That is also the year UNESCO put our Old Town on the World Heritage list. UNESCO says it is the oldest and best preserved Swahili town in East Africa.' },
  { who: 'Inés', text: 'Wow! And what happens during the festival?' },
  { who: 'Juma', text: 'A lot! The most famous event is the dow race. A dow is a traditional wooden boat with a big sail. Local sailors race them in the sea. The other big event is the donkey race.' },
  { who: 'Inés', text: 'A donkey race? Really?' },
  { who: 'Juma', text: 'Yes! There are no cars on Lamu. Not one. We use donkeys for everything, and there are about three thousand on the island. So the race is very serious!' },
  { who: 'Inés', text: 'That is amazing! In Valencia we have big festivals too. There is La Tomatina, in Buñol. They only allow about twenty thousand people.' },
  { who: 'Juma', text: 'Last year the organisers expected between twenty and thirty thousand visitors in Lamu. So it is about the same size, maybe a little bigger!' },
  { who: 'Inés', text: 'And is there any food?' },
  { who: 'Juma', text: "Of course. There is a street market with Swahili food, and many women's groups cook traditional dishes. There are also traditional dances, henna painting and a swimming race." },
  { who: 'Inés', text: 'Henna painting! I love it. What is your favourite part?' },
  { who: 'Juma', text: 'For me, the best part is the dances. In the evening, the streets are full of music. When I was a child, I watched the dow race with my grandfather. Now I watch it with my son.' },
  { who: 'Inés', text: 'That is a lovely story. Then I will come back in November!' },
  { who: 'Juma', text: 'Karibu tena! That means welcome again, in Swahili.' },
]

const TFNS = ['True', 'False', 'Not said']

export const ACTIVITIES: Activity[] = [
  {
    id: 'lamu-listen', no: 1, title: 'Listening: the Lamu Festival', time: '20 min', when: 'Thursday',
    blurb: 'Inés is a tourist from Valencia. Juma is a guide on Lamu, an island in Kenya. Listen twice.',
    audio: true,
    exercises: [
      {
        id: 'A', title: 'Exercise A · True, false or not said?', how: 'Listen once, then answer.',
        items: [
          { id: 'a1', kind: 'choice', q: 'The Lamu Festival is in November.', options: TFNS, answer: 0 },
          { id: 'a2', kind: 'choice', q: 'Last year was the twenty-fifth festival.', options: TFNS, answer: 1 },
          { id: 'a3', kind: 'choice', q: 'The festival began in the same year as the UNESCO listing.', options: TFNS, answer: 0 },
          { id: 'a4', kind: 'choice', q: 'There are a few cars on Lamu.', options: TFNS, answer: 1 },
          { id: 'a5', kind: 'choice', q: 'Inés has been to Lamu before.', options: TFNS, answer: 2 },
          { id: 'a6', kind: 'choice', q: 'Juma only watched the dow race with his grandfather.', options: TFNS, answer: 1 },
        ],
        es: 'NS (not said) significa que el audio no dice ni sí ni no: no se puede saber. 2: era el festival número 23. 4: no hay coches en Lamu. 5: no lo dice. 6: de niño lo veía con su abuelo, pero ahora lo ve con su hijo, así que "only" lo hace falso.',
      },
      {
        id: 'B', title: 'Exercise B · Complete the notes', how: 'Write one word or number. Listen a second time to check.',
        items: [
          { id: 'b1', kind: 'gap', before: 'The festival lasts three or', after: 'days.', answers: ['four', '4'] },
          { id: 'b2', kind: 'gap', before: 'Last year the organisers expected between', after: 'and thirty thousand visitors.', answers: ['twenty', '20'] },
          { id: 'b3', kind: 'gap', before: 'La Tomatina allows about', after: 'thousand people.', answers: ['twenty', '20'] },
          { id: 'b4', kind: 'gap', before: "Juma's favourite part of the festival is the", after: '.', answers: ['dances', 'dance'] },
          { id: 'b5', kind: 'gap', before: 'As a child, Juma watched the dow race with his', after: '.', answers: ['grandfather'] },
          { id: 'b6', kind: 'gap', before: 'Inés decides to come back in', after: '.', answers: ['november'] },
        ],
        es: 'Puedes escribir el número en cifras o en letras (20 o twenty). Cuidado con la ortografía: grandfather, November.',
      },
      {
        id: 'C', title: 'Exercise C · Choose the best answer', how: 'One answer each.',
        items: [
          { id: 'c1', kind: 'choice', q: 'Why does Inés think she came too early?', options: ['The hotel is closed.', 'The festival is in a different month.', 'She is tired.'], answer: 1 },
          { id: 'c2', kind: 'choice', q: 'Juma says the donkey race is serious because', options: ['people on Lamu use donkeys for everything.', 'the prize is big.', 'the race is very old.'], answer: 0 },
          { id: 'c3', kind: 'choice', q: 'Compared with La Tomatina, the Lamu Festival is', options: ['much smaller.', 'about the same size, maybe a little bigger.', 'twice as big.'], answer: 1 },
        ],
        es: 'En el audio, Juma dice "about the same size, maybe a little bigger". Usa la transcripción para ver dónde está cada respuesta después de intentarlo.',
      },
    ],
    free: [
      {
        id: 'D', title: 'Exercise D · Your own sentences', minWords: 12,
        how: 'Write two sentences. Compare the Lamu Festival with one festival from the fact file. Use a comparative or a superlative.',
        prompts: ['Sentence 1', 'Sentence 2'],
        model: 'Ejemplos: The Lamu Festival is newer than La Tomatina. · La Tomatina is shorter than the Lamu Festival.',
      },
    ],
  },
  {
    id: 'compare', no: 2, title: 'Bigger, older, the most famous', time: '25 min', when: 'Friday',
    blurb: 'Comparatives and superlatives, with the fact file.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Complete the table', how: 'Write the missing form.',
        items: [
          { id: 'a1', kind: 'gap', before: 'old (comparative):', answers: ['older'] },
          { id: 'a2', kind: 'gap', before: 'old (superlative):', answers: ['the oldest', 'oldest'] },
          { id: 'a3', kind: 'gap', before: 'crowded (comparative):', answers: ['more crowded'] },
          { id: 'a4', kind: 'gap', before: 'crowded (superlative):', answers: ['the most crowded', 'most crowded'] },
          { id: 'a5', kind: 'gap', before: 'new (superlative):', answers: ['the newest', 'newest'] },
          { id: 'a6', kind: 'gap', before: 'good (comparative):', answers: ['better'] },
          { id: 'a7', kind: 'gap', before: 'good (superlative):', answers: ['the best', 'best'] },
          { id: 'a8', kind: 'gap', before: 'loud (comparative):', answers: ['louder'] },
          { id: 'a9', kind: 'gap', before: 'loud (superlative):', answers: ['the loudest', 'loudest'] },
          { id: 'a10', kind: 'gap', before: 'bad (superlative):', answers: ['the worst', 'worst'] },
          { id: 'a11', kind: 'gap', before: 'famous (comparative):', answers: ['more famous'] },
          { id: 'a12', kind: 'gap', before: 'famous (superlative):', answers: ['the most famous', 'most famous'] },
          { id: 'a13', kind: 'gap', before: 'cheap (comparative):', answers: ['cheaper'] },
        ],
        es: 'Una sílaba: -er / -est (old, older, the oldest). Palabra larga: more / the most (more crowded, the most famous). Nunca las dos cosas: no se dice "more bigger". Irregulares: good, better, the best · bad, worse, the worst.',
      },
      {
        id: 'B', title: 'Exercise B · Choose the correct option', how: 'Use the fact file.',
        items: [
          { id: 'b1', kind: 'choice', q: 'La Tomatina is ___ than the Notting Hill Carnival.', options: ['more old', 'older', 'oldest'], answer: 1 },
          { id: 'b2', kind: 'choice', q: 'The Cape Town Jazz Festival is ___ than Glastonbury.', options: ['newest', 'more new', 'newer'], answer: 2 },
          { id: 'b3', kind: 'choice', q: 'Vivid Sydney is ___ festival in the table.', options: ['the biggest', 'bigger', 'the most big'], answer: 0 },
          { id: 'b4', kind: 'choice', q: 'La Tomatina is ___ festival in the table.', options: ['shorter', 'the most short', 'the shortest'], answer: 2 },
          { id: 'b5', kind: 'choice', q: 'The Fallas last ___ than the Notting Hill Carnival.', options: ['more long', 'longer', 'the longer'], answer: 1 },
          { id: 'b6', kind: 'choice', q: 'Glastonbury has ___ visitors than La Tomatina.', options: ['the more', 'most', 'more'], answer: 2 },
        ],
        es: 'Con comparativo siempre va "than" (older than, no "that" ni "of"). El superlativo lleva "the": the biggest, the shortest.',
      },
      {
        id: 'C', title: 'Exercise C · Which sentence is correct?', how: 'Only one is right.',
        items: [
          { id: 'c1', kind: 'choice', q: 'Glastonbury and La Tomatina', options: ['Glastonbury is more bigger than La Tomatina.', 'Glastonbury is more big than La Tomatina.', 'Glastonbury is bigger than La Tomatina.'], answer: 2 },
          { id: 'c2', kind: 'choice', q: 'La Tomatina and the Notting Hill Carnival', options: ['La Tomatina is older than the Notting Hill Carnival.', 'La Tomatina is older that the Notting Hill Carnival.', 'La Tomatina is older of the Notting Hill Carnival.'], answer: 0 },
          { id: 'c3', kind: 'choice', q: 'Vivid Sydney', options: ['Vivid Sydney is the biggest festival of the table.', 'Vivid Sydney is the biggest festival from the table.', 'Vivid Sydney is the biggest festival in the table.'], answer: 2 },
          { id: 'c4', kind: 'choice', q: 'Vivid Sydney again', options: ['Vivid Sydney is the most new festival in the table.', 'Vivid Sydney is the newest festival in the table.', 'Vivid Sydney is the more new festival in the table.'], answer: 1 },
          { id: 'c5', kind: 'choice', q: 'La Tomatina', options: ['La Tomatina is the shorter festival in the table.', 'La Tomatina is the most short festival in the table.', 'La Tomatina is the shortest festival in the table.'], answer: 2 },
        ],
        es: 'Errores típicos: "more bigger" (mezclar las dos formas), "older that" (en vez de than), "of the table" (en una lista o lugar se usa in: in the table, in Spain) y "the shorter" (con the va superlativo: the shortest).',
      },
      {
        id: 'E', title: 'Exercise E · Than, in or of?', how: 'Choose from the box. You can use a word more than once.', bank: ['in', 'of', 'than'],
        items: [
          { id: 'e1', kind: 'gap', before: 'Glastonbury lasts longer', after: 'La Tomatina.', answers: ['than'] },
          { id: 'e2', kind: 'gap', before: 'In my opinion, March is the best month', after: 'the year in Valencia.', answers: ['of'] },
          { id: 'e3', kind: 'gap', before: 'Valencia is the third biggest city', after: 'Spain.', answers: ['in'] },
          { id: 'e4', kind: 'gap', before: 'Paella is the most famous dish', after: 'the Valencian Community.', answers: ['in'] },
          { id: 'e5', kind: 'gap', before: 'Summer is hotter', after: 'spring in Valencia.', answers: ['than'] },
          { id: 'e6', kind: 'gap', before: 'August is the hottest month', after: 'the year.', answers: ['of'] },
        ],
        es: 'Superlativo: in + lugar o lista (in the table, in Spain, in the world); of + tiempo o grupo (of the year, of my life, of all).',
      },
    ],
  },
  {
    id: 'then-now', no: 3, title: 'Then and now', time: '25 min', when: 'Saturday',
    blurb: 'Simple past for then, simple present for now.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Past or present?', how: 'Write the verb in brackets in the right tense. Then = simple past. Now = simple present. Look for clue words (in 1970, today).',
        items: [
          { id: 'a1', kind: 'gap', before: 'The first Glastonbury Festival (take place)', after: 'in September 1970.', answers: ['took place'] },
          { id: 'a2', kind: 'gap', before: 'At that time it (be)', after: 'called the Pilton Festival.', answers: ['was'] },
          { id: 'a3', kind: 'gap', before: 'Today the festival usually (be)', after: 'in June.', answers: ['is'] },
          { id: 'a4', kind: 'gap', before: 'It (last)', after: 'five days.', answers: ['lasts'] },
          { id: 'a5', kind: 'gap', before: 'About 200,000 people (go)', after: 'to it.', answers: ['go'] },
          { id: 'a6', kind: 'gap', before: 'The Notting Hill Carnival (start)', after: 'in 1966.', answers: ['started'] },
          { id: 'a7', kind: 'gap', before: 'People from the British Caribbean community in London (begin)', after: 'it.', answers: ['began'] },
          { id: 'a8', kind: 'gap', before: 'Today it (happen)', after: 'every year on the August bank holiday weekend.', answers: ['happens'] },
          { id: 'a9', kind: 'gap', before: 'It (last)', after: 'three days.', answers: ['lasts'] },
          { id: 'a10', kind: 'gap', before: 'Some people say that up to two million people (come)', after: '.', answers: ['come'] },
          { id: 'a11', kind: 'gap', before: 'The Lamu Cultural Festival (begin)', after: 'in 2001.', answers: ['began'] },
          { id: 'a12', kind: 'gap', before: 'Today people (call)', after: "it the island's biggest and oldest festival.", answers: ['call'] },
          { id: 'a13', kind: 'gap', before: 'The donkey race (be)', after: 'one of its highlights.', answers: ['is'] },
        ],
        es: 'Una acción terminada con una fecha o una palabra de tiempo pasado (in 1970, in 1945, last year) va en pasado simple. Una situación de ahora (today, now, every year) va en presente simple. Cuidado: en presente, la tercera persona lleva -s (it lasts, it happens).',
      },
      {
        id: 'B', title: 'Exercise B · Past forms', how: 'Write the simple past. Three are regular, but watch the spelling!',
        items: [
          { id: 'b1', kind: 'gap', before: 'begin →', answers: ['began'] },
          { id: 'b2', kind: 'gap', before: 'build →', answers: ['built'] },
          { id: 'b3', kind: 'gap', before: 'take →', answers: ['took'] },
          { id: 'b4', kind: 'gap', before: 'stop →', answers: ['stopped'] },
          { id: 'b5', kind: 'gap', before: 'throw →', answers: ['threw'] },
          { id: 'b6', kind: 'gap', before: 'ban →', answers: ['banned'] },
          { id: 'b7', kind: 'gap', before: 'hold →', answers: ['held'] },
          { id: 'b8', kind: 'gap', before: 'come →', answers: ['came'] },
        ],
        es: 'En stop y ban se duplica la última consonante (stopped, banned). Los irregulares hay que aprenderlos de memoria.',
      },
      {
        id: 'C', title: 'Exercise C · Then or now?', how: 'Remember La Tomatina. Choose the correct verb.',
        items: [
          { id: 'c1', kind: 'choice', q: 'In 1945, some children ___ a food fight in Buñol.', options: ['start', 'started'], answer: 1 },
          { id: 'c2', kind: 'choice', q: 'Today, thousands of people ___ tomatoes there every August.', options: ['threw', 'throw'], answer: 1 },
          { id: 'c3', kind: 'choice', q: 'In the early 1950s, the government ___ the festival.', options: ['bans', 'banned'], answer: 1 },
          { id: 'c4', kind: 'choice', q: 'Until 2013, anybody ___ the fight.', options: ['could join', 'can join'], answer: 0 },
          { id: 'c5', kind: 'choice', q: 'Now the town ___ the number to about 20,000.', options: ['limited', 'limits'], answer: 1 },
          { id: 'c6', kind: 'choice', q: 'In 2020 and 2021, the festival ___ because of the pandemic.', options: ['stops', 'stopped'], answer: 1 },
        ],
        es: 'Las palabras de tiempo mandan: In 1945, until 2013, in 2020 son pasado. Today, now, every August son presente.',
      },
      {
        id: 'E', title: 'Exercise E · Write the question', how: 'Choose the correct question for each answer.',
        items: [
          { id: 'e1', kind: 'choice', q: 'Answer: In 1966.', options: ['When did the Notting Hill Carnival started?', 'When did the Notting Hill Carnival start?', 'When the Notting Hill Carnival start?'], answer: 1 },
          { id: 'e2', kind: 'choice', q: 'Answer: About 200,000 people.', options: ['How many people goes to Glastonbury?', 'How many people do go to Glastonbury?', 'How many people go to Glastonbury?'], answer: 2 },
          { id: 'e3', kind: 'choice', q: 'Answer: On the last Wednesday of August.', options: ['When is La Tomatina?', 'When La Tomatina is?', 'When does La Tomatina is?'], answer: 0 },
          { id: 'e4', kind: 'choice', q: 'Answer: Because of the pandemic.', options: ['Why La Tomatina stopped in 2020 and 2021?', 'Why did La Tomatina stopped in 2020 and 2021?', 'Why did La Tomatina stop in 2020 and 2021?'], answer: 2 },
        ],
        es: 'En preguntas en pasado: did + verbo base (did it start, no did it started). En presente con be: When is...?',
      },
    ],
    free: [
      {
        id: 'D', title: 'Exercise D · Your festival, then and now', minWords: 20,
        how: 'Think of a festival you know well: the Fallas, Sant Joan, a village fiesta, a concert. Write four sentences: two about then (simple past) and two about now (simple present). Use at least one comparative.',
        prompts: ['Then 1', 'Then 2', 'Now 1', 'Now 2'],
      },
    ],
  },
  {
    id: 'words', no: 4, title: 'The words of a festival', time: '20 min', when: 'Sunday',
    blurb: 'Vocabulary you need to talk about a festival, and British spelling.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Match the word to its meaning', how: 'Choose the meaning for each word.',
        gloss: ['desfile', 'carroza', 'disfraz', 'fuegos artificiales', 'escenario', 'zona de acampada', 'multitud', 'entrada'],
        options: [
          'a bright explosion of light and noise in the sky',
          'a place where people put up tents',
          'special clothes you wear for a festival',
          'a line of people and vehicles that moves through the streets',
          'you must buy it before you can go in',
          'a decorated lorry or platform in a parade',
          'a raised platform where musicians play',
          'a large group of people in one place',
        ],
        items: [
          { id: 'a1', kind: 'match', q: 'parade', answer: 3 },
          { id: 'a2', kind: 'match', q: 'float', answer: 5 },
          { id: 'a3', kind: 'match', q: 'costume', answer: 2 },
          { id: 'a4', kind: 'match', q: 'firework', answer: 0 },
          { id: 'a5', kind: 'match', q: 'stage', answer: 6 },
          { id: 'a6', kind: 'match', q: 'campsite', answer: 1 },
          { id: 'a7', kind: 'match', q: 'crowd', answer: 7 },
          { id: 'a8', kind: 'match', q: 'ticket', answer: 4 },
        ],
        es: 'Parade = desfile; float = carroza; costume = disfraz o traje; firework = fuego artificial; stage = escenario; campsite = zona de acampada; crowd = multitud; ticket = entrada.',
      },
      {
        id: 'B', title: 'Exercise B · Complete the sentences', how: 'Use each word once.', bank: ['campsite', 'costume', 'crowd', 'fireworks', 'float', 'parade', 'stage', 'ticket'],
        items: [
          { id: 'b1', kind: 'gap', before: 'You need a', after: 'to go into La Tomatina.', answers: ['ticket'] },
          { id: 'b2', kind: 'gap', before: 'At Glastonbury, most people sleep in a tent at a', after: '.', answers: ['campsite'] },
          { id: 'b3', kind: 'gap', before: 'The singer walked onto the', after: "at ten o'clock.", answers: ['stage'] },
          { id: 'b4', kind: 'gap', before: 'Many women wear a traditional', after: 'at the Fallas.', answers: ['costume'] },
          { id: 'b5', kind: 'gap', before: 'On the Monday of the Notting Hill Carnival, the big', after: 'goes through the streets for hours.', answers: ['parade'] },
          { id: 'b6', kind: 'gap', before: 'Each', after: 'in the parade was covered in flowers.', answers: ['float'] },
          { id: 'b7', kind: 'gap', before: 'At the end of the Fallas, a huge', after: 'watches the monuments burn.', answers: ['crowd'] },
          { id: 'b8', kind: 'gap', before: 'There are', after: 'in the sky over Valencia during the Fallas.', answers: ['fireworks'] },
        ],
        es: 'Pista: "a huge ___" y "watches" piden una palabra que se pueda contar como grupo (crowd). "There are ___" pide plural (fireworks).',
      },
      {
        id: 'C', title: 'Exercise C · British spelling', how: 'Choose the British one.',
        items: [
          { id: 'c1', kind: 'choice', q: 'My ___ festival is the Fallas.', options: ['favourite', 'favorite'], answer: 0 },
          { id: 'c2', kind: 'choice', q: 'The city ___ was full of people.', options: ['centre', 'center'], answer: 0 },
          { id: 'c3', kind: 'choice', q: 'We ___ a trip to Buñol.', options: ['organized', 'organised'], answer: 1 },
          { id: 'c4', kind: 'choice', q: 'The costumes were very ___.', options: ['colourful', 'colorful'], answer: 0 },
          { id: 'c5', kind: 'choice', q: 'The festival ___ has forty events.', options: ['programme', 'program'], answer: 0 },
        ],
        es: 'Inglés británico: -our (colour, favourite), -re (centre, theatre), -ise (organise, realise). Programme es el programa de un evento; program es un programa de ordenador.',
      },
    ],
  },
  {
    id: 'small-words', no: 5, title: 'The small words after verbs', time: '15 min', when: 'Tuesday',
    blurb: 'Prepositions that Spanish speakers often forget or confuse.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Write the missing word', how: 'Use each word from the box. You can use a word more than once.', bank: ['about', 'at', 'for', 'in', 'to'],
        items: [
          { id: 'a1', kind: 'gap', before: 'We arrived', after: "Buñol at nine o'clock.", answers: ['in'] },
          { id: 'a2', kind: 'gap', before: 'Everybody waited', after: 'the first lorry to arrive.', answers: ['for'] },
          { id: 'a3', kind: 'gap', before: 'I listened', after: 'the band for three hours.', answers: ['to'] },
          { id: 'a4', kind: 'gap', before: 'You have to pay', after: 'the ticket online.', answers: ['for'] },
          { id: 'a5', kind: 'gap', before: 'At midnight, we all looked', after: 'the sky.', answers: ['at'] },
          { id: 'a6', kind: 'gap', before: 'After the festival, I could not stop thinking', after: 'next year.', answers: ['about'] },
          { id: 'a7', kind: 'gap', before: 'Notting Hill is famous', after: 'its carnival.', answers: ['for'] },
          { id: 'a8', kind: 'gap', before: 'The monuments burn', after: 'midnight on 19 March.', answers: ['at'] },
        ],
        es: 'arrive in + ciudad o país (arrive in Buñol); arrive at + lugar concreto (arrive at the campsite). Nunca "arrive to". wait for (esperar) · listen to (escuchar) · pay for (pagar algo) · look at (mirar) · think about (pensar en) · famous for (famoso por). En español no ponemos preposición en esperar, escuchar o pagar, y por eso se nos olvida en inglés.',
      },
    ],
    free: [
      {
        id: 'B', title: 'Exercise B · Translate into English', minWords: 15,
        how: 'Write the English sentence. Think about the small word.',
        prompts: ['Llegamos a la plaza a las ocho. (Valencia)', 'Escuchamos a la banda durante dos horas.', 'Esperé a mi amiga delante del Mercado Central.'],
        model: "Modelo: We arrived at the square at eight o'clock. · We listened to the band for two hours. · I waited for my friend in front of the Central Market. (arrived in the square también vale; at es lo normal para un punto del recorrido.)",
      },
    ],
  },
  {
    id: 'writing', no: 6, title: 'Writing: a festival you know', time: '20 min', when: 'Wednesday or Thursday',
    blurb: 'Your own text, sent to Hugo. He will correct it with you.',
    exercises: [],
    free: [
      {
        id: 'W', title: 'Write 60 to 100 words', minWords: 60,
        how: 'Write about a festival you know well (the Fallas, Sant Joan, Lamu, a village fiesta, a concert). Say what it is, when it started, what happens now, and how it compares with another festival. Use at least one comparative, one superlative, one past simple and one present simple. Do not use a translator.',
        prompts: ['Your text'],
      },
    ],
  },
]

// "How this course works" pop-up (same pattern as the PET course). Until Hugo records the
// video, the pop-up shows these points. To add the video, put its unlisted YouTube id in `youtube`.
export const HOWTO_VIDEO: { title: string; youtube: string; points: string[] } = {
  title: 'How this course works',
  youtube: '',
  points: [
    "Sign in at Student's Corner with your name and your code. Your work is saved under your name, on your phone and on your computer.",
    'The tabs at the top are the lessons: Listening, Comparing, Then & now, Words, Small words and Writing. Do them in any order, whenever you want.',
    'Listening: press play and listen twice. Open the transcript only after you have tried the exercises.',
    'Exercises: answer, then press Check. You see a tick or a cross, the right answer, and an explanation in Spanish. Press Try again to practise as much as you like.',
    'Hugo sees your first attempt at each exercise, so do your best the first time.',
    'Writing: type your text and press Send to Hugo. He reads it and gives you feedback in class.',
    'The Result tab shows your scores and what to repeat. The printed worksheet (PDF) is on the Start page.',
  ],
}
