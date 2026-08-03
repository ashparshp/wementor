"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/book", label: "Book" },
  { href: "/become-mentor", label: "Become a Mentor" },
  { href: "/login", label: "Sign In" },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;

  return (
    <footer className="mt-auto border-t border-[#EADBCB]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm font-bold text-gray-900">TvaNetra</p>

          <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-sm text-gray-500">
            {links.map((link, i) => (
              <span key={link.href} className="inline-flex items-center">
                {i > 0 && <span className="mx-2 text-gray-300 select-none" aria-hidden>·</span>}
                <Link href={link.href} className="hover:text-[#F29440] transition-colors">
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>

          <p className="text-xs text-gray-400 sm:text-right">
            © {new Date().getFullYear()} TvaNetra
          </p>
        </div>
      </div>
    </footer>
  );
}
