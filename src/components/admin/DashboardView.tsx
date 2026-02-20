import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tags, Settings, FileText, Eye, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: any, description?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export const DashboardView = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
      const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
      const { data: recentPosts } = await supabase.from('posts').select('id, title_az, created_at, card_size').order('created_at', { ascending: false }).limit(5);
      
      return { 
        postCount: postCount || 0, 
        catCount: catCount || 0,
        recentPosts: recentPosts || []
      };
    }
  });

  const navigateTo = (view: string) => {
    window.location.hash = view;
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <h2 className="text-3xl font-bold tracking-tight">İdarəetmə Paneli</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ümumi Məqalələr" value={stats?.postCount || 0} icon={FileText} description="Sistemdə olan aktiv yazılar" />
        <StatCard title="Kateqoriyalar" value={stats?.catCount || 0} icon={Tags} description="Mövcud mövzular" />
        <StatCard title="Ümumi Baxış" value="12.5k" icon={Eye} description="Son 30 gün (Demo)" />
        <StatCard title="SEO Skoru" value="92/100" icon={BarChart3} description="Optimallaşdırma səviyyəsi" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Son Yazılar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{post.title_az}</p>
                    <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {post.card_size}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
             <CardTitle>Sürətli Əməliyyatlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
             <Button variant="outline" className="w-full justify-start" onClick={() => navigateTo('posts')}>
               <Plus className="mr-2 h-4 w-4" /> Yeni Məqalə Yaz
             </Button>
             <Button variant="outline" className="w-full justify-start" onClick={() => navigateTo('categories')}>
               <Tags className="mr-2 h-4 w-4" /> Kateqoriya Əlavə et
             </Button>
             <Button variant="outline" className="w-full justify-start" onClick={() => navigateTo('settings')}>
               <Settings className="mr-2 h-4 w-4" /> Sayt Ayarlarını Dəyiş
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};