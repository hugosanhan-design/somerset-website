'use client'

// Student's Corner — public hub, no login. General tools (mock, placement, games) are
// open to everyone. "Your area" is gated by name + code, verified server-side
// (/api/student/access), and shows only that student's own content.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SomersetLogo from '@/components/SomersetLogo'

interface StudentLink { emoji: string; title: string; desc: string; href: string }
interface StudentArea { displayName: string; links: StudentLink[] }

type Tool = { emoji: string; title: string; desc: string; href: string; accent: string; accentLt: string; tag: string }
const TOOLS: Tool[] = [
  { emoji: '🖥️', title: 'Sit a mock exam', desc: 'Cambridge-style B2 First: Reading, Use of English, Writing and Listening, timed like the real thing.', href: '/cbt', accent: '#E1614C', accentLt: '#fdf0ed', tag: 'Exam' },
  { emoji: '↩️', title: 'Continue an exam', desc: 'Started a mock and got cut off? Enter your resume code and carry on from where you left off, on any computer.', href: '/cbt', accent: '#2C4A6E', accentLt: '#eaeff6', tag: 'Exam' },
  { emoji: '📋', title: 'Placement quiz', desc: 'A quick adaptive quiz to find your level. For new students.', href: '/intake', accent: '#3E8FB0', accentLt: '#e8f4f9', tag: 'Level' },
  { emoji: '📝', title: 'Placement test', desc: 'The longer level test, A1 to C1. Your result goes straight to the centre.', href: '/placement/index.html', accent: '#E8A33D', accentLt: '#fef5e4', tag: 'Level' },
  { emoji: '🎮', title: 'English games', desc: 'Grammar sprint, irregular verbs, vocabulary and more. Practise for fun.', href: '/games/index.html', accent: '#4d8520', accentLt: '#eaf4da', tag: 'Practice' },
]

