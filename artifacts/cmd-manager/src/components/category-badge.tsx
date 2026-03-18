import { getCategoryStyle } from "@/lib/categories";
import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
  category?: string;
  className?: string;
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  if (!category) return null;
  const style = getCategoryStyle(category);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border",
        style.bg, style.text, style.border,
        className
      )}
    >
      {category}
    </span>
  );
}
