"use client";

import { cn } from "@/lib/utils";
import { optimizeImage } from "@/utils/image-optimizer";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";

const colorVariants = cva("", {
  variants: {
    colorTheme: {
      blue: "text-blue-400",
      green: "text-green-400",
      purple: "text-purple-400",
      orange: "text-orange-400",
      red: "text-red-400",
      pink: "text-pink-400",
      yellow: "text-yellow-400",
    },
  },
  defaultVariants: {
    colorTheme: "blue",
  },
});

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof colorVariants> {
  size?: 'standard' | 'hero' | 'wide' | 'square' | null;
  title: string;
  category: string;
  readTime?: string | null;
  image?: string | null;
  icon?: React.ReactNode;
  priority?: boolean;
}

export const BentoCard = ({
  className,
  size = 'standard',
  title,
  category,
  readTime,
  colorTheme,
  image,
  icon,
  priority = false,
  ...props
}: BentoCardProps) => {
  const titleSize = size === 'hero' ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl';

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden rounded-3xl border border-transparent bg-muted/30 group",
        "transition-all duration-500 ease-in-out hover:shadow-2xl hover:border-primary/20",
        className
      )}
      {...props}
    >
      {image && (
        <img
          src={optimizeImage(image, 1000)}
          alt={title}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div className="absolute top-5 right-5 p-2 bg-black/30 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0">
        <ArrowUpRight className="w-5 h-5 text-white" />
      </div>

      <div className="relative flex flex-col justify-end h-full p-6 text-white z-10">
        <div className="space-y-3 transition-transform duration-300 group-hover:-translate-y-1">
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className={cn("font-semibold", colorVariants({ colorTheme }))}>
              {category}
            </span>
            {readTime && (
              <>
                <span className="text-white/50">•</span>
                <span className="text-white/80">{readTime}</span>
              </>
            )}
          </div>
          <h3 className={`font-bold leading-tight text-balance ${titleSize}`}>
            {title}
          </h3>
        </div>
        {icon && size === 'square' && (
          <div className="absolute top-6 left-6 text-white/50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};