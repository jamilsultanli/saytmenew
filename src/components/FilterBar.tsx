import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";

type Category = Database['public']['Tables']['categories']['Row'];

interface FilterBarProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  categories: Category[];
}

export const FilterBar = ({ activeCategory, onCategoryChange, categories }: FilterBarProps) => {
  return (
    <div className="w-full flex justify-center mb-10 px-4">
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
        <button
          onClick={() => onCategoryChange("all")}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border",
            activeCategory === "all"
              ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
              : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/50"
          )}
        >
          HAMISI
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.slug)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border capitalize",
              activeCategory === cat.slug
                ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/50"
            )}
          >
            {cat.name_az}
          </button>
        ))}
      </div>
    </div>
  );
};