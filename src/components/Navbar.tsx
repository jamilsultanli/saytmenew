import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/utils/image-optimizer";

interface NavbarProps {
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export const Navbar = ({ onSearchChange, searchValue }: NavbarProps) => {
  const [siteName, setSiteName] = useState("Sayt.me");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const fetchSettings = async () => {
    try {
      // Get the most recently UPDATED setting
      const { data, error } = await supabase
        .from('site_settings')
        .select('site_name, logo_url')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (!error && data) {
        if (data.site_name) setSiteName(data.site_name);
        if (data.logo_url) {
            setLogoUrl(data.logo_url);
            setImageError(false); // Reset error state
        }
      }
    } catch (e) {
      console.log("Using default site settings");
    }
  };

  useEffect(() => {
    fetchSettings();
    const handleUpdate = () => fetchSettings();
    window.addEventListener('settings-updated', handleUpdate);
    return () => window.removeEventListener('settings-updated', handleUpdate);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          {logoUrl && !imageError ? (
             <img 
               src={optimizeImage(logoUrl, 100, 100)} 
               alt={siteName} 
               className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
               onError={() => setImageError(true)}
               width={40}
               height={40}
             />
          ) : (
            // Fallback Logo
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
               <span className="text-xl font-bold">{siteName.charAt(0)}</span>
            </div>
          )}
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Axtarış..."
            value={searchValue || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full h-10 pl-11 pr-4 bg-muted/50 border border-input rounded-full text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};