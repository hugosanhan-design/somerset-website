'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import SomersetLogo from '@/components/SomersetLogo'

interface Student {
  id: string
  name: string
  group_name: string
  level: string
}

const WORK_TYPES = [
  { value: 'exam', label: '📝 Exam', desc: 'Written exam or quiz' },
  { value: 'essay', label: '✍️ Essay', desc: 'Composition or writing task' },
  { value: 'class_exercise', label: '📄 Class exercise', desc: 'Worksheet or in-class activity' },
  { value: 'homework', label: '🏠 Homework', desc: 'Take-home task' },
  { value: 'speaking', label: '🎙 Speaking', desc: 'Oral assessment notes or transcript' },
]

export default function UploadWork() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [student, setStudent] = useState<Student | null>(null)
  const [form, setForm] = useState({
    type: 'class_exercise',
    title: '',
    date: new Date().toISOString().slice(0, 10),
    teacher_notes: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'analysing' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{
    score: number | null
    feedback: string
    error_patterns: string[]
    image_url: string
  } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/students/${id}`).then(r => r.json()).then(setStudent)
  }, [id])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setStatus('idle')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setImageFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setStatus('idle')
  }

  async function runAnalysis() {
    if (!imageFile) return
    setStatus('analysing')
    const fd = new FormData()
    fd.append('image', imageFile)
    fd.append('type', form.type)
    fd.append('level', student?.level || 'B1')
    fd.append('title', form.title)

    const res = await fetch('/api/analyse-work', { method: 'POST', body: fd })
    if (!res.ok) { setStatus('error'); return }
    const data = await res.json()
    setResult(data)
    setStatus('done')
  }

  async function saveEntry() {
    if (!result) return
    setSaving(true)
    await fetch(`/api/students/${id}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: form.type,
        title: form.title,
        date: form.date,
        score: result.score,
        ai_feedback: result.feedback,
        ai_error_patterns: result.error_patterns,
        image_url: result.image_url,
        status: 'corrected',
        teacher_notes: form.teacher_notes,
      })
    })
    setSaving(false)
    router.push(`/students/${id}`)
  }

  async function saveWithoutImage() {
    setSaving(true)
    await fetch(`/api/students/${id}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: form.type,
        title: form.title,
        date: form.date,
        score: null,
        ai_feedback: '',
        ai_error_patterns: [],
        image_filename: '',
        teacher_notes: form.teacher_notes,
      })
    })
    setSaving(false)
    router.push(`/students/${id}`)
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, Liberation Sans, sans-serif', backgroundColor: '#f9fafb' }}>

      <header style={{ backgroundColor: '#6BAE2E', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SomersetLogo variant="white" />
        <Link href={`/students/${id}`} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textDecoration: 'none' }}>
          ← {student?.name || 'Student'}
        </Link>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Add work</h1>
        {student && (
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>
            {student.name} · {[student.group_name, student.level].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Work type */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Type of work</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {WORK_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t.value }))}
                style={{
                  padding: '8px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Arial, Liberation Sans, sans-serif',
                  border: form.type === t.value ? '2px solid #6BAE2E' : '1.5px solid #d1d5db',
                  backgroundColor: form.type === t.value ? '#f0fae6' : '#fff',
                  color: form.type === t.value ? '#3d6b1a' : '#374151',
                  fontWeight: form.type === t.value ? 700 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title + date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Title (optional)</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Unit 3 Grammar Test"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
          </div>
        </div>

        {/* Image upload */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Photo or scan of the work</label>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            style={{
              border: preview ? '2px solid #6BAE2E' : '2px dashed #d1d5db',
              borderRadius: 10, padding: preview ? 0 : '32px 20px',
              textAlign: 'center', cursor: 'pointer', backgroundColor: '#fff',
              overflow: 'hidden', transition: 'border-color 0.15s',
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 360, objectFit: 'contain', display: 'block' }} />
            ) : (
              <div style={{ color: '#9ca3af' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                <p style={{ fontSize: 14, margin: 0 }}>Click or drag & drop an image here</p>
                <p style={{ fontSize: 12, margin: '4px 0 0' }}>JPG, PNG, WebP — photo of handwritten work, printed exam, etc.</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          {preview && (
            <button
              type="button"
              onClick={() => { setPreview(null); setImageFile(null); setResult(null); setStatus('idle') }}
              style={{ marginTop: 8, fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              ✕ Remove image
            </button>
          )}
        </div>

        {/* AI analysis */}
        {imageFile && status === 'idle' && !result && (
          <button onClick={runAnalysis} style={{ ...btnGreen, marginBottom: 20, width: '100%' }}>
            🤖 Analyse with AI
          </button>
        )}

        {status === 'analysing' && (
          <div style={analysisBox('#f0fae6', '#3d6b1a')}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>⏳</div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Analysing the work…</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.8 }}>Claude is reading the image and scoring the work.</p>
          </div>
        )}

        {status === 'done' && result && (
          <div style={{ backgroundColor: '#f0fae6', border: '1.5px solid #6BAE2E', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#3d6b1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Analysis complete</div>
              {result.score != null && (
                <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor(result.score) }}>{result.score}<span style={{ fontSize: 14, color: '#6b7280' }}>/100</span></div>
              )}
            </div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 12px' }}>{result.feedback}</p>
            {result.error_patterns.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' }}>Areas to work on</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.error_patterns.map(p => (
                    <span key={p} style={patternChip}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div style={analysisBox('#fef2f2', '#991b1b')}>
            <p style={{ margin: 0, fontSize: 14 }}>Analysis failed. You can still save the entry manually below.</p>
          </div>
        )}

        {/* Teacher notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Teacher notes (optional)</label>
          <textarea
            value={form.teacher_notes}
            onChange={e => setForm(f => ({ ...f, teacher_notes: e.target.value }))}
            placeholder="Any private observations about this piece of work…"
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          />
        </div>

        {/* Save buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {result ? (
            <button onClick={saveEntry} disabled={saving} style={{ ...btnGreen, flex: 1 }}>
              {saving ? 'Saving…' : '✓ Save to ficha'}
            </button>
          ) : (
            <button onClick={saveWithoutImage} disabled={saving} style={{ ...btnGreen, flex: 1 }}>
              {saving ? 'Saving…' : 'Save without AI analysis'}
            </button>
          )}
          <Link href={`/students/${id}`} style={{ ...btnGhost, textDecoration: 'none', padding: '10px 18px' }}>Cancel</Link>
        </div>

      </div>
    </div>
  )
}

function scoreColor(score: number) {
  if (score >= 80) return '#6BAE2E'
  if (score >= 65) return '#f59e0b'
  return '#ef4444'
}

function analysisBox(bg: string, color: string): React.CSSProperties {
  return {
    backgroundColor: bg, border: `1.5px solid ${color}`, borderRadius: 10,
    padding: '16px 20px', marginBottom: 20, color, textAlign: 'center',
  }
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db',
  borderRadius: 7, fontSize: 14, fontFamily: 'Arial, Liberation Sans, sans-serif',
  outline: 'none', boxSizing: 'border-box',
}
const btnGreen: React.CSSProperties = {
  padding: '11px 20px', backgroundColor: '#6BAE2E', color: '#fff',
  border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'Arial, Liberation Sans, sans-serif',
}
const btnGhost: React.CSSProperties = {
  padding: '11px 18px', backgroundColor: '#f3f4f6', color: '#374151',
  border: 'none', borderRadius: 7, fontSize: 14, cursor: 'pointer',
  fontFamily: 'Arial, Liberation Sans, sans-serif', display: 'inline-block',
}
const patternChip: React.CSSProperties = {
  backgroundColor: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600,
  padding: '3px 10px', borderRadius: 99,
}
