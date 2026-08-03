"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Check, X, Search } from "lucide-react";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  about: string;
  status: string;
  created_at: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const query = statusFilter ? `?status=${statusFilter}&per_page=100` : "?per_page=100";
    fetchApi<{ data: Application[] }>(`/admin/mentor-applications${query}`)
      .then((res) => setApplications(res.data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this application and create a mentor account?")) return;
    setActionId(id);
    try {
      await fetchApi(`/admin/mentor-applications/${id}/approve`, { method: "POST" });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to approve");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason (shown to applicant):");
    if (!reason?.trim()) return;
    setActionId(id);
    try {
      await fetchApi(`/admin/mentor-applications/${id}/reject`, {
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

  const filtered = applications.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Mentor Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve mentor applicants</p>
        </div>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", ""].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-[#F29440] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F29440]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F29440]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500">
          No applications found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{app.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      app.status === "pending" ? "bg-amber-100 text-amber-700" :
                      app.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{app.email} · {app.phone}</p>
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed">{app.about}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                {app.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(app.id)}
                      disabled={actionId === app.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      disabled={actionId === app.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
