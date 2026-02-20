import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Settings = Database['public']['Tables']['site_settings']['Row'];

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      console.log("Fetching site settings...");
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        // Filter out empty rows to ensure we get valid data
        .not('site_name', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching settings:", error);
        throw error;
      }

      console.log("Fetched settings:", data);
      return data as Settings;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};