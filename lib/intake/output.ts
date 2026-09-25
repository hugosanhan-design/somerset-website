import type { GapFillResult, IntakeSession, PuzzleResult, TeacherOutput, TopicCluster } from './types'
import { aggregateClusters, calculateConfidence, calculateFinalBand, calculateFinalBandWithDiagnostics, calculatePhaseScore, detectFlags, diagnosticSignalText } from './scoring'

export const CLUSTER_LABELS: Record<TopicCluster, string> = {
  SPORT: 'Sport',
  FOOTBALL: 'Football / Valencia CF',
  GAMING: 'Gaming (EA FC, Fortnite, streaming)',
  MUSIC: 'Music',
  TV_FILM: 'TV & Film',
  ANIMALS: 'Animals & Nature',
  FOOD: 'Food & Valencian Culture',
  TRAVEL: 'Travel',
  FAMILY: 'Family & Home',
  WORK_PROFESSIONAL: 'Work & Professional Life',
  TECHNOLOGY: 'Technology',
  CULTURE_HISTORY: 'Culture & History',
  SOCIAL_FRIENDS: 'Social Life & Friends',
  VALENCIA_LOCAL: 'Valencia & Local Life',
  PSYCHOLOGY_PEOPLE: 'Psychology & People',
  CREATIVE_ARTS: 'Creative Arts',
  NATURE: 'Nature & Environment',
  PERSONAL_DEVELOPMENT: 'Personal Development',
}

const LESSON_TIPS: Partial<Record<TopicCluster, string>> = {
  FOOTBALL:
    'Open with a Valencia CF or La Liga topic. Worksheet options: player profile, match report, football statistics, a Valencia derby scenario.',
  GAMING:
    'Reference EA FC, Fortnite, or Ibai Llanos. Worksheet: game review, streaming culture article, esports news item.',
  MUSIC:
    'Use a music news item — Bad Bunny, Bizarrap sessions, or a Spanish/Valencian artist. Worksheet: lyrics gap-fill, artist profile, or music review.',
  FOOD:
    'Connect to Valencian food culture — paella, horchata, the Mercat Central. Worksheet: recipe, restaurant review, or food history article.',
  TRAVEL:
    'Open with a travel scenario or destination description. Worksheet: trip planning task, travel article, or postcard writing.',
  WORK_PROFESSIONAL:
    'Use a professional English scenario matched to their sector. Worksheet: email writing, workplace vocabulary, or job interview role-play.',
  SPORT:
    'Connect content to the sport they mentioned. Worksheet: sports report, athlete profile, or a sports comparison task.',
  TV_FILM:
    'Reference the series or film they described. Worksheet: plot summary, character description, or review writing.',
  VALENCIA_LOCAL:
    'Anchor content in Valencia — Fallas, Mestalla, Ruzafa, El Cabanyal, the riada, or local food culture.',
  FAMILY:
    'Use family-centred scenarios. Worksheet: describing people, family routines, or a personal narrative task.',
  ANIMALS:
    'Use a nature or animal topic text. Worksheet: fact file, wildlife article, or animal comparison task.',
  TECHNOLOGY:
    'Use a technology news item or scenario. Worksheet: tech review, how-it-works explainer, or email about a technical problem.',
  CULTURE_HISTORY:
    'Connect to Valencian or Spanish history — Fallas origins, the 1957 riada, or an art/architecture topic they referenced.',
}

function formatStructureName(s: string): string {
  return s.replace(/_/g, ' ')
}

function carelessErrorNote(puzzleResult: PuzzleResult, gapFillResult: GapFillResult): string | null {
  const gapHigh = gapFillResult.score >= 8   // 80%+ on gap-fill
  const puzzleLow = puzzleResult.score <= 4  // ≤ 4/6 on puzzle
  if (gapHigh && puzzleLow) {
    const missedStructures = puzzleResult.steps
      .filter(s => !s.correct)
      .map(s => formatStructureName(s.targetStructure))
      .join(', ')
    return `⚠ Possible careless errors: gap-fill accuracy (${gapFillResult.score}/10) is high but puzzle score is lower (${puzzleResult.score}/6). Missed structures (${missedStructures}) may reflect inattention rather than genuine gaps. Recommend a brief in-person conversation before concluding these are real weaknesses.`
  }
  return null
}

