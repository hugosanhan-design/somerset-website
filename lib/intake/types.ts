export type Version = 'children' | 'teen' | 'adult'
export type Band = 'A1-A2' | 'A2-B1' | 'B1-B2' | 'B2+'
export type Phase = 1 | 2 | 3

export type TopicCluster =
  | 'SPORT'
  | 'FOOTBALL'
  | 'GAMING'
  | 'MUSIC'
  | 'TV_FILM'
  | 'ANIMALS'
  | 'FOOD'
  | 'TRAVEL'
  | 'FAMILY'
  | 'WORK_PROFESSIONAL'
  | 'TECHNOLOGY'
  | 'CULTURE_HISTORY'
  | 'SOCIAL_FRIENDS'
  | 'VALENCIA_LOCAL'
  | 'PSYCHOLOGY_PEOPLE'
  | 'CREATIVE_ARTS'
  | 'NATURE'
  | 'PERSONAL_DEVELOPMENT'

export interface ResponseScore {
  vocabulary_range: 1 | 2 | 3
  grammar_complexity: 1 | 2 | 3
  vocabulary_precision: 1 | 2 | 3
  clusters: TopicCluster[]
}

export interface QuestionResponse {
  questionId: string
  phase: Phase
  questionText: string
  studentResponse: string
  score: ResponseScore
  submittedAt: number
}

export interface ParentResponses {
  homeLanguage: string
  parentLevelEstimate: 'Beginner' | 'A little' | 'Getting there' | 'Good'
  childInterests: string[]
}

export interface PuzzleResult {
  steps: Array<{
    id: string
    targetStructure: string
    chosenIndex: number
    correct: boolean
  }>
  score: number // 0–6
}

export interface GapFillResult {
  items: Array<{
    id: string
    targetStructure: string
    chosenIndex: number
    correct: boolean
  }>
  score: number // 0–10
}

export interface IntakeSession {
  id: string
  version: Version
  studentName: string
  studentAge: number
  responses: QuestionResponse[]
  parentResponses?: ParentResponses
  currentPhase: Phase
  currentQuestionIndex: number
  roughBand: Band | null
  activeClusters: TopicCluster[]
  interestPickerDone: boolean
  vocabItemId?: string
  puzzleResult?: PuzzleResult
  gapFillResult?: GapFillResult
  startedAt: number
  lastSavedAt: number
  completed: boolean
}

export interface Phase1Question {
  id: string
  text: string
  detectionHints: TopicCluster[]
}

export interface Phase2Item {
  cluster: TopicCluster
  band: Band
  text: string
  question: string
  answerGuidance: string
  options: [string, string, string]
  correctIndex: 0 | 1 | 2
}

export interface VocabItem {
  id: string
  sentence: string
  options: [string, string, string]
  correctIndex: 0 | 1 | 2
  band: Band
}

export interface GapFillItem {
  id: string
  targetStructure: string
  sentence: string
  options: [string, string, string]
  correctIndex: 0 | 1 | 2
}

export interface PuzzleStep {
  id: string
  targetStructure: string
  contextLines: string[]
  options: [string, string, string]
  correctIndex: 0 | 1 | 2
}

export interface PuzzleScenario {
  scenario: string
  startText: string
  completionMessage: string
  steps: PuzzleStep[]
}

export interface TeacherOutput {
  studentName: string
  studentAge: number
  completedAt: string
  levelEstimate: Band
  confidence: 'High' | 'Medium' | 'Low'
  topInterests: Array<{ cluster: TopicCluster; label: string; strength: string }>
  firstLessonRecommendation: string
  flags: string[]
  version: Version
  responseSnippets: Array<{ question: string; response: string }>
  puzzleResult?: PuzzleResult
  gapFillResult?: GapFillResult
}
