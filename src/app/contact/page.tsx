import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact — Somerset Language Centre" };

export default function ContactPage() {
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
        .ct-root { font-family: 'Instrument Sans', system-ui, sans-serif; color: #17281B; }
        .ct-wrap { max-width: 1240px; margin: 0 auto; padding: 4.5rem 2rem 5.5rem; }
        .ct-eyebrow { display: flex; align-items: center; gap: 1rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #3D8B1F; margin-bottom: 1.2rem; }
        .ct-eyebrow::before { content: ''; width: 44px; height: 1px; background: #C9A24B; }
        .ct-title { font-family: 'Fraunces', Georgia, serif; font-size: clamp(2.3rem, 4vw, 3.4rem); font-weight: 380; line-height: 1.1; letter-spacing: -0.015em; margin: 0 0 1.1rem; }
        .ct-title em { font-style: italic; color: #3D8B1F; }
        .ct-lead { font-size: 1.05rem; color: #5C6657; line-height: 1.75; max-width: 52ch; margin: 0 0 3.2rem; text-wrap: pretty; }
        .ct-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 2.2rem; align-items: start; }
        @media (max-width: 860px) { .ct-grid { grid-template-columns: 1fr; } }

        .ct-card { background: #FBF9F2; border: 1px solid #D9D2BC; border-radius: 20px; padding: 2.1rem 2.2rem; }
        .ct-card-title { font-family: 'Fraunces', Georgia, serif; font-size: 1.45rem; font-weight: 450; margin: 0 0 1.4rem; }
        .ct-card-title em { font-style: italic; color: #3D8B1F; }

        .ct-row { display: flex; gap: 1rem; align-items: flex-start; padding: 0.85rem 0; border-top: 1px solid rgba(217,210,188,0.6); }
        .ct-row:first-of-type { border-top: none; padding-top: 0; }
        .ct-ic { width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%; background: rgba(87,184,44,0.12); display: flex; align-items: center; justify-content: center; }
        .ct-ic svg { width: 17px; height: 17px; stroke: #3D8B1F; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
        .ct-row-label { font-size: 0.66rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #5C6657; margin-bottom: 0.15rem; }
        .ct-row-value { font-size: 0.96rem; line-height: 1.55; color: #17281B; }
        .ct-row-value a { color: #17281B; text-decoration: none; border-bottom: 1px solid #C9A24B; padding-bottom: 1px; }
        .ct-row-value a:hover { color: #3D8B1F; }
        .ct-row-sub { font-size: 0.8rem; color: #5C6657; margin-top: 0.1rem; }

        .ct-wa { display: inline-flex; align-items: center; gap: 0.6rem; margin-top: 1.5rem; background: #1E4227; color: #F5F1E6; font-weight: 600; font-size: 0.92rem; padding: 0.75rem 1.5rem; border-radius: 50px; text-decoration: none; transition: background 0.2s, transform 0.2s; }
        .ct-wa:hover { background: #3D8B1F; transform: translateY(-2px); }
        .ct-wa svg { width: 18px; height: 18px; fill: #A8D77E; }

        .ct-map { border-radius: 20px; overflow: hidden; border: 1px solid #D9D2BC; height: 300px; margin-top: 1.4rem; }
        .ct-map iframe { width: 100%; height: 100%; border: 0; display: block; filter: saturate(0.85); }
      `}</style>

      <div className="ct-root">
        <div className="ct-wrap">
          <div className="ct-eyebrow">Get in touch</div>
          <h1 className="ct-title">Come and <em>say hello</em></h1>
          <p className="ct-lead">
            Questions about a course, your level, or whether there&apos;s a place in a group?
            Write, call, or drop by the centre — we answer everything personally, usually the same day.
          </p>

          <div className="ct-grid">
            <div>
              <div className="ct-card">
                <h2 className="ct-card-title">The <em>centre</em></h2>

                <div className="ct-row">
                  <span className="ct-ic" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </span>
                  <div>
                    <div className="ct-row-label">Address</div>
                    <div className="ct-row-value">Calle Ministro Luis Mayans, 31, Bajo<br/>Valencia</div>
                  </div>
                </div>

                <div className="ct-row">
                  <span className="ct-ic" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/></svg>
                  </span>
                  <div>
                    <div className="ct-row-label">Phone</div>
                    <div className="ct-row-value">
                      <a href="tel:+34601129552">601 12 95 52</a> · <a href="tel:+34963388933">963 38 89 33</a>
                    </div>
                  </div>
                </div>

                <div className="ct-row">
                  <span className="ct-ic" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
                  </span>
                  <div>
                    <div className="ct-row-label">Email</div>
                    <div className="ct-row-value"><a href="mailto:info@somersetlc.com">info@somersetlc.com</a></div>
                    <div className="ct-row-sub">We usually reply the same day.</div>
                  </div>
                </div>

                <a className="ct-wa" href="https://wa.me/34601129552" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.6c1.2.6 2.5.9 3.8.9 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22c-1.2 0-2.4-.3-3.5-.8l-.6-.3-4.9 1 1-4.7-.3-.6A9 9 0 0 1 7 15c0-5 4-9 9-9s9 4 9 9-4 10-9 10zm5-6.9c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.1l-1 1.2c-.2.2-.4.2-.7.1a7.4 7.4 0 0 1-3.6-3.1c-.3-.5.3-.5.7-1.6.1-.2 0-.4 0-.6l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"/></svg>
                  Message us on WhatsApp
                </a>
              </div>

              <div className="ct-map">
                <iframe
                  src="https://www.google.com/maps?q=Calle+Ministro+Luis+Mayans+31+Valencia&output=embed"
                  loading="lazy"
                  title="Somerset Language Centre — Calle Ministro Luis Mayans 31, Valencia"
                />
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
