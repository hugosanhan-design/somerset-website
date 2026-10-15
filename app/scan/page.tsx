'use client'

// Phone-first document scanner, Adobe Scan style. Pick group → student → work type,
// then scan as many pages as the document has: live camera with a page outline that
// snaps onto the sheet (and can auto-capture when it holds still), drag-the-corners
// crop, perspective flattening, and Auto / B&W / Grey clean-up. All pages of one
// document are saved as ONE entry (it used to be one photo per entry, which is why a
// three-page exam arrived as three separate exercises).
//
// No AI call here — that happens later at the laptop in /correct-queue. Pages are
// uploaded one at a time (each is well under Vercel's ~4.5MB body limit; a whole
// document in one request would not be), then the entry is saved with the page list.
// The maths (detection, warp, filters) lives in lib/docScan.ts.

import { useState, useEffect, useRef, useCallback } from 'react'
import SomersetLogo from '@/components/SomersetLogo'
import BackToDashboard from '@/components/BackToDashboard'
import {
  detectDocument, defaultQuad, quadDistance, outputSize, warpPerspective, applyFilter, rotate90,
  type Quad, type ScanFilter, type Pixels,
} from '@/lib/docScan'

interface Group { id: string; name: string }
interface Student { id: string; name: string; group_id: string | null; group_name: string }
interface Assessment { id: string; title: string; date: string; key_confirmed: number }

interface Page {
  id: string
  orig: Blob          // the untouched capture, kept so a page can be re-cropped later
  quad: Quad
  filter: ScanFilter
  rot: number         // quarter turns clockwise
  out: Blob           // the finished, flattened, cleaned JPEG that gets uploaded
  thumb: string       // object URL of `out`, for the strip
  url?: string        // set once uploaded, so a retry never re-uploads
}

const WORK_TYPES = [
  { value: 'exam', label: 'Exam' },
  { value: 'essay', label: 'Essay' },
  { value: 'class_exercise', label: 'Class exercise' },
  { value: 'homework', label: 'Homework' },
  { value: 'speaking', label: 'Speaking' },
]

const FILTERS: { value: ScanFilter; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'bw', label: 'B&W' },
  { value: 'grey', label: 'Grey' },
  { value: 'original', label: 'Original' },
]

const GREEN = '#6BAE2E'
const RACING = '#1E4227'
const INK = '#222222'
const MUTED = '#777777'
const LINE = '#DDDDDD'
const MAX_ORIG = 2800   // longest side kept for the untouched capture

let pageCounter = 0
const newPageId = () => `p${Date.now()}-${pageCounter++}`

// ------------------------------------------------------------------ image helpers

async function blobToCanvas(blob: Blob, maxSide = MAX_ORIG): Promise<HTMLCanvasElement> {
  let bmp: ImageBitmap
  try { bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' }) }
  catch { bmp = await createImageBitmap(blob) }
  const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close?.()
  return c
}

function canvasPixels(c: HTMLCanvasElement): Pixels {
  const id = c.getContext('2d')!.getImageData(0, 0, c.width, c.height)
  return { data: id.data, width: id.width, height: id.height }
}

function pixelsToCanvas(p: Pixels): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = p.width; c.height = p.height
  c.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(p.data), p.width, p.height), 0, 0)
  return c
}

function canvasToBlob(c: HTMLCanvasElement, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', quality))
}

/** Crop + flatten + rotate + clean one capture into its final JPEG. */
async function renderFinal(orig: Blob, quad: Quad, filter: ScanFilter, rot: number, maxSide = 2000): Promise<Blob> {
  const src = canvasPixels(await blobToCanvas(orig))
  const { w, h } = outputSize(quad, src.width, src.height, maxSide)
  const flat = warpPerspective(src, quad, w, h)
  const out = applyFilter(rotate90(flat, rot), filter)
  return canvasToBlob(pixelsToCanvas(out))
}

// ------------------------------------------------------------------ camera

