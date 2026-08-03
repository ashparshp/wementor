import { LucideIcon } from "lucide-react";

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
}

export default function IconInput({ icon: Icon, className = "", ...props }: IconInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-gray-400">
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
      </span>
      <input {...props} className={`input-field input-field--icon ${className}`} />
    </div>
  );
}
