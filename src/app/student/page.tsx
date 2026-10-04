const portal = "https://somerset-language-centre.vercel.app";

export const metadata = {
  title: "Student sign in — Somerset Language Centre",
  description: "Sign in to your Somerset Portal or open the B1 online course.",
};

export default function StudentPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Instrument+Sans:wght@400..700&display=swap"
      />
      <style>{`
        .st-root { color: #17281b; font-family: 'Instrument Sans', system-ui, sans-serif; }
        .st-wrap { max-width: 980px; margin: 0 auto; padding: clamp(3rem, 7vh, 5.5rem) 2rem 13rem; }
        .st-kicker { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.1rem; color: #726b4d; font-size: .72rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .st-kicker::before { content: ''; width: 40px; height: 1px; background: #b79853; }
        .st-title { max-width: 12ch; margin: 0 0 1rem; font: 400 clamp(2.5rem, 5vw, 4.2rem)/1.08 'Fraunces', Georgia, serif; letter-spacing: -.025em; }
        .st-title em { color: #536847; font-weight: 350; }
        .st-intro { max-width: 57ch; margin: 0 0 2.7rem; color: #586351; font-size: 1.04rem; line-height: 1.75; }
        .st-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        .st-card { display: flex; flex-direction: column; min-height: 250px; padding: 1.8rem; border: 1px solid rgba(95, 92, 65, .19); border-radius: 19px; background: rgba(255, 252, 244, .76); box-shadow: 0 12px 32px rgba(64, 55, 32, .055); }
        .st-tag { margin: 0 0 1.25rem; color: #84734d; font-size: .7rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; }
        .st-card h2 { margin: 0 0 .65rem; font: 440 1.48rem/1.2 'Fraunces', Georgia, serif; }
        .st-card p:not(.st-tag) { margin: 0 0 1.6rem; color: #586351; font-size: .94rem; line-height: 1.65; }
        .st-action { display: inline-flex; align-items: center; justify-content: center; gap: .55rem; width: fit-content; margin-top: auto; padding: .75rem 1.3rem; border-radius: 100px; background: #284735; color: #fff; font-size: .88rem; font-weight: 700; text-decoration: none; transition: background .2s, transform .2s; }
        .st-action:hover { background: #3c6148; transform: translateY(-2px); }
        .st-action:focus-visible { outline: 2px solid #a07934; outline-offset: 3px; }
        .st-action.secondary { background: transparent; color: #284735; border: 1px solid #9ba68c; }
        .st-action.secondary:hover { background: #edf0e8; }
        @media (max-width: 680px) { .st-wrap { padding: 3rem 1.25rem 11rem; } .st-grid { grid-template-columns: 1fr; } .st-card { min-height: 220px; } }
      `}</style>

      <div className="st-root">
        <div className="st-wrap">
          <div className="st-kicker">For Somerset students</div>
          <h1 className="st-title">Your learning, <em>all in one place.</em></h1>
          <p className="st-intro">Sign in to see the work your teacher has chosen for you, or go straight to the B1 online course.</p>

          <div className="st-grid">
            <section className="st-card">
              <p className="st-tag">Your Somerset Portal</p>
              <h2>Sign in to your area</h2>
              <p>Enter your name and the code from your teacher to find your personal plan and practice.</p>
              <a className="st-action" href={`${portal}/student`}>Open student sign in <span aria-hidden="true">↗</span></a>
            </section>
            <section className="st-card">
              <p className="st-tag">B1 · Unit 1</p>
              <h2>Me &amp; My Day</h2>
              <p>The online course: vocabulary, grammar, reading, listening, speaking and writing. Open it on your phone or computer.</p>
              <a className="st-action secondary" href={`${portal}/courses/b1-unit-1`}>Open online course <span aria-hidden="true">↗</span></a>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
