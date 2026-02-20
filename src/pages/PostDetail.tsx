import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { FloatingAbout } from "@/components/FloatingAbout";
import { Database } from "@/integrations/supabase/types";
import { Clock, Calendar, ChevronLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row']
};

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<{favicon_url: string | null} | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
    fetchSettings();
  }, [slug]);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('favicon_url').single();
    if (data) setSiteSettings(data);
  };

  const fetchPost = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories:category_id (*)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (data) setPost(data as unknown as Post);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Yüklənir...</div>;
  }

  if (!post) return null;

  // Structured Data (Schema.org) for Google
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.seo_title || post.title_az,
    "description": post.seo_description,
    "image": post.thumbnail_url ? [post.thumbnail_url] : [],
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "author": {
      "@type": "Organization",
      "name": "Sayt.me"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sayt.me",
      "logo": {
        "@type": "ImageObject",
        "url": window.location.origin + "/placeholder.svg" // Fallback or dynamic logo
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Ana Səhifə",
      "item": window.location.origin
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": post.categories?.name_az || "Blog",
      "item": `${window.location.origin}/?category=${post.categories?.slug}`
    }, {
      "@type": "ListItem",
      "position": 3,
      "name": post.title_az
    }]
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
      <SEO 
        title={post.seo_title || post.title_az}
        description={post.seo_description || ""}
        image={post.thumbnail_url || undefined}
        slug={`post/${post.slug}`}
        type="article"
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        schema={[articleSchema, breadcrumbSchema]}
        favicon={siteSettings?.favicon_url || undefined}
      />

      <Navbar />
      <FloatingAbout />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-32">
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-8 pl-0 gap-2 hover:bg-transparent hover:text-primary"
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="w-4 h-4" />
          Ana səhifəyə qayıt
        </Button>

        {/* Hero Section */}
        <div className="space-y-6 mb-12">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary font-medium">
              {post.categories?.name_az || 'Kateqoriya'}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{post.read_time_az}</span>
            </div>
            {post.published_at && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(post.published_at), "d MMMM yyyy", { locale: az })}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
            {post.title_az}
          </h1>
        </div>

        {/* Featured Image */}
        {post.thumbnail_url && (
          <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 border border-border shadow-lg">
            <img 
              src={post.thumbnail_url} 
              alt={post.title_az}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Body */}
        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content_html }} 
          />
        </article>

        {/* Share Section */}
        <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Bu məqaləni paylaş:</span>
          <Button variant="outline" size="icon" className="rounded-full">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

      </main>
    </div>
  );
};

export default PostDetail;