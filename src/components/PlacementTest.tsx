"use client";
import { useState } from "react";

const questions = [
  {
    q: "Choose the correct form:",
    context: '"I ___ here since 2018 and I love it."',
    options: ["I work", "I have been working", "I was working"],
    correct: 1,
  },
  {
    q: "Choose the correct word:",
    context: '"___ the heavy rain, the match continued."',
    options: ["Although", "Despite", "However"],
    correct: 1,
  },
  {
    q: "Complete the sentence:",
    context: '"The painting ___ by Velázquez in the 17th century."',
    options: ["painted", "was painted", "has painted"],
    correct: 1,
  },
  {
    q: "Choose the correct form:",
    context: '"Had I known about the problem, I ___ earlier."',
    options: ["would arrive", "would have arrive", "would have arrived"],
    correct: 2,
  },
  {
    q: "Complete the sentence:",
    context: '"The report was written with a view ___ safety standards."',
    options: ["to improve", "to improving", "for improving"],
    correct: 1,
  },
  {
    q: "Choose the correct word:",
    context: '"The committee, ___ members include several leading experts, meets monthly."',
    options: ["who", "which", "whose"],
    correct: 2,
  },
];

const levelFromScore = (s: number) => {
  if (s <= 1) return { level: "B1", msg: "You're at an intermediate level — a great starting point!", emoji: "📗" };
  if (s <= 3) return { level: "B2", msg: "You're at an upper-intermediate level. Keep it up!", emoji: "📘" };
  if (s <= 5) return { level: "C1", msg: "You're at an advanced level. Impressive!", emoji: "📙" };
  return { level: "C2", msg: "You're at a near-native level. Excellent!", emoji: "🏆" };
};

export default function PlacementTest() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const answer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === questions[current].correct;
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= questions.length) setDone(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 900);
  };

  const reset = () => { setCurrent(0); setScore(0); setSelected(null); setDone(false); };

  if (done) {
    const result = levelFromScore(score);
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center">
        <div className="text-6xl mb-4">{result.emoji}</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#4d8520" }}>Your level: {result.level}</h2>
        <p className="text-gray-500 mb-6">{result.msg}</p>
        <p className="text-gray-400 text-sm mb-6">You scored {score} out of {questions.length}</p>
        <a href="/contact" className="inline-block text-white font-bold px-6 py-3 rounded-full mr-3 transition-colors"
          style={{ backgroundColor: "#6BAE2E" }}>
          Book a class
        </a>
        <button onClick={reset} className="text-sm font-semibold border-2 rounded-full px-6 py-3 transition-colors"
          style={{ borderColor: "#6BAE2E", color: "#4d8520" }}>
          Try again
        </button>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  return (
    <div className="bg-white rounded-xl shadow p-8">
      <div className="h-1.5 bg-gray-100 rounded-full mb-6">
        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: "#6BAE2E" }} />
      </div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Question {current + 1} of {questions.length}</p>
      <h3 className="text-lg font-semibold mb-1">{q.q}</h3>
      <p className="text-gray-500 italic text-sm mb-6">{q.context}</p>
      <div className="space-y-3">
        {q.options.map((opt, i) => {
          let cls = "w-full text-left px-5 py-3 rounded-lg border-2 text-sm font-medium transition-all ";
          if (selected === null) cls += "border-gray-200 hover:border-green-400 hover:bg-green-50 cursor-pointer";
          else if (i === q.correct) cls += "border-green-500 bg-green-50 text-green-800";
          else if (i === selected) cls += "border-red-400 bg-red-50 text-red-700";
          else cls += "border-gray-200 text-gray-400";
          return <button key={i} className={cls} onClick={() => answer(i)}>{opt}</button>;
        })}
      </div>
    </div>
  );
}
