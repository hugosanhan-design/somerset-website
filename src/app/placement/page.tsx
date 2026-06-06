import PlacementTest from "@/components/PlacementTest";
export const metadata = { title: "Placement Test — Somerset Language Centre" };

export default function PlacementPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="rounded-xl text-white px-8 py-6 mb-10" style={{ backgroundColor: "#6BAE2E" }}>
        <h1 className="text-3xl font-bold">Free Placement Test</h1>
        <p className="opacity-90 mt-1">Answer 6 quick questions to find your English level (B1 → C2)</p>
      </div>
      <PlacementTest />
    </div>
  );
}
