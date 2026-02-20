import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardView } from "@/components/admin/DashboardView";
import { PostsManager } from "@/components/admin/PostsManager";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { SeoFilesManager } from "@/components/admin/SeoFilesManager";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auth Check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setSession(session);
      }
      setLoading(false);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/login");
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
     return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!session) return null;

  // Determine active view based on URL hash
  const activeView = location.hash.replace("#", "") || "dashboard";

  return (
    <AdminLayout>
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'posts' && <PostsManager />}
      {activeView === 'categories' && <CategoriesManager />}
      {activeView === 'settings' && <SettingsManager />}
      {activeView === 'seo-files' && <SeoFilesManager />}
    </AdminLayout>
  );
};

export default Admin;