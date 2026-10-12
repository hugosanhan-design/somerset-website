// Language settings for the speaking engine (SpeakingStudio). The PET course uses the
// English defaults; Spanish for Expats passes SPEAKING_ES. Everything that depends on
// the language being spoken lives here, so the engine itself stays one file.

export type SpeakingLangCode = 'en' | 'es'

export type SpeakingLang = {
  code: SpeakingLangCode
  locale: 'en-GB' | 'es-ES'      // Azure recognition + pronunciation assessment
  voice: string                  // Azure neural voice for "listen" and the word coach
  speakers: string               // "Any ___ speaker would understand you"
  minSeconds: number             // the timer turns green here (MAX is 90 s)
  goalPicker: boolean            // the "Be understood / Sound British" choice (English only)
  levels: { below: string; starting: string; solid: string }
  versionTab: string             // tab name for the improved answer
  versionIntro: string           // line above the improved answer
  versionWhy: string             // heading of the short "what is expected" list
  thinking: string               // sub-line while feedback is being written
}

export const SPEAKING_EN: SpeakingLang = {
  code: 'en',
  locale: 'en-GB',
  voice: 'en-GB-SoniaNeural',
  speakers: 'English',
  minSeconds: 60,
  goalPicker: true,
  levels: { below: 'Not B1 yet', starting: 'Starting B1', solid: 'Solid B1' },
  versionTab: 'Your B1 version',
  versionIntro: 'This is your answer as a good starting-B1 student would say it. Same ideas, highlighted parts are what changed.',
  versionWhy: 'What B1 expects from you',
  thinking: 'Checking your grammar, the words we misheard and writing your B1 version.',
}

export const SPEAKING_ES: SpeakingLang = {
  code: 'es',
  locale: 'es-ES',
  voice: 'es-ES-ElviraNeural',
  speakers: 'Spanish',
  minSeconds: 30,
  goalPicker: false,
  levels: { below: 'Hard to follow', starting: "You'd get by", solid: 'Office-ready' },
  versionTab: 'Say it like this',
  versionIntro: 'This is your answer as a confident learner would say it at the counter. Same ideas, highlighted parts are what changed.',
  versionWhy: 'What helps at the office',
  thinking: 'Checking your Spanish, the words we misheard and writing a smoother version.',
}
