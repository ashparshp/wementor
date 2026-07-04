"use client";

import { ArrowLeft, User, CreditCard, Calendar, Video, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock booking data
const bookingData = {
  "BKG-8891": {
    id: "BKG-8891",
    student: { name: "Rahul Sharma", id: "USR-001", email: "rahul.s@example.com" },
    mentor: { name: "Dr. Alok Nath", id: "MNT-001" },
    sessionTitle: "NEET Preparation Guide for Freshers",
    duration: "1 hour",
    date: "Oct 12",
    time: "10:00 AM - 11:00 AM",
    status: "Confirmed",
    amount: "₹2,500",
    paymentId: "pay_xyz123",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "Student is looking for guidance on transitioning from frontend to full-stack development, specifically focusing on backend architecture with Node.js and Go."
  },
  "BKG-8890": {
    id: "BKG-8890",
    student: { name: "Sneha Patel", id: "USR-002", email: "sneha.p@example.com" },
    mentor: { name: "Priya Das", id: "MNT-002" },
    sessionTitle: "Mock Interview & Feedback",
    duration: "45 mins",
    date: "Oct 11",
    time: "02:30 PM - 03:30 PM",
    status: "Pending",
    amount: "₹500",
    paymentId: "pay_abc456",
    meetingLink: "",
    notes: "Preparing for a frontend developer interview at a product company."
  }
};

export default function BookingDetailsPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : "BKG-8891";
  
  // Fallback for demonstration
  const booking = bookingData[id as keyof typeof bookingData] || bookingData["BKG-8891"];

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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              booking.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
              booking.status === "Pending" ? "bg-amber-100 text-amber-700" :
              booking.status === "Completed" ? "bg-blue-100 text-blue-700" :
              "bg-red-100 text-red-700"
            }`}>
              {booking.status}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Top summary banner */}
        <div className="bg-[#FDF8F5] p-6 border-b border-[#E5E7EB] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Booking Reference</span>
            <h2 className="text-xl font-bold text-[#111827]">{booking.id}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-500">Session</span>
              <h3 className="text-lg font-bold text-[#F29440]">{booking.sessionTitle}</h3>
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
                      <Link href={`/dashboard/users/${booking.student.id}`} className="font-semibold text-[#111827] hover:text-[#F29440] transition-colors flex items-center gap-1">
                        {booking.student.name}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="w-full h-px bg-[#E5E7EB]"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Mentor</p>
                      <Link href={`/dashboard/mentors/${booking.mentor.id}`} className="font-semibold text-[#111827] hover:text-[#F29440] transition-colors flex items-center gap-1">
                        {booking.mentor.name}
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
                    <span className="font-bold text-[#111827]">{booking.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Transaction ID</span>
                    <span className="text-sm font-medium text-gray-900">{booking.paymentId}</span>
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
                    <span className="font-medium text-[#111827]">{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-[#111827]">{booking.time}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Video className="w-4 h-4 text-[#F29440]" /> 
                  Meeting Details
                </h3>
                {booking.meetingLink ? (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900 truncate max-w-[200px]">{booking.meetingLink}</span>
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">
                      Join Call
                    </button>
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
              "{booking.notes}"
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
