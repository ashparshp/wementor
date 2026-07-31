"use client";

import { usePathname } from "next/navigation";

const AUTH_ROUTES = ["/"];

export default function AppBackground() {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  return (
    <div
      className="fixed inset-0 -z-50 bg-cover bg-center bg-no-repeat bg-[#FDF8F5]"
      style={{ backgroundImage: "url(/hero-bg.png)" }}
    >
      <div className={`absolute inset-0 ${isAuthPage ? "bg-white/20" : "bg-white/60"}`} />
    </div>
  );
}
