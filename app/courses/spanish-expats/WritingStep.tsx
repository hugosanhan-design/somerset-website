'use client'
// Module step "Escribir": one short real message, corrected automatically, with a version
// ready to send. Every fix becomes a personal item in Repaso (progress.personal).

import { useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { recordAnswer, type Progress } from '@/lib/courses/progress'
import { WRITING_TASKS_M1, shortHashSE, type WritingTaskSE } from '@/lib/courses/spanishExpats'
import { Icon } from './icons'

type Fix = { sentence: string; original: string; fix: string; why: string }
type Result = { fixes: Fix[]; corrected: string; missing: string[]; level: 'below' | 'starting' | 'solid'; verdict: string; praise: string }
const LEVEL = { below: 'Hard to follow', starting: "They'd understand you", solid: 'Ready to send' }

// The student's text with each fix shown in place: wrong part struck in red, fix in green.
function Marked({ text, fixes }: { text: string; fixes: Fix[] }) {
  const ranges: { start: number; end: number; i: number }[] = []
  fixes.forEach((f, i) => {
    const s = text.indexOf(f.sentence)
    if (s < 0) return
    const start = s + f.sentence.indexOf(f.original)
    const end = start + f.original.length
    if (!ranges.some(r => start < r.end && end > r.start)) ranges.push({ start, end, i })
  })
  ranges.sort((a, b) => a.start - b.start)
  const out: ReactNode[] = []
  let at = 0
  ranges.forEach((r, k) => {
    if (r.start > at) out.push(<span key={`t${k}`}>{text.slice(at, r.start)}</span>)
    out.push(<span key={`f${k}`} className="wr-fix"><s>{text.slice(r.start, r.end)}</s> <ins>{fixes[r.i].fix}</ins><sup>{r.i + 1}</sup></span>)
    at = r.end
  })
  if (at < text.length) out.push(<span key="end">{text.slice(at)}</span>)
  return <p className="wr-marked">{out}</p>
}

export default function WritingStep({ student, savedText, updateProgress, onDone }: {
  student: { name: string; code: string } | null
  savedText?: Record<string, { text: string; at: number }>
  updateProgress: (fn: (p: Progress) => Progress) => void
  onDone: () => void
}) {
  const [task, setTask] = useState<WritingTaskSE>(WRITING_TASKS_M1[0])
  const [text, setText] = useState(savedText?.[`m1:${WRITING_TASKS_M1[0].id}`]?.text ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState<Result | null>(null)
  const [sent, setSent] = useState('')
  const [copied, setCopied] = useState(false)
  const box = useRef<HTMLTextAreaElement>(null)
  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  function pick(t: WritingTaskSE) {
    setTask(t); setRes(null); setErr(''); setText(savedText?.[`m1:${t.id}`]?.text ?? '')
  }

  // Tap a phrase: it goes in where the cursor is.
  function insert(p: string) {
    const el = box.current
    const clean = p.replace(/…/g, '')
    if (!el) { setText(t => (t ? t + ' ' : '') + clean); return }
    const a = el.selectionStart ?? text.length, b = el.selectionEnd ?? text.length
    const before = text.slice(0, a), after = text.slice(b)
    const pad = before && !/\s$/.test(before) ? (/[:,]$/.test(before) ? '\n' : ' ') : ''
    const next = before + pad + clean + (after && !/^\s/.test(after) ? ' ' : '') + after
    setText(next)
    requestAnimationFrame(() => { el.focus(); const pos = (before + pad + clean).length; el.setSelectionRange(pos, pos) })
  }

  async function correct() {
    if (!student) { setErr("Sign in at Student's Corner first, so your message can be corrected."); return }
    setBusy(true); setErr(''); setRes(null)
    try {
      const r = await fetch('/api/courses/expats-writing', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, taskId: task.id, text }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Correction is unavailable right now.')
      setRes(d); setSent(text); setCopied(false)
      // Save the text, and turn each fix into a personal Repaso item.
      updateProgress(p => {
        const personal = { ...(p.personal ?? {}) }
        let next: Progress = { ...p, personal, writing: { ...(p.writing ?? {}), [`m1:${task.id}`]: { text, at: Date.now() } } }
        for (const f of d.fixes as Fix[]) {
          const [pre, ...rest] = f.sentence.split(f.original)
          const id = 'own:w:' + shortHashSE(f.sentence + '|' + f.original)
          personal[id] = { pre, seg: f.original, post: rest.join(f.original), fix: f.fix, why: f.why, at: Date.now() }
          next = recordAnswer(next, id, false)
        }
        return next
      })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Correction is unavailable right now.')
    }
    setBusy(false)
  }

  async function copy() {
    if (!res) return
    try { await navigator.clipboard.writeText(res.corrected); setCopied(true) } catch { setCopied(false) }
  }

  return (
    <div className="card wr">
      <div className="lesson-header">
        <div className="lesson-tag" style={{ background: '#5a9a2c' }}>Escribir</div>
        <div>
          <div className="lesson-title">Por escrito</div>
          <div className="lesson-aim">Write a short message you could really send this week. It comes back corrected and ready to copy, and your mistakes go into Repaso.</div>
        </div>
      </div>

      <div className="wr-tasks">
        {WRITING_TASKS_M1.map(t => (
          <button key={t.id} type="button" className={`wr-task${t.id === task.id ? ' on' : ''}`} onClick={() => pick(t)}>
            <Icon name={t.icon} size={36} />
            <span><strong>{t.title}</strong><small>{t.channel === 'email' ? 'Email' : 'WhatsApp'}</small></span>
          </button>
        ))}
      </div>

      {!res ? (
        <div className="wr-grid">
          <div>
            <div className={`wr-compose wr-compose--${task.channel}`}>
              <div className="wr-to"><span>To</span>{task.to}</div>
              <textarea ref={box} className="wr-text" value={text} onChange={e => setText(e.target.value)}
                placeholder={task.channel === 'email' ? 'Buenos días:\n\n…' : 'Hola, Vicente:\n\n…'} rows={9} spellCheck={false} />
              <div className="wr-bar">
                <span className={`wr-count${words >= 25 ? ' ok' : ''}`}>{words} words · aim for 30 to 70</span>
                <button type="button" className="btn btn--terra" onClick={() => void correct()} disabled={busy || words < 8}>
                  {busy ? 'Reading your message…' : 'Correct my message →'}
                </button>
              </div>
            </div>
            {err && <p className="wr-err">{err}</p>}
          </div>
          <aside className="wr-side">
            <p className="label">The situation</p>
            <p className="wr-situation">{task.situation}</p>
            <p className="label">Include</p>
            <ul className="wr-include">{task.include.map(i => <li key={i}>{i}</li>)}</ul>
            <p className="label">Useful Spanish <small>tap to add</small></p>
            <div className="wr-phrases">
              {task.phrases.map(p => <button key={p} type="button" className="wr-phrase" onClick={() => insert(p)}>{p}</button>)}
            </div>
          </aside>
        </div>
      ) : (
        <div className="wr-grid">
          <div>
            <p className={`wr-verdict wr-verdict--${res.level}`}><b>{LEVEL[res.level]}</b> {res.verdict}</p>
            {res.praise && <p className="wr-praise"><Icon name="well-done" size={22} className="ico-inline" /> {res.praise}</p>}
            <p className="label">Your message</p>
            <Marked text={sent} fixes={res.fixes} />
            {res.missing.length > 0 && (
              <p className="wr-missing"><strong>Still missing:</strong> {res.missing.join(' · ')}</p>
            )}
            <div className="wr-ready">
              <div className="wr-ready__head">
                <span><Icon name="correct" size={22} className="ico-inline" /> Ready to send</span>
                <button type="button" className="wr-copy" onClick={() => void copy()}>{copied ? '✓ Copied' : 'Copy'}</button>
              </div>
              <p className="wr-ready__text">{res.corrected}</p>
            </div>
          </div>
          <aside className="wr-side">
            <p className="label">{res.fixes.length ? `${res.fixes.length} thing${res.fixes.length > 1 ? 's' : ''} to learn` : 'Nothing to fix. ¡Muy bien!'}</p>
            <ol className="wr-fixes">
              {res.fixes.map((f, i) => (
                <li key={i}><span className="wr-fixes__pair"><s>{f.original}</s> → <ins>{f.fix}</ins></span><span className="wr-fixes__why">{f.why}</span></li>
              ))}
            </ol>
            {res.fixes.length > 0 && (
              <p className="wr-repaso"><Icon name="books" size={22} className="ico-inline" /> These are now in your <Link href="/courses/spanish-expats/repaso">Repaso</Link>, ready to practise.</p>
            )}
            <div className="wr-actions">
              <button type="button" className="btn btn--ghost" onClick={() => { setRes(null); setText(res.corrected) }}>Edit and send again</button>
              <button type="button" className="btn btn--terra" onClick={onDone}>Next: Resultado →</button>
            </div>
          </aside>
        </div>
      )}
      {!res && (
        <div className="sp-foot">
          <span className="sp-foot__note">No time now? You can come back to this step later.</span>
          <button type="button" className="btn btn--ghost" onClick={onDone}>Skip to Resultado →</button>
        </div>
      )}
    </div>
  )
}
