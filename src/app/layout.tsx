import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Somerset Language Centre — Valencia",
  description: "Learn English in Valencia with Somerset Language Centre. Classes for all levels — children, teens and adults.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Poppins:wght@600;700&display=swap"
        />
        {/* The rail: one stylesheet and one script, shared with the generated
            standalone pages so navigation exists in exactly one place. */}
        <link rel="stylesheet" href="/nav-rail.css" />
      </head>
      <body className="text-gray-800" style={{ backgroundColor: "#F5F1E6" }}>
        <Shell footer={<Footer />}>{children}</Shell>
        <script src="/nav-rail.js" defer />
      </body>
    </html>
  );
}
