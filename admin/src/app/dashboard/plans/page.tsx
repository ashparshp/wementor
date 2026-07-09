"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import dynamic from "next/dynamic";
import { Plus, Edit3, Trash2, CalendarDays, DollarSign, Clock, X } from "lucide-react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function PlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("jee");
  const [pricePaise, setPricePaise] = useState(50000); // 500 INR
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [minBookingNoticeHours, setMinBookingNoticeHours] = useState(24);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any[]>("/plans/me");
      setPlans(res || []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan: any = null) => {
    if (plan) {
      setEditingPlan(plan);
      setTitle(plan.title);
      setDescription(plan.description || "");
      setCategory(plan.category);
      setPricePaise(plan.price_paise);
      setDurationMinutes(plan.duration_minutes);
      setMinBookingNoticeHours(plan.min_booking_notice_hours);
    } else {
      setEditingPlan(null);
      setTitle("");
      setDescription("");
      setCategory("jee");
      setPricePaise(50000);
      setDurationMinutes(60);
      setMinBookingNoticeHours(24);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    const body = {
      title,
      description,
      category,
      price_paise: Number(pricePaise),
      duration_minutes: Number(durationMinutes),
      min_booking_notice_hours: Number(minBookingNoticeHours),
    };

    try {
      if (editingPlan) {
        await fetchApi(`/plans/${editingPlan.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await fetchApi("/plans", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      handleCloseModal();
      loadPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to save plan.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session plan?")) return;
    try {
      await fetchApi(`/plans/${id}`, { method: "DELETE" });
      loadPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan.");
    }
  };

  if (!user || user.role !== "mentor") {
    return <div className="p-8 text-center text-gray-500">Only mentors can manage sessions.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#111827]">My Sessions</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F29440] hover:bg-[#E88935] text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Session
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E5E7EB] rounded-3xl">
          <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Yet</h3>
          <p className="text-gray-500 mb-6">Create your first session to start mentoring.</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2.5 bg-[#F29440] hover:bg-[#E88935] text-white rounded-xl font-medium transition-colors"
          >
            Create Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-2.5 py-1 bg-[#FDF1E9] text-[#F29440] text-xs font-semibold rounded-full uppercase">
                    {plan.category}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                    plan.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    plan.status === "pending_review" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {plan.status.replace("_", " ")}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-[#111827] mb-2 line-clamp-2">{plan.title}</h3>
                
                <div className="space-y-2 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{plan.duration_minutes} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>₹{(plan.price_paise / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-t border-[#E5E7EB] px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => handleOpenModal(plan)}
                  className="p-2 text-gray-500 hover:text-[#F29440] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E5E7EB]"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E5E7EB]"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative my-8">
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#111827] mb-6">
                {editingPlan ? "Edit Session" : "Create Session"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 block mb-2">Session Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#F29440] outline-none"
                      placeholder="e.g. JEE Advanced Strategy Session"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 block mb-2">Description (Rich Text)</label>
                    <div className="h-64 mb-12">
                      <ReactQuill 
                        theme="snow"
                        value={description} 
                        onChange={setDescription} 
                        className="h-48"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#F29440] outline-none"
                    >
                      <option value="jee">JEE</option>
                      <option value="neet">NEET</option>
                      <option value="gsoc">GSoC</option>
                      <option value="placements">Placements</option>
                      <option value="upsc">UPSC</option>
                      <option value="gate">GATE</option>
                      <option value="cat">CAT</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Price (in Paise, e.g. 50000 = ₹500)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={pricePaise}
                      onChange={e => setPricePaise(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#F29440] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      min={15}
                      max={180}
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#F29440] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Min Booking Notice (Hours)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={minBookingNoticeHours}
                      onChange={e => setMinBookingNoticeHours(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#F29440] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-3 bg-[#F29440] hover:bg-[#E88935] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : "Save Session"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