export function formatTeacherOutput(session: IntakeSession): TeacherOutput {
  const p1 = session.responses.filter(r => r.phase === 1)
  const p2 = session.responses.filter(r => r.phase === 2)
  const p3 = session.responses.filter(r => r.phase === 3)

  const levelEstimate =
    session.puzzleResult && session.gapFillResult
      ? calculateFinalBandWithDiagnostics(p1, p2, p3, session.puzzleResult, session.gapFillResult)
      : calculateFinalBand(p1, p2, p3)

  const confidence =
    session.puzzleResult && session.gapFillResult
      ? calculateConfidence(
          session.puzzleResult,
          session.gapFillResult,
          calculatePhaseScore(p1),
          calculatePhaseScore(p3),
        )
      : 'Low'

  const flags = detectFlags(session)

  const aiClusters = aggregateClusters(p1)
  const clusters = Array.from(new Set([...session.activeClusters, ...aiClusters])) as TopicCluster[]

  const strengthDescriptions = [
    'strong engagement, follow this thread',
    'confident responses, mentioned more than once',
    'positive signal',
  ]

  const topInterests = clusters.slice(0, 3).map((cluster, i) => ({
    cluster,
    label: CLUSTER_LABELS[cluster],
    strength: strengthDescriptions[i] ?? 'mentioned',
  }))

  const topCluster = clusters[0]
  const lessonTip =
    topCluster && LESSON_TIPS[topCluster]
      ? LESSON_TIPS[topCluster]!
      : topCluster
      ? `Connect content to ${CLUSTER_LABELS[topCluster]} based on intake responses.`
      : 'Review intake responses directly to identify the strongest personal connection for the first lesson.'

  const responseSnippets = p1.map(r => ({
    question: r.questionText.slice(0, 80) + (r.questionText.length > 80 ? '...' : ''),
    response: r.studentResponse.slice(0, 120) + (r.studentResponse.length > 120 ? '...' : ''),
  }))

  return {
    studentName: session.studentName,
    studentAge: session.studentAge,
    completedAt: new Date(session.lastSavedAt).toLocaleString('en-GB', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    levelEstimate,
    confidence,
    topInterests,
    firstLessonRecommendation: lessonTip,
    flags,
    version: session.version,
    responseSnippets,
    puzzleResult: session.puzzleResult,
    gapFillResult: session.gapFillResult,
  }
}

export function formatTeacherText(output: TeacherOutput): string {
  const interests =
    output.topInterests.length > 0
      ? output.topInterests.map((i, idx) => `${idx + 1}. ${i.label} — ${i.strength}`).join('\n')
      : 'No interests detected — review responses directly.'

  const flagLines =
    output.flags.length > 0
      ? output.flags.map(f => `⚠ ${f}`).join('\n')
      : 'None.'

  const snippetLines =
    output.responseSnippets.length > 0
      ? output.responseSnippets.map(s => `Q: ${s.question}\nA: "${s.response}"`).join('\n\n')
      : 'No open responses recorded.'

  // Grammar diagnosis section
  let grammarSection = ''
  if (output.puzzleResult && output.gapFillResult) {
    const puzzleLines = output.puzzleResult.steps
      .map(s => `  ${formatStructureName(s.targetStructure)} ${s.correct ? '✓' : '✗'}`)
      .join(' | ')

    const weakGapFill = output.gapFillResult.items
      .filter(i => !i.correct)
      .map(i => formatStructureName(i.targetStructure))

    const weakLine = weakGapFill.length > 0
      ? `  Weak areas: ${weakGapFill.join(', ')}`
      : '  No weak areas detected.'

    const signal = diagnosticSignalText(output.puzzleResult.score + output.gapFillResult.score)
    const carelessNote = carelessErrorNote(output.puzzleResult, output.gapFillResult)

    grammarSection = `
GRAMMAR DIAGNOSIS
──────────────────────────────
Text-building puzzle:  ${output.puzzleResult.score}/6
${puzzleLines}
Gap-fill cloze:  ${output.gapFillResult.score}/10
${weakLine}${carelessNote ? `\n${carelessNote}` : ''}
Overall grammar signal: ${signal}
`
  }

  return `SOMERSET INTAKE PROFILE — ${output.studentName}
Student age: ${output.studentAge} | Completed: ${output.completedAt}

LEVEL ESTIMATE
Written level: ${output.levelEstimate} | Confidence: ${output.confidence}
Note: This is a written receptive estimate. Spoken level may differ.
⚠ Recommend 10-minute in-person conversation before confirming group.
${grammarSection}
TOP INTERESTS
${interests}

PHASE 1 RESPONSES
${snippetLines}

FIRST LESSON RECOMMENDATION
${output.firstLessonRecommendation}

NOTES
${flagLines}`
}

export function formatParentText(session: IntakeSession): string {
  const clusters = session.activeClusters.slice(0, 2)
  const interestStr =
    clusters.length > 0
      ? clusters.map(c => CLUSTER_LABELS[c].toLowerCase()).join(' and ')
      : null

  const name = session.studentName || 'Your child'

  return `Thank you for completing the Somerset quiz!

Here's what we found:

${name} responded confidently and showed a good foundation in English.${
    interestStr
      ? ` They seem especially interested in ${interestStr} — we'll make sure their first lessons connect to the things they love.`
      : ''
  }

Our teacher will be in touch before the first class.

See you soon at Somerset!`
}
