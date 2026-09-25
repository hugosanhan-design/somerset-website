'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  GapFillResult, IntakeSession, Phase, Phase2Item,
  PuzzleResult, QuestionResponse, ResponseScore, TopicCluster, Version,
} from '@/lib/intake/types'
import {
  ADULT_GAP_FILL, ADULT_PUZZLE, FINAL_WRITE_QUESTIONS,
  TEEN_GAP_FILL, TEEN_PUZZLE,
  phase1Questions, getPhase2ItemsForSession,
} from '@/lib/intake/questions'
import { getVocabItem } from '@/lib/intake/vocabItems'
import { calculateRoughBand, aggregateClusters } from '@/lib/intake/scoring'
import OnboardingCard from './OnboardingCard'
import QuestionCard from './QuestionCard'
import MCQCard from './MCQCard'
import InterestPickerCard from './InterestPickerCard'
import PuzzleCard from './PuzzleCard'
import GapFillCard from './GapFillCard'
import TransitionCard from './TransitionCard'
import ProgressBar from './ProgressBar'

// Flow stages (in order)
type Stage =
  | 'onboarding'
  | 'warmup'          // 1 open write
  | 'picker'          // interest picker
  | 'puzzle'          // 6-step text building
  | 'gapfill'         // 10-item cloze
  | 'mcq'             // 4 MCQ items (vocab + reading)
  | 'final_write'     // 1 final open write
  | 'done'

const STORAGE_KEY = (v: Version) => `somerset-intake-${v}`
const ONBOARDING_KEY = 'somerset-intake-onboarding'

const TRANSITIONS = [
  'Great — keep going...',
  'Thanks — nearly there...',
  'Good stuff...',
  'Brilliant...',
  'Interesting...',
]

const PHASE_LABELS: Record<Stage, string> = {
  onboarding: '',
  warmup: 'Getting to know you',
  picker: 'Your interests',
  puzzle: 'A short exercise',
  gapfill: 'Quick questions',
  mcq: 'A short read',
  final_write: 'Almost done',
  done: '',
}

