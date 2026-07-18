"use client";
import { useState } from "react";

// Premium-styled contact form (matches the homepage design language).
// No backend yet — submitting opens the visitor's email app with the
// message pre-filled, addressed to info@somersetlc.com.
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Enquiry from the website — ${name || "no name given"}`;
    const body = `${message}\n\n— ${name}${email ? ` (${email})` : ""}`;
    window.location.href =
      `mailto:info@somersetlc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <div className="ctf-card">
      <style>{`
        .ctf-card { background: #1E4227; border-radius: 20px; padding: 2.3rem 2.4rem 2.5rem; font-family: 'Instrument Sans', system-ui, sans-serif; }
        .ctf-title { font-family: 'Fraunces', Georgia, serif; font-size: 1.45rem; font-weight: 420; color: #F5F1E6; margin: 0 0 0.4rem; }
        .ctf-title em { font-style: italic; color: #A8D77E; }
        .ctf-sub { font-size: 0.86rem; color: rgba(245,241,230,0.55); margin: 0 0 1.8rem; line-height: 1.6; }
        .ctf-label { display: block; font-size: 0.66rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(245,241,230,0.6); margin: 0 0 0.4rem; }
        .ctf-field { margin-bottom: 1.15rem; }
        .ctf-input {
          width: 100%; box-sizing: border-box; font-family: inherit; font-size: 0.95rem; color: #F5F1E6;
          background: rgba(245,241,230,0.07); border: 1px solid rgba(245,241,230,0.22);
          border-radius: 12px; padding: 0.75rem 1rem; outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .ctf-input::placeholder { color: rgba(245,241,230,0.35); }
        .ctf-input:focus { border-color: #A8D77E; background: rgba(245,241,230,0.11); }
        textarea.ctf-input { resize: vertical; min-height: 120px; }
        .ctf-btn {
          width: 100%; border: none; cursor: pointer; font-family: inherit;
          background: #57B82C; color: #fff; font-weight: 600; font-size: 0.98rem;
          padding: 0.95rem 1.5rem; border-radius: 50px; margin-top: 0.4rem;
          box-shadow: 0 8px 24px rgba(87,184,44,0.32);
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .ctf-btn:hover { background: #3D8B1F; transform: translateY(-2px); box-shadow: 0 12px 28px rgba(87,184,44,0.38); }
        .ctf-note { font-size: 0.78rem; color: rgba(245,241,230,0.45); margin: 0.9rem 0 0; text-align: center; line-height: 1.5; }
        .ctf-note a { color: #A8D77E; text-decoration: none; }
        .ctf-note a:hover { text-decoration: underline; }
      `}</style>

      <h2 className="ctf-title">Send us a <em>message</em></h2>
      <p className="ctf-sub">Tell us who the classes are for and anything about level or timetable — we&apos;ll take it from there.</p>

      <form onSubmit={onSubmit}>
        <div className="ctf-field">
          <label className="ctf-label" htmlFor="ctf-name">Name</label>
          <input id="ctf-name" className="ctf-input" type="text" placeholder="Your name"
            value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="ctf-field">
          <label className="ctf-label" htmlFor="ctf-email">Email</label>
          <input id="ctf-email" className="ctf-input" type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="ctf-field">
          <label className="ctf-label" htmlFor="ctf-message">Message</label>
          <textarea id="ctf-message" className="ctf-input" rows={5}
            placeholder="e.g. I'm looking for a B2 class for my daughter, Tuesday or Thursday afternoons…"
            value={message} onChange={e => setMessage(e.target.value)} required />
        </div>
        <button type="submit" className="ctf-btn">Send message →</button>
        <p className="ctf-note">
          {opened
            ? <>Your email app should have opened with the message ready — just press send. If it didn&apos;t, write to <a href="mailto:info@somersetlc.com">info@somersetlc.com</a>.</>
            : <>This opens your email app with the message ready to send — or write directly to <a href="mailto:info@somersetlc.com">info@somersetlc.com</a>.</>}
        </p>
      </form>
    </div>
  );
}
