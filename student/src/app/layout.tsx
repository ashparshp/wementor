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
      <body className={`${spaceGrotesk.variable} antialiased bg-gray-50/50 min-h-screen flex flex-col`}>
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Image src="/logo-hor-no-bg.png" alt="Logo" width={150} height={40} className="h-8 w-auto mx-auto mb-6 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
            <p className="text-sm text-gray-500 font-medium">&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
