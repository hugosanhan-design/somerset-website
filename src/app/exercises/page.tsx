import Link from "next/link";
export const metadata = { title: "Exercises — Somerset Language Centre" };

const levels = ["B1", "B2", "C1", "C2", "EVAU"];
const levelColours: Record<string, string> = {
  B1: "#2563eb", B2: "#d97706", C1: "#7c3aed", C2: "#dc2626", EVAU: "#0891b2"
};

// Starter exercises — more to be added
const exercises = [
  { level: "B1", title: "Present Perfect vs Past Simple", type: "Grammar", emoji: "📝" },
  { level: "B1", title: "Connectors: although, despite, however", type: "Grammar", emoji: "🔗" },
  { level: "B2", title: "Passive Voice — all tenses", type: "Grammar", emoji: "📝" },
  { level: "B2", title: "Conditionals 1, 2 & 3", type: "Grammar", emoji: "🔀" },
  { level: "C1", title: "Inversion & emphasis", type: "Advanced Grammar", emoji: "⬆️" },
  { level: "C1", title: "Dependent prepositions", type: "Vocabulary", emoji: "📚" },
  { level: "C2", title: "Collocations & idioms", type: "Vocabulary", emoji: "💬" },
  { level: "EVAU", title: "EVAU Writing — opinion essay", type: "Writing", emoji: "✍️" },
  { level: "EVAU", title: "EVAU Reading — comprehension", type: "Reading", emoji: "📖" },
];

export default function ExercisesPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="rounded-xl text-white px-8 py-6 mb-10" style={{ backgroundColor: "#6BAE2E" }}>
        <h1 className="text-3xl font-bold">Exercise Library</h1>
        <p className="opacity-90 mt-1">Grammar, vocabulary and exam practice — filter by your level</p>
      </div>

      {levels.map(level => {
        const colour = levelColours[level];
        const levelExercises = exercises.filter(e => e.level === level);
        if (!levelExercises.length) return null;
        return (
          <section key={level} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: colour }}>
                {level}
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {levelExercises.map((ex, i) => (
                <div key={i} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-16 flex items-center justify-center text-3xl" style={{ backgroundColor: colour + "22" }}>
                    {ex.emoji}
                  </div>
                  <div className="p-4" style={{ borderLeft: `3px solid ${colour}` }}>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: colour }}>{ex.type}</span>
                    <h3 className="font-semibold text-sm mt-1 leading-snug">{ex.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div className="mt-8 p-6 rounded-xl text-center" style={{ backgroundColor: "#eaf4da" }}>
        <p className="text-sm" style={{ color: "#4d8520" }}>
          More exercises added regularly. Not sure which level you are?{" "}
          <Link href="/placement" className="font-bold underline">Take the placement test</Link>.
        </p>
      </div>
    </div>
  );
}
