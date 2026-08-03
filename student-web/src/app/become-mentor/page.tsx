"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { CheckCircle, GraduationCap } from "lucide-react";
import Link from "next/link";

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
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-gray-900 mb-4">Application Received!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for applying. Our team will review your application and email you if approved.
        </p>
        <Link href="/" className="text-[#F29440] font-semibold hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-[#FDF1E9] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-7 h-7 text-[#F29440]" />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Become a Mentor</h1>
        <p className="text-gray-600 mt-2">Share your expertise with students preparing for JEE, NEET, GSoC, placements, and more.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1.5">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F29440] outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F29440] outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1.5">Phone</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F29440] outline-none text-sm"
          />
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
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F29440] outline-none text-sm resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#111827] hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
