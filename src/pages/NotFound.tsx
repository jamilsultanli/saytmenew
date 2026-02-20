import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ghost, Home, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/utils/image-optimizer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Xətası: İstifadəçi mövcud olmayan səhifəyə daxil olmağa çalışdı:",
      location.pathname,
    );
  }, [location.pathname]);

  // Fetch Site Settings for branding
  const { data: settings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('site_name, logo_url')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden relative">
      {/* Background Decor Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
      
      <div className="text-center max-w-md mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Animated Icon or Logo */}
        <div className="relative inline-block">
          {settings?.logo_url ? (
             <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
               <img 
                 src={optimizeImage(settings.logo_url, 200, 200)} 
                 alt="Logo" 
                 className="w-full h-full object-contain drop-shadow-2xl animate-bounce"
               />
             </div>
          ) : (
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
               <Ghost className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute -bottom-2 w-32 h-4 bg-black/10 blur-md rounded-[100%] mx-auto animate-pulse left-0 right-0" />
        </div>

        <div className="space-y-4">
          <h1 className="text-8xl font-black text-primary/20 select-none">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Ups! Yolunu azmısan deyəsən.</h2>
          <p className="text-muted-foreground text-lg">
            Axtardığın səhifə <strong>{settings?.site_name || "bu saytda"}</strong> mövcud deyil. Ola bilsin ki, silinib və ya ünvan səhv yazılıb.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate(-1)}
            className="group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Geri Qayıt
          </Button>
          
          <Button 
            size="lg" 
            onClick={() => navigate("/")}
            className="group"
          >
            <Home className="mr-2 h-4 w-4" />
            Ana Səhifəyə Get
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;