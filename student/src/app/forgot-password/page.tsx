"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fetchApi("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute inset-0 bg-[#EA8A2F]/5 blur-3xl -z-10 rounded-full w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-md w-full text-center space-y-6 bg-gradient-to-b from-[#FFFFFF] to-[#FFF9F3] p-8 rounded-3xl border border-[#EA8A2F]/12 shadow-[0_20px_45px_rgba(185,120,40,0.08),0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
            <Mail className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="mt-2 text-[#6B7280]">
              We've sent a password reset link to <span className="font-medium text-gray-900">{email}</span>.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 font-semibold text-[#EA8A2F] hover:text-[#D97706] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute inset-0 bg-[#EA8A2F]/5 blur-3xl -z-10 rounded-full w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 bg-gradient-to-b from-[#FFFFFF] to-[#FFF9F3] p-8 rounded-3xl border border-[#EA8A2F]/12 shadow-[0_20px_45px_rgba(185,120,40,0.08),0_4px_12px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-3 text-center text-sm text-[#6B7280]">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A08D7C]">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#EADBCB] rounded-xl focus:ring-4 focus:ring-[#EA8A2F]/12 focus:border-[#EA8A2F] transition-colors bg-[#FFF8F1] text-sm placeholder-[#9CA3AF] outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className="mt-2 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_10px_25px_rgba(17,24,39,0.18)] text-sm font-bold text-[#FFFFFF] bg-[#111827] hover:bg-[#1F2937] focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
            
            <div className="mt-4 text-center">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#EA8A2F] hover:text-[#D97706] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to log in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
