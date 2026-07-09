"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Video } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function MyBookings() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }

    const loadBookings = async () => {
      try {
        const data = await fetchApi<{ data: any[] }>("/bookings/me");
        if (data && data.data) {
          setBookings(data.data);
        }
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          My Bookings
        </h1>
        <p className="mt-2 text-[#6B7280]">
          Manage and view your upcoming and past mentoring sessions.
        </p>
      </header>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EA8A2F]/20"></div>
            <div className="h-4 bg-[#EADBCB] rounded w-32"></div>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#EADBCB] border-dashed p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FFF8F1] flex items-center justify-center text-[#A08D7C]">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No bookings yet</h3>
            <p className="text-[#6B7280] max-w-sm mt-1 mx-auto">
              Looks like you haven't scheduled any sessions.
            </p>
          </div>
          <Link
            href="/book"
            className="inline-block py-2.5 px-5 rounded-lg text-sm font-bold text-[#EA8A2F] bg-[#EA8A2F]/10 hover:bg-[#EA8A2F]/20 transition-all"
          >
            Find a Mentor
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-2xl border border-[#EADBCB] shadow-sm flex flex-col justify-between hover:border-[#EA8A2F]/30 transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>
                  <div className="text-[#6B7280] text-sm flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(booking.session_date).toLocaleDateString()} at {booking.start_time.substring(0, 5)}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {booking.plan_title} with {booking.mentor_name}
                </h3>
                <p className="text-[#6B7280] text-sm mb-4">
                  Topic/Notes: {booking.notes || 'General discussion'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-[#EADBCB] flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  {booking.payment_status === 'captured' ? 'Paid & Confirmed' : 'Pending Payment'}
                </span>
                {booking.google_meet_link && (
                  <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#EA8A2F] hover:text-[#D97706] transition-colors">
                    <Video size={16} />
                    Join Meeting
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
