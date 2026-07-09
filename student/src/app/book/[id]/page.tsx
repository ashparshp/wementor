"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Calendar, Clock, Star, ShieldCheck, Tag, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  addDays,
  addHours,
  addMonths,
  subMonths,
  format,
  getDay,
  startOfDay,
  parseISO
} from "date-fns";

interface AvailabilitySlot {
  id: string;
  slot_type: "recurring" | "fixed";
  day_of_week?: number;
  specific_date?: string;
  start_time: string;
  end_time: string;
}

interface Plan {
  id: string;
  mentor_id: string;
  title: string;
  description: string;
  category: string;
  price_paise: number;
  duration_minutes: number;
  min_booking_notice_hours: number;
  max_booking_advance_days: number;
  availability: AvailabilitySlot[];
}

interface Mentor {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  avg_rating: number;
}

export default function SessionDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [plan, setPlan] = useState<Plan | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");
  const [fetchingTimes, setFetchingTimes] = useState(false);
  const [bookingStep, setBookingStep] = useState<"date" | "time">("date");
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDateBookable = (dateToCheck: Date) => {
    if (!plan) return false;
    
    const now = new Date();
    const minNoticeDate = addHours(now, plan.min_booking_notice_hours || 0);
    const maxBookingDate = addDays(now, plan.max_booking_advance_days || 60);

    if (isBefore(dateToCheck, startOfDay(minNoticeDate))) return false;
    if (isAfter(dateToCheck, maxBookingDate)) return false;

    const dayOfWeek = getDay(dateToCheck);
    const dateString = format(dateToCheck, "yyyy-MM-dd");

    return plan.availability?.some(slot => {
      if (slot.slot_type === "recurring" && slot.day_of_week === dayOfWeek) {
        return true;
      }
      if (slot.slot_type === "fixed" && slot.specific_date && slot.specific_date.startsWith(dateString)) {
        return true;
      }
      return false;
    }) || false;
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const cloneDay = day;
      const bookable = isDateBookable(cloneDay);
      const isSelected = date === format(cloneDay, "yyyy-MM-dd");
      const isCurrentMonth = isSameMonth(cloneDay, monthStart);

      days.push(
        <button
          key={cloneDay.toString()}
          type="button"
          disabled={!bookable || !isCurrentMonth}
          onClick={() => {
            setDate(format(cloneDay, "yyyy-MM-dd"));
            setTime("");
            setBookingStep("time");
          }}
          className={`h-10 w-full flex items-center justify-center rounded-xl text-sm font-medium transition-colors
            ${!isCurrentMonth ? "text-transparent" : ""}
            ${isSelected ? "bg-[#F29440] text-white shadow-md" : ""}
            ${!isSelected && bookable && isCurrentMonth ? "bg-white text-gray-900 hover:bg-[#FDF1E9] hover:text-[#F29440] border border-gray-100" : ""}
            ${!isSelected && !bookable && isCurrentMonth ? "text-gray-300 cursor-not-allowed" : ""}
          `}
        >
          {isCurrentMonth ? format(cloneDay, "d") : ""}
        </button>
      );
      day = addDays(day, 1);
    }

    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-600 border border-transparent hover:border-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-gray-900">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button 
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-600 border border-transparent hover:border-gray-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Fetch plan details
    fetchApi<Plan>(`/plans/${id}`)
      .then(p => {
        setPlan(p);
        // Then fetch mentor details
        return fetchApi<Mentor>(`/mentors/${p.mentor_id}`);
      })
      .then(m => {
        setMentor(m);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load session details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (date && plan) {
      // Fetch available times for the selected date
      setFetchingTimes(true);
      fetchApi<string[]>(`/plans/${plan.id}/slots?date=${date}`)
        .then(times => setAvailableTimes(times || []))
        .catch(() => setAvailableTimes([]))
        .finally(() => setFetchingTimes(false));
    } else {
      setAvailableTimes([]);
      setTime("");
    }
  }, [date, plan]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !date || !time) {
      setError("Please select a date and time.");
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      const payload: any = {
        plan_id: plan.id,
        date: date,
        start_time: time,
      };
      if (coupon) payload.coupon_code = coupon;

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

  if (!plan || !mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <button onClick={() => router.push('/book')} className="text-[#F29440] font-semibold hover:underline">
            Go back to sessions
          </button>
        </div>
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
        <p className="text-xl text-gray-600 mb-8">Your session with {mentor.name} has been successfully scheduled.</p>
        <button onClick={() => window.location.href="/dashboard/bookings"} className="bg-[#111827] text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-colors">
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => router.push('/book')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-semibold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Sessions
      </button>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-medium text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Session Details & Mentor Profile */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#FDF1E9] text-[#F29440] text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
                  {plan.category}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
                  <Clock className="w-4 h-4" /> {plan.duration_minutes} min
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-[#111827] mb-8 leading-tight">
                {plan.title}
              </h1>

              {/* Rich text description */}
              <div className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-a:text-[#F29440]">
                <div dangerouslySetInnerHTML={{ __html: plan.description }} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl border border-gray-200 p-8 md:p-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">About your mentor</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="shrink-0">
                {mentor.avatar_url ? (
                  <Image src={mentor.avatar_url} alt={mentor.name} width={100} height={100} className="rounded-full w-24 h-24 object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">{mentor.name.charAt(0)}</div>
                )}
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{mentor.name}</h4>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-[#FDF1E9] text-[#F29440] px-2 py-1 rounded font-bold text-sm">
                    <Star className="w-4 h-4 fill-[#F29440]" /> {mentor.avg_rating.toFixed(1)}
                  </div>
                  <span className="text-sm font-semibold text-gray-500">Avg. Rating</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {mentor.bio || "This mentor is ready to help you achieve your goals."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8 sticky top-24">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider block mb-1">Session Price</span>
              <div className="text-4xl font-black text-[#111827]">
                ₹{(plan.price_paise/100).toFixed(0)}
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-6">
              
              {bookingStep === "date" ? (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <label className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#F29440]" /> Select Date
                  </label>
                  {renderCalendar()}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F29440]" /> Time Slots
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setBookingStep("date")}
                      className="text-xs font-bold text-[#6C63FF] hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Change Date
                    </button>
                  </div>
                  
                  {fetchingTimes ? (
                    <div className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-xl border border-gray-100">Loading available slots...</div>
                  ) : availableTimes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTime(t)}
                          className={`py-3 rounded-lg text-sm font-bold border transition-all ${
                            time === t 
                              ? 'bg-[#FDF1E9] border-[#F29440] text-[#F29440] shadow-sm' 
                              : 'bg-white border-gray-200 text-gray-700 hover:border-[#F29440] hover:text-[#F29440]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100 font-medium text-center">
                      No available time slots on this date.
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <label className="text-sm font-bold text-gray-900">Coupon Code (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Enter discount code"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F29440] transition-all uppercase" 
                />
              </div>

              <button 
                type="submit"
                disabled={bookingLoading || !time}
                className="w-full bg-[#111827] hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:scale-100 mt-8"
              >
                {bookingLoading ? "Processing..." : "Confirm Booking"}
              </button>
              
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
