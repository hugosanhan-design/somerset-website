// Document-scanner maths for the /scan page: find the page in a photo, flatten its
// perspective, clean up the lighting. Pure functions over raw RGBA pixel buffers (no
// DOM, no dependencies) so they run in the browser on a phone and can be tested in node.
//
// Detection is deliberately simple: a sheet of paper is the biggest bright blob in the
// frame. Otsu-threshold a small copy, take the largest bright component, and read its
// four extreme corners. It is fast enough to run on the live viewfinder several times a
// second. It fails on white paper on a white desk; the scanner then falls back to a
// default rectangle that the teacher drags into place (corner handles).

export interface Pixels { data: Uint8ClampedArray; width: number; height: number }
export type Pt = { x: number; y: number }
/** Corners in order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Pt, Pt, Pt, Pt]
export type ScanFilter = 'original' | 'auto' | 'bw' | 'grey'

// ---------------------------------------------------------------- detection

/** Detects the page. Returns corners normalised to 0..1, or null if nothing page-like. */
export function detectDocument(src: Pixels, maxSide = 160): Quad | null {
  const scale = Math.min(1, maxSide / Math.max(src.width, src.height))
  const w = Math.max(8, Math.round(src.width * scale))
  const h = Math.max(8, Math.round(src.height * scale))

  // Box-sample down to w x h, luminance only.
  const lum = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor((y * src.height) / h), y1 = Math.max(y0 + 1, Math.floor(((y + 1) * src.height) / h))
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor((x * src.width) / w), x1 = Math.max(x0 + 1, Math.floor(((x + 1) * src.width) / w))
      let sum = 0, n = 0
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
        const i = (yy * src.width + xx) * 4
        sum += 0.299 * src.data[i] + 0.587 * src.data[i + 1] + 0.114 * src.data[i + 2]
        n++
      }
      lum[y * w + x] = sum / n
    }
  }

  const blurred = boxBlur(lum, w, h, 1)
  const t = otsu(blurred)
  const mask = new Uint8Array(w * h)
  for (let i = 0; i < mask.length; i++) mask[i] = blurred[i] > t ? 1 : 0

  // Largest 4-connected bright component (iterative flood fill).
  const label = new Int32Array(w * h)
  let best = { id: 0, area: 0 }, nextId = 0
  const stack: number[] = []
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || label[s]) continue
    const id = ++nextId
    let area = 0
    stack.push(s); label[s] = id
    while (stack.length) {
      const p = stack.pop()!
      area++
      const px = p % w, py = (p - px) / w
      if (px > 0 && mask[p - 1] && !label[p - 1]) { label[p - 1] = id; stack.push(p - 1) }
      if (px < w - 1 && mask[p + 1] && !label[p + 1]) { label[p + 1] = id; stack.push(p + 1) }
      if (py > 0 && mask[p - w] && !label[p - w]) { label[p - w] = id; stack.push(p - w) }
      if (py < h - 1 && mask[p + w] && !label[p + w]) { label[p + w] = id; stack.push(p + w) }
    }
    if (area > best.area) best = { id, area }
  }

  const frac = best.area / (w * h)
  if (frac < 0.15 || frac > 0.985) return null

  // Four extreme points of the component = the page corners.
  let tl = Infinity, br = -Infinity, tr = -Infinity, bl = Infinity
  let pTL: Pt = { x: 0, y: 0 }, pBR = pTL, pTR = pTL, pBL = pTL
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (label[y * w + x] !== best.id) continue
    const sum = x + y, diff = x - y
    if (sum < tl) { tl = sum; pTL = { x, y } }
    if (sum > br) { br = sum; pBR = { x, y } }
    if (diff > tr) { tr = diff; pTR = { x, y } }
    if (diff < bl) { bl = diff; pBL = { x, y } }
  }
  // Pixel centres -> edges, normalised.
  const norm = (p: Pt, dx: number, dy: number): Pt => ({
    x: Math.min(1, Math.max(0, (p.x + dx) / w)),
    y: Math.min(1, Math.max(0, (p.y + dy) / h)),
  })
  const quad: Quad = [norm(pTL, 0, 0), norm(pTR, 1, 0), norm(pBR, 1, 1), norm(pBL, 0, 1)]

  // Sanity: the quad must be convex and roughly the size of the blob (a ragged blob
  // such as a hand over the page gives a quad much bigger than its area).
  if (!isConvex(quad)) return null
  const qa = polygonArea(quad) * w * h
  if (qa > best.area * 1.6) return null
  return quad
}

