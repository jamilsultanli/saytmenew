import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { optimizeImage, generateSrcSet } from "@/utils/image-optimizer";

interface BentoCardProps {
  title: string;
  category: string;
  readTime: string;
  image?: string;
  className?: string;
  size?: "hero" | "square" | "wide" | "standard";
  colorTheme?: "blue" | "pink" | "yellow";
  icon?: React.ReactNode;
  priority?: boolean; // New prop for LCP optimization
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
  priority = false,
}: BentoCardProps) => {
  
  // Determine image sizes based on card size
  // These are approximate widths for responsive loading
  const width = size === "hero" ? 800 : size === "wide" ? 600 : 400;
  const height = size === "hero" ? 600 : size === "wide" ? 400 : 400;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl cursor-pointer h-full border border-border shadow-sm transition-all duration-500 hover:shadow-xl",
        "bg-card text-card-foreground", 
        className
      )}
    >
      {/* Background Image / Content */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
        {image ? (
          <>
            <img
              src={optimizeImage(image, width, height)}
              srcSet={generateSrcSet(image, [400, 600, 800, 1200])}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              alt={title}
              className="w-full h-full object-cover transition-opacity duration-500"
              loading={priority ? "eager" : "lazy"}
              {...(priority ? { fetchPriority: "high" } : {})}
              width={width}
              height={height}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-end p-6 z-10">
        {/* Icon for square cards */}
        {size === "square" && icon && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] mb-4">
             <div className="w-20 h-20 rounded-2xl bg-background/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 text-white">
               {icon}
             </div>
          </div>
        )}

        <div className={cn("space-y-3 transition-transform duration-300 group-hover:-translate-y-1", size === "square" && "text-center")}>
          <h3 className={cn("font-bold leading-tight", 
            image ? "text-white" : "text-card-foreground",
            size === "hero" ? "text-xl md:text-2xl max-w-lg" : 
            size === "square" ? "text-sm" : 
            "text-base"
          )}>
            {title}
          </h3>
          
          <div className={cn("flex items-center gap-3 text-sm", size === "square" && "justify-center")}>
            <div className={cn("flex items-center gap-1.5", image ? "text-gray-300" : "text-muted-foreground")}>
              <Clock className="w-3.5 h-3.5" />
              <span>{readTime}</span>
            </div>
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm", 
              image ? "bg-white/10 text-white border-white/20" : "bg-secondary text-secondary-foreground border-border"
            )}>
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