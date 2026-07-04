"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, User as UserIcon, Bell } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  email_verified: boolean;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetchApi<any>("/admin/users");
        setAllUsers(res.data || res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = roleFilter === "All" || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case "active": return "bg-emerald-100 text-emerald-700";
      case "inactive": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, email or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#F29440] focus:border-transparent transition-all shadow-sm"
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto justify-center">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="overflow-x-auto rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider rounded-tl-2xl">User ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-center">Bookings</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredUsers.map((user) => {
                    const status = user.email_verified ? 'Active' : 'Pending';
                    const displayId = user.id ? user.id.slice(0,8) : "-";
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111827]">{displayId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FDF8F5] text-[#F29440] flex items-center justify-center font-bold text-sm uppercase">
                              {user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-[#111827]">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{formatDate(user.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-[#111827]">-</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative inline-block text-left">
                            <button 
                              onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer outline-none"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            
                            {/* Actions Dropdown */}
                            {activeDropdown === user.id && (
                              <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
                                <Link href={`/dashboard/users/${user.id}`} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors border-b border-gray-100">
                                  View Profile
                                </Link>
                                {status === "Active" ? (
                                  <button className="w-full text-left px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 font-medium transition-colors">Suspend User</button>
                                ) : (
                                  <button className="w-full text-left px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 font-medium transition-colors">Activate User</button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No users found matching your search.
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
