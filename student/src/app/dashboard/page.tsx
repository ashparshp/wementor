"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Video } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name.split(" ")[0]}! 👋
        </h1>
        <p className="mt-2 text-[#6B7280]">
          Ready to continue your learning journey?
        </p>
      </header>

      {/* Quick Actions & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Book a session card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#FFFFFF] to-[#FFF9F3] p-8 rounded-3xl border border-[#EA8A2F]/20 shadow-[0_20px_45px_rgba(185,120,40,0.08),0_4px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-xl font-bold text-gray-900">Need some guidance?</h3>
            <p className="text-[#6B7280] max-w-sm">
              Connect with expert mentors tailored to your goals. Book a 1-on-1 session to get personalized advice.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-bold text-[#FFFFFF] bg-[#111827] hover:bg-[#1F2937] transition-all shadow-[0_10px_25px_rgba(17,24,39,0.18)]"
            >
              Browse Mentors
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="hidden sm:block w-32 h-32 rounded-full bg-[#EA8A2F]/10 flex-shrink-0 flex items-center justify-center">
            <span className="text-5xl">🚀</span>
          </div>
        </div>

        {/* Small Stat Card */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#EADBCB] shadow-sm flex flex-col justify-center items-center text-center space-y-3 hover:border-[#EA8A2F]/30 transition-colors">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">0</h4>
            <p className="text-sm text-[#6B7280]">Sessions Completed</p>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
          <Link href="/dashboard/bookings" className="text-sm font-semibold text-[#EA8A2F] hover:text-[#D97706] transition-colors">
            View all
          </Link>
        </div>

        {/* Placeholder for no bookings */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#EADBCB] border-dashed p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FFF8F1] flex items-center justify-center text-[#A08D7C]">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No upcoming sessions</h3>
            <p className="text-[#6B7280] max-w-sm mt-1 mx-auto">
              You don't have any sessions scheduled right now. Book a mentor to get started!
            </p>
          </div>
          <Link
            href="/book"
            className="inline-block py-2.5 px-5 rounded-lg text-sm font-bold text-[#EA8A2F] bg-[#EA8A2F]/10 hover:bg-[#EA8A2F]/20 transition-all"
          >
            Find a Mentor
          </Link>
        </div>
      </section>
    </div>
  );
}