function otsu(v: Float32Array): number {
  const hist = new Float64Array(256)
  for (let i = 0; i < v.length; i++) hist[Math.min(255, Math.max(0, Math.round(v[i])))]++
  const total = v.length
  let sumAll = 0
  for (let i = 0; i < 256; i++) sumAll += i * hist[i]
  let wB = 0, sumB = 0, bestVar = -1, thr = 128
  for (let t = 0; t < 256; t++) {
    wB += hist[t]
    if (!wB) continue
    const wF = total - wB
    if (!wF) break
    sumB += t * hist[t]
    const mB = sumB / wB, mF = (sumAll - sumB) / wF
    const between = wB * wF * (mB - mF) * (mB - mF)
    if (between > bestVar) { bestVar = between; thr = t }
  }
  return thr
}

function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(src.length), out = new Float32Array(src.length)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0
    for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < w) { s += src[y * w + xx]; n++ } }
    tmp[y * w + x] = s / n
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0
    for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; n++ } }
    out[y * w + x] = s / n
  }
  return out
}

function polygonArea(q: Pt[]): number {
  let a = 0
  for (let i = 0; i < q.length; i++) { const p = q[i], n = q[(i + 1) % q.length]; a += p.x * n.y - n.x * p.y }
  return Math.abs(a) / 2
}

function isConvex(q: Pt[]): boolean {
  let sign = 0
  for (let i = 0; i < q.length; i++) {
    const a = q[i], b = q[(i + 1) % q.length], c = q[(i + 2) % q.length]
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)
    if (Math.abs(cross) < 1e-9) continue
    const s = cross > 0 ? 1 : -1
    if (sign && s !== sign) return false
    sign = s
  }
  return sign !== 0
}

/** Average corner distance (fraction of frame diagonal) between two quads; used to tell when the page is holding still. */
export function quadDistance(a: Quad, b: Quad): number {
  let d = 0
  for (let i = 0; i < 4; i++) d += Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y)
  return d / 4
}

export function defaultQuad(inset = 0.06): Quad {
  return [{ x: inset, y: inset }, { x: 1 - inset, y: inset }, { x: 1 - inset, y: 1 - inset }, { x: inset, y: 1 - inset }]
}

// ---------------------------------------------------------------- perspective warp

/** Output size that keeps the page's real proportions, longest side = maxSide. */
export function outputSize(quad: Quad, srcW: number, srcH: number, maxSide = 2000): { w: number; h: number } {
  const P = quad.map(p => ({ x: p.x * srcW, y: p.y * srcH }))
  const top = Math.hypot(P[1].x - P[0].x, P[1].y - P[0].y)
  const bottom = Math.hypot(P[2].x - P[3].x, P[2].y - P[3].y)
  const left = Math.hypot(P[3].x - P[0].x, P[3].y - P[0].y)
  const right = Math.hypot(P[2].x - P[1].x, P[2].y - P[1].y)
  let w = Math.max(top, bottom), h = Math.max(left, right)
  const k = Math.min(1, maxSide / Math.max(w, h))
  w = Math.max(16, Math.round(w * k)); h = Math.max(16, Math.round(h * k))
  return { w, h }
}

/** Maps the quad (normalised corners) onto a flat w x h rectangle, bilinear sampling. */
export function warpPerspective(src: Pixels, quad: Quad, outW: number, outH: number): Pixels {
  const P = quad.map(p => ({ x: p.x * src.width, y: p.y * src.height }))
  // Homography from output rectangle corners to source quad corners.
  const H = homography(
    [{ x: 0, y: 0 }, { x: outW, y: 0 }, { x: outW, y: outH }, { x: 0, y: outH }],
    P,
  )
  const out = new Uint8ClampedArray(outW * outH * 4)
  const sw = src.width, sh = src.height, sd = src.data
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const px = x + 0.5, py = y + 0.5
      const d = H[6] * px + H[7] * py + 1
      const sx = (H[0] * px + H[1] * py + H[2]) / d - 0.5
      const sy = (H[3] * px + H[4] * py + H[5]) / d - 0.5
      const x0 = Math.floor(sx), y0 = Math.floor(sy)
      const fx = sx - x0, fy = sy - y0
      const xa = Math.min(sw - 1, Math.max(0, x0)), xb = Math.min(sw - 1, Math.max(0, x0 + 1))
      const ya = Math.min(sh - 1, Math.max(0, y0)), yb = Math.min(sh - 1, Math.max(0, y0 + 1))
      const i00 = (ya * sw + xa) * 4, i10 = (ya * sw + xb) * 4, i01 = (yb * sw + xa) * 4, i11 = (yb * sw + xb) * 4
      const o = (y * outW + x) * 4
      for (let c = 0; c < 3; c++) {
        out[o + c] = (sd[i00 + c] * (1 - fx) + sd[i10 + c] * fx) * (1 - fy) + (sd[i01 + c] * (1 - fx) + sd[i11 + c] * fx) * fy
      }
      out[o + 3] = 255
    }
  }
  return { data: out, width: outW, height: outH }
}

