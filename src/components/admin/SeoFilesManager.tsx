import { Bot, FileCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const SeoFilesManager = () => {
    const PROJECT_REF = "qnpoftjwfwzgxmuzqauc";
    const functionsBaseUrl = `https://${PROJECT_REF}.supabase.co/functions/v1`;

    const copyToClipboard = (text: string) => {
       navigator.clipboard.writeText(text);
       toast.success("Link kopyalandı!");
    };

    return (
       <div className="max-w-4xl mx-auto animate-in fade-in-50 space-y-6">
          <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /> Dinamik SEO Faylları</CardTitle>
                <CardDescription>
                   Saytınızın axtarış sistemləri və AI botları tərəfindən oxunması üçün dinamik fayllar.
                </CardDescription>
             </CardHeader>
             <CardContent className="grid gap-6">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                   <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2"><FileCode className="w-4 h-4" /> sitemap.xml</h4>
                      <p className="text-sm text-muted-foreground">Bütün məqalə və kateqoriyaların xəritəsi.</p>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(`${functionsBaseUrl}/sitemap`, '_blank')}>Görüntülə</Button>
                      <Button size="sm" onClick={() => copyToClipboard(`${functionsBaseUrl}/sitemap`)}>Linki Kopyala</Button>
                   </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                   <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2"><FileCode className="w-4 h-4" /> robots.txt</h4>
                      <p className="text-sm text-muted-foreground">Axtarış botlarının qaydaları.</p>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(`${functionsBaseUrl}/robots`, '_blank')}>Görüntülə</Button>
                      <Button size="sm" onClick={() => copyToClipboard(`${functionsBaseUrl}/robots`)}>Linki Kopyala</Button>
                   </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                   <div className="space-y-1">
                      <h4 className="font-semibold flex items-center gap-2"><FileCode className="w-4 h-4" /> llms.txt</h4>
                      <p className="text-sm text-muted-foreground">AI modelləri (LLM) üçün optimallaşdırılmış məzmun.</p>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(`${functionsBaseUrl}/llms`, '_blank')}>Görüntülə</Button>
                      <Button size="sm" onClick={() => copyToClipboard(`${functionsBaseUrl}/llms`)}>Linki Kopyala</Button>
                   </div>
                </div>
             </CardContent>
          </Card>
       </div>
    );
 };