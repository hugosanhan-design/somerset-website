"use client";

import { useState } from "react";
import Link from "next/link";
import { courses } from "@/data/courses";

export default function CoursesPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openLevel, setOpenLevel] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#3D8B1F" }}>Courses for every age</h1>
        <p className="text-gray-500 mt-1">
          Small groups (8–10 students), native and bilingual teachers, since 2013.
          Not sure which level you are?{" "}
          <Link href="/placement" className="font-semibold underline" style={{ color: "#57B82C" }}>
            Take the placement test
          </Link>.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {courses.map(c => {
          const isOpen = openCategory === c.num;
          return (
            <div key={c.num}>
              <button
                onClick={() => { setOpenCategory(isOpen ? null : c.num); setOpenLevel(null); }}
                className="w-full flex items-center gap-6 px-6 py-6 hover:bg-green-50/50 transition-colors group text-left"
              >
                <span className="text-sm font-bold tabular-nums" style={{ color: "#57B82C" }}>{c.num}</span>
                <span className="flex-1">
                  <span className="block text-xl font-bold text-gray-900">{c.name}</span>
                  <span className="block text-sm text-gray-500 mt-0.5">{c.desc}</span>
                </span>
                <span className="hidden sm:flex gap-2 flex-wrap justify-end">
                  {c.summaryTags.map(l => (
                    <span key={l} className="text-xs font-semibold px-3 py-1 rounded-full border"
                      style={{ borderColor: "#57B82C", color: "#3D8B1F" }}>{l}</span>
                  ))}
                </span>
                <span
                  className="text-xl transition-transform"
                  style={{ color: "#3D8B1F", transform: isOpen ? "rotate(90deg)" : undefined }}
                >
                  →
                </span>
              </button>

              {isOpen && (
                <div className="px-6 pb-8 bg-gray-50/60">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {c.levels.map(lvl => {
                      const key = `${c.num}-${lvl.name}`;
                      const levelOpen = openLevel === key;
                      return (
                        <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => setOpenLevel(levelOpen ? null : key)}
                            className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-green-50/40"
                          >
                            <span>
                              <span className="block font-bold text-gray-900">{lvl.name}</span>
                              {lvl.tag && <span className="block text-xs text-gray-400 mt-0.5">{lvl.tag}</span>}
                            </span>
                            <span
                              className="text-sm transition-transform flex-shrink-0"
                              style={{ color: "#57B82C", transform: levelOpen ? "rotate(90deg)" : undefined }}
                            >
                              →
                            </span>
                          </button>

                          {levelOpen && (
                            <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">{lvl.desc}</p>

                              {lvl.groups && (
                                <div className="space-y-2 mb-2">
                                  {lvl.groups.map((g, i) => (
                                    <div key={i} className="flex flex-wrap items-center gap-2 text-xs">
                                      {g.label && (
                                        <span className="font-semibold text-gray-700 min-w-[7rem]">{g.label}</span>
                                      )}
                                      {g.sessions.map((s, j) => (
                                        <span
                                          key={j}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium"
                                          style={{ backgroundColor: "#eaf4da", color: "#3D8B1F" }}
                                        >
                                          {s.day} {s.time}
                                        </span>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {lvl.note && (
                                <p className="text-xs text-gray-400 italic mt-2">{lvl.note}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href="/contact" className="font-bold text-white px-6 py-3 rounded-full"
          style={{ backgroundColor: "#57B82C" }}>
          Ask about a course →
        </Link>
        <span className="text-sm text-gray-500">
          Or call us: 601 12 95 52 / 963 38 89 33
        </span>
      </div>
    </div>
  );
}
