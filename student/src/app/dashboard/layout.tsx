"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, Users, User, LogOut, Menu, X } from "lucide-react";
import { fetchApi } from "@/lib/api";

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
    <div className="flex-grow bg-[#FEF1E3] flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-[#FFF8F1] p-4 border-b border-[#EADBCB]">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-[#EA8A2F]">tv</span>Netra
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#A08D7C] hover:text-[#EA8A2F] transition-colors p-2"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-60 bg-[#FFF8F1] border-r border-[#EADBCB] flex-shrink-0 z-20`}
      >
        <div className="p-4 py-6 h-full flex flex-col">

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
      <div className="flex-grow overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
