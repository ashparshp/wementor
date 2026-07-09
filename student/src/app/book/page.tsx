"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Clock, Star, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  mentor_id: string;
  title: string;
  description: string;
  category: string;
  price_paise: number;
  duration_minutes: number;
}

interface Mentor {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  avg_rating: number;
}

interface EnrichedPlan extends Plan {
  mentor?: Mentor;
}

export default function BookingPage() {
  const router = useRouter();
  const [enrichedPlans, setEnrichedPlans] = useState<EnrichedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all plans and mentors concurrently
    Promise.all([
      fetchApi<{ data: Plan[] }>("/plans?per_page=50"),
      fetchApi<{ data: Mentor[] }>("/mentors?per_page=50")
    ])
    .then(([plansRes, mentorsRes]) => {
      const plans = plansRes.data || [];
      const mentors = mentorsRes.data || [];
      
      const stitched = plans.map(plan => {
        const mentor = mentors.find(m => m.user_id === plan.mentor_id);
        return { ...plan, mentor };
      });
      setEnrichedPlans(stitched);
    })
    .catch((err) => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F29440]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900">Discover Sessions</h1>
        <p className="text-gray-600 mt-2">Browse available mentorship sessions and book a time that works for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichedPlans.map(plan => (
          <div 
            key={plan.id}
            onClick={() => router.push(`/book/${plan.id}`)}
            className="cursor-pointer flex flex-col justify-between bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-[#FDF1E9] text-[#F29440] text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {plan.category}
                </span>
                <span className="font-black text-gray-900 ml-2">₹{(plan.price_paise/100).toFixed(0)}</span>
              </div>
              
              <h4 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2">{plan.title}</h4>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> {plan.duration_minutes} Minutes
                </span>
              </div>

              {/* Strip HTML tags from description for preview */}
              <p className="text-sm text-gray-600 mb-6 line-clamp-3">
                {plan.description.replace(/<[^>]+>/g, '')}
              </p>
            </div>
            
            {plan.mentor && (
              <div className="pt-4 mt-auto border-t border-gray-100 flex items-center gap-3">
                {plan.mentor.avatar_url ? (
                  <Image src={plan.mentor.avatar_url} alt={plan.mentor.name} width={40} height={40} className="rounded-full w-10 h-10 object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">{plan.mentor.name.charAt(0)}</div>
                )}
                <div>
                  <p className="font-bold text-gray-900 text-sm">{plan.mentor.name}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#F29440]">
                    <Star className="w-3 h-3 fill-[#F29440]" /> {plan.mentor.avg_rating.toFixed(1)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
