import type { Band, GapFillResult, IntakeSession, PuzzleResult, QuestionResponse, ResponseScore, TopicCluster } from './types'

export function responseTotal(score: ResponseScore): number {
  return score.vocabulary_range + score.grammar_complexity + score.vocabulary_precision
}

export function bandFromAvg(avg: number): Band {
  if (avg <= 4) return 'A1-A2'
  if (avg <= 6) return 'A2-B1'
  if (avg <= 8) return 'B1-B2'
  return 'B2+'
}

export function calculateRoughBand(responses: QuestionResponse[]): Band {
  if (responses.length === 0) return 'A1-A2'
  const avg = responses.reduce((s, r) => s + responseTotal(r.score), 0) / responses.length
  return bandFromAvg(avg)
}

export function aggregateClusters(responses: QuestionResponse[]): TopicCluster[] {
  const counts: Partial<Record<TopicCluster, number>> = {}
  for (const r of responses) {
    for (const cluster of r.score.clusters) {
      counts[cluster] = (counts[cluster] ?? 0) + 1
    }
  }
  return (Object.entries(counts) as [TopicCluster, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c as TopicCluster)
}

export function calculateFinalBand(
  p1: QuestionResponse[],
  p2: QuestionResponse[],
  p3: QuestionResponse[]
): Band {
  const avg = (rs: QuestionResponse[]) =>
    rs.length > 0 ? rs.reduce((s, r) => s + responseTotal(r.score), 0) / rs.length : null

  const s1 = avg(p1)
  const s2 = avg(p2)
  const s3 = avg(p3)
  const fallback = s1 ?? 5

  const weighted =
    (s1 ?? fallback) * 0.3 +
    (s2 ?? fallback) * 0.4 +
    (s3 ?? fallback) * 0.3

  return bandFromAvg(weighted)
}

export function calculateConfidence(
  puzzleResult: PuzzleResult,
  gapFillResult: GapFillResult,
  p1WriteScore: number | null,
  p3WriteScore: number | null,
): 'High' | 'Medium' | 'Low' {
  const diagnosticTotal = puzzleResult.score + gapFillResult.score
  if (diagnosticTotal >= 12) return 'High'
  if (diagnosticTotal <= 5) return 'Low'
  const writesAvailable = p1WriteScore !== null && p3WriteScore !== null
  if (writesAvailable) {
    const writeAvg = ((p1WriteScore ?? 5) + (p3WriteScore ?? 5)) / 2
    const diagnosticNorm = (diagnosticTotal / 16) * 10
    const mismatch = Math.abs(writeAvg - diagnosticNorm) > 3
    if (mismatch) return 'Medium'
  }
  return 'Medium'
}

// Normalise a set of QuestionResponses to a 0–10 scale
export function calculatePhaseScore(responses: QuestionResponse[]): number | null {
  if (responses.length === 0) return null
  const avg = responses.reduce((s, r) => s + responseTotal(r.score), 0) / responses.length
  // responseTotal is 3–9, map to 0–10
  return ((avg - 3) / 6) * 10
}

export function calculateFinalBandWithDiagnostics(
  p1: QuestionResponse[],
  p2mcq: QuestionResponse[],
  p3: QuestionResponse[],
  puzzleResult: PuzzleResult,
  gapFillResult: GapFillResult,
): Band {
  const writeScore = calculatePhaseScore(p1) ?? 5
  const finalWriteScore = calculatePhaseScore(p3) ?? 5
  const mcqScore = calculatePhaseScore(p2mcq) ?? 5

  // Puzzle: 0–6 → normalise to 0–10
  const puzzleNorm = (puzzleResult.score / 6) * 10
  // Gap-fill: 0–10 already
  const gapFillNorm = gapFillResult.score

  const weighted =
    writeScore * 0.20 +
    puzzleNorm * 0.25 +
    gapFillNorm * 0.25 +
    mcqScore * 0.20 +
    finalWriteScore * 0.10

  // Initial band from weighted score (0–10 scale)
  let band: Band
  if (weighted <= 3) band = 'A1-A2'
  else if (weighted <= 5.5) band = 'A2-B1'
  else if (weighted <= 7.5) band = 'B1-B2'
  else band = 'B2+'

  // DIAGNOSTIC FLOOR RULE
  // High diagnostic accuracy overrides a low write score dragging the band down.
  // The puzzle + gap-fill are purpose-built instruments; an open write is not.
  const diagnosticTotal = puzzleResult.score + gapFillResult.score // max 16
  if (diagnosticTotal >= 14) {
    // 14–16/16 → B2+ floor unconditionally
    if (band === 'A1-A2' || band === 'A2-B1' || band === 'B1-B2') band = 'B2+'
  } else if (diagnosticTotal >= 11) {
    // 11–13/16 → B1-B2 floor
    if (band === 'A1-A2' || band === 'A2-B1') band = 'B1-B2'
  } else if (diagnosticTotal >= 7) {
    // 7–10/16 → A2-B1 floor
    if (band === 'A1-A2') band = 'A2-B1'
  }

  return band
}

export function diagnosticSignalText(total: number): string {
  if (total >= 14) return 'B2+ range — grammar highly secure across all tested structures'
  if (total >= 11) return 'B1–B2 range — grammar largely secure; a few complex structures still consolidating'
  if (total >= 7)  return 'A2–B1 range — core tenses secure; B1 structures emerging'
  return 'A1–A2 range — focus on present and past simple first'
}

// Legacy alias kept for any external callers
export function grammarSignalText(puzzleScore: number, gapFillScore: number): string {
  return diagnosticSignalText(puzzleScore + gapFillScore)
}

export function detectFlags(session: IntakeSession): string[] {
  const flags: string[] = []

  const p1 = session.responses.filter(r => r.phase === 1)
  const p3 = session.responses.filter(r => r.phase === 3)

  // Beyond test range — likely a near-native speaker or teacher
  if (session.puzzleResult && session.gapFillResult) {
    const diagnosticTotal = session.puzzleResult.score + session.gapFillResult.score
    if (diagnosticTotal >= 15) {
      flags.push(
        'This student may be above B2 level or a near-native speaker. The placement tool is designed for A1–B2. Consider placing directly in the most advanced available group, or scheduling a short spoken assessment before the first class.'
      )
    }
  }

  if (p1.length > 0) {
    const avg = p1.reduce((s, r) => s + responseTotal(r.score), 0) / p1.length
    if (avg >= 7) {
      flags.push('Mandatory in-person interview before B2 group confirmation')
    }
  }

  if (p1.length > 0 && p3.length > 0) {
    const a1 = p1.reduce((s, r) => s + responseTotal(r.score), 0) / p1.length
    const a3 = p3.reduce((s, r) => s + responseTotal(r.score), 0) / p3.length
    if (Math.abs(a1 - a3) >= 3) {
      flags.push('Possible split receptive/productive level — see notes')
    }
  }

  const minutes = (session.lastSavedAt - session.startedAt) / 60000
  if (minutes < 3) {
    flags.push('Possible rushed completion — low confidence estimate')
  }

  if (session.responses.length < 5) {
    flags.push('Incomplete — insufficient data for confident estimate')
  }

  if (
    session.version === 'children' &&
    session.parentResponses?.parentLevelEstimate === 'Good' &&
    p1.length > 0
  ) {
    const avg = p1.reduce((s, r) => s + responseTotal(r.score), 0) / p1.length
    if (avg <= 4) {
      flags.push('Cross-check: parent reported Good English but child responses suggest A1–A2')
    }
  }

  return flags
}
