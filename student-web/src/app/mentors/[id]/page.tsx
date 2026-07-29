"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Star, Clock, Video, ShieldCheck, CheckCircle2, Calendar } from "lucide-react";

interface Plan {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  duration_minutes: number;
}

interface MentorDetail {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  about?: string;
  avg_rating: number;
  total_reviews: number;
  total_sessions: number;
  plans?: Plan[];
}

export default function MentorProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [mentor, setMentor] = useState<MentorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<{ data: MentorDetail }>(`/mentors/${resolvedParams.id}`)
      .then((res) => {
        setMentor(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F29440]"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Mentor not found</h2>
          <Link href="/mentors" className="text-[#F29440] hover:underline mt-2 inline-block">Back to all mentors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Col: Profile info */}
        <div className="lg:w-2/3 space-y-10">
          
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="w-32 h-32 shrink-0">
              {mentor.avatar_url ? (
                <Image src={mentor.avatar_url} alt={mentor.name} width={128} height={128} className="w-full h-full rounded-3xl object-cover shadow-lg" />
              ) : (
                <div className="w-full h-full rounded-3xl bg-[#111827] shadow-lg flex items-center justify-center text-4xl font-bold text-white">
                  {mentor.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{mentor.name}</h1>
                <p className="text-xl text-gray-600 mt-2 font-medium">{mentor.bio || "Professional Mentor"}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {mentor.avg_rating.toFixed(1)} ({mentor.total_reviews} reviews)
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100">
                  <Video className="w-4 h-4" />
                  {mentor.total_sessions} Sessions completed
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
              {mentor.about ? (
                <p>{mentor.about}</p>
              ) : (
                <p>I am a seasoned professional with years of experience in my field. I am passionate about helping others achieve their career goals through personalized mentorship.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">What to expect</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="bg-[#FDF1E9] p-2 rounded-xl text-[#F29440]"><ShieldCheck className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-bold text-gray-900">Actionable Advice</h4>
                  <p className="text-sm text-gray-500 mt-1">Leave every session with a clear, step-by-step action plan.</p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-bold text-gray-900">Honest Feedback</h4>
                  <p className="text-sm text-gray-500 mt-1">Direct and constructive feedback on your work and approach.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Booking/Plans */}
        <div className="lg:w-1/3">
          <div className="sticky top-28 space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Mentorship Plans</h3>
            
            {!mentor.plans || mentor.plans.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 text-center">
                <p className="text-gray-500 text-sm">No active plans available right now.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mentor.plans.map((plan) => (
                  <div key={plan.id} className="bg-white border-2 border-gray-100 hover:border-[#F29440] rounded-3xl p-6 transition-colors shadow-sm group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-900">{plan.title}</h4>
                      <span className="font-black text-xl text-gray-900">₹{(plan.price_paise / 100).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2">{plan.description}</p>
                    
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 mb-6 bg-gray-50 px-4 py-3 rounded-xl">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {plan.duration_minutes} minutes video call
                    </div>

                    <Link href={`/mentors/${mentor.id}/book/${plan.id}`} className="block w-full bg-[#111827] hover:bg-[#F29440] text-white text-center py-3.5 rounded-xl font-semibold transition-colors shadow-sm">
                      Select Plan
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
