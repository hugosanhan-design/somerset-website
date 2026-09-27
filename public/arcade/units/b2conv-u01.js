// b2conv-u01 — Somerset Pursuit: Spain & Valencia general knowledge.
// Built 25 Sep 2026 for the B2 Conversación Wednesday adults group (18:45-20:15).
// Trivial-Pursuit-style board game. Questions and answers are in English;
// the subject matter is real, verifiable Spanish/Valencian general
// knowledge and culture, calibrated for a B2-level adult learner (not
// trivia-nerd hard, not childish) — history, geography, people, science
// and curiosities, food and customs, film/music/sport. Every category
// carries at least one Valencia-specific fact alongside broader
// Spain-wide ones. Facts checked against standard, uncontested reference
// knowledge (dates, names, places) — nothing invented.
//
// Schema note: this unit adds a `pursuit` block (six categories, each
// with its own `questions` array of {q,a} pairs) read directly by
// Game.pursuit() in index.html — see the README's "Somerset Pursuit"
// section. The same 48 questions are also flattened into the ordinary
// top-level `questions` array (topic-tagged per category id) so that
// if a teacher opens one of the other eleven games on this unit by
// mistake, they still get real content instead of an empty board.
window.SOMERSET_UNITS = window.SOMERSET_UNITS || {};

