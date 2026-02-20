import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Tags, 
  LogOut, 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Loader2, 
  Trash2, 
  Edit, 
  Eye, 
  Save, 
  UploadCloud,
  BarChart3,
  Globe
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

type Category = Database['public']['Tables']['categories']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];
type Settings = Database['public']['Tables']['site_settings']['Row'];

// --- Helper Components ---

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

const Admin = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'posts' | 'categories' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    await Promise.all([fetchPosts(), fetchCategories(), fetchSettings()]);
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name_az');
    if (data) setCategories(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').maybeSingle();
    if (data) setSettings(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- Sub-Components (Internal for simpler state access) ---

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in-50">
      <h2 className="text-3xl font-bold tracking-tight">İdarəetmə Paneli</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ümumi Məqalələr" value={posts.length} icon={FileText} description="Sistemsdə olan aktiv yazılar" />
        <StatCard title="Kateqoriyalar" value={categories.length} icon={Tags} description="Mövcud mövzular" />
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
              {posts.slice(0, 5).map(post => (
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
             <Button variant="outline" className="w-full justify-start" onClick={() => setActiveView('posts')}>
               <Plus className="mr-2 h-4 w-4" /> Yeni Məqalə Yaz
             </Button>
             <Button variant="outline" className="w-full justify-start" onClick={() => setActiveView('categories')}>
               <Tags className="mr-2 h-4 w-4" /> Kateqoriya Əlavə et
             </Button>
             <Button variant="outline" className="w-full justify-start" onClick={() => setActiveView('settings')}>
               <Settings className="mr-2 h-4 w-4" /> Sayt Ayarlarını Dəyiş
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const PostsManager = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formSlug, setFormSlug] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formCat, setFormCat] = useState("");
    const [formTime, setFormTime] = useState("");
    const [formSize, setFormSize] = useState("standard");
    const [formFile, setFormFile] = useState<File | null>(null);
    const [formSeoTitle, setFormSeoTitle] = useState("");
    const [formSeoDesc, setFormSeoDesc] = useState("");
    const [uploading, setUploading] = useState(false);

    const resetForm = () => {
      setIsEditing(false); setEditId(null);
      setFormTitle(""); setFormSlug(""); setFormContent(""); setFormCat("");
      setFormTime(""); setFormSize("standard"); setFormFile(null);
      setFormSeoTitle(""); setFormSeoDesc("");
    };

    const handleEdit = (post: Post) => {
      setIsEditing(true);
      setEditId(post.id);
      setFormTitle(post.title_az);
      setFormSlug(post.slug);
      setFormContent(post.content_html);
      setFormCat(post.category_id || "");
      setFormTime(post.read_time_az || "");
      setFormSize(post.card_size || "standard");
      setFormSeoTitle(post.seo_title || "");
      setFormSeoDesc(post.seo_description || "");
    };

    const deletePost = async (id: string) => {
      if(!confirm("Silmək istədiyinizə əminsiniz?")) return;
      await supabase.from('posts').delete().eq('id', id);
      toast.success("Məqalə silindi");
      fetchPosts();
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setUploading(true);
      try {
        let thumbUrl = editId ? posts.find(p => p.id === editId)?.thumbnail_url : null;
        
        if (formFile) {
           const fileExt = formFile.name.split('.').pop();
           const fileName = `${Math.random()}.${fileExt}`;
           const { error: uploadError } = await supabase.storage.from('images').upload(fileName, formFile);
           if (uploadError) throw uploadError;
           const { data } = supabase.storage.from('images').getPublicUrl(fileName);
           thumbUrl = data.publicUrl;
        }

        const payload = {
          title_az: formTitle,
          slug: formSlug || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          content_html: formContent,
          category_id: formCat,
          read_time_az: formTime,
          card_size: formSize as any,
          thumbnail_url: thumbUrl,
          seo_title: formSeoTitle || formTitle,
          seo_description: formSeoDesc
        };

        if (editId) {
          const { error } = await supabase.from('posts').update(payload).eq('id', editId);
          if (error) throw error;
          toast.success("Məqalə yeniləndi");
        } else {
          const { error } = await supabase.from('posts').insert(payload);
          if (error) throw error;
          toast.success("Məqalə yaradıldı");
        }
        
        resetForm();
        fetchPosts();
      } catch (error: any) {
        toast.error("Xəta: " + error.message);
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in-50">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? "Məqaləni Redaktə Et" : "Yeni Məqalə"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Başlıq</Label>
                  <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Kateqoriya</Label>
                    <Select value={formCat} onValueChange={setFormCat} required>
                      <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_az}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Oxuma Vaxtı</Label>
                    <Input value={formTime} onChange={(e) => setFormTime(e.target.value)} placeholder="3 dəq" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Məzmun (HTML)</Label>
                  <Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} className="font-mono min-h-[200px]" required />
                </div>
                <div className="p-4 bg-muted/30 border rounded-lg space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2"><Globe className="w-4 h-4" /> SEO Ayarları</h4>
                  <div className="grid gap-2">
                    <Label>Meta Title</Label>
                    <Input value={formSeoTitle} onChange={(e) => setFormSeoTitle(e.target.value)} placeholder="Google-da görünən başlıq" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Meta Description</Label>
                    <Textarea value={formSeoDesc} onChange={(e) => setFormSeoDesc(e.target.value)} placeholder="Axtarış nəticələrində görünən qısa mətn" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                     <Label>Ölçü (Grid)</Label>
                     <Select value={formSize} onValueChange={setFormSize}>
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                         <SelectItem value="standard">Standard (1x1)</SelectItem>
                         <SelectItem value="wide">Wide (2x1)</SelectItem>
                         <SelectItem value="hero">Hero (2x2)</SelectItem>
                         <SelectItem value="square">Square Icon</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Şəkil</Label>
                    <Input type="file" onChange={(e) => setFormFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditing && <Button type="button" variant="outline" onClick={resetForm}>Ləğv et</Button>}
                  <Button type="submit" disabled={uploading} className="flex-1">
                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Yenilə" : "Dərc Et"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="h-[calc(100vh-100px)] flex flex-col">
            <CardHeader>
              <CardTitle>Məqalələr ({posts.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
               <div className="space-y-2">
                 {posts.map(post => (
                   <div key={post.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between group">
                     <div className="overflow-hidden">
                       <p className="font-medium truncate">{post.title_az}</p>
                       <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(post)}><Edit className="w-4 h-4" /></Button>
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deletePost(post.id)}><Trash2 className="w-4 h-4" /></Button>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const CategoriesManager = () => {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [color, setColor] = useState("blue");

    const addCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      const { error } = await supabase.from('categories').insert({
        name_az: name,
        slug: slug || name.toLowerCase(),
        color_theme: color
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Kateqoriya əlavə olundu");
        setName(""); setSlug("");
        fetchCategories();
      }
    };

    const deleteCat = async (id: string) => {
      if(!confirm("Bu kateqoriyanı silmək istəyirsiniz?")) return;
      await supabase.from('categories').delete().eq('id', id);
      fetchCategories();
      toast.success("Silindi");
    }

    return (
      <div className="grid md:grid-cols-2 gap-8 animate-in fade-in-50">
        <Card>
          <CardHeader>
            <CardTitle>Yeni Kateqoriya</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addCategory} className="space-y-4">
              <div className="grid gap-2">
                <Label>Ad</Label>
                <Input value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase()); }} required />
              </div>
              <div className="grid gap-2">
                <Label>Slug (Link üçün)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label>Rəng Teması</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Əlavə Et</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mövcud Kateqoriyalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${cat.color_theme === 'pink' ? 'pink-500' : cat.color_theme === 'yellow' ? 'yellow-500' : 'blue-500'}`} />
                    <span className="font-medium">{cat.name_az}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteCat(cat.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const SettingsManager = () => {
    const [sName, setSName] = useState(settings?.site_name || "");
    const [sDesc, setSDesc] = useState(settings?.site_description || "");
    const [sFooter, setSFooter] = useState(settings?.footer_text || "");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [favFile, setFavFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        let logoUrl = settings?.logo_url;
        let favUrl = settings?.favicon_url;

        // Upload Helper
        const upload = async (f: File) => {
           const name = `asset-${Date.now()}-${f.name}`;
           const { error } = await supabase.storage.from('images').upload(name, f);
           if (error) throw error;
           const { data } = supabase.storage.from('images').getPublicUrl(name);
           return data.publicUrl;
        };

        if (logoFile) logoUrl = await upload(logoFile);
        if (favFile) favUrl = await upload(favFile);

        const payload = {
          site_name: sName,
          site_description: sDesc,
          footer_text: sFooter,
          logo_url: logoUrl,
          favicon_url: favUrl
        };

        if (settings?.id) {
          await supabase.from('site_settings').update(payload).eq('id', settings.id);
        } else {
          await supabase.from('site_settings').insert(payload);
        }
        
        await fetchSettings();
        // Force reload to update Navbar logos
        window.location.reload();
        toast.success("Ayarlar yadda saxlanıldı!");
      } catch (e: any) {
        toast.error("Xəta: " + e.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto animate-in fade-in-50">
        <Card>
          <CardHeader>
             <CardTitle>Sayt Ayarları</CardTitle>
             <CardDescription>Logo, Favicon və SEO məlumatlarını yeniləyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-2">
                <Label>Saytın Adı</Label>
                <Input value={sName} onChange={(e) => setSName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Təsvir (SEO Description)</Label>
                <Textarea value={sDesc} onChange={(e) => setSDesc(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="border border-dashed rounded-lg p-4 text-center space-y-2">
                       {settings?.logo_url ? (
                         <img src={settings.logo_url} className="h-12 mx-auto object-contain" alt="Logo" />
                       ) : <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />}
                       <Input type="file" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="text-xs" accept="image/*" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="border border-dashed rounded-lg p-4 text-center space-y-2">
                       {settings?.favicon_url ? (
                         <img src={settings.favicon_url} className="h-8 w-8 mx-auto object-contain" alt="Favicon" />
                       ) : <Globe className="h-8 w-8 mx-auto text-muted-foreground" />}
                       <Input type="file" onChange={(e) => setFavFile(e.target.files?.[0] || null)} className="text-xs" accept="image/*" />
                    </div>
                 </div>
              </div>

              <div className="grid gap-2">
                <Label>Footer Mətni</Label>
                <Input value={sFooter} onChange={(e) => setSFooter(e.target.value)} />
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Yadda Saxla
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background flex">
      <SEO title="Admin Dashboard" />
      
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/20 hidden md:block fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Admin
          </h1>
        </div>
        <nav className="px-4 space-y-2">
          <Button 
            variant={activeView === 'dashboard' ? 'secondary' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => setActiveView('dashboard')}
          >
            <BarChart3 className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <Button 
            variant={activeView === 'posts' ? 'secondary' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => setActiveView('posts')}
          >
            <FileText className="mr-2 h-4 w-4" /> Məqalələr
          </Button>
          <Button 
            variant={activeView === 'categories' ? 'secondary' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => setActiveView('categories')}
          >
            <Tags className="mr-2 h-4 w-4" /> Kateqoriyalar
          </Button>
          <Button 
            variant={activeView === 'settings' ? 'secondary' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => setActiveView('settings')}
          >
            <Settings className="mr-2 h-4 w-4" /> Ayarlar
          </Button>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Çıxış
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'posts' && <PostsManager />}
          {activeView === 'categories' && <CategoriesManager />}
          {activeView === 'settings' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

export default Admin;