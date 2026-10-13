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
    note: "Verified against the Teacher's Book via _source-books/SYLLABUS_new-close-up-b1.md, 13 Oct 2026",
    verified: true,
    units: [
      // All 12 units verified against the Teacher's Book on 13 Oct 2026 via
      // Somerset Worksheets/_source-books/SYLLABUS_new-close-up-b1.md (New Close-up B1, 3rd edition).
      // Vocab lists are the publisher's glossed new words per lesson, not the exhaustive lexical set.
      {
        unit: 1, title: 'Perfect for the job', sbPages: '5–16',
        grammar: ['present simple and present continuous (all uses: facts, habits, schedules, narratives; now, temporary, annoying habits, arrangements, pictures)', 'adverbs of frequency and time expressions', 'spelling: -s/-es/-ies and -ing forms', 'stative verbs, incl. verbs with two meanings (have, think, see, smell, expect, be)', 'have vs have got', 'countable and uncountable nouns, irregular plurals, a piece of', 'quantifiers: some, any, no, a lot of/lots of/plenty of, enough, much, many, (a) few, (a) little, several, a number of, a bit of'],
        vocab: ['architect', 'astronaut', 'athlete', 'actor', 'camera operator', 'cook', 'firefighter', 'hairdresser', 'lawyer', 'librarian', 'politician', 'soldier', 'generous', 'hard-working', 'nervous', 'relaxed', 'sociable', 'unkind', 'reliable', 'lazy', 'confident', 'patient', 'miserable', 'cheerful', 'candidate', 'full-time', 'retired', 'qualification', 'unemployed', 'apply', 'out of work', 'get married', 'grow up', 'go out with', 'split up', 'bring up'],
        strands: ['jobs', 'personality adjectives', 'employment vocabulary', 'life events (phrasal verbs)', 'reading: gapped text (matching sentences to gaps)', 'listening: choosing the correct picture; multiple choice with picture options', 'speaking: talking about your life, giving detailed answers, interview', 'writing: informal email, including all the information'],
      },
      {
        unit: 2, title: 'Delicious!', sbPages: '17–28',
        grammar: ['past simple: finished actions and situations; past routines and habits (with adverbs of frequency); sequences of past actions; time expressions (yesterday, last…, …ago, once a week); regular -ed spelling and irregular verbs', 'past continuous: action in progress at a past time; two simultaneous actions; background in a story; interrupted action; while / when / as; was/were + -ing; stative verbs not used in continuous', 'used to and would: past habits and repeated actions (both); past states (used to only); forms didn\'t use to / Did you use to…? / wouldn\'t', 'be used to and get used to + -ing form or noun: familiar vs becoming familiar; get used to in all forms; be used to not in continuous or perfect'],
        vocab: ['taste', 'bitter', 'sour', 'spicy', 'salty', 'bake', 'barbecue', 'boil', 'fry', 'grill', 'roast', 'chop', 'lamb', 'steak', 'theory', 'soldier', 'saddle', 'immigrant', 'sailor', 'likely', 'tableware', 'packaging', 'quantity', 'saucer', 'mug', 'jar', 'fork', 'knife', 'pour', 'type', 'bunch', 'flavour', 'raspberry', 'jam', 'do the washing up'],
        strands: ['taste adjectives', 'cooking verbs', 'tableware, packaging and quantities', 'exam: multiple-choice cloze (choosing the correct option)', 'reading: matching people to texts (reading for detail)', 'listening: multiple choice, one conversation (identifying the key words)', 'speaking: describing food, paraphrasing, photo description', 'writing: article (about 100 words), using adjectives, planning and organisation', 'video: Food truck nation'],
      },
      {
        unit: 3, title: "It's natural", sbPages: '29–40',
        grammar: ['present perfect simple vs past simple: unfinished state or action; finished action in unfinished time; finished action with no time mentioned; have/has + past participle', 'present perfect simple vs present perfect continuous: unfinished states and actions; recently finished actions; finished actions with present effect; simple = result, continuous = action or duration; simple only for quantities, repetitions, experiences with ever/never and stative verbs; have/has been + -ing', 'time expressions: already, yet, ever, never, once, twice, all day, all week, for, since, just, lately, recently, so far, until now', 'articles: a/an (consonant vs vowel sound, first mention, jobs); the (specific, adjectives as nouns, musical instruments, unique nouns, cinemas/theatres/ships/hotels, deserts/mountain ranges, oceans/seas/rivers, some countries); zero article (proper names, sports/games/colours, days/months/holidays, areas of knowledge)'],
        vocab: ['cave', 'cliff', 'glacier', 'rainforest', 'stream', 'valley', 'desert', 'fossil fuel', 'renewable energy', 'solar power', 'power station', 'atmosphere', 'temperature', 'source', 'produce', 'burn', 'run out', 'go up', 'mammal', 'huge', 'human', 'available', 'destroy', 'prevent', 'remove', 'set up', 'survive', 'damage', 'exist', 'wear out', 'garbage', 'patch', 'biodegradable', 'sunlight', 'inventor', 'device', 'decade', 'bottom', 'pond', 'bacteria', 'pollution', 'daily'],
        strands: ['geographical features', 'climate change', 'environment verbs', 'prepositions (1)', 'reading: multiple choice, one text (reading for general understanding)', 'listening: gap fill / sentence completion (predicting the type of answer needed)', 'speaking: talking about the environment, listening to instructions, picture discussion (collaborative task)', 'writing: email, including useful expressions, planning your work', 'live well, study well: the environment; achieving change'],
      },
      {
        unit: 4, title: "That's the fashion", sbPages: '41–52',
        grammar: ['relative clauses: relative pronouns who/that (people), which/that (things), whose, when, where', 'defining vs non-defining relative clauses: commas; that not used in non-defining; omission of the pronoun when it is the object', 'clauses with time expressions: present simple (not will) in future time clauses with before, when, as soon as, until; present perfect simple to emphasise completion'],
        vocab: ['bracelet', 'button', 'earring', 'glove', 'handkerchief', 'pocket', 'blouse', 'antique', 'casual', 'fashionable', 'loose', 'old-fashioned', 'original', 'smart', 'tight', 'fit', 'clothing', 'wool', 'metal', 'credit card', 'receipt', 'cash', 'bargain', 'changing room', 'accept', 'properly', 'over', 'try on', 'go with', 'shop around', 'pick up', 'look at', 'pay for'],
        strands: ['clothes and materials', 'shopping', 'phrasal verbs (1)', 'exam: open cloze (understanding the whole meaning)', 'reading: gapped text, matching sentences to gaps (understanding new words)', 'listening: multiple choice, six conversations (listening for similar words)', 'speaking: giving reasons for your choice, solving a problem (collaborative task)', 'writing: story (about 100 words), organising a story, thinking of ideas', 'video: From fleece jackets to your food'],
      },
      {
        unit: 5, title: 'Where we live', sbPages: '53–64',
        grammar: ['will: decisions at the moment of speaking; uncertain predictions (opinion or feelings); promises and threats; future facts; offers and requests; \'ll / won\'t', 'be going to: plans and intentions; predictions from present evidence', 'be going to vs will: intentions (decided vs at the moment of speaking); predictions (evidence vs opinion); future time expressions', 'future plans and events: be going to (no fixed arrangement) / present continuous (fixed arrangement) / present simple (timetabled)', 'future predictions: be going to (present evidence, most confident) / will (personal opinion) / may, might (possibility, least confident)'],
        vocab: ['household', 'accommodation', 'cottage', 'flatmate', 'property', 'countryside', 'ladder', 'balcony', 'bucket', 'dishwasher', 'iron', 'kettle', 'ceiling', 'washing machine', 'blanket', 'chest of drawers', 'cushion', 'duvet', 'pillow', 'sheet', 'wardrobe', 'oven', 'wrap', 'a bit', 'have a rest', 'make a mess', 'make your bed', 'move house', 'do the housework', 'take a seat', 'take a break'],
        strands: ['housing', 'household objects (1) and (2)', 'home expressions', 'reading: multiple choice, five short texts (signs, notices, messages; identifying the main message)', 'listening: multiple choice, one conversation (identifying opinion)', 'speaking: expanding on the topic, general conversation', 'writing: email responding to news (thanking, accepting/declining, giving advice), using appropriate language', 'live well, study well: dealing with difficult situations; positive problem solving'],
      },
      {
        unit: 6, title: 'Go for it!', sbPages: '65–76',
        grammar: ['zero conditional: present simple + present simple', 'first conditional: present + will / imperative / can, could, may, might', 'unless = if…not; when instead of if; clause order and comma rule', 'second conditional: untrue present conditions + unlikely results; unlikely future conditions; imaginary conditions + impossible results; advice (If I were you…); past simple/continuous + would / could / might + infinitive'],
        vocab: ['athletics', 'yoga', 'tournament', 'championship', 'league', 'match', 'point', 'score', 'run', 'track', 'pitch', 'court', 'basket', 'goal post', 'stick', 'stadium', 'rider', 'official', 'interior', 'inner', 'tracksuit', 'workout', 'hold your breath', 'competitively', 'endanger', 'dangerously', 'depth', 'deepen', 'diver', 'fitness', 'freedom', 'free', 'freely', 'profession', 'professional', 'strengthen'],
        strands: ['sports and sports equipment', 'sports clothes', 'verb + noun collocations', 'word building', 'exam: multiple-choice cloze (finding the wrong options)', 'reading: matching people to texts (identifying the key points)', 'listening: gap fill (checking spelling)', 'speaking: giving opinions, picture discussion', 'writing: opinion essay, giving reasons and examples, organising your essay', 'video: Mounted archery'],
      },
      {
        unit: 7, title: 'Have a great trip!', sbPages: '77–88',
        grammar: ['question tags: checking information; inviting a response; informal requests; form with auxiliaries across tenses', 'subject and object questions: subject question = statement word order (Who took…? What caused…? Which train goes…?); object question = inversion with auxiliary', 'past perfect simple: earlier of two past actions; had + past participle; by the time', 'past perfect continuous: duration or effect of an earlier action; had been + -ing; not with stative verbs; contrast with past simple sequence'],
        vocab: ['fare', 'baggage', 'reservation', 'currency', 'border', 'visa', 'arrangement', 'permission', 'suitcase', 'coach', 'boarding pass', 'customs', 'double room', 'duty free', 'reception', 'roundabout', 'traffic jam', 'departure lounge', 'tour guide', 'arrival', 'departure gate', 'announcement', 'alarm', 'check out', 'realise', 'stressful', 'particular', 'cabin', 'campsite', 'holiday home', 'hostel', 'on board', 'petrol station', 'lively'],
        strands: ['travel', 'holiday accommodation', 'travel collocations', 'adjectives for travel', 'reading: multiple choice, one text (understanding attitudes and opinions)', 'listening: multiple choice, six conversations (matching all parts of the option)', 'speaking: describing details, photo description', 'writing: story, using narrative tenses, using structure', 'live well, study well: improving your performance; staying motivated'],
      },
      {
        unit: 8, title: 'My own time', sbPages: '89–100',
        grammar: ['modals and semi-modals (1): ability (can, could, be able to); permission (can, could, may, might, be allowed to); possibility (can, could, may, might); certainty (must, can\'t, have to); obligation (must/mustn\'t, have to, should/shouldn\'t); willingness: offers (will, shall) and requests (can, could, will, would)', 'form of modals (no -ing, participle or infinitive; no two modals together) vs semi-modals (be able to, be allowed to, have to, need to); politeness scale; could/might/would/should as past forms; must → had to', 'modals and semi-modals (2): obligation, necessity, lack of necessity, prohibition'],
        vocab: ['backpacking', 'drama', 'graphic design', 'sculpture', 'squash', 'ballet', 'poetry', 'gallery', 'leaflet', 'podcast', 'video clip', 'horror', 'adore', 'can\'t stand', 'record', 'perform', 'photograph', 'face to face', 'come round', 'get along with', 'get together', 'hang out', 'join in', 'take up', 'give away', 'challenging', 'crazy', 'enjoyable', 'frightening', 'jogging', 'horror film', 'awesome', 'awful', 'scary', 'difficult', 'terrible'],
        strands: ['free-time activities', 'verbs of opinion', 'phrasal verbs (2)', 'adjectives', 'exam: open cloze (expanding your vocabulary)', 'reading: multiple choice, five short texts (checking the information)', 'listening: multiple choice with picture options (predicting what you will hear)', 'speaking: listening to the question, elaboration questions (extended answers)', 'writing: article, linking words and phrases (1) (as well as, because, for example, since, like, as), adding details', 'video: The tables'],
      },
      {
        unit: 9, title: 'Digital world', sbPages: '101–112',
        grammar: ['the passive (1): when the object or result matters more than the agent; unknown or unimportant agent; only transitive verbs; be + past participle in present simple, past simple, present perfect and be going to; negatives and questions', 'passive sentences with modals: modal/semi-modal + be + past participle', 'by (agent: person, thing or event) vs with (instrument)', 'the passive (2): passive in any tense (tense of be + past participle); present continuous passive; no passive in future continuous, present perfect continuous or past perfect continuous'],
        vocab: ['hardware', 'software', 'server', 'webcam', 'screen', 'program', 'tablet', 'invention', 'the World Wide Web', 'install', 'crash', 'experiment', 'lab', 'technophobe', 'click', 'connect', 'delete', 'drag', 'sign up', 'upload', 'carry out', 'app', 'trillion'],
        strands: ['computers and technology', 'technology verbs', 'prepositions (2)', 'reading: gapped text, matching sentences to gaps (identifying topics)', 'listening: multiple choice, one conversation (listening again)', 'speaking: being fair, advantages and disadvantages task (collaborative task)', 'writing: opinion essay, presenting your ideas in order, writing about your opinion', 'live well, study well: using social media; keeping it positive'],
      },
      {
        unit: 10, title: 'Show time!', sbPages: '113–124',
        grammar: ['reported speech: statements: direct vs reported; reporting during and after a conversation; optional that', 'reporting verb in a present tense: changes to pronouns, possessives, this/these → that/those and place words', 'time-expression changes: now → then, today → that day, yesterday → the day before, tomorrow → the next/following day, ago → before, last → the previous, next → the following, at the moment → at that moment', 'reporting verb in a past tense: tense backshift (SB Grammar Reference p. 170)', 'reporting verbs: say vs tell (+ object), suggest, admit, offer, promise, reply, agree', 'reported speech: questions and requests: ask as reporting verb; statement word order; wh-questions; if/whether for yes/no questions and requests; ask + object + to-infinitive for requests'],
        vocab: ['chat show', 'documentary', 'soap opera', 'talent show', 'thriller', 'guest', 'celebrity', 'scene', 'review', 'binge watching', 'murder', 'ghost', 'volcano', 'piece', 'turn into', 'turn on', 'turn out', 'turn up', 'end up', 'put off', 'get on with sth', 'over', 'millionaire', 'literature'],
        strands: ['film and TV', 'phrasal verbs (3)', 'exam: multiple-choice cloze (predicting possible answers)', 'reading: multiple choice, five short texts (understanding key information)', 'listening: gap fill (completing information)', 'speaking: guessing and giving reasons, photo description', 'writing: story, showing the order of events (First of all, after, while, Finally…), checking your story', 'video: Filming hummingbirds in slow motion'],
      },
      {
        unit: 11, title: 'Life lessons', sbPages: '125–136',
        grammar: ['the causative: have + object + past participle (arranged service, agent unmentioned); get + object + past participle (informal); have sth done for unpleasant events (not get); all tenses by conjugating have/get; negatives and questions with auxiliary / do', '-ing form: as subject or object; after prepositions; after for (purpose); after go (activities); after verbs and expressions (admit, avoid, be used to, can\'t help, can\'t stand, deny, dislike, enjoy, fancy, feel like, finish, hate, have difficulty, imagine, involve, it\'s no good/use, it\'s (not) worth, keep, like, love, miss, mind, practise, prefer, prevent, risk, spend time, suggest)', 'infinitives: purpose; too + adjective / adjective + enough; after adjectives (amazed, angry, awkward, careless, clever, crazy, delighted, difficult, disappointed, easy, generous, glad, happy, hard, horrified, impossible, kind, lucky, odd, proud, relieved, ridiculous, rude, sad, selfish, silly, sorry, stupid, surprised, wise); after verbs (agree, allow, appear, arrange, ask, choose, decide, expect, fail, hope, invite, learn, manage, need, offer, persuade, plan, prepare, pretend, promise, refuse, seem, want, would like)', '-ing or infinitive?: no change of meaning (begin, bother, continue, start); change of meaning (forget, remember, stop, go on, regret, try)'],
        vocab: ['economics', 'biology', 'essay', 'degree', 'diploma', 'certificate', 'fees', 'grant', 'deposit', 'study', 'intermediate', 'advanced', 'handwriting', 'primary school', 'secondary school', 'oral', 'examiner', 'candidate', 'accent', 'pronunciation', 'make an effort', 'manage', 'matter', 'make progress', 'break a rule', 'make a mistake', 'take notes', 'break up', 'look up', 'speak up', 'be supposed to', 'revision', 'satisfied'],
        strands: ['education', 'education expressions', 'prepositions (3)', 'reading: matching people to texts (finding distractors)', 'listening: multiple choice, six conversations (listening for feelings)', 'speaking: agreeing on an option, picture discussion (collaborative task)', 'writing: letter, linking words and phrases (2), stating facts and opinions', 'live well, study well: learning styles; enjoying learning'],
      },
      {
        unit: 12, title: 'Body and mind', sbPages: '137–148',
        grammar: ['adjectives: order before a noun (opinion, size, age, shape, colour, origin, material; generic opinion before specific); -ed vs -ing adjectives (feelings vs cause); more/most with -ed/-ing adjectives', 'adverbs: five types (frequency, manner, time, place, degree) and their positions; order manner + place + time; place before manner with movement verbs', 'so and such: so + adjective/adverb/quantifier; such + a/an (+ adjective) + singular noun; such (+ adjective) + plural noun; so/such … that-clause', 'comparison of adjectives and adverbs: comparative and superlative; adverbs with -ly; same-form adjective/adverb (close, daily, early, far, fast, hard, high, late, likely, live, long, low, right, wide, wrong); -ly forms with different meaning (closely, hardly, highly, lately, rightly/wrongly); -er/-est vs more/most, than, the; spelling (-e, -y, doubling); irregular (good/well, bad/badly, many/much, little, far); (not) as … as'],
        vocab: ['elbow', 'heel', 'lip', 'shoulder', 'thumb', 'toe', 'chin', 'forehead', 'eyebrow', 'beard', 'stomach', 'sore', 'painful', 'sneeze', 'cough', 'swallow', 'right-handed', 'automatically', 'injury', 'injured', 'operation', 'illness', 'prescription', 'pharmacy', 'tablet', 'earache', 'flu', 'sore throat', 'ambulance', 'recover', 'lose weight', 'put on weight', 'catch a cold', 'go on a diet', 'keep fit'],
        strands: ['parts of the body', 'injuries and illnesses', 'exam: open cloze (thinking about the type of word)', 'reading: multiple choice, one text (choosing the best option)', 'listening: multiple choice with picture options (keeping calm)', 'speaking: showing interest, general conversation', 'writing: essay, using formal language, thinking about structure', 'video: Learning another language'],
      },
    ],
  },
  {
    id: 'close-up-b2',
    name: 'Close-Up',
    publisher: 'National Geographic Learning',
    level: 'B2',
    exam: 'FCE/B2 First',
    note: "Verified against the Teacher's Book via _source-books/SYLLABUS_new-close-up-b2.md, 13 Oct 2026",
    verified: true,
    units: [
      // All 12 units verified against the Teacher's Book on 13 Oct 2026 via
      // Somerset Worksheets/_source-books/SYLLABUS_new-close-up-b2.md (New Close-up B2, 3rd edition).
      // "Vocabulary 2" is the Use your English lesson. Vocab lists come from the Student's Book answer key;
      // where the key only gives letter matches (most phrasal-verb sets) the verbs are not listed here.
      {
        unit: 1, title: 'Jump for joy', sbPages: '5–16',
        grammar: ['present simple and present continuous: facts and general truths / actions in progress now; permanent situations / temporary or changing situations', 'present perfect simple and continuous: states vs actions that started in the past and continue; how many vs how long; result of a finished action vs result of a process that may continue; finished action with no time vs recent unfinished action', 'adverb position with the present perfect: before, lately, recently, yet at the end; already, just, still, ever, never before the main verb; still before a negative auxiliary; a lot / more and more after the verb; yet vs still', 'been vs gone'],
        vocab: ['joy', 'overjoyed', 'confidence', 'confident', 'relief', 'relieved', 'amazement', 'amazed', 'despair', 'desperate', 'guilt', 'guilty', 'embarrassment', 'embarrassed', 'anxiety', 'anxious', 'frustration', 'frustrated', 'sympathy', 'sympathetic', 'sensitive'],
        strands: ['emotions (noun → adjective)', 'personality adjectives with positive and negative connotation', 'phrasal verbs', 'prepositions after adjectives and verbs (to, on, for, into)', 'exam: open cloze (completing gapped texts)', 'reading: multiple choice, one text (finding key information in the text)', 'listening: multiple choice, one per text (identifying your reason for listening)', 'speaking: answering personal questions, interview', 'writing: informal letter / email giving advice (If I were you…, Why don\'t you…), using the correct tone, planning your response', 'live well, study well: resilience; positive and negative thinking'],
      },
      {
        unit: 2, title: 'Global culture?', sbPages: '17–28',
        grammar: ['past simple and past continuous: finished past action / action in progress at a past time; past routines and habits / temporary past situations; sequential actions / background in a story', 'used to and would: used to for regular past actions and past states; would for regular past actions, usually with a time reference, not for states', 'past simple and present perfect: specified vs unspecified past time (experiences); finished vs still in progress; gone vs been', 'be used to and get used to: usual or familiar vs becoming familiar (+ -ing / noun)'],
        vocab: ['tradition', 'ritual', 'roles', 'spectacle', 'origins', 'festivities', 'legend', 'ceremony', 'costume', 'masks', 'parade', 'spectators', 'witness', 'reception', 'ancestors', 'bonds', 'speech', 'give a speech', 'play a role', 'hold a ceremony'],
        strands: ['traditions and festivals', 'phrasal verbs', 'collocations with give, play, hold, build, have, use, know', 'exam: sentence transformation (while I was giving, get used to, an important role in, talked me into, dates back, used to spend)', 'reading: matching prompts to text (eliminating "almost right" answers)', 'listening: sentence completion (predicting content)', 'speaking: talking together, collaborative task', 'writing: opinion essay, organising your ideas (one paragraph per point, topic sentences), linkers To my mind / In my view / Apart from / In addition / Personally', 'video: Intercultural skills for turbulent times'],
      },
      {
        unit: 3, title: 'Role models', sbPages: '29–40',
        grammar: ['past perfect simple and past perfect continuous: action finished before another past action / action in progress up to a past time; completed past action with a later past result / action in progress up to a point with an immediate result', 'past simple, past perfect simple and past perfect continuous: past perfect forms for events before the main event vs past simple for a series of actions in order'],
        vocab: ['overcome', 'cope', 'rumour', 'gossip', 'scandal', 'disgrace', 'breakthrough', 'comeback', 'follow in sb\'s footsteps', 'come from nowhere', 'chance', 'keep a secret', 'open doors', 'fame', 'get anywhere', 'make a name', 'ambition', 'determination', 'encourage', 'encouragement', 'fail', 'failure', 'famous', 'influence', 'inspire', 'real', 'reality', 'sponsor', 'succeed'],
        strands: ['success and fame', 'word families', 'phrasal verbs', 'expressions', 'exam: open cloze (thinking about the missing words)', 'reading: gapped text, matching sentences to gaps (choosing the correct sentences)', 'listening: matching prompts to speakers (scanning statements while listening)', 'speaking: comparing photos, photo description', 'writing: story, using the conventions of a story, using prompts, evaluating endings; narrative expressions out of the blue, in his wildest dreams, absolutely stunned, at long last, to make matters worse', 'live well, study well: time management; procrastination'],
      },
      {
        unit: 4, title: 'City living', sbPages: '41–52',
        grammar: ['future forms: will (decisions at the time of speaking, predictions, promises and threats, future facts, after think/believe/be sure/expect/probably/maybe, offers, requests); be going to (plans, predictions from present evidence); shall (suggestions and offers with I/we) and should (predictions)', 'future continuous: in progress at a future time; plans and arrangements', 'future perfect simple (finished before a future time; duration up to a future point) and future perfect continuous', 'time clauses with before, after, until etc.', 'countable and uncountable nouns: plural forms, a/an', 'quantifiers: some/any; a few / a little vs few / little; much/many, a lot of'],
        vocab: ['bike lane', 'pavement', 'crossroads', 'roadworks', 'junction', 'traffic light', 'pedestrian crossing', 'zone', 'speed limit', 'speed camera', 'venues', 'facilities', 'settle', 'urbanisation', 'rapid', 'urban', 'suburbs', 'outskirts', 'rural', 'inhabitants'],
        strands: ['cities', 'collocations and expressions with town, urban, place, lane', 'exam: multiple-choice cloze (choosing the correct word)', 'reading: matching prompts to texts (non-linear reading)', 'listening: multiple choice, seven questions (eliminating incorrect answers)', 'speaking: expressing opinions, collaborative task', 'writing: article giving advice, essays vs articles, engaging your reader (addressing "you", rhetorical questions), planning an article', 'video: Could biking in a city be bad for you?'],
      },
      {
        unit: 5, title: 'Emerging technologies', sbPages: '53–64',
        grammar: ['modals of permission and obligation: can/may (permission; may formal); must/mustn\'t (rules); have to / need to (external rules)', 'modals of ability: can/could/be able to (general ability present and past); will be able to (future); specific past ability', 'modals of probability: must (sure it is true); may/might/could (not sure); can\'t (sure it is not true)', 'perfect modals: modal + have + past participle; could/may/might have (deduction, possibility); must/can\'t have (deduction, certainty); could/would/should/ought to have (unfulfilled possibility, criticism, regret)'],
        vocab: ['log in', 'log on', 'apps', 'attachments', 'back-up', 'bookmark', 'browsing', 'display', 'restore', 'updating', 'virtual', 'virtual reality', 'headset', 'desktop', 'hard drive', 'databases', 'broadband', 'passwords', 'wireless', 'network', 'anti-virus'],
        strands: ['technology', 'compound nouns', 'phrasal verbs', 'prepositions (with, at, for, to, in)', 'exam: open cloze (noticing grammar structures)', 'reading: multiple choice, two short texts (coping with technical vocabulary)', 'listening: multiple choice with picture options (choosing from pictures)', 'speaking: discussion tasks, discussion', 'writing: essay (two prompts + own idea), deciding what language to use, including supporting points; linkers of contrast (however, despite, in spite of), result (consequently, because of), example (for instance), addition (what\'s more, in addition)', 'live well, study well: how we use technology; using technology positively'],
      },
      {
        unit: 6, title: 'Take it easy', sbPages: '65–76',
        grammar: ['the -ing form: as subject; after prepositions; after go (activities); after certain verbs and phrases', 'infinitives: to-infinitive for purpose, after adjectives (easy, difficult, afraid, happy, glad…), after too + adjective / adjective + enough, after certain verbs; bare infinitive after modals, had better, would rather; let/make + object + infinitive (passive: be allowed to / be made to); help (to)', 'verbs taking -ing or infinitive with no change (begin, bother, continue, hate, like, love, start) and with a change of meaning (go on, …)', 'question tags: affirmative/negative reversal; same auxiliary or modal; do/does/did', 'indirect questions: statement word order; question word; if/whether', 'negative questions: surprise, doubt, expecting agreement; formal Did you not…?'],
        vocab: ['lap', 'competitive', 'victory', 'marathon', 'medal', 'opponent', 'set', 'round', 'semifinal', 'trophy', 'represent', 'gave up', 'took off', 'knocked over', 'keep up with', 'burst out', 'showing off'],
        strands: ['sports', 'verb + sport collocations', 'phrasal verbs', 'prepositions (for, onto, to, on, of)', 'collocations with take, come, put, make, know, hold', 'exam: sentence transformation (focusing on what you know)', 'reading: multiple choice with four texts (identifying the purpose of a text)', 'listening: sentence completion (working out the missing information)', 'speaking: justifying opinions, collaborative task', 'writing: report (survey results + recommendations), planning and organising a report, reporting information effectively (the vast majority, almost one third, well over half, one in ten…)', 'video: Will future robots and AI take over?'],
      },
      {
        unit: 7, title: 'Law and order', sbPages: '77–88',
        grammar: ['the passive: to emphasise the action; agent unknown or unimportant; by + agent for emphasis; passive with -ing, infinitive, to-infinitive and modals (being kept, to be informed, can be reported)', 'impersonal passive: it is believed/thought/rumoured/hoped that…', 'causatives: have/get + object + past participle (arrangements; get = informal); have sth done for unpleasant events; have sb do / get sb to do'],
        vocab: ['suspect', 'accuse', 'pay a fine', 'found guilty', 'commit', 'receive a sentence', 'hold', 'confess', 'break into', 'take', 'burglary', 'investigation', 'crime scene', 'investigate', 'innocent', 'accused', 'arrest', 'guilt', 'case', 'jury', 'evidence', 'proof', 'guilty', 'sentenced', 'burglaries', 'criminal', 'robbery', 'punishment', 'offender', 'illegally', 'suspicious', 'saw through', 'got away with', 'go off', 'ran away', 'saw to', 'burned down'],
        strands: ['crime', 'word formation', 'prepositions (against, of, to, for)', 'phrasal verbs', 'expressions with keep, make, lose, change, give, have, care, do', 'exam: sentence transformation (transforming the passive)', 'reading: multiple choice, one text (sentence stems)', 'listening: multiple choice, one per text (listening for emotions, attitude)', 'speaking: answering the follow-up question, photo description', 'writing: formal letter asking for information, achieving your purpose (transactional vs discursive), formal register (Dear Ms…, no contractions, I would appreciate…)', 'live well, study well: using your free time; the power of relaxation'],
      },
      {
        unit: 8, title: 'A changing world', sbPages: '89–100',
        grammar: ['conditionals: zero (always true; if/when); first (probable; will/could/may/might + imperative result); second (unreal or unlikely; would/could/might; advice If I were you); third (imagined past)', 'mixed conditionals: clauses referring to different times (past condition → present result; present condition → past result)', 'conditionals without if: provided/providing (that), on condition that, as long as; unless (= if not); otherwise; suppose/supposing'],
        vocab: ['endangered species', 'nature reserves', 'natural resources', 'atmosphere', 'organic', 'threats', 'gases', 'generate', 'consume', 'global warming', 'reduction', 'coastal', 'massive', 'ecological', 'dramatically', 'destruction', 'carbon dioxide', 'greenhouse gases', 'fossil fuels', 'carbon footprint', 'climate change', 'renewable energy', 'solar power', 'environmentally friendly', 'put up with', 'slow down', 'run out', 'use up', 'solve a problem', 'set an example', 'go green', 'take action', 'draw attention', 'make a difference', 'play a part'],
        strands: ['the environment', 'phrasal verbs', 'collocations with put, play, tackle, drop, do, take', 'exam: multiple-choice cloze (identifying phrasal verbs)', 'reading: gapped text, matching sentences to gaps (analysing linking words in a text)', 'listening: matching prompts to speakers (identifying function)', 'speaking: dealing with disagreements, collaborative task', 'writing: essay (five paragraphs), avoiding common mistakes (error codes), using a good range of language, neutral register', 'video: Causes and effects of climate change'],
      },
      {
        unit: 9, title: 'And what do you do?', sbPages: '101–112',
        grammar: ['relative clauses: defining vs non-defining (essential vs extra information; commas; that only in defining); omitting the object relative pronoun; whose never omitted; preposition + whom/which (formal) vs preposition at the end', 'reduced relative clauses: omit pronoun + be, leaving -ing or past participle; -ing for permanent situations and states', 'participle clauses: present participle replaces subject + active verb when subjects match; implied reason, condition, result or time; negative Not knowing…; past participle for passive'],
        vocab: ['manual', 'professional', 'managerial', 'manufacturer', 'retirement', 'competition', 'responsibilities', 'industrial', 'division', 'redundancies', 'promoted', 'satisfaction', 'achievement', 'suitably', 'promotion', 'dissatisfied', 'productive', 'reliable', 'depressed', 'positive attitude', 'communication skills', 'IT skills', 'interpersonal skills', 'hardworking', 'honest', 'punctual', 'team work'],
        strands: ['jobs and work (job types)', 'collocations with do, work, go, get, give, deal, miss, make, head', 'word formation', 'phrasal verbs', 'idioms', 'exam: word formation (testing different word endings)', 'reading: matching prompts to texts (identifying the writer\'s opinions and experiences)', 'listening: multiple choice, seven questions (focusing on the questions)', 'speaking: organising your answer, solving a problem', 'writing: cover letter for a job application (five paragraphs), presenting yourself in a positive light, soft-skill vocabulary', 'live well, study well: career first steps; coping with uncertainty'],
      },
      {
        unit: 10, title: 'Learn to learn', sbPages: '113–124',
        grammar: ['reported speech: direct vs reported; tense changes (backshifting); reported questions (word order, if/whether); reported commands (told me to…)', 'reporting verbs: verb + to-infinitive (agree, claim, decide, refuse, offer, promise); verb + object + to-infinitive (advise, encourage, order, persuade, remind, warn); verb + -ing (admit, deny, recommend, suggest); verb + preposition + -ing (congratulate on, tell off for); verb + that-clause'],
        vocab: ['tutor', 'lecturer', 'instructor', 'coach', 'adviser', 'trainer', 'educate', 'graduate', 'learn', 'learner', 'pass', 'research', 'researcher', 'study', 'retake', 'progress', 'cheat', 'praise', 'raise', 'adapt', 'assessment', 'assignment', 'degree', 'certificate', 'scholarship', 'apprenticeship', 'fees', 'payments', 'encouragement', 'corrections', 'memorise', 'absence', 'graduation'],
        strands: ['education', 'phrasal verbs', 'word formation', 'exam: sentence transformation with reporting verbs (guessing what comes next)', 'reading: multiple choice, one text (focusing on the correct part of a text)', 'listening: sentence completion (difficult words and phrases)', 'speaking: dealing with difficult questions, discussion', 'writing: article (opinion, with own experience), giving your opinions in an article, persuading and suggesting, personal examples', 'video: Surrounded by monkeys'],
      },
      {
        unit: 11, title: 'Wish you were here?', sbPages: '125–136',
        grammar: ['comparative and superlative structures: -er/more, -est/most; (a bit / much / far) less; fewer / the fewest; the + comparative … the + comparative', 'so, such, too, enough: so + adjective/adverb; such + (adjective) + noun; so/such … that; too (excess); (not) enough; too/enough + to-infinitive', 'gradable and ungradable adjectives: gradable with a little/extremely/fairly/very and comparatives; ungradable with absolutely/completely', 'adjectives and adverbs: adverb formation (-ly, -le → -ly, -ic → -ally, -ly adjective → in a … way); words that are both (hard, early, late, straight, fast); hard/hardly, late/lately'],
        vocab: ['scheduled', 'running late', 'traffic', 'lanes', 'sailing', 'yacht', 'deck', 'wander', 'sights', 'rush hour', 'landing', 'connection', 'voyage', 'cruise', 'ferry', 'head for', 'peak season', 'considerably', 'beautiful', 'occasionally', 'hardly', 'terribly', 'loneliness', 'interestingly', 'cultural'],
        strands: ['travel', 'phrasal verbs', 'collocations with take, put, get, hold, have, give', 'forming adverbs', 'exam: word formation', 'reading: multiple choice, one text (working out meaning from context)', 'listening: multiple choice, seven questions (working with degree)', 'speaking: organising a long turn, photo description', 'writing: story, prompts and tenses, conveying emotions (mystery, urgency, surprise, sadness, fear, happiness)', 'live well, study well: resolving misunderstandings; assertiveness'],
      },
      {
        unit: 12, title: 'Fit for life', sbPages: '137–148',
        grammar: ['wishes: wish + past simple/continuous (present or future); wish + past perfect (past); wish + could; wish + would (complaint); if only', 'other ways of talking about unreal situations: as if / as though (+ present or past; past for unreal present); it\'s (about) time + past; would rather + infinitive / would rather + pronoun + past', 'negative inversion: auxiliary before subject after never (have), not only, under no circumstances, little did I know, rarely, seldom, not once, only then, no sooner … than, hardly, not since; do/does/did when there is no auxiliary'],
        vocab: ['eyebrow', 'eyelid', 'gums', 'jaw', 'muscles', 'fingernails', 'wrist', 'hip', 'thigh', 'toenails', 'chest', 'liver', 'lungs', 'rib', 'waist', 'scar', 'stroke', 'bruise', 'swollen', 'reaction', 'spot', 'disability', 'develop', 'ache', 'bump', 'sweat', 'cure', 'treat', 'faint', 'itch', 'heal', 'keep fit', 'hold your breath', 'lose weight', 'convenient', 'overpriced', 'state-of-the-art'],
        strands: ['health and fitness: the body, conditions, verbs', 'phrasal verbs', 'health expressions with keep, be, hold, lose, give, do, have', 'exam: multiple-choice cloze (recognising grammar structures)', 'reading: gapped text, matching sentences to gaps (matching by tense and topic)', 'listening: multiple choice, one per text (real-life listening)', 'speaking: dealing with a difficult partner, discussion', 'writing: review (gym), using the right language (report vs review register), deciding what to write about, evaluative adjectives', 'video: How solving this medical mystery saved lives'],
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
