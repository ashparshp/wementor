"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "Coupons", href: "/dashboard/coupons", icon: Ticket },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Mentors", href: "/dashboard/mentors", icon: GraduationCap },
  ];

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
                src="/images/logo-transparent.png" 
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
            <button className="flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-all duration-200 font-medium text-sm text-[#ef4444] hover:bg-red-50">
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
            
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F29440] to-[#E88935] flex items-center justify-center text-white font-bold shadow-sm">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#111827]">Admin User</p>
                <p className="text-xs text-[#6B7280]">Superadmin</p>
              </div>
            </div>
          </div>

        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
