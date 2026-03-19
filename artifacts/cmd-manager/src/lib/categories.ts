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

export const COLOR_PALETTE = {
  blue:   { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20" },
  slate:  { bg: "bg-slate-500/10",   text: "text-slate-400",   border: "border-slate-500/20" },
  amber:  { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20" },
  red:    { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20" },
  purple: { bg: "bg-purple-500/10",  text: "text-purple-400",  border: "border-purple-500/20" },
  cyan:   { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/20" },
  pink:   { bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/20" },
  green:  { bg: "bg-green-500/10",   text: "text-green-400",   border: "border-green-500/20" },
  orange: { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/20" },
  yellow: { bg: "bg-yellow-500/10",  text: "text-yellow-400",  border: "border-yellow-500/20" },
  indigo: { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20" },
  teal:   { bg: "bg-teal-500/10",    text: "text-teal-400",    border: "border-teal-500/20" },
} as const;

export type PaletteColor = keyof typeof COLOR_PALETTE;

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  network:     COLOR_PALETTE.blue,
  system:      COLOR_PALETTE.slate,
  maintenance: COLOR_PALETTE.amber,
  security:    COLOR_PALETTE.red,
  hardware:    COLOR_PALETTE.purple,
  info:        COLOR_PALETTE.cyan,
  appearance:  COLOR_PALETTE.pink,
  privacy:     COLOR_PALETTE.green,
  backup:      COLOR_PALETTE.orange,
  storage:     COLOR_PALETTE.yellow,
};

export type CustomCategory = { name: string; color: PaletteColor };
export type BuiltinOverride = { name: string; color: PaletteColor };

const CUSTOM_CAT_KEY        = 'cmd-manager-custom-categories';
const DELETED_BUILTINS_KEY  = 'cmd-manager-deleted-builtins';
const BUILTIN_OVERRIDES_KEY = 'cmd-manager-builtin-overrides';

/* ---------- Custom categories ---------- */

export function getCustomCategories(): CustomCategory[] {
  try {
    const stored = localStorage.getItem(CUSTOM_CAT_KEY);
    if (stored) return JSON.parse(stored) as CustomCategory[];
  } catch {}
  return [];
}

export function saveCustomCategories(cats: CustomCategory[]) {
  localStorage.setItem(CUSTOM_CAT_KEY, JSON.stringify(cats));
}

/* ---------- Deleted built-in categories ---------- */

export function getDeletedBuiltinCategories(): string[] {
  try {
    const stored = localStorage.getItem(DELETED_BUILTINS_KEY);
    if (stored) return JSON.parse(stored) as string[];
  } catch {}
  return [];
}

export function saveDeletedBuiltinCategories(names: string[]) {
  localStorage.setItem(DELETED_BUILTINS_KEY, JSON.stringify(names));
}

/* ---------- Built-in color overrides ---------- */

export function getBuiltinOverrides(): BuiltinOverride[] {
  try {
    const stored = localStorage.getItem(BUILTIN_OVERRIDES_KEY);
    if (stored) return JSON.parse(stored) as BuiltinOverride[];
  } catch {}
  return [];
}

export function saveBuiltinOverrides(overrides: BuiltinOverride[]) {
  localStorage.setItem(BUILTIN_OVERRIDES_KEY, JSON.stringify(overrides));
}

/* ---------- Aggregated helpers ---------- */

export function getAllCategoryNames(): string[] {
  const deleted = getDeletedBuiltinCategories();
  return [
    ...(CATEGORIES as readonly string[]).filter(c => !deleted.includes(c)),
    ...getCustomCategories().map(c => c.name),
  ];
}

export function getCategoryStyle(cat?: string): { bg: string; text: string; border: string } {
  const fallback = { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border/30" };
  if (!cat) return fallback;

  const overrides = getBuiltinOverrides();
  const override = overrides.find(o => o.name === cat);
  if (override && override.color in COLOR_PALETTE) return COLOR_PALETTE[override.color];

  if (cat in CATEGORY_COLORS) return CATEGORY_COLORS[cat as Category];

  const custom = getCustomCategories().find(c => c.name === cat);
  if (custom && custom.color in COLOR_PALETTE) return COLOR_PALETTE[custom.color];

  return fallback;
}
