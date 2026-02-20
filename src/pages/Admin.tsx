import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, ExternalLink, Database as DbIcon, AlertCircle, Copy, Check, Info, RefreshCw, Settings, PenTool, LayoutTemplate, Image as ImageIcon } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { seedDatabase } from "@/utils/seed";
import { SEO } from "@/components/SEO";

type Category = Database['public']['Tables']['categories']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

// SQL TO CREATE SITE SETTINGS IF MISSING (Updated with favicon)
const SQL_FIX_SETTINGS = `
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT DEFAULT 'Sayt.me',
  site_description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  footer_text TEXT,
  social_links JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;

INSERT INTO public.site_settings (site_name, site_description)
SELECT 'Sayt.me', 'Mənim şəxsi bloqum'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);
`;

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("blog");
  
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Blog Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [readTime, setReadTime] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cardSize, setCardSize] = useState("standard");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Settings Form State
  const [siteName, setSiteName] = useState("");
  const [siteDesc, setSiteDesc] = useState("");
  const [footerText, setFooterText] = useState("");
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [currentFavicon, setCurrentFavicon] = useState<string | null>(null);

  // Error/Dialog State
  const [showSqlDialog, setShowSqlDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkUser();
    fetchCategories();
    fetchPosts();
    fetchSettings();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('site_settings').select('*').single();
    if (error) {
      console.log("Settings table might be missing");
    } else if (data) {
      setSettingsId(data.id);
      setSiteName(data.site_name || "");
      setSiteDesc(data.site_description || "");
      setFooterText(data.footer_text || "");
      setCurrentLogo(data.logo_url);
      setCurrentFavicon(data.favicon_url);
    }
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSlug(generateSlug(e.target.value));
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error } = await supabase.storage.from('images').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let thumbnailUrl = "";
      if (file) {
        thumbnailUrl = await uploadFile(file);
      }

      const { error } = await supabase.from('posts').insert({
        title_az: title,
        slug,
        content_html: content,
        read_time_az: readTime,
        category_id: categoryId,
        card_size: cardSize as any,
        thumbnail_url: thumbnailUrl,
        seo_title: seoTitle || title,
        seo_description: seoDesc
      });

      if (error) throw error;
      toast.success("Məqalə yaradıldı!");
      setTitle(""); setSlug(""); setContent(""); setFile(null); setSeoTitle(""); setSeoDesc("");
      fetchPosts(); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let logoUrl = currentLogo;
      let faviconUrl = currentFavicon;

      if (logoFile) logoUrl = await uploadFile(logoFile);
      if (faviconFile) faviconUrl = await uploadFile(faviconFile);

      const payload = {
        site_name: siteName,
        site_description: siteDesc,
        footer_text: footerText,
        logo_url: logoUrl,
        favicon_url: faviconUrl
      };

      if (settingsId) {
        const { error } = await supabase.from('site_settings').update(payload).eq('id', settingsId);
        if (error) throw error;
      } else {
         const { error } = await supabase.from('site_settings').insert(payload);
        if (error) throw error;
      }
      toast.success("Ayarlar yeniləndi!");
      fetchSettings();
    } catch (error: any) {
      toast.error("Xəta baş verdi. Baza qurulubmu?");
      setShowSqlDialog(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Silmək istəyirsiniz?")) return;
    await supabase.from('posts').delete().eq('id', id);
    toast.success("Silindi");
    fetchPosts();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_FIX_SETTINGS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Kopyalandı!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen pb-20 bg-background text-foreground">
      <SEO title="Admin Panel" />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 pt-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => navigate('/'))}>
            Çıxış
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <PenTool className="w-4 h-4" /> Bloq
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Ayarlar
            </TabsTrigger>
          </TabsList>

          {/* BLOG TAB */}
          <TabsContent value="blog" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Area */}
              <Card className="lg:col-span-2 border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Yeni Məqalə</CardTitle>
                  <CardDescription>Yeni bloq yazısı yaratmaq üçün formu doldurun.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBlogSubmit} className="space-y-5">
                    <div className="grid gap-2">
                      <Label>Başlıq</Label>
                      <Input required value={title} onChange={handleTitleChange} placeholder="Məqalənin adı..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Kateqoriya</Label>
                        <Select onValueChange={setCategoryId} required>
                          <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name_az}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Oxuma vaxtı</Label>
                        <Input placeholder="3 dəq" value={readTime} onChange={(e) => setReadTime(e.target.value)} required />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Məzmun (HTML)</Label>
                      <Textarea 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        className="min-h-[200px] font-mono text-sm" 
                        placeholder="<p>Mətn...</p>"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="grid gap-2">
                        <Label>SEO Title</Label>
                        <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Google-da görünən başlıq" />
                      </div>
                      <div className="grid gap-2">
                        <Label>SEO Description</Label>
                        <Input value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Qısa məzmun" />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="grid gap-2 w-1/2">
                        <Label>Ölçü</Label>
                        <Select onValueChange={setCardSize} defaultValue="standard">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="hero">Hero (Böyük)</SelectItem>
                            <SelectItem value="wide">Wide (Geniş)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2 w-1/2">
                        <Label>Şəkil</Label>
                        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      </div>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
                      Dərc Et
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Sidebar List */}
              <div className="space-y-4">
                 <Card className="h-[600px] flex flex-col border-border/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Yazılar ({posts.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                      {posts.map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/80 transition-colors group border border-transparent hover:border-border">
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium truncate">{post.title_az}</h4>
                            <p className="text-xs text-muted-foreground truncate">{post.created_at.split('T')[0]}</p>
                          </div>
                          <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                            <a href={`/post/${post.slug}`} target="_blank" className="p-2 hover:text-primary"><ExternalLink className="w-4 h-4" /></a>
                            <button onClick={() => handleDelete(post.id)} className="p-2 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                 </Card>
              </div>
            </div>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="max-w-2xl mx-auto animate-in fade-in-50 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Sayt Ayarları</CardTitle>
                <CardDescription>Brendinq və SEO məlumatlarını idarə edin.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="grid gap-2">
                    <Label>Saytın Adı (Brand)</Label>
                    <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Sayt.me" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Sayt Haqqında (Description)</Label>
                    <Textarea value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} placeholder="Saytın qısa təsviri..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label>Logo</Label>
                        <div className="flex flex-col gap-2">
                           {currentLogo && <img src={currentLogo} alt="Logo" className="h-10 w-auto object-contain border p-1 rounded" />}
                           <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                        </div>
                     </div>
                     <div className="grid gap-2">
                        <Label>Favicon</Label>
                         <div className="flex flex-col gap-2">
                           {currentFavicon && <img src={currentFavicon} alt="Favicon" className="h-8 w-8 object-contain border p-1 rounded" />}
                           <Input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files?.[0] || null)} />
                        </div>
                     </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Footer Mətni</Label>
                    <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="© 2024 Bütün hüquqlar qorunur." />
                  </div>

                  <Button type="submit" disabled={submitting} variant="secondary" className="w-full">
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <Settings className="mr-2 h-4 w-4" />}
                    Ayarları Yenilə
                  </Button>
                </form>

                <div className="mt-8 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  <p className="flex items-center gap-2 mb-2"><Info className="w-4 h-4" /> <strong>Qeyd:</strong> Xəta baş verərsə SQL:</p>
                  <Button size="sm" variant="outline" onClick={() => setShowSqlDialog(true)} className="w-full">
                    SQL Kodunu Göstər
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* SQL Dialog */}
        <Dialog open={showSqlDialog} onOpenChange={setShowSqlDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings Cədvəlini Yarat</DialogTitle>
              <DialogDescription>Bu kodu Supabase SQL Editor-da işlədin.</DialogDescription>
            </DialogHeader>
            <div className="relative mt-2">
              <pre className="p-4 rounded bg-black/90 text-green-400 text-xs overflow-auto h-40">
                {SQL_FIX_SETTINGS}
              </pre>
              <Button size="sm" className="absolute top-2 right-2" onClick={copyToClipboard}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;