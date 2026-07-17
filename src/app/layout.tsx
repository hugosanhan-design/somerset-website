import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
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
      <body className="text-gray-800" style={{ backgroundColor: "#F5F1E6" }}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
