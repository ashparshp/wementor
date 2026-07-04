"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call for now
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left side - Branding / Illustration area */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden items-center justify-center p-12">
        {/* Abstract background gradient effects */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-64 h-64 relative mb-8">
            {/* If login.png is an illustration, we can use it here. Otherwise, logo is fine. */}
            <Image 
              src="/images/login.png" 
              alt="Login Illustration" 
              fill 
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Manage WeMentor.
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            The central command center for overseeing students, mentors, and the entire mentorship ecosystem.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-10">
          
          {/* Mobile Logo Header */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative w-10 h-10">
                <Image src="/images/icon.png" alt="WeMentor Icon" fill className="object-contain" />
              </div>
              <div className="relative h-8 w-32">
                <Image src="/images/logo.png" alt="WeMentor Logo" fill className="object-contain object-left" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Sign in to your admin account to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@wementor.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
            <p className="text-xs text-center text-zinc-500">
              Protected by WeMentor Security. Only authorized administrators are permitted to access this portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
