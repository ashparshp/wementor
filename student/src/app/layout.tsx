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
      <body className={`${spaceGrotesk.className} antialiased min-h-screen flex flex-col`}>
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#E88935]/10 py-3 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <Image src="/logo-hor-no-bg.png" alt="Logo" width={300} height={100} className="w-48 sm:w-56 h-auto mb-1 object-contain opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
            <p className="text-sm text-gray-500 font-medium">&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
