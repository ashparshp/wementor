"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E88935]/20">
      <div className="max-w-[90rem] mx-auto px-4 lg:px-6">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center -ml-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo-hor-no-bg.png"
                alt="WeMentor Logo"
                width={260}
                height={80}
                className="w-32 sm:w-40 lg:w-44 h-auto object-contain"
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
