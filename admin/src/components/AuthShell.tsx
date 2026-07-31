"use client";

import { usePathname } from "next/navigation";
import AppBackground from "@/components/AppBackground";
import Navbar from "@/components/Navbar";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/";

  if (!isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <AppBackground />
      <Navbar />
      <main className="flex-grow flex flex-col relative z-0">{children}</main>
    </>
  );
}
