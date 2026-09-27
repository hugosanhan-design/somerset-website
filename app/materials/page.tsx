'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BOOKS } from '@/data/books'
import { COLORS, FONT, RADIUS, header, headerBrand, headerLink, h1, eyebrow, card, btnPrimary, btnGhost, chip, chipActive, input } from '@/lib/theme'

interface Group { id: string; name: string; level: string }

const ACTIVITIES = [
  { key: 'worksheet', label: '📝 Worksheet', desc: 'Mixed practice, 4-5 exercises' },
  { key: 'vocabulary', label: '🔤 Vocabulary', desc: 'Matching, gap-fill, personalisation' },
  { key: 'grammar', label: '🧩 Grammar', desc: 'Rule box + controlled → free practice' },
  { key: 'reading', label: '📖 Reading', desc: 'Level-true text + comprehension' },
  { key: 'infogap', label: '🗣️ Info-gap speaking', desc: 'Cut-out cards, pair/trio speaking' },
  { key: 'roleplay', label: '🎭 Role-play', desc: 'Valencia-set mini play + adaptation' },
  { key: 'revision', label: '🏆 Revision game', desc: 'Team quiz rounds, whole class' },
]

export default function MaterialsPage() {
  const [bookId, setBookId] = useState<string>(BOOKS[0].id)
  const book = BOOKS.find(b => b.id === bookId) ?? BOOKS[0]
  const units = book.units
  const [unit, setUnit] = useState<number>(BOOKS[0].units[0]?.unit ?? 1)
  const [groups, setGroups] = useState<Group[]>([])
  const [groupId, setGroupId] = useState('')
  const [studentCount, setStudentCount] = useState(6)
  const [activityType, setActivityType] = useState('worksheet')
  const [grammarFocus, setGrammarFocus] = useState('')
  const [focusNotes, setFocusNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ html: string; title: string } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    fetch('/api/groups').then(r => r.ok ? r.json() : []).then(d => setGroups(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  function pickUnit(u: number) {
    setUnit(u)
    const data = units.find(x => x.unit === u)
    setGrammarFocus(data?.grammar?.join(' · ') || '')
  }

  function pickBook(id: string) {
    const next = BOOKS.find(b => b.id === id)
    if (!next) return
    setBookId(id)
    const first = next.units[0]
    setUnit(first?.unit ?? 1)
    setGrammarFocus(first?.grammar?.join(' · ') || '')
  }

  const selectedUnit = units.find(u => u.unit === unit)
  const selectedGroup = groups.find(g => g.id === groupId)

  async function generate() {
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/materials/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          unit,
          activityType,
          studentCount,
          groupLabel: selectedGroup ? `${selectedGroup.name}${selectedGroup.level ? ' (' + selectedGroup.level + ')' : ''}` : '',
          grammarFocus: grammarFocus.trim(),
          focusNotes: focusNotes.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'Generation failed. Please try again.'); return }
      setResult(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function printMaterial() {
    iframeRef.current?.contentWindow?.print()
  }

  function downloadMaterial() {
    if (!result) return
    const blob = new Blob([result.html], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${result.title.replace(/[^a-z0-9]+/gi, '-')}-Unit${unit}.html`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.paper, fontFamily: FONT.sans, color: COLORS.ink }}>
      <header style={header}>
        <Link href="/dashboard" style={headerBrand}>Somerset</Link>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Class Materials</span>
        <div style={{ flex: 1 }} />
        <Link href="/groups" style={headerLink}>My Groups</Link>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 22px 70px' }}>
        <div style={eyebrow}>{book.name}{book.publisher ? ` · ${book.publisher}` : ''}</div>
        <h1 style={{ ...h1, marginTop: 4, marginBottom: 6 }}>Make a class material</h1>
        <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 24 }}>
          Choose the unit, who&apos;s coming, and what you want to do. The material is built from the book&apos;s own vocabulary reference and the Somerset house rules. You still read it before you print it.
        </p>

        {/* ── Book ── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={sectionLabel}>1 · Which book</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BOOKS.map(b => (
              <button key={b.id} onClick={() => pickBook(b.id)} style={{ ...chip, ...(bookId === b.id ? chipActive : {}) }}>
                {b.name} · {b.level}
              </button>
            ))}
          </div>
          {!book.verified && (
            <div style={{ fontSize: 12, color: '#B4462A', marginTop: 10 }}>
              This book&apos;s unit data has not been checked against the publisher&apos;s own pages. Read anything it produces carefully.
            </div>
          )}
          {book.note && (
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8 }}>{book.note}</div>
          )}
        </div>

        {/* ── Unit ── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={sectionLabel}>2 · Book unit</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {units.map(u => (
              <button key={u.unit} onClick={() => pickUnit(u.unit)} style={{ ...chip, ...(unit === u.unit ? chipActive : {}) }}>
                {u.unit} · {u.title}
              </button>
            ))}
          </div>
          {selectedUnit && (
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 10 }}>
              {selectedUnit.sections.reduce((n, sec) => n + sec.words.length, 0)} words across{' '}
              {selectedUnit.sections.map(sec => sec.name.toLowerCase()).join(', ')}
              {selectedUnit.sbPages ? ` · Student's Book pages ${selectedUnit.sbPages}` : ''}
              {selectedUnit.grammar?.length ? ` · grammar: ${selectedUnit.grammar.join(', ')}` : ''}
            </div>
          )}
        </div>

        {/* ── Class ── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={sectionLabel}>3 · Class and students coming</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 240px' }}>
              <label style={fieldLabel}>Group (optional)</label>
              <select value={groupId} onChange={e => setGroupId(e.target.value)} style={{ ...input, cursor: 'pointer' }}>
                <option value="">No group, ad hoc class</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}{g.level ? ` · ${g.level}` : ''}</option>
                ))}
              </select>
            </div>
            <div style={{ width: 150 }}>
              <label style={fieldLabel}>Students coming</label>
              <input
                type="number" min={1} max={30} value={studentCount}
                onChange={e => setStudentCount(Number(e.target.value))}
                style={input}
              />
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, paddingBottom: 10 }}>
              {groupingLabel(studentCount)}
            </div>
          </div>
        </div>

        {/* ── Activity ── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={sectionLabel}>4 · Activity type</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {ACTIVITIES.map(a => (
              <button
                key={a.key}
                onClick={() => setActivityType(a.key)}
                style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                  fontFamily: FONT.sans,
                  borderWidth: 2, borderStyle: 'solid',
                  borderColor: activityType === a.key ? COLORS.green : COLORS.line,
                  background: activityType === a.key ? '#F2F9EC' : '#fff',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink }}>{a.label}</div>
                <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 3 }}>{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Focus ── */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={sectionLabel}>5 · Focus (optional)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={fieldLabel}>Grammar focus</label>
              <input
                value={grammarFocus} onChange={e => setGrammarFocus(e.target.value)}
                placeholder="e.g. present perfect vs past simple, leave empty for vocabulary-led"
                style={input}
              />
            </div>
            <div>
              <label style={fieldLabel}>Anything else the material should do</label>
              <input
                value={focusNotes} onChange={e => setFocusNotes(e.target.value)}
                placeholder="e.g. they loved the football topic last week · keep it calm, Friday evening class"
                style={input}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <button onClick={generate} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Building your material…' : '✦ Make it'}
          </button>
          {loading && <span style={{ fontSize: 12.5, color: COLORS.muted }}>Usually 20 to 40 seconds, it writes the whole thing from the unit wordlist.</span>}
          {error && <span style={{ fontSize: 13, color: COLORS.danger, fontWeight: 600 }}>{error}</span>}
        </div>

        {/* ── Result ── */}
        {result && (
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${COLORS.line}`, background: '#fff' }}>
              <div style={{ fontFamily: FONT.serif, fontSize: 15.5, fontWeight: 500, flex: 1 }}>{result.title}</div>
              <button onClick={printMaterial} style={btnPrimary}>🖨️ Print</button>
              <button onClick={downloadMaterial} style={btnGhost}>Download</button>
              <button onClick={generate} style={btnGhost}>↻ Regenerate</button>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={result.html}
              title="Generated material"
              style={{ width: '100%', height: '75vh', border: 'none', background: '#fff' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function groupingLabel(n: number): string {
  if (!n || n < 1) return ''
  if (n === 1) return 'One to one, tasks adapt to teacher and student'
  if (n === 2) return 'Grouping: 1 pair'
  if (n === 4) return 'Grouping: 2 pairs'
  const trios = n % 3 === 0 ? n / 3 : n % 3 === 2 ? (n - 2) / 3 : (n - 4) / 3
  const pairs = n % 3 === 0 ? 0 : n % 3 === 2 ? 1 : 2
  return `Grouping: ${trios ? `${trios} trio${trios > 1 ? 's' : ''}` : ''}${trios && pairs ? ' + ' : ''}${pairs ? `${pairs} pair${pairs > 1 ? 's' : ''}` : ''}`
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
  color: COLORS.muted, marginBottom: 12,
}
const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: COLORS.inkSoft, marginBottom: 5,
}
