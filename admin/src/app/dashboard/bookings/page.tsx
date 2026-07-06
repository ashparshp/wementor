"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, Video } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

interface Booking {
  id: string;
  student_name: string;
  plan_title: string;
  start_time: string;
  end_time: string;
  session_date: string;
  status: string;
  google_meet_link?: string;
}

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetchApi<any>("/admin/bookings");
        const data = res.data || res || [];
        setAllBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const calculateDuration = (start: string, end: string) => {
    // If not properly formatted, return default
    if (!start || !end) return "-";
    // Basic calculation if start and end are "HH:MM"
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
    // dateStr format "2006-01-02"
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "-";
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  // Client-side filtering simulation
  const filteredBookings = allBookings.filter(b => {
    const matchesSearch = b.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "All" || b.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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

  const formatStatus = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all mentorship sessions</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F29440]/20 focus:border-[#F29440] text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors bg-white"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</div>
                {["All", "pending", "confirmed", "completed", "cancelled_by_student", "cancelled_by_mentor"].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${statusFilter === status ? 'bg-[#FDF8F5] text-[#F29440] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {formatStatus(status)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading bookings...</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 font-medium">Booking ID</th>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Session Title</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Schedule</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {booking.id.split('-')[0]}-{booking.id.split('-')[4]?.slice(0,4) || booking.id.slice(0,8)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{booking.student_name}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{booking.plan_title}</td>
                      <td className="px-6 py-4 text-gray-600">{calculateDuration(booking.start_time, booking.end_time)}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="font-medium text-gray-900">{formatDate(booking.session_date)}</div>
                        <div className="text-xs text-gray-500">{formatTime(booking.start_time)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                          {formatStatus(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.google_meet_link && booking.status.toLowerCase() === 'confirmed' && (
                            <a 
                              href={booking.google_meet_link.startsWith('http') ? booking.google_meet_link : `https://${booking.google_meet_link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Join Meeting"
                            >
                              <Video className="h-4 w-4" />
                            </a>
                          )}
                          <Link 
                            href={`/dashboard/bookings/${booking.id}`}
                            className="text-sm font-medium text-[#F29440] hover:text-[#e08432]"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No bookings found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
