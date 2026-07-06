"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, Star } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

interface Mentor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  avg_rating: number;
  total_reviews: number;
  total_sessions: number;
  created_at: string;
}

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<{ data: Mentor[] }>("/admin/mentors?per_page=100")
      .then((res) => {
        setMentors(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setMentors([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mentor.bio && mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusStyle = (sessions: number) => {
    if (sessions > 50) return "bg-emerald-100 text-emerald-700";
    if (sessions > 10) return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (sessions: number) => {
    if (sessions > 50) return "Active";
    if (sessions > 10) return "Growing";
    return "New";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F29440]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, email or bio..." 
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
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider rounded-tl-2xl">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-center">Sessions</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-center">Reviews</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredMentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-sm">
                            {mentor.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-[#111827]">{mentor.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{mentor.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-[#F29440] text-[#F29440]" />
                          <span className="font-semibold text-[#111827]">{mentor.avg_rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-[#111827]">{mentor.total_sessions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-[#111827]">{mentor.total_reviews}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(mentor.total_sessions)}`}>
                          {getStatusLabel(mentor.total_sessions)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === mentor.id ? null : mentor.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer outline-none"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          
                          {/* Actions Dropdown */}
                          {activeDropdown === mentor.id && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
                              <Link href={`/dashboard/mentors/${mentor.user_id}`} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors border-b border-gray-100">
                                View Profile
                              </Link>
                              <button className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors">Revoke Access</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredMentors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No mentors found matching your search.
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