function makeSessionId(): string {
  return `intake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function scorePuzzle(
  scenario: typeof ADULT_PUZZLE,
  choices: number[],
): PuzzleResult {
  const steps = scenario.steps.map((step, i) => ({
    id: step.id,
    targetStructure: step.targetStructure,
    chosenIndex: choices[i],
    correct: choices[i] === step.correctIndex,
  }))
  return { steps, score: steps.filter(s => s.correct).length }
}

function scoreGapFill(
  items: typeof ADULT_GAP_FILL,
  choices: number[],
): GapFillResult {
  const scored = items.map((item, i) => ({
    id: item.id,
    targetStructure: item.targetStructure,
    chosenIndex: choices[i],
    correct: choices[i] === item.correctIndex,
  }))
  return { items: scored, score: scored.filter(s => s.correct).length }
}

function scoreP2MCQ(isCorrect: boolean): ResponseScore {
  return isCorrect
    ? { vocabulary_range: 3, grammar_complexity: 3, vocabulary_precision: 3, clusters: [] }
    : { vocabulary_range: 1, grammar_complexity: 1, vocabulary_precision: 1, clusters: [] }
}

export default function IntakeFlow() {
  const router = useRouter()

  const [stage, setStage] = useState<Stage>('onboarding')
  const [version, setVersion] = useState<Version>('adult')
  const [session, setSession] = useState<IntakeSession | null>(null)

  // MCQ state (vocab card at index 0, reading items 1+)
  const [p2Items, setP2Items] = useState<Phase2Item[]>([])
  const [vocabItem, setVocabItem] = useState<ReturnType<typeof getVocabItem> | null>(null)
  const [p2Idx, setP2Idx] = useState(0)

  const [transition, setTransition] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Check for a saved session to resume
    try {
      const saved = localStorage.getItem(ONBOARDING_KEY)
      if (saved) {
        const parsed: IntakeSession = JSON.parse(saved)
        const hoursOld = (Date.now() - parsed.lastSavedAt) / 3600000
        if (!parsed.completed && hoursOld < 24) {
          restoreSession(parsed)
          return
        }
      }
    } catch {
      // start fresh
    }
  }, [])

  function restoreSession(parsed: IntakeSession) {
    const ver = parsed.version
    setVersion(ver)

    const p1Rs = parsed.responses.filter(r => r.phase === 1)
    const clusters = Array.from(new Set([...parsed.activeClusters, ...aggregateClusters(p1Rs)])) as TopicCluster[]
    const band = calculateRoughBand(p1Rs)
    const readingItems = getPhase2ItemsForSession(clusters, band)
    const vItem = getVocabItem(parsed.id)

    setSession(parsed)
    setP2Items(readingItems)
    setVocabItem(vItem)

    // Restore stage
    if (parsed.completed) { setStage('done'); return }
    if (parsed.gapFillResult) { setStage('mcq'); return }
    if (parsed.puzzleResult) { setStage('gapfill'); return }
    if (parsed.interestPickerDone) { setStage('puzzle'); return }
    if (parsed.responses.filter(r => r.phase === 1).length > 0) { setStage('picker'); return }
    setStage('warmup')
  }

  function persist(updated: IntakeSession) {
    const stamped = { ...updated, lastSavedAt: Date.now() }
    setSession(stamped)
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(stamped))
  }

  // ── Onboarding ──────────────────────────────────────────────────────────────
  function handleOnboarding(name: string, age: number, ver: Version) {
    setVersion(ver)
    const fresh: IntakeSession = {
      id: makeSessionId(),
      version: ver,
      studentName: name,
      studentAge: age,
      responses: [],
      currentPhase: 1,
      currentQuestionIndex: 0,
      roughBand: null,
      activeClusters: [],
      interestPickerDone: false,
      startedAt: Date.now(),
      lastSavedAt: Date.now(),
      completed: false,
    }
    setSession(fresh)
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(fresh))

    // Pre-load MCQ items (will use fallback clusters until picker sets real ones)
    const vItem = getVocabItem(fresh.id)
    setVocabItem(vItem)
    setStage('warmup')
  }

  // ── Warm-up write ────────────────────────────────────────────────────────────
  async function scoreResponse(text: string): Promise<ResponseScore> {
    try {
      const res = await fetch('/api/intake/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: text }),
      })
      if (!res.ok) throw new Error()
      return res.json()
    } catch {
      return { vocabulary_range: 2, grammar_complexity: 2, vocabulary_precision: 2, clusters: [] }
    }
  }

  async function handleWarmupResponse(text: string) {
    if (!session) return
    const q = phase1Questions[version][0]

    const [score] = await Promise.all([scoreResponse(text)])

    const newResp: QuestionResponse = {
      questionId: q.id,
      phase: 1,
      questionText: q.text,
      studentResponse: text,
      score,
      submittedAt: Date.now(),
    }

    const updated = { ...session, responses: [...session.responses, newResp] }
    persist(updated)
    await showTransition()
    setStage('picker')
  }

  // ── Interest picker ──────────────────────────────────────────────────────────
  function handlePickerSubmit(pickerClusters: TopicCluster[]) {
    if (!session) return
    const p1Rs = session.responses.filter(r => r.phase === 1)
    const merged = Array.from(new Set([...pickerClusters, ...aggregateClusters(p1Rs)])) as TopicCluster[]

    const band = calculateRoughBand(p1Rs)
    const readingItems = getPhase2ItemsForSession(merged, band)
    setP2Items(readingItems)

    persist({ ...session, activeClusters: merged, interestPickerDone: true })
    setStage('puzzle')
  }

  // ── Puzzle ───────────────────────────────────────────────────────────────────
  function handlePuzzleComplete(choices: number[]) {
    if (!session) return
    const scenario = version === 'teen' ? TEEN_PUZZLE : ADULT_PUZZLE
    const result = scorePuzzle(scenario, choices)
    persist({ ...session, puzzleResult: result })
    setStage('gapfill')
  }

  // ── Gap-fill ─────────────────────────────────────────────────────────────────
  function handleGapFillComplete(choices: number[]) {
    if (!session) return
    const items = version === 'teen' ? TEEN_GAP_FILL : ADULT_GAP_FILL
    const result = scoreGapFill(items, choices)
    persist({ ...session, gapFillResult: result })
    setP2Idx(0)
    setStage('mcq')
  }

  // ── MCQ (vocab + reading) ────────────────────────────────────────────────────
  async function handleMCQSubmit(isCorrect: boolean) {
    if (!session) return
    const isVocab = p2Idx === 0
    const questionText = isVocab ? 'Choose the word that fits best:' : (p2Items[p2Idx - 1]?.question ?? '')
    const questionId = isVocab ? `vocab-${vocabItem?.id ?? 'x'}` : `p2-${p2Items[p2Idx - 1]?.cluster ?? 'x'}-${p2Idx}`
    const clusterForResponse = isVocab ? null : p2Items[p2Idx - 1]?.cluster

    const score: ResponseScore = {
      ...scoreP2MCQ(isCorrect),
      clusters: (isCorrect && clusterForResponse) ? [clusterForResponse as TopicCluster] : [],
    }

    const newResp: QuestionResponse = {
      questionId,
      phase: 2,
      questionText,
      studentResponse: isCorrect ? '[correct]' : '[incorrect]',
      score,
      submittedAt: Date.now(),
    }

    const allResponses = [...session.responses, newResp]
    await showTransition()

    const totalP2 = 1 + Math.min(p2Items.length, 4)
    const nextIdx = p2Idx + 1

    if (nextIdx < totalP2) {
      persist({ ...session, responses: allResponses })
      setP2Idx(nextIdx)
    } else {
      persist({ ...session, responses: allResponses })
      setStage('final_write')
    }
  }

  // ── Final write ──────────────────────────────────────────────────────────────
  async function handleFinalWriteResponse(text: string) {
    if (!session) return
    const q = version === 'teen' ? FINAL_WRITE_QUESTIONS.teen : FINAL_WRITE_QUESTIONS.adult
    const score = await scoreResponse(text)

    const newResp: QuestionResponse = {
      questionId: q.id,
      phase: 3,
      questionText: q.text,
      studentResponse: text,
      score,
      submittedAt: Date.now(),
    }

    const completed: IntakeSession = {
      ...session,
      responses: [...session.responses, newResp],
      completed: true,
      lastSavedAt: Date.now(),
    }
    persist(completed)
    setSubmitting(true)

    try {
      await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completed),
      })
    } catch (err) {
      console.error('[IntakeFlow] submit failed:', err)
    }

    router.push(`/intake/complete?name=${encodeURIComponent(session.studentName)}`)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  async function showTransition() {
    const msg = TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)]
    setTransition(msg)
    await new Promise(r => setTimeout(r, 1000))
    setTransition(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (stage === 'onboarding') {
    return <OnboardingCard onSubmit={handleOnboarding} />
  }

  if (!session || submitting) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '4px solid #6BAE2E', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (transition !== null) {
    return <TransitionCard message={transition} />
  }

  const phaseLabel = PHASE_LABELS[stage]

  if (stage === 'warmup') {
    return (
      <div>
        <ProgressBar phase={1} phaseLabel={phaseLabel} current={0} total={5} />
        <QuestionCard
          key="warmup"
          question={phase1Questions[version][0]?.text ?? ''}
          onSubmit={handleWarmupResponse}
          isScoring={false}
          version={version}
        />
      </div>
    )
  }

  if (stage === 'picker') {
    return (
      <div>
        <ProgressBar phase={1} phaseLabel={phaseLabel} current={1} total={5} />
        <InterestPickerCard version={version} onSubmit={handlePickerSubmit} />
      </div>
    )
  }

  if (stage === 'puzzle') {
    const scenario = version === 'teen' ? TEEN_PUZZLE : ADULT_PUZZLE
    return (
      <div>
        <ProgressBar phase={1} phaseLabel={phaseLabel} current={2} total={5} />
        <PuzzleCard key="puzzle" scenario={scenario} onComplete={handlePuzzleComplete} />
      </div>
    )
  }

  if (stage === 'gapfill') {
    const items = version === 'teen' ? TEEN_GAP_FILL : ADULT_GAP_FILL
    return (
      <div>
        <ProgressBar phase={2} phaseLabel={phaseLabel} current={0} total={5} />
        <GapFillCard key="gapfill" items={items} onComplete={handleGapFillComplete} />
      </div>
    )
  }

  if (stage === 'mcq') {
    const totalP2 = 1 + Math.min(p2Items.length, 4)

    if (p2Idx === 0 && vocabItem) {
      return (
        <div>
          <ProgressBar phase={2} phaseLabel={phaseLabel} current={1} total={5} />
          <MCQCard
            key="vocab"
            question="Choose the word that fits best:"
            sentence={vocabItem.sentence}
            options={vocabItem.options}
            correctIndex={vocabItem.correctIndex}
            onSubmit={handleMCQSubmit}
            version={version}
            timerSeconds={8}
          />
        </div>
      )
    }

    const readingItem = p2Items[p2Idx - 1]
    if (readingItem) {
      return (
        <div>
          <ProgressBar phase={2} phaseLabel={phaseLabel} current={Math.min(p2Idx + 1, totalP2)} total={5} />
          <MCQCard
            key={`mcq-${p2Idx}`}
            question={readingItem.question}
            readingText={readingItem.text}
            options={readingItem.options}
            correctIndex={readingItem.correctIndex}
            onSubmit={handleMCQSubmit}
            version={version}
          />
        </div>
      )
    }
  }

  if (stage === 'final_write') {
    const q = version === 'teen' ? FINAL_WRITE_QUESTIONS.teen : FINAL_WRITE_QUESTIONS.adult
    return (
      <div>
        <ProgressBar phase={3} phaseLabel={phaseLabel} current={4} total={5} />
        <QuestionCard
          key="final_write"
          question={q.text}
          onSubmit={handleFinalWriteResponse}
          isScoring={false}
          version={version}
        />
      </div>
    )
  }

  return null
}
