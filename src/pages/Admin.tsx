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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, ExternalLink, Database as DbIcon, AlertCircle, Copy, Check, Info, RefreshCw } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { seedDatabase } from "@/utils/seed";

type Category = Database['public']['Tables']['categories']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

// NUCLEAR OPTION: Drop and Recreate tables without RLS
const SQL_FIX_CODE = `-- BU KOD BÜTÜN CƏDVƏLLƏRİ SİLİB YENİDƏN YARADACAQ
-- RLS (Təhlükəsizlik) söndürülmüş halda olacaq

-- 1. Mövcud cədvəlləri sil (Təmizlik)
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.categories;

-- 2. Categories cədvəlini yarat
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_az TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color_theme TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Posts cədvəlini yarat
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_az TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content_html TEXT NOT NULL,
  thumbnail_url TEXT,
  read_time_az TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  card_size TEXT DEFAULT 'standard',
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Təhlükəsizlik kilidlərini söndür (Yazmağa icazə ver)
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;

-- 5. Storage (Şəkillər üçün) buckets yarat
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage icazələrini yenilə (Köhnələri silib yenisini yaradırıq ki, xəta olmasın)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'images' ); 
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'images' );
`;

const PROJECT_ID = "qnpoftjwfwzgxmuzqauc";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [showSqlDialog, setShowSqlDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [readTime, setReadTime] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cardSize, setCardSize] = useState("standard");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    checkUser();
    fetchCategories();
    fetchPosts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error("Error fetching categories:", error);
    if (data) setCategories(data);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (error) console.error("Error fetching posts:", error);
    if (data) setPosts(data);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSlug(generateSlug(e.target.value));
  };

  const handleImageUpload = async () => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Fallback if storage fails (don't break the post creation)
      return null;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let thumbnailUrl = "";
      if (file) {
        const url = await handleImageUpload();
        if (url) thumbnailUrl = url;
      }

      const { error } = await supabase.from('posts').insert({
        title_az: title,
        slug,
        content_html: content,
        read_time_az: readTime,
        category_id: categoryId,
        card_size: cardSize as any,
        thumbnail_url: thumbnailUrl,
      });

      if (error) throw error;

      toast.success("Məqalə uğurla yaradıldı!");
      // Reset form & Refresh list
      setTitle("");
      setSlug("");
      setContent("");
      setFile(null);
      fetchPosts(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Xəta baş verdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu məqaləni silmək istədiyinizə əminsiniz?")) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      toast.success("Məqalə silindi");
      fetchPosts();
    } catch (error: any) {
      toast.error("Silinmə zamanı xəta: " + error.message);
    }
  };

  const handleSeed = async () => {
    if (!confirm("Demo məlumatlar yüklənsin? Bu mövcud kateqoriyaları yeniləyə bilər.")) return;
    
    setSeeding(true);
    setSeedError(null);
    
    try {
      const success = await seedDatabase();
      if (success) {
        fetchCategories();
        fetchPosts();
        toast.success("Məlumatlar yükləndi! Səhifə yenilənir...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setSeedError("RLS İcazə xətası.");
      }
    } catch (error: any) {
      setSeedError(error.message);
    } finally {
      setSeeding(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_FIX_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("SQL kodu kopyalandı!");
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="secondary" 
              onClick={handleSeed} 
              disabled={seeding}
              className="bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/40 border border-cyan-500/30 w-full md:w-auto"
            >
              {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DbIcon className="mr-2 h-4 w-4" />}
              Demo Data Yüklə
            </Button>
            <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => navigate('/'))} className="w-full md:w-auto">
              Çıxış
            </Button>
          </div>
        </div>

        {seedError && (
          <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-900/10 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>İcazə Xətası (RLS)</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>Məlumat bazası boşdur və ya kilidlidir. Aşağıdakı həll yolunu tətbiq edin: <b>Cədvəlləri tam sıfırlamaq.</b></span>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-fit bg-red-950/50 border-red-500/50 hover:bg-red-900/50 text-white"
                onClick={() => setShowSqlDialog(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sıfırlama Kodu (SQL)
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CREATE POST FORM */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Yeni Məqalə</h2>
            <form onSubmit={handleSubmit} className="space-y-5 glass-panel p-6 rounded-2xl">
              
              <div className="grid gap-2">
                <Label className="text-white">Başlıq (AZ)</Label>
                <Input required value={title} onChange={handleTitleChange} className="bg-white/5 border-white/10 text-white" />
              </div>

              <div className="grid gap-2">
                <Label className="text-white">Slug</Label>
                <Input value={slug} readOnly className="bg-white/5 border-white/10 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-white">Kateqoriya</Label>
                  <Select onValueChange={setCategoryId} required>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Seçin" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name_az}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-white">Vaxt</Label>
                  <Input placeholder="məs: 2 dəq" value={readTime} onChange={(e) => setReadTime(e.target.value)} required className="bg-white/5 border-white/10 text-white"/>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-white">Ölçü</Label>
                <Select onValueChange={setCardSize} defaultValue="standard">
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Standard" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (1x1)</SelectItem>
                    <SelectItem value="hero">Hero (2x2)</SelectItem>
                    <SelectItem value="wide">Wide (2x1)</SelectItem>
                    <SelectItem value="square">Square (Icon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-white">Şəkil</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-white/5 border-white/10 text-white file:bg-cyan-900 file:text-cyan-100 file:border-0 file:rounded-md"/>
              </div>

              <div className="grid gap-2">
                <Label className="text-white">Məzmun (HTML)</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[150px] bg-white/5 border-white/10 text-white font-mono" placeholder="<p>Mətn...</p>"/>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
                {submitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
                Yadda Saxla
              </Button>
            </form>
          </section>

          {/* POST LIST */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Mövcud Məqalələr</h2>
            <div className="glass-panel p-4 rounded-2xl h-[800px] overflow-y-auto space-y-3 custom-scrollbar">
              {posts.length === 0 ? (
                 <p className="text-gray-500 text-center py-4">Məqalə yoxdur.</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-10 h-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                         {post.thumbnail_url && <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover opacity-70" />}
                       </div>
                       <div className="min-w-0">
                         <h4 className="text-sm font-medium text-white truncate">{post.title_az}</h4>
                         <p className="text-xs text-gray-500 truncate">/{post.slug}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a href={`/post/${post.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-cyan-400 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center text-gray-500 text-xs gap-2">
          <Info className="w-4 h-4" />
          <span>Project ID: <span className="text-cyan-400 font-mono">{PROJECT_ID}</span> (SQL Editor-da bu layihədə olduğunuza əmin olun)</span>
        </div>

        {/* SQL FIX DIALOG */}
        <Dialog open={showSqlDialog} onOpenChange={setShowSqlDialog}>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Məlumat Bazasını Tam Sıfırla (Nuclear Option)</DialogTitle>
              <DialogDescription className="text-gray-400">
                Bu kod bütün cədvəlləri siləcək, yenidən yaradacaq və təhlükəsizlik kilidlərini (RLS) söndürəcək.
                <br />
                <b>Supabase Dashboard {'>'} SQL Editor</b> səhifəsində işlədin.
              </DialogDescription>
            </DialogHeader>
            
            <div className="relative mt-4">
              <pre className="p-4 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-green-400 overflow-x-auto h-52 select-all">
                {SQL_FIX_CODE}
              </pre>
              <Button 
                size="sm" 
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white border-white/10"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Kopyalandı" : "Kopyala"}
              </Button>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowSqlDialog(false)} variant="secondary">
                Bağla
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;