"use client";

import { ArrowLeft, Mail, Calendar, MapPin, Clock, BookOpen, Star, MoreHorizontal, Award, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock mentor data
const mentorData = {
  "MNT-001": {
    name: "Dr. Alok Nath",
    expertise: "Career Guidance",
    email: "alok.nath@example.com",
    joined: "Jan 12, 2023",
    phone: "+91 98765 12345",
    location: "Bangalore, India",
    rating: 4.9,
    sessions: 142,
    status: "Available",
    bio: "Former Google Engineering Manager with 15+ years of experience in distributed systems and technical leadership. Passionate about helping junior engineers level up their careers.",
    pricing: "₹2,500 / session",
    recentActivity: [
      { id: "BKG-8891", student: "Rahul Sharma", type: "Mentorship", date: "Oct 12, 2024", status: "Confirmed" },
      { id: "BKG-8872", student: "Sneha Patel", type: "Resume Review", date: "Oct 10, 2024", status: "Completed" },
    ]
  }
};

export default function MentorDetailsPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : "MNT-001";
  
  // Using a fallback for demonstration if ID not found
  const mentor = mentorData[id as keyof typeof mentorData] || mentorData["MNT-001"];

  return (
    <div className="space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/mentors" 
          className="p-2 rounded-xl bg-white border border-[#E5E7EB] text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#111827]">Mentor Profile</h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
              {id}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="h-32 bg-[#111827] relative">
              <div className="absolute -bottom-10 left-8">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center bg-gray-900">
                  <span className="text-4xl font-bold text-white">{mentor.name.charAt(0)}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-16 pb-8 px-8">
              <h2 className="text-2xl font-bold text-[#111827]">{mentor.name}</h2>
              <div className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDF8F5] text-[#F29440] border border-[#F29440]/20">
                {mentor.expertise}
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-[#4B5563]">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{mentor.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[#4B5563]">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{mentor.location}</span>
              </div>
              
              <div className="mt-8 pt-8 border-t border-[#E5E7EB] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    {mentor.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#F29440] text-[#F29440]" />
                    <span className="text-sm font-bold text-[#111827]">{mentor.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Sessions</span>
                  <span className="text-sm font-bold text-[#111827]">{mentor.sessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Standard Rate</span>
                  <span className="text-sm font-bold text-[#111827]">{mentor.pricing}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button className="flex-1 bg-[#111827] hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  Contact Mentor
                </button>
                <button className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <h3 className="text-xl font-bold text-[#111827] mb-4">About Mentor</h3>
            <p className="text-[#4B5563] text-sm leading-relaxed mb-8">{mentor.bio}</p>

            <h3 className="text-xl font-bold text-[#111827] mb-6 border-t border-[#E5E7EB] pt-8">Upcoming & Recent Sessions</h3>
            
            <div className="space-y-4">
              {mentor.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-[#E5E7EB] hover:border-[#111827]/30 hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-[#111827] group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#111827]">{activity.student}</h4>
                        <span className="text-xs text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-md">{activity.id}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-[#4B5563]">
                        <span className="font-medium text-[#F29440]">{activity.type}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {activity.date}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      activity.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
                      activity.status === "Completed" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 border-2 border-dashed border-[#E5E7EB] rounded-2xl text-sm font-semibold text-gray-500 hover:text-[#111827] hover:border-[#111827] hover:bg-gray-50 transition-all">
              View Complete Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
