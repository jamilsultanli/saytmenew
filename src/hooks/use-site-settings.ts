import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Settings = Database['public']['Tables']['site_settings']['Row'];

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      // Birbaşa bütün məlumatları çəkirik, sıralama olmadan
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1);

      if (error) {
        console.error("Site Settings Fetch Error:", error);
        throw error;
      }

      // Əgər data boşdursa null qaytar
      if (!data || data.length === 0) {
        return null;
      }

      // İlk sətri qaytar
      return data[0] as Settings;
    },
    staleTime: 0, // Keşləməni söndürürük
    refetchOnWindowFocus: true,
  });
};