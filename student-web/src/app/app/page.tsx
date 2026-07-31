import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Mobile App — TvaNetra",
  description:
    "Get the TvaNetra mobile app for Android and iOS. Book mentorship sessions, manage bookings, and connect with mentors on the go.",
};

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.463 11.463 0 0 0-8.94 0L5.65 5.35a.643.643 0 0 0-.87-.2.566.566 0 0 0-.22.83l1.84 3.18C2.92 11.03 1 14.22 1 17.8h22c0-3.58-1.92-6.77-5.4-8.32zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

const platforms = [
  {
    name: "Android",
    subtitle: "Google Play",
    description: "For phones running Android 11 and above.",
    icon: AndroidIcon,
    accent: "from-[#3DDC84]/15 to-[#3DDC84]/5",
    iconBg: "bg-[#3DDC84]/10 text-[#2DA55E]",
    borderHover: "hover:border-[#3DDC84]/30",
  },
  {
    name: "iOS",
    subtitle: "App Store",
    description: "For iPhone and iPad running iOS 15 and above.",
    icon: AppleIcon,
    accent: "from-[#111827]/8 to-[#111827]/3",
    iconBg: "bg-[#111827]/8 text-[#111827]",
    borderHover: "hover:border-[#111827]/20",
  },
];

export default function MobileAppPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-16 sm:pb-24 lg:pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <Image
              src="/logo-hor-no-bg.png"
              alt="TvaNetra"
              width={220}
              height={70}
              className="w-44 sm:w-52 h-auto mx-auto object-contain"
            />
            <p className="text-sm font-medium tracking-[0.2em] text-gray-500 uppercase -mt-3 mb-2">
              We wanna be your eyes
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight leading-tight">
              Mentorship in your pocket
            </h1>
          </div>

          {/* Platform cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.name}
                  className={`group relative bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ${platform.borderHover}`}
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${platform.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${platform.iconBg}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Coming Soon
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-gray-900 mb-0.5">{platform.name}</h2>
                    <p className="text-sm font-semibold text-gray-400 mb-3">{platform.subtitle}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{platform.description}</p>

                    <button
                      disabled
                      className="mt-6 w-full py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-50 border border-gray-100 cursor-not-allowed"
                    >
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
