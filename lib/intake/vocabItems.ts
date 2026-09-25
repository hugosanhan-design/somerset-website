import type { VocabItem } from './types'

export const vocabItems: VocabItem[] = [
  {
    id: 'vocab-1',
    sentence: 'After months of saving, she finally had enough money to _____ the holiday she had always dreamed of.',
    options: ['afford', 'pay', 'buy'],
    correctIndex: 0,
    band: 'B1-B2',
  },
  {
    id: 'vocab-2',
    sentence: 'The project took longer than expected because the team _____ several unexpected problems.',
    options: ['saw', 'had', 'encountered'],
    correctIndex: 2,
    band: 'B1-B2',
  },
  {
    id: 'vocab-3',
    sentence: 'The documentary _____ how climate change is affecting the Mediterranean coast.',
    options: ['shows', 'examines', 'talks about'],
    correctIndex: 1,
    band: 'B1-B2',
  },
  {
    id: 'vocab-4',
    sentence: 'Despite the heavy rain, the outdoor festival _____ as planned.',
    options: ['went ahead', 'continued on', 'kept going'],
    correctIndex: 0,
    band: 'B1-B2',
  },
]

export function getVocabItem(sessionId: string): VocabItem {
  const idx = sessionId.charCodeAt(sessionId.length - 1) % vocabItems.length
  return vocabItems[idx]
}
