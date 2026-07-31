"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Video, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden pt-12 sm:pt-16 md:pt-24 pb-16 sm:pb-24 md:pb-32 flex-grow flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-[#111827] tracking-tight leading-[1.1]">
              Master your craft with <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F29440] to-[#E88935]">world-class mentors</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              Book 1-on-1 virtual mentorship sessions with industry experts. Get personalized guidance, resume reviews, and interview prep.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 sm:pt-10">
              <Link href="/book" className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold transition-all shadow-[0_0_15px_rgba(0,0,0,0.08)] hover:shadow-[0_0_20px_rgba(0,0,0,0.12)] border border-gray-100 active:scale-95">
                <span>Book a Session</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 group-hover:translate-x-1.5 transition-transform text-[#F29440]" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12H20M20 12L15.5 8.5M20 12L15.5 15.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            <div className="pt-10 sm:pt-16 flex flex-row flex-wrap items-center justify-center gap-x-2.5 gap-y-2 sm:gap-x-8 sm:gap-y-0 text-[10px] sm:text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap"><ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-emerald-500"/> Vetted Experts</div>
              <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap"><Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-blue-500"/> 1-on-1 Video Calls</div>
              <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#F29440]"/> Instant Booking</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
