// Cambridge B2 First — Practice Test 4 (PPP green book, pages 68–85).
// Transcribed 17 Jul 2026 from Hugo's book scans for the Somerset CBT trial.
// Internal teaching use of Somerset's own coursebook material (rule of 5 Jul 2026).
// Question keys use the same "part#qNumber" scheme as the mock answer keys, so a key
// entered at /mocks for exam id "test4-b2first" scores this test automatically.

export interface CbtMcq {
  q: number
  text?: string          // question stem (or situation line for listening P1)
  question?: string      // secondary line (listening P1's actual question)
  options: { letter: string; text: string }[]
  audio?: string         // per-question recording (listening P1) — file under /cbt-audio/test4/
}

export interface CbtReadingPart {
  part: string           // ExamPart id, e.g. "reading-p1"
  title: string
  instructions: string
  passageTitle?: string
  passage?: string       // gaps marked (n) or [n]
  stems?: Record<number, string>       // uoe-p3 word-formation stems
  transformations?: { q: number; sentence: string; keyword: string; gapped: string }[]
  mcqs?: CbtMcq[]
  gapOptions?: { letter: string; text: string }[]   // reading-p6 sentence bank
  matchTexts?: { letter: string; title: string; text: string }[]  // reading-p7
  matchQuestions?: { q: number; text: string }[]
  openGaps?: number[]    // uoe-p2 / uoe-p3 question numbers answered by typing
}

export interface CbtListeningPart {
  part: string
  title: string
  instructions: string
  audio: string[]        // files under /cbt-audio/test4/, played in order
  mcqs?: CbtMcq[]
  sentences?: { q: number; before: string; after: string }[]   // listening-p2
  speakers?: { q: number; label: string }[]                     // listening-p3
  speakerOptions?: { letter: string; text: string }[]
}

export interface CbtWritingTask {
  taskNumber: number
  compulsory: boolean
  type: string
  prompt: string
  box?: string           // the framed prompt/advert text
  notes?: string[]
}

