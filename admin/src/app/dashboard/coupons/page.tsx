"use client";

import { useState, useEffect } from "react";
import { Ticket, Copy, CheckCircle2, User, Percent, Sparkles, Clock, Search } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface CouponItem {
  id: string;
  code: string;
  student_id: string;
  student_name: string;
  student_email: string;
  discount_percentage: number;
  is_used: boolean;
  expires_at?: string;
  created_at?: string;
}

export default function CouponsPage() {
  const [studentId, setStudentId] = useState("");
  const [discount, setDiscount] = useState("50");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCoupons = () => {
    fetchApi<{ data: CouponItem[] }>("/admin/coupons?per_page=100")
      .then((res) => setCoupons(res.data || []))
      .catch(() => setCoupons([]))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedCoupon(null);
    setCopied(false);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        student_id: studentId,
        discount_percentage: parseInt(discount),
      };
      if (expiresInDays && parseInt(expiresInDays) > 0) {
        body.expires_in_days = parseInt(expiresInDays);
      }

      const res = await fetchApi<{ data?: { code: string }; code?: string }>("/admin/coupons", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setGeneratedCoupon(res.data?.code || res.code || null);
      loadCoupons();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate coupon";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCoupon) {
      navigator.clipboard.writeText(generatedCoupon);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Generation Form */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FDF1E9] to-white px-8 py-8 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-[#F29440]/20">
                  <Sparkles className="w-6 h-6 text-[#F29440]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#111827]">Generate Coupon</h2>
                  <p className="text-[#6B7280] text-sm mt-1">Create a one-time use discount code mapped to a specific student.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleGenerate} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#374151] uppercase tracking-wider" htmlFor="studentId">
                    Student UUID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="studentId"
                      type="text"
                      placeholder="e.g. 550e8400-e29b..."
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-300 bg-white text-[#1f2937] text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F29440]/30 focus:border-[#F29440] transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium pt-1">This coupon will be strictly locked to this account.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#374151] uppercase tracking-wider" htmlFor="discount">
                      Discount %
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Percent className="w-5 h-5" />
                      </div>
                      <input
                        id="discount"
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-300 bg-white text-[#1f2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#F29440]/30 focus:border-[#F29440] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#374151] uppercase tracking-wider" htmlFor="expires">
                      Expires In (Days)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <input
                        id="expires"
                        type="number"
                        min="0"
                        value={expiresInDays}
                        onChange={(e) => setExpiresInDays(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-300 bg-white text-[#1f2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#F29440]/30 focus:border-[#F29440] transition-all"
                        placeholder="0 = never"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full bg-[#F29440] hover:bg-[#E88935] text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm hover:shadow-md"
                  >
                    {isGenerating ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      "Generate Secure Coupon"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Live Ticket Preview & Result */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center items-center">
          
          <div className="w-full max-w-sm relative">
            
            {/* The Ticket Graphic */}
            <div className={`relative bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${generatedCoupon ? 'scale-105 shadow-[#F29440]/20' : 'scale-100'}`}>
              
              {/* Notches */}
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-[#F9FAFB] rounded-full transform -translate-y-1/2 z-10"></div>
              <div className="absolute top-1/2 -right-4 w-8 h-8 bg-[#F9FAFB] rounded-full transform -translate-y-1/2 z-10"></div>
              
              {/* Dashed Line */}
              <div className="absolute top-1/2 left-4 right-4 h-px border-t-2 border-dashed border-gray-600/50 transform -translate-y-1/2"></div>

              {/* Top Half */}
              <div className="p-8 pb-10 text-center relative">
                <Ticket className="w-8 h-8 text-[#F29440] mx-auto mb-4 opacity-80" />
                <h3 className="text-gray-400 text-sm font-semibold tracking-widest uppercase mb-1">WeMentor Pass</h3>
                <div className="text-5xl font-black text-white tracking-tighter">
                  {discount || "0"}% <span className="text-2xl font-bold text-gray-400">OFF</span>
                </div>
              </div>

              {/* Bottom Half */}
              <div className="p-8 pt-10 bg-[#252525]">
                {generatedCoupon ? (
                  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Secret Code</p>
                      <div className="bg-black/50 border border-gray-700 rounded-xl py-3 px-4 flex items-center justify-between group cursor-pointer" onClick={copyToClipboard}>
                        <span className="font-mono text-xl font-bold text-[#F29440] tracking-widest">{generatedCoupon}</span>
                        {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Locked to ID</p>
                      <p className="text-xs font-mono text-gray-300 truncate opacity-80">{studentId || "Unknown"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[120px] flex items-center justify-center opacity-40">
                    <p className="text-sm font-medium text-gray-400 text-center">Fill out the form to<br/>generate a unique code.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Success Toast */}
            {copied && (
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Copied to clipboard!
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Coupons History List */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-lg font-bold text-[#111827]">All Coupons</h3>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code, student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F29440] focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                <th className="px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-center">Discount</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loadingList ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F29440] mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-bold text-[#F29440]">{coupon.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{coupon.student_name}</p>
                        <p className="text-xs text-[#6B7280]">{coupon.student_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDF1E9] text-[#F29440]">
                        {coupon.discount_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        coupon.is_used
                          ? "bg-gray-100 text-gray-500"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {coupon.is_used ? "Used" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                      {formatDate(coupon.expires_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                      {formatDate(coupon.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
