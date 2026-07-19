"use client";

import { useState } from "react";
import Link from "next/link";
import { courses } from "@/data/courses";

export default function CoursesPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openLevel, setOpenLevel] = useState<string | null>(null);

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
        .cr-root { font-family: 'Instrument Sans', system-ui, sans-serif; color: #17281B; }
        .cr-wrap { max-width: 1100px; margin: 0 auto; padding: 4.5rem 2rem 5.5rem; }
        .cr-eyebrow { display: flex; align-items: center; gap: 1rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #3D8B1F; margin-bottom: 1.2rem; }
        .cr-eyebrow::before { content: ''; width: 44px; height: 1px; background: #C9A24B; }
        .cr-title { font-family: 'Fraunces', Georgia, serif; font-size: clamp(2.3rem, 4vw, 3.4rem); font-weight: 380; line-height: 1.1; letter-spacing: -0.015em; margin: 0 0 1.1rem; }
        .cr-title em { font-style: italic; color: #3D8B1F; }
        .cr-lead { font-size: 1.05rem; color: #5C6657; line-height: 1.75; max-width: 54ch; margin: 0 0 3.2rem; text-wrap: pretty; }
        .cr-lead a { color: #3D8B1F; font-weight: 600; text-decoration: none; border-bottom: 1px solid #C9A24B; padding-bottom: 1px; }
        .cr-lead a:hover { color: #1E4227; }

        .cr-list { background: #FBF9F2; border: 1px solid #D9D2BC; border-radius: 22px; overflow: hidden; }
        .cr-cat { border-top: 1px solid #D9D2BC; }
        .cr-cat:first-child { border-top: none; }

        .cr-cat-head { width: 100%; display: flex; align-items: center; gap: 1.6rem; padding: 1.9rem 1.9rem; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; transition: background 0.2s; }
        .cr-cat-head:hover { background: rgba(87,184,44,0.05); }
        .cr-cat.open .cr-cat-head { background: rgba(87,184,44,0.06); }
        .cr-num { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 1.05rem; color: #C9A24B; flex-shrink: 0; }
        .cr-cat-main { flex: 1; min-width: 0; }
        .cr-cat-name { display: block; font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.4rem, 2.4vw, 1.9rem); font-weight: 420; letter-spacing: -0.01em; line-height: 1.15; }
        .cr-cat-desc { display: block; font-size: 0.9rem; color: #5C6657; margin-top: 0.3rem; line-height: 1.5; }
        .cr-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; justify-content: flex-end; flex-shrink: 0; }
        .cr-tag { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.04em; padding: 0.3rem 0.75rem; border-radius: 50px; border: 1px solid #D9D2BC; color: #3D8B1F; white-space: nowrap; }
        .cr-arr { font-size: 1.35rem; color: #C9A24B; flex-shrink: 0; transition: transform 0.28s cubic-bezier(0.22,1,0.36,1); }
        .cr-cat.open .cr-arr { transform: rotate(90deg); }

        .cr-levels { padding: 0.4rem 1.9rem 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .cr-level { background: #fff; border: 1px solid #D9D2BC; border-radius: 14px; overflow: hidden; }
        .cr-level-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.2rem; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; transition: background 0.15s; }
        .cr-level-head:hover { background: rgba(87,184,44,0.05); }
        .cr-level-name { display: block; font-weight: 700; font-size: 1rem; color: #17281B; }
        .cr-level-tag { display: block; font-size: 0.75rem; color: #8A8570; margin-top: 0.15rem; }
        .cr-arr-sm { font-size: 0.95rem; color: #57B82C; flex-shrink: 0; transition: transform 0.25s; }
        .cr-level.open .cr-arr-sm { transform: rotate(90deg); }

        .cr-level-body { padding: 0.2rem 1.2rem 1.3rem; border-top: 1px solid #EDE7D6; }
        .cr-desc { font-size: 0.9rem; color: #5C6657; line-height: 1.65; margin: 0.9rem 0 1rem; text-wrap: pretty; }
        .cr-groups { display: flex; flex-direction: column; gap: 0.55rem; }
        .cr-group { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
        .cr-group-label { font-size: 0.78rem; font-weight: 600; color: #17281B; min-width: 8.5rem; }
        .cr-pill { display: inline-flex; align-items: center; font-size: 0.76rem; font-weight: 500; padding: 0.3rem 0.7rem; border-radius: 50px; background: #eaf4da; color: #3D8B1F; white-space: nowrap; }
        .cr-note { font-size: 0.78rem; color: #8A8570; font-style: italic; margin-top: 0.9rem; }

        .cr-cta { margin-top: 2.6rem; display: flex; flex-wrap: wrap; align-items: center; gap: 1.2rem; }
        .cr-cta-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #57B82C; color: #fff; font-family: inherit; font-weight: 600; font-size: 0.95rem; padding: 0.85rem 1.7rem; border-radius: 50px; text-decoration: none; box-shadow: 0 8px 22px rgba(87,184,44,0.3); transition: background 0.2s, transform 0.2s; }
        .cr-cta-btn:hover { background: #3D8B1F; transform: translateY(-2px); }
        .cr-cta-phone { font-size: 0.9rem; color: #5C6657; }
        .cr-cta-phone a { color: #17281B; text-decoration: none; border-bottom: 1px solid #C9A24B; padding-bottom: 1px; }
        .cr-cta-phone a:hover { color: #3D8B1F; }

        @media (max-width: 760px) {
          .cr-wrap { padding: 3rem 1.3rem 4rem; }
          .cr-cat-head { gap: 1rem; padding: 1.5rem 1.3rem; }
          .cr-num { display: none; }
          .cr-tags { display: none; }
          .cr-levels { grid-template-columns: 1fr; padding: 0.3rem 1.3rem 1.6rem; }
        }
      `}</style>

      <div className="cr-root">
        <div className="cr-wrap">
          <div className="cr-eyebrow">What we teach</div>
          <h1 className="cr-title">Courses for <em>every age</em></h1>
          <p className="cr-lead">
            Small groups of 8–10 students, native and bilingual teachers, since 2013.
            Tap a course to see the levels and this year&apos;s group timetables. Not sure
            which level you are?{" "}
            <Link href="/placement">Take the free placement test</Link>.
          </p>

          <div className="cr-list">
            {courses.map((c) => {
              const isOpen = openCategory === c.num;
              return (
                <div key={c.num} className={`cr-cat${isOpen ? " open" : ""}`}>
                  <button
                    className="cr-cat-head"
                    onClick={() => { setOpenCategory(isOpen ? null : c.num); setOpenLevel(null); }}
                    aria-expanded={isOpen}
                  >
                    <span className="cr-num">{c.num}</span>
                    <span className="cr-cat-main">
                      <span className="cr-cat-name">{c.name}</span>
                      <span className="cr-cat-desc">{c.desc}</span>
                    </span>
                    <span className="cr-tags">
                      {c.summaryTags.map((t) => (
                        <span key={t} className="cr-tag">{t}</span>
                      ))}
                    </span>
                    <span className="cr-arr" aria-hidden="true">→</span>
                  </button>

                  {isOpen && (
                    <div className="cr-levels">
                      {c.levels.map((lvl) => {
                        const key = `${c.num}-${lvl.name}`;
                        const levelOpen = openLevel === key;
                        return (
                          <div key={key} className={`cr-level${levelOpen ? " open" : ""}`}>
                            <button
                              className="cr-level-head"
                              onClick={() => setOpenLevel(levelOpen ? null : key)}
                              aria-expanded={levelOpen}
                            >
                              <span>
                                <span className="cr-level-name">{lvl.name}</span>
                                {lvl.tag && <span className="cr-level-tag">{lvl.tag}</span>}
                              </span>
                              <span className="cr-arr-sm" aria-hidden="true">→</span>
                            </button>

                            {levelOpen && (
                              <div className="cr-level-body">
                                <p className="cr-desc">{lvl.desc}</p>

                                {lvl.groups && (
                                  <div className="cr-groups">
                                    {lvl.groups.map((g, i) => (
                                      <div key={i} className="cr-group">
                                        {g.label && <span className="cr-group-label">{g.label}</span>}
                                        {g.sessions.map((s, j) => (
                                          <span key={j} className="cr-pill">{s.day} {s.time}</span>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {lvl.note && <p className="cr-note">{lvl.note}</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="cr-cta">
            <Link href="/contact" className="cr-cta-btn">
              Ask about a course <span aria-hidden="true">→</span>
            </Link>
            <span className="cr-cta-phone">
              Or call us: <a href="tel:+34601129552">601 12 95 52</a> · <a href="tel:+34963388933">963 38 89 33</a>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
