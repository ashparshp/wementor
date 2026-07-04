"use client";

import { ArrowLeft, User, CreditCard, Calendar, Video, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

interface Booking {
  id: string;
  student_id: string;
  student_name: string;
  mentor_id: string;
  mentor_name: string;
  plan_title: string;
  start_time: string;
  end_time: string;
  session_date: string;
  status: string;
  google_meet_link?: string;
  created_at: string;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingIdStr = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await fetchApi<any>("/admin/bookings");
        const allBookings = res.data || res || [];
        const found = allBookings.find((b: any) => b.id === bookingIdStr);
        setBooking(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (bookingIdStr) {
      loadBooking();
    }
  }, [bookingIdStr]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading booking details...</div>;
  }

  if (!booking) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">Booking Not Found</h2>
        <p className="text-gray-500 mt-2">The requested booking could not be found.</p>
        <Link href="/dashboard/bookings" className="mt-4 inline-block text-[#F29440] hover:underline">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case "confirmed": return "bg-emerald-100 text-emerald-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "cancelled_by_student": 
      case "cancelled_by_mentor": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "-";
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0) return "-";
    if (diff === 60) return "1 hour";
    if (diff > 60) return `${Math.floor(diff/60)} hr ${diff%60} min`;
    return `${diff} mins`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTimeRange = (start: string, end: string) => {
    const formatTime = (timeStr: string) => {
      if (!timeStr) return "";
      const [h, m] = timeStr.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr = h % 12 || 12;
      return `${hr.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };
    if (!start || !end) return "-";
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/bookings" 
          className="p-2 rounded-xl bg-white border border-[#E5E7EB] text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#111827]">Booking Details</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}>
              {formatStatus(booking.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Top summary banner */}
        <div className="bg-[#FDF8F5] p-6 border-b border-[#E5E7EB] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Booking Reference</span>
            <h2 className="text-xl font-bold text-[#111827]">{booking.id.split('-')[0]}-{booking.id.split('-')[4]?.slice(0,4) || booking.id.slice(0,8)}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-500">Session</span>
              <h3 className="text-lg font-bold text-[#F29440]">{booking.plan_title}</h3>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student & Mentor Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <User className="w-4 h-4 text-[#F29440]" /> 
                  Participants
                </h3>
                <div className="p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Student</p>
                      <Link href={`/dashboard/users/${booking.student_id}`} className="font-semibold text-[#111827] hover:text-[#F29440] transition-colors flex items-center gap-1">
                        {booking.student_name}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="w-full h-px bg-[#E5E7EB]"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Mentor</p>
                      <Link href={`/dashboard/mentors/${booking.mentor_id}`} className="font-semibold text-[#111827] hover:text-[#F29440] transition-colors flex items-center gap-1">
                        {booking.mentor_name}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-[#F29440]" /> 
                  Payment Info
                </h3>
                <div className="p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Amount Paid</span>
                    <span className="font-bold text-[#111827]">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Transaction ID</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule & Notes */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-[#F29440]" /> 
                  Schedule
                </h3>
                <div className="p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB] space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-[#111827]">{formatDate(booking.session_date)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-[#111827]">{formatTimeRange(booking.start_time, booking.end_time)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Video className="w-4 h-4 text-[#F29440]" /> 
                  Meeting Details
                </h3>
                {booking.google_meet_link ? (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900 truncate max-w-[200px]">{booking.google_meet_link}</span>
                    <a href={booking.google_meet_link.startsWith('http') ? booking.google_meet_link : `https://${booking.google_meet_link}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">
                      Join Call
                    </a>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB] text-sm text-gray-500 italic">
                    Meeting link will be generated once confirmed.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="pt-8 border-t border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Student Notes</h3>
            <p className="text-gray-600 text-sm leading-relaxed p-4 bg-[#FDF8F5] rounded-2xl border border-[#F29440]/20">
              No additional notes provided.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-8 border-t border-[#E5E7EB] flex gap-4 justify-end">
            <button className="px-6 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              Cancel Booking
            </button>
            <button className="px-6 py-2.5 bg-[#111827] text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors shadow-sm">
              Reschedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
