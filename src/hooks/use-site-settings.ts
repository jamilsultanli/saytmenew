import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Settings = Database['public']['Tables']['site_settings']['Row'];

export const useSiteSettings = () => {
  return useQuery({
    // Cache-i məcburi yeniləmək üçün versiyanı dəyişdim 'v2'
    queryKey: ['siteSettings', 'v2'],
    queryFn: async () => {
      console.log("Site settings yüklənir...");
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        // Boş sətirləri (null) ignor et
        .not('site_name', 'is', null)
        // Ən son yaradılan və ya yenilənən məlumatı götür
        .order('id', { ascending: false }) 
        .limit(1);

      if (error) {
        console.error("Fetch Error:", error);
        throw error;
      }

      // Əgər heç nə tapılmasa null qaytar
      if (!data || data.length === 0) {
        console.log("Məlumat tapılmadı (Array boşdur)");
        return null;
      }

      console.log("Tapılan ayarlar:", data[0]);
      return data[0] as Settings;
    },
    staleTime: 0, 
    refetchOnWindowFocus: true,
  });
};