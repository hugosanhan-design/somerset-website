import ContactForm from "@/components/ContactForm";
export const metadata = { title: "Contact — Somerset Language Centre" };

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="rounded-xl text-white px-8 py-6 mb-10" style={{ backgroundColor: "#57B82C" }}>
        <h1 className="text-3xl font-bold">Get in touch</h1>
        <p className="opacity-90 mt-1">We&apos;d love to hear from you</p>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-bold text-lg mb-4" style={{ color: "#3D8B1F" }}>Our details</h2>
          <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
            <p>📍 Calle Ministro Luis Mayans, 31, Bajo, Valencia</p>
            <p>📞 601 12 95 52 · 963 38 89 33</p>
            <p>✉️ <a href="mailto:info@somersetlc.com" className="text-green-700 font-semibold">info@somersetlc.com</a></p>
          </div>
          <div className="mt-6 rounded-xl overflow-hidden shadow h-52">
            <iframe
              src="https://www.google.com/maps?q=Calle+Ministro+Luis+Mayans+31+Valencia&output=embed"
              width="100%" height="100%" style={{ border: 0 }} loading="lazy"
              title="Somerset Location" />
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
