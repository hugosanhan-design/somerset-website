'use client'
import { useState } from 'react'
import Link from 'next/link'
import { TOPIC_PRESETS, LEVEL_DESCRIPTIONS } from '@/data/topicVocabSeed'
import { COLORS, FONT, RADIUS, SHADOW, EASE } from '@/lib/theme'

type Level = 'A2' | 'B1' | 'B2' | 'C1'
const LEVELS: Level[] = ['A2', 'B1', 'B2', 'C1']
const TEXT_TYPES = ['Story', 'Article', 'Dialogue', 'Email']
const LENGTHS = ['Short', 'Medium', 'Long'] as const

interface VocabItem { word: string; pos: string; def_en: string; def_es: string; example: string; cefr: string }
interface GrammarPoint { point: string; why: string }
interface LessonPack { topic: string; level: Level; vocab: VocabItem[]; grammarPoints: GrammarPoint[] }
interface GeneratedText {
  title: string
  text: string
  glossary: { word: string; pos: string; def_en: string; def_es: string; example: string }[]
  grammar_notes: { point: string; seen_in: string }[]
  questions: { q: string; answer: string }[]
  gap_fill: { text_with_blanks: string; answers: string[] }
}

export default function ContextLabPage() {
  const [step, setStep] = useState<'setup' | 'result'>('setup')

  // Setup state
  const [topic, setTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [level, setLevel] = useState<Level>('B1')
  const [textType, setTextType] = useState('Story')
  const [length, setLength] = useState<typeof LENGTHS[number]>('Medium')

  // Result state
  const [pack, setPack] = useState<LessonPack | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [generated, setGenerated] = useState<GeneratedText | null>(null)
  const [loadingStage, setLoadingStage] = useState<'' | 'pack' | 'text'>('')
  const [error, setError] = useState('')
  const [activeGloss, setActiveGloss] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  const [gapRevealed, setGapRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const activeTopic = (customTopic.trim() || topic).trim()

  async function buildLesson() {
    if (!activeTopic) return
    setError('')
    setLoadingStage('pack')
    try {
      const packRes = await fetch('/api/context-lab/pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: activeTopic, level }),
      })
      const packData = await packRes.json()
      if (packData.error) { setError(packData.error); setLoadingStage(''); return }
      setPack(packData)
      const sel: Record<string, boolean> = {}
      packData.vocab.forEach((v: VocabItem) => { sel[v.word] = true })
      setSelected(sel)

      setLoadingStage('text')
      const text = await requestText(packData, sel, textType, length, false)
      if (!text) { setLoadingStage(''); return }
      setGenerated(text)
      setStep('result')
    } catch {
      setError('Something went wrong building the lesson. Please try again.')
    } finally {
      setLoadingStage('')
    }
  }

  async function requestText(
    p: LessonPack,
    sel: Record<string, boolean>,
    type: string,
    len: typeof LENGTHS[number],
    skipCache: boolean
  ): Promise<GeneratedText | null> {
    const vocab = p.vocab.filter(v => sel[v.word])
    if (vocab.length === 0) { setError('Keep at least one target word.'); return null }
    const res = await fetch('/api/context-lab/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: p.topic, level: p.level, type, length: len, vocab, grammarPoints: p.grammarPoints, skipCache }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); return null }
    return data
  }

  async function regenerate(skipCache = true) {
    if (!pack) return
    setError('')
    setRevealed({})
    setGapRevealed(false)
    setLoadingStage('text')
    const text = await requestText(pack, selected, textType, length, skipCache)
    if (text) setGenerated(text)
    setLoadingStage('')
  }

  async function changeLength(newLength: typeof LENGTHS[number]) {
    setLength(newLength)
    if (!pack) return
    setError('')
    setLoadingStage('text')
    const text = await requestText(pack, selected, textType, newLength, true)
    if (text) setGenerated(text)
    setLoadingStage('')
  }

  function toggleWord(word: string) {
    setSelected(s => ({ ...s, [word]: !s[word] }))
  }

  function newTopic() {
    setStep('setup')
    setPack(null)
    setGenerated(null)
    setError('')
  }

  function handlePrint() {
    window.print()
  }

  async function handleCopy() {
    if (!generated) return
    const plain = generated.text.replace(/\*\*/g, '')
    await navigator.clipboard.writeText(`${generated.title}\n\n${plain}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const busy = loadingStage !== ''

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link href="/dashboard" style={s.headerLink}>← Somerset</Link>
        <div style={s.headerTitle}>Context Lab</div>
      </header>

      {step === 'setup' && (
        <div style={s.setupWrap}>
          <p style={s.tagline}>Learn vocabulary from context, not flashcards. Pick a topic and a level — get a lesson pack with a text that puts every word to work.</p>

          <label style={s.label}>Topic</label>
          <div style={s.chipRow}>
            {TOPIC_PRESETS.map(t => (
              <button
                key={t}
                onClick={() => { setTopic(t); setCustomTopic('') }}
                style={{ ...s.chip, ...(topic === t && !customTopic ? s.chipActive : {}) }}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            style={s.input}
            placeholder="…or type your own topic"
            value={customTopic}
            onChange={e => { setCustomTopic(e.target.value); setTopic('') }}
          />

          <label style={s.label}>Level</label>
          <div style={s.levelRow}>
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                style={{ ...s.levelBtn, ...(level === l ? s.levelBtnActive : {}) }}
              >
                <div style={s.levelCode}>{l}</div>
                <div style={s.levelDesc}>{LEVEL_DESCRIPTIONS[l]}</div>
              </button>
            ))}
          </div>

          <div style={s.optionsRow}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Text type</label>
              <select style={s.input} value={textType} onChange={e => setTextType(e.target.value)}>
                {TEXT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Length</label>
              <select style={s.input} value={length} onChange={e => setLength(e.target.value as typeof LENGTHS[number])}>
                {LENGTHS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {error && <p style={s.errorText}>{error}</p>}

          <button
            onClick={buildLesson}
            disabled={!activeTopic || busy}
            style={{ ...s.buildBtn, ...((!activeTopic || busy) ? s.buildBtnDisabled : {}) }}
          >
            {loadingStage === 'pack' ? 'Choosing vocabulary…' : loadingStage === 'text' ? 'Writing your text…' : 'Build my lesson'}
          </button>
        </div>
      )}

      {step === 'result' && pack && (
        <div style={s.resultWrap}>
          <div style={s.resultTopBar}>
            <div>
              <div style={s.resultTopic}>{pack.topic}</div>
              <div style={s.resultLevel}>{pack.level}</div>
            </div>
            <button onClick={newTopic} style={s.secondaryBtn}>New topic/level</button>
          </div>

          {/* Target vocabulary */}
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Target vocabulary</h2>
            <p style={s.sectionHint}>Uncheck a word to leave it out, then regenerate.</p>
            <div style={s.vocabList}>
              {pack.vocab.map(v => (
                <label key={v.word} style={{ ...s.vocabItem, opacity: selected[v.word] ? 1 : 0.4 }}>
                  <input type="checkbox" checked={!!selected[v.word]} onChange={() => toggleWord(v.word)} style={s.checkbox} />
                  <div>
                    <div style={s.vocabWordRow}>
                      <span style={s.vocabWord}>{v.word}</span>
                      <span style={s.vocabPos}>{v.pos}</span>
                    </div>
                    <div style={s.vocabDef}>{v.def_en}</div>
                    <div style={s.vocabDefEs}>{v.def_es}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Grammar & tenses */}
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Grammar &amp; tenses</h2>
            <div style={s.grammarList}>
              {pack.grammarPoints.map((g, i) => (
                <div key={i} style={s.grammarItem}>
                  <div style={s.grammarPoint}>{g.point}</div>
                  <div style={s.grammarWhy}>{g.why}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Controls */}
          <div style={s.controlsBar}>
            <select style={s.controlSelect} value={textType} onChange={e => { setTextType(e.target.value); regenerate(true) }}>
              {TEXT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select style={s.controlSelect} value={length} onChange={e => changeLength(e.target.value as typeof LENGTHS[number])}>
              {LENGTHS.map(l => <option key={l}>{l}</option>)}
            </select>
            <button onClick={() => regenerate(true)} disabled={busy} style={s.controlBtn}>
              {loadingStage === 'text' ? 'Writing…' : '↻ Regenerate text'}
            </button>
          </div>

          {error && <p style={s.errorText}>{error}</p>}

          {generated && (
            <>
              {/* Generated text */}
              <section style={s.section}>
                <h2 style={s.textTitle}>{generated.title}</h2>
                <div style={s.textBody}>
                  {renderHighlighted(generated.text, generated.glossary, activeGloss, setActiveGloss)}
                </div>
              </section>

              {/* Actions */}
              <div style={s.actionsRow}>
                <button onClick={handlePrint} style={s.secondaryBtn}>🖨 Print / PDF</button>
                <button onClick={handleCopy} style={s.secondaryBtn}>{copied ? '✓ Copied' : '⧉ Copy text'}</button>
              </div>

              {/* Glossary */}
              <section style={s.section}>
                <h2 style={s.sectionTitle}>Glossary</h2>
                <div style={s.glossaryList}>
                  {generated.glossary.map((g, i) => (
                    <div key={i} style={s.glossaryItem}>
                      <div style={s.vocabWordRow}>
                        <span style={s.vocabWord}>{g.word}</span>
                        <span style={s.vocabPos}>{g.pos}</span>
                      </div>
                      <div style={s.vocabDef}>{g.def_en}</div>
                      <div style={s.vocabDefEs}>{g.def_es}</div>
                      <div style={s.glossaryExample}>&ldquo;{g.example}&rdquo;</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Comprehension questions */}
              <section style={s.section}>
                <h2 style={s.sectionTitle}>Comprehension</h2>
                {generated.questions.map((q, i) => (
                  <div key={i} style={s.questionItem}>
                    <div style={s.questionText}>{i + 1}. {q.q}</div>
                    {revealed[i] ? (
                      <div style={s.answerText}>{q.answer}</div>
                    ) : (
                      <button onClick={() => setRevealed(r => ({ ...r, [i]: true }))} style={s.revealBtn}>Show answer</button>
                    )}
                  </div>
                ))}
              </section>

              {/* Gap fill */}
              <section style={s.section}>
                <h2 style={s.sectionTitle}>Gap-fill practice</h2>
                <div style={s.gapText}>{generated.gap_fill.text_with_blanks}</div>
                {gapRevealed ? (
                  <div style={s.gapAnswers}>{generated.gap_fill.answers.join(' · ')}</div>
                ) : (
                  <button onClick={() => setGapRevealed(true)} style={s.revealBtn}>Show answers</button>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function renderHighlighted(
  text: string,
  glossary: { word: string; def_en: string; def_es: string }[],
  activeGloss: string | null,
  setActiveGloss: (k: string | null) => void
) {
  const paragraphs = text.split(/\n\s*\n/)
  return paragraphs.map((para, pi) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g)
    return (
      <p key={pi} style={{ margin: '0 0 12px' }}>
        {parts.map((part, wi) => {
          const key = `${pi}-${wi}`
          if (part.startsWith('**') && part.endsWith('**')) {
            const word = part.slice(2, -2)
            const gloss = glossary.find(g => g.word.toLowerCase() === word.toLowerCase())
            const isOpen = activeGloss === key
            return (
              <span key={key} style={{ position: 'relative', display: 'inline' }}>
                <mark
                  onClick={() => setActiveGloss(isOpen ? null : key)}
                  style={{
                    background: COLORS.paper2, color: COLORS.greenDk, fontWeight: 600,
                    textDecoration: 'underline', textDecorationColor: COLORS.green,
                    cursor: 'pointer', borderRadius: 4, padding: '0 3px',
                  }}
                >
                  {word}
                </mark>
                {isOpen && (
                  <span style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 20,
                    background: COLORS.racing, color: '#fff', borderRadius: RADIUS.popover,
                    padding: '10px 14px', fontSize: 12.5, fontWeight: 400,
                    lineHeight: 1.5, minWidth: 180, maxWidth: 260, boxShadow: SHADOW.ink,
                    whiteSpace: 'normal',
                  }}>
                    <strong style={{ color: COLORS.leaf }}>{word}</strong><br />
                    {gloss ? <>{gloss.def_en}<br /><em style={{ color: 'rgba(255,255,255,0.7)' }}>{gloss.def_es}</em></> : 'No gloss available'}
                  </span>
                )}
              </span>
            )
          }
          return <span key={key}>{part}</span>
        })}
      </p>
    )
  })
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: COLORS.paper, fontFamily: FONT.sans },
  header: {
    background: COLORS.racing, color: '#fff', padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 10,
  },
  headerLink: { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  headerTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 19 },

  setupWrap: { maxWidth: 640, margin: '0 auto', padding: '24px 16px 60px', display: 'flex', flexDirection: 'column', gap: 6 },
  tagline: { fontSize: 14, color: COLORS.muted, lineHeight: 1.6, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 16, marginBottom: 8 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, background: '#fff', borderRadius: RADIUS.pill,
    padding: '8px 16px', fontSize: 13, fontWeight: 600, color: COLORS.ink, cursor: 'pointer', transition: `all 0.18s ${EASE}`,
  },
  chipActive: { background: COLORS.green, borderColor: COLORS.green, color: '#fff', boxShadow: SHADOW.green },
  input: {
    border: `1.5px solid ${COLORS.line}`, borderRadius: 12, padding: '10px 14px',
    fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff',
  },
  levelRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
  levelBtn: {
    borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, background: '#fff', borderRadius: 16,
    padding: '12px 14px', textAlign: 'left', cursor: 'pointer', transition: `all 0.18s ${EASE}`,
  },
  levelBtnActive: { borderColor: COLORS.green, background: COLORS.paper2 },
  levelCode: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 16, color: COLORS.ink },
  levelDesc: { fontSize: 11.5, color: COLORS.muted, marginTop: 2, lineHeight: 1.3 },
  optionsRow: { display: 'flex', gap: 12, marginTop: 6 },
  errorText: { color: COLORS.danger, fontSize: 13, marginTop: 10 },
  buildBtn: {
    marginTop: 24, background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill,
    padding: '15px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green, transition: `all 0.22s ${EASE}`,
  },
  buildBtnDisabled: { background: '#B9D9A6', boxShadow: 'none', cursor: 'not-allowed' },

  resultWrap: { maxWidth: 720, margin: '0 auto', padding: '18px 16px 60px', display: 'flex', flexDirection: 'column', gap: 4 },
  resultTopBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  resultTopic: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 21, color: COLORS.ink },
  resultLevel: { fontSize: 12, fontWeight: 700, color: COLORS.greenDk, letterSpacing: '0.08em' },
  secondaryBtn: {
    background: '#fff', color: COLORS.ink, border: `1.5px solid ${COLORS.line}`, borderRadius: RADIUS.pill,
    padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: `all 0.18s ${EASE}`,
  },

  section: { background: '#fff', borderRadius: RADIUS.card, padding: '20px 22px', marginTop: 16, boxShadow: SHADOW.inkSoft, border: `1px solid ${COLORS.line}` },
  sectionTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 16, color: COLORS.ink, marginBottom: 4 },
  sectionHint: { fontSize: 12, color: COLORS.muted, marginBottom: 10 },

  vocabList: { display: 'flex', flexDirection: 'column', gap: 10 },
  vocabItem: { display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' },
  checkbox: { marginTop: 4, width: 16, height: 16, accentColor: COLORS.green, flexShrink: 0 },
  vocabWordRow: { display: 'flex', alignItems: 'baseline', gap: 8 },
  vocabWord: { fontSize: 14.5, fontWeight: 700, color: COLORS.ink },
  vocabPos: { fontSize: 11, color: COLORS.muted, fontStyle: 'italic' },
  vocabDef: { fontSize: 13, color: COLORS.inkSoft, marginTop: 2 },
  vocabDefEs: { fontSize: 12.5, color: COLORS.muted, marginTop: 1 },

  grammarList: { display: 'flex', flexDirection: 'column', gap: 10 },
  grammarItem: { borderLeft: `3px solid ${COLORS.green}`, paddingLeft: 12 },
  grammarPoint: { fontSize: 14, fontWeight: 700, color: COLORS.ink },
  grammarWhy: { fontSize: 12.5, color: COLORS.muted, marginTop: 2 },

  controlsBar: { display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  controlSelect: {
    border: `1.5px solid ${COLORS.line}`, borderRadius: 12, padding: '9px 12px',
    fontSize: 13, fontFamily: 'inherit', background: '#fff',
  },
  controlBtn: {
    background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill,
    padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginLeft: 'auto', boxShadow: SHADOW.green,
  },

  textTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 21, color: COLORS.ink, marginBottom: 12 },
  textBody: { fontSize: 15.5, lineHeight: 1.85, color: COLORS.inkSoft },

  actionsRow: { display: 'flex', gap: 8, marginTop: 14 },

  glossaryList: { display: 'flex', flexDirection: 'column', gap: 12 },
  glossaryItem: { borderBottom: `1px solid ${COLORS.paper2}`, paddingBottom: 10 },
  glossaryExample: { fontSize: 12.5, color: COLORS.muted, fontStyle: 'italic', marginTop: 4 },

  questionItem: { marginBottom: 12 },
  questionText: { fontSize: 14, color: COLORS.inkSoft, marginBottom: 4 },
  revealBtn: { background: 'none', border: 'none', color: COLORS.greenDk, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: 0 },
  answerText: { fontSize: 13.5, color: COLORS.greenDk, background: COLORS.paper2, padding: '6px 12px', borderRadius: RADIUS.pill, display: 'inline-block' },

  gapText: { fontSize: 14.5, lineHeight: 1.8, color: COLORS.inkSoft, marginBottom: 10 },
  gapAnswers: { fontSize: 13.5, color: COLORS.greenDk, background: COLORS.paper2, padding: '9px 12px', borderRadius: 12 },
}
