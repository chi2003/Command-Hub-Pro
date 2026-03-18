import { CATEGORIES } from "@/lib/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag } from "lucide-react";

type CategoryFilterProps = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export function CategoryFilter({ value, onChange, className }: CategoryFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-44 rounded-xl bg-card border-border/50 h-12 shrink-0 focus:ring-primary/20 ${className ?? ""}`}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="w-4 h-4 shrink-0" />
          <SelectValue placeholder="All Categories" />
        </div>
      </SelectTrigger>
      <SelectContent className="glass rounded-xl border-border/50">
        <SelectItem value="all" className="rounded-lg cursor-pointer capitalize">All Categories</SelectItem>
        {CATEGORIES.map(cat => (
          <SelectItem key={cat} value={cat} className="rounded-lg cursor-pointer capitalize">
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