const B2CONV_CATEGORIES = [
 {
  id: "historia", label: "Historia", short: "History", colour: "#1C4E9C",
  questions: [
   {q: "In which century did the Moors first invade the Iberian Peninsula?", a: "the 8th century (711 AD)"},
   {q: "Which two Catholic Monarchs married in 1469 and went on to unite Spain?", a: "Isabella I of Castile and Ferdinand II of Aragon"},
   {q: "In what year did Christopher Columbus, sailing from Spain, first reach the Americas?", a: "1492"},
   {q: "Who was the dictator who ruled Spain from the end of the Civil War in 1939 until 1975?", a: "Francisco Franco"},
   {q: "Which king reconquered the city of Valencia from the Moors in 1238?", a: "King James I of Aragon (Jaume I)"},
   {q: "What is Spain's transition from dictatorship to democracy after 1975 usually called?", a: "la Transición (the Transition)"},
   {q: "In what year did Spain join the European Economic Community (now the EU)?", a: "1986"},
   {q: "Which ancient civilisation built the famous aqueduct still standing in Segovia?", a: "the Romans"}
  ]
 },
 {
  id: "geografia", label: "Geografía y naturaleza", short: "Geography & nature", colour: "#3F7D52",
  questions: [
   {q: "What is the longest river in Spain?", a: "the Tagus (Tajo)"},
   {q: "Which mountain range forms the natural border between Spain and France?", a: "the Pyrenees"},
   {q: "What is the name of the large freshwater wetland and rice-growing area just south of Valencia city?", a: "la Albufera"},
   {q: "Which two island groups belong to Spain?", a: "the Balearic Islands and the Canary Islands"},
   {q: "What is Spain's highest peak, a volcano on the island of Tenerife?", a: "Mount Teide"},
   {q: "Which sea lies along the eastern coast of Spain, off Valencia?", a: "the Mediterranean Sea"},
   {q: "What is the capital city of the Valencian Community?", a: "Valencia"},
   {q: "Which Spanish region, in the north, is most famous for its Rioja wine?", a: "La Rioja"}
  ]
 },
 {
  id: "gente", label: "Gente y personajes", short: "People & figures", colour: "#D9A02B",
  questions: [
   {q: "Which Spanish artist painted \"Guernica\", a famous anti-war mural?", a: "Pablo Picasso"},
   {q: "Which Spanish tennis player, from Manacor, Mallorca, is nicknamed \"the King of Clay\"?", a: "Rafael Nadal"},
   {q: "What was the name of the medieval Castilian knight known as \"El Cid\"?", a: "Rodrigo Díaz de Vivar"},
   {q: "Which Spanish surrealist painter is famous for melting clocks in his work?", a: "Salvador Dalí"},
   {q: "Who is the current King of Spain?", a: "King Felipe VI"},
   {q: "Which Spanish chef, of the former restaurant El Bulli near Girona, has repeatedly been named among the world's best?", a: "Ferran Adrià"},
   {q: "Who wrote \"Don Quixote\", often called the first modern novel?", a: "Miguel de Cervantes"},
   {q: "Which Valencian-born architect designed the City of Arts and Sciences in Valencia?", a: "Santiago Calatrava"}
  ]
 },
 {
  id: "ciencia", label: "Ciencia y curiosidades", short: "Science & curiosities", colour: "#6B3FA0",
  questions: [
   {q: "What world-famous rice dish was traditionally cooked by farm workers near the Albufera, Valencia?", a: "paella"},
   {q: "Which Spanish scientist won the 1906 Nobel Prize for his work on the nervous system?", a: "Santiago Ramón y Cajal"},
   {q: "What is the name of the giant tomato-throwing festival held every August in Buñol, near Valencia?", a: "La Tomatina"},
   {q: "Spain is the world's largest producer of which food product, pressed from an olive?", a: "olive oil"},
   {q: "What is the name of Spain's high-speed train network?", a: "AVE (Alta Velocidad Española)"},
   {q: "In Las Fallas, Valencia's biggest festival, what happens to the giant sculptures (ninots) on the final night?", a: "they are burnt, in a ceremony called la cremà"},
   {q: "What is the Spanish word for the traditional after-lunch rest or nap?", a: "siesta"},
   {q: "Which Canary Island had a major volcanic eruption in 2021 that destroyed hundreds of homes?", a: "La Palma (the Cumbre Vieja volcano)"}
  ]
 },
 {
  id: "comida", label: "Comida y costumbres", short: "Food & customs", colour: "#C1592B",
  questions: [
   {q: "Name two of the traditional meats in an authentic Valencian paella.", a: "chicken and rabbit (with rice and beans)"},
   {q: "What are the small savoury dishes, often eaten standing at a bar, that are central to Spanish social eating called?", a: "tapas"},
   {q: "What is the name of the cold tomato-based soup, popular especially in the south of Spain in summer?", a: "gazpacho"},
   {q: "Roughly what time do people in Spain traditionally eat their main midday meal?", a: "around 2 to 3 pm"},
   {q: "The traditional Valencian drink horchata (orxata) is made from what plant tuber?", a: "the tiger nut (chufa)"},
   {q: "What Spanish New Year's Eve tradition involves eating one grape on each of the twelve midnight clock chimes?", a: "las doce uvas (the twelve grapes)"},
   {q: "What is the name of the traditional Valencian Easter pastry, often round with a boiled egg baked into the centre?", a: "the mona de Pascua"},
   {q: "What drink is traditionally made from red wine, chopped fruit and a splash of brandy or soda?", a: "sangría"}
  ]
 },
 {
  id: "cine", label: "Cine, música y deporte", short: "Film, music & sport", colour: "#C9C4B8",
  questions: [
   {q: "Which Spanish film director made \"All About My Mother\" and \"Volver\"?", a: "Pedro Almodóvar"},
   {q: "Which Spanish football club has won the most UEFA Champions League titles?", a: "Real Madrid"},
   {q: "Which Valencian football club plays its home matches at the Mestalla stadium?", a: "Valencia CF"},
   {q: "Which Spanish singer, the son of Julio Iglesias, had global hits with \"Bailando\" and \"Hero\"?", a: "Enrique Iglesias"},
   {q: "\"Pilota Valenciana\" is Valencia's traditional local version of which kind of sport, played with a ball and bare hands?", a: "a handball-type sport"},
   {q: "Which Spanish Formula 1 driver won the World Championship in both 2005 and 2006?", a: "Fernando Alonso"},
   {q: "In what year did the Spanish men's national football team win its only FIFA World Cup so far?", a: "2010"},
   {q: "What is the name of the famous bull-running festival held every July in Pamplona?", a: "San Fermín"}
  ]
 }
];

window.SOMERSET_UNITS['b2conv-u01'] = {
 "id": "b2conv-u01",
 "title": "Somerset Pursuit — Spain & Valencia General Knowledge",
 "book": "Original content — general knowledge trivia (no coursebook)",
 "month": "Any week — recurring game",
 "group": "b2-conv",
 "colour": "#6BAE2E",
 "vocab": [],
 "cards": [],
 "pursuit": { "categories": B2CONV_CATEGORIES },
 "questions": B2CONV_CATEGORIES.flatMap(c => c.questions.map(q => ({
   "q": q.q, "a": q.a, "type": "say", "topic": c.id
 })))
};
