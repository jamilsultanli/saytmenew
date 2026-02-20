import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Category = Database['public']['Tables']['categories']['Row'];

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
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
      throw uploadError;
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
        thumbnailUrl = await handleImageUpload() || "";
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
      // Reset form
      setTitle("");
      setSlug("");
      setContent("");
      setFile(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Xəta baş verdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 pt-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Yeni Məqalə</h1>
          <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => navigate('/'))}>
            Çıxış
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 glass-panel p-8 rounded-2xl">
          
          <div className="grid gap-2">
            <Label className="text-white">Başlıq (AZ)</Label>
            <Input 
              required 
              value={title} 
              onChange={handleTitleChange}
              className="bg-white/5 border-white/10 text-white" 
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-white">Slug (Avtomatik)</Label>
            <Input 
              value={slug} 
              readOnly 
              className="bg-white/5 border-white/10 text-gray-400" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-white">Kateqoriya</Label>
              <Select onValueChange={setCategoryId} required>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name_az}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-white">Oxuma Vaxtı</Label>
              <Input 
                placeholder="məs: 2 dəq" 
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-white">Kart Ölçüsü</Label>
            <Select onValueChange={setCardSize} defaultValue="standard">
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Standard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (1x1)</SelectItem>
                <SelectItem value="hero">Hero (2x2)</SelectItem>
                <SelectItem value="wide">Wide (2x1)</SelectItem>
                <SelectItem value="square">Square (Icon style)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">Hero: Böyük şəkil. Wide: Geniş kart. Square: İkon mərkəzli.</p>
          </div>

          <div className="grid gap-2">
            <Label className="text-white">Şəkil / Thumbnail</Label>
            <div className="flex items-center gap-4">
               <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-white/5 border-white/10 text-white file:bg-cyan-900 file:text-cyan-100 file:border-0 file:rounded-md"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-white">Məzmun (HTML/Text)</Label>
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] bg-white/5 border-white/10 text-white font-mono"
              placeholder="<p>Məqalə mətni...</p>"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
            {submitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
            Yadda Saxla
          </Button>

        </form>
      </main>
    </div>
  );
};

export default Admin;