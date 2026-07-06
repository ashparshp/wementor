"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { 
  IndianRupee, 
  Users, 
  CalendarCheck, 
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";

export default function DashboardOverview() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetchApi<any>("/admin/stats"),
          fetchApi<any>("/admin/bookings?limit=5")
        ]);
        setStats(statsRes.data || statsRes);
        const bookingsData = bookingsRes.data || bookingsRes || [];
        setRecentBookings(Array.isArray(bookingsData) ? bookingsData.slice(0, 5) : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const metrics = [
    {
      title: "Total Revenue",
      value: stats ? `₹${(stats.total_revenue_paise / 100).toLocaleString()}` : "₹0",
      change: "+0%",
      isPositive: true,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Total Bookings",
      value: stats ? stats.total_bookings.toString() : "0",
      change: "+0%",
      isPositive: true,
      icon: CalendarCheck,
      color: "text-[#F29440]",
      bg: "bg-[#FDF1E9]",
    },
    {
      title: "Total Users",
      value: stats ? stats.total_users.toString() : "0",
      change: "+0%",
      isPositive: true,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Pending Plans",
      value: stats ? stats.pending_plans.toString() : "0",
      change: "0%",
      isPositive: false,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

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
    if (!status) return "";
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.bg}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${metric.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                {metric.change}
                <ArrowUpRight className={`w-4 h-4 ${!metric.isPositive && "rotate-90"}`} />
              </div>
            </div>
            <h3 className="text-[#6B7280] text-sm font-medium mb-1">{metric.title}</h3>
            <p className="text-2xl font-bold text-[#111827]">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">Recent Bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm font-semibold text-[#F29440] hover:text-[#E88935] transition-colors">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto rounded-b-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider rounded-tl-2xl">Booking ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {recentBookings.map((booking) => {
                const dateStr = booking.session_date ? new Date(booking.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";
                const displayId = booking.id ? `${booking.id.split('-')[0]}-${booking.id.split('-')[4]?.slice(0,4) || booking.id.slice(0,8)}` : "-";
                
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111827]">{displayId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{booking.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{booking.plan_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{dateStr}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111827]">-</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                        {formatStatus(booking.status)}
                      </span>
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
                          <button className="w-full text-left px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 font-medium transition-colors">Mark Complete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
