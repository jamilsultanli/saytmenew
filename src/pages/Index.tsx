import { useEffect, useState } from "react";
import { BentoCard } from "@/components/BentoCard";
import { FilterBar } from "@/components/FilterBar";
import { FloatingAbout } from "@/components/FloatingAbout";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { getIconForCategory } from "@/utils/icon-mapping";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row']
};

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          categories:category_id (*)
        `)
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data as unknown as Post[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = activeCategory === "all" 
    ? posts 
    : posts.filter(post => post.categories?.slug === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-cyan-500/30">
      <Helmet>
        <title>MARKETİNQ NÜMUNƏLƏRİ | Real Strategiyalar</title>
        <meta name="description" content="Real marketinq nümunələri və strategiyaları. Dünyanın ən böyük şirkətlərinin uğur hekayələri." />
      </Helmet>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-20">
        <FilterBar />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Hələlik heç bir məqalə yoxdur</h2>
            <p className="text-gray-400">Zəhmət olmasa Supabase bazasına məlumat əlavə edin.</p>
          </div>
        ) : (
          /* Bento Grid */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
            {filteredPosts.map((post) => (
              <Link 
                to={`/post/${post.slug}`}
                key={post.id}
                className={
                  post.card_size === 'hero' ? "md:col-span-2 md:row-span-2" :
                  post.card_size === 'wide' ? "md:col-span-2 md:row-span-1" :
                  "md:col-span-1 md:row-span-1"
                }
              >
                <BentoCard
                  size={post.card_size}
                  title={post.title_az}
                  category={post.categories?.name_az || 'Ümumi'}
                  readTime={post.read_time_az}
                  colorTheme={post.categories?.color_theme as any || 'blue'}
                  image={post.thumbnail_url}
                  icon={post.card_size === 'square' ? getIconForCategory(post.categories?.slug || '') : undefined}
                  className="h-full"
                />
              </Link>
            ))}
          </div>
        )}
      </main>

      <FloatingAbout />
    </div>
  );
};

export default Index;