export default function StudentCorner() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [area, setArea] = useState<StudentArea | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  // Remember the student on this device and re-verify on load.
  useEffect(() => {
    let saved: { name?: string; code?: string } | null = null
    try { saved = JSON.parse(localStorage.getItem('somersetStudent') || 'null') } catch { saved = null }
    if (saved?.name && saved?.code) {
      setName(saved.name); setCode(saved.code)
      fetch('/api/student/access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saved),
      }).then(r => r.json()).then(d => { if (d?.ok) setArea(d.area) }).catch(() => {})
    }
  }, [])

  async function handleEnter(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const r = await fetch('/api/student/access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) { setErr(d.error || 'Name or code not recognised.'); return }
      setArea(d.area)
      try { localStorage.setItem('somersetStudent', JSON.stringify({ name, code })) } catch { /* ignore */ }
    } catch {
      setErr('Could not check right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    try { localStorage.removeItem('somersetStudent') } catch { /* ignore */ }
    setArea(null); setName(''); setCode(''); setErr('')
  }

  return (
    <div className="sc">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="sc-header">
        <SomersetLogo variant="white" />
        <span className="sc-unit">Student&apos;s Corner · Valencia</span>
        <Link href="/" className="sc-home">← Home</Link>
      </header>

      <section className="sc-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Somerset%20b-g.jpg" alt="Somerset countryside at dusk" />
        <div className="sc-hero-overlay">
          <p className="sc-hero-label">Somerset Language Centre</p>
          <h1 className="sc-hero-title">Student&apos;s Corner</h1>
          <p className="sc-hero-sub">Your plan, your practice, your exams. Pick what your teacher has asked you to do.</p>
        </div>
      </section>

      <div className="sc-strip" />

      <main className="sc-wrap">
        <div className="sc-grid">

          {/* ── Your area (gated) ── */}
          <section className="sc-card sc-card--you">
            {!area ? (
              <>
                <div className="sc-head">
                  <span className="sc-tag">Your area</span>
                  <div>
                    <h2 className="sc-title">Who are you?</h2>
                    <p className="sc-aim">Enter your name and the code your teacher gave you to open your own plan and practice.</p>
                  </div>
                </div>
                <form onSubmit={handleEnter} className="sc-form">
                  <label className="sc-field">
                    <span>Your name</span>
                    <input value={name} onChange={e => setName(e.target.value)} autoComplete="off" placeholder="First name" />
                  </label>
                  <label className="sc-field">
                    <span>Access code</span>
                    <input value={code} onChange={e => setCode(e.target.value)} autoComplete="off" placeholder="From your teacher" />
                  </label>
                  <button type="submit" disabled={loading || !name.trim() || !code.trim()} className="sc-btn">{loading ? 'Checking…' : 'Open my area →'}</button>
                  {err && <div className="sc-err">{err}</div>}
                </form>
                <p className="sc-note">No code yet? Ask your teacher in class. Everything below is open to everyone.</p>
              </>
            ) : (
              <>
                <div className="sc-head">
                  <span className="sc-tag">Your area</span>
                  <div>
                    <h2 className="sc-title">Hi {area.displayName}</h2>
                    <p className="sc-aim">Here&apos;s your work. <button onClick={logout} className="sc-link">Not you?</button></p>
                  </div>
                </div>
                <div className="sc-list">
                  {area.links.map((l, i) => (
                    <a key={l.href} href={l.href} className="sc-tool sc-tool--mine" style={{ animationDelay: `${i * 60}ms` }}>
                      <span className="sc-emoji">{l.emoji}</span>
                      <span className="sc-tool-body">
                        <span className="sc-tool-title">{l.title}</span>
                        <span className="sc-tool-desc">{l.desc}</span>
                      </span>
                      <span className="sc-chev">›</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ── For everyone ── */}
          <section className="sc-everyone">
            <div className="sc-section-head">For everyone</div>
            <div className="sc-tools">
              {TOOLS.map((t, i) => (
                <a key={t.title} href={t.href} className="sc-tool" style={{ '--accent': t.accent, '--accent-lt': t.accentLt, animationDelay: `${120 + i * 60}ms` } as React.CSSProperties}>
                  <span className="sc-emoji">{t.emoji}</span>
                  <span className="sc-tool-body">
                    <span className="sc-kicker">{t.tag}</span>
                    <span className="sc-tool-title">{t.title}</span>
                    <span className="sc-tool-desc">{t.desc}</span>
                  </span>
                  <span className="sc-chev">›</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="sc-foot">
        <span>Somerset Language Centre · Valencia</span>
        <span>Since 2013</span>
      </footer>
    </div>
  )
}

const CSS = `
.sc{--green:#6BAE2E;--green-dk:#4d8520;--green-lt:#eaf4da;--ink:#1A1A1A;--serif:Georgia,'Times New Roman',serif;--sans:system-ui,-apple-system,Arial,sans-serif;
  font-family:var(--sans);color:var(--ink);background:#f9f8f5;min-height:100vh;line-height:1.6;font-size:16px}
.sc *{box-sizing:border-box}
.sc p,.sc h1,.sc h2{margin:0}

.sc-header{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:1rem;padding:.7rem 1.5rem;background:var(--ink);color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25)}
.sc-unit{flex:1;font-size:.72rem;opacity:.55;text-transform:uppercase;letter-spacing:1px}
.sc-home{color:rgba(255,255,255,.75);font-size:.78rem;font-weight:600;text-decoration:none}
.sc-home:hover{color:#fff}

.sc-hero{position:relative;height:420px;overflow:hidden;background:var(--ink)}
.sc-hero img{width:100%;height:100%;object-fit:cover;object-position:center 60%;opacity:.8;display:block;animation:scZoom 9s ease-out both}
.sc-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78) 0%,rgba(0,0,0,.15) 60%,transparent);display:flex;flex-direction:column;justify-content:flex-end;padding:2.2rem 2.5rem}
.sc-hero-label{font-size:.68rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:var(--green);margin-bottom:.3rem}
.sc-hero-title{font-family:var(--serif);font-size:3.4rem;color:#fff;line-height:1.05;text-shadow:0 2px 12px rgba(0,0,0,.4)}
.sc-hero-sub{color:rgba(255,255,255,.8);font-size:1.05rem;margin-top:.5rem;max-width:560px}
@keyframes scZoom{from{transform:scale(1.06)}to{transform:scale(1)}}
.sc-strip{height:3px;background:var(--green)}

.sc-wrap{max-width:1100px;margin:0 auto;padding:2rem 1.5rem 4rem}
.sc-grid{display:grid;grid-template-columns:2fr 3fr;gap:1.8rem;align-items:start}
@media(max-width:800px){.sc-grid{grid-template-columns:1fr}}

.sc-card{background:#fff;border:1px solid #e5e5e5;border-radius:14px;padding:1.5rem 1.6rem 1.6rem;box-shadow:0 4px 18px rgba(0,0,0,.05);animation:scIn .45s cubic-bezier(.22,1,.36,1) both}
.sc-card--you{position:sticky;top:76px}
@media(max-width:800px){.sc-card--you{position:static}}
.sc-head{display:flex;align-items:flex-start;gap:.9rem;margin-bottom:1.2rem;padding-bottom:1rem;border-bottom:3px solid var(--green)}
.sc-tag{flex-shrink:0;margin-top:.3rem;font-size:.64rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:.3rem .65rem;border-radius:4px;background:var(--green);color:#fff;white-space:nowrap}
.sc-title{font-family:var(--serif);font-size:1.5rem;line-height:1.15}
.sc-aim{font-size:.86rem;color:#666;margin-top:.25rem}
.sc-link{font:inherit;font-size:.86rem;color:var(--green-dk);background:none;border:0;padding:0;cursor:pointer;text-decoration:underline}

.sc-form{display:flex;flex-direction:column;gap:.8rem}
.sc-field{display:flex;flex-direction:column;gap:.3rem}
.sc-field span{font-size:.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555}
.sc-field input{font:inherit;font-size:1rem;padding:.7rem .9rem;border:1.5px solid #d6d6d6;border-radius:10px;background:#fffdf7;color:var(--ink);transition:border-color .15s,box-shadow .15s}
.sc-field input:focus{outline:0;border-color:var(--green);box-shadow:0 0 0 3px var(--green-lt)}
.sc-btn{margin-top:.3rem;display:inline-flex;align-items:center;justify-content:center;padding:.75rem 1.4rem;border-radius:99px;border:0;background:var(--green);color:#fff;font:700 .95rem var(--sans);cursor:pointer;box-shadow:0 8px 20px rgba(107,174,46,.28);transition:transform .18s cubic-bezier(.22,1,.36,1),box-shadow .18s,opacity .18s}
.sc-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 24px rgba(107,174,46,.34)}
.sc-btn:disabled{opacity:.4;cursor:default;box-shadow:none}
.sc-err{font-size:.86rem;color:#b9412f;background:#fdf0ed;border:1px solid #f2b9ae;border-radius:8px;padding:.6rem .8rem}
.sc-note{font-size:.8rem;color:#777;margin-top:1rem;font-style:italic}

.sc-section-head{font-size:.72rem;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:var(--green-dk);margin:.4rem 0 .8rem}
.sc-tools,.sc-list{display:grid;gap:.8rem}
.sc-tools{grid-template-columns:1fr 1fr}
@media(max-width:600px){.sc-tools{grid-template-columns:1fr}}
.sc-tool{--accent:var(--green);--accent-lt:var(--green-lt);display:flex;align-items:flex-start;gap:.9rem;background:#fff;border:1px solid #e5e5e5;border-left:4px solid var(--accent);border-radius:12px;padding:1rem 1.1rem;text-decoration:none;color:inherit;box-shadow:0 2px 8px rgba(0,0,0,.04);transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s;animation:scIn .45s cubic-bezier(.22,1,.36,1) both}
.sc-tool:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(0,0,0,.09)}
.sc-tool:hover .sc-chev{color:var(--accent);transform:translateX(3px)}
.sc-emoji{flex-shrink:0;width:44px;height:44px;border-radius:12px;background:var(--accent-lt);display:inline-flex;align-items:center;justify-content:center;font-size:1.35rem}
.sc-tool-body{display:flex;flex-direction:column;gap:.1rem;flex:1;min-width:0}
.sc-kicker{font-size:.62rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent)}
.sc-tool-title{font-family:var(--serif);font-size:1.08rem;font-weight:700;line-height:1.25}
.sc-tool-desc{font-size:.82rem;color:#666;line-height:1.45;margin-top:.15rem}
.sc-chev{align-self:center;font-size:1.4rem;color:#c7c7c7;transition:color .2s,transform .2s}
.sc-tool--mine{border-left-color:var(--green)}
@keyframes scIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

.sc-foot{max-width:1100px;margin:0 auto;padding:1rem 1.5rem 2.5rem;display:flex;justify-content:space-between;font-size:.72rem;letter-spacing:1px;text-transform:uppercase;color:#999;border-top:1px solid #e5e3dd}

@media(max-width:640px){
  .sc-header{padding:.6rem 1rem}
  .sc-unit{display:none}
  .sc-hero{height:320px}
  .sc-hero-overlay{padding:1.3rem 1.2rem}
  .sc-hero-title{font-size:2.4rem}
  .sc-hero-sub{font-size:.95rem}
  .sc-wrap{padding:1.2rem 1rem 3rem}
  .sc-card{padding:1.2rem 1.1rem 1.3rem}
  .sc-foot{flex-direction:column;gap:.3rem}
}
`
