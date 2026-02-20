import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface BentoCardProps {
  title: string;
  category: string;
  readTime: string;
  image?: string;
  className?: string;
  size?: "hero" | "square" | "wide" | "standard";
  colorTheme?: "blue" | "pink" | "yellow";
  icon?: React.ReactNode;
}

export const BentoCard = ({
  title,
  category,
  readTime,
  image,
  className,
  size = "standard",
  colorTheme = "blue",
  icon,
}: BentoCardProps) => {
  const getThemeColor = () => {
    switch (colorTheme) {
      case "blue": return "group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]";
      case "pink": return "group-hover:border-pink-500/50 group-hover:shadow-[0_0_20px_rgba(255,0,127,0.15)]";
      case "yellow": return "group-hover:border-yellow-400/50 group-hover:shadow-[0_0_20px_rgba(255,215,0,0.15)]";
      default: return "group-hover:border-white/20";
    }
  };

  const getBadgeColor = () => {
    switch (colorTheme) {
      case "blue": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "pink": return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "yellow": return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl glass-card cursor-pointer",
        getThemeColor(),
        className
      )}
    >
      {/* Background Image / Content */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
        {image && (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-end p-6 z-10">
        {/* Icon for square cards */}
        {size === "square" && icon && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] mb-4">
             <div className="w-20 h-20 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
               {icon}
             </div>
          </div>
        )}

        {size === "wide" && image && (
          <div className="absolute right-0 top-0 bottom-0 w-1/2">
             {/* Wide card specific layout handling would go here - handled via CSS generally */}
          </div>
        )}

        <div className={cn("space-y-3 transition-transform duration-300 group-hover:-translate-y-1", size === "square" && "text-center")}>
          <h3 className={cn("font-bold text-white leading-tight", 
            size === "hero" ? "text-3xl md:text-4xl max-w-lg" : 
            size === "square" ? "text-lg" : 
            "text-xl"
          )}>
            {title}
          </h3>
          
          <div className={cn("flex items-center gap-3 text-sm", size === "square" && "justify-center")}>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{readTime}</span>
            </div>
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm", getBadgeColor())}>
              {category}
            </span>
          </div>
        </div>
      </div>
      
      {/* Hover Light Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/5 to-transparent mix-blend-overlay" />
    </div>
  );
};