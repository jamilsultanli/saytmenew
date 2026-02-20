import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Settings, User, Mail, Linkedin, LineChart, Save, Image as ImageIcon, Globe, Database as DbIcon } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { seedDatabase } from "@/utils/seed";

type SettingsType = Database['public']['Tables']['site_settings']['Row'];

export const SettingsManager = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<any>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [favFile, setFavFile] = useState<File | null>(null);
    const [authorFile, setAuthorFile] = useState<File | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);

    const { data: settings, isLoading } = useQuery({
      queryKey: ['admin-settings'],
      queryFn: async () => {
        // Ən dolu və ən son məlumatı gətir
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .not('site_name', 'is', null) // Boş adları ignor et
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        return data as SettingsType;
      }
    });

    // Sync state when data loads
    if (settings && Object.keys(formData).length === 0) {
      setFormData({
        site_name: settings.site_name,
        site_description: settings.site_description,
        hero_title: settings.hero_title,
        hero_description: settings.hero_description,
        footer_text: settings.footer_text,
        google_analytics_id: settings.google_analytics_id,
        google_tag_manager_id: settings.google_tag_manager_id,
        google_search_console_code: settings.google_search_console_code,
        author_name: settings.author_name,
        about_text: settings.about_text,
        email: (settings.social_links as any)?.email || "",
        linkedin: (settings.social_links as any)?.linkedin || ""
      });
    }

    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSeed = async () => {
      if(!confirm("Demo məlumatlar yüklənsin? Bu mövcud bəzi məlumatları əvəzləyə bilər.")) return;
      setIsSeeding(true);
      try {
        await seedDatabase();
        queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
        queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
        window.location.reload();
      } catch (e) {
        // Error handled in seed function
      } finally {
        setIsSeeding(false);
      }
    };

    const saveSettingsMutation = useMutation({
      mutationFn: async () => {
        let logoUrl = settings?.logo_url;
        let favUrl = settings?.favicon_url;
        let authorImgUrl = settings?.author_image;

        const upload = async (f: File) => {
           const fileExt = f.name.split('.').pop();
           const randomName = Math.random().toString(36).substring(7);
           const safeName = `asset-${Date.now()}-${randomName}.${fileExt}`;
           const { error } = await supabase.storage.from('images').upload(safeName, f);
           if (error) throw error;
           const { data } = supabase.storage.from('images').getPublicUrl(safeName);
           return data.publicUrl;
        };

        if (logoFile) logoUrl = await upload(logoFile);
        if (favFile) favUrl = await upload(favFile);
        if (authorFile) authorImgUrl = await upload(authorFile);

        const payload = {
          site_name: formData.site_name,
          site_description: formData.site_description,
          hero_title: formData.hero_title,
          hero_description: formData.hero_description,
          footer_text: formData.footer_text,
          logo_url: logoUrl,
          favicon_url: favUrl,
          google_analytics_id: formData.google_analytics_id || null,
          google_tag_manager_id: formData.google_tag_manager_id || null,
          google_search_console_code: formData.google_search_console_code || null,
          author_name: formData.author_name,
          about_text: formData.about_text,
          author_image: authorImgUrl,
          social_links: { email: formData.email, linkedin: formData.linkedin }
        };

        let targetId = settings?.id;
        
        // Əgər ID yoxdursa, yenə də ən sonuncunu tapmağa çalışaq
        if (!targetId) {
             const { data } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
             if (data) targetId = data.id;
        }

        if (targetId) {
          const { error } = await supabase.from('site_settings').update(payload).eq('id', targetId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('site_settings').insert(payload);
          if (error) throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
        queryClient.invalidateQueries({ queryKey: ['siteSettings'] }); 
        toast.success("Ayarlar yadda saxlanıldı!");
        setLogoFile(null); setFavFile(null); setAuthorFile(null);
      },
      onError: (err) => toast.error(err.message)
    });

    if (isLoading) return <div>Yüklənir...</div>;

    // Show empty state if no settings exist
    if (!settings && !formData.site_name) {
       return (
          <div className="max-w-2xl mx-auto text-center py-20 space-y-6 animate-in fade-in-50">
             <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <Settings className="w-10 h-10 text-muted-foreground" />
             </div>
             <h2 className="text-2xl font-bold">Sayt Ayarları Tapılmadı</h2>
             <p className="text-muted-foreground max-w-md mx-auto">
               Görünür bazada hələ heç bir ayar yoxdur. Zəhmət olmasa "Demo Məlumatları Yüklə" düyməsini sıxın.
             </p>
             <Button onClick={handleSeed} disabled={isSeeding} size="lg">
               {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DbIcon className="mr-2 h-4 w-4" />}
               Demo Ayarları Yüklə
             </Button>
          </div>
       );
    }

    return (
      <div className="max-w-2xl mx-auto animate-in fade-in-50">
        <div className="flex justify-end mb-6">
           <Button variant="outline" size="sm" onClick={handleSeed} disabled={isSeeding} className="text-xs">
              {isSeeding ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <DbIcon className="mr-2 h-3 w-3" />}
              Demo Reset
           </Button>
        </div>

        <Card>
          <CardHeader>
             <CardTitle>Sayt Ayarları</CardTitle>
             <CardDescription>Logo, Favicon, SEO və Əsas Səhifə məlumatlarını yeniləyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); saveSettingsMutation.mutate(); }} className="space-y-8">
              {/* Main Info */}
              <div className="space-y-4">
                 <h3 className="font-semibold flex items-center gap-2 border-b pb-2"><Settings className="w-4 h-4" /> Ümumi Məlumatlar</h3>
                 <div className="grid gap-2">
                   <Label>Saytın Adı (SEO Title)</Label>
                   <Input value={formData.site_name || ""} onChange={(e) => handleChange('site_name', e.target.value)} />
                 </div>
                 <div className="grid gap-2">
                   <Label>Təsvir (SEO Description)</Label>
                   <Textarea value={formData.site_description || ""} onChange={(e) => handleChange('site_description', e.target.value)} />
                 </div>
                 <div className="grid gap-2">
                   <Label>Hero Başlığı (Ana Səhifə)</Label>
                   <Input value={formData.hero_title || ""} onChange={(e) => handleChange('hero_title', e.target.value)} />
                 </div>
                 <div className="grid gap-2">
                   <Label>Hero Təsviri (Ana Səhifə)</Label>
                   <Textarea value={formData.hero_description || ""} onChange={(e) => handleChange('hero_description', e.target.value)} />
                 </div>
              </div>

               {/* About / Author Section */}
               <div className="space-y-4">
                 <h3 className="font-semibold flex items-center gap-2 border-b pb-2"><User className="w-4 h-4" /> Müəllif və Haqqında</h3>
                 <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-2">
                       <Label>Müəllif Şəkli</Label>
                       <div className="border border-dashed rounded-lg p-4 text-center space-y-2">
                          {settings?.author_image ? (
                            <img src={settings.author_image} className="h-16 w-16 mx-auto rounded-full object-cover" alt="Author" />
                          ) : <User className="h-8 w-8 mx-auto text-muted-foreground" />}
                          <Input type="file" onChange={(e) => setAuthorFile(e.target.files?.[0] || null)} className="text-xs" accept="image/*" />
                       </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                       <div className="grid gap-2">
                          <Label>Müəllif Adı</Label>
                          <Input value={formData.author_name || ""} onChange={(e) => handleChange('author_name', e.target.value)} />
                       </div>
                       <div className="grid gap-2">
                          <Label>Haqqında Mətni</Label>
                          <Textarea value={formData.about_text || ""} onChange={(e) => handleChange('about_text', e.target.value)} className="h-24" />
                       </div>
                       <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="grid gap-2">
                             <Label className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                             <Input value={formData.email || ""} onChange={(e) => handleChange('email', e.target.value)} />
                          </div>
                          <div className="grid gap-2">
                             <Label className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn URL</Label>
                             <Input value={formData.linkedin || ""} onChange={(e) => handleChange('linkedin', e.target.value)} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Integrations */}
              <div className="space-y-4">
                 <h3 className="font-semibold flex items-center gap-2 border-b pb-2"><LineChart className="w-4 h-4" /> İnteqrasiyalar (SEO & Analitika)</h3>
                 <div className="grid gap-2">
                   <Label>Google Analytics ID</Label>
                   <Input value={formData.google_analytics_id || ""} onChange={(e) => handleChange('google_analytics_id', e.target.value)} />
                 </div>
                 <div className="grid gap-2">
                   <Label>Google Tag Manager ID</Label>
                   <Input value={formData.google_tag_manager_id || ""} onChange={(e) => handleChange('google_tag_manager_id', e.target.value)} />
                 </div>
                 <div className="grid gap-2">
                   <Label>Google Search Console</Label>
                   <Input value={formData.google_search_console_code || ""} onChange={(e) => handleChange('google_search_console_code', e.target.value)} />
                 </div>
              </div>

              {/* Assets */}
              <div className="space-y-4">
                 <h3 className="font-semibold flex items-center gap-2 border-b pb-2"><ImageIcon className="w-4 h-4" /> Şəkillər</h3>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label>Logo</Label>
                       <div className="border border-dashed rounded-lg p-4 text-center space-y-2">
                          {settings?.logo_url ? <img src={settings.logo_url} className="h-12 mx-auto object-contain" alt="Logo" /> : <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />}
                          <Input type="file" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="text-xs" accept="image/*" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label>Favicon</Label>
                       <div className="border border-dashed rounded-lg p-4 text-center space-y-2">
                          {settings?.favicon_url ? <img src={settings.favicon_url} className="h-8 w-8 mx-auto object-contain" alt="Favicon" /> : <Globe className="h-8 w-8 mx-auto text-muted-foreground" />}
                          <Input type="file" onChange={(e) => setFavFile(e.target.files?.[0] || null)} className="text-xs" accept="image/*" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid gap-2">
                <Label>Footer Mətni</Label>
                <Input value={formData.footer_text || ""} onChange={(e) => handleChange('footer_text', e.target.value)} />
              </div>

              <Button type="submit" disabled={saveSettingsMutation.isPending} className="w-full">
                {saveSettingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Yadda Saxla
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };