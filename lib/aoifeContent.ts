// Function 6 — Aoife, the daily pen-pal. THE FIXED 30-DAY SPINE.
//
// Hybrid adaptivity (see aoife-penpal-build-spec-v1.0.md): this array is the
// scaffolding — the theme, target grammar and Ireland nugget for each day never
// change. aoifeTutor.composeMessage() personalises the wording around it and recycles
// the learner's own errors, but it cannot leave this day's frame. `seedMessage` and
// `seedQuestions` are the offline fallback used verbatim if Claude is unreachable.
//
// Ported from the approved static MVP:
//   Somerset Worksheets/groups/speak-up/materials/Miriam-Ireland-30-Day/Miriam-Ireland-30-Day-Plan.html

export interface SpineQuestion {
  q: string
  model: string // an example B1 answer, for the offline fallback only
}

export interface SpineDay {
  day: number // 1..30
  week: 1 | 2 | 3 | 4
  title: string
  grammar: string // the target structure for the day
  nugget: { title: string; text: string }
  seedMessage: string // Aoife's default message (plain text), used if Claude is down
  seedQuestions: SpineQuestion[]
  diary: [string, string, string] // past / present / future frames
  unlock: { emoji: string; place: string; fact: string }
}

export const SPINE: SpineDay[] = [
  // ---------- WEEK 1 · PRESENT ----------
  { day: 1, week: 1, title: 'Hello from Dublin', grammar: 'Present simple · introducing yourself',
    nugget: { title: 'Dublin', text: 'Dublin is the capital of Ireland. About 1.5 million people live in the area — smaller than València’s region, and you can walk across the centre in half an hour.' },
    seedMessage: 'Hi Miriam! I’m Aoife, from Dublin. I live near the city centre and I work in a little café. Right now I am drinking a cup of tea and writing to you. I am so happy to meet you!',
    seedQuestions: [{ q: 'Hello! What’s your name and where are you from?', model: 'Hi Aoife! I’m Miriam and I’m from València, in Spain.' }, { q: 'What are you doing right now?', model: 'Right now I’m sitting at home and drinking a coffee.' }],
    diary: ['Yesterday I…', 'Today I…', 'Tomorrow I…'],
    unlock: { emoji: '🏙️', place: 'Dublin', fact: 'The capital, on the east coast where the River Liffey meets the sea.' } },

  { day: 2, week: 1, title: 'Where I live', grammar: 'Present simple · your home & city',
    nugget: { title: 'The River Liffey', text: 'The Liffey runs through Dublin, dividing it into the northside and the southside — a bit like the old Turia riverbed splits València.' },
    seedMessage: 'Today I am showing you my street! I live in Stoneybatter, an old part of Dublin with small colourful houses. I love it. Yesterday I painted my door red. Tomorrow I will send you a photo.',
    seedQuestions: [{ q: 'Where do you live? What’s it like?', model: 'I live in a flat in València, near the centre. It’s noisy but I love it.' }, { q: 'What’s your favourite room in your home?', model: 'My favourite room is the kitchen because I love cooking.' }],
    diary: ['Yesterday I…', 'Today I live in…', 'Tomorrow I…'],
    unlock: { emoji: '🌉', place: 'The Liffey', fact: 'Dublin’s river, crossed by the pretty Ha’penny Bridge.' } },

  { day: 3, week: 1, title: 'My morning', grammar: 'Present simple · daily routine',
    nugget: { title: 'Trinity College', text: 'Trinity is Ireland’s oldest university (1592). Its library keeps the Book of Kells, a hand-painted book more than 1,000 years old.' },
    seedMessage: 'I am not a morning person! Every day I get up at seven, I make tea, and I walk to the café. This morning I was very tired. But tonight I will go to bed early — I promise!',
    seedQuestions: [{ q: 'What do you do every morning?', model: 'Every morning I get up, I have a coffee, and I check my phone.' }, { q: 'Are you a morning person?', model: 'No, I’m not! I need two coffees before I can talk.' }],
    diary: ['Yesterday morning I…', 'This morning I…', 'Tomorrow morning I…'],
    unlock: { emoji: '📚', place: 'Trinity College', fact: 'Ireland’s oldest university — home to the 1,000-year-old Book of Kells.' } },

  { day: 4, week: 1, title: 'Food I love', grammar: 'Present simple · likes & food',
    nugget: { title: 'The Irish breakfast', text: 'A “full Irish” is eggs, sausages, bacon, beans, tomato and soda bread. Soda bread is made without yeast — quick, dense and delicious.' },
    seedMessage: 'In the café I make a big Irish breakfast — eggs, sausages, and brown soda bread. I love it! This morning a customer ate three! Tomorrow I am going to bake fresh bread. Do you like cooking?',
    seedQuestions: [{ q: 'What food do you love?', model: 'I love paella, but I really love a good tortilla de patatas.' }, { q: 'What do you usually eat for breakfast?', model: 'I usually have toast with tomato and olive oil, and a coffee.' }],
    diary: ['Yesterday I ate…', 'Today I like…', 'Tomorrow I’ll eat…'],
    unlock: { emoji: '🍳', place: 'Irish breakfast', fact: 'Eggs, sausages and brown soda bread — a Dublin Sunday tradition.' } },

  { day: 5, week: 1, title: 'My dog Bran', grammar: 'Present simple · describing',
    nugget: { title: 'Phoenix Park', text: 'One of Europe’s biggest city parks — twice the size of New York’s Central Park. Wild deer have lived there for over 350 years.' },
    seedMessage: 'Meet Bran, my dog! He is big, brown and very silly. Every evening we walk in the park. Yesterday he ran after a squirrel and fell in the pond! Tonight he will sleep very well.',
    seedQuestions: [{ q: 'Do you have a pet, or would you like one?', model: 'I don’t have a pet, but I’d love a small dog to walk on the beach.' }, { q: 'Describe an animal you like — three words.', model: 'Cats are quiet, clever and independent — like me!' }],
    diary: ['Yesterday I saw…', 'Today I…', 'Tomorrow I…'],
    unlock: { emoji: '🦌', place: 'Phoenix Park', fact: 'A huge Dublin park with wild deer roaming free.' } },

  { day: 6, week: 1, title: 'A soft day', grammar: 'Present simple · the weather',
    nugget: { title: '“A soft day”', text: 'The Irish have many kind words for rain. “A soft day” means light, misty rain — they don’t complain about it, they just carry a jacket.' },
    seedMessage: 'It is raining again — in Ireland we call this “a soft day”! I am wearing my big coat. It rains a lot here, but I don’t mind. In València it is sunny, no? Lucky you! Tomorrow, they say, the sun will come.',
    seedQuestions: [{ q: 'What’s the weather like today in València?', model: 'Today it’s hot and sunny — about 30 degrees!' }, { q: 'Do you prefer rain or sun? Why?', model: 'I prefer the sun because I feel happier and I go to the beach.' }],
    diary: ['Yesterday the weather was…', 'Today it is…', 'Tomorrow it will be…'],
    unlock: { emoji: '🌧️', place: 'A soft day', fact: 'The Irish word for gentle rain — bring a jacket, not a complaint.' } },

  { day: 7, week: 1, title: 'The craic', grammar: 'Present simple · week 1 round-up',
    nugget: { title: 'The craic & Temple Bar', text: '“The craic” means fun and good conversation. Temple Bar is Dublin’s lively area of painted pubs with live traditional music almost every night.' },
    seedMessage: 'You are doing so well, Miriam — a whole week! Tonight my friends and I are going to a pub with live music. We call a good time “the craic” (say it “crack”). Last week the craic was mighty! What will you do this weekend?',
    seedQuestions: [{ q: 'What do you like to do to relax?', model: 'To relax I like to meet friends for a drink, or watch a series at home.' }, { q: 'Tell Aoife one thing about your week.', model: 'This week I started an English challenge with a girl from Dublin!' }],
    diary: ['This week I…', 'Today I feel…', 'This weekend I will…'],
    unlock: { emoji: '🎻', place: 'Temple Bar', fact: 'Dublin’s pub quarter — live trad music and “the craic” every night.' } },

  // ---------- WEEK 2 · + PAST ----------
  { day: 8, week: 2, title: 'What I did yesterday', grammar: 'Past simple · your day',
    nugget: { title: 'Guinness Storehouse', text: 'Dublin’s most-visited place — the home of Guinness, the famous black stout. At the top there’s a glass bar with a view over the whole city.' },
    seedMessage: 'Yesterday was busy! I opened the café, I made forty coffees, and I walked Bran in the rain. Then I watched a film and fell asleep on the sofa. Today I am tired but happy. What did you do yesterday?',
    seedQuestions: [{ q: 'What did you do yesterday? Tell me three things.', model: 'Yesterday I worked, I cooked dinner, and I watched a film.' }, { q: 'What was the best part of your day yesterday?', model: 'The best part was a long walk by the sea after work.' }],
    diary: ['Yesterday I…', 'Today I am…', 'Tomorrow I will…'],
    unlock: { emoji: '🍺', place: 'Guinness Storehouse', fact: 'Dublin’s most-visited spot, with a rooftop bar over the city.' } },

  { day: 9, week: 2, title: 'A day by the sea', grammar: 'Past simple · a small story',
    nugget: { title: 'The Forty Foot', text: 'A rocky sea spot near Dublin where people swim all year — even on Christmas Day! The water is cold, but the Irish say it “wakes you up”.' },
    seedMessage: 'Last Sunday I went to Sandymount beach. I swam in the cold sea — it was freezing! Then I had hot chocolate. It was a perfect day. Do you go to the beach a lot? You are so lucky to live near the Mediterranean.',
    seedQuestions: [{ q: 'Tell me about the last time you went to the beach.', model: 'Last weekend I went to Malvarrosa. I swam and I read my book.' }, { q: 'Do you like cold water or warm water?', model: 'I like warm water! I could never swim in the Irish sea.' }],
    diary: ['Last weekend I…', 'Today I…', 'Next weekend I will…'],
    unlock: { emoji: '🌊', place: 'Sandymount & the Forty Foot', fact: 'Dublin’s sea spots — locals swim all year, even at Christmas.' } },

  { day: 10, week: 2, title: 'A funny thing happened', grammar: 'Past simple · telling a story',
    nugget: { title: 'Molly Malone', text: 'A famous Dublin statue and song about a girl who sold fish and shellfish “alive, alive-oh”. Tourists rub the statue for luck.' },
    seedMessage: 'Ha! Today a funny thing happened. A man came in and asked for “the usual”. But I didn’t know him! I gave him a random coffee and he said “perfect!”. We laughed so much. Has something funny happened to you?',
    seedQuestions: [{ q: 'Tell me about a funny or strange thing that happened to you.', model: 'Once I got on the wrong bus and ended up in another town!' }, { q: 'When did you last laugh a lot?', model: 'Last night, with my sister — we watched old family videos.' }],
    diary: ['Yesterday something…', 'Today I feel…', 'Tomorrow I hope…'],
    unlock: { emoji: '🐟', place: 'Molly Malone', fact: 'Dublin’s famous statue and song — “alive, alive-oh!”' } },

  { day: 11, week: 2, title: 'My weekend', grammar: 'Past simple · free time',
    nugget: { title: 'Howth', text: 'A pretty fishing village on a hill just outside Dublin. You can walk the cliffs, eat fresh fish and see seals in the harbour.' },
    seedMessage: 'What a weekend! On Saturday I climbed the hill at Howth and saw the whole bay. On Sunday I did nothing — I stayed in bed! Both were perfect in different ways. Are you a “do everything” or a “do nothing” person at the weekend?',
    seedQuestions: [{ q: 'What did you do last weekend?', model: 'On Saturday I saw friends, and on Sunday I rested at home.' }, { q: 'What’s your perfect weekend?', model: 'My perfect weekend is the beach on Saturday and family lunch on Sunday.' }],
    diary: ['Last weekend I…', 'Today I…', 'Next weekend I will…'],
    unlock: { emoji: '⛰️', place: 'Howth', fact: 'A cliff-walk fishing village outside Dublin, with seals in the harbour.' } },

  { day: 12, week: 2, title: 'When I was young', grammar: 'Past simple · childhood',
    nugget: { title: 'Hurling & the GAA', text: 'Hurling is an ancient, fast Irish sport played with a wooden stick and a small ball. It’s over 3,000 years old — older than the pyramids of Egypt.' },
    seedMessage: 'When I was a child, I lived by the sea in a small town. Every summer I played hurling with my brothers and ate too many ice creams. I was very happy. What were you like when you were young?',
    seedQuestions: [{ q: 'Where did you live when you were a child?', model: 'When I was young I lived in a village near València with my grandparents.' }, { q: 'What did you love doing as a child?', model: 'I loved drawing and playing in the street with my cousins.' }],
    diary: ['When I was young I…', 'Today I am…', 'One day I will…'],
    unlock: { emoji: '🏑', place: 'Hurling', fact: 'An ancient Irish sport, over 3,000 years old — older than the pyramids.' } },

  { day: 13, week: 2, title: 'A big celebration', grammar: 'Past simple · a festival',
    nugget: { title: 'St Patrick’s Day', text: 'On 17 March, Ireland celebrates its patron saint with parades, music and the colour green everywhere. Cities all over the world go green too.' },
    seedMessage: 'Last March we celebrated St Patrick’s Day. The whole city turned green! There was a huge parade and everyone wore green hats. I danced in the street. It was magic. You have Fallas in València — tell me about it!',
    seedQuestions: [{ q: 'Tell me about a festival in València.', model: 'In València we have Fallas in March. We burn big statues and there are fireworks everywhere.' }, { q: 'What did you do at the last festival you went to?', model: 'At the last Fallas I watched the mascletà and ate churros with my family.' }],
    diary: ['At the last festival I…', 'Today I…', 'At the next festival I will…'],
    unlock: { emoji: '☘️', place: 'St Patrick’s Day', fact: '17 March — Ireland turns green with parades and music.' } },

  { day: 14, week: 2, title: 'Two weeks! Look back', grammar: 'Past simple · week 2 round-up',
    nugget: { title: 'Georgian doors', text: 'Dublin is famous for rows of tall old houses with brightly painted front doors — red, blue, green, yellow. People painted them different colours so they could find their own home!' },
    seedMessage: 'Miriam, two whole weeks! I am so proud of you. This week you told me about your weekend, your childhood, your festivals. Your English is getting stronger — I can feel it! What did you learn this week?',
    seedQuestions: [{ q: 'What did you do this week that you’re proud of?', model: 'This week I spoke English every single day — I’m proud of that!' }, { q: 'Which day this week did you enjoy most?', model: 'I enjoyed the beach story day — it made me think of home.' }],
    diary: ['This week I learned…', 'Today I feel…', 'Next week I will…'],
    unlock: { emoji: '🚪', place: 'Georgian doors', fact: 'Dublin’s colourful front doors — painted bright so people could find home.' } },

  // ---------- WEEK 3 · + FUTURE ----------
  { day: 15, week: 3, title: 'My plans for today', grammar: 'Future · going to / will',
    nugget: { title: 'Grafton Street', text: 'Dublin’s famous shopping street, full of buskers (street musicians). Many famous singers started here.' },
    seedMessage: 'Big day! Today I am going to paint the café and I will meet my sister for lunch. Later I am going to walk Bran. Yesterday I planned it all in my notebook. What are you going to do today?',
    seedQuestions: [{ q: 'What are you going to do today?', model: 'Today I’m going to work, and later I’m going to call my mother.' }, { q: 'What’s one thing you will definitely do this evening?', model: 'This evening I will make dinner and watch my series.' }],
    diary: ['Yesterday I planned…', 'Today I am going to…', 'Tomorrow I will…'],
    unlock: { emoji: '🎸', place: 'Grafton Street', fact: 'Dublin’s musical shopping street, full of buskers.' } },

  { day: 16, week: 3, title: 'This weekend', grammar: 'Future · plans & arrangements',
    nugget: { title: 'The DART', text: 'The DART is Dublin’s coastal train. It runs right along the edge of Dublin Bay — one of the prettiest short train rides in Europe.' },
    seedMessage: 'This weekend is going to be great! On Saturday I am meeting friends in town, and on Sunday I am going to take the DART train along the coast. If it’s sunny, I will swim. What are your plans for the weekend?',
    seedQuestions: [{ q: 'What are your plans for this weekend?', model: 'This weekend I’m going to visit my parents and I’m going to relax.' }, { q: 'What will you do if the weather is good?', model: 'If the weather is good, I will go to the beach with my friends.' }],
    diary: ['Last weekend I…', 'Today I am…', 'This weekend I am going to…'],
    unlock: { emoji: '🚆', place: 'The DART', fact: 'Dublin’s coastal train, hugging the edge of the bay.' } },

  { day: 17, week: 3, title: 'A holiday I’ll take', grammar: 'Future · dreams & wishes',
    nugget: { title: 'Galway', text: 'A colourful, musical city on Ireland’s west coast. Its streets are full of live music, and it’s the gateway to wild Connemara.' },
    seedMessage: 'One day I am going to travel to the west of Ireland, to Galway. People say it is the friendliest city in Ireland. I will listen to music in the pubs and eat fresh oysters. Where would you like to travel one day?',
    seedQuestions: [{ q: 'Where would you like to travel one day? Why?', model: 'One day I’d like to travel to Japan because the culture fascinates me.' }, { q: 'What will you do there?', model: 'I will visit the temples and I will try all the food.' }],
    diary: ['I have never…', 'Today I dream of…', 'One day I will…'],
    unlock: { emoji: '🎶', place: 'Galway', fact: 'Ireland’s musical west-coast city — live trad on every corner.' } },

  { day: 18, week: 3, title: 'A trip to the cliffs', grammar: 'Future · a plan in detail',
    nugget: { title: 'The Cliffs of Moher', text: 'Giant sea cliffs on the west coast, 214 metres high — as tall as a 60-floor building. On a clear day you can see the Aran Islands.' },
    seedMessage: 'Next month I am going to the Cliffs of Moher! I am going to stand at the edge (carefully!) and look at the Atlantic. I booked the bus yesterday. I will take a hundred photos and send you the best one. Are you afraid of heights?',
    seedQuestions: [{ q: 'Are you afraid of anything? Heights? Spiders?', model: 'Yes! I’m quite afraid of heights — I can’t look down from a balcony.' }, { q: 'What’s a place you’re going to visit soon?', model: 'Next summer I’m going to visit my friend in Madrid.' }],
    diary: ['Yesterday I booked / did…', 'Today I am…', 'Next month I am going to…'],
    unlock: { emoji: '🧗', place: 'Cliffs of Moher', fact: '214-metre sea cliffs on the wild Atlantic coast.' } },

  { day: 19, week: 3, title: 'Learning something new', grammar: 'Future + a few Irish words',
    nugget: { title: 'The Irish language', text: 'Irish (Gaeilge) is one of Europe’s oldest written languages. Most Irish people speak English daily, but Irish is on all the road signs and taught in every school — a bit like Valencian.' },
    seedMessage: 'I am going to teach you some Irish (we call it “Gaeilge”)! “Dia duit” (say “jee-a gwitch”) means hello. “Sláinte” (say “slawn-cha”) means cheers! Tomorrow I will teach you one more. Will you try to say them out loud?',
    seedQuestions: [{ q: 'Say “Dia duit” and “Sláinte” out loud. How did it feel?', model: 'That was hard! “Sláinte” — slawn-cha — cheers! I did it.' }, { q: 'Why are you learning English? What will it give you?', model: 'I’m learning English because it will give me confidence to travel and meet people.' }],
    diary: ['Yesterday I learned…', 'Today I can say…', 'Tomorrow I will practise…'],
    unlock: { emoji: '🗣️', place: 'Gaeilge', fact: 'The Irish language — on every road sign, taught in every school.' } },

  { day: 20, week: 3, title: 'If the sun shines…', grammar: 'Future · first conditional',
    nugget: { title: 'The Giant’s Causeway', text: '40,000 six-sided stone columns by the sea, made by an ancient volcano. The legend says a giant named Finn built them to walk to Scotland.' },
    seedMessage: 'I am dreaming of the north. If I have time this year, I will drive to the Giant’s Causeway — strange stone steps made by nature (or by a giant, the story says!). If the sun shines, it will be perfect. What will you do if you have a free day this week?',
    seedQuestions: [{ q: 'What will you do if you have a completely free day?', model: 'If I have a free day, I will sleep late and go for a long walk.' }, { q: 'If you visit Ireland one day, what will you see first?', model: 'If I visit Ireland, I will see Dublin first, and then the cliffs.' }],
    diary: ['Yesterday I…', 'Today, if I have time, I will…', 'Tomorrow I am going to…'],
    unlock: { emoji: '🌋', place: 'Giant’s Causeway', fact: '40,000 stone columns by the sea — nature’s staircase, or a giant’s.' } },

  { day: 21, week: 3, title: 'Three weeks strong', grammar: 'Future · week 3 round-up',
    nugget: { title: 'The Aran Islands', text: 'Three small, windswept islands off the west coast where people still speak Irish every day and knit the famous cream Aran jumpers by hand.' },
    seedMessage: 'Miriam! Three weeks. You now talk about the past, the present AND the future. That’s everything! Next week will be our last — and I am going to ask you bigger questions. What are you most proud of so far?',
    seedQuestions: [{ q: 'What are you most proud of after three weeks?', model: 'I’m proud that I haven’t given up — I speak a little every day now.' }, { q: 'What will you do in the last week to finish strong?', model: 'In the last week I will speak louder and try longer answers.' }],
    diary: ['This week I managed to…', 'Today I feel…', 'Next week I will…'],
    unlock: { emoji: '🧶', place: 'Aran Islands', fact: 'Windswept islands where Irish is still spoken and jumpers are hand-knit.' } },

  // ---------- WEEK 4 · MIX + OPINIONS + MONOLOGUE ----------
  { day: 22, week: 4, title: 'My opinion: the best food', grammar: 'Opinions · I think / for me',
    nugget: { title: 'Cork & the English Market', text: 'Cork is Ireland’s second city, in the south. Its covered English Market has sold food since 1788 — even the Queen visited it.' },
    seedMessage: 'Here’s a big question! I think the best food in the world is simple: good bread, good butter, good cheese. For me, fancy food is overrated! Last night I had just toast and I was happy. What do you think — what’s the best food?',
    seedQuestions: [{ q: 'In your opinion, what’s the best food in the world?', model: 'For me, the best food is my grandmother’s paella — nothing beats it.' }, { q: 'Do you agree that simple food is best? Why / why not?', model: 'I agree. I think fresh, simple food made with love is the best.' }],
    diary: ['Last night I ate…', 'I think today…', 'Tomorrow I will try…'],
    unlock: { emoji: '🧀', place: 'Cork’s English Market', fact: 'A covered food market selling since 1788 — even the Queen dropped by.' } },

  { day: 23, week: 4, title: 'Dublin and València', grammar: 'Comparing · comparatives',
    nugget: { title: 'Irish tea', text: 'Ireland drinks more tea per person than almost any country on Earth — often 4 or 5 cups a day, always with milk. Offering tea is how the Irish say “you’re welcome here”.' },
    seedMessage: 'I am thinking about our two cities. Dublin is older and rainier; València is sunnier and, I think, more relaxed. But both love food, music and the sea. Last year a friend visited València and never stopped talking about it! What’s different about our cities?',
    seedQuestions: [{ q: 'What’s different between València and a city you’ve visited?', model: 'València is smaller and warmer than Madrid, and I think it’s more relaxed.' }, { q: 'What do València and Dublin have in common?', model: 'Both are by the water and both love good food and going out.' }],
    diary: ['Last year I visited…', 'Today I think…', 'One day I will compare…'],
    unlock: { emoji: '🍵', place: 'Irish tea', fact: 'Ireland drinks 4–5 cups a day — offering tea means “you’re welcome”.' } },

  { day: 24, week: 4, title: 'A person I admire', grammar: 'Mixed tenses · describing a person',
    nugget: { title: 'Ireland’s writers', text: 'Tiny Ireland has produced four Nobel Prize writers, and Dublin is a UNESCO “City of Literature”. James Joyce, Oscar Wilde and W.B. Yeats all walked these streets.' },
    seedMessage: 'Someone I admire is my grandmother. She grew up with very little, but she raised six children and she never complained. Now she is 90 and she still tells the best stories. When I am tired, I think of her. Who do you admire?',
    seedQuestions: [{ q: 'Who is a person you admire? Tell me about them.', model: 'I admire my mother. She works so hard and she’s always calm and kind.' }, { q: 'What did that person teach you?', model: 'She taught me to be patient and to never give up.' }],
    diary: ['Someone taught me…', 'Today I admire…', 'I hope one day I will…'],
    unlock: { emoji: '✍️', place: 'Ireland’s writers', fact: 'Four Nobel winners from one small island — Joyce, Wilde, Yeats and more.' } },

  { day: 25, week: 4, title: 'An old Irish story', grammar: 'Past simple · a legend',
    nugget: { title: 'The Children of Lir', text: 'One of Ireland’s oldest legends — four children turned into swans. To this day, harming a swan is against the law in Ireland, partly because of this story.' },
    seedMessage: 'Let me tell you a story. Long ago, a king had four children. A jealous witch turned them into swans for 900 years! They flew over the cold Irish lakes, singing beautiful songs. It is sad, but the Irish love it. Do you know an old story from Spain?',
    seedQuestions: [{ q: 'Tell me a story or legend you know — even in a few words.', model: 'In Spain we have old stories of hidden treasure in the mountains.' }, { q: 'Do you like sad stories or happy ones? Why?', model: 'I prefer happy stories because life is already hard enough!' }],
    diary: ['Long ago people…', 'Today I know…', 'Tomorrow I will tell…'],
    unlock: { emoji: '🦢', place: 'The Children of Lir', fact: 'An ancient legend of children turned to swans — why harming swans is illegal in Ireland.' } },

  { day: 26, week: 4, title: 'Where Halloween began', grammar: 'Mixed tenses · customs',
    nugget: { title: 'Samhain', text: '2,000 years ago the Irish festival of Samhain (say “SOW-in”) marked the end of summer. Irish emigrants carried it to America, where it became Halloween.' },
    seedMessage: 'Did you know Halloween started here? The ancient Irish had a festival called Samhain. They believed the spirits came back on that night, so they lit big fires and wore costumes. Today the whole world celebrates it! Do you celebrate Halloween in València?',
    seedQuestions: [{ q: 'Do you celebrate Halloween, or another special night? Tell me.', model: 'We don’t do much for Halloween, but we celebrate All Saints’ Day and visit family.' }, { q: 'What’s a custom from València that you love?', model: 'I love the custom of long Sunday lunches — the whole family, for hours.' }],
    diary: ['In the past people…', 'Today we celebrate…', 'Next year I will…'],
    unlock: { emoji: '🎃', place: 'Samhain', fact: 'The 2,000-year-old Irish festival that became Halloween.' } },

  { day: 27, week: 4, title: 'Music and dancing', grammar: 'Mixed tenses · likes & culture',
    nugget: { title: 'Trad music & the bodhrán', text: 'Irish “trad” music is played in informal groups called sessions. The bodhrán (say “BOW-rawn”) is a hand drum made of goatskin — the heartbeat of the music.' },
    seedMessage: 'Tonight I am going to a “session” — friends bring instruments to the pub and just play. There is a drum called a bodhrán. Last week I tried to play it and I was terrible! But I laughed all night. Do you like to dance or sing?',
    seedQuestions: [{ q: 'Do you like music? What do you listen to?', model: 'I love music. I usually listen to Spanish pop and some old rock.' }, { q: 'When did you last dance or sing? Tell me.', model: 'Last summer I danced at a wedding until three in the morning!' }],
    diary: ['Last week I…', 'Today I listen to…', 'Tonight I will…'],
    unlock: { emoji: '🥁', place: 'The bodhrán', fact: 'The goatskin hand-drum at the heart of Irish “trad” music.' } },

  { day: 28, week: 4, title: 'Look how far you’ve come', grammar: 'Present perfect · a gentle first taste',
    nugget: { title: '“Grá” & “sláinte”', text: '“Grá” means love — the Irish use it for people, places, even a good cup of tea. Two little words to keep: grá (love) and sláinte (cheers/health).' },
    seedMessage: 'Miriam, look! You have spoken English every day for almost a month. You have learned about my whole country. You have not given up. I am so proud. In Irish we say “grá” (say “graw”) — it means love. I send you grá from Dublin! What have you learned about yourself?',
    seedQuestions: [{ q: 'What have you learned about yourself this month?', model: 'I have learned that I can do a little every day, and that it works.' }, { q: 'How do you feel about speaking English now, compared to day 1?', model: 'On day 1 I was nervous. Now I feel calmer and I speak more freely.' }],
    diary: ['This month I have…', 'Today I feel…', 'Next I will…'],
    unlock: { emoji: '❤️', place: 'Grá', fact: 'The Irish word for love — for people, places and a good cup of tea.' } },

  { day: 29, week: 4, title: 'Your month — a little talk', grammar: 'Monologue · put it all together',
    nugget: { title: 'Newgrange', text: 'A 5,000-year-old tomb in Ireland — older than Stonehenge and the pyramids. Once a year, at winter sunrise, a beam of light fills its inner room.' },
    seedMessage: 'Tomorrow is our last day! So today, a challenge: talk to me for one minute about your month. What you did, how you feel now, what you will do next. Past, present, future — all together. You can do this. I believe in you completely.',
    seedQuestions: [{ q: 'Talk for ONE MINUTE about your month. Past, present, future.', model: 'This month I started a challenge with Aoife. Every day I spoke English and learned about Ireland. At first I was shy, but now I feel confident. Next, I will keep speaking every day. I’m proud of myself.' }, { q: 'What would you say to Aoife to thank her?', model: 'Thank you, Aoife. You made English feel like a friend, not an exam.' }],
    diary: ['This month I…', 'Right now I…', 'From tomorrow I will…'],
    unlock: { emoji: '🌅', place: 'Newgrange', fact: 'A 5,000-year-old tomb, older than the pyramids, lit by the winter sun.' } },

  { day: 30, week: 4, title: 'Slán go fóill — goodbye for now', grammar: 'Celebrate · day 1 vs day 30',
    nugget: { title: 'You toured Ireland', text: 'Look at your map — 30 places, from Dublin to the wild Atlantic, its stories, food and words. You didn’t just practise English. You made a friend and travelled a country, ten minutes at a time.' },
    seedMessage: 'You did it, Miriam. Thirty days. You started shy and now you speak freely. You will keep this forever. One last thing: find your very first recording from Day 1, and record yourself now, today. Listen to both. Hear how far you have travelled. “Slán go fóill” — goodbye for now. With grá, Aoife.',
    seedQuestions: [{ q: 'Record the SAME first answer from Day 1 (about yourself). Then listen to both. What’s different?', model: 'On Day 1 I spoke slowly and stopped a lot. Today I speak faster and I don’t panic. I can hear the difference!' }, { q: 'What will you do now to keep your English alive?', model: 'I will keep a little diary in English and speak out loud for five minutes a day.' }],
    diary: ['30 days ago I…', 'Today I…', 'From now on I will…'],
    unlock: { emoji: '🏆', place: 'You did it!', fact: '30 days, 30 places, one whole country — and a stronger, braver voice.' } },
]

export function spineDay(day: number): SpineDay {
  const d = SPINE.find((x) => x.day === day)
  return d ?? SPINE[SPINE.length - 1]
}

export const TOTAL_DAYS = SPINE.length
