"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Star,
  Video,
  Zap,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

const STEPS = [
  {
    step: "01",
    title: "Browse mentors",
    description: "Explore sessions by category — JEE, NEET, GSoC, placements, and more.",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "Pick a time slot",
    description: "Choose a date and time that fits your schedule from the mentor's availability.",
    icon: Calendar,
  },
  {
    step: "03",
    title: "Join & learn",
    description: "Pay securely, get your Google Meet link, and have your 1-on-1 session.",
    icon: Video,
  },
];

export default function Home() {
  const featuredCategories = CATEGORIES.filter((c) => c.id !== "all" && c.id !== "other").slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 md:pt-20 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#EADBCB] text-xs font-bold text-[#F29440] mb-6 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-[#F29440]" />
              Trusted mentorship for ambitious students
            </div>

            <h1 className="animate-fade-up stagger-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.08]">
              Learn from people who&apos;ve{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F29440] to-[#E88935]">
                already done it
              </span>
            </h1>

            <p className="animate-fade-up stagger-2 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mt-6 leading-relaxed">
              Book 1-on-1 mentorship sessions with experts in JEE, NEET, GSoC, LFX, placements, and more. Personalized guidance, real results.
            </p>

            <div className="animate-fade-up stagger-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-10">
              <Link href="/book" className="btn-primary w-full sm:w-auto text-base px-8 py-4 shadow-lg shadow-gray-900/10">
                Find a Mentor
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/become-mentor" className="btn-secondary w-full sm:w-auto text-base px-8 py-4">
                <GraduationCap className="w-5 h-5" />
                Become a Mentor
              </Link>
            </div>

            <div className="animate-fade-up stagger-4 mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm font-semibold text-gray-500">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Vetted mentors</span>
              <span className="flex items-center gap-2"><Video className="w-4 h-4 text-blue-500" /> Live video calls</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#F29440]" /> Instant booking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 sm:py-16 bg-white/50 border-y border-[#EADBCB]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">What are you preparing for?</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Find mentors who specialize in your goal</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/book?category=${cat.id}`}
                className="card-surface-hover p-4 sm:p-5 text-center group"
              >
                <span className="text-2xl sm:text-3xl block mb-2 group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <span className="font-bold text-gray-900 text-sm">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">How it works</h2>
            <p className="text-gray-600 mt-2">Three simple steps to your next breakthrough</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="card-surface p-6 sm:p-8 relative">
                  <span className="text-5xl font-black text-[#F29440]/10 absolute top-4 right-6">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-[#FDF1E9] flex items-center justify-center text-[#F29440] mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-br from-[#111827] to-[#1F2937] p-8 sm:p-12 text-center text-white shadow-2xl shadow-gray-900/20">
            <h2 className="text-2xl sm:text-3xl font-black">Ready to level up?</h2>
            <p className="text-gray-300 mt-3 max-w-lg mx-auto text-sm sm:text-base">
              Join students getting personalized mentorship from top performers. Your first session is just a few clicks away.
            </p>
            <Link href="/book" className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#F29440] hover:bg-[#E88935] text-white font-bold transition-colors">
              Browse Sessions <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
