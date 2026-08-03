export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "jee", label: "JEE" },
  { id: "neet", label: "NEET" },
  { id: "gsoc", label: "GSoC" },
  { id: "lfx", label: "LFX" },
  { id: "placements", label: "Placements" },
  { id: "gate", label: "GATE" },
  { id: "cat", label: "CAT" },
  { id: "upsc", label: "UPSC" },
  { id: "other", label: "Other" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function getCategoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id.toUpperCase();
}
