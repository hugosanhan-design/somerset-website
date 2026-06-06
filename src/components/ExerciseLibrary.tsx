"use client";
import { useState, useMemo } from "react";
import { exercises, levelColour, levelBg, allLevels, allTypes } from "@/lib/exercises";

export default function ExerciseLibrary() {
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState("ALL");
  const [activeType, setActiveType] = useState("ALL");

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      const matchLevel = activeLevel === "ALL" || ex.level === activeLevel;
      const matchType = activeType === "ALL" || ex.type === activeType;
      const q = search.toLowerCase();
      const matchSearch = !q || ex.title.toLowerCase().includes(q) || ex.type.toLowerCase().includes(q) || ex.level.toLowerCase().includes(q);
      return matchLevel && matchType && matchSearch;
    });
  }, [search, activeLevel, activeType]);

  function surprise() {
    if (!filtered.length) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    window.open(pick.href, "_blank");
  }

  return (
    <div>
      {/* Search + Surprise */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title, type or level…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none text-sm"
          style={{ borderColor: search ? "#6BAE2E" : undefined }}
        />
        <button
          onClick={surprise}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white whitespace-nowrap transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#6BAE2E" }}>
          🎲 Surprise me
        </button>
      </div>

      {/* Level filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        {allLevels.map(l => {
          const colour = l === "ALL" ? "#6BAE2E" : levelColour[l] ?? "#888";
          const active = activeLevel === l;
          return (
            <button key={l} onClick={() => setActiveLevel(l)}
              className="text-xs font-bold px-3 py-1 rounded-full border-2 transition-colors"
              style={{
                borderColor: colour,
                backgroundColor: active ? colour : "transparent",
                color: active ? "#fff" : colour,
              }}>
              {l}
            </button>
          );
        })}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["ALL", ...allTypes].map(t => {
          const active = activeType === t;
          return (
            <button key={t} onClick={() => setActiveType(t)}
              className="text-xs px-3 py-1 rounded-full border transition-colors"
              style={{
                borderColor: active ? "#4d8520" : "#d1d5db",
                backgroundColor: active ? "#eaf4da" : "transparent",
                color: active ? "#4d8520" : "#6b7280",
                fontWeight: active ? 700 : 400,
              }}>
              #{t.toLowerCase().replace(/ /g, "-")}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 mb-4">
        {filtered.length} exercise{filtered.length !== 1 ? "s" : ""}
        {activeLevel !== "ALL" || activeType !== "ALL" || search ? " matching" : " total"}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No exercises match that filter.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((ex, i) => {
            const colour = levelColour[ex.level] ?? "#888";
            const bg = levelBg[ex.level] ?? "#f3f4f6";
            return (
              <a key={i} href={ex.href} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-lg overflow-hidden block transition-all hover:-translate-y-1"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
                <div className="h-14 flex items-center justify-center text-2xl" style={{ backgroundColor: bg }}>
                  {ex.type === "Reading" ? "📖" : ex.type === "Word Formation" ? "🔤" : ex.type === "Use of English" ? "✏️" : ex.type === "EVAU" ? "🎯" : ex.type === "Mixed" ? "🔀" : "📝"}
                </div>
                <div className="p-3" style={{ borderLeft: `3px solid ${colour}` }}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: bg, color: colour }}>
                      {ex.level}
                    </span>
                    <span className="text-xs text-gray-400 truncate">{ex.type}</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug text-gray-800">{ex.title}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
