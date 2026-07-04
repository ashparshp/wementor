"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Star, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const mockMentors = [
  {
    id: "MNT-001",
    name: "Dr. Alok Nath",
    expertise: "Career Guidance",
    rating: 4.9,
    sessions: 142,
    status: "Available",
    image: "/images/mentor-placeholder.jpg"
  },
  {
    id: "MNT-002",
    name: "Priya Das",
    expertise: "Mock Interviews",
    rating: 4.8,
    sessions: 89,
    status: "Busy",
  },
  {
    id: "MNT-003",
    name: "Siddharth Jain",
    expertise: "Resume Review",
    rating: 4.7,
    sessions: 56,
    status: "Available",
  },
  {
    id: "MNT-004",
    name: "Neha Gupta",
    expertise: "IT Consulting",
    rating: 4.9,
    sessions: 210,
    status: "Offline",
  },
];

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredMentors = mockMentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Available": return "bg-emerald-100 text-emerald-700";
      case "Busy": return "bg-amber-100 text-amber-700";
      case "Offline": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, expertise or ID..." 
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
            <div className="overflow-x-auto lg:overflow-visible rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider rounded-tl-2xl">Mentor ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Expertise</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-center">Sessions</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right rounded-tr-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredMentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111827]">{mentor.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-sm">
                            {mentor.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-[#111827]">{mentor.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{mentor.expertise}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-[#F29440] text-[#F29440]" />
                          <span className="font-semibold text-[#111827]">{mentor.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-[#111827]">{mentor.sessions}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(mentor.status)}`}>
                          {mentor.status}
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
                              <Link href={`/dashboard/mentors/${mentor.id}`} className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors border-b border-gray-100">
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
