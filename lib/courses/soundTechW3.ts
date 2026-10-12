import type { Activity } from './soundTech'

const TF = ['True', 'False']

// Week 3 · Working with people
export const W3: Activity[] = [
  {
    id: 'w3-words', week: 3, skill: 'words', no: 1, title: 'Words: the crew', time: '20 min',
    blurb: 'The words of a real production: the schedule, the documents and the people.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Match the word to its meaning', how: 'Tap a word, then its meaning.',
        gloss: ['montaje / carga', 'rider técnico', 'lista de canales', 'orden de actuación', 'equipo técnico', 'cabeza de cartel', 'teloneros', 'tapones para los oídos'],
        options: [
          'the people who work behind the scenes at a show',
          'small things you put in your ears to protect them from loud sound',
          'the main band at a concert, which plays last',
          'a document that lists everything a band needs for a show',
          'the time when the team brings the equipment into the venue',
          'a band that plays before the main band',
          'a list that says which microphone or instrument goes into which channel',
          'the plan that says who plays and at what time',
        ],
        items: [
          { id: 'a1', kind: 'match', q: 'load-in', answer: 4 },
          { id: 'a2', kind: 'match', q: 'rider', answer: 3 },
          { id: 'a3', kind: 'match', q: 'input list', answer: 6 },
          { id: 'a4', kind: 'match', q: 'running order', answer: 7 },
          { id: 'a5', kind: 'match', q: 'crew', answer: 0 },
          { id: 'a6', kind: 'match', q: 'headliner', answer: 2 },
          { id: 'a7', kind: 'match', q: 'support act', answer: 5 },
          { id: 'a8', kind: 'match', q: 'earplugs', answer: 1 },
        ],
        es: 'El "rider" es el documento técnico con lo que pide un grupo (micrófonos, monitores, etc.). Crew es un nombre colectivo: "the crew are tired" (británico) o "the crew is tired" (también se oye).',
      },
      {
        id: 'B', title: 'Exercise B · Complete the sentences', how: 'Use each word from Exercise A once.',
        bank: ['headliner', 'rider', 'input list', 'crew', 'support act', 'load-in', 'earplugs', 'running order'],
        items: [
          { id: 'b1', kind: 'gap', before: 'The', after: 'says the second band plays at nine thirty.', answers: ['running order'] },
          { id: 'b2', kind: 'gap', before: 'Read the', after: 'carefully: the band needs six microphones and a keyboard.', answers: ['rider'] },
          { id: 'b3', kind: 'gap', before: 'Check the', after: 'to see what is plugged into channel five.', answers: ['input list'] },
          { id: 'b4', kind: 'gap', before: 'The whole', after: 'meets at the loading bay at seven.', answers: ['crew'] },
          { id: 'b5', kind: 'gap', before: 'The', after: 'plays for thirty minutes, and then the main band comes on.', answers: ['support act'] },
          { id: 'b6', kind: 'gap', before: 'The', after: 'starts at seven in the morning, so bring coffee.', answers: ['load-in', 'load in', 'loadin'] },
          { id: 'b7', kind: 'gap', before: 'Wear', after: 'near the speakers to protect your ears.', answers: ['earplugs', 'ear plugs'] },
          { id: 'b8', kind: 'gap', before: 'Everybody came to see the', after: ', the most famous band of the night.', answers: ['headliner'] },
        ],
        es: 'Fíjate en los artículos: the running order, the rider, the crew (con the, porque son cosas concretas). "Wear earplugs" no lleva artículo.',
      },
    ],
  },
  {
    id: 'w3-grammar', week: 3, skill: 'grammar', no: 2, title: 'Grammar: polite and safe', time: '20 min',
    blurb: 'Polite requests, safety rules (must, mustn\'t, have to) and prepositions of time.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Polite requests', how: 'Choose the polite way to say it.',
        items: [
          { id: 'a1', kind: 'choice', q: 'Ask a colleague to help you carry a speaker.', options: ['You help me carry speaker?', 'Do you can help me carry this speaker?', 'Could you help me carry this speaker, please?'], answer: 2 },
          { id: 'a2', kind: 'choice', q: 'Ask if it is possible to park near the entrance.', options: ['Is possible to park near the entrance?', 'Would it be possible to park near the entrance?', 'I park near the entrance?'], answer: 1 },
          { id: 'a3', kind: 'choice', q: 'Ask someone to repeat a number.', options: ['Sorry, could you say that again, please?', 'Sorry, you repeat?', 'Sorry, say again.'], answer: 0 },
          { id: 'a4', kind: 'choice', q: 'Say politely that you do not understand.', options: ['I no understand.', 'I am not understanding.', 'Sorry, I don\'t follow. Could you explain?'], answer: 2 },
          { id: 'a5', kind: 'choice', q: 'Ask someone politely to turn down the volume.', options: ['Would you mind turn down the volume?', 'Would you mind turning down the volume?', 'Would you mind to turn down the volume?'], answer: 1 },
        ],
        es: 'Could you + verbo base (Could you help me?). Would you mind + verbo en -ing (Would you mind turning...?). Would it be possible to + verbo base. En un trabajo, "Please" y "Sorry, could you..." hacen que todo suene profesional.',
      },
      {
        id: 'B', title: 'Exercise B · Must, mustn\'t, have to, don\'t have to', how: 'Choose from the box. Sometimes two answers are correct: write one.',
        bank: ['must', 'mustn\'t', 'have to', 'don\'t have to'],
        items: [
          { id: 'b1', kind: 'gap', before: 'You', after: 'wear earplugs near the speakers. It is a safety rule.', answers: ['must', 'have to'] },
          { id: 'b2', kind: 'gap', before: 'You', after: 'touch the power cables with wet hands.', answers: ['mustn\'t', 'must not', 'mustnt'] },
          { id: 'b3', kind: 'gap', before: 'You', after: 'bring your own cables. The venue has plenty.', answers: ['don\'t have to', 'do not have to', 'dont have to'] },
          { id: 'b4', kind: 'gap', before: 'Visitors', after: 'go on the stage without permission.', answers: ['mustn\'t', 'must not', 'mustnt'] },
          { id: 'b5', kind: 'gap', before: 'We', after: 'finish the soundcheck by six, because the doors open at seven.', answers: ['have to', 'must'] },
          { id: 'b6', kind: 'gap', before: 'You', after: 'wear a suit. Jeans are fine.', answers: ['don\'t have to', 'do not have to', 'dont have to'] },
        ],
        es: 'Atención: mustn\'t = prohibido (no puedes). Don\'t have to = no es necesario (no hace falta), pero puedes. Son muy distintos. "Must" y "have to" son casi iguales para obligación.',
      },
      {
        id: 'C', title: 'Exercise C · At, on or in?', how: 'Choose from the box. You can use a word more than once.',
        bank: ['at', 'on', 'in'],
        items: [
          { id: 'c1', kind: 'gap', before: 'Load-in starts', after: 'seven thirty.', answers: ['at'] },
          { id: 'c2', kind: 'gap', before: 'The concert is', after: 'Saturday.', answers: ['on'] },
          { id: 'c3', kind: 'gap', before: 'We always do the soundcheck', after: 'the afternoon.', answers: ['in'] },
          { id: 'c4', kind: 'gap', before: 'The venue opens', after: '1 November.', answers: ['on'] },
          { id: 'c5', kind: 'gap', before: 'I will be there', after: 'half past six.', answers: ['at'] },
          { id: 'c6', kind: 'gap', before: 'The festival is', after: 'June.', answers: ['in'] },
        ],
        es: 'at + hora (at seven) · on + día o fecha (on Saturday, on 1 November) · in + parte del día, mes, año (in the afternoon, in June).',
      },
    ],
  },
  {
    id: 'w3-reading', week: 3, skill: 'reading', no: 3, title: 'Reading: two texts', time: '25 min',
    blurb: 'Text 1: information for visiting crews. Text 2: an intern\'s diary from her first week.',
    texts: [
      {
        id: 't1', title: 'Text 1 · Information for visiting crews',
        paragraphs: [
          'Load-in is through the yellow door at the back of the building, not through the main entrance. Please arrive between 8.00 and 9.00. A member of our staff will meet you and show you the stage. Vehicles may stay in the loading bay for one hour only. After that, please move them to the car park in the next street.',
          'Safety is important. All crew members must wear shoes that cover the toes. Hard hats are necessary only when you are working above the stage. Please do not leave cables across walkways: use tape or cable covers. Smoking is not allowed anywhere inside the building.',
          'The hall has a house system with eight microphones, four monitors and a digital mixing desk. Visiting engineers do not have to bring their own desk, but they can if they prefer. Please tell us in advance, so that we can reserve space at front of house. Wi-Fi is free: the password is on the board in the production office. The canteen is open from 12.00 to 14.00.',
        ],
      },
      {
        id: 't2', title: 'Text 2 · My first week in Bratislava',
        paragraphs: [
          'Monday. I arrived at the Sound Centre at eight fifteen. A man called Jakub showed me the studios. Everybody speaks English, but the technicians also speak Slovak among themselves, so at first I understood nothing! I have to wear an ID badge all the time.',
          'Tuesday. I sat with Eva, a senior technician, and watched a live radio programme. She didn\'t talk much, she just did her job. At lunch she told me: "Don\'t be afraid to ask questions. Everybody here was a beginner once."',
          'Wednesday. I learned to set up microphones for a small orchestra. It took two hours and I only made two mistakes. Eva said that was a good start.',
          'Thursday. We had a fire drill, and I had to stand outside in the cold for twenty minutes.',
          'Friday. Eva asked me to check the cables in studio 3. I found one cable with a broken plug and she said, "Well done: that one would have ruined a recording." I went home very tired and very happy.',
        ],
      },
    ],
    exercises: [
      {
        id: 'A', title: 'Exercise A · Text 1: choose the best answer', how: 'Read Text 1. One answer for each question.', text: 't1',
        items: [
          { id: 'a1', kind: 'choice', q: 'How should crews enter the building for load-in?', options: ['Through the main entrance.', 'Through the car park.', 'Through the yellow door at the back.'], answer: 2 },
          { id: 'a2', kind: 'choice', q: 'How long can vehicles stay in the loading bay?', options: ['Ten minutes.', 'One hour.', 'All day.'], answer: 1 },
          { id: 'a3', kind: 'choice', q: 'When are hard hats necessary?', options: ['Only when working above the stage.', 'Always.', 'Never.'], answer: 0 },
          { id: 'a4', kind: 'choice', q: 'What do visiting engineers not have to do?', options: ['Wear shoes that cover the toes.', 'Bring their own mixing desk.', 'Move their vehicles after one hour.'], answer: 1 },
          { id: 'a5', kind: 'choice', q: 'Where is the Wi-Fi password?', options: ['On the board in the production office.', 'In the canteen.', 'On the yellow door.'], answer: 0 },
        ],
        es: 'La pregunta 4 mezcla must y don\'t have to: el texto dice "do not have to bring their own desk" (no hace falta), mientras que las otras dos cosas sí son obligatorias.',
      },
      {
        id: 'B', title: 'Exercise B · Text 2: true or false?', how: 'Read Text 2. Is each sentence true or false?', text: 't2',
        items: [
          { id: 'b1', kind: 'choice', q: 'Carla arrived at the Sound Centre at eight fifteen.', options: TF, answer: 0 },
          { id: 'b2', kind: 'choice', q: 'Everybody at the centre speaks only Slovak.', options: TF, answer: 1 },
          { id: 'b3', kind: 'choice', q: 'She has to wear an ID badge all the time.', options: TF, answer: 0 },
          { id: 'b4', kind: 'choice', q: 'On Tuesday, Eva talked a lot.', options: TF, answer: 1 },
          { id: 'b5', kind: 'choice', q: 'It took Carla four hours to set up the microphones.', options: TF, answer: 1 },
          { id: 'b6', kind: 'choice', q: 'Thursday was a day off.', options: TF, answer: 1 },
          { id: 'b7', kind: 'choice', q: 'They had a fire drill on Thursday.', options: TF, answer: 0 },
          { id: 'b8', kind: 'choice', q: 'Carla found a faulty cable on Friday.', options: TF, answer: 0 },
        ],
        es: 'Cuidado con las cifras y los días: "two hours" (no four), "Thursday" tuvo un simulacro de incendio (no fue un día libre).',
      },
    ],
  },
  {
    id: 'w3-listening', week: 3, skill: 'listening', no: 4, title: 'Listening: three speakers', time: '25 min',
    blurb: 'A call from the production office, a safety talk and a request from a band manager.',
    tracks: [
      {
        id: 'k1', title: 'Speaker 1 · Eva, production office', intro: 'Eva phones a visiting engineer about Saturday.', src: '/courses/sound-tech-english/audio/w3-k1.mp3',
        script: [
          { who: 'Eva', text: 'Hello, it is Eva from the production office. I am calling about Saturday. Load-in is at eight, through the yellow door at the back. Your van can stay in the loading bay for one hour. The soundcheck is at four o\'clock, and the doors open at seven. The headliner goes on at nine fifteen. If you need the Wi-Fi, ask me for the password.' },
        ],
      },
      {
        id: 'k2', title: 'Speaker 2 · The safety officer', intro: 'A safety officer talks to a new crew before the show.', src: '/courses/sound-tech-english/audio/w3-k2.mp3',
        script: [
          { who: 'Officer', text: 'Before we begin, a few safety rules. First, earplugs: you must wear them when you are standing near the front speakers. I have a box here, and they are free. Second, you mustn\'t leave cables across the floor. Use tape. Third, if the fire alarm rings, you don\'t have to collect your equipment: leave immediately by the nearest exit. The meeting point is the car park. Finally, if you have an accident, even a small one, tell me at once.' },
        ],
      },
      {
        id: 'k3', title: 'Speaker 3 · Peter, a band manager', intro: 'Peter leaves a voice message for the sound engineer.', src: '/courses/sound-tech-english/audio/w3-k3.mp3',
        script: [
          { who: 'Peter', text: 'Hi Ivan, it is Peter, the band\'s manager. Sorry to bother you. Would you mind changing the running order? The support act\'s van is stuck in traffic, so they cannot arrive before eight. Could you ask the headliner to play first instead? Only for thirty minutes. Then the support act can play second. Oh, and could you ask the bar to stay open until one? Thanks so much. You are a star.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'A', track: 'k1', title: 'Questions 1 to 4 · Complete the notes', how: 'Write one word or number for each gap.',
        items: [
          { id: 'a1', kind: 'gap', before: 'Load-in is at', after: '.', answers: ['eight', '8', '8.00', '8:00', '8 o\'clock', 'eight o\'clock'] },
          { id: 'a2', kind: 'gap', before: 'The van can stay in the loading bay for', after: '.', answers: ['one hour', 'an hour', '1 hour', 'one hr', '60 minutes', 'sixty minutes'] },
          { id: 'a3', kind: 'gap', before: 'The soundcheck is at', after: '.', answers: ['four', '4', '4.00', '4:00', '4 o\'clock', 'four o\'clock'] },
          { id: 'a4', kind: 'gap', before: 'The headliner goes on at', after: '.', answers: ['nine fifteen', '9.15', '9:15', 'quarter past nine', 'a quarter past nine', '9 15'] },
        ],
        es: 'Las horas: nine fifteen = 9.15 = a quarter past nine. Puedes escribirlas de cualquiera de estas formas.',
      },
      {
        id: 'B', track: 'k2', title: 'Questions 5 to 8 · Choose the best answer', how: 'One answer for each question.',
        items: [
          { id: 'b1', kind: 'choice', q: 'When must you wear earplugs?', options: ['Only on the stage.', 'Near the front speakers.', 'Never.'], answer: 1 },
          { id: 'b2', kind: 'choice', q: 'What must you do with cables?', options: ['Leave them in the corridor.', 'Hide them in the van.', 'Not leave them across the floor, and use tape.'], answer: 2 },
          { id: 'b3', kind: 'choice', q: 'If the fire alarm rings, what don\'t you have to do?', options: ['Leave quickly.', 'Go to the car park.', 'Collect your equipment.'], answer: 2 },
          { id: 'b4', kind: 'choice', q: 'What should you do after a small accident?', options: ['Forget about it.', 'Tell the safety officer at once.', 'Ask a friend.'], answer: 1 },
        ],
        es: '"You don\'t have to collect your equipment" = no hace falta que recojas tu equipo: salir es lo importante. Es justo el contraste entre mustn\'t y don\'t have to.',
      },
      {
        id: 'C', track: 'k3', title: 'Questions 9 to 12 · Choose the best answer', how: 'One answer for each question.',
        items: [
          { id: 'c1', kind: 'choice', q: 'Why is the running order changing?', options: ['The headliner is ill.', 'The stage is not ready.', 'The support act\'s van is stuck in traffic.'], answer: 2 },
          { id: 'c2', kind: 'choice', q: 'Who will play first?', options: ['The headliner.', 'The support act.', 'A DJ.'], answer: 0 },
          { id: 'c3', kind: 'choice', q: 'How long will they play first?', options: ['One hour.', 'Thirty minutes.', 'Fifteen minutes.'], answer: 1 },
          { id: 'c4', kind: 'choice', q: 'What else does Peter ask for?', options: ['A new microphone.', 'Earplugs.', 'For the bar to stay open until one.'], answer: 2 },
        ],
        es: 'Peter usa muchas peticiones educadas: "Would you mind changing...?", "Could you ask...?". Las has practicado en Grammar A.',
      },
    ],
  },
  {
    id: 'w3-writing', week: 3, skill: 'writing', no: 5, title: 'Writing: a polite email', time: '30 min',
    blurb: 'About 100 words. Write to the manager of a venue.',
    exercises: [],
    free: [
      {
        id: 'W', title: 'Writing · An email to a venue manager', minWords: 90,
        how: 'You are going to work at a venue in Bratislava. Write an email of about 100 words to the manager, Mr Novák. Introduce yourself in one sentence. Then ask three polite questions: what time load-in is, whether the venue has a mixing desk and monitors, and what safety rules you must follow. Finish by saying one thing you can do.',
        prompts: ['Your email'],
        model: 'Dear Mr Novák,\nMy name is Ivan, and I am a sound technician from Valencia. I am going to work at your venue next month.\nCould you tell me what time load-in is on the first day? Also, would it be possible to know if the venue has a mixing desk and monitors, or if I have to bring my own? Finally, could you tell me what safety rules I must follow?\nI have two years of experience with live sound, and I can set up a small stage on my own.\nThank you very much for your help.\nBest wishes,\nIvan',
      },
    ],
  },
]
