"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Rocket, Video } from "lucide-react";
import { fetchApi } from "@/lib/api";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Booking {
  id: string;
  session_date: string;
  start_time: string;
  status: string;
  plan_title: string;
  mentor_name: string;
  google_meet_link?: string;
}

function sessionDateTime(b: Booking) {
  return new Date(`${b.session_date}T${b.start_time}`);
}

function isUpcoming(b: Booking) {
  return b.status === "confirmed" && sessionDateTime(b) >= new Date();
}

export default function DashboardOverview() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        /* ignore */
      }
    }

    fetchApi<{ data: Booking[] }>("/bookings/me")
      .then((res) => setBookings(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { upcoming, completedCount } = useMemo(() => {
    const upcomingList = bookings
      .filter(isUpcoming)
      .sort((a, b) => sessionDateTime(a).getTime() - sessionDateTime(b).getTime());
    const done = bookings.filter((b) => b.status === "completed").length;
    return { upcoming: upcomingList.slice(0, 3), completedCount: done };
  }, [bookings]);

  if (!user) return null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-gray-600">Ready to continue your learning journey?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 card-surface p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-br from-white to-[#FFF9F3]">
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-xl font-bold text-gray-900">Need some guidance?</h3>
            <p className="text-gray-600 max-w-sm text-sm">
              Connect with expert mentors tailored to your goals. Book a 1-on-1 session to get personalized advice.
            </p>
            <Link href="/book" className="btn-primary">
              Browse Mentors
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="hidden sm:flex w-28 h-28 rounded-2xl bg-[#F29440]/10 items-center justify-center shrink-0">
            <Rocket className="w-12 h-12 text-[#F29440]" />
          </div>
        </div>

        <div className="card-surface p-6 flex flex-col justify-center items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-gray-900">{completedCount}</h4>
            <p className="text-sm text-gray-500">Sessions Completed</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
          <Link href="/dashboard/bookings" className="text-sm font-semibold text-[#F29440] hover:text-[#E88935]">
            View all
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading bookings..." />
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming sessions"
            description="You don't have any sessions scheduled right now. Book a mentor to get started!"
            actionLabel="Find a Mentor"
            actionHref="/book"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((booking) => (
              <div key={booking.id} className="card-surface p-5 flex flex-col gap-3">
                <span className="self-start px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
                  CONFIRMED
                </span>
                <h3 className="font-bold text-gray-900 leading-snug">
                  {booking.plan_title}
                </h3>
                <p className="text-sm text-gray-500">with {booking.mentor_name}</p>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Clock className="w-4 h-4 shrink-0" />
                  {new Date(booking.session_date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at {booking.start_time.substring(0, 5)}
                </div>
                {booking.google_meet_link && (
                  <a
                    href={booking.google_meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto text-sm font-bold text-[#F29440] hover:underline flex items-center gap-1.5"
                  >
                    <Video className="w-4 h-4" /> Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
