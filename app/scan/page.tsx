'use client'

// Phone-first quick capture. Pick group → student → work type → snap a photo →
// submit. No AI call here — that happens later at the laptop in /correct-queue.
// Designed to be fast between classes: big touch targets, minimal typing, and the
// form resets itself after each save so the next photo is one tap away.
//
// Camera photos come in at several MB (often 4-8MB on modern phones), well past
// Vercel's ~4.5MB request body limit for serverless functions -- that's what was
// silently failing with a generic "check your connection" message (26 Sep 2026).
// Every photo is downscaled/recompressed client-side via canvas before upload.

import { useState, useEffect, useRef } from 'react'
import SomersetLogo from '@/components/SomersetLogo'

interface Group { id: string; name: string }
interface Student { id: string; name: string; group_id: string | null; group_name: string }

const WORK_TYPES = [
  { value: 'exam', label: '📝 Exam' },
  { value: 'essay', label: '✍️ Essay' },
  { value: 'class_exercise', label: '📄 Class exercise' },
  { value: 'homework', label: '🏠 Homework' },
  { value: 'speaking', label: '🎙 Speaking' },
]

const GREEN = '#6BAE2E'
const RACING = '#1E4227'
const INK = '#222222'
const MUTED = '#777777'
const LINE = '#DDDDDD'

export default function ScanWork() {
  const fileRef = useRef<HTMLInputElement>(null)

  const [groups, setGroups] = useState<Group[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [groupId, setGroupId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [type, setType] = useState('class_exercise')
  const [title, setTitle] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/groups').then(r => r.json()).then(setGroups).catch(() => {})
    fetch('/api/students').then(r => r.json()).then(setStudents).catch(() => {})
  }, [])

  const filteredStudents = groupId ? students.filter(s => s.group_id === groupId) : students

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setStatus('idle')
    try {
      const compressed = await compressImage(f)
      setImageFile(compressed)
      setPreview(URL.createObjectURL(compressed))
    } catch {
      // If compression fails for any reason, fall back to the original file
      // rather than blocking the teacher from scanning at all.
      setImageFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  // Resize to a max dimension and re-encode as JPEG so the upload reliably stays
  // well under Vercel's request-body limit, whatever the phone's camera resolution is.
  function compressImage(file: File, maxDim = 1600, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim }
          else { width = Math.round(width * (maxDim / height)); height = maxDim }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('no canvas context')); return }
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('toBlob failed')); return }
          resolve(new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }))
        }, 'image/jpeg', quality)
      }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')) }
      img.src = url
    })
  }

  function resetForCapture() {
    setImageFile(null)
    setPreview(null)
    setTitle('')
    setStatus('idle')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function submit() {
    if (!studentId || !imageFile) return
    setStatus('saving')
    setErrorMsg(null)
    const fd = new FormData()
    fd.append('studentId', studentId)
    fd.append('type', type)
    fd.append('title', title)
    fd.append('date', new Date().toISOString().slice(0, 10))
    fd.append('image', imageFile)

    try {
      const res = await fetch('/api/work-entries/quick', { method: 'POST', body: fd })
      if (!res.ok) {
        if (res.status === 401 || res.status === 404) setErrorMsg('Session expired -- reopen the app and sign in again.')
        else if (res.status === 413) setErrorMsg('Photo too large -- try again (it should auto-shrink; if this repeats, tell Hugo).')
        else setErrorMsg(`Couldn't save (error ${res.status}) -- try again.`)
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      setErrorMsg("Couldn't reach the server -- check your connection and try again.")
      setStatus('error')
    }
  }

  const selectedStudent = students.find(s => s.id === studentId)

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff' }}>
      <header style={{ background: RACING, borderBottom: `3px solid ${GREEN}`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SomersetLogo variant="white" />
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 18px 60px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 24, color: INK, marginBottom: 4 }}>Scan work</h1>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>Snap it now, correct it later on the laptop.</p>

        {status === 'done' ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: INK, marginBottom: 4 }}>Saved</div>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>
              {selectedStudent?.name}&apos;s work is in the correction queue.
            </p>
            <button onClick={resetForCapture} style={btnPrimary}>Scan another →</button>
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

            <label style={labelStyle}>Title (optional)</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Unit 3 Grammar Test"
              style={{ ...selectStyle, marginBottom: 20 }}
            />

            <label style={labelStyle}>Photo</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: preview ? `2px solid ${GREEN}` : `2px dashed ${LINE}`,
                borderRadius: 10, padding: preview ? 0 : '48px 20px',
                textAlign: 'center', cursor: 'pointer', background: '#fff', overflow: 'hidden', marginBottom: 24,
              }}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block' }} />
              ) : (
                <div style={{ color: '#9ca3af' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                  <p style={{ fontSize: 15, margin: 0 }}>Tap to take a photo</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />

            {status === 'error' && (
              <p style={{ color: '#B23A2C', fontSize: 13, marginBottom: 12 }}>{errorMsg}</p>
            )}

            <button
              onClick={submit}
              disabled={!studentId || !imageFile || status === 'saving'}
              style={{
                ...btnPrimary,
                width: '100%',
                opacity: (!studentId || !imageFile || status === 'saving') ? 0.5 : 1,
                cursor: (!studentId || !imageFile || status === 'saving') ? 'default' : 'pointer',
              }}
            >
              {status === 'saving' ? 'Saving…' : 'Save to queue →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }
const selectStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', fontSize: 16, borderRadius: 8, border: `1.5px solid ${LINE}`, marginBottom: 18, background: '#fff', color: INK, fontFamily: 'Arial, Helvetica, sans-serif' }
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 24px', borderRadius: 50, border: 'none', background: GREEN, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }
