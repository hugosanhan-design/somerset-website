// Client-side photo tiling for scanned-sheet reading (Function 4, Phase 1).
// Validated 17 Jul 2026 against a real Mock 1 student sheet — see build spec §10.
//
// Why this exists: the vision API downscales anything over ~1568px on the long side,
// which makes pencil marks on a full A4 photo unreadable and produces silent,
// high-confidence misreads. Slicing each photo into overlapping high-res tiles (plus
// one downscaled context image) keeps every region readable. Pair with the double-read
// + disagreement-flag merge in app/api/mocks/read-key/route.ts.
//
// Browser-only (canvas) — call from client components before upload:
//   const { context, tiles } = await slicePhoto(file)
//   fd.append(`photo_${i}_context`, context)
//   tiles.forEach((t, j) => fd.append(`photo_${i}_tile_${j}`, t))

export async function slicePhoto(file: File): Promise<{ context: Blob; tiles: Blob[] }> {
  const bitmap = await createImageBitmap(file)
  const toBlob = (canvas: HTMLCanvasElement) =>
    new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('slice failed'))), 'image/jpeg', 0.92))

  const draw = (sx: number, sy: number, sw: number, sh: number, maxSide: number) => {
    const scale = Math.min(1, maxSide / Math.max(sw, sh))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sw * scale)
    canvas.height = Math.round(sh * scale)
    canvas.getContext('2d')!.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    return toBlob(canvas)
  }

  const { width: w, height: h } = bitmap
  const context = await draw(0, 0, w, h, 1400)
  const tiles: Blob[] = []
  if (Math.max(w, h) > 1800) {
    const cols = 2, rows = 3, overlap = 0.15
    const tw = w / cols, th = h / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = Math.max(0, c * tw - tw * overlap)
        const sy = Math.max(0, r * th - th * overlap)
        const sw = Math.min(w - sx, tw * (1 + 2 * overlap))
        const sh = Math.min(h - sy, th * (1 + 2 * overlap))
        tiles.push(await draw(sx, sy, sw, sh, 1568))
      }
    }
  }
  bitmap.close()
  return { context, tiles }
}
