import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppBackground from "@/components/AppBackground";
import Navbar from "@/components/Navbar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentorship Platform - Find Your Perfect Mentor",
  description: "Connect with industry experts and accelerate your career with 1-on-1 mentorship sessions.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased min-h-screen flex flex-col relative overflow-x-hidden`}>
        <AppBackground />

        <Navbar />

        {/* Main Content */}
        <main className="flex-grow flex flex-col relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
