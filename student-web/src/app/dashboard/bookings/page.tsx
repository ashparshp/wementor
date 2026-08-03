"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Star, Video } from "lucide-react";
import { fetchApi } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Tab = "upcoming" | "past";

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

function isPast(b: Booking) {
  return b.status === "completed" || (b.status === "confirmed" && sessionDateTime(b) < new Date());
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled_by_student: "bg-gray-100 text-gray-600",
  cancelled_by_mentor: "bg-gray-100 text-gray-600",
  no_show: "bg-red-100 text-red-700",
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");

  useEffect(() => {
    fetchApi<{ data: Booking[] }>("/bookings/me")
      .then((res) => setBookings(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { upcoming, past } = useMemo(() => {
    const up = bookings.filter(isUpcoming).sort((a, b) => sessionDateTime(a).getTime() - sessionDateTime(b).getTime());
    const pa = bookings.filter(isPast).sort((a, b) => sessionDateTime(b).getTime() - sessionDateTime(a).getTime());
    return { upcoming: up, past: pa };
  }, [bookings]);

  const displayed = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="My Bookings"
        subtitle="Manage and view your upcoming and past mentoring sessions."
      />

      <div className="flex gap-2 p-1 bg-white/60 rounded-xl border border-[#EADBCB] w-fit">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
              tab === t ? "bg-[#111827] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t} ({t === "upcoming" ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading your bookings..." />
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={tab === "upcoming" ? "No upcoming sessions" : "No past sessions"}
          description={
            tab === "upcoming"
              ? "Book a mentor to schedule your first session."
              : "Completed sessions will appear here."
          }
          actionLabel={tab === "upcoming" ? "Find a Mentor" : undefined}
          actionHref={tab === "upcoming" ? "/book" : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {displayed.map((booking) => (
            <div key={booking.id} className="card-surface p-5 sm:p-6 flex flex-col">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-700"}`}>
                  {booking.status.replace(/_/g, " ").toUpperCase()}
                </span>
                <div className="text-gray-500 text-sm flex items-center gap-1">
                  <Clock size={14} className="shrink-0" />
                  {new Date(booking.session_date).toLocaleDateString()} at {booking.start_time.substring(0, 5)}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {booking.plan_title}
              </h3>
              <p className="text-gray-500 text-sm mb-4">with {booking.mentor_name}</p>

              <div className="pt-4 mt-auto border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                {booking.google_meet_link && booking.status === "confirmed" && isUpcoming(booking) && (
                  <a
                    href={booking.google_meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#F29440] hover:text-[#E88935]"
                  >
                    <Video size={16} />
                    Join Meeting
                  </a>
                )}
                {booking.status === "completed" && (
                  <Link
                    href={`/dashboard/bookings/${booking.id}/review`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#6C63FF] hover:text-[#5850E5] ml-auto"
                  >
                    <Star size={16} />
                    Leave a Review
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
