"use client";

import { ArrowLeft, Mail, Calendar, MapPin, Clock, BookOpen, Star, MoreHorizontal, Award, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function MentorDetailsPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMentor() {
      try {
        const res = await fetchApi<{ data: Mentor[] }>("/admin/mentors?per_page=100");
        const allMentors = res.data || [];
        const found = allMentors.find((m) => m.user_id === id || m.id === id);
        setMentor(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadMentor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F29440]"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">Mentor Not Found</h2>
        <p className="text-gray-500 mt-2">The requested mentor could not be found.</p>
        <Link href="/dashboard/mentors" className="mt-4 inline-block text-[#F29440] hover:underline">
          Back to Mentors
        </Link>
      </div>
    );
  }

  const getStatusLabel = (sessions: number) => {
    if (sessions > 50) return "Active";
    if (sessions > 10) return "Growing";
    return "New";
  };

  const getStatusStyle = (sessions: number) => {
    if (sessions > 50) return "bg-emerald-100 text-emerald-700";
    if (sessions > 10) return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-700";
  };

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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(mentor.total_sessions)}`}>
              {getStatusLabel(mentor.total_sessions)}
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
              
              <div className="flex items-center gap-2 mt-4 text-[#4B5563]">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{mentor.email}</span>
              </div>
              {mentor.phone && (
                <div className="flex items-center gap-2 mt-2 text-[#4B5563]">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{mentor.phone}</span>
                </div>
              )}
              
              <div className="mt-8 pt-8 border-t border-[#E5E7EB] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(mentor.total_sessions)}`}>
                    {getStatusLabel(mentor.total_sessions)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#F29440] text-[#F29440]" />
                    <span className="text-sm font-bold text-[#111827]">{mentor.avg_rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Sessions</span>
                  <span className="text-sm font-bold text-[#111827]">{mentor.total_sessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Reviews</span>
                  <span className="text-sm font-bold text-[#111827]">{mentor.total_reviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Joined</span>
                  <span className="text-sm font-medium text-[#111827]">
                    {new Date(mentor.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Bio & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <h3 className="text-xl font-bold text-[#111827] mb-4">About Mentor</h3>
            <p className="text-[#4B5563] text-sm leading-relaxed">
              {mentor.bio || "No bio provided yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
