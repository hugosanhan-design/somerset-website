'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'
import { COLORS, FONT, RADIUS, SHADOW, EASE } from '@/lib/theme'

interface Student {
  id: string
  name: string
  group_name: string
  level: string
}

type ActiveAction = 'correct' | 'scan' | null

export default function TeacherPortal() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeAction, setActiveAction] = useState<ActiveAction>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    fetch('/api/work-entries/pending').then(r => r.json()).then((rows) => setPendingCount(Array.isArray(rows) ? rows.length : 0)).catch(() => {})
  }, [])

  function openPicker(action: ActiveAction) {
    setActiveAction(action)
    setSearch('')
    if (students.length === 0) loadStudents()
  }

  async function loadStudents() {
    setLoadingStudents(true)
    const res = await fetch('/api/students')
    const data = await res.json()
    setStudents(data)
    setLoadingStudents(false)
  }

  function selectStudent(student: Student) {
    if (activeAction === 'correct') {
      router.push(`/correct?studentId=${student.id}&studentName=${encodeURIComponent(student.name)}`)
    } else if (activeAction === 'scan') {
      router.push(`/students/${student.id}/upload`)
    }
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.group_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: FONT.sans,
      backgroundImage: "url('/Somerset b-g.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div style={{ minHeight: '100vh', backgroundColor: 'rgba(23,40,27,0.55)' }}>

        <header style={{ backgroundColor: 'rgba(30,66,39,0.88)', padding: '16px 28px', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <SomersetLogo variant="white" />
          {session?.user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>
                {session.user.name}{session.user.role === 'admin' ? ' · Admin' : ''}
              </span>
              {session.user.role === 'admin' && (
                <Link href="/teachers" style={{ fontSize: 12.5, color: '#fff', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
                  Teachers
                </Link>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                Sign out
              </button>
            </div>
          )}
        </header>

        <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 24px' }}>

          <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 30, color: '#fff', marginBottom: 6, letterSpacing: '-0.01em' }}>Teacher Portal</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14.5, marginBottom: 24 }}>
            Choose a group, or a student, to get started.
          </p>

          {/* ── My Groups — primary daily entry point ── */}
          <Link href="/groups" style={groupsCard}>
            <div style={actionIcon}>🧑‍🏫</div>
            <div style={{ flex: 1 }}>
              <div style={actionTitle}>My Groups</div>
              <div style={actionDesc}>Roster, attendance, and book progress for each class</div>
            </div>
            <span style={{ fontSize: 20, color: '#d1d5db' }}>›</span>
          </Link>

          {/* ── Primary actions ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>

            {/* Correct Writing */}
            <button
              onClick={() => openPicker('correct')}
              style={{
                ...primaryCard,
                outline: activeAction === 'correct' ? `2.5px solid ${COLORS.green}` : 'none',
                outlineOffset: 2,
              }}
            >
              <div style={actionIcon}>✍️</div>
              <div style={actionTitle}>Correct Writing</div>
              <div style={actionDesc}>AI correction report, saved to student ficha</div>
            </button>

            {/* Scan Work */}
            <button
              onClick={() => openPicker('scan')}
              style={{
                ...primaryCard,
                outline: activeAction === 'scan' ? `2.5px solid ${COLORS.green}` : 'none',
                outlineOffset: 2,
              }}
            >
              <div style={actionIcon}>📷</div>
              <div style={actionTitle}>Scan Work</div>
              <div style={actionDesc}>Photo of homework or exam, AI scores and stores it</div>
            </button>
          </div>

          {/* ── Student picker ── */}
          {activeAction && (
            <div style={pickerBox}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                  {activeAction === 'correct' ? 'Select student to correct for' : 'Select student to scan work for'}
                </div>
                <button onClick={() => setActiveAction(null)} style={closeBtn}>✕</button>
              </div>

              <input
                placeholder="Search by name or group…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                style={searchInput}
              />

              {/* Anonymous option — correct a one-off piece not tied to a ficha */}
              {activeAction === 'correct' && (
                <button onClick={() => router.push('/correct?anonymous=1')} style={anonymousRow}>
                  <div style={anonAvatar}>?</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Anonymous student</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>One-off correction — not saved to a ficha</div>
                  </div>
                </button>
              )}

              <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 8 }}>
                {loadingStudents ? (
                  <p style={emptyMsg}>Loading students…</p>
                ) : filtered.length === 0 ? (
                  <div>
                    <p style={emptyMsg}>
                      {search ? 'No students match.' : 'No students yet.'}
                    </p>
                    <Link href="/students" style={addStudentLink}>
                      + Add students in the tracker →
                    </Link>
                  </div>
                ) : (
                  filtered.map(s => (
                    <button key={s.id} onClick={() => selectStudent(s)} style={studentRow}>
                      <div style={miniAvatar}>{s.name.charAt(0).toUpperCase()}</div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{s.name}</div>
                        {(s.group_name || s.level) && (
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            {[s.group_name, s.level].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Secondary tools ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/scan" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>📷</span>
              <div>
                <div style={secondaryTitle}>Quick Scan (phone)</div>
                <div style={secondaryDesc}>Fast capture between classes — no AI wait, just group, student, photo</div>
              </div>
            </Link>

            <Link href="/correct-queue" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>✅</span>
              <div>
                <div style={secondaryTitle}>To Correct{pendingCount > 0 ? ` (${pendingCount})` : ''}</div>
                <div style={secondaryDesc}>Everything scanned from the phone, waiting for you to review</div>
              </div>
            </Link>

            <Link href="/students" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>📊</span>
              <div>
                <div style={secondaryTitle}>Student Tracker</div>
                <div style={secondaryDesc}>View all fichas, progress charts, and error patterns</div>
              </div>
            </Link>

            <Link href="/intake" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>📋</span>
              <div>
                <div style={secondaryTitle}>Placement Quiz</div>
                <div style={secondaryDesc}>Adaptive intake for new students</div>
              </div>
            </Link>

            <Link href="/materials" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>🧑‍🏫</span>
              <div>
                <div style={secondaryTitle}>Class Materials</div>
                <div style={secondaryDesc}>Pick a unit, class and activity — builds it from Close-up B1</div>
              </div>
            </Link>

            <Link href="/context-lab" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>📖</span>
              <div>
                <div style={secondaryTitle}>Context Lab</div>
                <div style={secondaryDesc}>Vocabulary lesson packs with words in context, by topic and level</div>
              </div>
            </Link>

            <a href="/cbt" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>🖥️</span>
              <div>
                <div style={secondaryTitle}>Sit the Exam (student)</div>
                <div style={secondaryDesc}>Cambridge-style computer-based B2 First — full text + listening. Send students this link.</div>
              </div>
            </a>

            <Link href="/mocks" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>🖊️</span>
              <div>
                <div style={secondaryTitle}>Mock Correction (teacher)</div>
                <div style={secondaryDesc}>Enter the answer key — student exams score against it automatically</div>
              </div>
            </Link>

            <Link href="/qr" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>📲</span>
              <div>
                <div style={secondaryTitle}>Student QR Code</div>
                <div style={secondaryDesc}>Printable poster linking to the placement quiz</div>
              </div>
            </Link>

            <a href="/placement/index.html" style={secondaryCard}>
              <span style={{ fontSize: 20 }}>📝</span>
              <div>
                <div style={secondaryTitle}>Placement Test</div>
                <div style={secondaryDesc}>Progressive level test, A1–C1 — results emailed to the centre</div>
              </div>
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────

const primaryCard: React.CSSProperties = {
  backgroundColor: 'rgba(245,241,230,0.97)',
  border: `1.5px solid ${COLORS.line}`,
  borderRadius: RADIUS.card,
  padding: '26px 20px',
  cursor: 'pointer',
  textAlign: 'center',
  boxShadow: SHADOW.ink,
  backdropFilter: 'blur(8px)',
  fontFamily: FONT.sans,
  transition: `transform 0.22s ${EASE}, box-shadow 0.22s ${EASE}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
}
const groupsCard: React.CSSProperties = {
  backgroundColor: 'rgba(245,241,230,0.97)',
  border: `1.5px solid ${COLORS.line}`,
  borderRadius: RADIUS.card,
  padding: '20px 22px',
  boxShadow: SHADOW.ink,
  backdropFilter: 'blur(8px)',
  fontFamily: FONT.sans,
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  textDecoration: 'none',
  color: 'inherit',
  marginBottom: 18,
  transition: `transform 0.22s ${EASE}`,
}
const actionIcon: React.CSSProperties = { fontSize: 32 }
const actionTitle: React.CSSProperties = { fontFamily: FONT.serif, fontWeight: 500, fontSize: 17, color: COLORS.ink }
const actionDesc: React.CSSProperties = { fontSize: 12, color: COLORS.muted, lineHeight: 1.4 }

const pickerBox: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.98)',
  borderRadius: RADIUS.card,
  padding: '20px 22px',
  marginBottom: 20,
  boxShadow: SHADOW.ink,
  backdropFilter: 'blur(8px)',
}
const searchInput: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `1.5px solid ${COLORS.line}`,
  borderRadius: 12,
  fontSize: 14,
  fontFamily: FONT.sans,
  outline: 'none',
  boxSizing: 'border-box',
}
const studentRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '9px 10px',
  border: 'none',
  borderRadius: RADIUS.pill,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontFamily: FONT.sans,
  transition: `background 0.18s ${EASE}`,
}
const miniAvatar: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: COLORS.leaf,
  color: COLORS.racing,
  fontSize: 14,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}
const anonymousRow: React.CSSProperties = {
  ...studentRow,
  marginTop: 8,
  borderBottom: `1px solid ${COLORS.line}`,
  borderRadius: 0,
  paddingBottom: 12,
}
const anonAvatar: React.CSSProperties = {
  ...miniAvatar,
  backgroundColor: '#e5e7eb',
  color: '#6b7280',
}
const emptyMsg: React.CSSProperties = { fontSize: 13, color: COLORS.muted, textAlign: 'center', padding: '12px 0', margin: 0 }
const addStudentLink: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  fontSize: 13,
  color: COLORS.greenDk,
  fontWeight: 600,
  textDecoration: 'none',
  padding: '4px 0 8px',
}
const closeBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 16,
  color: COLORS.muted,
  cursor: 'pointer',
  padding: '0 4px',
  lineHeight: 1,
}
const secondaryCard: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  backgroundColor: 'rgba(245,241,230,0.85)',
  border: `1px solid ${COLORS.line}`,
  borderRadius: 16,
  padding: '14px 18px',
  cursor: 'pointer',
  textDecoration: 'none',
  backdropFilter: 'blur(6px)',
  boxShadow: SHADOW.inkSoft,
  transition: `transform 0.18s ${EASE}`,
}
const secondaryTitle: React.CSSProperties = { fontFamily: FONT.serif, fontWeight: 500, fontSize: 14.5, color: COLORS.ink }
const secondaryDesc: React.CSSProperties = { fontSize: 12, color: COLORS.muted, marginTop: 1 }
