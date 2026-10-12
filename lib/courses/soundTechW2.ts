import type { Activity } from './soundTech'

const TF = ['True', 'False']

// Week 2 · When things go wrong
export const W2: Activity[] = [
  {
    id: 'w2-words', week: 2, skill: 'words', no: 1, title: 'Words: problems', time: '20 min',
    blurb: 'How to describe a sound problem so that everybody understands.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Match the word to its meaning', how: 'Tap a word, then its meaning.',
        gloss: ['zumbido', 'siseo', 'chasquidos', 'distorsión', 'corte de señal', 'sonido "embarrado"', 'eco', 'defectuoso'],
        options: [
          'the sound suddenly disappears for a moment',
          'a soft, continuous "sssh" noise',
          'not working correctly',
          'short, sharp noises, like a small fire',
          'a low, continuous noise, like a machine',
          'a sound you hear again a moment later',
          'rough and ugly, because the signal is too strong',
          'not clear, with too much low sound',
        ],
        items: [
          { id: 'a1', kind: 'match', q: 'hum', answer: 4 },
          { id: 'a2', kind: 'match', q: 'hiss', answer: 1 },
          { id: 'a3', kind: 'match', q: 'crackle', answer: 3 },
          { id: 'a4', kind: 'match', q: 'distortion', answer: 6 },
          { id: 'a5', kind: 'match', q: 'dropout', answer: 0 },
          { id: 'a6', kind: 'match', q: 'muddy', answer: 7 },
          { id: 'a7', kind: 'match', q: 'echo', answer: 5 },
          { id: 'a8', kind: 'match', q: 'faulty', answer: 2 },
        ],
        es: 'Hum es grave y continuo; hiss es agudo y suave. Distortion aparece cuando la señal es demasiado fuerte para el canal. "Muddy" se dice del sonido sin claridad, con demasiados graves.',
      },
      {
        id: 'B', title: 'Exercise B · Complete the sentences', how: 'Use each word from Exercise A once.',
        bank: ['hum', 'hiss', 'crackle', 'distortion', 'dropout', 'muddy', 'echo', 'faulty'],
        items: [
          { id: 'b1', kind: 'gap', before: 'The guitar is very', after: ': there is too much bass and I cannot hear the notes.', answers: ['muddy'] },
          { id: 'b2', kind: 'gap', before: 'There is a low', after: 'from the amplifier. Maybe the earth cable is loose.', answers: ['hum'] },
          { id: 'b3', kind: 'gap', before: 'The cable is', after: ': every time I move it, the sound stops.', answers: ['faulty'] },
          { id: 'b4', kind: 'gap', before: 'The singer was too loud for the channel and now there is', after: '.', answers: ['distortion'] },
          { id: 'b5', kind: 'gap', before: 'This old microphone has a lot of', after: ', even when nobody is speaking.', answers: ['hiss'] },
          { id: 'b6', kind: 'gap', before: 'In the empty church there was a big', after: ': every word came back twice.', answers: ['echo'] },
          { id: 'b7', kind: 'gap', before: 'Every few seconds there is a short', after: 'and the voice disappears.', answers: ['dropout'] },
          { id: 'b8', kind: 'gap', before: 'When you turn the volume knob, you can hear a', after: '.', answers: ['crackle'] },
        ],
        es: 'Estas palabras son nombres contables o incontables según el caso: a hum, a dropout (contables) pero distortion y hiss (a menudo incontables: there is some hiss).',
      },
      {
        id: 'C', title: 'Exercise C · Problem and cause', how: 'Choose the most likely cause.',
        items: [
          { id: 'c1', kind: 'choice', q: 'The sound is distorted. What is a possible cause?', options: ['The stage is too big.', 'The speaker is too far away.', 'The gain is too high.'], answer: 2 },
          { id: 'c2', kind: 'choice', q: 'There is a loud whistle from the speakers.', options: ['The cable is too long.', 'The microphone is too close to a speaker.', 'The battery is new.'], answer: 1 },
          { id: 'c3', kind: 'choice', q: 'A wireless microphone has dropouts.', options: ['The battery is low, or there is interference.', 'The fader is too high.', 'The speaker is on the floor.'], answer: 0 },
          { id: 'c4', kind: 'choice', q: 'There is a constant low hum.', options: ['The singer is too quiet.', 'The monitor is too loud.', 'There is a bad earth connection or a faulty cable.'], answer: 2 },
          { id: 'c5', kind: 'choice', q: 'The voice sounds muddy.', options: ['There is too much bass.', 'The gain is too low.', 'The stage is too hot.'], answer: 0 },
        ],
        es: 'Interference = interferencia (por ejemplo, otra señal de radio). Earth connection = conexión a tierra; un mal contacto a tierra suele producir hum.',
      },
    ],
  },
  {
    id: 'w2-grammar', week: 2, skill: 'grammar', no: 2, title: 'Grammar: causes and fixes', time: '20 min',
    blurb: 'Must, might and can\'t to guess the cause. If + present to say what will happen. Present perfect for a problem now.',
    exercises: [
      {
        id: 'A', title: 'Exercise A · Must, might or can\'t?', how: 'Choose the best modal verb.',
        items: [
          { id: 'a1', kind: 'choice', q: 'The red clip light is on, so the signal ___ too strong.', options: ['can\'t be', 'must be', 'isn\'t'], answer: 1 },
          { id: 'a2', kind: 'choice', q: 'There is no sound. The cable ___ be broken, or maybe the channel is muted. I am not sure.', options: ['must', 'might', 'can\'t'], answer: 1 },
          { id: 'a3', kind: 'choice', q: 'I checked that cable yesterday and it worked perfectly. It ___ be the problem.', options: ['must', 'might', 'can\'t'], answer: 2 },
          { id: 'a4', kind: 'choice', q: 'The level keeps changing and nobody is touching the fader. It ___ be a faulty fader. Let\'s check.', options: ['can\'t', 'might', 'mustn\'t'], answer: 1 },
          { id: 'a5', kind: 'choice', q: 'The battery is dead. That is why the microphone stopped. It ___ be the battery!', options: ['must', 'can\'t', 'needn\'t'], answer: 0 },
          { id: 'a6', kind: 'choice', q: 'The guitarist is playing very quietly, so the feedback ___ come from his amplifier.', options: ['must', 'has to', 'can\'t'], answer: 2 },
        ],
        es: 'Para deducir: must be (estoy casi seguro de que sí) · might be (quizás) · can\'t be (estoy casi seguro de que no). Cuidado: "mustn\'t" significa prohibido, no "no puede ser".',
      },
      {
        id: 'B', title: 'Exercise B · If + present, will + verb', how: 'Choose the correct form.',
        items: [
          { id: 'b1', kind: 'choice', q: 'If the microphone is too close to the speaker, you ___ feedback.', options: ['will get', 'would get', 'got'], answer: 0 },
          { id: 'b2', kind: 'choice', q: 'If the battery ___, we will change it.', options: ['will die', 'died', 'dies'], answer: 2 },
          { id: 'b3', kind: 'choice', q: 'If the desk breaks, we ___ the spare one.', options: ['use', 'will use', 'would use'], answer: 1 },
          { id: 'b4', kind: 'choice', q: 'What will you do if the power ___ out?', options: ['goes', 'will go', 'went'], answer: 0 },
          { id: 'b5', kind: 'choice', q: 'If I ___ the problem, I will call you.', options: ['won\'t find', 'don\'t find', 'didn\'t find'], answer: 1 },
          { id: 'b6', kind: 'choice', q: 'You ___ the speaker if you leave it in the rain.', options: ['would damage', 'damaged', 'will damage'], answer: 2 },
        ],
        es: 'Primer condicional: If + presente simple, will + verbo base. Nunca "if ... will" en la parte del if: If it rains (no "if it will rain").',
      },
      {
        id: 'C', title: 'Exercise C · Present perfect: a problem now', how: 'Put the verb in the present perfect. Write the full form (have lost, has stopped).',
        items: [
          { id: 'c1', kind: 'gap', before: 'I (lose)', after: 'the signal from the guitar.', answers: ['have lost', '\'ve lost'] },
          { id: 'c2', kind: 'gap', before: 'The singer (break)', after: 'her microphone.', answers: ['has broken', '\'s broken'] },
          { id: 'c3', kind: 'gap', before: 'The power (go)', after: 'out.', answers: ['has gone', '\'s gone'] },
          { id: 'c4', kind: 'gap', before: 'Someone (unplug)', after: 'the monitor.', answers: ['has unplugged', '\'s unplugged'] },
          { id: 'c5', kind: 'gap', before: 'We (not / find)', after: 'the problem yet.', answers: ['have not found', 'haven\'t found', '\'ve not found'] },
          { id: 'c6', kind: 'gap', before: 'The sound (stop)', after: 'again!', answers: ['has stopped', '\'s stopped'] },
        ],
        es: 'Present perfect = have / has + participio. Se usa cuando el pasado tiene un resultado ahora: "The cable has broken" (y ahora no funciona). Irregulares: lose-lost, break-broken, go-gone.',
      },
    ],
  },
  {
    id: 'w2-reading', week: 2, skill: 'reading', no: 3, title: 'Reading: two texts', time: '25 min',
    blurb: 'Text 1: a four-step guide for "no sound". Text 2: a bad night at a club in Bratislava.',
    texts: [
      {
        id: 't1', title: 'Text 1 · No sound? Four steps',
        paragraphs: [
          'When there is no sound, do not panic. Follow these four steps.',
          'Step 1: Look at the desk. Is the channel muted? Is the fader up? Is the gain too low? Most problems are here, and they take only a few seconds to fix.',
          'Step 2: Check the microphone. Is it switched on? If it is wireless, is the battery new? Try another microphone on the same cable.',
          'Step 3: Check the cable. Plug the same microphone into a different cable. Old cables often break near the plug, because people pull them. If the sound comes back, the first cable was faulty.',
          'Step 4: Check the speakers. Are they switched on? Is the amplifier connected? Is a red light showing?',
          'Always change only one thing at a time. If you change three things, you will never know which one was the problem.',
        ],
      },
      {
        id: 't2', title: 'Text 2 · A bad night in Bratislava',
        paragraphs: [
          'Lukáš is twenty-six and works at a small music club in the old town of Bratislava. Last winter, during a concert, all the lights went out and the speakers stopped. The room was full: about three hundred people.',
          '"First, I thought the desk was broken," Lukáš says. "But then I saw that all the equipment on the left side of the stage was off. It must be the power, I thought." He went to the electrical cupboard behind the bar and found that one switch had jumped. While he was fixing it, the singer started to sing without a microphone, and the audience sang with her.',
          'After four minutes, the sound came back. "Nobody left," Lukáš says. "The concert was even better after that." Now he always carries a torch and a spare cable. "And I always know where the electrical cupboard is before the show starts."',
        ],
      },
    ],
    exercises: [
      {
        id: 'A', title: 'Exercise A · Text 1: choose the best answer', how: 'Read Text 1. One answer for each question.', text: 't1',
        items: [
          { id: 'a1', kind: 'choice', q: 'What should you check first?', options: ['The desk.', 'The cable.', 'The amplifier.'], answer: 0 },
          { id: 'a2', kind: 'choice', q: 'What can you do if a wireless microphone does not work?', options: ['Move the speakers.', 'Buy a new desk.', 'Check the battery.'], answer: 2 },
          { id: 'a3', kind: 'choice', q: 'Why do old cables often break near the plug?', options: ['Because they are too long.', 'Because people pull them.', 'Because they get wet.'], answer: 1 },
          { id: 'a4', kind: 'choice', q: 'What does it mean if the sound comes back with a different cable?', options: ['The microphone is broken.', 'The desk is faulty.', 'The first cable was faulty.'], answer: 2 },
          { id: 'a5', kind: 'choice', q: 'Why should you change only one thing at a time?', options: ['You will know which change solved the problem.', 'It is faster.', 'It is safer for the equipment.'], answer: 0 },
        ],
        es: 'La pregunta 4 es una inferencia: el texto no lo dice con esas palabras, pero "If the sound comes back, the first cable was faulty" lo deja claro.',
      },
      {
        id: 'B', title: 'Exercise B · Text 2: true or false?', how: 'Read Text 2. Is each sentence true or false?', text: 't2',
        items: [
          { id: 'b1', kind: 'choice', q: 'Lukáš works at a club in Bratislava.', options: TF, answer: 0 },
          { id: 'b2', kind: 'choice', q: 'The problem happened in summer.', options: TF, answer: 1 },
          { id: 'b3', kind: 'choice', q: 'About three hundred people were in the club.', options: TF, answer: 0 },
          { id: 'b4', kind: 'choice', q: 'At first, Lukáš thought the desk was broken.', options: TF, answer: 0 },
          { id: 'b5', kind: 'choice', q: 'The electrical cupboard was on the stage.', options: TF, answer: 1 },
          { id: 'b6', kind: 'choice', q: 'The singer stopped singing when the power failed.', options: TF, answer: 1 },
          { id: 'b7', kind: 'choice', q: 'The sound came back after about four minutes.', options: TF, answer: 0 },
          { id: 'b8', kind: 'choice', q: 'Many people left the concert.', options: TF, answer: 1 },
        ],
        es: 'Fíjate en los datos concretos: "last winter" (no summer), "behind the bar" (no on the stage), "Nobody left". En true/false el detalle decide.',
      },
    ],
  },
  {
    id: 'w2-listening', week: 2, skill: 'listening', no: 4, title: 'Listening: three speakers', time: '25 min',
    blurb: 'A radio call during a concert, a message from a hire company, and a technician\'s story.',
    tracks: [
      {
        id: 'k1', title: 'Speaker 1 · Tomás, on the radio', intro: 'Tomás calls the front-of-house engineer during the soundcheck.', src: '/courses/sound-tech-english/audio/w2-k1.mp3',
        script: [
          { who: 'Tomás', text: 'Tomás to front of house. We have a problem with channel twelve, the bass guitar. There is a loud hum when the bass player touches the metal part of his guitar. I have changed the cable, but the hum is still there. I think it must be the DI box, so I am going to bring a spare one from the van. It is the black one. It will take about ten minutes. Meanwhile, can you start the soundcheck with the drums?' },
        ],
      },
      {
        id: 'k2', title: 'Speaker 2 · Elena, Sound Hire Valencia', intro: 'Elena leaves a voice message about an order.', src: '/courses/sound-tech-english/audio/w2-k2.mp3',
        script: [
          { who: 'Elena', text: 'Hello, this is Elena from Sound Hire Valencia. It is about your order for Saturday. Unfortunately, we have not got the wireless microphones you asked for. They are all booked. But we have wired ones, and we can deliver them on Friday afternoon at five. The price is the same. If you prefer to wait for the wireless ones, we will have them available the following week. Please call me back before noon tomorrow.' },
        ],
      },
      {
        id: 'k3', title: 'Speaker 3 · Dave, a sound engineer', intro: 'Dave tells a short story about a mistake.', src: '/courses/sound-tech-english/audio/w2-k3.mp3',
        script: [
          { who: 'Dave', text: 'Last month I made a stupid mistake. I plugged the guitar straight into the desk without a DI box, and the sound was thin and noisy. The singer looked at me and I wanted to disappear. So now I always check the input list before the soundcheck, and I keep a note on the desk to remind me. My advice is simple: if the sound is strange, do not blame the equipment first. Check what you have done.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'A', track: 'k1', title: 'Questions 1 to 4 · Complete the notes', how: 'Write one word or number for each gap.',
        items: [
          { id: 'a1', kind: 'gap', before: 'The problem is with channel', after: '.', answers: ['twelve', '12'] },
          { id: 'a2', kind: 'gap', before: 'The instrument is the', after: 'guitar.', answers: ['bass'] },
          { id: 'a3', kind: 'gap', before: 'Tomás will bring a spare DI box. The colour is', after: '.', answers: ['black'] },
          { id: 'a4', kind: 'gap', before: 'It will take about', after: 'minutes.', answers: ['ten', '10'] },
        ],
        es: 'Un número y una palabra por hueco. Escucha "twelve" (12) y "ten" (10): suenan parecido a "twenty" y "teen", fíjate en el final.',
      },
      {
        id: 'B', track: 'k2', title: 'Questions 5 to 8 · Choose the best answer', how: 'One answer for each question.',
        items: [
          { id: 'b1', kind: 'choice', q: 'What is the problem with the order?', options: ['The microphones are expensive.', 'Wireless microphones are not available.', 'The delivery is late.'], answer: 1 },
          { id: 'b2', kind: 'choice', q: 'When can they deliver the wired microphones?', options: ['Saturday morning.', 'Next week.', 'Friday afternoon.'], answer: 2 },
          { id: 'b3', kind: 'choice', q: 'What does Elena say about the price?', options: ['It is the same.', 'It is higher.', 'It is lower.'], answer: 0 },
          { id: 'b4', kind: 'choice', q: 'When should the customer call her back?', options: ['Tonight.', 'Before noon tomorrow.', 'On Friday.'], answer: 1 },
        ],
        es: '"Wired" = con cable; "wireless" = inalámbrico. "Before noon" = antes del mediodía.',
      },
      {
        id: 'C', track: 'k3', title: 'Questions 9 to 12 · Choose the best answer', how: 'One answer for each question.',
        items: [
          { id: 'c1', kind: 'choice', q: 'What was Dave\'s mistake?', options: ['He broke a cable.', 'He forgot the DI box.', 'He arrived late.'], answer: 1 },
          { id: 'c2', kind: 'choice', q: 'What did the sound sound like?', options: ['Too loud.', 'Very muddy.', 'Thin and noisy.'], answer: 2 },
          { id: 'c3', kind: 'choice', q: 'What does he do now before the soundcheck?', options: ['He checks the input list.', 'He buys new cables.', 'He brings a friend.'], answer: 0 },
          { id: 'c4', kind: 'choice', q: 'What is his advice?', options: ['Always arrive early.', 'Buy more equipment.', 'Check what you have done before blaming the equipment.'], answer: 2 },
        ],
        es: 'Dave aprendió de un error: "Check what you have done" (Revisa lo que has hecho). Es un buen hábito en cualquier trabajo técnico.',
      },
    ],
  },
  {
    id: 'w2-writing', week: 2, skill: 'writing', no: 5, title: 'Writing: a report', time: '40 min',
    blurb: 'About 150 words. Say what went wrong and how you fixed it.',
    exercises: [],
    free: [
      {
        id: 'W', title: 'Writing · Report to your supervisor', minWords: 140,
        how: 'During a concert there was a problem with the sound. Write an email to your supervisor, Marta, of 140 to 180 words. Say: what the problem was, what you checked (use first, then, after that), what caused it and how you fixed it, and one suggestion for next time. You can invent the details.',
        prompts: ['Your email'],
        model: 'Dear Marta,\nI am writing to tell you about a problem during Saturday\'s concert. At nine o\'clock, the singer\'s microphone stopped and there was no sound from her channel.\nFirst, I looked at the desk: the channel was not muted and the fader was up. Then I changed the microphone, but there was still no sound. After that, I plugged the same microphone into a different cable, and the sound came back. The first cable must have been faulty, because it was broken near the plug.\nThe problem lasted about three minutes, and the audience did not notice because the band was playing an instrumental song. I have put the faulty cable in the repair box.\nFor next time, I would like to check all the cables before the show, and to keep two spare XLR cables next to the stage box. If you agree, I can do that on Thursday.\nBest wishes,\nIvan',
      },
    ],
  },
]
