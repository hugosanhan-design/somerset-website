'use client'

// Teacher portal — create and manage catch-up packs. Each pack gets a public
// shareable URL (/catchup/[id]) for students who missed a class.

import { useState, useEffect } from 'react'
import { COLORS, FONT, RADIUS, SHADOW } from '@/lib/theme'
import { PORTAL } from '@/lib/portalTheme'

interface Group { id: string; name: string; level: string }
interface Pack {
  id: string; group_name: string; date: string; unit_title: string
  writing_prompt: string; cbt_paper: string; reading_url: string; reading_label: string; note: string
}

function todayISO() { return new Date().toISOString().slice(0, 10) }
function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const CBT_PAPERS = [
  { value: '', label: 'None' },
  { value: 'reading', label: 'Reading & Use of English' },
  { value: 'listening', label: 'Listening' },
  { value: 'writing', label: 'Writing' },
]

export default function CatchupPacksPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)

  const [groupId, setGroupId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [unitTitle, setUnitTitle] = useState('')
  const [writingPrompt, setWritingPrompt] = useState('')
  const [cbtPaper, setCbtPaper] = useState('')
  const [readingUrl, setReadingUrl] = useState('')
  const [readingLabel, setReadingLabel] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedPack, setSavedPack] = useState<Pack | null>(null)
  const [copyMsg, setCopyMsg] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/groups').then(r => r.json()),
      fetch('/api/catchup').then(r => r.json()),
    ]).then(([g, p]) => {
      setGroups(Array.isArray(g) ? g : [])
      setPacks(Array.isArray(p) ? p : [])
    }).finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!groupId || !unitTitle.trim()) return
    setSaving(true)
    try {
      const r = await fetch('/api/catchup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, date, unit_title: unitTitle, writing_prompt: writingPrompt, cbt_paper: cbtPaper, reading_url: readingUrl, reading_label: readingLabel, note }),
      })
      if (!r.ok) throw new Error(await r.text())
      const pack = await r.json()
      setSavedPack(pack)
      setPacks(prev => [pack, ...prev])
      setUnitTitle(''); setWritingPrompt(''); setCbtPaper(''); setReadingUrl(''); setReadingLabel(''); setNote('')
    } finally {
      setSaving(false)
    }
  }

  function copyLink(packId: string) {
    const url = `${window.location.origin}/catchup/${packId}`
    navigator.clipboard.writeText(url).then(() => { setCopyMsg(packId); setTimeout(() => setCopyMsg(''), 2000) })
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

      <h1 style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 26, color: COLORS.ink, margin: '0 0 4px' }}>
        Catch-up packs
      </h1>
      <p style={{ fontSize: 13.5, color: COLORS.muted, marginBottom: 32 }}>
        Create a shareable link for students who missed a class. They get direct access to writing correction, a practice exam and a reading article — no login needed.
      </p>

      {/* ── Create form ─────────────────────────────── */}
      <div style={section}>
        <div style={sectionTitle}>New catch-up pack</div>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div style={row}>
            <label style={label}>Class group *</label>
            <select style={input} value={groupId} onChange={e => setGroupId(e.target.value)} required>
              <option value="">Select a group…</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}{g.level ? ` · ${g.level}` : ''}</option>)}
            </select>
          </div>

          <div style={row}>
            <label style={label}>Class date *</label>
            <input type="date" style={input} value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <div style={row}>
            <label style={label}>Unit / topic *</label>
            <input style={input} placeholder="e.g. Unit 4 — Past Perfect, Regrets" value={unitTitle} onChange={e => setUnitTitle(e.target.value)} required />
          </div>

          <div style={row}>
            <label style={label}>Writing task</label>
            <textarea
              style={{ ...input, minHeight: 70, resize: 'vertical' }}
              placeholder="e.g. Write an email to a friend describing a film you've seen recently (140–190 words)."
              value={writingPrompt}
              onChange={e => setWritingPrompt(e.target.value)}
            />
          </div>

          <div style={row}>
            <label style={label}>Practice exam</label>
            <select style={input} value={cbtPaper} onChange={e => setCbtPaper(e.target.value)}>
              {CBT_PAPERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ ...row, flex: 2 }}>
              <label style={label}>Reading link</label>
              <input style={input} type="url" placeholder="https://…" value={readingUrl} onChange={e => setReadingUrl(e.target.value)} />
            </div>
            <div style={{ ...row, flex: 1 }}>
              <label style={label}>Link label</label>
              <input style={input} placeholder="Article title" value={readingLabel} onChange={e => setReadingLabel(e.target.value)} />
            </div>
          </div>

          <div style={row}>
            <label style={label}>Note to student</label>
            <textarea
              style={{ ...input, minHeight: 60, resize: 'vertical' }}
              placeholder="Optional personal message shown at the top of their catch-up page."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <button type="submit" disabled={saving || !groupId || !unitTitle.trim()} style={btn}>
            {saving ? 'Creating…' : 'Create catch-up pack'}
          </button>

        </form>

        {savedPack && (
          <div style={{ marginTop: 16, padding: '14px 16px', backgroundColor: COLORS.paper2, borderRadius: RADIUS.card, border: `1px solid ${COLORS.line}` }}>
            <div style={{ fontSize: 13, color: COLORS.green, fontWeight: 700, marginBottom: 6 }}>Pack created — copy the link and WhatsApp it to the student</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <code style={{ flex: 1, fontSize: 12.5, color: COLORS.ink, wordBreak: 'break-all', backgroundColor: '#fff', padding: '6px 10px', borderRadius: 8, border: `1px solid ${COLORS.line}` }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/catchup/${savedPack.id}` : `/catchup/${savedPack.id}`}
              </code>
              <button style={copyBtn} onClick={() => copyLink(savedPack.id)}>
                {copyMsg === savedPack.id ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent packs ──────────────────────────── */}
      {packs.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={sectionTitle}>Recent packs</div>
          {loading ? (
            <div style={{ fontSize: 13.5, color: COLORS.muted }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {packs.map(p => (
                <div key={p.id} style={{ ...packRow }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT.serif, fontSize: 15, color: COLORS.ink, fontWeight: 500 }}>{p.unit_title}</div>
                    <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 2 }}>{p.group_name} · {fmtDate(p.date)}</div>
                    <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 2 }}>
                      {[p.writing_prompt && 'Writing', p.cbt_paper && 'Exam', p.reading_url && 'Reading'].filter(Boolean).join(' · ') || 'No tasks yet'}
                    </div>
                  </div>
                  <button style={copyBtn} onClick={() => copyLink(p.id)}>
                    {copyMsg === p.id ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

// ── Styles ──────────────────────────────────────────
const section: React.CSSProperties = {
  backgroundColor: COLORS.paper,
  border: `1px solid ${COLORS.line}`,
  borderRadius: RADIUS.card,
  padding: '22px 24px',
  boxShadow: SHADOW.inkSoft,
}
const sectionTitle: React.CSSProperties = {
  fontFamily: FONT.serif,
  fontSize: 17,
  fontWeight: 500,
  color: COLORS.ink,
  marginBottom: 18,
}
const row: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5 }
const label: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: COLORS.inkSoft, letterSpacing: '0.03em' }
const input: React.CSSProperties = {
  fontFamily: FONT.sans, fontSize: 14, padding: '9px 11px',
  border: `1.5px solid ${COLORS.line}`, borderRadius: 9,
  backgroundColor: '#fff', color: COLORS.ink,
}
const btn: React.CSSProperties = {
  fontFamily: FONT.sans, fontSize: 14.5, fontWeight: 700, color: '#fff',
  backgroundColor: COLORS.green, border: 'none', borderRadius: 10,
  padding: '11px 20px', cursor: 'pointer', alignSelf: 'flex-start',
}
const copyBtn: React.CSSProperties = {
  fontFamily: FONT.sans, fontSize: 12.5, fontWeight: 700, color: COLORS.green,
  backgroundColor: 'transparent', border: `1.5px solid ${COLORS.green}`,
  borderRadius: 8, padding: '6px 14px', cursor: 'pointer', flexShrink: 0,
}
const packRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14,
  backgroundColor: COLORS.paper, border: `1px solid ${COLORS.line}`,
  borderRadius: RADIUS.card, padding: '14px 16px', boxShadow: SHADOW.inkSoft,
}
