"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  CalendarDays, 
  CreditCard, 
  Ticket,
  Users,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, token, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
  };

  const baseNavItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "mentor"] },
    { name: "Bookings", href: "/dashboard/bookings", icon: CalendarDays, roles: ["admin", "mentor"] },
    { name: "My Sessions", href: "/dashboard/plans", icon: CalendarDays, roles: ["mentor"] },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard, roles: ["admin"] },
    { name: "Coupons", href: "/dashboard/coupons", icon: Ticket, roles: ["admin"] },
    { name: "Users", href: "/dashboard/users", icon: Users, roles: ["admin"] },
    { name: "Mentors", href: "/dashboard/mentors", icon: GraduationCap, roles: ["admin"] },
  ];

  const navItems = baseNavItems.filter(item => item.roles.includes(user?.role || ""));

  // 1. Show unified "Logging you out..." screen if logging out
  if (isLoggingOut) {
    return (
      <div className="h-screen w-full bg-[#FDF1E9] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image 
            src="/images/bg-v2.png" 
            alt="Background" 
            fill 
            className="object-cover object-left filter blur-[4px]"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#F29440]/20 border-t-[#F29440] animate-spin"></div>
            <div className="absolute w-8 h-8 rounded-full border-4 border-[#E88935]/10 border-b-[#E88935] animate-spin [animation-direction:reverse]"></div>
          </div>
          <p className="mt-4 text-[#F29440] font-semibold text-sm tracking-wider animate-pulse">Logging you out...</p>
        </div>
      </div>
    );
  }

  // 2. Show loading screen on initial mount/check
  if (!mounted || isLoading) {
    return (
      <div className="h-screen w-full bg-[#FDF1E9] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image 
            src="/images/bg-v2.png" 
            alt="Background" 
            fill 
            className="object-cover object-left filter blur-[4px]"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#F29440]/20 border-t-[#F29440] animate-spin"></div>
            <div className="absolute w-8 h-8 rounded-full border-4 border-[#E88935]/10 border-b-[#E88935] animate-spin [animation-direction:reverse]"></div>
          </div>
          <p className="mt-4 text-[#F29440] font-semibold text-sm tracking-wider animate-pulse">Securing session...</p>
        </div>
      </div>
    );
  }

  // 3. Fallback: if not authenticated, return null (redirect via AuthProvider)
  if (!token || !user) {
    return null;
  }

  const displayName = user.name || "Admin";
  const displayRole = user.role === "admin" ? "Administrator" : user.role;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="h-screen bg-[#FDF8F5] flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-[#E5E7EB]">
            <div className="relative w-56 h-16">
              <Image 
                src="/images/logo-hor-no-bg.png" 
                alt="WeMentor Logo" 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain object-left" 
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                    ${isActive 
                      ? "bg-[#FDF1E9] text-[#F29440]" 
                      : "text-[#6B7280] hover:bg-gray-50 hover:text-[#374151]"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#F29440]" : "text-[#9CA3AF]"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Area / Logout */}
          <div className="p-4 border-t border-[#E5E7EB]">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-all duration-200 font-medium text-sm text-[#ef4444] hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 lg:px-8 shrink-0">
          
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-[#111827]">
              {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            
            <div 
              className="relative flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F29440] to-[#E88935] flex items-center justify-center text-white font-bold shadow-sm">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#111827]">{displayName}</p>
                <p className="text-xs text-[#6B7280]">{displayRole}</p>
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 py-2 animate-in fade-in duration-200">
                  <Link 
                    href="/dashboard/profile"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/dashboard/profile#password"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Change Password
                  </Link>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </header>

        {/* Page Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
