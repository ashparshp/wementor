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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center w-1/4">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo-hor-no-bg.png" 
                alt="Logo" 
                width={240} 
                height={80} 
                className="h-14 w-auto object-contain" 
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
          <div className="flex-shrink-0 flex items-center justify-end w-1/4 gap-4">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-600 hover:text-red-500 transition-colors"
              >
                Log out
              </button>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-bold text-gray-800 hover:text-[#F29440] transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="flex items-center justify-center bg-[#F29440] hover:bg-[#E88935] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95">
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
