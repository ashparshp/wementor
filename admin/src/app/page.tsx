"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FDF1E9] relative overflow-hidden font-sans">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/bg-v2.png" 
          alt="Login Background" 
          fill 
          className="object-cover object-left"
          priority
        />
      </div>

      {/* Top Left Logo */}
      <div className="absolute top-4 left-6 z-20">
        <Image 
          src="/images/logo-hor-no-bg.png" 
          alt="Logo" 
          width={180}
          height={120}
          className="object-contain"
        />
      </div>

      {/* Main Content Area */}
      <div className="w-full h-screen relative z-10 flex flex-col lg:flex-row">
        
        {/* Left Side: Empty space to let the background image show through */}
        <div className="hidden lg:flex w-1/2">
        </div>
        
        {/* Right Side: Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
            
            {/* Subtle glow effect behind the form */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#F29440]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-[#6b7280] text-sm font-medium">Login to continue your journey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#374151]" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] bg-white/90 focus:bg-white text-[#1f2937] text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F29440]/20 focus:border-[#F29440] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#374151]" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E5E7EB] bg-white/90 focus:bg-white text-[#1f2937] text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F29440]/20 focus:border-[#F29440] transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] cursor-pointer hover:text-[#6b7280]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <a href="#" className="text-xs font-bold text-[#F29440] hover:text-[#d97c2e] transition-colors">
                  Forgot Password?
                </a>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F29440] hover:bg-[#E88935] text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Login to Dashboard"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
