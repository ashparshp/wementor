"use client";

import { useState } from "react";
import { Ticket, Copy, CheckCircle2 } from "lucide-react";

export default function CouponsPage() {
  const [studentId, setStudentId] = useState("");
  const [discount, setDiscount] = useState("50");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedCoupon(null);
    setCopied(false);

    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      // Generate a random string
      const code = "WM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedCoupon(code);
    }, 1000);
  };

  const copyToClipboard = () => {
    if (generatedCoupon) {
      navigator.clipboard.writeText(generatedCoupon);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FDF1E9] to-white px-8 py-8 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <Ticket className="w-6 h-6 text-[#F29440]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">Generate Coupon</h2>
              <p className="text-[#6B7280] text-sm mt-1">Create a one-time use discount code for a specific student.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#374151]" htmlFor="studentId">
                Student UUID
              </label>
              <input
                id="studentId"
                type="text"
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1f2937] text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F29440]/20 focus:border-[#F29440] transition-colors"
              />
              <p className="text-xs text-gray-500">The coupon will only be valid for this specific user account.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#374151]" htmlFor="discount">
                Discount Percentage (%)
              </label>
              <div className="relative">
                <input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#1f2937] text-sm focus:outline-none focus:ring-2 focus:ring-[#F29440]/20 focus:border-[#F29440] transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">
                  %
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 bg-[#F29440] hover:bg-[#E88935] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Generate Coupon Code"
                )}
              </button>
            </div>
          </form>

          {/* Result Area */}
          {generatedCoupon && (
            <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                  Coupon Generated Successfully
                </div>
                <p className="text-emerald-600 text-sm">
                  This code is locked to student <span className="font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{studentId}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="bg-white px-6 py-3 rounded-xl border-2 border-emerald-200 border-dashed text-xl font-mono font-bold text-emerald-800 tracking-wider flex-1 text-center">
                  {generatedCoupon}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="p-3 bg-white hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors border border-emerald-200 shrink-0"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
