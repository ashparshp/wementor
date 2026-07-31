"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, Users, User, LogOut, Menu, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { lockScroll, unlockScroll, preventBackgroundTouchMove } from "@/lib/scroll-lock";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    lockScroll();
    document.addEventListener("touchmove", preventBackgroundTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventBackgroundTouchMove);
      unlockScroll();
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        // failed to parse user
      }
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      router.push("/");
    }
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FEF1E3]">Loading...</div>;
  }

  return (
    <div
      className={`flex-grow bg-[#FEF1E3] flex flex-col md:flex-row min-h-[calc(100vh-0px)] ${
        isMobileMenuOpen ? "md:overflow-visible overflow-hidden h-[100dvh]" : ""
      }`}
    >
      {/* Mobile Topbar */}
      <div
        className={`md:hidden flex items-center justify-between bg-[#FFF8F1] px-4 h-14 border-b border-[#EADBCB] top-0 left-0 right-0 z-[60] ${
          isMobileMenuOpen ? "fixed" : "sticky"
        }`}
      >
        <Link href="/dashboard" className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-[#EA8A2F]">tv</span>Netra
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#A08D7C] hover:text-[#EA8A2F] transition-colors p-2 -mr-2"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay + drawer (below topbar) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 touch-none">
          <button
            type="button"
            className="absolute inset-0 top-14 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          <div
            data-scroll-lock-ignore
            className="absolute top-14 bottom-0 left-0 w-72 max-w-[85vw] bg-[#FFF8F1] border-r border-[#EADBCB] shadow-xl flex flex-col touch-auto"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EADBCB] bg-[#FFF8F1]">
              <span className="text-sm font-bold text-gray-900">Menu</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-[#A08D7C] hover:text-[#EA8A2F] rounded-lg"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 flex flex-col">
              <div className="flex-grow space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                        isActive
                          ? "bg-[#111827] text-white shadow-md"
                          : "text-[#6B7280] hover:bg-black/5 hover:text-[#374151]"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#A08D7C]"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-[#EADBCB]">
                <div className="mb-4 px-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#EA8A2F]/10 flex items-center justify-center text-[#EA8A2F] font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-red-600 hover:bg-red-500/10 hover:text-red-700"
                >
                  <LogOut size={20} />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-60 bg-[#FFF8F1] border-r border-[#EADBCB] flex-shrink-0">
        <div className="p-4 py-6 h-full flex flex-col min-h-[calc(100vh-0px)]">

          <div className="flex-grow space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                    isActive
                      ? "bg-[#111827] text-white shadow-md"
                      : "text-[#6B7280] hover:bg-black/5 hover:text-[#374151]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#A08D7C]"}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-6 pb-6 md:pb-2 border-t border-[#EADBCB]">
            <div className="mb-4 px-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#EA8A2F]/10 flex items-center justify-center text-[#EA8A2F] font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-red-600 hover:bg-red-500/10 hover:text-red-700"
            >
              <LogOut size={20} />
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-grow overflow-x-hidden p-4 sm:p-6 md:p-8 ${
          isMobileMenuOpen ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
