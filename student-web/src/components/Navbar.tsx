"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { lockScroll, unlockScroll, preventBackgroundTouchMove } from "@/lib/scroll-lock";

const navLinks = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  {
    href: "/book",
    label: "Book Session",
    match: (path: string) => path === "/book" || path.startsWith("/book/"),
  },
  { href: "/app", label: "Mobile App", match: (path: string) => path === "/app" },
];

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    setIsLoggedIn(!!token);
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const linkClass = (isActive: boolean) =>
    `block px-4 py-3 rounded-xl text-base font-bold transition-colors ${
      isActive ? "text-[#F29440] bg-[#FDF1E9]" : "text-gray-800 hover:text-[#F29440] hover:bg-black/5"
    }`;

  return (
    <>
      <nav
        className={`top-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-md border-b border-[#E88935]/20 ${
          isMobileMenuOpen ? "fixed md:sticky" : "sticky"
        }`}
      >
        <div className="max-w-[90rem] mx-auto px-4 lg:px-6">
          <div className="flex justify-between h-16 sm:h-20 items-center gap-4">
            <Link href="/" className="flex items-center shrink-0 -ml-2">
              <Image
                src="/logo-hor-no-bg.png"
                alt="Logo"
                width={260}
                height={80}
                className="w-28 sm:w-40 lg:w-44 h-auto object-contain"
              />
            </Link>

            <div className="hidden md:flex flex-1 items-center justify-center space-x-8 lg:space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-bold transition-colors ${
                    link.match(pathname) ? "text-[#F29440]" : "text-gray-800 hover:text-[#F29440]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
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
                  <Link
                    href="/login"
                    className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2.5 hover:bg-black/5 rounded-lg transition-all"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#111827] hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95 border border-gray-800"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-gray-700 hover:text-[#F29440] hover:bg-black/5 rounded-lg transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — fixed below header, not inline (avoids sticky/scroll jump) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 touch-none">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          <div
            data-scroll-lock-ignore
            className="absolute left-0 right-0 top-16 sm:top-20 max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain bg-white border-b border-[#E88935]/20 shadow-lg touch-auto"
          >
            <div className="max-w-[90rem] mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(link.match(pathname))}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link href="/dashboard" className={linkClass(pathname.startsWith("/dashboard"))}>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={linkClass(pathname === "/login")}>
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center bg-[#111827] hover:bg-black text-white px-4 py-3 rounded-xl text-base font-bold transition-all"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
