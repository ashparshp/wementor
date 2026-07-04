"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Video } from "lucide-react";
import Link from "next/link";

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const allBookings = [
    { id: "BKG-8891", student: "Rahul Sharma", sessionTitle: "NEET Preparation Guide for Freshers", duration: "1 hour", date: "Oct 12, 2024", time: "10:00 AM", amount: "₹2,500", status: "Confirmed", link: "meet.google.com/abc" },
    { id: "BKG-8890", student: "Sneha Patel", sessionTitle: "Mock Interview & Feedback", duration: "45 mins", date: "Oct 11, 2024", time: "02:30 PM", amount: "₹500", status: "Pending", link: null },
    { id: "BKG-8889", student: "Amit Kumar", sessionTitle: "Resume Review Deep Dive", duration: "30 mins", date: "Oct 10, 2024", time: "11:00 AM", amount: "₹300", status: "Completed", link: "meet.google.com/xyz" },
    { id: "BKG-8888", student: "Priya Singh", sessionTitle: "Career Transition Strategy", duration: "1 hour", date: "Oct 09, 2024", time: "04:00 PM", amount: "₹6,000", status: "Confirmed", link: "meet.google.com/def" },
    { id: "BKG-8887", student: "Vikas Verma", sessionTitle: "Mock Interview & Feedback", duration: "45 mins", date: "Oct 08, 2024", time: "01:00 PM", amount: "₹500", status: "Cancelled", link: null },
  ];

  // Client-side filtering simulation
  const filteredBookings = allBookings.filter(b => {
    const matchesSearch = b.student.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Confirmed": return "bg-emerald-100 text-emerald-700";
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Completed": return "bg-blue-100 text-blue-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings by student or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F29440]/20 focus:border-[#F29440] transition-colors"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === "All" ? "Filter" : statusFilter}
          </button>
          
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 py-2">
              {["All", "Confirmed", "Pending", "Completed", "Cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${statusFilter === status ? 'text-[#F29440] font-semibold' : 'text-gray-700'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="overflow-x-auto lg:overflow-visible rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider rounded-tl-2xl">Booking ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Session</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Meeting Link</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111827]">{booking.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563] font-medium">{booking.student}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{booking.sessionTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{booking.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                    {booking.date} <span className="text-gray-400">at</span> {booking.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.link ? (
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition-colors">
                        <Video className="w-3.5 h-3.5" />
                        Copy Link
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === booking.id ? null : booking.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer outline-none"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {/* Actions Dropdown */}
                      {activeDropdown === booking.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
                          <Link href={`/dashboard/bookings/${booking.id}`} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors border-b border-gray-100">View Details</Link>
                          <button className="w-full text-left px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 font-medium transition-colors border-b border-gray-100">Mark Complete</button>
                          <button className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors">Cancel Booking</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No bookings found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
