import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const GlobalScripts = () => {
  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('google_analytics_id, google_tag_manager_id, google_search_console_code')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: Infinity, // Settings rarely change during session
  });

  const analyticsId = settings?.google_analytics_id;
  const gtmId = settings?.google_tag_manager_id;
  const gscCode = settings?.google_search_console_code;

  return (
    <Helmet>
      {/* Google Search Console Verification */}
      {gscCode && (
        <meta name="google-site-verification" content={gscCode} />
      )}

      {/* Google Analytics 4 (GA4) */}
      {analyticsId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}></script>
      )}
      {analyticsId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${analyticsId}');
          `}
        </script>
      )}

      {/* Google Tag Manager (Head) */}
      {gtmId && (
        <script>
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </script>
      )}
    </Helmet>
  );
};