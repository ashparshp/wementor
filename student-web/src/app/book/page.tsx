"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Clock, Search, Star } from "lucide-react";
import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";
import CategoryIcon from "@/components/CategoryIcon";

interface Plan {
  id: string;
  mentor_id: string;
  title: string;
  description: string;
  category: string;
  price_paise: number;
  duration_minutes: number;
}

interface Mentor {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  avg_rating: number;
}

interface EnrichedPlan extends Plan {
  mentor?: Mentor;
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12"><LoadingSpinner /></div>}>
      <BookingPageContent />
    </Suspense>
  );
}

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [enrichedPlans, setEnrichedPlans] = useState<EnrichedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    setCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      fetchApi<{ data: Plan[] }>("/plans?per_page=50"),
      fetchApi<{ data: Mentor[] }>("/mentors?per_page=50"),
    ])
      .then(([plansRes, mentorsRes]) => {
        const plans = plansRes.data || [];
        const mentors = mentorsRes.data || [];
        const stitched = plans.map((plan) => ({
          ...plan,
          mentor: mentors.find((m) => m.user_id === plan.mentor_id),
        }));
        setEnrichedPlans(stitched);
      })
      .catch(() => setError("Couldn't load sessions. Make sure the API is running."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedPlans.filter((plan) => {
      const matchesCategory = category === "all" || plan.category === category;
      const matchesSearch =
        !q ||
        plan.title.toLowerCase().includes(q) ||
        plan.mentor?.name.toLowerCase().includes(q) ||
        plan.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [enrichedPlans, search, category]);

  const setCategoryFilter = (id: string) => {
    setCategory(id);
    const url = id === "all" ? "/book" : `/book?category=${id}`;
    router.replace(url, { scroll: false });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner label="Finding mentors..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PageHeader
        title="Discover Sessions"
        subtitle="Browse mentorship sessions and book a time that works for you."
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          placeholder="Search by title, mentor, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide -mx-1 px-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryFilter(cat.id)}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              category === cat.id
                ? "bg-[#111827] text-white shadow-md"
                : "bg-white/80 text-gray-700 border border-gray-200 hover:border-[#F29440]/40 hover:text-[#F29440]"
            }`}
          >
            <CategoryIcon
              category={cat.id}
              size="sm"
              className={category === cat.id ? "text-white" : "text-[#F29440]"}
            />
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No sessions found"
          description={
            search || category !== "all"
              ? "Try a different search term or category filter."
              : "No mentorship sessions are available yet. Check back soon!"
          }
          actionLabel={search || category !== "all" ? "Clear filters" : "Back to Home"}
          actionHref={search || category !== "all" ? "/book" : "/"}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} session{filtered.length !== 1 ? "s" : ""} available</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((plan) => (
              <article
                key={plan.id}
                onClick={() => router.push(`/book/${plan.id}`)}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/book/${plan.id}`)}
                role="button"
                tabIndex={0}
                className="card-surface-hover cursor-pointer flex flex-col p-5 sm:p-6 active:scale-[0.99]"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="bg-[#FDF1E9] text-[#F29440] text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1">
                      <CategoryIcon category={plan.category} size="sm" />
                      {getCategoryLabel(plan.category)}
                    </span>
                    <span className="font-black text-gray-900 text-lg">₹{(plan.price_paise / 100).toFixed(0)}</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2">{plan.title}</h3>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 mb-3">
                    <Clock className="w-3.5 h-3.5" /> {plan.duration_minutes} min
                  </span>

                  <p className="text-sm text-gray-600 mb-5 line-clamp-3">
                    {plan.description.replace(/<[^>]+>/g, "")}
                  </p>
                </div>

                {plan.mentor && (
                  <div className="pt-4 mt-auto border-t border-gray-100 flex items-center gap-3">
                    {plan.mentor.avatar_url ? (
                      <Image
                        src={plan.mentor.avatar_url}
                        alt={plan.mentor.name}
                        width={40}
                        height={40}
                        className="rounded-full w-10 h-10 object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {plan.mentor.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{plan.mentor.name}</p>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#F29440]">
                        <Star className="w-3 h-3 fill-[#F29440]" /> {plan.mentor.avg_rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
