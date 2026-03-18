export const CATEGORIES = [
  "network",
  "system",
  "maintenance",
  "security",
  "hardware",
  "info",
  "appearance",
  "privacy",
  "backup",
  "storage",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  network:     { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20" },
  system:      { bg: "bg-slate-500/10",   text: "text-slate-400",   border: "border-slate-500/20" },
  maintenance: { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20" },
  security:    { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20" },
  hardware:    { bg: "bg-purple-500/10",  text: "text-purple-400",  border: "border-purple-500/20" },
  info:        { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/20" },
  appearance:  { bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/20" },
  privacy:     { bg: "bg-green-500/10",   text: "text-green-400",   border: "border-green-500/20" },
  backup:      { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/20" },
  storage:     { bg: "bg-yellow-500/10",  text: "text-yellow-400",  border: "border-yellow-500/20" },
};

export function getCategoryStyle(cat?: string) {
  if (!cat || !(cat in CATEGORY_COLORS)) {
    return { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border/30" };
  }
  return CATEGORY_COLORS[cat as Category];
}
