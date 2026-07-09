import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentorship Platform - Find Your Perfect Mentor",
  description: "Connect with industry experts and accelerate your career with 1-on-1 mentorship sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased min-h-screen flex flex-col relative`}>
        {/* Universal Background */}
        <div className="fixed inset-0 -z-50 bg-cover bg-center bg-no-repeat bg-[#FDF8F5]" style={{ backgroundImage: 'url(/hero-bg.png)' }}>
          <div className="absolute inset-0 bg-white/60"></div>
        </div>

        <Navbar />

        {/* Main Content */}
        <main className="flex-grow flex flex-col relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
