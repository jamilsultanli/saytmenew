import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { FloatingAbout } from "@/components/FloatingAbout";
import { Database } from "@/integrations/supabase/types";
import { Clock, Calendar, ChevronLeft, Share2, Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";
import { BentoCard } from "@/components/BentoCard";
import { getIconForCategory } from "@/utils/icon-mapping";

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row']
};

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<{
    favicon_url: string | null, 
    author_name: string | null, 
    author_image: string | null 
  } | null>(null);

  useEffect(() => {
    if (slug) {
      window.scrollTo(0, 0); 
      fetchPost(slug);
    }
    fetchSettings();
  }, [slug]);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('favicon_url, author_name, author_image').single();
    if (data) setSiteSettings(data);
  };

  const fetchPost = async (slug: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`*, categories:category_id (*)`)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      
      if (data) {
        const currentPost = data as unknown as Post;
        setPost(currentPost);
        fetchRelatedPosts(currentPost.category_id, currentPost.id);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (categoryId: string, currentPostId: string) => {
     const { data } = await supabase
       .from('posts')
       .select(`*, categories:category_id (*)`)
       .eq('category_id', categoryId)
       .neq('id', currentPostId)
       .limit(3); 
     
     if (data) setRelatedPosts(data as unknown as Post[]);
  };

  const handleShare = async () => {
    if (!post) return;
    const shareData = {
      title: post.title_az,
      text: post.seo_description || post.title_az,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log("Error sharing", err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link kopyalandı!");
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!post) return null;

  // Schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.seo_title || post.title_az,
    "description": post.seo_description,
    "image": post.thumbnail_url ? [post.thumbnail_url] : [],
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "author": { "@type": "Person", "name": siteSettings?.author_name || "Admin" }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-32 overflow-x-hidden">
      <SEO 
        title={post.seo_title || post.title_az}
        description={post.seo_description || ""}
        image={post.thumbnail_url || undefined}
        slug={`post/${post.slug}`}
        type="article"
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        schema={[articleSchema]}
        favicon={siteSettings?.favicon_url || undefined}
      />

      <Navbar />
      <FloatingAbout />

      <main className="pt-32 w-full">
        {/* Article Header */}
        <div className="max-w-3xl mx-auto px-6 text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Ana Səhifə
           </Link>

           <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary`}>
                {post.categories?.name_az || 'Blog'}
              </span>
              <span className="text-muted-foreground text-xs font-medium flex items-center gap-1">
                 <Clock className="w-3 h-3" /> {post.read_time_az} oxu
              </span>
           </div>

           <h1 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-8 text-foreground text-balance break-words">
             {post.title_az}
           </h1>

           <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground border-t border-b border-border/50 py-4 w-fit mx-auto px-6">
              <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 {post.published_at && format(new Date(post.published_at), "d MMMM yyyy", { locale: az })}
              </div>
           </div>
        </div>

        {/* Featured Image - Wide but not full screen */}
        {post.thumbnail_url && (
          <div className="max-w-5xl mx-auto px-4 md:px-6 mb-16 animate-in zoom-in-95 duration-700 delay-100">
             <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                <img 
                  src={post.thumbnail_url} 
                  alt={post.title_az} 
                  className="w-full h-full object-cover"
                />
             </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-3xl mx-auto px-6 w-full">
          <article className="
            prose prose-lg md:prose-xl dark:prose-invert max-w-none w-full
            whitespace-normal break-words hyphens-none
            prose-p:text-muted-foreground prose-p:leading-8 prose-p:font-normal
            prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-12 prose-headings:mb-6 prose-headings:break-words
            prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:text-xl md:prose-h3:text-2xl
            prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-a:break-all
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-foreground prose-blockquote:font-medium prose-blockquote:bg-muted/20 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
            prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-10 prose-img:border prose-img:border-border prose-img:w-full prose-img:h-auto
            prose-li:text-muted-foreground prose-li:marker:text-primary prose-li:leading-7
            prose-strong:text-foreground prose-strong:font-bold
            prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-[''] prose-code:break-all
            [&_p]:mb-6 [&_ul]:mb-6 [&_ol]:mb-6
            text-left
          ">
            <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
          </article>

          {/* Tags / Share / Navigation Footer */}
          <div className="mt-16 pt-8 border-t border-border">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-2">
                   {/* Tags could go here if we had them */}
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <Button onClick={handleShare} variant="outline" className="w-full md:w-auto rounded-full gap-2 hover:bg-muted hover:text-foreground transition-all">
                      <Share2 className="w-4 h-4" /> Paylaş
                   </Button>
                   <Button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} variant="ghost" className="rounded-full">
                      Yuxarı
                   </Button>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="mt-24 py-16 bg-muted/30 border-t border-border">
           <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Digər maraqlı yazılar</h2>
                 <Link to="/" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4">
                    Bütün yazılar <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {relatedPosts.map((related) => (
                    <Link to={`/post/${related.slug}`} key={related.id} className="group block h-full">
                       <BentoCard 
                         title={related.title_az}
                         category={related.categories?.name_az || "Blog"}
                         readTime={related.read_time_az || "3 dəq"}
                         image={related.thumbnail_url || undefined}
                         size="standard" // Force standard size for consistency in footer
                         icon={related.card_size === 'square' ? getIconForCategory(related.categories?.slug || '') : undefined}
                         className="h-[340px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                       />
                    </Link>
                 ))}
              </div>
              
              <div className="mt-8 text-center md:hidden">
                 <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Bütün yazılar <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
           </div>
        </section>
      )}
    </div>
  );
};

export default PostDetail;