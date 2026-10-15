'use client'

// Register a test (unit test, mock...) so the portal knows what a scanned exam is
// being marked against: the paper, the answer key, and the key transcribed to text.
// Register it ahead of the week for planned tests, or on the day for anything made
// that day. Scans then link to it from /scan, and /correct-queue marks against the key.

import { useEffect, useState } from 'react'
import { PORTAL } from '@/lib/portalTheme'

interface Group { id: string; name: string }
interface Assessment {
  id: string; group_id: string | null; group_name: string | null; date: string; title: string
  test_urls: string; key_urls: string; key_text: string; key_confirmed: number
}

export default function Assessments() {
  const [groups, setGroups] = useState<Group[]>([])
  const [list, setList] = useState<Assessment[] | null>(null)
  const [groupId, setGroupId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [title, setTitle] = useState('')
  const [testFiles, setTestFiles] = useState<File[]>([])
  const [keyFiles, setKeyFiles] = useState<File[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})

  function load() { fetch('/api/assessments').then(r => r.json()).then(setList) }
  useEffect(() => {
    fetch('/api/groups').then(r => r.json()).then(setGroups)
    load()
  }, [])

  async function register() {
    setError(null); setBusy('Uploading…')
    try {
      const fd = new FormData()
      fd.append('groupId', groupId); fd.append('date', date); fd.append('title', title)
      testFiles.forEach(f => fd.append('test', f)); keyFiles.forEach(f => fd.append('key', f))
      const res = await fetch('/api/assessments', { method: 'POST', body: fd })
      const raw = await res.text()
      let data: { id?: string; error?: string } = {}
      try { data = JSON.parse(raw) } catch { /* not JSON: show the status below */ }
      if (!res.ok || !data.id) {
        setError(`Could not save (error ${res.status}): ${data.error || raw.slice(0, 160) || 'no details'}`)
        return
      }
      setBusy('Reading the answer key…')
      const rk = await fetch(`/api/assessments/${data.id}/read-key`, { method: 'POST' })
      const rkd = await rk.json().catch(() => ({} as { error?: string }))
      if (!rk.ok) setError(`Saved, but the key could not be read: ${rkd.error || rk.status}. Open it below and press "Read key again".`)
      setTitle(''); setTestFiles([]); setKeyFiles([])
      load(); setOpen(data.id)
    } catch (e) {
      setError(`Could not reach the server: ${e instanceof Error ? e.message : 'unknown error'}`)
    } finally {
      setBusy('')
    }
  }

  async function readAgain(id: string) {
    setBusy('Reading the answer key…')
    const res = await fetch(`/api/assessments/${id}/read-key`, { method: 'POST' })
    const d = await res.json().catch(() => ({}))
    setBusy('')
    if (!res.ok) setError(d.error || `Error ${res.status}`)
    setDraft(x => { const n = { ...x }; delete n[id]; return n })
    load()
  }

  async function confirm(a: Assessment) {
    const text = draft[a.id] ?? a.key_text
    await fetch(`/api/assessments/${a.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key_text: text, key_confirmed: true }),
    })
    setDraft(x => { const n = { ...x }; delete n[a.id]; return n })
    load()
  }

  async function remove(id: string) {
    if (!window.confirm('Remove this test? Scans linked to it are kept.')) return
    await fetch(`/api/assessments/${id}`, { method: 'DELETE' })
    load()
  }

  const canRegister = !!groupId && !!title.trim() && keyFiles.length > 0 && !busy

  return (
    <div style={s.wrap}>
      <div style={s.pageTitle}>Tests</div>
      <p style={s.sub}>Register a test and its answer key so scanned work can be marked against it. Do it ahead of the week, or on the day.</p>

      <div style={s.card}>
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Group</label>
            <select value={groupId} onChange={e => setGroupId(e.target.value)} style={s.input}>
              <option value="">Choose a group…</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Date of the test</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={s.input} />
          </div>
        </div>
        <label style={s.label}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Unit 1 Test" style={s.input} />

        <div style={s.grid2}>
          <div>
            <label style={s.label}>Test paper (PDF or photos)</label>
            <input type="file" multiple accept="application/pdf,image/*" onChange={e => setTestFiles(Array.from(e.target.files || []))} />
            <div style={s.hint}>{testFiles.length ? `${testFiles.length} file(s)` : 'Optional, but lets the marker see the questions.'}</div>
          </div>
          <div>
            <label style={s.label}>Answer key (PDF or photos)</label>
            <input type="file" multiple accept="application/pdf,image/*" onChange={e => setKeyFiles(Array.from(e.target.files || []))} />
            <div style={s.hint}>{keyFiles.length ? `${keyFiles.length} file(s)` : 'Required.'}</div>
          </div>
        </div>

        {error && <p style={{ color: PORTAL.red, fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
        {!canRegister && !busy && (
          <p style={{ color: PORTAL.muted, fontSize: 13, margin: '0 0 12px' }}>
            Still needed: {[!groupId && 'a group', !title.trim() && 'a title', keyFiles.length === 0 && 'the answer key file'].filter(Boolean).join(', ')}.
          </p>
        )}
        <button onClick={register} disabled={!canRegister} style={{ ...s.btn, opacity: canRegister ? 1 : 0.5 }}>{busy || 'Register test'}</button>
      </div>

      <div style={{ ...s.pageTitle, fontSize: 17, marginTop: 28 }}>Registered tests</div>
      {list === null ? <p style={s.sub}>Loading…</p> : list.length === 0 ? <p style={s.sub}>None yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(a => (
            <div key={a.id} style={s.row}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setOpen(open === a.id ? null : a.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: PORTAL.ink }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: PORTAL.muted }}>{a.group_name || 'No group'} · {a.date}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: a.key_confirmed ? PORTAL.greenDeep : PORTAL.amber }}>
                  {a.key_confirmed ? 'Key confirmed' : a.key_text ? 'Key needs checking' : 'Key not read'}
                </span>
              </div>
              {open === a.id && (
                <div style={{ marginTop: 12 }}>
                  <label style={s.label}>Answer key as the marker will see it. Check it against the original.</label>
                  <textarea
                    value={draft[a.id] ?? a.key_text}
                    onChange={e => setDraft(x => ({ ...x, [a.id]: e.target.value }))}
                    rows={14}
                    style={{ ...s.input, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }}
                  />
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button onClick={() => confirm(a)} disabled={!(draft[a.id] ?? a.key_text).trim() || !!busy} style={s.btn}>Confirm key</button>
                    <button onClick={() => readAgain(a.id)} disabled={!!busy} style={s.btnGhost}>{busy || 'Read key again'}</button>
                    {(JSON.parse(a.key_urls || '[]') as string[]).map((u, i) => <a key={u} href={u} target="_blank" rel="noreferrer" style={s.link}>Original key {i + 1}</a>)}
                    {(JSON.parse(a.test_urls || '[]') as string[]).map((u, i) => <a key={u} href={u} target="_blank" rel="noreferrer" style={s.link}>Test paper {i + 1}</a>)}
                    <button onClick={() => remove(a.id)} style={{ ...s.btnGhost, color: PORTAL.red, marginLeft: 'auto' }}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 820, margin: '0 auto', padding: '28px 28px 60px' },
  pageTitle: { fontSize: 22, fontWeight: 700, color: PORTAL.ink, marginBottom: 4 },
  sub: { color: PORTAL.muted, fontSize: 14, marginBottom: 20 },
  card: { border: `2px solid ${PORTAL.line}`, borderRadius: 14, padding: 18, background: PORTAL.paper },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: PORTAL.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 10, border: `2px solid ${PORTAL.line}`, marginBottom: 16, fontFamily: 'inherit', color: PORTAL.ink, background: '#fff' },
  hint: { fontSize: 12, color: PORTAL.muted, margin: '6px 0 16px' },
  btn: { padding: '11px 20px', borderRadius: 999, border: 'none', background: PORTAL.green, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  btnGhost: { padding: '10px 16px', borderRadius: 999, border: `2px solid ${PORTAL.line}`, background: '#fff', color: PORTAL.ink, fontSize: 14, cursor: 'pointer' },
  row: { border: `2px solid ${PORTAL.line}`, borderRadius: 14, padding: '14px 16px', background: PORTAL.paper },
  link: { fontSize: 13, color: PORTAL.greenDeep },
}
