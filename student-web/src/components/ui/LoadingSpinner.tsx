interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({ label = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-[3px] border-[#F29440]/20 border-t-[#F29440] animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}
