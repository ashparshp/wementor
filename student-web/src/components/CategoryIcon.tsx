import {
  Atom,
  BarChart3,
  BookOpen,
  Briefcase,
  Code2,
  Landmark,
  LayoutGrid,
  LucideIcon,
  Sigma,
  Stethoscope,
  Terminal,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  all: LayoutGrid,
  jee: Atom,
  neet: Stethoscope,
  gsoc: Code2,
  lfx: Terminal,
  placements: Briefcase,
  gate: Sigma,
  cat: BarChart3,
  upsc: Landmark,
  other: BookOpen,
};

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export default function CategoryIcon({ category, className = "", size = "md" }: CategoryIconProps) {
  const Icon = ICON_MAP[category] ?? BookOpen;
  return <Icon className={`${SIZE_CLASSES[size]} ${className}`} strokeWidth={2} />;
}
