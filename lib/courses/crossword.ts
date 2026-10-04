// Small crossword builder: places words so each new one crosses an existing one,
// with no touching side by side. Runs several shuffled attempts and keeps the
// layout that fits the most words in the most compact grid.

export type Entry = { id: string; word: string; clue: string }
export type Placed = Entry & { row: number; col: number; dir: 'across' | 'down'; num: number }
export type Puzzle = { rows: number; cols: number; placed: Placed[]; cells: (string | null)[][] }

type Cell = { ch: string; dirs: Set<'across' | 'down'> }

function attempt(entries: Entry[], firstDir: 'across' | 'down'): { placed: Omit<Placed, 'num'>[]; area: number; width: number } {
  const board = new Map<string, Cell>()
  const key = (r: number, c: number) => `${r},${c}`
  const at = (r: number, c: number) => board.get(key(r, c))
  const placed: Omit<Placed, 'num'>[] = []

  const put = (e: Entry, row: number, col: number, dir: 'across' | 'down') => {
    for (let i = 0; i < e.word.length; i++) {
      const r = dir === 'down' ? row + i : row, c = dir === 'across' ? col + i : col
      const cell = at(r, c) ?? { ch: e.word[i], dirs: new Set() }
      cell.dirs.add(dir)
      board.set(key(r, c), cell)
    }
    placed.push({ ...e, row, col, dir })
  }

  // Returns the number of crossings, or -1 if the word can't go here.
  const fits = (w: string, row: number, col: number, dir: 'across' | 'down'): number => {
    const dr = dir === 'down' ? 1 : 0, dc = dir === 'across' ? 1 : 0
    if (at(row - dr, col - dc) || at(row + dr * w.length, col + dc * w.length)) return -1
    let crossings = 0
    for (let i = 0; i < w.length; i++) {
      const r = row + dr * i, c = col + dc * i
      const cell = at(r, c)
      if (cell) {
        if (cell.ch !== w[i] || cell.dirs.has(dir)) return -1
        crossings++
      } else if (at(r + dc, c + dr) || at(r - dc, c - dr)) {
        return -1
      }
    }
    return crossings
  }

  const [first, ...rest] = entries
  put(first, 0, 0, firstDir)
  for (const e of rest) {
    let best: { row: number; col: number; dir: 'across' | 'down'; score: number } | null = null
    for (const p of placed) {
      for (let i = 0; i < p.word.length; i++) {
        const pr = p.dir === 'down' ? p.row + i : p.row
        const pc = p.dir === 'across' ? p.col + i : p.col
        for (let j = 0; j < e.word.length; j++) {
          if (e.word[j] !== p.word[i]) continue
          const dir = p.dir === 'across' ? 'down' : 'across'
          const row = dir === 'down' ? pr - j : pr
          const col = dir === 'across' ? pc - j : pc
          const score = fits(e.word, row, col, dir)
          if (score > 0 && (!best || score > best.score || (score === best.score && Math.random() < 0.5))) best = { row, col, dir, score }
        }
      }
    }
    if (best) put(e, best.row, best.col, best.dir)
  }

  const rs = placed.flatMap(p => [p.row, p.dir === 'down' ? p.row + p.word.length - 1 : p.row])
  const cs = placed.flatMap(p => [p.col, p.dir === 'across' ? p.col + p.word.length - 1 : p.col])
  const width = Math.max(...cs) - Math.min(...cs) + 1
  const area = (Math.max(...rs) - Math.min(...rs) + 1) * width
  return { placed, area, width }
}

export function buildCrossword(entries: Entry[], tries = 80): Puzzle {
  const clean = entries.map(e => ({ ...e, word: e.word.toUpperCase() }))
  let best: ReturnType<typeof attempt> | null = null
  for (let t = 0; t < tries; t++) {
    const order = [...clean].sort(() => Math.random() - 0.5).sort((a, b) => b.word.length - a.word.length + (Math.random() - 0.5) * 4)
    const res = attempt(order, t % 2 ? 'down' : 'across')
    // Most words first, then the narrowest grid (phones scroll down, not sideways), then the most compact.
    const better = !best
      || res.placed.length > best.placed.length
      || (res.placed.length === best.placed.length && (res.width < best.width || (res.width === best.width && res.area < best.area)))
    if (better) best = res
  }
  const placedRaw = best!.placed
  const minR = Math.min(...placedRaw.map(p => p.row)), minC = Math.min(...placedRaw.map(p => p.col))
  const shifted = placedRaw.map(p => ({ ...p, row: p.row - minR, col: p.col - minC }))
  const rows = Math.max(...shifted.map(p => p.dir === 'down' ? p.row + p.word.length : p.row + 1))
  const cols = Math.max(...shifted.map(p => p.dir === 'across' ? p.col + p.word.length : p.col + 1))

  const cells: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null))
  for (const p of shifted) {
    for (let i = 0; i < p.word.length; i++) {
      const r = p.dir === 'down' ? p.row + i : p.row, c = p.dir === 'across' ? p.col + i : p.col
      cells[r][c] = p.word[i]
    }
  }

  // Standard numbering: reading order, one number per starting square.
  const starts = Array.from(new Set(shifted.map(p => `${p.row},${p.col}`)))
    .map(k => k.split(',').map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const numOf = new Map(starts.map(([r, c], i) => [`${r},${c}`, i + 1]))
  const placed = shifted
    .map(p => ({ ...p, num: numOf.get(`${p.row},${p.col}`)! }))
    .sort((a, b) => a.num - b.num || (a.dir === 'across' ? -1 : 1))
  return { rows, cols, placed, cells }
}