function Camera({ pageCount, onCapture, onFiles, onClose }: {
  pageCount: number
  onCapture: (b: Blob) => void
  onFiles: (files: File[]) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const probeRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const quadRef = useRef<Quad | null>(null)
  const stableSince = useRef(0)
  const capturing = useRef(false)
  const autoRef = useRef(true)
  const galleryRef = useRef<HTMLInputElement>(null)
  const fallbackRef = useRef<HTMLInputElement>(null)

  const [dims, setDims] = useState({ w: 3, h: 4 })
  const [quad, setQuad] = useState<Quad | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [auto, setAuto] = useState(true)
  const [torch, setTorch] = useState<boolean | null>(null)  // null = no torch on this device
  const [flash, setFlash] = useState(false)
  const [holding, setHolding] = useState(0)                 // 0..1 progress towards auto-capture

  const snap = useCallback(async () => {
    const v = videoRef.current
    if (!v || !v.videoWidth || capturing.current) return
    capturing.current = true
    const k = Math.min(1, MAX_ORIG / Math.max(v.videoWidth, v.videoHeight))
    const c = document.createElement('canvas')
    c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k)
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
    setFlash(true); setTimeout(() => setFlash(false), 140)
    try { onCapture(await canvasToBlob(c, 0.92)) } catch { capturing.current = false }
  }, [onCapture])

  // open the rear camera at the highest resolution it offers
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!navigator.mediaDevices?.getUserMedia) { setError('This browser cannot open the camera here.'); return }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 4096 }, height: { ideal: 3072 } },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        const v = videoRef.current!
        v.srcObject = stream
        await v.play().catch(() => {})
        const track = stream.getVideoTracks()[0]
        const caps = (track.getCapabilities?.() || {}) as MediaTrackCapabilities & { torch?: boolean; focusMode?: string[] }
        if (caps.torch) setTorch(false)
        if (caps.focusMode?.includes('continuous')) {
          track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] }).catch(() => {})
        }
      } catch {
        if (!cancelled) setError('Camera permission was blocked or no camera was found.')
      }
    })()
    return () => { cancelled = true; streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  // live page outline: look at the viewfinder four times a second
  useEffect(() => {
    if (error) return
    let alive = true
    const tick = () => {
      if (!alive) return
      const v = videoRef.current
      if (v && v.videoWidth && !capturing.current) {
        if (dims.w !== v.videoWidth || dims.h !== v.videoHeight) setDims({ w: v.videoWidth, h: v.videoHeight })
        const probe = (probeRef.current ||= document.createElement('canvas'))
        const k = 200 / Math.max(v.videoWidth, v.videoHeight)
        probe.width = Math.round(v.videoWidth * k); probe.height = Math.round(v.videoHeight * k)
        const ctx = probe.getContext('2d', { willReadFrequently: true })!
        ctx.drawImage(v, 0, 0, probe.width, probe.height)
        const id = ctx.getImageData(0, 0, probe.width, probe.height)
        const q = detectDocument({ data: id.data, width: id.width, height: id.height }, 200)
        const prev = quadRef.current
        quadRef.current = q
        setQuad(q)
        // hold-still timer for auto-capture
        if (q && prev && quadDistance(q, prev) < 0.012) {
          if (!stableSince.current) stableSince.current = Date.now()
          const held = Date.now() - stableSince.current
          setHolding(autoRef.current ? Math.min(1, held / 1200) : 0)
          if (autoRef.current && held >= 1200) { stableSince.current = 0; setHolding(0); snap() }
        } else { stableSince.current = 0; setHolding(0) }
      }
      setTimeout(tick, 250)
    }
    tick()
    return () => { alive = false }
  }, [error, dims.w, dims.h, snap])

  function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track || torch === null) return
    const next = !torch
    track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] }).then(() => setTorch(next)).catch(() => {})
  }

  const boxStyle: React.CSSProperties = {
    position: 'relative', margin: '0 auto', background: '#000', overflow: 'hidden',
    height: `min(calc(100dvh - 180px), calc(100vw * ${dims.h} / ${dims.w}))`,
    aspectRatio: `${dims.w} / ${dims.h}`, maxWidth: '100%',
  }

  return (
    <div style={overlay}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', color: '#fff' }}>
        <button onClick={onClose} style={ghostBtn}>{pageCount > 0 ? `Done (${pageCount})` : 'Close'}</button>
        <div style={{ fontSize: 13, opacity: 0.85 }}>{quad ? (auto ? 'Hold still to capture' : 'Page found') : 'Point at the page'}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {torch !== null && <button onClick={toggleTorch} style={{ ...ghostBtn, background: torch ? GREEN : 'rgba(255,255,255,0.15)' }}>Light</button>}
          <button onClick={() => { setAuto(a => { autoRef.current = !a; return !a }); stableSince.current = 0; setHolding(0) }}
            style={{ ...ghostBtn, background: auto ? GREEN : 'rgba(255,255,255,0.15)' }}>Auto</button>
        </div>
      </div>

      {error ? (
        <div style={{ color: '#fff', textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ marginBottom: 20 }}>{error}</p>
          <button style={btnPrimary} onClick={() => fallbackRef.current?.click()}>Take a photo instead</button>
        </div>
      ) : (
        <div style={boxStyle}>
          <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', display: 'block' }} />
          <svg viewBox="0 0 1 1" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {quad && (
              <polygon
                points={quad.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(107,174,46,0.22)" stroke={GREEN} strokeWidth={3} vectorEffect="non-scaling-stroke" strokeLinejoin="round"
              />
            )}
          </svg>
          {holding > 0 && (
            <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, width: `${holding * 100}%`, background: GREEN, transition: 'width 0.25s linear' }} />
          )}
          {flash && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.8 }} />}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '14px 10px 22px' }}>
        <button onClick={() => galleryRef.current?.click()} style={ghostBtn}>Gallery</button>
        <button
          onClick={() => (error ? fallbackRef.current?.click() : snap())}
          aria-label="Capture"
          style={{ width: 70, height: 70, borderRadius: '50%', border: '5px solid #fff', background: GREEN, cursor: 'pointer' }}
        />
        <div style={{ width: 70, textAlign: 'center', color: '#fff', fontSize: 13 }}>{pageCount > 0 ? `${pageCount} page${pageCount === 1 ? '' : 's'}` : ''}</div>
      </div>

      <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { const f = Array.from(e.target.files || []); e.target.value = ''; if (f.length) onFiles(f) }} />
      <input ref={fallbackRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={e => { const f = Array.from(e.target.files || []); e.target.value = ''; if (f.length) onFiles(f) }} />
    </div>
  )
}

