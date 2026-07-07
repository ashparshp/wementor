"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Calendar, Clock, Star, User, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface Plan {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  duration_minutes: number;
}

interface Mentor {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  avg_rating: number;
  plans?: Plan[];
}

export default function BookingPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("10:00");
  const [coupon, setCoupon] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all mentors to populate the selection
    fetchApi<{ data: Mentor[] }>("/mentors?per_page=50")
      .then((res) => setMentors(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // When a mentor is selected, we need to fetch their details to get their plans
  const handleMentorSelect = async (mentorId: string) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (!mentor) return;
    
    setSelectedMentor(mentor);
    setSelectedPlan(null); // Reset plan selection
    setError(null);
    
    try {
      const res = await fetchApi<{ data: Mentor }>(`/mentors/${mentorId}`);
      setSelectedMentor(res.data);
    } catch (err) {
      console.error("Failed to load mentor details");
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !selectedPlan || !date || !time) {
      setError("Please fill in all required fields (Mentor, Plan, Date, Time).");
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      // In a real app we'd need the student's ID (or they'd be logged in).
      // Since we removed login for this simplified flow, we'd normally do a guest checkout
      // or prompt for email. The backend requires auth. We'll simulate auth failure if not logged in.
      
      const payload: any = {
        mentor_id: selectedMentor.id,
        plan_id: selectedPlan.id,
        session_date: date,
        start_time: time,
      };
      if (coupon) payload.coupon_code = coupon;

      // Note: Backend requires auth for bookings. We might hit a 401 here if no token exists.
      await fetchApi("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setBookingSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please ensure you are logged in.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F29440]"></div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Booking Confirmed!</h1>
        <p className="text-xl text-gray-600 mb-8">Your session with {selectedMentor?.name} has been successfully scheduled.</p>
        <button onClick={() => window.location.href="/"} className="bg-[#111827] text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-colors">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900">Book a Session</h1>
        <p className="text-gray-600 mt-2">Select a mentor and schedule your 1-on-1 mentorship session.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-medium text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleBooking} className="space-y-10">
          
          {/* Step 1: Select Mentor */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-[#F29440] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span> 
              Select a Mentor
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mentors.map(mentor => (
                <div 
                  key={mentor.id}
                  onClick={() => handleMentorSelect(mentor.id)}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${selectedMentor?.id === mentor.id ? 'border-[#F29440] bg-[#FDF1E9]' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-3">
                    {mentor.avatar_url ? (
                      <Image src={mentor.avatar_url} alt={mentor.name} width={40} height={40} className="rounded-full w-10 h-10 object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">{mentor.name.charAt(0)}</div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{mentor.name}</p>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#F29440]">
                        <Star className="w-3 h-3 fill-[#F29440]" /> {mentor.avg_rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Plan */}
          {selectedMentor && selectedMentor.plans && selectedMentor.plans.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-[#F29440] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span> 
                Choose a Plan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedMentor.plans.map(plan => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${selectedPlan?.id === plan.id ? 'border-[#F29440] bg-[#FDF1E9]' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{plan.title}</h4>
                      <span className="font-black text-gray-900">₹{(plan.price_paise/100).toFixed(0)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Clock className="w-4 h-4" /> {plan.duration_minutes} minutes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {selectedPlan && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-[#F29440] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span> 
                Schedule & Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Select Date</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F29440]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Select Time</label>
                  <input 
                    type="time" 
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F29440]" 
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Coupon Code (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Got a discount code?"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F29440]" 
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-[#111827] hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
                >
                  {bookingLoading ? "Processing..." : `Confirm Booking - ₹${(selectedPlan.price_paise/100).toFixed(0)}`}
                </button>
                <p className="text-center text-xs text-gray-500 mt-4">By booking, you agree to our Terms of Service.</p>
              </div>

            </div>
          )}

        </form>
      </div>
    </div>
  );
}
