import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { FloatingAbout } from "@/components/FloatingAbout";
import { Database } from "@/integrations/supabase/types";
import { Helmet } from "react-helmet-async";
import { Clock, Calendar, ChevronLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { az } from "date-fns/locale";

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row']
};

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

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
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Yüklənir...</div>;
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-cyan-500/30 pb-20">
      <Helmet>
        <title>{post.seo_title || post.title_az} | MARKETİNQ NÜMUNƏLƏRİ</title>
        <meta name="description" content={post.seo_description || post.title_az} />
        <meta property="og:title" content={post.seo_title || post.title_az} />
        <meta property="og:description" content={post.seo_description || post.title_az} />
        {post.og_image_url && <meta property="og:image" content={post.og_image_url} />}
        {post.thumbnail_url && <meta property="og:image" content={post.thumbnail_url} />}
      </Helmet>

      <Navbar />
      <FloatingAbout />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-32">
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-8 text-gray-400 hover:text-white hover:bg-white/5 pl-0 gap-2"
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="w-4 h-4" />
          Geri qayıt
        </Button>

        {/* Hero Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-3 py-1 rounded-full border bg-${post.categories?.color_theme === 'pink' ? 'pink' : post.categories?.color_theme === 'yellow' ? 'yellow' : 'cyan'}-500/10 text-${post.categories?.color_theme === 'pink' ? 'pink' : post.categories?.color_theme === 'yellow' ? 'yellow' : 'cyan'}-400 border-${post.categories?.color_theme === 'pink' ? 'pink' : post.categories?.color_theme === 'yellow' ? 'yellow' : 'cyan'}-500/20`}>
              {post.categories?.name_az}
            </span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{post.read_time_az}</span>
            </div>
            {post.published_at && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(post.published_at), "d MMMM yyyy", { locale: az })}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight glow-text-blue">
            {post.title_az}
          </h1>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group">
          <img 
            src={post.thumbnail_url} 
            alt={post.title_az}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
        </div>

        {/* Content Body */}
        <article className="prose prose-invert prose-lg max-w-none">
          <div 
            className="text-gray-300 leading-relaxed space-y-6 [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-12 [&>h2]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2"
            dangerouslySetInnerHTML={{ __html: post.content_html }} 
          />
        </article>

        {/* Share Section */}
        <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
          <span className="text-gray-400">Bu məqaləni paylaş:</span>
          <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

      </main>
    </div>
  );
};

export default PostDetail;