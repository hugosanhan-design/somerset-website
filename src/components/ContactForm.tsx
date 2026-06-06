"use client";
export default function ContactForm() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold text-lg mb-4" style={{ color: "#4d8520" }}>Send us a message</h2>
      <form className="space-y-4" onSubmit={e => e.preventDefault()}>
        <div>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input type="text" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-green-400 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input type="email" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-green-400 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Message</label>
          <textarea rows={4} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-green-400 outline-none resize-none" />
        </div>
        <button type="submit" className="w-full text-white font-bold py-3 rounded-lg transition-colors"
          style={{ backgroundColor: "#6BAE2E" }}>
          Send message
        </button>
      </form>
    </div>
  );
}
