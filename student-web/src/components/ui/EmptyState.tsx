import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-dashed border-[#EADBCB] p-10 sm:p-14 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-[#FDF1E9] flex items-center justify-center text-[#F29440] mb-5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm mt-2 max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#111827] hover:bg-black transition-all shadow-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
