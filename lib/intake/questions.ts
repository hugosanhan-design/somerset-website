import type { Band, GapFillItem, Phase1Question, Phase2Item, PuzzleScenario, TopicCluster, Version } from './types'

// ─── Phase 1 — Warm-up write (1 question per version) ────────────────────────

export const phase1Questions: Record<Version, Phase1Question[]> = {
  children: [
    {
      id: 'ch-p1-1',
      text: 'What is your favourite animal? Tell us about it!',
      detectionHints: ['ANIMALS', 'NATURE'],
    },
  ],
  teen: [
    {
      id: 'tn-p1-1',
      text: 'If you could only listen to one song for the rest of the year, which one would you pick? Why that one?',
      detectionHints: ['MUSIC'],
    },
  ],
  adult: [
    {
      id: 'ad-p1-1',
      text: 'Tell us a little about your week — what kind of work or activities fill your time?',
      detectionHints: ['WORK_PROFESSIONAL', 'FAMILY', 'SPORT', 'CREATIVE_ARTS'],
    },
  ],
}

// ─── Final write question (shown after MCQ) ───────────────────────────────────

export const FINAL_WRITE_QUESTIONS: Record<'adult' | 'teen', Phase1Question> = {
  adult: {
    id: 'ad-final',
    text: "Tell us about something you're looking forward to — it can be anything at all.",
    detectionHints: ['TRAVEL', 'FOOD', 'TV_FILM', 'SOCIAL_FRIENDS', 'PERSONAL_DEVELOPMENT'],
  },
  teen: {
    id: 'teen-final',
    text: "Tell us about something exciting that's coming up for you — a trip, an event, a game, anything.",
    detectionHints: ['TRAVEL', 'TV_FILM', 'GAMING', 'SPORT', 'SOCIAL_FRIENDS'],
  },
}

// ─── Text-building puzzle scenarios ──────────────────────────────────────────

