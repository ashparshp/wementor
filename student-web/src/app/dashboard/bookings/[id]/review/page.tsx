"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Star } from "lucide-react";
import Link from "next/link";

export default function ReviewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push(`/login?redirect=/dashboard/bookings/${id}/review`);
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetchApi("/reviews", {
        method: "POST",
        body: JSON.stringify({
          booking_id: id,
          rating,
          comment,
        }),
      });
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-4">Thank you!</h1>
        <p className="text-gray-600 mb-8">Your review helps other students find great mentors.</p>
        <Link href="/dashboard/bookings" className="text-[#F29440] font-semibold hover:underline">
          Back to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-900 mb-2">Rate Your Session</h1>
      <p className="text-gray-600 text-sm mb-8">How was your mentorship session?</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-3">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star
                  className={`w-8 h-8 ${n <= rating ? "fill-[#F29440] text-[#F29440]" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1.5">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F29440] outline-none text-sm resize-none"
            placeholder="Share your experience..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#111827] text-white font-bold py-4 rounded-xl disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
