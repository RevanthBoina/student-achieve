import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge className="bg-gold text-gold-foreground hover:bg-gold-dark text-xs uppercase font-semibold tracking-wide">
      {category}
    </Badge>
  );
}