export const ADULT_PUZZLE: PuzzleScenario = {
  scenario: "Carmen is writing an email to her manager, David, about working from home this Friday. Help her finish it.",
  startText: "Dear David,\n\nI hope you are well. I am writing because I would like to ask about Friday's schedule.",
  completionMessage: "You helped Carmen finish her email. Nice work!",
  steps: [
    {
      id: 'puz-a-1',
      targetStructure: 'present_perfect',
      contextLines: [],
      options: [
        "I have been working on the Miller report all week and it is nearly finished.",
        "I worked on the Miller report all week and it was nearly finished.",
        "I am working on the Miller report since Monday and it is nearly finished.",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-a-2',
      targetStructure: 'second_conditional',
      contextLines: [],
      options: [
        "If I worked from home on Friday, I would have far fewer interruptions.",
        "If I will work from home on Friday, I would have fewer interruptions.",
        "If I work from home on Friday, I will have fewer interruptions.",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-a-3',
      targetStructure: 'reported_speech',
      contextLines: [],
      options: [
        "My colleague Rosa told me that she had tried this last month and it had gone really well.",
        "My colleague Rosa told me that she has tried this last month and it went really well.",
        "My colleague Rosa said me that she tried this last month and it went really well.",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-a-4',
      targetStructure: 'future_going_to',
      contextLines: [],
      options: [
        "I'm going to finish the presentation and send you the final version before 4pm.",
        "I finish the presentation and I send you the final version before 4pm.",
        "I will be finish the presentation and send you the final version before 4pm.",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-a-5',
      targetStructure: 'passive_voice',
      contextLines: [],
      options: [
        "The final decision will be made by the management team at Monday's meeting.",
        "The final decision the management team will make it at Monday's meeting.",
        "The final decision will make by the management team at Monday's meeting.",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-a-6',
      targetStructure: 'present_perfect_continuous',
      contextLines: [],
      options: [
        "I've really been enjoying this project and I hope we can keep working together.",
        "I really enjoy this project and I hope we can keep working together.",
        "I have been really enjoyed this project and I hope we can keep working together.",
      ],
      correctIndex: 0,
    },
  ],
}

export const TEEN_PUZZLE: PuzzleScenario = {
  scenario: "Marcos is messaging his friend Alba about their plans for Saturday. Help him finish his messages.",
  startText: "Hey! Are you free on Saturday? I want to do something good 😄",
  completionMessage: "Great — you helped Marcos send his message!",
  steps: [
    {
      id: 'puz-t-1',
      targetStructure: 'present_perfect',
      contextLines: [],
      options: [
        "I've already asked my mum and she says I can go out until 10.",
        "I already asked my mum and she said I could go out until 10.",
        "I ask my mum already and she say I can go out until 10.",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-t-2',
      targetStructure: 'second_conditional',
      contextLines: [],
      options: [
        "If we went to the Bioparc in the morning, we would have the whole afternoon free.",
        "If we go to the Bioparc in the morning, we would have the afternoon free.",
        "If we will go to the Bioparc in the morning, we would have the afternoon free.",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-t-3',
      targetStructure: 'reported_speech',
      contextLines: [],
      options: [
        "Diego told me that he was coming too, and that he had already bought his ticket.",
        "Diego told me that he is coming too, and that he already bought his ticket.",
        "Diego said me that he was coming too, and that he bought his ticket already.",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-t-4',
      targetStructure: 'future_going_to',
      contextLines: [],
      options: [
        "My sister is going to drive us there if we leave before 10.",
        "My sister drives us there if we leave before 10.",
        "My sister will be driving us there if we leave before 10.",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-t-5',
      targetStructure: 'passive_voice',
      contextLines: [],
      options: [
        "The new skate park was built right next to it — have you been?",
        "They built the new skate park right next to it — have you been?",
        "The new skate park builded right next to it — have you been?",
      ],
      correctIndex: 0,
    },
    {
      id: 'puz-t-6',
      targetStructure: 'present_perfect_continuous',
      contextLines: [],
      options: [
        "I've been saving up for new trainers so I can't spend too much.",
        "I saved up for new trainers so I can't spend too much.",
        "I have been saved up for new trainers so I can't spend too much.",
      ],
      correctIndex: 0,
    },
  ],
}

// ─── Gap-fill cloze items ─────────────────────────────────────────────────────

export const ADULT_GAP_FILL: GapFillItem[] = [
  {
    id: 'gf-a-1',
    targetStructure: 'present_perfect',
    sentence: "She _____ in Valencia for twelve years.",
    options: ["lived", "has lived", "was living"],
    correctIndex: 1,
  },
  {
    id: 'gf-a-2',
    targetStructure: 'second_conditional',
    sentence: "If I _____ more free time, I would learn to surf.",
    options: ["have", "had", "will have"],
    correctIndex: 1,
  },
  {
    id: 'gf-a-3',
    targetStructure: 'reported_speech',
    sentence: "He told me that the meeting _____ at nine.",
    options: ["starts", "started", "had started"],
    correctIndex: 1,
  },
  {
    id: 'gf-a-4',
    targetStructure: 'passive_voice',
    sentence: "The Mercado Central _____ in 1928.",
    options: ["opened", "was opened", "has been opened"],
    correctIndex: 1,
  },
  {
    id: 'gf-a-5',
    targetStructure: 'present_perfect_continuous',
    sentence: "I _____ English for three years, but this is my first proper course.",
    options: ["study", "studied", "have been studying"],
    correctIndex: 2,
  },
  {
    id: 'gf-a-6',
    targetStructure: 'past_perfect',
    sentence: "By the time I arrived at the Fallas, the main parade _____ already.",
    options: ["finished", "had finished", "was finishing"],
    correctIndex: 1,
  },
  {
    id: 'gf-a-7',
    targetStructure: 'past_continuous',
    sentence: "She _____ her homework when her phone rang.",
    options: ["did", "was doing", "has done"],
    correctIndex: 1,
  },
  {
    id: 'gf-a-8',
    targetStructure: 'modal_advice',
    sentence: "You really _____ see a doctor about that. It sounds serious.",
    options: ["would", "should", "might"],
    correctIndex: 1,
  },
  {
    id: 'gf-a-9',
    targetStructure: 'present_perfect_ever',
    sentence: "_____ you ever tried paella negra? It's incredible.",
    options: ["Did", "Were", "Have"],
    correctIndex: 2,
  },
  {
    id: 'gf-a-10',
    targetStructure: 'future_scheduled',
    sentence: "The train _____ at 9:15, so we should leave by 8:45.",
    options: ["is leaving", "leaves", "will leave"],
    correctIndex: 1,
  },
]

export const TEEN_GAP_FILL: GapFillItem[] = [
  {
    id: 'gf-t-1',
    targetStructure: 'present_perfect',
    sentence: "I _____ the new Zelda game three times already!",
    options: ["played", "have played", "was playing"],
    correctIndex: 1,
  },
  {
    id: 'gf-t-2',
    targetStructure: 'second_conditional',
    sentence: "If I _____ better at English, I could watch series without subtitles.",
    options: ["am", "were", "will be"],
    correctIndex: 1,
  },
  {
    id: 'gf-t-3',
    targetStructure: 'reported_speech',
    sentence: "My friend told me that the party _____ cancelled.",
    options: ["is", "was", "has been"],
    correctIndex: 1,
  },
  {
    id: 'gf-t-4',
    targetStructure: 'passive_voice',
    sentence: "The new skate park _____ by the Valencia council last year.",
    options: ["built", "was built", "has built"],
    correctIndex: 1,
  },
  {
    id: 'gf-t-5',
    targetStructure: 'present_perfect_continuous',
    sentence: "I _____ for my phone for an hour — have you seen it?",
    options: ["look", "looked", "have been looking"],
    correctIndex: 2,
  },
  {
    id: 'gf-t-6',
    targetStructure: 'past_perfect',
    sentence: "When I got home, my sister _____ all the food.",
    options: ["ate", "had eaten", "was eating"],
    correctIndex: 1,
  },
  {
    id: 'gf-t-7',
    targetStructure: 'past_continuous',
    sentence: "She _____ her homework when her mum called her for dinner.",
    options: ["did", "was doing", "has done"],
    correctIndex: 1,
  },
  {
    id: 'gf-t-8',
    targetStructure: 'modal_advice',
    sentence: "You really _____ apologise. That was not OK.",
    options: ["could", "should", "would"],
    correctIndex: 1,
  },
  {
    id: 'gf-t-9',
    targetStructure: 'present_perfect_ever',
    sentence: "_____ you ever been to the Ciudad de las Artes at night? It's amazing.",
    options: ["Did", "Have", "Were"],
    correctIndex: 1,
  },
  {
    id: 'gf-t-10',
    targetStructure: 'future_scheduled',
    sentence: "The next episode _____ on Friday. I'm not ready.",
    options: ["will be releasing", "releases", "is released"],
    correctIndex: 1,
  },
]

// ─── Phase 2 MCQ item bank (unchanged) ───────────────────────────────────────

export const phase2Items: Phase2Item[] = [
  {
    cluster: 'FOOTBALL',
    band: 'B1-B2',
    text: `Valencia CF was founded in 1919 and plays at the Mestalla stadium, one of the oldest in Spain. The club has won six La Liga titles and the UEFA Cup twice. After years of financial difficulty under owner Peter Lim, many supporters campaigned for him to sell the club. In 2024, Valencia CF was relegated from La Liga for the first time in decades — a historic low point that united fans in frustration and renewed calls for change. Despite everything, Mestalla still sells out for derbies.`,
    question: 'Why did Valencia CF supporters campaign against their owner?',
    answerGuidance: 'Financial mismanagement / wanting him to sell',
    options: [
      'The club had financial problems under its owner and fans wanted him to sell',
      'The owner planned to move home matches to a newer stadium outside Valencia',
      'Supporters wanted the club to sign more well-known international players',
    ],
    correctIndex: 0,
  },
  {
    cluster: 'GAMING',
    band: 'B1-B2',
    text: `Streaming video games online has become a professional career for thousands of people. Platforms like Twitch and YouTube allow gamers to broadcast their gameplay live to audiences of millions. In Spain, creators like Ibai Llanos have turned streaming into a media empire, covering everything from football matches to boxing events he organises himself. Critics argue that watching others play is passive and unproductive. Fans say it is no different from watching any other sport.`,
    question: 'What argument do critics make about watching gaming streams?',
    answerGuidance: "That it's passive / unproductive",
    options: [
      'Streaming platforms pay too much to popular gamers, inflating the industry',
      'Watching others play is passive and unproductive',
      'Young people are too easily influenced by gaming streamers',
    ],
    correctIndex: 1,
  },
  {
    cluster: 'MUSIC',
    band: 'B1-B2',
    text: `Bizarrap is an Argentine music producer known for his "Music Sessions" — a series of tracks where he collaborates with artists from across Latin America. Each session is released as a surprise, with the artist's identity often kept secret until the day of release. The most-viewed session features Shakira and broke streaming records worldwide. Bizarrap says his studio is "the most democratic stage in music" — anyone can reach it if the music is right, regardless of label or fame.`,
    question: "What does Bizarrap mean when he calls his studio 'the most democratic stage in music'?",
    answerGuidance: 'Anyone can get a session regardless of label or fame',
    options: [
      'He releases all his music for free so anyone can listen',
      'He selects artists through an online fan vote',
      'Anyone can get a session if the music is good, regardless of label or fame',
    ],
    correctIndex: 2,
  },
  {
    cluster: 'FOOD',
    band: 'B1-B2',
    text: `Paella originated in the Valencian countryside, not in restaurants. Farm workers cooked it over open fires using whatever was available — rabbit, chicken, snails, and the local rice grown in the Albufera wetlands south of Valencia. The word "paella" refers to the wide, flat pan it is cooked in, not the dish itself. Today, Valencians take paella seriously enough to have ongoing arguments about what is and is not authentic. Chorizo in paella, for example, is considered a serious offence.`,
    question: 'According to the text, where did paella originally come from?',
    answerGuidance: 'The Valencian countryside / farm workers cooked it over fires',
    options: [
      'The fishing ports along the Valencia coast, using fresh seafood',
      'Farm workers in the Valencian countryside cooking over open fires',
      'Traditional recipes brought to Valencia from North Africa',
    ],
    correctIndex: 1,
  },
  {
    cluster: 'TRAVEL',
    band: 'B1-B2',
    text: `Slow travel is a growing movement that rejects the idea of visiting as many places as possible in a short time. Instead, slow travellers stay longer in fewer places, use local transport, eat where residents eat, and try to understand the rhythm of daily life. Research suggests slow travellers spend more money in local businesses and have a lower environmental impact than those on package tours. Critics say it is a privilege — you need time as well as money to travel slowly.`,
    question: 'What criticism do people make of slow travel?',
    answerGuidance: 'It requires time as well as money / not everyone can afford it',
    options: [
      'It requires time as well as money — a privilege not everyone has',
      'Slow travellers often spend less money in total than package tourists',
      'Local businesses prefer tourists who move quickly through many places',
    ],
    correctIndex: 0,
  },
  {
    cluster: 'WORK_PROFESSIONAL',
    band: 'B1-B2',
    text: `Remote working became normal for millions of people during the pandemic, but many companies are now pushing for a return to the office. Supporters of office work argue that collaboration, creativity, and company culture are stronger when people are physically together. Remote work advocates point to research showing productivity often increases at home, alongside better work-life balance and reduced commuting stress. Many workers say the real issue is trust — whether managers believe people work hard when they cannot see them.`,
    question: 'According to remote work supporters, what happens to productivity when people work from home?',
    answerGuidance: 'It often increases',
    options: [
      'Workers communicate more clearly because everything is in writing',
      'Productivity is the same as in the office but workers feel less stressed',
      'Research suggests productivity often increases when working from home',
    ],
    correctIndex: 2,
  },
  {
    cluster: 'SPORT',
    band: 'B1-B2',
    text: `Padel is one of the fastest-growing sports in the world, and Spain is its heartland. Invented in Mexico in the 1960s, it was developed and popularised by Spaniards and is now played by more than four million people in the country. The sport is played in pairs on an enclosed glass-walled court. Unlike tennis, balls can bounce off the walls, which slows the game enough for beginners to rally quickly. Valencia alone has hundreds of clubs.`,
    question: 'Why can beginners in padel start rallying more quickly than in tennis?',
    answerGuidance: 'Balls bounce off the walls / the walls slow the game down',
    options: [
      'The rackets are lighter and easier to control than tennis rackets',
      'Balls bounce off the glass walls, which slows the game enough for beginners',
      'The court is smaller, so players do not need to run as far',
    ],
    correctIndex: 1,
  },
  {
    cluster: 'TV_FILM',
    band: 'B1-B2',
    text: `La Casa de Papel, known internationally as Money Heist, became one of the most-watched non-English series in Netflix history. The Spanish drama follows a gang of robbers who plan and execute an audacious heist on the Spanish Mint in Madrid. What made it unusual was the focus on character — viewers followed the robbers rather than the police, making it harder to decide who to root for. After its initial release on Spanish television attracted modest audiences, Netflix acquired it and turned it into a global phenomenon.`,
    question: 'What made La Casa de Papel unusual compared to typical crime dramas?',
    answerGuidance: 'It followed the robbers rather than the police',
    options: [
      'Viewers followed the robbers rather than the police, making it hard to know who to support',
      'The entire series was filmed inside the real Spanish Mint in Madrid',
      'The show was originally made for Netflix before moving to Spanish television',
    ],
    correctIndex: 0,
  },
  {
    cluster: 'ANIMALS',
    band: 'B1-B2',
    text: `Bioparc Valencia opened in 2008 and quickly gained a reputation as one of the most innovative zoos in Europe. Unlike traditional zoos with bars and cages, Bioparc uses a design philosophy called zoo-immersion — barriers are hidden and animals, plants, and visitors appear to share the same space. The park focuses exclusively on African wildlife, from gorillas to elephants to crocodiles. Over a million people visit each year.`,
    question: 'What is zoo-immersion, according to the text?',
    answerGuidance: 'A design where barriers are hidden / animals and visitors appear to share the same space',
    options: [
      'A programme that teaches animals to live alongside humans safely',
      'A visitor experience where people can touch and feed the animals',
      'A design where hidden barriers make animals and visitors appear to share the same space',
    ],
    correctIndex: 2,
  },
  {
    cluster: 'FAMILY',
    band: 'B1-B2',
    text: `Spain has one of the lowest birth rates in Europe, and the average age at which people have their first child has been rising steadily. In the 1970s, most Spanish women had their first child before 25. Today, the average is over 32. Economists point to housing costs and job insecurity as the main reasons. At the same time, multigenerational homes remain more common in Spain than in northern Europe, reflecting a strong family culture even as family sizes shrink.`,
    question: 'What do economists say is the main reason Spanish people are having children later?',
    answerGuidance: 'Housing costs and job insecurity',
    options: [
      'Young people are choosing to travel and build careers before starting families',
      'Housing costs and job insecurity are the main factors',
      "Social media has changed young people's attitudes toward family life",
    ],
    correctIndex: 1,
  },
  {
    cluster: 'TECHNOLOGY',
    band: 'B1-B2',
    text: `Artificial intelligence is already present in tasks that most people do not think of as technology. When a streaming platform recommends a film, when a bank flags a suspicious payment, or when a hospital uses software to detect cancer in a scan — all of these are AI applications. The bigger challenge, researchers argue, is not building AI tools but deciding how to use them responsibly.`,
    question: 'What do researchers say is the bigger challenge with AI?',
    answerGuidance: 'Deciding how to use it responsibly',
    options: [
      'Getting enough investment to build AI systems at scale',
      'Training AI models on data that is accurate and unbiased',
      'Not building AI tools, but deciding how to use them responsibly',
    ],
    correctIndex: 2,
  },
  {
    cluster: 'CULTURE_HISTORY',
    band: 'B1-B2',
    text: `In October 1957, the River Turia burst its banks and flooded Valencia, killing more than 80 people and destroying thousands of homes. Within a decade, the Spanish government diverted the river through a new channel to the south. Plans to build a motorway through the old riverbed were eventually abandoned. Instead, in the 1980s, Valencia transformed the dried riverbed into a park — now one of the longest urban green spaces in Europe.`,
    question: 'What happened to the old riverbed of the Turia after the river was diverted?',
    answerGuidance: 'It was turned into a park',
    options: [
      'New housing was built along it to replace the homes destroyed in the flood',
      'It was eventually transformed into one of the longest urban parks in Europe',
      'The city built a motorway through it to reduce traffic',
    ],
    correctIndex: 1,
  },
  {
    cluster: 'SOCIAL_FRIENDS',
    band: 'B1-B2',
    text: `Research into social media and friendship consistently produces a complicated picture. Young people who use platforms like Instagram heavily report both more social connections and more loneliness than those who use them less. Some researchers argue the problem is not social media itself but passive use: scrolling and watching rather than actively sharing and talking.`,
    question: 'What distinction do some researchers make about how social media affects people?',
    answerGuidance: 'Active use is less harmful than passive use (scrolling)',
    options: [
      'Social media causes more harm to people who were already lonely',
      'The number of hours spent online matters more than the type of platform',
      'Passive use (scrolling) is more harmful than active use (sharing and talking)',
    ],
    correctIndex: 2,
  },
  {
    cluster: 'VALENCIA_LOCAL',
    band: 'B1-B2',
    text: `El Cabanyal is a neighbourhood in Valencia that grew up as a fishing community on the edge of the Mediterranean. In the 1990s, the city council proposed demolishing several streets to extend a road to the beach, sparking years of protest from residents and architects. The demolition plan was eventually cancelled. Since then, El Cabanyal has attracted artists and young families, gradually transforming into one of the most interesting parts of the city.`,
    question: 'Why did residents and architects protest in El Cabanyal in the 1990s?',
    answerGuidance: 'To stop streets being demolished to extend a road',
    options: [
      'To stop the demolition of streets planned to extend a road to the beach',
      "To demand protection for the neighbourhood's traditional fish market",
      'To prevent a large hotel development near the seafront',
    ],
    correctIndex: 0,
  },
  {
    cluster: 'PSYCHOLOGY_PEOPLE',
    band: 'B1-B2',
    text: `Most people find it harder to say no than to say yes, even when saying yes creates more work or stress. Psychologists suggest this is connected to social approval — humans are wired to want others to like them, and saying no can feel like a rejection or a conflict. Learning to say no politely, researchers argue, is one of the most useful skills for managing stress.`,
    question: 'Why do psychologists think people find it hard to say no?',
    answerGuidance: 'They want social approval / they are wired to want others to like them',
    options: [
      'Most people have never been taught to refuse requests politely',
      'People are afraid that refusing will reduce their future opportunities',
      'Humans are wired to want others to like them, so saying no can feel like conflict',
    ],
    correctIndex: 2,
  },
  {
    cluster: 'CREATIVE_ARTS',
    band: 'B1-B2',
    text: `Valencia has one of the most significant street art scenes in Spain. The neighbourhood of Ruzafa is particularly known for large-scale murals that cover entire building facades. Some residents feel the murals have improved neglected areas and increased tourism. Others argue that commercial sponsorship changes the art's meaning — that street art should be rebellious, not approved by the city.`,
    question: 'What argument do some people make against commercially sponsored street art?',
    answerGuidance: 'It loses its rebellious nature',
    options: [
      'Festival murals attract too many tourists and push up rents',
      'Commercial involvement removes the rebellious spirit that gives street art its meaning',
      'International artists take opportunities away from local Valencian painters',
    ],
    correctIndex: 1,
  },
  {
    cluster: 'NATURE',
    band: 'B1-B2',
    text: `The Albufera is a freshwater lagoon just 10 kilometres south of Valencia. It is one of Spain's most important wetlands and home to hundreds of bird species. The lagoon is also the source of the rice used in traditional Valencian paella — farmers have cultivated the surrounding paddies for centuries. Despite its proximity to a major city, the Albufera remains largely undeveloped.`,
    question: 'Why is the Albufera important for Valencian food culture?',
    answerGuidance: 'Its rice paddies produce the rice used in traditional paella',
    options: [
      "Local fishermen from the Albufera have supplied Valencia's restaurants for generations",
      'The wetland microclimate gives Valencian produce a unique flavour',
      'Its rice paddies have produced the rice used in traditional Valencian paella for centuries',
    ],
    correctIndex: 2,
  },
  {
    cluster: 'PERSONAL_DEVELOPMENT',
    band: 'B1-B2',
    text: `Learning a new language does more than give you a communication tool — it changes how you see the world. Researchers found that people make more rational financial decisions when reasoning in a second language, possibly because emotional distance reduces impulsive thinking. Many language learners say the process also makes them more empathetic towards people from different cultures.`,
    question: 'What did researchers discover about decision-making in a second language?',
    answerGuidance: 'People make more rational / less impulsive financial decisions',
    options: [
      'People make more rational, less impulsive financial decisions',
      'People take longer to decide but feel more confident in their choices',
      'Second language users tend to copy the decisions of people around them',
    ],
    correctIndex: 0,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FALLBACK_CLUSTERS: TopicCluster[] = ['FOOTBALL', 'FOOD', 'TRAVEL']

export function getPhase2Item(cluster: TopicCluster, band: Band): Phase2Item | null {
  return (
    phase2Items.find(i => i.cluster === cluster && i.band === band) ??
    phase2Items.find(i => i.cluster === cluster && i.band === 'B1-B2') ??
    null
  )
}

// Returns 4 MCQ items matched to student's detected clusters + band (reduced from 6)
export function getPhase2ItemsForSession(clusters: TopicCluster[], band: Band): Phase2Item[] {
  const items: Phase2Item[] = []
  const tried = new Set<TopicCluster>()

  for (const cluster of [...clusters, ...FALLBACK_CLUSTERS]) {
    if (tried.has(cluster)) continue
    tried.add(cluster)
    const item = getPhase2Item(cluster, band)
    if (item) {
      items.push(item)
      if (items.length >= 4) break
    }
  }

  return items
}
