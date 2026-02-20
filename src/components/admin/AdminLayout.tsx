import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, FileText, Settings, Tags, LogOut, Bot
} from "lucide-react";
import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    // Determine active view based on URL hash or default
    const hash = location.hash.replace("#", "") || "dashboard";
    setActiveView(hash);
  }, [location.hash]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'Məqalələr', icon: FileText },
    { id: 'categories', label: 'Kateqoriyalar', icon: Tags },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
    { id: 'seo-files', label: 'SEO Faylları', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <SEO title="Admin Dashboard" />
      <aside className="w-64 border-r bg-muted/20 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Admin
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
             <Button 
               key={item.id}
               variant={activeView === item.id ? 'secondary' : 'ghost'} 
               className="w-full justify-start capitalize" 
               onClick={() => {
                 setActiveView(item.id);
                 window.location.hash = item.id;
               }}
             >
               <item.icon className="mr-2 h-4 w-4" />
               {item.label}
             </Button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Çıxış
          </Button>
        </div>
      </aside>
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};