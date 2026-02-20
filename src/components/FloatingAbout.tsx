import { User, Github, Linkedin, Loader2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { optimizeImage } from "@/utils/image-optimizer";

type Settings = Database['public']['Tables']['site_settings']['Row'];

export const FloatingAbout = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (data) setSettings(data);
      } catch (e) {
        console.error("Error fetching about info", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
    
    // Listen for updates
    const handleUpdate = () => fetchSettings();
    window.addEventListener('settings-updated', handleUpdate);
    return () => window.removeEventListener('settings-updated', handleUpdate);
  }, []);

  // Parse social links
  const socialLinks = (settings?.social_links as any) || {};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="fixed bottom-8 right-8 z-50 flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg group hover:bg-muted transition-all hover:scale-105">
          <span className="text-sm font-medium text-foreground">Haqqımda</span>
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary/50 p-[1px]">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                {settings?.author_image ? (
                  <img 
                    src={optimizeImage(settings.author_image, 100, 100)} 
                    alt="Author" 
                    className="w-full h-full object-cover" 
                    width={36}
                    height={36}
                  />
                ) : (
                  <User className="w-5 h-5 text-foreground" />
                )}
              </div>
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {settings?.site_name || "Marketinq Nümunələri"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {settings?.site_description || "Real marketinq strategiyaları və uğur hekayələri."}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-start gap-4">
              <div className="min-w-12 h-12 w-12 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden shrink-0">
                {settings?.author_image ? (
                   <img 
                     src={optimizeImage(settings.author_image, 100, 100)} 
                     alt="Author" 
                     className="w-full h-full object-cover"
                     width={48}
                     height={48}
                   />
                ) : (
                   <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-medium leading-none text-foreground">{settings?.author_name || "Müəllif haqqında"}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {settings?.about_text || "Bu platforma marketinq sahəsindəki ən son tendensiyaları və case study-ləri Azərbaycan dilində oxuculara çatdırmaq üçün yaradılmışdır."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               {socialLinks.linkedin && (
                 <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-[#0077b5] hover:text-white border border-border transition-all group">
                   <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                   <span className="text-sm font-medium text-muted-foreground group-hover:text-white">LinkedIn</span>
                 </a>
               )}
               {socialLinks.email && (
                 <a href={`mailto:${socialLinks.email}`} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-primary hover:text-primary-foreground border border-border transition-all group">
                   <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
                   <span className="text-sm font-medium text-muted-foreground group-hover:text-primary-foreground">Email</span>
                 </a>
               )}
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-primary text-center italic">
                "Marketinq məhsulların savaşı deyil, qavrayışların savaşıdır." <br/>
                <span className="opacity-70 mt-1 block not-italic font-semibold">— Al Ries</span>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};