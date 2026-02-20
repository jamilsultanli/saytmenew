import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export const CategoriesManager = () => {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [color, setColor] = useState("blue");

    const { data: categories = [] } = useQuery({
      queryKey: ['admin-categories'],
      queryFn: async () => {
        const { data } = await supabase.from('categories').select('*');
        return data as Category[] || [];
      }
    });

    const addCategoryMutation = useMutation({
      mutationFn: async () => {
        const finalSlug = slug || slugify(name);
        const { error } = await supabase.from('categories').insert({
          name_az: name,
          slug: finalSlug,
          color_theme: color
        });
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        toast.success("Kateqoriya əlavə olundu");
        setName(""); setSlug("");
      },
      onError: (err) => toast.error(err.message)
    });

    const deleteCategoryMutation = useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        toast.success("Kateqoriya silindi");
      },
      onError: (err) => toast.error(err.message)
    });

    return (
      <div className="grid md:grid-cols-2 gap-8 animate-in fade-in-50">
        <Card>
          <CardHeader>
            <CardTitle>Yeni Kateqoriya</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); addCategoryMutation.mutate(); }} className="space-y-4">
              <div className="grid gap-2">
                <Label>Ad</Label>
                <Input value={name} onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)); }} required />
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
              <Button type="submit" disabled={addCategoryMutation.isPending} className="w-full">
                {addCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Əlavə Et
              </Button>
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
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => { if(confirm("Silinsin?")) deleteCategoryMutation.mutate(cat.id) }}>
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