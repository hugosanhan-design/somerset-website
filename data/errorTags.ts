export type Skill = 'reading' | 'listening' | 'vocabulary' | 'grammar' | 'writing' | 'speaking'

export const SKILLS: Skill[] = ['reading', 'listening', 'vocabulary', 'grammar', 'writing', 'speaking']

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const ERROR_TAGS: { key: string; label: string }[] = [
  { key: 'tense',        label: 'Tense' },
  { key: 'agreement',    label: 'Agreement' },
  { key: 'article',      label: 'Article' },
  { key: 'preposition',  label: 'Preposition' },
  { key: 'word-order',   label: 'Word order' },
  { key: 'spelling',     label: 'Spelling' },
  { key: 'punctuation',  label: 'Punctuation' },
  { key: 'vocabulary',   label: 'Vocabulary' },
  { key: 'register',     label: 'Register' },
  { key: 'other',        label: 'Other' },
]
