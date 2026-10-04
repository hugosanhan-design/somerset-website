'use client'

import { useEffect, useRef, useState } from 'react'
import { buildCrossword, type Placed } from '@/lib/courses/crossword'
import type { WordItem } from '@/lib/courses/b1u1'

type Dir = 'across' | 'down'

// Clue → typed word, on a real grid. "Check" locks every finished word that is right;
// a word solved on the first check counts as a clean recall, later or revealed ones don't.
export default function Crossword({ items, onRecord, onDone }: {
  items: WordItem[]
  onRecord: (id: string, clean: boolean) => void
  onDone: (summary: { clean: number; total: number }) => void
}) {
  // One puzzle per game: kept in state so the grid and the answers can never drift apart.
  const [puzzle] = useState(() => buildCrossword(items.map(i => ({ id: i.id, word: i.answer, clue: i.clue }))))
  const { rows, cols, placed, cells } = puzzle
  const [grid, setGrid] = useState<string[][]>(() => cells.map(r => r.map(() => '')))
  const [sel, setSel] = useState<{ r: number; c: number; dir: Dir }>(() => ({ r: placed[0].row, c: placed[0].col, dir: placed[0].dir }))
  const [solved, setSolved] = useState<Record<string, 'clean' | 'late' | 'revealed'>>({})
  const [missed, setMissed] = useState<Set<string>>(new Set())
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set())
  const refs = useRef<Record<string, HTMLInputElement | null>>({})

  const wordsAt = (r: number, c: number) => placed.filter(p =>
    p.dir === 'across' ? p.row === r && c >= p.col && c < p.col + p.word.length : p.col === c && r >= p.row && r < p.row + p.word.length)
  const active: Placed | undefined = wordsAt(sel.r, sel.c).find(p => p.dir === sel.dir) ?? wordsAt(sel.r, sel.c)[0]
  const inActive = (r: number, c: number) => !!active && wordsAt(r, c).some(p => p.id === active.id)
  const cellsOf = (p: Placed) => Array.from({ length: p.word.length }, (_, i) => p.dir === 'across' ? [p.row, p.col + i] : [p.row + i, p.col])
  const isLocked = (r: number, c: number) => wordsAt(r, c).some(p => solved[p.id])
  const numAt = new Map(placed.map(p => [`${p.row},${p.col}`, p.num]))

  useEffect(() => { refs.current[`${sel.r},${sel.c}`]?.focus() }, [sel])

  const allDone = placed.every(p => solved[p.id])
  useEffect(() => {
    if (!allDone) return
    const clean = placed.filter(p => solved[p.id] === 'clean').length
    const t = setTimeout(() => onDone({ clean, total: placed.length }), 1400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone])

  function select(r: number, c: number) {
    const here = wordsAt(r, c)
    if (sel.r === r && sel.c === c && here.length > 1) setSel({ r, c, dir: sel.dir === 'across' ? 'down' : 'across' })
    else setSel({ r, c, dir: here.some(p => p.dir === sel.dir) ? sel.dir : here[0].dir })
  }

  function step(r: number, c: number, delta: number) {
    if (!active) return
    const list = cellsOf(active)
    const i = list.findIndex(([rr, cc]) => rr === r && cc === c)
    let j = i + delta
    while (j >= 0 && j < list.length && isLocked(list[j][0], list[j][1])) j += delta
    if (j < 0 || j >= list.length) return
    // Move focus right now, not after the re-render, so fast typing lands in the right square.
    refs.current[`${list[j][0]},${list[j][1]}`]?.focus()
    setSel({ r: list[j][0], c: list[j][1], dir: active.dir })
  }

  // Handles one keystroke or a whole pasted / predicted word: letters spread along the
  // active word from this square, skipping squares already locked as correct.
  function type(r: number, c: number, raw: string) {
    const prev = grid[r][c]
    let letters = raw.toUpperCase().replace(/[^A-Z]/g, '')
    if (prev && letters.length > 1 && letters.startsWith(prev)) letters = letters.slice(prev.length)
    else if (prev && letters.length > 1 && letters.endsWith(prev)) letters = letters.slice(0, -prev.length)
    if (!letters) {
      if (!isLocked(r, c)) setGrid(g => g.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? '' : v))))
      return
    }
    const list = active ? cellsOf(active) : [[r, c]]
    const writes: [number, number, string][] = []
    if (letters.length > 1 && letters.length === list.length) {
      list.forEach(([rr, cc], k) => { if (!isLocked(rr, cc)) writes.push([rr, cc, letters[k]]) })
    } else {
      let i = Math.max(0, list.findIndex(([rr, cc]) => rr === r && cc === c))
      for (const ch of letters) {
        while (i < list.length && isLocked(list[i][0], list[i][1])) i++
        if (i >= list.length) break
        writes.push([list[i][0], list[i][1], ch]); i++
      }
    }
    setGrid(g => g.map((row, ri) => row.map((v, ci) => writes.find(([wr, wc]) => wr === ri && wc === ci)?.[2] ?? v)))
    setWrongCells(w => { const n = new Set(w); writes.forEach(([wr, wc]) => n.delete(`${wr},${wc}`)); return n })
    const last = writes[writes.length - 1]
    if (last) step(last[0], last[1], 1)
  }

  function check() {
    const nextSolved = { ...solved }
    const nextMissed = new Set(missed)
    const wrong = new Set<string>()
    for (const p of placed) {
      if (solved[p.id]) continue
      const letters = cellsOf(p).map(([r, c]) => grid[r][c])
      if (!letters.every(Boolean)) continue
      if (letters.join('') === p.word) {
        const clean = !missed.has(p.id)
        nextSolved[p.id] = clean ? 'clean' : 'late'
        onRecord(p.id, clean)
      } else {
        nextMissed.add(p.id)
        cellsOf(p).forEach(([r, c]) => { if (grid[r][c] !== cells[r][c]) wrong.add(`${r},${c}`) })
      }
    }
    setSolved(nextSolved)
    setMissed(nextMissed)
    setWrongCells(wrong)
  }

  function reveal() {
    if (!active || solved[active.id]) return
    setGrid(g => g.map((row, r) => row.map((v, c) => (cellsOf(active).some(([rr, cc]) => rr === r && cc === c) ? cells[r][c]! : v))))
    setSolved(s => ({ ...s, [active.id]: 'revealed' }))
    onRecord(active.id, false)
  }

  // Page, card and board padding plus the 3px gaps all come out of the screen width.
  const cellPx = `min(38px, calc((100vw - ${96 + 3 * (cols - 1)}px) / ${cols}))`
  const filledCount = placed.filter(p => cellsOf(p).every(([r, c]) => grid[r][c])).length

  return (
    <div className="xw">
      {active && (
        <div className="xw-current">
          <span className="xw-current-num">{active.num} {active.dir}</span>
          <span>{active.clue}</span>
        </div>
      )}
      <div className="xw-board" style={{ gridTemplateColumns: `repeat(${cols}, ${cellPx})`, gridAutoRows: cellPx }}>
        {cells.map((row, r) => row.map((ch, c) => {
          if (!ch) return <span key={`${r},${c}`} className="xw-void" />
          const k = `${r},${c}`
          const locked = isLocked(r, c)
          const lockedState = wordsAt(r, c).map(p => solved[p.id]).find(Boolean)
          const cls = ['xw-cell',
            inActive(r, c) ? 'xw-word' : '',
            sel.r === r && sel.c === c ? 'xw-sel' : '',
            locked ? (lockedState === 'revealed' ? 'xw-revealed' : 'xw-ok') : '',
            wrongCells.has(k) ? 'xw-bad' : '',
          ].join(' ')
          return (
            <label key={k} className={cls} onClick={() => select(r, c)}>
              {numAt.has(k) && <span className="xw-num">{numAt.get(k)}</span>}
              <input
                ref={el => { refs.current[k] = el }}
                value={grid[r][c]}
                inputMode="text" autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false}
                aria-label={`Row ${r + 1} column ${c + 1}`}
                onChange={e => type(r, c, e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Backspace' && !grid[r][c]) { e.preventDefault(); step(r, c, -1) }
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(r, c, 1) }
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(r, c, -1) }
                  if (e.key === 'Enter') { e.preventDefault(); check() }
                }}
              />
            </label>
          )
        }))}
      </div>


      <div className="xw-clues">
        {(['across', 'down'] as Dir[]).map(dir => (
          <div key={dir}>
            <h4>{dir === 'across' ? 'Across' : 'Down'}</h4>
            <ol>
              {placed.filter(p => p.dir === dir).map(p => (
                <li key={p.id} className={`${active?.id === p.id ? 'on' : ''} ${solved[p.id] ? 'done' : ''}`}
                  onClick={() => {
                    const open = cellsOf(p).find(([rr, cc]) => !isLocked(rr, cc)) ?? [p.row, p.col]
                    setSel({ r: open[0], c: open[1], dir: p.dir })
                  }}>
                  <b>{p.num}</b> {p.clue} <span className="xw-len">({p.word.length})</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="row">
        {allDone
          ? <span className="done-pill">✓ Crossword complete</span>
          : <>
              <button type="button" className="btn" onClick={check} disabled={filledCount === 0}>Check</button>
              <button type="button" className="help-btn" onClick={reveal}>Reveal this word</button>
              <span className="xw-hint">{Object.keys(solved).length} of {placed.length} done · a word right on its first check moves up a level</span>
            </>}
      </div>
    </div>
  )
}
