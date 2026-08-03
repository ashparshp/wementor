export const CATEGORIES = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "jee", label: "JEE", emoji: "🎯" },
  { id: "neet", label: "NEET", emoji: "🩺" },
  { id: "gsoc", label: "GSoC", emoji: "💻" },
  { id: "lfx", label: "LFX", emoji: "🐧" },
  { id: "placements", label: "Placements", emoji: "💼" },
  { id: "gate", label: "GATE", emoji: "📐" },
  { id: "cat", label: "CAT", emoji: "📊" },
  { id: "upsc", label: "UPSC", emoji: "🏛️" },
  { id: "other", label: "Other", emoji: "📚" },
] as const;

export function getCategoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id.toUpperCase();
}
