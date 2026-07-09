"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    setIsLoggedIn(!!token);
  }, [pathname]); // Re-check when route changes

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-transparent border-b border-[#E88935]/20">
      <div className="max-w-[90rem] mx-auto px-4 lg:px-6">
        <div className="flex justify-between h-20 items-center">
          
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center w-1/3">
            <Link href="/" className="flex items-center -ml-2">
              <Image 
                src="/logo-hor-no-bg.png" 
                alt="Logo" 
                width={260} 
                height={80} 
                className="w-32 sm:w-40 lg:w-44 h-auto object-contain" 
              />
            </Link>
          </div>
          
          {/* Center: Tabs */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-12">
            <Link href="/" className={`text-base font-bold transition-colors ${pathname === "/" ? "text-[#F29440]" : "text-gray-800 hover:text-[#F29440]"}`}>
              Home
            </Link>
            <Link href="/book" className={`text-base font-bold transition-colors ${pathname === "/book" ? "text-[#F29440]" : "text-gray-800 hover:text-[#F29440]"}`}>
              Book Session
            </Link>
          </div>

          {/* Right: Auth Buttons */}
          <div className="flex-shrink-0 flex items-center justify-end w-1/3 gap-3">
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-sm font-bold text-[#EA8A2F] hover:text-[#D97706] transition-colors px-4 py-2 hover:bg-[#EA8A2F]/10 rounded-lg"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-bold text-gray-600 hover:text-red-600 transition-colors px-4 py-2 hover:bg-red-500/10 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2.5 hover:bg-black/5 rounded-lg transition-all">
                  Log in
                </Link>
                <Link href="/register" className="bg-[#111827] hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95 border border-gray-800">
                  Sign up
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