export const TEST4 = {
  id: 'test4-b2first',
  title: 'Cambridge FCE Style Test',
  papers: {
    'reading-uoe': { name: 'Reading and Use of English', durationMin: 75 },
    'writing': { name: 'Writing', durationMin: 80 },
    'listening': { name: 'Listening', durationMin: 40 },
  },

  readingParts: [
    {
      part: 'reading-p1',
      title: 'Part 1',
      instructions: 'For questions 1–8, read the text below and decide which answer (A, B, C or D) best fits each gap.',
      passageTitle: 'Lunch is for sharing',
      passage: `Mimi Ito carefully (0) [PUTS] together her children's packed lunches each morning. She then takes photos of them and (1) ........... these on her online blog. In this way, Mimi is able to (2) ........... a record of meals that she's (3) ........... of, and everyone has the chance to look at her mouth-watering creations. For these are no ordinary lunches, Mimi prepares what are (4) ........... as bento meals for her children.

A bento is a single-portion Japanese takeaway meal that traditionally (5) ........... of rice, fish or meat, with vegetables on the side. In Japan, they are normally served in distinctive trays divided into sections for the different parts of the meal. Mimi thinks that children in (6) ........... enjoy having small compartments with little bits of food that are (7) ........... to their small appetites. Mimi was born in Japan and currently lives in the USA. She is fairly health (8) ........... , but believes that having wide tastes and finding pleasure in food is important.`,
      mcqs: [
        { q: 1, options: [{ letter: 'A', text: 'mails' }, { letter: 'B', text: 'sends' }, { letter: 'C', text: 'posts' }, { letter: 'D', text: 'delivers' }] },
        { q: 2, options: [{ letter: 'A', text: 'make' }, { letter: 'B', text: 'keep' }, { letter: 'C', text: 'save' }, { letter: 'D', text: 'do' }] },
        { q: 3, options: [{ letter: 'A', text: 'content' }, { letter: 'B', text: 'satisfied' }, { letter: 'C', text: 'proud' }, { letter: 'D', text: 'pleased' }] },
        { q: 4, options: [{ letter: 'A', text: 'titled' }, { letter: 'B', text: 'called' }, { letter: 'C', text: 'named' }, { letter: 'D', text: 'known' }] },
        { q: 5, options: [{ letter: 'A', text: 'consists' }, { letter: 'B', text: 'includes' }, { letter: 'C', text: 'contains' }, { letter: 'D', text: 'involves' }] },
        { q: 6, options: [{ letter: 'A', text: 'specific' }, { letter: 'B', text: 'particular' }, { letter: 'C', text: 'special' }, { letter: 'D', text: 'precise' }] },
        { q: 7, options: [{ letter: 'A', text: 'suited' }, { letter: 'B', text: 'fitted' }, { letter: 'C', text: 'created' }, { letter: 'D', text: 'designed' }] },
        { q: 8, options: [{ letter: 'A', text: 'sensible' }, { letter: 'B', text: 'conscious' }, { letter: 'C', text: 'knowledgeable' }, { letter: 'D', text: 'informed' }] },
      ],
    },
    {
      part: 'uoe-p2',
      title: 'Part 2',
      instructions: 'For questions 9–16, read the text below and think of the word which best fits each gap. Use only one word in each gap.',
      passageTitle: 'Mr Bean',
      passage: `The comedy character Mr Bean is (0) [ONE] of Britain's most successful exports. Played by the actor Rowan Atkinson, Mr Bean is instantly recognisable to people around the world. The original television show has been shown on (9) ........... than two-hundred TV stations, as (10) ........... as on over fifty airlines.

So why is Mr Bean so popular? (11) ........... many people regard Mr Bean as a typically British character, the initial inspiration actually came from a French comic character called Monsieur Hulot, created by the French comedian Jacques Tati.

According (12) ........... Rowan Atkinson, however, the actual character of Mr Bean is mostly based on (13) ........... own personality as a nine-year-old. Mr Bean is a man (14) ........... is awkward, self-conscious and accident-prone. He's very selfish and doesn't really understand much about the world (15) ........... him. He's really a child in a man's body. This is the basis for a lot of visual comedy and Atkinson mentions comedians (16) ........... as Charlie Chaplin and Stan Laurel as other famous examples.`,
      openGaps: [9, 10, 11, 12, 13, 14, 15, 16],
    },
    {
      part: 'uoe-p3',
      title: 'Part 3',
      instructions: 'For questions 17–24, use the word given in capitals to form a word that fits in the gap.',
      passageTitle: 'Computer Games',
      passage: `To get an idea of the (0) [ARTISTIC] and technical skill that goes into a computer game, you only need to visit the Los Angeles studio of Electronic Arts, one of the world's largest and most (17) ........... game-makers. The firm's (18) ........... team have just started work on the latest version of one of their most popular games. As you enter the building, you see an (19) ........... display of photographs that help you to imagine what the game's particular look and style will be like.

The (20) ........... of the game will involve engineers, technical experts and musicians, and will cost millions of dollars. These days, there is a great deal of (21) ........... between making a game and making a Hollywood movie, and it's big business.

According to (22) ........... , Americans are spending increasing amounts of money on computer games each year. Part of the (23) ........... for the success of the games comes from the (24) ........... rise in the number of adults who are buying them, not as gifts for teenagers, but for their own personal use.`,
      stems: { 17: 'INFLUENCE', 18: 'CREATE', 19: 'IMPRESS', 20: 'DEVELOP', 21: 'SIMILAR', 22: 'ECONOMY', 23: 'EXPLAIN', 24: 'EXPECTED' },
      openGaps: [17, 18, 19, 20, 21, 22, 23, 24],
    },
    {
      part: 'uoe-p4',
      title: 'Part 4',
      instructions: 'For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. Use between two and five words, including the word given.',
      transformations: [
        { q: 25, sentence: 'Which of the places you visited interested you most?', keyword: 'THE', gapped: 'Which was ........................... that you visited?' },
        { q: 26, sentence: 'Sally arrived late at the conference because her flight was delayed.', keyword: 'TIME', gapped: "If Sally's ........................... , she wouldn't have arrived late at the conference." },
        { q: 27, sentence: 'Colin will only read your email immediately if you mark it as urgent.', keyword: 'UNLESS', gapped: 'Colin will ........................... you mark it as urgent.' },
        { q: 28, sentence: 'Tania regrets lending her new laptop to her little brother.', keyword: 'WISHES', gapped: 'Tania ........................... her new laptop to her little brother.' },
        { q: 29, sentence: "I'm sure it was a real disappointment for Gerry that his team didn't win promotion.", keyword: 'BEEN', gapped: "Gerry ........................... that his team didn't win promotion." },
        { q: 30, sentence: "Alex offered Cindy a lift on his new motorbike, but she didn't accept.", keyword: 'TURNED', gapped: 'Cindy ........................... offer of a lift on his new motorbike.' },
      ],
    },
    {
      part: 'reading-p5',
      title: 'Part 5',
      instructions: 'You are going to read an extract from a novel. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      passage: `I made a discovery on the way to Ruth's aunt's house in Spain. The things you worry about don't always turn out as badly as you expect. Sometimes they're worse. Everything would have been different if our plane had landed on schedule. Ruth was quite nice about it, as always, but I know that she really thought it was my fault.

Our plan had been to arrive in Spain, collect the hire car, shop for groceries and still get to the house in daylight. I'd felt proud of myself when I'd booked the tickets. I'd got a special cheap offer on the internet. But that was silly because Ruth's aunt was paying our expenses and she wasn't the kind of woman who expects people to fly on budget airlines. To her mind, you pay full price for comfort and reliability. Our flight got to Spain about three hours later than expected.

By the time we got to where our hire-car was waiting amongst dozens of others, it was totally dark. The man at the desk confirmed what we'd guessed. It was too late for shopping. While I signed for the car – gripping the pen hard so that my name wouldn't look as shaky as I felt – Ruth bought two cartons of fruit juice from a vending machine.

'Ruth!' I said, as I drove cautiously out of the car park, gripping the wheel. 'Which way is it? I'm not going to be able to understand any of the road signs!'

'You just need to follow the coast road,' said Ruth. 'It's simple. Things don't get tough until we take a left into the mountains.' [line 13]

As all I had to do was drive straight ahead, I began to relax. Then it was time to turn off into the mountains and I felt stressed again. Apart from anything else, you don't get street lighting on lonely country roads in southern Spain. This road climbed slowly but steadily in a series of Z-shapes, with a rocky wall on the left and a steep drop on the right. We gradually lost the rest of the traffic until there was hardly any. I can tell you now that hardly any is worse than a lot. All would be quiet and then suddenly headlights would appear behind us, sweep past us and vanish. Or lights would blaze round a corner ahead, without warning, looking as though they were coming right at us.

Ruth read out where I should go, and me and the car went. It all made sense. Or it did until she pointed to an olive grove, all silvery in the moonlight, and told me to drive into it.

'I can't,' I said. 'There's no road.'

'There's a track,' said Ruth. 'Up ahead, see? On the left. It's right opposite a white house with green shutters, just like the directions say.'

I gave way. But I wasn't happy. 'This is not a track,' I said, driving cautiously onto it. 'It's just a strip of land where the olive trees aren't.' We bounced slowly along in silence, apart from the scrunching of pebbles under the wheels. Ahead was the dark outline of a small house.

'This is it,' said Ruth. 'See – we made it!'

The track opened out into a parking space beside the house. There it stopped – end of the road. 'Are you sure about this?' I whispered. 'It's really late, Ruth. If we're wrong, we're going to wake people up.'

'There's no one to wake up,' said Ruth, getting out. 'The place is empty. Just waiting for us.'`,
      mcqs: [
        { q: 31, text: 'What does the narrator suggest about her trip in the first paragraph?', options: [
          { letter: 'A', text: "She'd expected Ruth to share the blame for what happened." },
          { letter: 'B', text: "She'd expected Ruth to be angry with her." },
          { letter: 'C', text: "She'd expected aspects of it to go wrong." },
          { letter: 'D', text: "She'd expected her plane to be delayed." }] },
        { q: 32, text: 'What mistake did the narrator make when booking their flight?', options: [
          { letter: 'A', text: "She hadn't followed Ruth's advice about the airline." },
          { letter: 'B', text: "She'd forgotten that someone else was paying for them." },
          { letter: 'C', text: "She'd chosen one that was scheduled to arrive after dark." },
          { letter: 'D', text: "She hadn't realised that they would need to go shopping on arrival." }] },
        { q: 33, text: 'How did the narrator feel in the car-hire office?', options: [
          { letter: 'A', text: 'keen not to let her nervous state show' },
          { letter: 'B', text: 'cross because she had to wait in a queue' },
          { letter: 'C', text: 'grateful for the advice of the man behind the desk' },
          { letter: 'D', text: 'confused by the documents that she needed to sign' }] },
        { q: 34, text: "'it' in line 13 refers to", options: [
          { letter: 'A', text: 'understanding the road signs.' },
          { letter: 'B', text: 'driving in the dark.' },
          { letter: 'C', text: 'taking a left turn.' },
          { letter: 'D', text: 'finding the way.' }] },
        { q: 35, text: 'When driving into the mountains, the narrator felt', options: [
          { letter: 'A', text: 'reassured by the sound of passing traffic.' },
          { letter: 'B', text: 'alarmed by the sight of other car headlights.' },
          { letter: 'C', text: 'frustrated by their rather slow progress.' },
          { letter: 'D', text: 'unsure if they were on the right road.' }] },
        { q: 36, text: 'How did Ruth know that they should turn into the olive grove?', options: [
          { letter: 'A', text: 'She was consulting a map.' },
          { letter: 'B', text: 'She had been there before.' },
          { letter: 'C', text: 'She had written instructions.' },
          { letter: 'D', text: 'She asked some local residents.' }] },
      ],
    },
    {
      part: 'reading-p6',
      title: 'Part 6',
      instructions: 'You are going to read an article about a musician. Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap (37–42). There is one extra sentence you do not need to use.',
      passageTitle: 'Femi Kuti, a great African musician',
      passage: `In the fashion-led world of pop culture, carrying a famous name is always a burden, as the offspring of musicians like John Lennon and Bob Marley have found. Yet the history of much of the world's music – certainly in Africa – is based on a long and deep tradition of passing on the torch from one generation to the next. Femi Kuti is the son of Fela Kuti, a renowned musician who died ten years ago.

Throughout his career, Femi Kuti has had to suffer comparisons with his father. You can't fill the boots of a legend and Fela Kuti was not only an extraordinary and innovative musician but one of the giants of world music. [37] ........... He has kept alive the flame of Afro-beat as well as bringing his own unique creativity to its rhythms.

Femi was born in London in 1962, when his father was a student at the Royal Academy. Fela never showed his oldest son any signs of approval or encouragement. [38] ........... Yet by the age of fifteen, Femi's impressive playing had earned him a place in his father's band, Egypt 80, on merit.

Femi didn't have to wait long for his first opportunity to head that band. In 1985, it had been booked to play at the Hollywood Bowl, but Femi's father failed to make it on to the plane. [39] ........... This gave him the confidence he needed to start a band of his own.

In 1986, together with keyboard player Dele Sosimi, Femi left his father's band and formed the band Positive Force, resulting in tensions between father and son that were to last several years. [40] ........... Now a collector's item, its mix of funk, soul and jazz, driven by thundering percussion, proved that he could stand on his own two feet.

Femi made his first US tour in 1995, which culminated in an acclaimed appearance at the Summer stage in New York's Central Park in July. The tour coincided with the release of his album, Femi Kuti, which earned him very good reviews across Europe and the US. [41] ........... He finally admitted that his son had what it takes.

Though Femi remains resentful of what he sees as his father's lack of support early in his career, he recognises that he learnt things from him: '[42] ...........' says Femi. That individuality was certainly evident on his next album, Shoki Shoki, which added fresh flavours drawn from contemporary R&B and dance music.

And as we wait for his next album, the Kuti tradition continues and Femi's own son now plays alongside him in Positive Force. 'The one thing I learned from my father was to be true to myself, and that's the advice I've given my own child.' Femi sounds proud of his son.`,
      gapOptions: [
        { letter: 'A', text: 'Femi stepped forward to fill his place, and did so, by all accounts, with considerable skill.' },
        { letter: 'B', text: "It also won him six awards at Nigeria's Fame Music Awards and led at last to a reconciliation with his father." },
        { letter: 'C', text: "Yet his father's long shadow should not obscure the fact that Femi Kuti has developed into a fine performer in his own right." },
        { letter: 'D', text: 'It was at this place that he helped to fund a variety of cultural, social and educational projects.' },
        { letter: 'E', text: "Femi's debut album with the new band, No Cause for Alarm?, was recorded in Lagos and released on Polygram Nigeria in 1987." },
        { letter: 'F', text: 'After giving him a saxophone as a young boy, he then refused to give him any lessons.' },
        { letter: 'G', text: "When I look at his life, it's very hard for me to be angry with him because he taught me to be different and to do things my own way." },
      ],
    },
    {
      part: 'reading-p7',
      title: 'Part 7',
      instructions: 'You are going to read an article about extreme sports. For questions 43–52, choose from the people (A–D). The people may be chosen more than once.',
      passageTitle: 'ANYONE FOR EXTREME SPORTS?',
      matchQuestions: [
        { q: 43, text: 'was aware of making a mistake during training?' },
        { q: 44, text: 'expected the first day of training to be relatively easy?' },
        { q: 45, text: 'was confident of having the physical strength to succeed?' },
        { q: 46, text: 'improved their performance by following some useful advice?' },
        { q: 47, text: 'is confident of overcoming any feelings of fear?' },
        { q: 48, text: 'felt nervous when preparing to try the sport for the first time?' },
        { q: 49, text: 'mentions the feeling of joy that the sport gave?' },
        { q: 50, text: 'was told the sport was not as dangerous as people think?' },
        { q: 51, text: 'was more successful than somebody else in a first attempt?' },
        { q: 52, text: 'felt disappointed when the trainer gave an order to stop?' },
      ],
      matchTexts: [
        { letter: 'A', title: 'Brenda Gordon: flying trapeze', text: `I wanted to do something where I was having so much fun I wouldn't even notice I was exercising. I decided to try a half-day circus-skills course. Despite doing a series of preparation exercises, when I stood facing the flying trapeze, I noticed a slight fluttering in my stomach. Next, I was shown the right way to grip the trapeze and how to step off the platform without hitting my back. Then, suddenly, I was being counted down from three. My heart was racing but I kept thinking I'd no doubt be able to take my body weight in my very muscular arms. Then in a moment, I'd stepped off and, incredibly, I was swinging through the air. It was exhilarating, and I was aware of a real feeling of regret when the instructor told me to drop. A year later, I'm a fearless trapeze flyer, though my muscles still hurt after every session.` },
        { letter: 'B', title: 'Guy Stanton: ice-climbing', text: `I started ice-climbing at an indoor climbing centre with an enormous artificial ice cave. I turned up fully kitted up in climbing boots, metal crampons and two metal ice axes. The instructor ran through a demonstration. Then it was my turn. I buried the axes in the ice, kicked one boot at the wall, then the other, and started climbing. But I had forgotten my first important lesson: don't bury your axes too deep. As my desire not to fall increased, so I hammered them deeper until they got stuck. My arms were aching and I stopped, utterly disappointed with myself. The trainer shouted some encouragement: 'You can do it, don't grip the axes so hard!' I did so and my more relaxed style meant less pressure on my arms, so I started enjoying it. I still feel frightened when I'm high up, but I know I'll feel completely at ease eventually.` },
        { letter: 'C', title: 'Debbie Bridge: free-diving', text: `Free-diving consists of diving to great depths without an oxygen tank. I took part in a course organised by a leading sub-aqua website, which took place in a thirty-metre high, six-metre wide cylindrical water tank. Unlike me, who had never been deeper than the swimming-pool floor, my co-trainees were all scuba divers. Our trainer was keen to prove free-diving isn't so risky. 'When practised correctly, it's a very safe sport,' she said. After a few lectures about safety, and suitably kitted out in flippers and a diving mask, I was ready to get into the water. With a partner, we were going to attempt to descend and ascend by pulling on a rope. My partner dived first but had trouble and stopped at five metres. Then I dived, pulling myself downwards on the rope and reached fifteen metres easily, feeling more and more at ease. This sport isn't about adrenaline, it's about being calm.` },
        { letter: 'D', title: 'Max Wainright: snowboarding', text: `I'd always wanted to try snowboarding, so I went for a training day at an indoor snow slope near my home. Having had the pleasure of learning the basics of snowboarding several years before in the French Alps, I'd hoped that returning to the sport might be a bit like riding a bike, something you supposedly never forget. But it seemed that most of what I'd learned had melted away just like snow. I knew I shouldn't use the techniques I'd learnt in years of surfing and skiing because they weren't applicable to snowboarding at all. I started riding slowly at first, and couldn't get the balance right. It took hours before I could pick up speed and successfully perform a neat turn. But I was getting the hang of it! What a thrill to feel the cool air rushing by, what fun to crash into the snow!` },
      ],
    },
  ] as CbtReadingPart[],

  writingTasks: [
    {
      taskNumber: 1, compulsory: true, type: 'essay',
      prompt: 'In your English class you have been discussing options for future work. Now your English teacher has asked you to write an essay. Write an essay using ALL the notes and giving reasons for your point of view. Write 140–190 words in an appropriate style.',
      box: 'PEOPLE SHOULD DO A JOB THEY LOVE AND NOT WORRY ABOUT MONEY',
      notes: ['being happy at work', 'the need to earn a living', '........................ (your own idea)'],
    },
    {
      taskNumber: 2, compulsory: false, type: 'letter',
      prompt: 'You have seen this advertisement and you want to apply. Write your letter in 140–190 words in an appropriate style.',
      box: "Are you good at writing songs, singing or playing an instrument? At Heath College of Music we're looking for new talent! We need enthusiastic people who are willing to devote many hours a day to studying. Write to Clara Barnes, the director, explaining:",
      notes: ['why you would want to attend a course', 'what musical skills you have', 'what your favourite music is'],
    },
    {
      taskNumber: 3, compulsory: false, type: 'review',
      prompt: 'You recently saw this notice in the college magazine. Write your review in 140–190 words in an appropriate style.',
      box: 'Do you watch an animated cartoon which is enjoyed by adults as well as children? Write us a review of the cartoon for the college magazine. Describe some of the characters, say what makes it funny and why you think older people like it too. The best review will be published next month!',
    },
    {
      taskNumber: 4, compulsory: false, type: 'article',
      prompt: 'You have read this announcement in an international magazine for English language students. Write your article in 140–190 words in an appropriate style.',
      box: 'Enter our Writing Competition! Write an interesting article on this topic and you could win £200! — My childhood ambitions',
      notes: ['As a child, what job did you want to do in the future?', 'How did your ambitions change as you grew older?'],
    },
  ] as CbtWritingTask[],

  listeningParts: [
    {
      part: 'listening-p1',
      title: 'Part 1',
      instructions: 'You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C). You will hear each recording twice. Each question has its own recording below.',
      audio: ['Test04_Part01_Instructions.mp3'],
      mcqs: [
        { q: 1, audio: 'Test04_Part01_Question_1.mp3', text: 'You hear part of a programme about music in schools.', question: 'Why are fewer children joining school choirs?', options: [
          { letter: 'A', text: 'They are unwilling to sing in public.' }, { letter: 'B', text: "Their parents don't encourage them to sing." }, { letter: 'C', text: 'Their teachers lack the necessary musical skills.' }] },
        { q: 2, audio: 'Test04_Part01_Question_2.mp3', text: 'You hear two friends talking about evening classes.', question: 'Why did the girl decide to register for a photography course?', options: [
          { letter: 'A', text: 'She wanted to take better holiday snaps.' }, { letter: 'B', text: 'She thought it would help her in her career.' }, { letter: 'C', text: 'She needed a relaxing change from her studies.' }] },
        { q: 3, audio: 'Test04_Part01_Question_3.mp3', text: 'You hear two friends talking about a new café.', question: 'What did they both approve of?', options: [
          { letter: 'A', text: 'the size of the portions' }, { letter: 'B', text: 'the originality of the food' }, { letter: 'C', text: 'the efficiency of the service' }] },
        { q: 4, audio: 'Test04_Part01_Question_4.mp3', text: 'You hear part of a programme about exploring underground caves.', question: 'What does the speaker do?', options: [
          { letter: 'A', text: "He's an experienced caver." }, { letter: 'B', text: "He's a journalist." }, { letter: 'C', text: "He's a student." }] },
        { q: 5, audio: 'Test04_Part01_Question_5.mp3', text: 'You hear a woman talking about a job interview.', question: 'What does she say about it?', options: [
          { letter: 'A', text: 'Some of the questions were unfair.' }, { letter: 'B', text: 'She felt she was insufficiently prepared.' }, { letter: 'C', text: 'The interviewers put her under pressure.' }] },
        { q: 6, audio: 'Test04_Part01_Question_6.mp3', text: 'You hear a woman talking about a language course.', question: 'What does she criticise about it?', options: [
          { letter: 'A', text: 'There are too many students.' }, { letter: 'B', text: "Grammar isn't focused on." }, { letter: 'C', text: "It isn't challenging enough." }] },
        { q: 7, audio: 'Test04_Part01_Question_7.mp3', text: 'You hear part of a podcast on the subject of food.', question: 'The speaker works as', options: [
          { letter: 'A', text: 'a shop owner.' }, { letter: 'B', text: 'a cookery writer.' }, { letter: 'C', text: 'a chef in a restaurant.' }] },
        { q: 8, audio: 'Test04_Part01_Question_8.mp3', text: 'You hear a man talking about moving house.', question: 'After moving to a new area, he felt', options: [
          { letter: 'A', text: "worried that he wouldn't see his old friends." }, { letter: 'B', text: 'concerned about how his children would adapt.' }, { letter: 'C', text: 'surprised by how welcoming his new neighbours were.' }] },
      ],
    },
    {
      part: 'listening-p2',
      title: 'Part 2',
      instructions: 'You will hear a woman called Rita Lewis giving a presentation about her job as a researcher for a TV programme. For questions 9–18, complete the sentences with a word or short phrase.',
      audio: ['Test04_Part02_Instructions.mp3', 'Test04_Part02_Questions.mp3'],
      sentences: [
        { q: 9, before: 'The subject that Rita studied first at university was', after: '.' },
        { q: 10, before: 'Before getting her current job, Rita studied a subject called', after: '.' },
        { q: 11, before: 'On the day she tells us about, the country where Rita was working was', after: '.' },
        { q: 12, before: 'There were a total of', after: "people in Rita's team on that day." },
        { q: 13, before: 'The animal which the presenter called Jamie had to photograph was a sort of', after: '.' },
        { q: 14, before: 'The camera crew had to film Jamie as he climbed over the edge of a', after: '.' },
        { q: 15, before: "Rita's lunch consisted of sandwiches with", after: 'in them.' },
        { q: 16, before: 'Jamie had to hold a', after: 'to help him see the crocodiles as he crossed a river.' },
        { q: 17, before: 'A special light which the crew was using, known as a', after: ', stopped working.' },
        { q: 18, before: 'Rita says that Jamie looks really', after: 'when you see him crossing the river on the programme.' },
      ],
    },
    {
      part: 'listening-p3',
      title: 'Part 3',
      instructions: 'You will hear five short extracts in which craft workers are talking about running their own small businesses from home. For questions 19–23, choose from the list (A–H) the advice each speaker gives about running such a business. There are three extra letters which you do not need to use.',
      audio: ['Test04_Part03_Instructions.mp3', 'Test04_Part03_Questions.mp3'],
      speakers: [
        { q: 19, label: 'Speaker 1' }, { q: 20, label: 'Speaker 2' }, { q: 21, label: 'Speaker 3' }, { q: 22, label: 'Speaker 4' }, { q: 23, label: 'Speaker 5' },
      ],
      speakerOptions: [
        { letter: 'A', text: 'expand your business by advertising locally' },
        { letter: 'B', text: "don't be discouraged by negative customer feedback" },
        { letter: 'C', text: 'employ family and friends to market your product' },
        { letter: 'D', text: 'spend time organising your workspace properly' },
        { letter: 'E', text: 'increase business by selling online' },
        { letter: 'F', text: 'produce a clear marketing plan for your business' },
        { letter: 'G', text: 'continue to learn in order to perfect your product' },
        { letter: 'H', text: 'pay for expert help if you get into difficulties' },
      ],
    },
    {
      part: 'listening-p4',
      title: 'Part 4',
      instructions: "You will hear an interview with a woman called Monica Darcey, who's the author of a best-selling book about gardening. For questions 24–30, choose the best answer (A, B or C).",
      audio: ['Test04_Part04_Instructions.mp3', 'Test04_Part04_Questions.mp3'],
      mcqs: [
        { q: 24, text: 'Monica says that most people who buy her book', options: [
          { letter: 'A', text: 'have made mistakes in gardening.' }, { letter: 'B', text: 'are knowledgeable about gardening.' }, { letter: 'C', text: 'do not trust professional gardeners.' }] },
        { q: 25, text: "How did Monica's parents feel about her early interest in gardening?", options: [
          { letter: 'A', text: 'They were concerned about the effects on her health.' }, { letter: 'B', text: 'They were worried that she lacked other interests.' }, { letter: 'C', text: 'They feared her enthusiasm would affect her studies.' }] },
        { q: 26, text: 'Monica applied to work as a gardening journalist because', options: [
          { letter: 'A', text: 'it would give her an extra source of income.' }, { letter: 'B', text: "she'd found the experience of writing rewarding." }, { letter: 'C', text: 'there might be opportunities to do some research.' }] },
        { q: 27, text: 'Why did Monica give up her job on a magazine?', options: [
          { letter: 'A', text: 'She got an offer of work somewhere else.' }, { letter: 'B', text: "She didn't get on with other members of staff." }, { letter: 'C', text: 'She was not interested in the type of work she was doing.' }] },
        { q: 28, text: 'According to Monica, what makes her gardening books special?', options: [
          { letter: 'A', text: 'They are written in an entertaining style.' }, { letter: 'B', text: 'They are aimed at amateur enthusiasts.' }, { letter: 'C', text: 'They are the result of detailed research.' }] },
        { q: 29, text: 'What does Monica dislike about the photographs in many gardening books?', options: [
          { letter: 'A', text: 'They reduce the importance of the writer.' }, { letter: 'B', text: 'They help to sell with poor quality writing.' }, { letter: 'C', text: 'They show an unrealistic view of their subject.' }] },
        { q: 30, text: 'What makes Monica unsure whether to accept a job on television?', options: [
          { letter: 'A', text: 'Her publisher may disapprove of it.' }, { letter: 'B', text: 'It may make her suddenly famous.' }, { letter: 'C', text: 'She would have less time for writing.' }] },
      ],
    },
  ] as CbtListeningPart[],

  // Speaking is examiner-led and not part of the CBT. Prompts kept for Mission 2
  // (the speaking recorder/transcriber).
  speaking: {
    part1Topics: [
      { topic: 'Home and daily routine', questions: ['Do you listen to music in the evening? (Why? / Why not?)', 'Do you usually have a small or a large breakfast? (What do you have?)', 'How often do you see your friends outside college / work? (What do you do?)', 'Are you happy with the size of your bedroom? (Why? / Why not?)'] },
      { topic: 'Media', questions: ['Do you watch a lot of television? (Why? / Why not?)', "How do you find out what's happening in the world?", 'What type of magazines do you like reading? (Why?)', 'How often do you use social media? (What do you use it for?)'] },
      { topic: 'Sport', questions: ['Would you rather do a team sport, or one you could do on your own? (Why?)', 'Is there a place near your house where you can get some exercise? (Tell us about it.)', 'Do you like to watch sports competitions? (Why? / Why not?)', 'Is there a sports personality that you particularly admire? (Tell us about him/her.)'] },
    ],
    part2: 'Candidate A: photographs showing people using different types of transport — compare, and say why the people may have chosen to travel in this way. Candidate B: do you like travelling by bus? Then Candidate B: photographs showing people playing different games — compare, and say how interesting these games would be for different age groups. Candidate A: do you like computer games?',
    part3: 'A group of students from another country is coming here on a visit. Situations where they may need advice — discuss what advice you would give, then decide which is the most important to give advice about.',
    part4: ['Do you think schools / colleges should organise group trips to other countries? (Why? / Why not?)', 'Is it better to travel in a large group or a small group? (Why?)', 'Is it important to speak the language of a country you visit? (Why? / Why not?)', 'Some people say that travel is unnecessary because you can find out about other countries on the internet. What do you think?', 'If you could spend a year in another country, which would you choose? Why?', "Some people say it's essential to plan a trip well in advance. What do you think?"],
  },
}
