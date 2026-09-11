import Link from "next/link";
import { story, founders, pillars, facts, voices } from "@/data/about";

export const metadata = {
  title: "Who we are — Somerset Language Centre",
  description:
    "Somerset Language Centre has taught English in Valencia since 2013. Small groups, native and bilingual teachers, and a practical method built on speaking.",
};

export default function AboutPage() {
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
        .ab-root { font-family: 'Instrument Sans', system-ui, sans-serif; color: #17281B; }
        .ab-wrap { max-width: 1100px; margin: 0 auto; padding: 4.5rem 2rem 5.5rem; }
        .ab-eyebrow { display: flex; align-items: center; gap: 1rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #3D8B1F; margin-bottom: 1.2rem; }
        .ab-eyebrow::before { content: ''; width: 44px; height: 1px; background: #C9A24B; }
        .ab-title { font-family: 'Fraunces', Georgia, serif; font-size: clamp(2.3rem, 4vw, 3.4rem); font-weight: 380; line-height: 1.1; letter-spacing: -0.015em; margin: 0 0 1.4rem; }
        .ab-title em { font-style: italic; color: #3D8B1F; }
        .ab-lead { font-size: 1.08rem; color: #3A4A38; line-height: 1.8; max-width: 58ch; margin: 0 0 2.6rem; text-wrap: pretty; }

        .ab-founders { display: flex; align-items: center; gap: 1.1rem; padding: 1.5rem 0 0; border-top: 1px solid #D9D2BC; max-width: 58ch; margin-bottom: 4rem; }
        .ab-av { width: 3.2rem; height: 3.2rem; border-radius: 50%; background: #1E4227; color: #F5F1E6; display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 0.95rem; flex-shrink: 0; }
        .ab-founders strong { font-size: 1rem; font-weight: 700; display: block; margin-bottom: 0.12rem; }
        .ab-founders small { font-size: 0.82rem; color: #5C6657; }

        .ab-h2 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.6rem, 2.6vw, 2.1rem); font-weight: 420; letter-spacing: -0.01em; margin: 0 0 1.8rem; }

        .ab-pillars { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.1rem; margin-bottom: 4rem; }
        .ab-card { background: #FBF9F2; border: 1px solid #D9D2BC; border-radius: 18px; padding: 1.7rem 1.6rem; }
        .ab-card h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1.18rem; font-weight: 440; margin: 0 0 0.6rem; }
        .ab-card p { font-size: 0.94rem; color: #5C6657; line-height: 1.7; margin: 0; }

        .ab-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1px; background: #D9D2BC; border: 1px solid #D9D2BC; border-radius: 18px; overflow: hidden; margin-bottom: 4rem; }
        .ab-fact { background: #FBF9F2; padding: 1.6rem 1.4rem; }
        .ab-fact b { display: block; font-family: 'Fraunces', Georgia, serif; font-size: 1.9rem; font-weight: 400; color: #3D8B1F; line-height: 1; margin-bottom: 0.5rem; }
        .ab-fact span { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: #5C6657; }

        .ab-voices { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.1rem; margin-bottom: 4rem; }
        .ab-quote { background: #FBF9F2; border: 1px solid #D9D2BC; border-radius: 18px; padding: 1.7rem 1.6rem; margin: 0; }
        .ab-stars { color: #C9A24B; font-size: 0.85rem; letter-spacing: 0.12em; margin-bottom: 0.9rem; }
        .ab-quote p { font-size: 0.95rem; line-height: 1.75; color: #3A4A38; margin: 0 0 1rem; }
        .ab-quote cite { font-style: normal; font-size: 0.82rem; color: #5C6657; }

        .ab-visit { background: #FBF9F2; border: 1px solid #D9D2BC; border-radius: 22px; padding: 2.2rem 2rem; display: flex; flex-wrap: wrap; align-items: center; gap: 1.6rem 2.4rem; }
        .ab-visit-addr { font-size: 0.96rem; line-height: 1.75; color: #3A4A38; }
        .ab-visit-addr a { color: #3D8B1F; text-decoration: none; font-weight: 600; }
        .ab-visit-addr a:hover { color: #1E4227; }
        .ab-actions { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-left: auto; }
        .ab-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #17281B; color: #F5F1E6; text-decoration: none; font-size: 0.95rem; font-weight: 600; padding: 0.85rem 1.6rem; border-radius: 50px; transition: background 0.2s; }
        .ab-btn:hover { background: #3D8B1F; }
        .ab-btn.ghost { background: none; color: #17281B; border: 1px solid #D9D2BC; }
        .ab-btn.ghost:hover { background: rgba(87,184,44,0.07); color: #1E4227; }

        @media (max-width: 640px) {
          .ab-wrap { padding: 3rem 1.3rem 4rem; }
          .ab-actions { margin-left: 0; }
        }
      `}</style>

      <div className="ab-root">
        <div className="ab-wrap">
          <div className="ab-eyebrow">{story.eyebrow}</div>
          <h1 className="ab-title">
            {story.headline[0]}<br />who <em>needs it</em>
          </h1>
          <p className="ab-lead">{story.body}</p>

          <div className="ab-founders">
            <div className="ab-av">{founders.initials}</div>
            <div>
              <strong>{founders.names}</strong>
              <small>{founders.note}</small>
            </div>
          </div>

          <h2 className="ab-h2">Why choose Somerset?</h2>
          <div className="ab-pillars">
            {pillars.map((p) => (
              <div className="ab-card" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>

          <div className="ab-facts">
            {facts.map((f) => (
              <div className="ab-fact" key={f.label}>
                <b>{f.value}</b>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          <h2 className="ab-h2">What our students say</h2>
          <div className="ab-voices">
            {voices.map((v) => (
              <blockquote className="ab-quote" key={v.name}>
                <div className="ab-stars" aria-label="5 out of 5 stars">★★★★★</div>
                <p>“{v.text}”</p>
                <cite>{v.name} · Google review</cite>
              </blockquote>
            ))}
          </div>

          <div className="ab-visit">
            <div className="ab-visit-addr">
              <strong>Come and see us</strong><br />
              Calle Ministro Luis Mayans, 31, Bajo · Valencia<br />
              <a href="tel:+34601129552">601 12 95 52</a> · <a href="tel:+34963388933">963 38 89 33</a>
            </div>
            <div className="ab-actions">
              <Link href="/courses" className="ab-btn">Courses &amp; timetables →</Link>
              <Link href="/contact" className="ab-btn ghost">Contact us</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
