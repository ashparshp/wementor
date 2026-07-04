"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

interface Payment {
  id: string;
  booking_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  amount_paise: number;
  currency: string;
  status: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetchApi<any>("/admin/payments");
        setAllPayments(res.data || res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const filteredPayments = allPayments.filter(p => {
    const matchesSearch = p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === "All" || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case "captured": return "bg-emerald-100 text-emerald-700";
      case "failed": return "bg-red-100 text-red-700";
      case "refunded": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
            placeholder="Search by Payment ID or Student..."
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
              {["All", "Success", "Failed", "Refunded"].map((status) => (
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
        <div className="overflow-x-auto rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider rounded-tl-2xl">Payment ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Booking Ref</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredPayments.map((payment) => {
                const displayId = payment.id ? `${payment.id.split('-')[0]}-${payment.id.slice(0,8)}` : "-";
                const displayBookingId = payment.booking_id ? `${payment.booking_id.split('-')[0]}-${payment.booking_id.split('-')[4]?.slice(0,4) || payment.booking_id.slice(0,8)}` : "-";
                
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111827]">{displayId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                      <Link href={`/dashboard/bookings/${payment.booking_id}`} className="hover:text-[#F29440] transition-colors">{displayBookingId}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563] font-medium">{payment.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{payment.currency || "INR"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{formatDate(payment.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(payment.status)}`}>
                        {formatStatus(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-[#111827]">
                      <div className="flex items-center justify-end gap-1">
                        {payment.status.toLowerCase() === "refunded" ? (
                          <ArrowDownRight className="w-4 h-4 text-amber-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        )}
                        ₹{(payment.amount_paise / 100).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === payment.id ? null : payment.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer outline-none"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        
                        {/* Actions Dropdown */}
                        {activeDropdown === payment.id && (
                          <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
                            <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors border-b border-gray-100">View Receipt</button>
                            {payment.status.toLowerCase() !== "refunded" && (
                              <button className="w-full text-left px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 font-medium transition-colors">Process Refund</button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No payments found matching your filters.
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