// ------------------------------------------------------------------ crop + clean-up

type Handle = 0 | 1 | 2 | 3

function Editor({ orig, initial, canRetake, onDone, onCancel, onRetake }: {
  orig: Blob
  initial?: { quad: Quad; filter: ScanFilter; rot: number }
  canRetake: boolean
  onDone: (r: { quad: Quad; filter: ScanFilter; rot: number }) => void
  onCancel: () => void
  onRetake: () => void
}) {
  const [step, setStep] = useState<'crop' | 'clean'>('crop')
  const [src, setSrc] = useState<Pixels | null>(null)
  const [dispUrl, setDispUrl] = useState<string>('')
  const [quad, setQuad] = useState<Quad>(initial?.quad || defaultQuad())
  const [filter, setFilter] = useState<ScanFilter>(initial?.filter || 'auto')
  const [rot, setRot] = useState(initial?.rot || 0)
  const [found, setFound] = useState<boolean | null>(initial ? true : null)
  const [busy, setBusy] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLCanvasElement>(null)
  const flatRef = useRef<Pixels | null>(null)
  const drag = useRef<Handle | null>(null)

  // load the capture, auto-detect the page unless we are re-editing
  useEffect(() => {
    let url = ''
    ;(async () => {
      const c = await blobToCanvas(orig, MAX_ORIG)
      const px = canvasPixels(c)
      setSrc(px)
      const small = document.createElement('canvas')
      const k = Math.min(1, 1400 / Math.max(c.width, c.height))
      small.width = Math.round(c.width * k); small.height = Math.round(c.height * k)
      small.getContext('2d')!.drawImage(c, 0, 0, small.width, small.height)
      url = small.toDataURL('image/jpeg', 0.85)
      setDispUrl(url)
      if (!initial) {
        const q = detectDocument(px, 220)
        if (q) { setQuad(q); setFound(true) } else setFound(false)
      }
    })()
  }, [orig, initial])

  // preview the flattened, cleaned page whenever the clean-up step is showing
  useEffect(() => {
    if (step !== 'clean' || !src) return
    setBusy(true)
    const t = setTimeout(() => {
      if (!flatRef.current) {
        const { w, h } = outputSize(quad, src.width, src.height, 1100)
        flatRef.current = warpPerspective(src, quad, w, h)
      }
      const shown = applyFilter(rotate90(flatRef.current, rot), filter)
      const cv = resultRef.current
      if (cv) {
        cv.width = shown.width; cv.height = shown.height
        cv.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(shown.data), shown.width, shown.height), 0, 0)
      }
      setBusy(false)
    }, 30)
    return () => clearTimeout(t)
  }, [step, src, quad, filter, rot])

  function moveHandle(e: React.PointerEvent) {
    if (drag.current === null || !boxRef.current) return
    const r = boxRef.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    const i = drag.current
    setQuad(q => q.map((p, j) => (j === i ? { x, y } : p)) as Quad)
    flatRef.current = null
  }

  const aspect = src ? src.width / src.height : 3 / 4

  return (
    <div style={overlay}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', color: '#fff' }}>
        <button onClick={step === 'clean' ? () => setStep('crop') : onCancel} style={ghostBtn}>{step === 'clean' ? 'Back' : 'Cancel'}</button>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{step === 'crop' ? 'Adjust the corners' : 'Clean up'}</div>
        {step === 'crop'
          ? <button onClick={() => setStep('clean')} disabled={!src} style={{ ...ghostBtn, background: GREEN }}>Next</button>
          : <button onClick={() => onDone({ quad, filter, rot })} disabled={busy} style={{ ...ghostBtn, background: GREEN }}>Keep page</button>}
      </div>

      {step === 'crop' ? (
        <>
          <div
            ref={boxRef}
            onPointerMove={moveHandle}
            onPointerUp={() => { drag.current = null }}
            onPointerCancel={() => { drag.current = null }}
            style={{ position: 'relative', margin: '0 auto', touchAction: 'none', background: '#111',
              height: `min(calc(100dvh - 190px), calc(100vw / ${aspect}))`, aspectRatio: `${aspect}`, maxWidth: '100%' }}
          >
            {dispUrl && <img src={dispUrl} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }} />}
            <svg viewBox="0 0 1 1" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <polygon points={quad.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(107,174,46,0.18)" stroke={GREEN} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
            </svg>
            {quad.map((p, i) => (
              <div
                key={i}
                onPointerDown={e => { drag.current = i as Handle; (e.target as HTMLElement).setPointerCapture(e.pointerId) }}
                style={{
                  position: 'absolute', left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: 44, height: 44, marginLeft: -22, marginTop: -22,
                  borderRadius: '50%', border: `3px solid ${GREEN}`, background: 'rgba(255,255,255,0.35)', touchAction: 'none', cursor: 'grab',
                }}
              />
            ))}
          </div>
          <div style={{ color: '#fff', textAlign: 'center', fontSize: 13, padding: '10px 14px 4px', opacity: 0.85 }}>
            {found === false ? 'Could not find the page edges. Drag the corners onto the paper.' : 'Drag the circles so the outline sits on the page edges.'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '6px 10px 20px', flexWrap: 'wrap' }}>
            {canRetake && <button onClick={onRetake} style={ghostBtn}>Retake</button>}
            <button
              onClick={() => { if (src) { const q = detectDocument(src, 220); if (q) { setQuad(q); setFound(true) } else setFound(false); flatRef.current = null } }}
              style={ghostBtn}>Auto-detect</button>
            <button onClick={() => { setQuad([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]); flatRef.current = null }} style={ghostBtn}>Whole photo</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100dvh - 190px)', padding: '0 8px', position: 'relative' }}>
            <canvas ref={resultRef} style={{ maxWidth: '100%', maxHeight: '100%', background: '#fff', boxShadow: '0 2px 18px rgba(0,0,0,0.5)' }} />
            {busy && <div style={{ position: 'absolute', color: '#fff', fontSize: 14 }}>Working…</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '14px 10px 6px', flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                style={{ ...ghostBtn, background: filter === f.value ? GREEN : 'rgba(255,255,255,0.15)', fontWeight: filter === f.value ? 700 : 400 }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 10px 20px' }}>
            <button onClick={() => setRot(r => (r + 1) % 4)} style={ghostBtn}>Rotate</button>
          </div>
        </>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ page

export default function ScanWork() {
  const [groups, setGroups] = useState<Group[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [groupId, setGroupId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [type, setType] = useState('class_exercise')
  const [title, setTitle] = useState('')
  const [pages, setPages] = useState<Page[]>([])
  const [mode, setMode] = useState<'form' | 'camera' | 'edit'>('form')
  const [editing, setEditing] = useState<{ orig: Blob; pageId: string | null; initial?: { quad: Quad; filter: ScanFilter; rot: number } } | null>(null)
  const [fileQueue, setFileQueue] = useState<Blob[]>([])
  const [replaceId, setReplaceId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [appendTo, setAppendTo] = useState<{ id: string; label: string } | null>(null)
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null)
  const [savedPages, setSavedPages] = useState(0)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [assessmentId, setAssessmentId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/groups').then(r => r.json()).then(setGroups).catch(() => {})
    fetch('/api/students').then(r => r.json()).then(setStudents).catch(() => {})
  }, [])

  const filteredStudents = groupId ? students.filter(s => s.group_id === groupId) : students
  const selectedStudent = students.find(s => s.id === studentId)

  // Tests registered for this student's group in the last week (today's first): picking
  // one links the scan to its paper and answer key so the correction knows what it is marking.
  const studentGroupId = selectedStudent?.group_id || ''
  useEffect(() => {
    setAssessmentId(null)
    if (!studentGroupId) { setAssessments([]); return }
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    const since = new Date(today.getTime() - 7 * 86400000).toISOString().slice(0, 10)
    fetch(`/api/assessments?groupId=${studentGroupId}&since=${since}&until=${todayStr}`)
      .then(r => (r.ok ? r.json() : []))
      .then((list: Assessment[]) => {
        setAssessments(list)
        const todays = list.filter(a => a.date === todayStr)
        if (todays.length === 1) { setAssessmentId(todays[0].id); setType('exam'); setTitle(t => t || todays[0].title) }
      })
      .catch(() => setAssessments([]))
  }, [studentGroupId])

  // a fresh capture (or gallery photo) goes straight to the editor
  const openEditor = useCallback((orig: Blob, pageId: string | null = null, initial?: { quad: Quad; filter: ScanFilter; rot: number }) => {
    setEditing({ orig, pageId, initial })
    setMode('edit')
  }, [])

  function onCapture(blob: Blob) { openEditor(blob, replaceId) }

  function onFiles(files: File[]) {
    const [first, ...rest] = files
    setFileQueue(rest)
    openEditor(first, replaceId)
  }

  async function finishEdit(r: { quad: Quad; filter: ScanFilter; rot: number }) {
    if (!editing) return
    const { orig, pageId } = editing
    const out = await renderFinal(orig, r.quad, r.filter, r.rot)
    const thumb = URL.createObjectURL(out)
    setPages(prev => {
      if (pageId && prev.some(p => p.id === pageId)) {
        return prev.map(p => {
          if (p.id !== pageId) return p
          URL.revokeObjectURL(p.thumb)
          return { ...p, orig, quad: r.quad, filter: r.filter, rot: r.rot, out, thumb, url: undefined }
        })
      }
      return [...prev, { id: newPageId(), orig, quad: r.quad, filter: r.filter, rot: r.rot, out, thumb }]
    })
    setReplaceId(null)
    setEditing(null)
    // more gallery photos waiting? otherwise back to the camera for the next page
    if (fileQueue.length) {
      const [next, ...rest] = fileQueue
      setFileQueue(rest)
      openEditor(next)
    } else {
      setMode(pageId ? 'form' : 'camera')
    }
  }

  function cancelEdit() {
    setEditing(null)
    setReplaceId(null)
    if (fileQueue.length) {
      const [next, ...rest] = fileQueue
      setFileQueue(rest)
      openEditor(next)
    } else {
      setMode(pages.length || editing?.pageId ? 'form' : 'camera')
    }
  }

  function move(id: string, dir: -1 | 1) {
    setPages(prev => {
      const i = prev.findIndex(p => p.id === id), j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]; [next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function remove(id: string) {
    setPages(prev => { const p = prev.find(x => x.id === id); if (p) URL.revokeObjectURL(p.thumb); return prev.filter(x => x.id !== id) })
  }

  function resetAll(keepStudent: boolean) {
    pages.forEach(p => URL.revokeObjectURL(p.thumb))
    setPages([]); setTitle(''); setStatus('idle'); setErrorMsg(null); setProgress('')
    setAppendTo(null); setSavedEntryId(null); setAssessmentId(null)
    if (!keepStudent) { setStudentId(''); }
    setMode('form')
  }

  async function submit() {
    if (!pages.length || (!appendTo && !studentId)) return
    setStatus('saving'); setErrorMsg(null)
    try {
      // 1. upload each page on its own (skips pages that already went up on a previous try)
      const urls: string[] = []
      for (let i = 0; i < pages.length; i++) {
        let url = pages[i].url
        if (!url) {
          setProgress(`Uploading page ${i + 1} of ${pages.length}…`)
          const fd = new FormData()
          fd.append('image', new File([pages[i].out], `page-${i + 1}.jpg`, { type: 'image/jpeg' }))
          const res = await fetch('/api/work-entries/page-upload', { method: 'POST', body: fd })
          if (!res.ok) throw new Error(String(res.status))
          url = (await res.json()).url as string
          setPages(prev => prev.map((p, k) => (k === i ? { ...p, url } : p)))
        }
        urls.push(url!)
      }
      // 2. save it as one entry (or add the pages to the one already saved)
      setProgress('Saving…')
      let entryId = appendTo?.id || ''
      if (appendTo) {
        const res = await fetch('/api/work-entries/append', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entryId: appendTo.id, imageUrls: urls }),
        })
        if (!res.ok) throw new Error(String(res.status))
      } else {
        const fd = new FormData()
        fd.append('studentId', studentId)
        fd.append('type', type)
        fd.append('title', title)
        fd.append('date', new Date().toISOString().slice(0, 10))
        fd.append('imageUrls', JSON.stringify(urls))
        if (assessmentId) fd.append('assessmentId', assessmentId)
        const res = await fetch('/api/work-entries/quick', { method: 'POST', body: fd })
        if (!res.ok) throw new Error(String(res.status))
        entryId = (await res.json()).id as string
      }
      setSavedEntryId(entryId)
      setSavedPages(pages.length)
      setStatus('done')
    } catch (e) {
      const code = e instanceof Error ? e.message : ''
      if (code === '401' || code === '404') setErrorMsg('Session expired -- reopen the app and sign in again.')
      else if (code === '409') setErrorMsg('That scan has already been corrected, so pages cannot be added. Start a new document.')
      else if (/^\d+$/.test(code)) setErrorMsg(`Couldn't save (error ${code}) -- try again. Pages already uploaded are kept.`)
      else setErrorMsg("Couldn't reach the server -- check your connection and try again. Pages already uploaded are kept.")
      setStatus('error')
    }
  }

  function addMoreToSaved() {
    // keep the saved entry as the target, clear the local pages, reopen the camera
    pages.forEach(p => URL.revokeObjectURL(p.thumb))
    setPages([])
    setAppendTo({ id: savedEntryId!, label: `${selectedStudent?.name || 'this'} scan` })
    setStatus('idle'); setProgress('')
    setMode('camera')
  }

  // ---------------------------------------------------------------- render

  if (mode === 'camera') {
    return <Camera pageCount={pages.length} onCapture={onCapture} onFiles={onFiles} onClose={() => { setReplaceId(null); setMode('form') }} />
  }
  if (mode === 'edit' && editing) {
    return (
      <Editor
        key={editing.pageId || 'new-' + pages.length + '-' + fileQueue.length}
        orig={editing.orig}
        initial={editing.initial}
        canRetake={!fileQueue.length}
        onDone={finishEdit}
        onCancel={cancelEdit}
        onRetake={() => { setEditing(null); setMode('camera') }}
      />
    )
  }

  const canSave = pages.length > 0 && (!!appendTo || !!studentId) && status !== 'saving'

  return (
    <>
      <BackToDashboard />
      <div style={{ minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff' }}>
        <header style={{ background: RACING, borderBottom: `3px solid ${GREEN}`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SomersetLogo variant="white" />
        </header>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 18px 60px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 24, color: INK, marginBottom: 4 }}>Scan work</h1>
          <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>Scan every page of the document, then save once. Correct it later on the laptop.</p>

          {status === 'done' ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: INK, marginBottom: 6 }}>Saved</div>
              <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>
                {savedPages} page{savedPages === 1 ? '' : 's'} of {selectedStudent?.name || 'the'} work {appendTo ? 'added to the same scan' : 'are in the correction queue as one document'}.
              </p>
              <button onClick={addMoreToSaved} style={{ ...btnPrimary, marginBottom: 12, width: '100%' }}>Add more pages to this document</button>
              <button onClick={() => resetAll(false)} style={{ ...btnPrimary, background: '#fff', color: '#3F6E17', border: `2px solid ${GREEN}`, width: '100%' }}>New document</button>
            </div>
          ) : (
            <>
              {appendTo ? (
                <div style={{ background: '#F4F7F0', border: `1.5px solid ${GREEN}`, borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 14, color: INK }}>
                  Adding pages to <b>{selectedStudent?.name}</b>&apos;s saved scan.{' '}
                  <button onClick={() => resetAll(true)} style={{ background: 'none', border: 'none', color: MUTED, textDecoration: 'underline', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                </div>
              ) : (
                <>
                  <label style={labelStyle}>Group</label>
                  <select value={groupId} onChange={e => { setGroupId(e.target.value); setStudentId('') }} style={selectStyle}>
                    <option value="">All groups</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>

                  <label style={labelStyle}>Student</label>
                  <select value={studentId} onChange={e => setStudentId(e.target.value)} style={selectStyle}>
                    <option value="">Choose a student…</option>
                    {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}{!groupId && s.group_name ? ` · ${s.group_name}` : ''}</option>)}
                  </select>

                  <label style={labelStyle}>Type of work</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    {WORK_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        style={{
                          padding: '10px 14px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
                          border: type === t.value ? `2px solid ${GREEN}` : `1.5px solid ${LINE}`,
                          background: type === t.value ? '#F4F7F0' : '#fff',
                          color: type === t.value ? '#3F6E17' : INK,
                          fontWeight: type === t.value ? 700 : 400,
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {studentId && (
                    <>
                      <label style={labelStyle}>Test it belongs to</label>
                      {assessments.length > 0 ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                          {assessments.map(a => (
                            <button key={a.id} type="button"
                              onClick={() => { if (assessmentId === a.id) { setAssessmentId(null) } else { setAssessmentId(a.id); setType('exam'); setTitle(a.title) } }}
                              style={{
                                padding: '10px 14px', borderRadius: 8, fontSize: 14, cursor: 'pointer',
                                border: assessmentId === a.id ? `2px solid ${GREEN}` : `1.5px solid ${LINE}`,
                                background: assessmentId === a.id ? '#F4F7F0' : '#fff',
                                color: assessmentId === a.id ? '#3F6E17' : INK, fontWeight: assessmentId === a.id ? 700 : 400,
                              }}>
                              {a.title} <span style={{ fontWeight: 400, color: MUTED }}>· {a.date === new Date().toISOString().slice(0, 10) ? 'today' : a.date}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 13, color: MUTED, margin: '0 0 20px' }}>
                          No test registered for this group this week. {type === 'exam' && <a href="/assessments" style={{ color: '#3F6E17' }}>Register the test and its key</a>}{type === 'exam' && ' so it can be marked properly.'}
                        </p>
                      )}
                    </>
                  )}

                  <label style={labelStyle}>Title (optional)</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Unit 3 Grammar Test"
                    style={{ ...selectStyle, marginBottom: 20 }}
                  />
                </>
              )}

              <label style={labelStyle}>Pages{pages.length ? ` (${pages.length})` : ''}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                {pages.map((p, i) => (
                  <div key={p.id} style={{ border: `1.5px solid ${LINE}`, borderRadius: 10, overflow: 'hidden', background: '#fafafa' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setReplaceId(p.id); openEditor(p.orig, p.id, { quad: p.quad, filter: p.filter, rot: p.rot }) }}>
                      <img src={p.thumb} alt={`Page ${i + 1}`} style={{ width: '100%', height: 130, objectFit: 'contain', display: 'block', background: '#fff' }} />
                      <span style={{ position: 'absolute', left: 6, top: 6, background: RACING, color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>{i + 1}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 4px' }}>
                      <button aria-label="Move earlier" disabled={i === 0} onClick={() => move(p.id, -1)} style={miniBtn(i === 0)}>&lsaquo;</button>
                      <button aria-label="Delete page" onClick={() => remove(p.id)} style={{ ...miniBtn(false), color: '#B23A2C' }}>&times;</button>
                      <button aria-label="Move later" disabled={i === pages.length - 1} onClick={() => move(p.id, 1)} style={miniBtn(i === pages.length - 1)}>&rsaquo;</button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => { setReplaceId(null); setMode('camera') }}
                  style={{ border: `2px dashed ${GREEN}`, borderRadius: 10, minHeight: 170, background: '#F9FBF6', color: '#3F6E17', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
                >
                  <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 6 }}>+</div>
                  {pages.length ? 'Add page' : 'Scan'}
                </button>
              </div>

              {status === 'error' && <p style={{ color: '#B23A2C', fontSize: 13, marginBottom: 12 }}>{errorMsg}</p>}
              {status === 'saving' && <p style={{ color: MUTED, fontSize: 13, marginBottom: 12 }}>{progress}</p>}
              {!appendTo && pages.length > 0 && !studentId && <p style={{ color: '#B23A2C', fontSize: 13, marginBottom: 12 }}>Choose a student to save.</p>}

              <button
                onClick={submit}
                disabled={!canSave}
                style={{ ...btnPrimary, width: '100%', opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'default' }}
              >
                {status === 'saving' ? 'Saving…' : pages.length ? `Save ${pages.length} page${pages.length === 1 ? '' : 's'} to queue →` : 'Save to queue →'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 2000, background: '#111', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'hidden' }
const ghostBtn: React.CSSProperties = { padding: '9px 16px', borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, cursor: 'pointer' }
const miniBtn = (disabled: boolean): React.CSSProperties => ({ width: 34, height: 30, border: 'none', background: 'none', fontSize: 22, lineHeight: 1, cursor: disabled ? 'default' : 'pointer', color: disabled ? '#ccc' : INK })
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }
const selectStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', fontSize: 16, borderRadius: 8, border: `1.5px solid ${LINE}`, marginBottom: 18, background: '#fff', color: INK, fontFamily: 'Arial, Helvetica, sans-serif' }
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 24px', borderRadius: 50, border: 'none', background: GREEN, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }
