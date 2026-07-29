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
      <div className="flex-grow flex items-center justify-center lg:justify-end py-8 px-4 sm:px-6 lg:pr-24 xl:pr-32 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-20">
          <img src="/images/bg-v2.png" alt="Background" className="object-cover object-left w-full h-full" />
          <div className="absolute inset-0 bg-white/20"></div>
        </div>

        <div className="max-w-md w-full text-center space-y-6 bg-gradient-to-b from-white/50 to-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/40 shadow-[0_8px_40px_rgb(0,0,0,0.08)] relative z-10">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 text-emerald-600">
            <Mail className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="mt-2 text-gray-600">
              We've sent your new password to <strong>{email}</strong>
            </p>
          </div>
          <div className="pt-4">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 font-semibold text-[#6C63FF] hover:text-[#5850E5] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center lg:justify-end py-8 px-4 sm:px-6 lg:pr-24 xl:pr-32 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <img src="/images/bg-v2.png" alt="Background" className="object-cover object-left w-full h-full" />
        <div className="absolute inset-0 bg-white/20"></div>
      </div>

      <div className="max-w-md w-full space-y-6 bg-gradient-to-b from-white/50 to-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-[0_8px_40px_rgb(0,0,0,0.08)] relative z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600 mb-6">
            Enter your email address and we'll send you your new password.
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-[#F29440]/30 focus:border-[#F29440] transition-colors bg-white text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className="mt-2 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#111827] hover:bg-black focus:outline-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
            
            <div className="mt-4 text-center text-sm">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 font-semibold text-[#6C63FF] hover:text-[#5850E5] transition-colors">
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
