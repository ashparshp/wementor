"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { CheckCircle, GraduationCap, IndianRupee, Users, Video } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

const BENEFITS = [
  {
    icon: GraduationCap,
    title: "Why mentor with us?",
    desc: "After approval, you'll get access to the mentor portal to set availability, create sessions, and start earning.",
  },
  { icon: Users, title: "Reach motivated students", desc: "Connect with learners preparing for JEE, NEET, GSoC, placements, and more." },
  { icon: IndianRupee, title: "Earn from your expertise", desc: "Set your own session prices and get paid for every booking." },
  { icon: Video, title: "Flexible scheduling", desc: "Set your availability and conduct sessions from anywhere via Google Meet." },
];

export default function BecomeMentorPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetchApi("/mentor-applications", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, about }),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="card-surface p-10">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">Application Received!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for applying. Our team will review your application and email you login credentials if approved.
          </p>
          <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
      <PageHeader
        title="Become a Mentor"
        subtitle="Share your expertise with students preparing for JEE, NEET, GSoC, placements, and more."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Benefits sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="card-surface p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FDF1E9] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#F29440]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{b.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">Phone</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">About You</label>
              <textarea
                required
                minLength={20}
                rows={5}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about your background, achievements, and what you can help students with..."
                className="block w-full min-h-[8rem] rounded-xl border border-gray-200 bg-white text-sm leading-relaxed py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#F29440]/25 focus:border-[#F29440] transition-colors placeholder:text-gray-400 resize-none"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
