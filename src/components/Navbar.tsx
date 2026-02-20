import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavbarProps {
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export const Navbar = ({ onSearchChange, searchValue }: NavbarProps) => {
  const [siteName, setSiteName] = useState("Sayt.me");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('site_name, logo_url').order('created_at', {ascending: false}).limit(1).maybeSingle();
      if (!error && data) {
        if (data.site_name) setSiteName(data.site_name);
        // Append a timestamp to prevent aggressive caching if URL exists
        if (data.logo_url) setLogoUrl(`${data.logo_url}?t=${new Date().getTime()}`);
      }
    } catch (e) {
      console.log("Using default site settings");
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen for updates from Admin panel
    const handleUpdate = () => {
        fetchSettings();
    };

    window.addEventListener('settings-updated', handleUpdate);
    return () => window.removeEventListener('settings-updated', handleUpdate);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          {logoUrl ? (
             <img 
               src={logoUrl} 
               alt={siteName} 
               className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
               onError={(e) => {
                 // Fallback if image fails to load
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.querySelector('.fallback-logo')!.classList.remove('hidden');
               }}
             />
          ) : null}
          
          {/* Fallback Logo (Shown if no logoUrl or if image error) */}
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-lg overflow-hidden group-hover:scale-105 transition-transform fallback-logo ${logoUrl ? 'hidden' : ''}`}>
             <span className="text-xl font-bold">{siteName.charAt(0)}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-none hidden sm:block">{siteName}</span>
          </div>
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
          
          {/* Subscribe Button */}
          <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all hidden sm:flex">
            Abunə ol
          </Button>
        </div>
      </div>
    </nav>
  );
};