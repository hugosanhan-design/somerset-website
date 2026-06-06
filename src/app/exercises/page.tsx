import ExerciseLibrary from "@/components/ExerciseLibrary";
import Link from "next/link";

export const metadata = { title: "Exercise Library — Somerset Language Centre" };

export default function ExercisesPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-10">

      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#4d8520" }}>Exercise Library</h1>
        <p className="text-gray-500 mt-1">
          Cambridge & EVAU exercises by Sara Hancock — filter by level, type, or search by topic.
          Not sure which level you are?{" "}
          <Link href="/placement" className="font-semibold underline" style={{ color: "#6BAE2E" }}>
            Take the placement test
          </Link>.
        </p>
      </div>

      <ExerciseLibrary />

    </div>
  );
}
