'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ERROR_TAGS, SKILLS, CEFR_LEVELS, Skill } from '@/data/errorTags'
import { COLORS, FONT, RADIUS, SHADOW, EASE } from '@/lib/theme'

interface Unit { id: string; title: string; order_index: number }
interface RosterStudent {
  id: string; name: string; level: string; entry_count: number
  last_activity: string | null; avg_score: number | null; present: number | null
}
interface GroupDetail {
  id: string; name: string; level: string; date: string
  curriculum_id: string | null; curriculum_name: string | null
  current_unit_id: string | null; current_unit_title: string | null; current_unit_order: number | null
  total_units: number; units: Unit[]; students: RosterStudent[]
}
interface AllStudent { id: string; name: string; group_name: string; level: string }
interface Curriculum { id: string; name: string; level: string }

function todayISO() { return new Date().toISOString().slice(0, 10) }

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.id as string

  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [date, setDate] = useState(todayISO())
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)
  const [savingAttendance, setSavingAttendance] = useState(false)

  const [showAddStudent, setShowAddStudent] = useState(false)
  const [allStudents, setAllStudents] = useState<AllStudent[]>([])
  const [search, setSearch] = useState('')

  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [showCurriculumPicker, setShowCurriculumPicker] = useState(false)
  const [pickedCurriculum, setPickedCurriculum] = useState('')
  const [assigningCurriculum, setAssigningCurriculum] = useState(false)

  const [logStudent, setLogStudent] = useState<RosterStudent | null>(null)
  const [logType, setLogType] = useState<'checkin' | 'activity'>('checkin')
  const [logScore, setLogScore] = useState('')
  const [logCefr, setLogCefr] = useState('')
  const [logBySkill, setLogBySkill] = useState<Record<Skill, string>>({ reading: '', listening: '', vocabulary: '', grammar: '', writing: '', speaking: '' })
  const [logActivityTitle, setLogActivityTitle] = useState('')
  const [logErrorTags, setLogErrorTags] = useState<string[]>([])
  const [logSaving, setLogSaving] = useState(false)

  const load = useCallback(async (forDate: string) => {
    setLoading(true)
    const res = await fetch(`/api/groups/${groupId}?date=${forDate}`)
    setGroup(await res.json())
    setLoading(false)
  }, [groupId])

  useEffect(() => { load(date) }, [date, load])

  async function toggleAttendance(studentId: string, present: boolean) {
    if (!group) return
    const updated = group.students.map(s => s.id === studentId ? { ...s, present: present ? 1 : 0 } : s)
    setGroup({ ...group, students: updated })
    setSavingAttendance(true)
    await fetch(`/api/groups/${groupId}/attendance`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        records: updated.map(s => ({ student_id: s.id, present: !!s.present })),
      }),
    })
    setSavingAttendance(false)
  }

  async function advanceUnit(direction: 'forward' | 'back') {
    setAdvancing(true)
    await fetch(`/api/groups/${groupId}/advance-unit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    })
    await load(date)
    setAdvancing(false)
  }

  async function openAddStudent() {
    setShowAddStudent(true)
    const res = await fetch('/api/students')
    setAllStudents(await res.json())
  }

  async function addStudent(studentId: string) {
    await fetch(`/api/groups/${groupId}/students`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId }),
    })
    setShowAddStudent(false); setSearch('')
    load(date)
  }

  async function removeStudent(studentId: string) {
    await fetch(`/api/groups/${groupId}/students/${studentId}`, { method: 'DELETE' })
    load(date)
  }

  function openLog(student: RosterStudent) {
    setLogStudent(student)
    setLogType('checkin')
    setLogScore(''); setLogCefr(''); setLogActivityTitle(''); setLogErrorTags([])
    setLogBySkill({ reading: '', listening: '', vocabulary: '', grammar: '', writing: '', speaking: '' })
  }

  function toggleErrorTag(key: string) {
    setLogErrorTags(tags => tags.includes(key) ? tags.filter(t => t !== key) : [...tags, key])
  }

  async function saveLog() {
    if (!logStudent) return
    setLogSaving(true)
    const body = logType === 'checkin'
      ? {
          type: 'checkin',
          title: 'Monthly check-in',
          date,
          score: logScore ? Number(logScore) : null,
          cefr_estimate: logCefr,
          by_skill: Object.fromEntries(SKILLS.map(sk => [sk, logBySkill[sk] ? Number(logBySkill[sk]) : null])),
        }
      : {
          type: 'activity',
          title: logActivityTitle || 'Activity',
          date,
          score: logScore ? Number(logScore) : null,
          ai_error_patterns: logErrorTags,
        }
    await fetch(`/api/students/${logStudent.id}/entries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLogSaving(false)
    setLogStudent(null)
    load(date)
  }

  async function openCurriculumPicker() {
    setShowCurriculumPicker(true)
    const res = await fetch('/api/curricula')
    setCurricula(await res.json())
  }

  async function assignCurriculum() {
    if (!pickedCurriculum) return
    setAssigningCurriculum(true)
    await fetch(`/api/groups/${groupId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curriculum_id: pickedCurriculum, current_unit_id: null }),
    })
    setShowCurriculumPicker(false); setPickedCurriculum('')
    setAssigningCurriculum(false)
    load(date)
  }

  if (loading && !group) return <div style={s.page}><header style={s.header}><Link href="/groups" style={s.headerLink}>← Groups</Link></header></div>
  if (!group) return null

  const filtered = allStudents.filter(st =>
    !group.students.some(gs => gs.id === st.id) &&
    st.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link href="/groups" style={s.headerLink}>← Groups</Link>
        <div style={s.headerTitle}>{group.name}</div>
      </header>

      <div style={s.wrap}>
        {/* Curriculum progress */}
        <section style={s.section}>
          {group.curriculum_name ? (
            <>
              <div style={s.curriculumHeaderRow}>
                <div style={s.sectionTitle}>{group.curriculum_name}</div>
                <button onClick={openCurriculumPicker} style={s.changeLink}>change</button>
              </div>
              {group.total_units > 0 ? (
                group.current_unit_id ? (
                  <>
                    <div style={s.progressRow}>
                      <div style={s.progressTrack}>
                        <div style={{
                          ...s.progressFill,
                          width: `${Math.round(((group.current_unit_order ?? 0) + 1) / group.total_units * 100)}%`,
                        }} />
                      </div>
                      <span style={s.progressLabel}>
                        Unit {(group.current_unit_order ?? 0) + 1} of {group.total_units}
                      </span>
                    </div>
                    <div style={s.unitTitle}>{group.current_unit_title}</div>
                    <div style={s.unitBtnRow}>
                      <button onClick={() => advanceUnit('back')} disabled={advancing || (group.current_unit_order ?? 0) <= 0} style={s.unitBtn}>◀ Previous unit</button>
                      <button onClick={() => advanceUnit('forward')} disabled={advancing || (group.current_unit_order ?? 0) >= group.total_units - 1} style={s.unitBtn}>Next unit ▶</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={s.muted}>Not started yet · {group.total_units} units in this book.</p>
                    <button onClick={() => advanceUnit('forward')} disabled={advancing} style={{ ...s.unitBtn, marginTop: 10 }}>Start with Unit 1</button>
                  </>
                )
              ) : (
                <p style={s.muted}>This curriculum has no units yet. <Link href="/curricula" style={s.inlineLink}>Add some</Link>.</p>
              )}
            </>
          ) : (
            <>
              <p style={s.muted}>No curriculum assigned to this group.</p>
              <button onClick={openCurriculumPicker} style={{ ...s.unitBtn, marginTop: 10 }}>Assign a curriculum</button>
            </>
          )}

          {showCurriculumPicker && (
            <div style={s.curriculumPicker}>
              <select value={pickedCurriculum} onChange={e => setPickedCurriculum(e.target.value)} style={s.dateInput}>
                <option value="">Choose a curriculum…</option>
                {curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={assignCurriculum} disabled={!pickedCurriculum || assigningCurriculum} style={s.addStudentBtn}>Assign</button>
              <button onClick={() => setShowCurriculumPicker(false)} style={s.removeBtn}>Cancel</button>
            </div>
          )}
        </section>

        {/* Attendance date */}
        <div style={s.dateRow}>
          <label style={s.dateLabel}>Attendance for</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={s.dateInput} />
          {savingAttendance && <span style={s.savingTag}>saving…</span>}
        </div>

        {/* Roster */}
        <section style={s.section}>
          <div style={s.rosterHeaderRow}>
            <div style={s.sectionTitle}>Roster ({group.students.length})</div>
            <button onClick={openAddStudent} style={s.addStudentBtn}>+ Add student</button>
          </div>

          {group.students.length === 0 ? (
            <p style={s.muted}>No students in this group yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.students.map(st => (
                <div key={st.id} style={s.studentRow}>
                  <label style={s.presentCheckbox}>
                    <input type="checkbox" checked={!!st.present} onChange={e => toggleAttendance(st.id, e.target.checked)} style={s.checkbox} />
                  </label>
                  <Link href={`/students/${st.id}`} style={s.studentInfo}>
                    <div style={s.studentName}>{st.name}</div>
                    <div style={s.studentMeta}>
                      {st.level || '—'}
                      {st.avg_score != null && ` · avg ${st.avg_score}`}
                      {st.entry_count > 0 ? ` · ${st.entry_count} piece${st.entry_count === 1 ? '' : 's'} of work` : ' · no work logged'}
                      {st.last_activity && ` · last ${st.last_activity}`}
                    </div>
                  </Link>
                  <button onClick={() => openLog(st)} style={s.logBtn}>+ Log</button>
                  <button onClick={() => removeStudent(st.id)} style={s.removeBtn}>✕</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {logStudent && (
        <div style={s.modalBackdrop} onClick={() => setLogStudent(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Log for {logStudent.name}</span>
              <button onClick={() => setLogStudent(null)} style={s.closeBtn}>✕</button>
            </div>

            <div style={s.typeToggle}>
              <button onClick={() => setLogType('checkin')} style={{ ...s.typeBtn, ...(logType === 'checkin' ? s.typeBtnActive : {}) }}>Monthly check-in</button>
              <button onClick={() => setLogType('activity')} style={{ ...s.typeBtn, ...(logType === 'activity' ? s.typeBtnActive : {}) }}>Activity</button>
            </div>

            <div style={s.modalScroll}>
              {logType === 'checkin' ? (
                <>
                  <div style={s.logRow}>
                    <label style={s.logLabel}>Score (0–100)</label>
                    <input type="number" min={0} max={100} value={logScore} onChange={e => setLogScore(e.target.value)} style={s.logInput} />
                  </div>
                  <div style={s.logRow}>
                    <label style={s.logLabel}>CEFR estimate</label>
                    <select value={logCefr} onChange={e => setLogCefr(e.target.value)} style={s.logInput}>
                      <option value="">—</option>
                      {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={s.skillLabel}>By skill (optional)</div>
                  <div style={s.skillGrid}>
                    {SKILLS.map(sk => (
                      <div key={sk} style={s.skillCell}>
                        <label style={s.skillCellLabel}>{sk}</label>
                        <input type="number" min={0} max={100} value={logBySkill[sk]}
                          onChange={e => setLogBySkill(v => ({ ...v, [sk]: e.target.value }))} style={s.logInput} />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={s.logRow}>
                    <label style={s.logLabel}>Activity</label>
                    <input placeholder="e.g. Unit 9 worksheet" value={logActivityTitle} onChange={e => setLogActivityTitle(e.target.value)} style={s.logInput} />
                  </div>
                  <div style={s.logRow}>
                    <label style={s.logLabel}>Score (optional)</label>
                    <input type="number" min={0} max={100} value={logScore} onChange={e => setLogScore(e.target.value)} style={s.logInput} />
                  </div>
                  <div style={s.skillLabel}>Error tags</div>
                  <div style={s.tagRow}>
                    {ERROR_TAGS.map(t => (
                      <button key={t.key} onClick={() => toggleErrorTag(t.key)}
                        style={{ ...s.tagChip, ...(logErrorTags.includes(t.key) ? s.tagChipActive : {}) }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button onClick={saveLog} disabled={logSaving} style={s.saveLogBtn}>{logSaving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )}

      {showAddStudent && (
        <div style={s.modalBackdrop} onClick={() => setShowAddStudent(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Add student to {group.name}</span>
              <button onClick={() => setShowAddStudent(false)} style={s.closeBtn}>✕</button>
            </div>
            <input autoFocus placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} style={s.searchInput} />
            <div style={s.modalList}>
              {filtered.length === 0 ? (
                <p style={s.muted}>{search ? 'No students match.' : 'All students are already in a group.'}</p>
              ) : (
                filtered.map(st => (
                  <button key={st.id} onClick={() => addStudent(st.id)} style={s.modalRow}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{st.name}</div>
                      <div style={{ fontSize: 11.5, color: '#6b7280' }}>
                        {st.level}{st.group_name ? ` · currently in ${st.group_name}` : ''}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: COLORS.paper, fontFamily: FONT.sans },
  header: { background: COLORS.racing, color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 },
  headerLink: { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 13, fontWeight: 600 },
  headerTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 19 },
  wrap: { maxWidth: 640, margin: '0 auto', padding: '24px 16px 60px', display: 'flex', flexDirection: 'column', gap: 16 },

  section: { background: '#fff', borderRadius: RADIUS.card, padding: '20px 22px', boxShadow: SHADOW.inkSoft, border: `1px solid ${COLORS.line}` },
  sectionTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 17, color: COLORS.ink },
  muted: { fontSize: 13, color: COLORS.muted, marginTop: 6 },
  inlineLink: { color: COLORS.greenDk, fontWeight: 700 },
  curriculumHeaderRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  changeLink: { background: 'none', border: 'none', color: COLORS.greenDk, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 },
  curriculumPicker: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' },

  progressRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 },
  progressTrack: { flex: 1, height: 6, background: COLORS.paper2, borderRadius: RADIUS.pill, overflow: 'hidden' },
  progressFill: { height: '100%', background: COLORS.green },
  progressLabel: { fontSize: 12, color: COLORS.muted, fontWeight: 600, flexShrink: 0 },
  unitTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 15, color: COLORS.ink, marginTop: 10 },
  unitBtnRow: { display: 'flex', gap: 8, marginTop: 14 },
  unitBtn: {
    flex: 1, background: COLORS.paper2, color: COLORS.racing, border: 'none', borderRadius: RADIUS.pill,
    padding: '10px 0', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: `all 0.2s ${EASE}`,
  },

  dateRow: { display: 'flex', alignItems: 'center', gap: 10 },
  dateLabel: { fontSize: 12.5, fontWeight: 600, color: COLORS.muted },
  dateInput: { borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 10, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', background: '#fff' },
  savingTag: { fontSize: 11.5, color: COLORS.muted, fontStyle: 'italic' },

  rosterHeaderRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  addStudentBtn: { background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.green },

  studentRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${COLORS.paper2}` },
  presentCheckbox: { flexShrink: 0 },
  checkbox: { width: 18, height: 18, accentColor: COLORS.green, cursor: 'pointer' },
  studentInfo: { flex: 1, textDecoration: 'none', color: 'inherit' },
  studentName: { fontSize: 14, fontWeight: 600, color: COLORS.ink },
  studentMeta: { fontSize: 11.5, color: COLORS.muted, marginTop: 1 },
  removeBtn: { background: 'none', border: 'none', color: COLORS.danger, fontSize: 13, cursor: 'pointer', padding: '2px 6px', flexShrink: 0 },
  logBtn: {
    background: COLORS.paper2, color: COLORS.racing, border: 'none', borderRadius: RADIUS.pill,
    padding: '6px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
  },

  typeToggle: { display: 'flex', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1, background: COLORS.paper2, color: COLORS.ink, border: 'none', borderRadius: RADIUS.pill,
    padding: '10px 0', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: `all 0.2s ${EASE}`,
  },
  typeBtnActive: { background: COLORS.green, color: '#fff', boxShadow: SHADOW.green },
  modalScroll: { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 },
  logRow: { display: 'flex', flexDirection: 'column', gap: 4 },
  logLabel: { fontSize: 12, fontWeight: 600, color: COLORS.muted },
  logInput: {
    borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 10, padding: '9px 11px',
    fontSize: 13.5, fontFamily: 'inherit', outline: 'none', width: '100%', background: '#fff',
  },
  skillLabel: { fontSize: 12, fontWeight: 600, color: COLORS.muted, marginTop: 4 },
  skillGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  skillCell: { display: 'flex', flexDirection: 'column', gap: 3 },
  skillCellLabel: { fontSize: 10.5, color: COLORS.muted, textTransform: 'capitalize' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tagChip: {
    borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, background: '#fff', color: COLORS.ink,
    borderRadius: RADIUS.pill, padding: '6px 13px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: `all 0.18s ${EASE}`,
  },
  tagChipActive: { background: COLORS.green, borderColor: COLORS.green, color: '#fff' },
  saveLogBtn: {
    background: COLORS.green, color: '#fff', border: 'none', borderRadius: RADIUS.pill, padding: '12px 0',
    fontSize: 13.5, fontWeight: 700, cursor: 'pointer', marginTop: 16, flexShrink: 0, boxShadow: SHADOW.green,
  },

  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(23,40,27,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
  modal: { background: COLORS.paper, borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 500, maxHeight: '75vh', display: 'flex', flexDirection: 'column', padding: 20 },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { fontFamily: FONT.serif, fontWeight: 500, fontSize: 16, color: COLORS.ink },
  closeBtn: { background: 'none', border: 'none', fontSize: 16, color: COLORS.muted, cursor: 'pointer' },
  searchInput: {
    borderWidth: 1.5, borderStyle: 'solid', borderColor: COLORS.line, borderRadius: 12, padding: '10px 12px',
    fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 10, background: '#fff',
  },
  modalList: { overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  modalRow: { display: 'flex', alignItems: 'center', padding: '10px 4px', background: 'none', border: 'none', borderBottom: `1px solid ${COLORS.paper2}`, cursor: 'pointer', textAlign: 'left' },
}
