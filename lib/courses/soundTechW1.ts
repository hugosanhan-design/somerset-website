import type { Activity } from './soundTech'

const TF = ['True', 'False']

// Week 1 · Kit and signal path
export const W1: Activity[] = [
  {
    id: 'w1-words', week: 1, skill: 'words', no: 1, title: 'Words: the kit', time: '20 min',
    blurb: 'The names of the equipment you use every day, and the verbs that go with them.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Match the word to its meaning', how: 'Tap a word, then its meaning.',
        gloss: ['mesa de mezclas', 'deslizador de volumen', 'ganancia (nivel de entrada)', 'cable XLR', 'caja de escenario', 'monitor de escenario', 'caja DI (inyección directa)', 'canal'],
        options: [
          'one input on the mixing desk, for one microphone or instrument',
          'a slider that makes a channel louder or quieter',
          'a speaker that points at the performers so they can hear themselves',
          'the machine where you control and combine all the sounds',
          'a box on the stage where the cables from the microphones plug in',
          'how strongly the signal comes into the desk, before the fader',
          'a small box that connects a guitar or keyboard to the desk',
          'the usual cable that connects a microphone to the sound system',
        ],
        items: [
          { id: 'a1', kind: 'match', q: 'mixing desk', answer: 3 },
          { id: 'a2', kind: 'match', q: 'fader', answer: 1 },
          { id: 'a3', kind: 'match', q: 'gain', answer: 5 },
          { id: 'a4', kind: 'match', q: 'XLR cable', answer: 7 },
          { id: 'a5', kind: 'match', q: 'stage box', answer: 4 },
          { id: 'a6', kind: 'match', q: 'monitor', answer: 2 },
          { id: 'a7', kind: 'match', q: 'DI box', answer: 6 },
          { id: 'a8', kind: 'match', q: 'channel', answer: 0 },
        ],
        es: 'Gain y fader no son lo mismo: el gain (ganancia) ajusta cuánta señal entra en el canal; el fader sube o baja el volumen de ese canal en la mezcla. Un monitor es el altavoz que mira a los músicos; los altavoces para el público son "speakers". "Desk" y "console" se usan para la mesa de mezclas.',
      },
      {
        id: 'B', title: 'Exercise B · Complete the sentences', how: 'Use the words in the box. One word is not needed.',
        bank: ['fader', 'gain', 'monitor', 'stage box', 'channel', 'soundcheck', 'XLR cable', 'speakers', 'headphones'],
        items: [
          { id: 'b1', kind: 'gap', before: 'Before the show, the band does a', after: 'so that everything sounds right.', answers: ['soundcheck', 'sound check'] },
          { id: 'b2', kind: 'gap', before: 'The singer cannot hear herself, so I turn up the', after: 'that points at her.', answers: ['monitor'] },
          { id: 'b3', kind: 'gap', before: 'The signal is too weak. Turn up the', after: 'on that channel.', answers: ['gain'] },
          { id: 'b4', kind: 'gap', before: 'To make the guitar quieter in the mix, push the', after: 'down.', answers: ['fader'] },
          { id: 'b5', kind: 'gap', before: 'Connect the microphone to the stage box with an', after: '.', answers: ['XLR cable', 'XLR'] },
          { id: 'b6', kind: 'gap', before: 'Every microphone has its own', after: 'on the mixing desk.', answers: ['channel'] },
          { id: 'b7', kind: 'gap', before: 'The sound comes out of the', after: 'at the front of the stage.', answers: ['speakers', 'speaker'] },
          { id: 'b8', kind: 'gap', before: 'Wait! Nothing is plugged into the', after: 'yet.', answers: ['stage box'] },
        ],
        es: 'Un "soundcheck" es la prueba de sonido antes del concierto (sin "the": do a soundcheck). Fíjate en los artículos: an XLR cable (se lee "ex-el-ar", por eso "an").',
      },
      {
        id: 'C', title: 'Exercise C · Phrasal verbs of the stage', how: 'Choose from the box. Use each one once.',
        bank: ['set up', 'plug in', 'turn up', 'turn down', 'switch on', 'pack away'],
        items: [
          { id: 'c1', kind: 'gap', before: 'We arrive at two o\'clock to', after: 'the stage.', answers: ['set up'] },
          { id: 'c2', kind: 'gap', before: 'It is too loud. Please', after: 'the volume.', answers: ['turn down'] },
          { id: 'c3', kind: 'gap', before: 'I cannot hear the singer. Can you', after: 'her microphone?', answers: ['turn up'] },
          { id: 'c4', kind: 'gap', before: 'First,', after: 'the mixing desk, then the amplifiers.', answers: ['switch on'] },
          { id: 'c5', kind: 'gap', before: 'Where can I', after: 'this cable? I cannot see a socket.', answers: ['plug in'] },
          { id: 'c6', kind: 'gap', before: 'The concert is over. Now we', after: 'all the equipment.', answers: ['pack away'] },
        ],
        es: 'Los phrasal verbs de equipo: set up (montar), plug in (enchufar), switch on / switch off (encender / apagar), turn up / turn down (subir / bajar), pack away (recoger). Con un pronombre, el pronombre va en medio: switch it on, plug it in.',
      },
    ],
  },
  {
    id: 'w1-grammar', week: 1, skill: 'grammar', no: 2, title: 'Grammar: instructions', time: '20 min',
    blurb: 'Telling people what to do, in the right order, and where things are.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Give the instruction', how: 'Choose the correct instruction for each situation.',
        items: [
          { id: 'a1', kind: 'choice', q: 'Tell a colleague not to touch the fader.', options: ['Not touch the fader.', 'Don\'t touch the fader.', 'Don\'t touching the fader.'], answer: 1 },
          { id: 'a2', kind: 'choice', q: 'Tell a colleague to carry the speaker carefully.', options: ['Carry the speaker carefully.', 'Carry the speaker careful.', 'Carrying the speaker carefully.'], answer: 0 },
          { id: 'a3', kind: 'choice', q: 'Tell a colleague to be careful with the cable.', options: ['Careful be with the cable.', 'Are careful with the cable.', 'Be careful with the cable.'], answer: 2 },
          { id: 'a4', kind: 'choice', q: 'Ask the band to wait outside, politely.', options: ['Please to wait outside.', 'Please wait outside.', 'Please waiting outside.'], answer: 1 },
          { id: 'a5', kind: 'choice', q: 'Tell someone not to run on the stage.', options: ['Don\'t to run on the stage.', 'Not running on the stage.', 'Don\'t run on the stage.'], answer: 2 },
        ],
        es: 'La orden en inglés es el verbo base, sin "to" y sin sujeto: Plug it in. Para prohibir: Don\'t + verbo base (Don\'t touch). Se usa "Please" para suavizarla. No uses -ing ni "to".',
      },
      {
        id: 'B', title: 'Exercise B · First, then, after that', how: 'Choose the linking word for each instruction.',
        bank: ['Before', 'First', 'After that', 'until', 'Finally'],
        items: [
          { id: 'b1', kind: 'gap', before: '', after: 'you plug in a microphone, check the cable.', answers: ['before'] },
          { id: 'b2', kind: 'gap', before: '', after: ', put the stands in the right place.', answers: ['first'] },
          { id: 'b3', kind: 'gap', before: 'Plug in the microphones.', after: ', turn on the mixing desk.', answers: ['after that', 'then', 'next'] },
          { id: 'b4', kind: 'gap', before: 'Turn the gain up slowly', after: 'you can hear the singer clearly.', answers: ['until'] },
          { id: 'b5', kind: 'gap', before: '', after: ', do the soundcheck with the whole band.', answers: ['finally'] },
        ],
        es: 'Para ordenar pasos: First, Then / Next / After that, Finally. "Before" y "until" unen dos acciones: Check the cable before you plug it in (antes de) · Wait until I say "go" (hasta que).',
      },
      {
        id: 'C', title: 'Exercise C · Where does it go?', how: 'Choose the right word from the box.',
        bank: ['in front of', 'behind', 'next to', 'on', 'under', 'between'],
        items: [
          { id: 'c1', kind: 'gap', before: 'The drummer sits', after: 'the singer, at the back of the stage.', answers: ['behind'] },
          { id: 'c2', kind: 'gap', before: 'The monitor is', after: 'the floor, pointing at the singer.', answers: ['on'] },
          { id: 'c3', kind: 'gap', before: 'The cables run', after: 'the carpet, so nobody trips.', answers: ['under'] },
          { id: 'c4', kind: 'gap', before: 'The mixing desk is', after: 'the two speakers, in the middle.', answers: ['between'] },
          { id: 'c5', kind: 'gap', before: 'Put the keyboard', after: 'the guitar amplifier, on the left.', answers: ['next to'] },
          { id: 'c6', kind: 'gap', before: 'The singer stands', after: 'the band, close to the audience.', answers: ['in front of'] },
        ],
        es: 'in front of = delante de · behind = detrás de · next to = al lado de · between = entre (dos cosas) · on = encima, en contacto · under = debajo.',
      },
    ],
  },
  {
    id: 'w1-reading', week: 1, skill: 'reading', no: 3, title: 'Reading: two texts', time: '25 min',
    blurb: 'Text 1: how a sound travels from the singer to the audience. Text 2: a student\'s first festival job.',
    texts: [
      {
        id: 't1', title: 'Text 1 · From the singer to the audience',
        paragraphs: [
          'When a singer sings into a microphone, the microphone changes the sound into a small electric signal. This signal travels along an XLR cable to the stage box, a metal box at the side of the stage. From there, one long cable called a multicore carries the signals of all the microphones to the mixing desk. The desk is usually in the middle of the audience. This place is called front of house.',
          'At the desk, the engineer controls each channel. First, they set the gain, so the signal is strong enough. Then they use the fader to make the channel louder or quieter in the mix. They can also change the bass and the treble with the equaliser, or EQ.',
          'The mix then goes to the amplifiers, which make the signal much more powerful, and finally to the speakers. A second mix, the monitor mix, goes to the speakers on the stage, so the musicians can hear themselves.',
          '"The most important rule," says engineer Marta, "is to listen. The desk helps you, but your ears do the work."',
        ],
      },
      {
        id: 't2', title: 'Text 2 · Priya\'s first festival',
        paragraphs: [
          'Priya is nineteen and studies sound at a college in Bristol. Last summer she worked for the first time at a three-day music festival in Somerset, in the south-west of England. She arrived on Thursday, one day before the music started, and slept in a tent behind the main stage.',
          '"On the first day, I carried cables for six hours," she says. "I was very tired, but I learned the names of everything." On Friday the weather was perfect and about forty thousand people came. On Saturday it rained all morning, and the team had to cover the equipment with plastic sheets. "We lost ten minutes of music, but nothing broke," Priya says.',
          'Her favourite moment was the soundcheck of a famous band. "The engineer let me sit next to him at the desk. He didn\'t say much. He just listened, and sometimes he moved one fader a tiny bit."',
          'Next summer, Priya wants to work at a festival in another country. She is learning Spanish.',
        ],
      },
    ],
    exercises: [
      {
        id: 'A', title: 'Exercise A · Text 1: choose the best answer', how: 'Read Text 1. One answer for each question.', text: 't1',
        items: [
          { id: 'a1', kind: 'choice', q: 'What does a microphone do?', options: ['It changes sound into an electric signal.', 'It makes the sound louder.', 'It changes the bass and the treble.'], answer: 0 },
          { id: 'a2', kind: 'choice', q: 'Where is front of house usually?', options: ['Behind the stage.', 'Inside the stage box.', 'In the middle of the audience.'], answer: 2 },
          { id: 'a3', kind: 'choice', q: 'What does the engineer do first at the desk?', options: ['Move the fader.', 'Set the gain.', 'Change the EQ.'], answer: 1 },
          { id: 'a4', kind: 'choice', q: 'Why is there a monitor mix?', options: ['So the audience can hear the singer.', 'So the engineer can use headphones.', 'So the musicians can hear themselves.'], answer: 2 },
          { id: 'a5', kind: 'choice', q: 'What does Marta say is the most important rule?', options: ['Listen carefully.', 'Buy good equipment.', 'Always use the same settings.'], answer: 0 },
        ],
        es: 'Lee la pregunta primero y busca la respuesta en el texto, no en lo que ya sabes. Las otras opciones suelen usar palabras del texto, pero dicen otra cosa.',
      },
      {
        id: 'B', title: 'Exercise B · Text 2: true or false?', how: 'Read Text 2. Is each sentence true or false?', text: 't2',
        items: [
          { id: 'b1', kind: 'choice', q: 'Priya is a student.', options: TF, answer: 0 },
          { id: 'b2', kind: 'choice', q: 'Last summer was her first time at a festival as a worker.', options: TF, answer: 0 },
          { id: 'b3', kind: 'choice', q: 'She arrived on the same day the music started.', options: TF, answer: 1 },
          { id: 'b4', kind: 'choice', q: 'She slept in a hotel.', options: TF, answer: 1 },
          { id: 'b5', kind: 'choice', q: 'Rain stopped the music for about ten minutes on Saturday.', options: TF, answer: 0 },
          { id: 'b6', kind: 'choice', q: 'The engineer talked a lot during the soundcheck.', options: TF, answer: 1 },
          { id: 'b7', kind: 'choice', q: 'Priya wants to work in another country next summer.', options: TF, answer: 0 },
          { id: 'b8', kind: 'choice', q: 'She already speaks Spanish very well.', options: TF, answer: 1 },
        ],
        es: 'En true/false, una sola palabra cambia la frase: "the same day" (3) y "a hotel" (4) no coinciden con el texto. En la 8, el texto dice que "is learning" Spanish, no que lo hable muy bien.',
      },
    ],
  },
  {
    id: 'w1-listening', week: 1, skill: 'listening', no: 4, title: 'Listening: three speakers', time: '25 min',
    blurb: 'Three short messages, four questions each. Listen to each one twice.',
    tracks: [
      {
        id: 'k1', title: 'Speaker 1 · Tomás, stage manager', intro: 'Tomás leaves a voice message about tomorrow.', src: '/courses/sound-tech-english/audio/w1-k1.mp3',
        script: [
          { who: 'Tomás', text: 'Hi, this is Tomás from the Palau de les Arts. About tomorrow: we start load-in at half past seven, not eight. Please bring your own headphones and two XLR cables. Park in the loading bay behind the building. The gate code is four seven two nine. And remember: nobody can use the lifts before nine. See you tomorrow.' },
        ],
      },
      {
        id: 'k2', title: 'Speaker 2 · Marta, front-of-house engineer', intro: 'Marta talks to her new assistant before the soundcheck.', src: '/courses/sound-tech-english/audio/w1-k2.mp3',
        script: [
          { who: 'Marta', text: 'Right, a few things before we start. The desk is old, so be gentle with the faders. For the singer, start with the gain very low, because she sings loudly. Don\'t touch the red channel: that is the radio microphone for the presenter, and it must stay on at all times. If you hear a loud whistling noise, that is feedback. Don\'t panic. Just pull the fader down, and tell me.' },
        ],
      },
      {
        id: 'k3', title: 'Speaker 3 · Jakub, Bratislava Sound Centre', intro: 'Jakub leaves a message for a new intern.', src: '/courses/sound-tech-english/audio/w1-k3.mp3',
        script: [
          { who: 'Jakub', text: 'Hello Ivan, this is Jakub from the Bratislava Sound Centre. Welcome to the team! On your first day, come to the main entrance at eight fifteen, not at eight. Bring a passport or an identity card, because the security guard will check it. Wear comfortable shoes and a warm jacket, because the studio is cold. The first week is mostly observation: you will sit with a senior technician and learn the equipment. Your first live job will probably be in the second week.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'A', track: 'k1', title: 'Questions 1 to 4 · Complete the notes', how: 'Write one word or number for each gap.',
        items: [
          { id: 'a1', kind: 'gap', before: 'Load-in starts at', after: '.', answers: ['half past seven', '7.30', '7:30', 'seven thirty', 'half past 7', '7 30'] },
          { id: 'a2', kind: 'gap', before: 'Bring your own headphones and', after: 'XLR cables.', answers: ['two', '2'] },
          { id: 'a3', kind: 'gap', before: 'The gate code is', after: '.', answers: ['4729', 'four seven two nine', '4 7 2 9'] },
          { id: 'a4', kind: 'gap', before: 'Nobody can use the lifts before', after: '.', answers: ['nine', '9', '9.00', '9:00', '9 o\'clock', 'nine o\'clock'] },
        ],
        es: 'Escribe lo que oyes: la hora puede ir en cifras (7.30) o en letras (half past seven). El código es 4729.',
      },
      {
        id: 'B', track: 'k2', title: 'Questions 5 to 8 · Choose the best answer', how: 'One answer for each question.',
        items: [
          { id: 'b1', kind: 'choice', q: 'The desk is old, so Marta wants her assistant to', options: ['switch it off.', 'be gentle with the faders.', 'use the monitors.'], answer: 1 },
          { id: 'b2', kind: 'choice', q: 'For the singer, he should start with', options: ['high gain.', 'no gain.', 'low gain.'], answer: 2 },
          { id: 'b3', kind: 'choice', q: 'What is special about the red channel?', options: ['It is for the presenter\'s radio microphone.', 'It is broken.', 'It controls the monitors.'], answer: 0 },
          { id: 'b4', kind: 'choice', q: 'If there is a loud whistling noise, he should', options: ['turn up the gain.', 'switch off the desk.', 'pull the fader down and tell Marta.'], answer: 2 },
        ],
        es: 'El ruido agudo y silbante es feedback (acople). La solución rápida: bajar el fader y avisar.',
      },
      {
        id: 'C', track: 'k3', title: 'Questions 9 to 12 · Choose the best answer', how: 'One answer for each question.',
        items: [
          { id: 'c1', kind: 'choice', q: 'What time should Ivan arrive on the first day?', options: ['8.00', '8.30', '8.15'], answer: 2 },
          { id: 'c2', kind: 'choice', q: 'Why does he need a passport or identity card?', options: ['To sign the contract.', 'So the security guard can check it.', 'To open his locker.'], answer: 1 },
          { id: 'c3', kind: 'choice', q: 'Why should he bring a warm jacket?', options: ['The studio is cold.', 'It will rain.', 'The walk is long.'], answer: 0 },
          { id: 'c4', kind: 'choice', q: 'What will he do in the first week?', options: ['Run a live show.', 'Work alone.', 'Sit with a senior technician and learn the equipment.'], answer: 2 },
        ],
        es: 'Atención a las correcciones: "at eight fifteen, not at eight". El hablante dice las dos horas, pero solo una es la correcta.',
      },
    ],
  },
  {
    id: 'w1-writing', week: 1, skill: 'writing', no: 5, title: 'Writing: an email', time: '30 min',
    blurb: 'About 100 words. Explain a job to a new colleague.',
    exercises: [],
    free: [
      {
        id: 'W', title: 'Writing · Instructions for a new assistant', minWords: 90,
        how: 'On Saturday a new assistant, Carla, is going to help you with a concert. Write her an email of about 100 words. Say: what time to arrive, what to bring, how to set up one singer\'s microphone (use first, then, after that), and one thing she must not do.',
        prompts: ['Your email'],
        model: 'Dear Carla,\nThanks for helping me on Saturday. Please arrive at half past two and bring your headphones and a torch. First, put the microphone stand next to the monitor. Then plug the microphone into the stage box with an XLR cable. After that, ask me to turn up the gain slowly, and say "check, one, two" into the microphone. Please don\'t touch the red channel, because it is for the presenter. See you on Saturday!\nBest wishes,\nIvan',
      },
    ],
  },
]
