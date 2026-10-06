// Cambridge B2 First format — Original mock exam "GEN01" (fully generated, no source text).
// Built 22 Sep 2026 by Claude at Hugo's request ("make a full b2 exam from scratch").
// STATUS: DRAFT. Not reviewed by a teacher. Not wired into /mocks. Do not give to any
// student until Hugo or Sara has reviewed it end to end.
// Quality gate applied: every Reading & Use of English part and every Listening part was
// blind-solved by a fresh, context-isolated subagent with no visibility into the intended
// key (idea_008's non-negotiable gate). Results and the answer key itself are NOT in this
// file (same convention as test4-b2first.ts — keys are entered separately wherever the
// existing "/mocks" answer-key system expects them for exam id "gen01-b2first"). The full
// key, with every accepted alternative found during blind-solve QC, is documented in
// Somerset Growth/_ideas/idea_008_exam-generation-engine.md (dated 22 Sep 2026 entry) and
// in this same folder's gen01-ANSWER-KEY.md.
// Listening: AUDIO GENERATED 23 Sep 2026 via ElevenLabs (Somerset's own account, voices.json
// roster). Files live under public/cbt-audio/gen01/, same convention as test4-b2first.ts.
// Part 1 = per-question files; Parts 2-4 = one continuous file per part (multi-voice for
// Part 3's five speakers and Part 4's interview, via _apps/tts/elevenlabs.mjs's `lines`
// array). Generation source: _apps/tts/gen01-tracks.json. NOT YET teacher-reviewed end to
// end, NOT YET blind-solved against the regenerated Part 1/4 audioscript text (the text
// itself was blind-solved before the 23 Sep trim — re-run the gate before this goes live).
// Do not wire into /mocks or give to a student until Hugo or Sara has cleared both.

import type { CbtMcq, CbtReadingPart, CbtListeningPart, CbtWritingTask } from './test4-b2first'

