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
import { SEO } from "@/components/SEO";

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row']
};

type SiteSettings = Database['public']['Tables']['site_settings']['Row'];

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Posts
        const { data: postsData } = await supabase
          .from('posts')
          .select(`*, categories:category_id (*)`)
          .order('published_at', { ascending: false });
        
        if (postsData) setPosts(postsData as unknown as Post[]);

        // Fetch Settings
        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('*')
          .single();
        
        if (settingsData) setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === "all" || post.categories?.slug === activeCategory;
    const title = post.title_az || "";
    const matchesSearch = title.toLowerCase().includes((searchQuery || "").toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Schema Markup for WebSite
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": settings?.site_name || "Sayt.me",
    "url": window.location.origin,
    "description": settings?.site_description || "Marketinq nümunələri və strategiyaları",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${window.location.origin}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <SEO 
        title={settings?.site_name || "Sayt.me"} 
        description={settings?.site_description || "Marketinq nümunələri və strategiyaları"} 
        schema={schemaMarkup}
        favicon={settings?.favicon_url || undefined}
      />
      
      <Navbar onSearchChange={setSearchQuery} searchValue={searchQuery} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-20">
        <div className="mb-12 text-center space-y-4">
           <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-2">
             {settings?.site_name || "Marketinq Nümunələri"}
           </h1>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             {settings?.site_description || "Real strategiyalar, uğur hekayələri və brendinq dərsləri."}
           </p>
        </div>

        <FilterBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-muted/20">
            <h2 className="text-2xl font-bold mb-4">
              {posts.length === 0 ? "Hələlik heç bir məqalə yoxdur" : "Axtarışa uyğun nəticə tapılmadı"}
            </h2>
            <p className="text-muted-foreground">
              {posts.length === 0 
                ? "Admin panelindən məqalə əlavə edə bilərsiniz." 
                : "Açar sözləri dəyişərək yenidən cəhd edin."}
            </p>
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

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>{settings?.footer_text || `© ${new Date().getFullYear()} Bütün hüquqlar qorunur.`}</p>
        </div>
      </footer>

      <FloatingAbout />
    </div>
  );
};

export default Index;