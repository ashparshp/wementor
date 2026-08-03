"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Check, X } from "lucide-react";

interface PendingPlan {
  id: string;
  title: string;
  description?: string;
  category: string;
  price_paise: number;
  duration_minutes: number;
  mentor_name: string;
  mentor_email: string;
  created_at: string;
}

export default function SessionReviewsPage() {
  const [plans, setPlans] = useState<PendingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchApi<{ data: PendingPlan[] }>("/admin/plans/pending?per_page=100")
      .then((res) => setPlans(res.data || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await fetchApi(`/admin/plans/${id}/approve`, { method: "POST" });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to approve");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason?.trim()) return;
    setActionId(id);
    try {
      await fetchApi(`/admin/plans/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to reject");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Session Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Approve mentor sessions before they go live</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F29440]" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500">
          No sessions pending review.
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#FDF1E9] text-[#F29440] text-xs font-bold rounded uppercase">
                      {plan.category}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{(plan.price_paise / 100).toFixed(0)} · {plan.duration_minutes} min
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    by {plan.mentor_name} ({plan.mentor_email})
                  </p>
                  {plan.description && (
                    <div
                      className="text-sm text-gray-600 mt-3 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: plan.description }}
                    />
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(plan.id)}
                    disabled={actionId === plan.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(plan.id)}
                    disabled={actionId === plan.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
