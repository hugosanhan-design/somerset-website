import type { ExamPart } from './mocks'

// One strategy rule box per exam part, per the Model doc's Component 2 rule: "stated as
// a reusable test-taking heuristic, not restated per question." Hand-authored once,
// reused for every student — this is stable content, not something to regenerate.
export const PART_RULES: Partial<Record<ExamPart, string>> = {
  'reading-p1': 'Part 1 tests <b>collocation</b>: which word habitually goes with the words around it. Meaning alone is never enough — all four options usually mean roughly the same thing. Learn the phrase, not the word.',
  'uoe-p2': 'Part 2 is <b>grammar words only</b>: articles, prepositions, auxiliaries, relatives, linkers. If you are writing a content word, you are almost certainly wrong. Ask: what <b>structure</b> is this sentence building?',
  'uoe-p3': 'Three questions, every time: (1) what <b>part of speech</b> does the gap need — noun, verb, adjective, adverb? (2) does the meaning need a <b>negative prefix</b> (un–, in–, dis–)? (3) is it <b>singular or plural</b>? Then check the spelling letter by letter.',
  'uoe-p4': 'Each answer is worth <b>2 marks</b>, split into two halves — so half a right answer still scores 1. <b>Never leave one blank.</b> Most items test a <b>fixed phrase</b> or a well-known structure, not creative grammar.',
  'reading-p5': 'Part 5 tests detail, opinion and inference together. The trap is an option that is true of the text but doesn\'t actually answer <b>this</b> question. Go back to the exact lines the question points to before choosing.',
  'reading-p6': 'Part 6 is <b>not</b> about topic — every option is on topic. It is about <b>cohesion</b>. Check: (1) the sentence <b>before</b> and <b>after</b>; (2) <b>reference words</b> (<i>it, this, these, they, such</i>) — they must point back at something already named; (3) <b>linkers</b>. The extra sentence connects to nothing.',
  'reading-p7': 'The trap in Part 7 is the <b>same topic, different point</b>. Read the question, underline its key <b>idea</b>, then find the person who makes <b>that exact point</b> — not the one who happens to use the same word.',
}

export function bandFromWeighted(readingUoePct: number | null, writingPct: number | null, listeningPct: number | null): { pct: number; band: string; method: string } | null {
  const parts: { pct: number; weight: number; label: string }[] = []
  if (readingUoePct !== null) parts.push({ pct: readingUoePct, weight: 40, label: 'R&UoE' })
  if (writingPct !== null) parts.push({ pct: writingPct, weight: 20, label: 'Writing' })
  if (listeningPct !== null) parts.push({ pct: listeningPct, weight: 20, label: 'Listening' })
  if (parts.length === 0) return null

  const totalWeight = parts.reduce((s, p) => s + p.weight, 0)
  const pct = parts.reduce((s, p) => s + p.pct * p.weight, 0) / totalWeight

  let band: string
  if (pct < 26) band = 'Below B1'
  else if (pct < 56) band = 'B1 (not yet B2)'
  else if (pct < 75) band = 'Low B2'
  else if (pct < 85) band = 'Mid B2'
  else band = 'High B2'

  const method = `Weighted at Cambridge's own paper weighting (${parts.map(p => `${p.label} ${p.weight}%`).join(', ')}), re-based to 100% since Speaking wasn't sat.`
  return { pct: Math.round(pct * 10) / 10, band, method }
}
