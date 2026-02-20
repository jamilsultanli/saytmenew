import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Loader2, Trash2, Edit, Globe } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Post = Database['public']['Tables']['posts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const slugify = (text: string) => {
  const map: Record<string, string> = {
    'ə': 'e', 'Ə': 'e', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's', 
    'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ı': 'i', 'I': 'i', 
    'ç': 'c', 'Ç': 'c', 'İ': 'i'
  };
  return text.split('').map(char => map[char] || char).join('').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
};

export const PostsManager = () => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formSlug, setFormSlug] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formCat, setFormCat] = useState("");
    const [formTime, setFormTime] = useState("");
    const [formSize, setFormSize] = useState("standard");
    const [formFile, setFormFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formSeoTitle, setFormSeoTitle] = useState("");
    const [formSeoDesc, setFormSeoDesc] = useState("");

    const { data: categories = [] } = useQuery({
      queryKey: ['admin-categories'],
      queryFn: async () => {
        const { data } = await supabase.from('categories').select('*');
        return data as Category[] || [];
      }
    });

    const { data: posts = [] } = useQuery({
      queryKey: ['admin-posts'],
      queryFn: async () => {
        const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        return data as Post[] || [];
      }
    });

    const savePostMutation = useMutation({
      mutationFn: async () => {
        let thumbUrl = editId ? posts.find(p => p.id === editId)?.thumbnail_url : null;
        
        if (formFile) {
           const fileExt = formFile.name.split('.').pop();
           const randomName = Math.random().toString(36).substring(7);
           const fileName = `post-${Date.now()}-${randomName}.${fileExt}`;
           const { error: uploadError } = await supabase.storage.from('images').upload(fileName, formFile);
           if (uploadError) throw uploadError;
           const { data } = supabase.storage.from('images').getPublicUrl(fileName);
           thumbUrl = data.publicUrl;
        }

        const finalSlug = formSlug || slugify(formTitle);

        const payload = {
          title_az: formTitle,
          slug: finalSlug,
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
        } else {
          const { error } = await supabase.from('posts').insert(payload);
          if (error) throw error;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
        toast.success(isEditing ? "Məqalə yeniləndi" : "Məqalə yaradıldı");
        resetForm();
      },
      onError: (error) => toast.error("Xəta: " + error.message)
    });

    const deletePostMutation = useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
        toast.success("Məqalə silindi");
      },
      onError: (err) => toast.error(err.message)
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFormTitle(val);
      if (!isEditing) setFormSlug(slugify(val));
    };

    const resetForm = () => {
      setIsEditing(false); setEditId(null);
      setFormTitle(""); setFormSlug(""); setFormContent(""); setFormCat("");
      setFormTime(""); setFormSize("standard"); setFormFile(null); setImagePreview(null);
      setFormSeoTitle(""); setFormSeoDesc("");
    };

    const handleEdit = (post: Post) => {
      setIsEditing(true); setEditId(post.id);
      setFormTitle(post.title_az); setFormSlug(post.slug); setFormContent(post.content_html);
      setFormCat(post.category_id || ""); setFormTime(post.read_time_az || "");
      setFormSize(post.card_size || "standard"); setFormSeoTitle(post.seo_title || "");
      setFormSeoDesc(post.seo_description || ""); setImagePreview(post.thumbnail_url);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        setFormFile(e.target.files[0]);
        setImagePreview(URL.createObjectURL(e.target.files[0]));
      }
    };

    const quillModules = {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in-50">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? "Məqaləni Redaktə Et" : "Yeni Məqalə"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); savePostMutation.mutate(); }} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Başlıq</Label>
                  <Input value={formTitle} onChange={handleTitleChange} required />
                </div>
                
                <div className="grid gap-2">
                  <Label>Slug (URL Linki)</Label>
                  <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="avtomatik-yaradilir" required />
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
                  <Label>Məzmun</Label>
                  <div className="prose-editor-wrapper">
                    <ReactQuill 
                      theme="snow"
                      value={formContent} 
                      onChange={setFormContent} 
                      modules={quillModules}
                      className="h-64 mb-12"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/30 border rounded-lg space-y-4 mt-8">
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
                    <Input type="file" onChange={handleFileSelect} />
                    {imagePreview && <img src={imagePreview} className="mt-2 h-20 w-auto rounded border" alt="Preview" />}
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditing && <Button type="button" variant="outline" onClick={resetForm}>Ləğv et</Button>}
                  <Button type="submit" disabled={savePostMutation.isPending} className="flex-1">
                    {savePostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { if(confirm("Silinsin?")) deletePostMutation.mutate(post.id) }}><Trash2 className="w-4 h-4" /></Button>
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