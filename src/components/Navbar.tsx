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

  useEffect(() => {
    // Optional: Fetch site name from DB if you want dynamic branding
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('site_name').single();
      if (data?.site_name) setSiteName(data.site_name);
    };
    fetchSettings();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
            <span className="text-xl font-bold">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-none">{siteName}</span>
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