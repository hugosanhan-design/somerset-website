import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-80 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 to-green-500" />
        <div className="relative z-10 text-center text-white px-6 max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 drop-shadow">Learn English with Somerset</h1>
          <p className="text-lg opacity-90 mb-6">English classes for all levels in Valencia, Spain. Children, teens and adults since 1982.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/placement" className="bg-white text-green-700 font-bold px-6 py-3 rounded-full hover:bg-green-50 transition-colors">
              Find my level →
            </Link>
            <Link href="/contact" className="border-2 border-white text-white font-bold px-6 py-3 rounded-full hover:bg-white/15 transition-colors">
              Contact us
            </Link>
          </div>
        </div>
      </section>

      {/* Why Somerset */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "#4d8520" }}>Why choose Somerset?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "👥", title: "Small groups", body: "Between 8 and 10 students per class. Every student gets real attention." },
            { icon: "🎓", title: "Native & bilingual teachers", body: "All our teachers are native or bilingual, qualified and experienced." },
            { icon: "🏆", title: "99% exam pass rate", body: "Proven results in Cambridge official exams over more than 40 years." },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Placement test CTA */}
      <section style={{ backgroundColor: "#eaf4da" }} className="py-12 text-center px-5">
        <h2 className="text-xl font-bold mb-2" style={{ color: "#4d8520" }}>Not sure which level you are?</h2>
        <p className="text-gray-600 mb-6">Take our free placement test and find out in 2 minutes.</p>
        <Link href="/placement" className="text-white font-bold px-8 py-3 rounded-full transition-colors"
          style={{ backgroundColor: "#6BAE2E" }}>
          Start the placement test
        </Link>
      </section>

      {/* About */}
      <section className="max-w-4xl mx-auto px-5 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "#4d8520" }}>About Somerset</h2>
        <p className="text-gray-600 leading-relaxed text-lg">
          Somerset Language Centre was founded in 2013 by Hugo and Sara Hancock, with the purpose of bringing English to everyone who needs it.
          Our own teaching method is fundamentally practical, based on oral communication — we put students in real, useful situations so they think and communicate in English from day one.
        </p>
      </section>
    </>
  );
}
