import type { Metadata } from "next";
import Image from "next/image";
import { Bell, Calendar, MessageCircle, Smartphone } from "lucide-react";

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

const features = [
  {
    icon: Calendar,
    title: "Book on the go",
    description: "Browse mentors and schedule sessions from anywhere.",
  },
  {
    icon: Bell,
    title: "Session reminders",
    description: "Never miss a mentorship call with timely notifications.",
  },
  {
    icon: MessageCircle,
    title: "Stay connected",
    description: "Keep track of your bookings and mentor updates in one place.",
  },
];

const platforms = [
  {
    name: "Android",
    subtitle: "Google Play",
    description: "For phones and tablets running Android 8.0 and above.",
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
      <section className="relative overflow-hidden pt-16 pb-24 lg:pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#EADBCB] rounded-full px-4 py-1.5 text-sm font-bold text-[#F29440] mb-8 shadow-sm">
              <Smartphone className="w-4 h-4" />
              Mobile App
            </div>

            <div className="relative mx-auto w-28 h-28 mb-6">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#F29440]/20 to-[#6C63FF]/10 blur-xl scale-110" />
              <div className="relative w-full h-full rounded-[28px] bg-white border border-[#EADBCB] shadow-[0_8px_40px_rgb(0,0,0,0.08)] flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon.png"
                  alt="TvaNetra app icon"
                  width={88}
                  height={88}
                  className="w-[72px] h-[72px] object-contain"
                  priority
                />
              </div>
            </div>

            <Image
              src="/logo-hor-no-bg.png"
              alt="TvaNetra"
              width={220}
              height={70}
              className="w-44 sm:w-52 h-auto mx-auto object-contain mb-3"
            />
            <p className="text-sm font-medium tracking-[0.2em] text-gray-500 uppercase mb-4">
              We wanna be your eyes
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight leading-tight mb-4">
              Mentorship in your pocket
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              The TvaNetra app brings expert mentorship to your phone. Book sessions, manage
              bookings, and grow your career — wherever you are.
            </p>
          </div>

          {/* Platform cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto mb-20">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.name}
                  className={`group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ${platform.borderHover}`}
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
                      <span className="inline-flex items-center gap-1.5 bg-[#FDF1E9] text-[#F29440] text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg border border-[#F29440]/15">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F29440] animate-pulse" />
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
                      Download — Coming Soon
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center text-sm font-bold uppercase tracking-wider text-gray-400 mb-8">
              What you&apos;ll get
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#EADBCB]/60 p-5 text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FDF1E9] text-[#F29440] flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
