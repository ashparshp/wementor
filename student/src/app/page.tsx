"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Video, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32 flex-grow flex items-center">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#111827 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-black text-[#111827] tracking-tight leading-[1.1]">
              Master your craft with <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F29440] to-[#E88935]">world-class mentors</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Book 1-on-1 virtual mentorship sessions with industry experts. Get personalized guidance, resume reviews, and interview prep.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
              <Link href="/book" className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 px-10 py-5 rounded-xl text-xl font-bold transition-all shadow-[0_0_15px_rgba(0,0,0,0.08)] hover:shadow-[0_0_20px_rgba(0,0,0,0.12)] border border-gray-100 active:scale-95">
                <span>Book a Session</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform text-[#F29440]" />
              </Link>
            </div>

            <div className="pt-16 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500"/> Vetted Experts</div>
              <div className="flex items-center gap-2"><Video className="w-5 h-5 text-blue-500"/> 1-on-1 Video Calls</div>
              <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-[#F29440]"/> Instant Booking</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
