import Link from "next/link";

export const metadata = { title: "Courses — Somerset Language Centre" };

const courses = [
  {
    num: "01",
    name: "Children",
    desc: "Learning that feels like play — solid foundations from the very start.",
    levels: ["Infantil", "Primaria"],
  },
  {
    num: "02",
    name: "Teenagers",
    desc: "Confidence for school, exams and everything after.",
    levels: ["ESO", "Bachillerato"],
  },
  {
    num: "03",
    name: "Adults",
    desc: "Practical English for work, travel and real life.",
    levels: ["All levels", "Conversation"],
  },
  {
    num: "04",
    name: "Exam preparation",
    desc: "Cambridge results without the panic — proven, structured prep.",
    levels: ["B1", "B2 First", "C1 Advanced", "EVAU"],
  },
];

export default function CoursesPage() {
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
        {courses.map(c => (
          <Link key={c.num} href="/contact"
            className="flex items-center gap-6 px-6 py-6 hover:bg-green-50/50 transition-colors group">
            <span className="text-sm font-bold tabular-nums" style={{ color: "#57B82C" }}>{c.num}</span>
            <span className="flex-1">
              <span className="block text-xl font-bold text-gray-900">{c.name}</span>
              <span className="block text-sm text-gray-500 mt-0.5">{c.desc}</span>
            </span>
            <span className="hidden sm:flex gap-2 flex-wrap justify-end">
              {c.levels.map(l => (
                <span key={l} className="text-xs font-semibold px-3 py-1 rounded-full border"
                  style={{ borderColor: "#57B82C", color: "#3D8B1F" }}>{l}</span>
              ))}
            </span>
            <span className="text-xl transition-transform group-hover:translate-x-1" style={{ color: "#3D8B1F" }}>→</span>
          </Link>
        ))}
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
