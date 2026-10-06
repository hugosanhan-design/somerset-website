"use client";

import { useState } from "react";

export default function SpecialCoursesPage() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', situation: 'arriving' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('loading');
    try {
      const res = await fetch('/api/special-courses-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(await res.text());
      setFormState('success');
    } catch {
      setFormState('error');
    }
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
      />
      <style>{`
        :root {
          --paper: #F5F1E6; --ink: #17281B; --racing: #1E4227; --racing-2: #2A5636;
          --brass: #C9A24B; --cider: #B23A2C; --muted: #5C6657; --line: #D9D2BC;
          --green: #557a49; --leaf: #b9cd9d; --green-lt: #eaf4da;
          --serif: 'Fraunces', Georgia, serif;
          --sans: 'Instrument Sans', system-ui, sans-serif;
        }

        .sc-root { font-family: var(--sans); color: var(--ink); background: var(--paper); }

        /* ── HERO ── */
        .sc-hero { background: var(--racing); color: #fffaf0; padding: clamp(4rem, 10vw, 7rem) 2rem clamp(3.5rem, 8vw, 6rem); text-align: center; position: relative; overflow: hidden; }
        .sc-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 120%, rgba(201,162,75,0.15) 0%, transparent 65%); pointer-events: none; }
        .sc-eyebrow { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--brass); margin-bottom: 1.5rem; }
        .sc-eyebrow::before, .sc-eyebrow::after { content: ''; flex: 1; width: 32px; height: 1px; background: var(--brass); opacity: 0.5; }
        .sc-hero h1 { font-family: var(--serif); font-size: clamp(2.8rem, 6vw, 5rem); font-weight: 350; line-height: 1.06; letter-spacing: -0.02em; margin: 0 auto 1.4rem; max-width: 16ch; }
        .sc-hero h1 em { font-style: italic; color: var(--brass); }
        .sc-hero-lead { font-size: clamp(1rem, 1.5vw, 1.2rem); color: rgba(255,250,240,0.78); line-height: 1.75; max-width: 52ch; margin: 0 auto 2.8rem; text-wrap: pretty; }
        .sc-hero-badges { display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: center; }
        .sc-badge { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 600; padding: 0.5rem 1rem; border-radius: 50px; border: 1px solid rgba(201,162,75,0.35); color: rgba(255,250,240,0.8); background: rgba(255,250,240,0.06); }
        .sc-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brass); }

        /* ── INTRO ── */
        .sc-intro { max-width: 1160px; margin: 0 auto; padding: clamp(4rem, 8vw, 6rem) 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .sc-intro-text h2 { font-family: var(--serif); font-size: clamp(2rem, 3.5vw, 2.8rem); font-weight: 370; line-height: 1.15; margin: 0 0 1.2rem; }
        .sc-intro-text h2 em { font-style: italic; color: var(--cider); }
        .sc-intro-text p { font-size: 1.05rem; color: var(--muted); line-height: 1.8; margin: 0 0 1rem; text-wrap: pretty; }
        .sc-intro-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .sc-stat { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 1.5rem 1.4rem; }
        .sc-stat-n { font-family: var(--serif); font-style: italic; font-size: 2.4rem; color: var(--brass); line-height: 1; margin-bottom: 0.4rem; }
        .sc-stat-l { font-size: 0.83rem; color: var(--muted); line-height: 1.5; }

        /* ── GAP CALLOUT ── */
        .sc-gap { background: var(--green-lt); border-left: 4px solid var(--green); border-radius: 0 12px 12px 0; padding: 1.5rem 1.8rem; margin: 0 0 2.5rem; }
        .sc-gap p { font-size: 0.97rem; color: var(--racing); line-height: 1.7; margin: 0; text-wrap: pretty; }
        .sc-gap strong { color: var(--ink); }

        /* ── TIERS ── */
        .sc-tiers { background: #fff; padding: clamp(4rem, 8vw, 6rem) 2rem; }
        .sc-tiers-inner { max-width: 1160px; margin: 0 auto; }
        .sc-section-header { text-align: center; margin-bottom: 3.5rem; }
        .sc-section-eyebrow { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--green); margin-bottom: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; }
        .sc-section-eyebrow::before, .sc-section-eyebrow::after { content: ''; width: 36px; height: 1px; background: var(--brass); }
        .sc-section-header h2 { font-family: var(--serif); font-size: clamp(2.2rem, 3.5vw, 3rem); font-weight: 360; letter-spacing: -0.015em; margin: 0 0 0.9rem; }
        .sc-section-header p { font-size: 1.05rem; color: var(--muted); max-width: 54ch; margin: 0 auto; line-height: 1.7; }

        .sc-tier { margin-bottom: 3.5rem; }
        .sc-tier:last-child { margin-bottom: 0; }
        .sc-tier-label { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-bottom: 1.4rem; padding-bottom: 0.6rem; border-bottom: 2px solid var(--line); }
        .sc-tier-label span { font-family: var(--serif); font-style: italic; font-size: 1rem; color: var(--brass); font-weight: 400; letter-spacing: 0; text-transform: none; }
        .sc-modules { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
        .sc-module { background: var(--paper); border: 1px solid var(--line); border-radius: 16px; padding: 1.5rem 1.4rem; position: relative; }
        .sc-tier--survival .sc-module { border-top: 3px solid var(--cider); }
        .sc-tier--integration .sc-module { border-top: 3px solid var(--green); }
        .sc-tier--belonging .sc-module { border-top: 3px solid var(--brass); }
        .sc-module-title { font-family: var(--serif); font-size: 1.15rem; font-weight: 460; letter-spacing: -0.01em; margin: 0 0 0.5rem; color: var(--ink); }
        .sc-module-desc { font-size: 0.85rem; color: var(--muted); line-height: 1.6; margin: 0 0 0.9rem; }
        .sc-module-valencia { font-size: 0.76rem; font-weight: 600; color: var(--green); background: var(--green-lt); padding: 0.3rem 0.7rem; border-radius: 50px; display: inline-block; }

        /* ── FORMAT ── */
        .sc-format { padding: clamp(4rem, 8vw, 6rem) 2rem; max-width: 1160px; margin: 0 auto; }
        .sc-format-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.4rem; margin-top: 3rem; }
        .sc-format-card { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 2rem 1.8rem; }
        .sc-format-icon { font-size: 2rem; margin-bottom: 1rem; line-height: 1; }
        .sc-format-card h3 { font-family: var(--serif); font-size: 1.25rem; font-weight: 450; margin: 0 0 0.6rem; }
        .sc-format-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.65; margin: 0; }
        .sc-format-highlight { background: var(--racing); color: #fffaf0; border-color: var(--racing); }
        .sc-format-highlight h3 { color: #fffaf0; }
        .sc-format-highlight p { color: rgba(255,250,240,0.75); }
        .sc-format-tag { display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--brass); border: 1px solid rgba(201,162,75,0.4); padding: 0.2rem 0.6rem; border-radius: 50px; margin-bottom: 0.8rem; }

        /* ── WAITLIST ── */
        .sc-waitlist { background: var(--racing); color: #fffaf0; padding: clamp(4.5rem, 9vw, 7rem) 2rem; position: relative; overflow: hidden; }
        .sc-waitlist::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 80% -10%, rgba(201,162,75,0.12) 0%, transparent 55%); pointer-events: none; }
        .sc-waitlist-inner { max-width: 700px; margin: 0 auto; position: relative; }
        .sc-waitlist h2 { font-family: var(--serif); font-size: clamp(2.2rem, 4vw, 3.2rem); font-weight: 350; letter-spacing: -0.02em; margin: 0 0 0.8rem; }
        .sc-waitlist h2 em { font-style: italic; color: var(--brass); }
        .sc-waitlist-lead { font-size: 1.05rem; color: rgba(255,250,240,0.75); line-height: 1.7; margin: 0 0 2.8rem; text-wrap: pretty; }
        .sc-form { display: flex; flex-direction: column; gap: 1rem; }
        .sc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .sc-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .sc-label { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.04em; color: rgba(255,250,240,0.7); }
        .sc-input, .sc-select { font-family: var(--sans); font-size: 0.97rem; padding: 0.85rem 1.1rem; border-radius: 10px; border: 1.5px solid rgba(255,250,240,0.18); background: rgba(255,250,240,0.09); color: #fffaf0; transition: border-color 0.2s; outline: none; }
        .sc-input::placeholder { color: rgba(255,250,240,0.35); }
        .sc-input:focus, .sc-select:focus { border-color: rgba(201,162,75,0.6); }
        .sc-select option { color: var(--ink); background: #fff; }
        .sc-submit { background: var(--brass); color: #fff; font-family: var(--sans); font-weight: 700; font-size: 1rem; padding: 1rem 2rem; border: none; border-radius: 50px; cursor: pointer; transition: background 0.2s, transform 0.15s; box-shadow: 0 8px 22px rgba(0,0,0,0.2); margin-top: 0.5rem; }
        .sc-submit:hover:not(:disabled) { background: #b58e3a; transform: translateY(-1px); }
        .sc-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .sc-success { background: rgba(255,250,240,0.1); border: 1px solid rgba(201,162,75,0.4); border-radius: 16px; padding: 2rem; text-align: center; }
        .sc-success h3 { font-family: var(--serif); font-size: 1.6rem; font-weight: 400; margin: 0 0 0.6rem; }
        .sc-success p { font-size: 0.95rem; color: rgba(255,250,240,0.75); line-height: 1.65; margin: 0; }
        .sc-error-msg { font-size: 0.85rem; color: #ffb3a7; margin-top: 0.5rem; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .sc-intro { grid-template-columns: 1fr; gap: 2.5rem; }
          .sc-format-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .sc-form-row { grid-template-columns: 1fr; }
          .sc-format-grid { grid-template-columns: 1fr; }
          .sc-modules { grid-template-columns: 1fr; }
          .sc-intro-stats { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="sc-root">

        {/* ── HERO ── */}
        <section className="sc-hero">
          <div className="sc-eyebrow">COMING SOON · ESPAÑOL</div>
          <h1>Spanish for <em>life</em> in Valencia</h1>
          <p className="sc-hero-lead">
            Practical Spanish for English-speaking expats — organised by the situations that actually matter:
            healthcare, bureaucracy, daily life, and the culture that makes Valencia home.
          </p>
          <div className="sc-hero-badges">
            <span className="sc-badge"><span className="sc-badge-dot" />Spain-specific vocabulary</span>
            <span className="sc-badge"><span className="sc-badge-dot" />Valencia layer in every module</span>
            <span className="sc-badge"><span className="sc-badge-dot" />Built by Somerset teachers in Valencia</span>
            <span className="sc-badge"><span className="sc-badge-dot" />Self-paced — your schedule</span>
          </div>
        </section>

        {/* ── INTRO ── */}
        <section style={{ background: 'var(--paper)' }}>
          <div className="sc-intro">
            <div className="sc-intro-text">
              <h2>Not tourist Spanish. <em>Resident</em> Spanish.</h2>
              <p>
                Every app teaches you how to order coffee. None of them teach you how to register at the CAP,
                survive a call to a Spanish call centre, or understand why your landlord isn&apos;t being rude
                — they&apos;re just being Spanish.
              </p>
              <div className="sc-gap">
                <p>
                  <strong>The gap:</strong> 60% of British expats in Spain can&apos;t speak Spanish well,
                  even after years here. The major apps miss the vocabulary that matters: <em>cita previa,
                  empadronamiento, tarjeta sanitaria, gestoría</em>. And none of them explain Valencia
                  specifically — its hospitals, its culture, its language, its identity.
                </p>
              </div>
              <p>
                Somerset has been part of Valencia for over a decade. Our teachers have navigated exactly
                what you&apos;re navigating. That&apos;s what this course is built on.
              </p>
            </div>
            <div className="sc-intro-stats">
              <div className="sc-stat">
                <div className="sc-stat-n">337k</div>
                <div className="sc-stat-l">English-speaking expats registered in Spain</div>
              </div>
              <div className="sc-stat">
                <div className="sc-stat-n">60%</div>
                <div className="sc-stat-l">don&apos;t speak Spanish well, even after years here</div>
              </div>
              <div className="sc-stat">
                <div className="sc-stat-n">#1</div>
                <div className="sc-stat-l">Valencia ranked best city globally for expats — InterNations 2024</div>
              </div>
              <div className="sc-stat">
                <div className="sc-stat-n">70k</div>
                <div className="sc-stat-l">members in &ldquo;Expats Valencia&rdquo; Facebook group</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TIERS ── */}
        <section className="sc-tiers">
          <div className="sc-tiers-inner">
            <div className="sc-section-header">
              <div className="sc-section-eyebrow">The curriculum</div>
              <h2>Three tiers, one goal: belonging</h2>
              <p>Organised by life situation, not grammar level. Start where you need to. Jump to what hurts most.</p>
            </div>

            <div className="sc-tier sc-tier--survival">
              <div className="sc-tier-label">
                Tier 1 — Survival <span>For everyone, first</span>
              </div>
              <div className="sc-modules">
                <div className="sc-module">
                  <div className="sc-module-title">The First Month</div>
                  <div className="sc-module-desc">NIE, TIE, empadronamiento, padrón, bank account, SIM card — the paperwork gauntlet, explained.</div>
                  <span className="sc-module-valencia">En Valencia: oficina de extranjería, exact steps</span>
                </div>
                <div className="sc-module">
                  <div className="sc-module-title">Healthcare</div>
                  <div className="sc-module-desc">CAP registration, tarjeta sanitaria, booking appointments, pharmacy vocabulary, describing symptoms.</div>
                  <span className="sc-module-valencia">En Valencia: La Fe vs. private, CAP in Ruzafa</span>
                </div>
                <div className="sc-module">
                  <div className="sc-module-title">Daily Life</div>
                  <div className="sc-module-desc">Bars, shops, markets — the right register (&ldquo;ponme un café&rdquo;, not &ldquo;could I possibly have&rdquo;). Opening hours, tipping, neighbourhood culture.</div>
                  <span className="sc-module-valencia">En Valencia: Mercado Central, Ruzafa market</span>
                </div>
                <div className="sc-module">
                  <div className="sc-module-title">Phone Calls &amp; Admin</div>
                  <div className="sc-module-desc">Answering &ldquo;¿Diga?&rdquo;, navigating call centres, the cita previa call — the hardest part of Spanish, practised until it&apos;s not.</div>
                  <span className="sc-module-valencia">En Valencia: council lines, SUMA calls</span>
                </div>
              </div>
            </div>

            <div className="sc-tier sc-tier--integration">
              <div className="sc-tier-label">
                Tier 2 — Integration <span>Building a permanent life</span>
              </div>
              <div className="sc-modules">
                <div className="sc-module">
                  <div className="sc-module-title">Housing</div>
                  <div className="sc-module-desc">Rental contracts, landlord conversations, bills, comunidad de propietarios meetings.</div>
                  <span className="sc-module-valencia">En Valencia: IBI, rental specifics</span>
                </div>
                <div className="sc-module">
                  <div className="sc-module-title">Work &amp; Tax</div>
                  <div className="sc-module-desc">Autónomo registration, gestoría, invoicing in Spanish, digital nomad visa context.</div>
                  <span className="sc-module-valencia">En Valencia: local gestorías, social security</span>
                </div>
                <div className="sc-module">
                  <div className="sc-module-title">Understanding the Culture</div>
                  <div className="sc-module-desc">Why directness isn&apos;t rudeness. Why making Spanish friends is genuinely hard. What they think of you, honestly.</div>
                  <span className="sc-module-valencia">En Valencia: how it differs from Madrid</span>
                </div>
                <div className="sc-module">
                  <div className="sc-module-title">Neighbours &amp; Community</div>
                  <div className="sc-module-desc">Fiestas, noise norms, community meetings — being a neighbour, not just a resident.</div>
                  <span className="sc-module-valencia">En Valencia: Fallas week — what to expect</span>
                </div>
              </div>
            </div>

            <div className="sc-tier sc-tier--belonging">
              <div className="sc-tier-label">
                Tier 3 — Belonging <span>Optional deepening</span>
              </div>
              <div className="sc-modules">
                <div className="sc-module">
                  <div className="sc-module-title">Valencia Identity</div>
                  <div className="sc-module-desc">Valencian language basics — 10 high-dividend phrases that unlock a different kind of welcome. History, local pride, the Catalonia question.</div>
                  <span className="sc-module-valencia">What Valencians actually think about Valencian</span>
                </div>
                <div className="sc-module">
                  <div className="sc-module-title">Culture: Films, Music, Books</div>
                  <div className="sc-module-desc">The references that unlock real conversations — Spanish directors, Valencian musicians, the series everyone&apos;s watched.</div>
                  <span className="sc-module-valencia">Raimon, Ovidi, Berlanga, Blasco Ibáñez</span>
                </div>
                <div className="sc-module">
                  <div className="sc-module-title">Raising Kids Here</div>
                  <div className="sc-module-desc">Schools system, bilingual education, talking to teachers — for families who are putting down real roots.</div>
                  <span className="sc-module-valencia">CEIP vs. concertado, language of instruction</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── FORMAT ── */}
        <section className="sc-format">
          <div className="sc-section-header">
            <div className="sc-section-eyebrow">How it works</div>
            <h2>Flexible enough for a working life</h2>
            <p>Short lessons you can do at 7am, on the train, or whenever you have 15 minutes. No fixed schedule, no classroom.</p>
          </div>
          <div className="sc-format-grid">
            <div className="sc-format-card">
              <div className="sc-format-icon">🎬</div>
              <h3>Short video lessons</h3>
              <p>12–15 minutes each. One real situation, the vocabulary you need, a practice exercise. Done on the train or before breakfast.</p>
            </div>
            <div className="sc-format-card sc-format-highlight">
              <div className="sc-format-tag">Somerset&apos;s differentiator</div>
              <div className="sc-format-icon">🧑‍🏫</div>
              <h3>Built by people who live here</h3>
              <p>Written by Somerset teachers who&apos;ve navigated Valencia themselves — the actual offices, hospitals, and cultural realities, not a generic Spain guide.</p>
            </div>
            <div className="sc-format-card">
              <div className="sc-format-icon">🗺️</div>
              <h3>The Valencia layer</h3>
              <p>Every lesson includes an &ldquo;En Valencia...&rdquo; note — the local hospital, the specific form, the phrase that earns goodwill here and not in Madrid.</p>
            </div>
          </div>
        </section>

        {/* ── WAITLIST ── */}
        <section className="sc-waitlist" id="waitlist">
          <div className="sc-waitlist-inner">
            {formState === 'success' ? (
              <div className="sc-success">
                <h3>You&apos;re on the list ✓</h3>
                <p>We&apos;ll be in touch as soon as the course opens. In the meantime, if you have questions, drop us a line at <a href="mailto:info@somersetlc.com" style={{color: 'var(--brass)'}}>info@somersetlc.com</a>.</p>
              </div>
            ) : (
              <>
                <div className="sc-section-eyebrow" style={{justifyContent:'flex-start', marginBottom: '1rem'}}>Join the waitlist</div>
                <h2>Be the <em>first</em> to know</h2>
                <p className="sc-waitlist-lead">
                  The course is in development. Join the waitlist and we&apos;ll tell you when it&apos;s ready —
                  and you&apos;ll get early access at a lower price before it opens to everyone.
                </p>
                <form className="sc-form" onSubmit={handleSubmit}>
                  <div className="sc-form-row">
                    <div className="sc-field">
                      <label className="sc-label" htmlFor="wl-name">Your name</label>
                      <input
                        id="wl-name"
                        className="sc-input"
                        type="text"
                        placeholder="Jane Smith"
                        required
                        value={formData.name}
                        onChange={e => setFormData(s => ({ ...s, name: e.target.value }))}
                      />
                    </div>
                    <div className="sc-field">
                      <label className="sc-label" htmlFor="wl-email">Email address</label>
                      <input
                        id="wl-email"
                        className="sc-input"
                        type="email"
                        placeholder="jane@email.com"
                        required
                        value={formData.email}
                        onChange={e => setFormData(s => ({ ...s, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="sc-field">
                    <label className="sc-label" htmlFor="wl-situation">My situation</label>
                    <select
                      id="wl-situation"
                      className="sc-select"
                      value={formData.situation}
                      onChange={e => setFormData(s => ({ ...s, situation: e.target.value }))}
                    >
                      <option value="arriving">I&apos;m planning to move to Spain</option>
                      <option value="recent">I just arrived (under a year)</option>
                      <option value="settled">I&apos;ve been here a while but my Spanish is stuck</option>
                      <option value="work">I work or run a business here</option>
                      <option value="family">I have family or children here</option>
                      <option value="retiring">I&apos;m retiring here</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="sc-submit"
                    disabled={formState === 'loading'}
                  >
                    {formState === 'loading' ? 'Sending…' : 'Join the waitlist →'}
                  </button>
                  {formState === 'error' && (
                    <p className="sc-error-msg">Something went wrong. Email us directly: <a href="mailto:info@somersetlc.com" style={{color:'var(--brass)'}}>info@somersetlc.com</a></p>
                  )}
                </form>
              </>
            )}
          </div>
        </section>

      </div>
    </>
  );
}