/** Solves the 8-parameter homography taking points a[i] -> b[i] (Gaussian elimination). */
function homography(a: Pt[], b: Pt[]): number[] {
  const M: number[][] = []
  for (let i = 0; i < 4; i++) {
    const { x, y } = a[i], { x: u, y: v } = b[i]
    M.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u])
    M.push([0, 0, 0, x, y, 1, -v * x, -v * y, v])
  }
  for (let col = 0; col < 8; col++) {
    let piv = col
    for (let r = col + 1; r < 8; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r
    ;[M[col], M[piv]] = [M[piv], M[col]]
    const div = M[col][col] || 1e-12
    for (let c = col; c < 9; c++) M[col][c] /= div
    for (let r = 0; r < 8; r++) {
      if (r === col) continue
      const f = M[r][col]
      if (!f) continue
      for (let c = col; c < 9; c++) M[r][c] -= f * M[col][c]
    }
  }
  return M.map(row => row[8])
}

// ---------------------------------------------------------------- filters

/**
 * 'auto'   evens out shadows and makes the paper white while keeping ink colour
 *          (best for the AI to read handwriting, and the default)
 * 'bw'     the same, then hard black-and-white like a photocopy
 * 'grey'   evened-out greyscale
 * 'original' untouched
 */
export function applyFilter(img: Pixels, filter: ScanFilter): Pixels {
  if (filter === 'original') return img
  const { width: w, height: h } = img
  const d = img.data
  const out = new Uint8ClampedArray(d.length)

  // Estimate the paper brightness everywhere: shrink 8x taking the brightest pixel in
  // each cell (so ink disappears), smooth it, then look it up per pixel.
  const cell = 8
  const gw = Math.max(2, Math.ceil(w / cell)), gh = Math.max(2, Math.ceil(h / cell))
  let bg: Float32Array = new Float32Array(gw * gh)
  for (let y = 0; y < h; y++) {
    const gy = Math.min(gh - 1, (y / cell) | 0)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
      const g = gy * gw + Math.min(gw - 1, (x / cell) | 0)
      if (l > bg[g]) bg[g] = l
    }
  }
  bg = boxBlur(boxBlur(bg, gw, gh, 2), gw, gh, 2)

  for (let y = 0; y < h; y++) {
    // bilinear lookup into the coarse background grid
    const fy = Math.min(gh - 1.001, Math.max(0, y / cell - 0.5)), y0 = fy | 0, ty = fy - y0
    for (let x = 0; x < w; x++) {
      const fx = Math.min(gw - 1.001, Math.max(0, x / cell - 0.5)), x0 = fx | 0, tx = fx - x0
      const b = (bg[y0 * gw + x0] * (1 - tx) + bg[y0 * gw + x0 + 1] * tx) * (1 - ty)
              + (bg[(y0 + 1) * gw + x0] * (1 - tx) + bg[(y0 + 1) * gw + x0 + 1] * tx) * ty
      const gain = 255 / Math.max(40, b)
      const i = (y * w + x) * 4
      let r = d[i] * gain, g = d[i + 1] * gain, bl = d[i + 2] * gain
      if (filter === 'auto') {
        // Levels: pull the near-white paper to pure white, deepen the ink a little.
        r = level(r); g = level(g); bl = level(bl)
      } else {
        const l = level(0.299 * r + 0.587 * g + 0.114 * bl)
        if (filter === 'bw') { const v = l > 150 ? 255 : 0; r = g = bl = v }
        else { r = g = bl = l }
      }
      out[i] = r; out[i + 1] = g; out[i + 2] = bl; out[i + 3] = 255
    }
  }
  return { data: out, width: w, height: h }
}

function level(v: number): number {
  // black point 30, white point 235, mild gamma so pencil stays visible
  const t = Math.min(1, Math.max(0, (v - 30) / (235 - 30)))
  return 255 * Math.pow(t, 1.15)
}

/** Rotates 90 degrees clockwise (times times). */
export function rotate90(img: Pixels, times = 1): Pixels {
  let cur = img
  for (let n = 0; n < ((times % 4) + 4) % 4; n++) {
    const { width: w, height: h, data } = cur
    const out = new Uint8ClampedArray(data.length)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4, dx = h - 1 - y, dy = x, o = (dy * h + dx) * 4
      out[o] = data[s]; out[o + 1] = data[s + 1]; out[o + 2] = data[s + 2]; out[o + 3] = data[s + 3]
    }
    cur = { data: out, width: h, height: w }
  }
  return cur
}
