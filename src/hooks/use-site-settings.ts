import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Settings = Database['public']['Tables']['site_settings']['Row'];

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      // Ən son yenilənən sətri götürürük
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Site Settings Fetch Error:", error);
        return null;
      }

      return data as Settings;
    },
    staleTime: 1000 * 60 * 5, // 5 dəqiqə cache
    retry: 2,
  });
};