export const GEN01 = {
  id: 'gen01-b2first',
  title: 'B2 First — Generated Mock GEN01 (DRAFT — not teacher-reviewed)',
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
      passageTitle: 'The Corner Shop Comeback',
      passage: `For most of the last thirty years, small independent shops across Britain have (0) [STRUGGLED] to compete with big supermarkets. Many high streets lost their local grocer, baker and butcher one after another, as shoppers began doing their weekly shop at out-of-town superstores, where prices were lower and parking was free.

Recently, however, this trend appears to be (1) ........... . A growing number of small shops are opening in town centres, and some are already making a profit within their first year of business.

Critics have long (2) ........... out that supermarkets, for all their convenience, offer very little sense of community. A corner shop, by contrast, is often the one place in a neighbourhood where people still stop to chat.

Part of the explanation for the comeback comes (3) ........... to convenience. As more people work from home, few are willing to set (4) ........... twenty minutes to drive to a supermarket for a single item.

There is also a growing appetite for quality. Shoppers are increasingly willing to pay a little more for bread baked that same morning, rather than (5) ........... up with whatever is cheapest and most convenient. Independent shop owners have been quick to take (6) ........... of this shift, building loyal customers who value a friendly face over speed and low prices.

None of this (7) ........... away from the fact that supermarkets remain enormously dominant; their market share is still huge. But for the first time in decades, the corner shop is no (8) ........... simply fighting a losing battle.`,
      mcqs: [
        { q: 1, options: [{ letter: 'A', text: 'inverting' }, { letter: 'B', text: 'reversing' }, { letter: 'C', text: 'opposing' }, { letter: 'D', text: 'recovering' }] },
        { q: 2, options: [{ letter: 'A', text: 'noted' }, { letter: 'B', text: 'shown' }, { letter: 'C', text: 'marked' }, { letter: 'D', text: 'pointed' }] },
        { q: 3, options: [{ letter: 'A', text: 'down' }, { letter: 'B', text: 'along' }, { letter: 'C', text: 'out' }, { letter: 'D', text: 'up' }] },
        { q: 4, options: [{ letter: 'A', text: 'apart' }, { letter: 'B', text: 'off' }, { letter: 'C', text: 'aside' }, { letter: 'D', text: 'away' }] },
        { q: 5, options: [{ letter: 'A', text: 'put' }, { letter: 'B', text: 'get' }, { letter: 'C', text: 'live' }, { letter: 'D', text: 'go' }] },
        { q: 6, options: [{ letter: 'A', text: 'profit' }, { letter: 'B', text: 'use' }, { letter: 'C', text: 'benefit' }, { letter: 'D', text: 'advantage' }] },
        { q: 7, options: [{ letter: 'A', text: 'falls' }, { letter: 'B', text: 'takes' }, { letter: 'C', text: 'goes' }, { letter: 'D', text: 'turns' }] },
        { q: 8, options: [{ letter: 'A', text: 'more' }, { letter: 'B', text: 'further' }, { letter: 'C', text: 'longer' }, { letter: 'D', text: 'most' }] },
      ],
    },
    {
      part: 'uoe-p2',
      title: 'Part 2',
      instructions: 'For questions 9–16, read the text below and think of the word which best fits each gap. Use only one word in each gap.',
      passageTitle: 'Why Do We Yawn?',
      passage: `It is (0) [A] well-known fact that almost everyone yawns, (9) ........... scientists still do not fully agree (10) ........... why. For a long time, it was thought that yawning simply helped the body take (11) ........... oxygen, but this theory has since been questioned. Several studies (12) ........... shown that yawning happens even when oxygen levels in the blood are completely normal.

One more recent idea is (13) ........... yawning helps cool the brain down, rather like a tiny built-in fan. According to (14) ........... theory, a yawn draws in cool air and increases blood flow to the face, which in turn lowers brain temperature. This might explain (15) ........... we tend to yawn more when we are tired, since a warmer brain is thought to work less efficiently.

What is perhaps strangest of all is that yawning is contagious: simply reading about it, (16) ........... we are doing now, can be enough to trigger one.`,
      openGaps: [9, 10, 11, 12, 13, 14, 15, 16],
    },
    {
      part: 'uoe-p3',
      title: 'Part 3',
      instructions: 'For questions 17–24, use the word given in capitals to form a word that fits in the gap.',
      passageTitle: 'Street Art Goes Mainstream',
      passage: `Street art was once seen as an act of pure (0) [REBELLION] — illegal, temporary, and deliberately (17) ........... .

Today, though, attitudes have shifted dramatically. Cities around the world now commission murals from artists whose work would once have been removed within hours. Local councils have realised that colourful, (18) ........... street art can make a neighbourhood far more (19) ........... to visitors, and several cities have seen a genuine (20) ........... boost as a result, with cafés and shops opening nearby.

Not everyone is (21) ........... about the change. Some original street artists argue that as soon as a piece gains official (22) ........... , it loses the very qualities of (23) ........... and risk that made it interesting in the first place. Others simply see it as a matter of (24) ........... — once something proves popular enough, the mainstream eventually catches up with it.`,
      stems: { 17: 'PROVOKE', 18: 'IMAGINE', 19: 'ATTRACT', 20: 'ECONOMY', 21: 'ENTHUSIASM', 22: 'RECOGNISE', 23: 'SPONTANEOUS', 24: 'INEVITABLE' },
      openGaps: [17, 18, 19, 20, 21, 22, 23, 24],
    },
    {
      part: 'uoe-p4',
      title: 'Part 4',
      instructions: 'For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. Use between two and five words, including the word given.',
      transformations: [
        { q: 25, sentence: 'Tom stopped smoking two years ago and has never smoked since.', keyword: 'UP', gapped: 'Tom ........................... two years ago and has never smoked since.' },
        { q: 26, sentence: 'I regret not telling her the truth at the time.', keyword: 'WISH', gapped: 'I ........................... her the truth at the time.' },
        { q: 27, sentence: "If Sarah hadn't missed the flight, she would be in New York now.", keyword: 'HAD', gapped: '........................... missed the flight, she would be in New York now.' },
        { q: 28, sentence: 'Nobody in the office works harder than Priya.', keyword: 'HARDEST', gapped: 'Priya ........................... in the office.' },
        { q: 29, sentence: 'The company rejected his job application without giving a reason.', keyword: 'DOWN', gapped: 'The company ........................... his job application without giving a reason.' },
        { q: 30, sentence: "I'm sure someone left the window open — that's why it's so cold in here.", keyword: 'BEEN', gapped: "The window ........................... open — that's why it's so cold in here." },
      ],
    },
    {
      part: 'reading-p5',
      title: 'Part 5',
      instructions: 'You are going to read an extract from a short story. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      passageTitle: 'The Notebook',
      passage: `My grandmother's apartment smelled exactly as it always had — beeswax polish, old paper, and the faint sweetness of the orange trees outside her window in Valencia. I had flown from London the moment my mother called to say that Nana wasn't managing on her own any more, and that the flat would need to be cleared before the new tenants moved in. I had expected the job to take a weekend. I was wrong.

It wasn't the furniture that slowed me down — my cousin Marta had already arranged for most of that to go to a charity near the Turia gardens. It was the boxes. Nana, it turned out, had never thrown anything away in sixty years of living in that flat, and somewhere between the third and fourth box of yellowing letters, I found the notebook.

It was small, bound in cracked green leather, and so ordinary-looking that I nearly set it aside with a pile of old recipe cards. What stopped me was the handwriting on the first page: not my grandmother's careful, rounded script, but something sharper and more hurried, dated 1962. I sat down on the floor, surrounded by half-packed boxes, and began to read.

The entries were brief, sometimes just a line or two, written by my grandmother's older sister, Pilar — a woman I had heard mentioned perhaps twice in my entire childhood, always followed by an awkward silence and a swift change of subject. I had always assumed, without ever being told directly, that she had died young. The notebook told a different story. Pilar, it seemed, had left for Argentina at twenty-two, against the wishes of her family, and had written these pages in the weeks before she went, as though trying to convince herself the decision was the right one.

I read for almost two hours, forgetting entirely about the boxes still waiting to be sorted. There was no drama in the notebook, no single dramatic revelation — just the ordinary doubts of a young woman about to do something irreversible, recorded in a hand that grew steadier with every entry. By the final page, she sounded almost calm.

When Marta found me still sitting on the floor, the light outside had turned orange with evening, and I hadn't packed a single further box. I showed her the notebook, half expecting her to already know the story. She didn't. She read the first few pages in silence, then looked up at me with an expression I couldn't quite place — not shock, exactly, but something closer to recognition, as though a shape she had always sensed in the family's silences had finally been given an outline.

'We should ask Nana about this,' Marta said eventually, 'while we still can.' I agreed, though privately I wondered whether the version of events my grandmother might now be willing to share, at ninety-one, would be the same as the one Pilar had written for no one but herself, sixty years before. Perhaps that no longer mattered. What the notebook had given me wasn't really an answer. It was simply the fact that there had been a question at all — one that had sat, unspoken, in every silence I had failed to notice for my whole life.

I put the notebook carefully in my bag, not the charity boxes, and went back to packing the rest of the flat with, for the first time that day, no real interest in what any of it contained.`,
      mcqs: [
        { q: 31, text: 'Why did clearing the flat take longer than the narrator expected?', options: [
          { letter: 'A', text: 'The furniture needed to be sold rather than donated.' },
          { letter: 'B', text: 'There were far more boxes to go through than anticipated.' },
          { letter: 'C', text: 'Marta was not available to help until later.' },
          { letter: 'D', text: 'The new tenants had not yet finalised moving dates.' }] },
        { q: 32, text: 'What was it that made the narrator stop and look at the notebook, rather than setting it aside?', options: [
          { letter: 'A', text: 'Its unusual leather binding.' },
          { letter: 'B', text: 'The date written on the first page.' },
          { letter: 'C', text: 'The handwriting, which was not her grandmother\'s.' },
          { letter: 'D', text: 'A photograph tucked between the pages.' }] },
        { q: 33, text: 'What can we infer about how Pilar was regarded within the family before the narrator found the notebook?', options: [
          { letter: 'A', text: 'She was remembered fondly as someone who had emigrated successfully.' },
          { letter: 'B', text: 'She was a source of discomfort that the family avoided discussing.' },
          { letter: 'C', text: 'She was believed to have caused a serious financial problem for the family.' },
          { letter: 'D', text: 'She was thought never to have existed at all.' }] },
        { q: 34, text: 'How did Marta react on reading the notebook?', options: [
          { letter: 'A', text: 'She was shocked because she had never heard of Pilar before.' },
          { letter: 'B', text: 'She reacted calmly because she had always known the full story.' },
          { letter: 'C', text: 'She seemed to recognise something she had previously only sensed.' },
          { letter: 'D', text: 'She refused to believe what she had read.' }] },
        { q: 35, text: "At the end of the extract, what does the narrator seem to feel about the notebook's significance?", options: [
          { letter: 'A', text: 'Disappointed that it failed to explain why Pilar left.' },
          { letter: 'B', text: "Determined to confront her grandmother about her dishonesty." },
          { letter: 'C', text: 'Content that it confirmed a question existed, even without a full answer.' },
          { letter: 'D', text: "Anxious that the family's reputation might now be damaged." }] },
        { q: 36, text: "What does the final paragraph suggest about the narrator's state of mind as she resumes packing?", options: [
          { letter: 'A', text: 'She is relieved that the difficult task is finally almost finished.' },
          { letter: 'B', text: 'She is now indifferent to the belongings she is packing.' },
          { letter: 'C', text: 'She is anxious about what Marta might tell their grandmother.' },
          { letter: 'D', text: 'She is eager to find more information about Pilar hidden in the flat.' }] },
      ],
    },
    {
      part: 'reading-p6',
      title: 'Part 6',
      instructions: 'You are going to read an article about a long-distance swimmer. Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap (37–42). There is one extra sentence you do not need to use.',
      passageTitle: "The Woman Who Wouldn't Stop",
      passage: `Lena Kowalski was forty-six years old when she decided to swim across the English Channel. She had never swum competitively, had taken up open-water swimming only two years earlier, and, by her own admission, disliked cold water intensely.

[37] ...........

Her coach, a retired long-distance swimmer named Robert Hale, was skeptical at first. He had trained channel swimmers for over twenty years and had turned away far more capable athletes for attempting the crossing too soon.

[38] ...........

Training began in earnest that October, in the sea off the coast of Kent, where the water rarely rose above twelve degrees. Lena swam for an hour every morning before work, then again in the evenings on weekends, gradually extending her sessions until she could manage six hours without stopping.

[39] ...........

Not everything went smoothly. In March, a shoulder injury kept her out of the water for three weeks, and she later admitted to Hale that she had seriously considered giving up the attempt altogether.

[40] ...........

By June, however, she was back to full training, and Hale finally agreed that she was ready. A date was set for late July, when tides and weather conditions in the Channel are typically most favourable for a crossing.

[41] ...........

The swim itself took just over fourteen hours. Lena later said that the final two hours, in darkness, were the hardest of her life — not because of exhaustion, but because of the sheer monotony of not being able to see land in any direction.

[42] ...........

Today, Hale uses Lena's story as an example for every new swimmer who tells him they are starting too late, or that they will never be fast enough. Age and speed, he tells them, were never the point.`,
      gapOptions: [
        { letter: 'A', text: 'It was this single-mindedness, more than any natural talent in the water, that eventually persuaded him to take her on.' },
        { letter: 'B', text: 'She had made the decision, she later explained, after watching a television documentary about a woman half her age completing the same swim, and had not changed her mind once in the eighteen months since.' },
        { letter: 'C', text: 'By January, six hours had become eight, and Hale started to talk, cautiously, about a possible attempt the following summer.' },
        { letter: 'D', text: 'What changed her mind, in the end, was a phone call from Hale, who told her bluntly that an injury was not the same thing as a reason to quit, and that she still had time.' },
        { letter: 'E', text: 'On the morning of the crossing, Lena later admitted, she very nearly did not get into the water at all.' },
        { letter: 'F', text: 'When she finally touched the rocks on the French side, just after dawn, there was no crowd waiting, no fanfare — only Hale, who had followed the whole way in the support boat, and who says it remains the proudest moment of his coaching career.' },
        { letter: 'G', text: 'The English Channel has been swum by well over two thousand people since Captain Matthew Webb first completed the crossing in 1875, though fewer than ten percent of those who attempt it succeed on their first try.' },
      ],
    },
    {
      part: 'reading-p7',
      title: 'Part 7',
      instructions: "You are going to read four people's accounts of taking up a new hobby. For questions 43–52, choose from the people (A–D). The people may be chosen more than once.",
      passageTitle: 'Slow Hobbies',
      matchQuestions: [
        { q: 43, text: 'was encouraged to try their hobby by someone who spoke to them very directly?' },
        { q: 44, text: 'found that their hobby required more ongoing attention than they had expected?' },
        { q: 45, text: 'admits that persistence, rather than actual enjoyment, was what kept them going at first?' },
        { q: 46, text: 'says their hobby has changed how they plan the rest of their time?' },
        { q: 47, text: 'took up their hobby after a suggestion from someone living nearby?' },
        { q: 48, text: 'discovered that their hobby forces them to think more carefully before acting?' },
        { q: 49, text: 'had assumed, before starting, that their hobby was only suited to a different kind of person?' },
        { q: 50, text: 'has kept up their hobby for longer than they originally expected to?' },
        { q: 51, text: 'says it took time before they could fully let go of a particular habit while doing their hobby?' },
        { q: 52, text: 'only understood the appeal of their hobby after completing something?' },
      ],
      matchTexts: [
        { letter: 'A', title: 'Marcus', text: "I started baking sourdough bread during a particularly stressful year at work, mostly because a colleague mentioned it helped her switch off in the evenings. She was right, though not in the way I expected — it wasn't relaxing exactly, since a sourdough starter demands real attention and can't simply be ignored for a week. What I found instead was that the process forced me to slow down in a way nothing else in my week did; you cannot rush dough. These days I bake twice a week, and I've noticed I plan the rest of my weekend around it rather than the other way round, which still surprises me a little." },
        { letter: 'B', title: 'Priya', text: "My neighbour lent me a pair of binoculars almost by accident, after I mentioned I'd been feeling restless since I started working from home. I hadn't expected birdwatching to suit me at all — I'd always thought of it as something for much older, more patient people than me. The truth is it did take a while before I stopped feeling the urge to check my phone every few minutes while sitting in the park. Now, though, I look forward to those early mornings more than almost anything else in my week, and I've started keeping a small notebook of what I've spotted, which has become oddly satisfying in itself." },
        { letter: 'C', title: 'Sofia', text: "A friend who works with wood suggested I try it after I complained, more than once, about never finishing anything I started. She wasn't wrong to be blunt about it. My first few attempts at simple woodworking projects were genuinely frustrating, and I nearly gave up twice in the first month alone. What kept me going wasn't enjoyment, if I'm honest, but stubbornness — I refused to let a piece of wood defeat me. It was only once I'd actually completed a small shelf, months later, that I understood what people meant when they talked about the satisfaction of working with your hands." },
        { letter: 'D', title: 'Tomasz', text: "I began writing letters by hand again after realising I couldn't remember the last time I'd received anything in the post that wasn't a bill. A cousin abroad and I agreed to write to each other monthly instead of messaging, purely as an experiment neither of us expected to last. Two years later, we're still doing it. What I didn't anticipate was how much longer it takes to think clearly when writing by hand rather than typing — there's no deleting and starting again, so you're forced to actually decide what you mean before you commit it to the page." },
      ],
    },
  ] as CbtReadingPart[],

  writingTasks: [
    {
      taskNumber: 1, compulsory: true, type: 'essay',
      prompt: 'In your English class you have been talking about technology. Now your English teacher has asked you to write an essay. Write an essay using ALL the notes and giving reasons for your point of view. Write 140–190 words in an appropriate style.',
      box: 'IS TECHNOLOGY MAKING PEOPLE LESS SOCIABLE?',
      notes: ['socialising in person', 'online communication', '........................ (your own idea)'],
    },
    {
      taskNumber: 2, compulsory: false, type: 'review',
      prompt: 'You see this notice on an English-language website. Write your review in 140–190 words in an appropriate style.',
      box: 'Reviews wanted! Tell us about a café or restaurant you have visited recently. What made it special, and would you recommend it to other readers?',
    },
    {
      taskNumber: 3, compulsory: false, type: 'email',
      prompt: 'You recently stayed at a hotel during a trip abroad. Read the extract from the hotel manager\'s email below, then write your email of reply in 140–190 words in an appropriate style.',
      box: '"Thank you for staying with us. We would love to hear about your experience — was there anything in particular you enjoyed, and is there anything we could improve?"',
    },
    {
      taskNumber: 4, compulsory: false, type: 'article',
      prompt: 'You see this notice on an English-language magazine website. Write your article in 140–190 words in an appropriate style.',
      box: 'Articles wanted! Tell us about a skill you would like to learn, and why. The best articles will be published next month.',
    },
  ] as CbtWritingTask[],

  // LISTENING — SCRIPTS ONLY. audio arrays are intentionally empty; no files exist yet.
  // See file header. Do not attach to /mocks or the CBT engine until real audio exists
  // AND a teacher has reviewed the content.
  listeningParts: [
    {
      part: 'listening-p1',
      title: 'Part 1',
      instructions: 'You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C). You will hear each recording twice.',
      audio: ['GEN01_Part01_Instructions.mp3'],
      mcqs: [
        { q: 1, audio: 'GEN01_Part01_Question_1.mp3', text: 'You hear a woman talking about a course she took.', question: 'What does the speaker say about the pottery course?', options: [
          { letter: 'A', text: 'A family member encouraged her to try it.' }, { letter: 'B', text: 'She found it easy from the very first lesson.' }, { letter: 'C', text: 'She has decided not to continue with it.' }] },
        { q: 2, audio: 'GEN01_Part01_Question_2.mp3', text: 'You hear a man talking about moving house.', question: 'How did the speaker find the flat he eventually bought?', options: [
          { letter: 'A', text: 'He had been searching for it online for months.' }, { letter: 'B', text: 'A colleague told him about it.' }, { letter: 'C', text: 'He saw it advertised in a local shop window.' }] },
        { q: 3, audio: 'GEN01_Part01_Question_3.mp3', text: 'You hear a teenager talking about a school trip.', question: 'What does the speaker say about the school trip?', options: [
          { letter: 'A', text: 'He had never visited the museum before.' }, { letter: 'B', text: 'His enthusiasm grew once he was there.' }, { letter: 'C', text: 'He was disappointed by the exhibition.' }] },
        { q: 4, audio: 'GEN01_Part01_Question_4.mp3', text: 'You hear a woman talking about her job.', question: 'What does the speaker say about her career change?', options: [
          { letter: 'A', text: 'She regrets the drop in income.' }, { letter: 'B', text: 'She still finds the job exhausting.' }, { letter: 'C', text: 'She prioritised job satisfaction over salary.' }] },
        { q: 5, audio: 'GEN01_Part01_Question_5.mp3', text: 'You hear a man talking about a sports injury.', question: 'What does the speaker say about his recovery?', options: [
          { letter: 'A', text: "He is following his physio's advice despite his impatience." }, { letter: 'B', text: 'He returned to playing sooner than the physio recommended.' }, { letter: 'C', text: "He disagreed with the physio's assessment of his injury." }] },
        { q: 6, audio: 'GEN01_Part01_Question_6.mp3', text: 'You hear a woman talking about learning a language.', question: 'What has the speaker decided to do about her Portuguese?', options: [
          { letter: 'A', text: 'Spend more time using the language app.' }, { letter: 'B', text: 'Stop learning the language for now.' }, { letter: 'C', text: 'Start attending a class with other people.' }] },
        { q: 7, audio: 'GEN01_Part01_Question_7.mp3', text: 'You hear a man talking about a restaurant.', question: 'What does the speaker say about the restaurant?', options: [
          { letter: 'A', text: 'The food did not live up to his expectations.' }, { letter: 'B', text: 'He would avoid returning because of the slow service.' }, { letter: 'C', text: 'The meal took much longer than he had planned.' }] },
        { q: 8, audio: 'GEN01_Part01_Question_8.mp3', text: 'You hear a woman talking about volunteering.', question: 'What does the speaker say surprised her most about volunteering?', options: [
          { letter: 'A', text: 'How much she enjoyed being around animals.' }, { letter: 'B', text: 'How close she became to the other volunteers.' }, { letter: 'C', text: 'How long she has continued doing it.' }] },
      ],
    },
    {
      part: 'listening-p2',
      title: 'Part 2',
      instructions: 'You will hear a man called Dan giving a talk about a photography club. For questions 9–18, complete the sentences with a word or short phrase.',
      audio: ['GEN01_Part02_Instructions.mp3', 'GEN01_Part02_Questions.mp3'],
      sentences: [
        { q: 9, before: 'The club was founded in', after: '.' },
        { q: 10, before: 'The club does not meet during the month of', after: '.' },
        { q: 11, before: 'This term the club is focusing mainly on', after: 'photography.' },
        { q: 12, before: 'The first four weeks of term will cover', after: '.' },
        { q: 13, before: "Students who don't bring a camera can", after: 'one for the evening.' },
        { q: 14, before: 'Full membership for the term costs £', after: '.' },
        { q: 15, before: 'The first field trip this term will be to', after: '.' },
        { q: 16, before: 'Everyone must hand in a completed', after: 'by next Tuesday.' },
        { q: 17, before: "The club's online group is run through an app called", after: '.' },
        { q: 18, before: "Tonight's session will focus on the camera's", after: 'settings.' },
      ],
    },
    {
      part: 'listening-p3',
      title: 'Part 3',
      instructions: 'You will hear five short extracts in which people talk about starting their own business. For questions 19–23, choose from the list (A–H) what each speaker says. There are three extra letters which you do not need to use.',
      audio: ['GEN01_Part03_Instructions.mp3', 'GEN01_Part03_Questions.mp3'],
      speakers: [
        { q: 19, label: 'Speaker 1' }, { q: 20, label: 'Speaker 2' }, { q: 21, label: 'Speaker 3' }, { q: 22, label: 'Speaker 4' }, { q: 23, label: 'Speaker 5' },
      ],
      speakerOptions: [
        { letter: 'A', text: 'They received unexpected financial help.' },
        { letter: 'B', text: 'They underestimated how much time it would take.' },
        { letter: 'C', text: 'They were motivated by a negative experience at work.' },
        { letter: 'D', text: 'They regret not starting sooner.' },
        { letter: 'E', text: 'Their family were unsupportive of the decision.' },
        { letter: 'F', text: 'They had no relevant experience in the field.' },
        { letter: 'G', text: 'They found the paperwork more difficult than expected.' },
        { letter: 'H', text: 'A friend became their business partner.' },
      ],
    },
    {
      part: 'listening-p4',
      title: 'Part 4',
      instructions: "You will hear an interview with a wildlife photographer called Claire Byrne. For questions 24–30, choose the best answer (A, B or C).",
      audio: ['GEN01_Part04_Instructions.mp3', 'GEN01_Part04_Questions.mp3'],
      mcqs: [
        { q: 24, text: 'Why did Claire start photographing urban wildlife?', options: [
          { letter: 'A', text: 'She had deliberately planned the project for years.' }, { letter: 'B', text: 'An unplanned delay in London led her to notice foxes nearby.' }, { letter: 'C', text: 'A publisher specifically commissioned the project.' }] },
        { q: 25, text: 'What does Claire say about photographing animals in cities compared to somewhere like the Amazon?', options: [
          { letter: 'A', text: 'It required less patience than she expected.' }, { letter: 'B', text: 'It was more physically demanding overall.' }, { letter: 'C', text: "It was harder in ways people don't expect." }] },
        { q: 26, text: 'How does Claire feel about the photograph of the fox family?', options: [
          { letter: 'A', text: 'It is her proudest image, but not her personal favourite.' }, { letter: 'B', text: 'It is both her proudest and her favourite image.' }, { letter: 'C', text: 'She now regrets including it in the book.' }] },
        { q: 27, text: "What does Claire's favourite photograph in the book show?", options: [
          { letter: 'A', text: 'A dramatic scene of foxes at night.' }, { letter: 'B', text: 'A heron standing still on a rooftop.' }, { letter: 'C', text: 'A busy street full of urban wildlife.' }] },
        { q: 28, text: 'What message does Claire want the project to communicate?', options: [
          { letter: 'A', text: 'Wildlife photography requires travelling to remote places.' }, { letter: 'B', text: 'Wildlife exists close to us if we look for it.' }, { letter: 'C', text: 'Urban animals are becoming increasingly rare.' }] },
        { q: 29, text: 'What advice does Claire give to people starting out in wildlife photography?', options: [
          { letter: 'A', text: 'Invest in the best equipment available before beginning.' }, { letter: 'B', text: 'Focus on spending time outdoors observing animals.' }, { letter: 'C', text: 'Avoid urban locations until gaining more experience.' }] },
        { q: 30, text: 'What does Claire say about her future plans?', options: [
          { letter: 'A', text: 'She has a confirmed project starting in Spain.' }, { letter: 'B', text: 'She intends to keep working without a break.' }, { letter: 'C', text: 'She has an unconfirmed idea for a project near Valencia.' }] },
      ],
    },
  ] as CbtListeningPart[],

  // No speaking section generated this session — speaking is examiner-led and out of scope
  // for this build.
}
