import { useEffect, useState } from "react";
import { BentoCard } from "@/components/BentoCard";
import { FilterBar } from "@/components/FilterBar";
import { FloatingAbout } from "@/components/FloatingAbout";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { getIconForCategory } from "@/utils/icon-mapping";
import { Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row']
};

type SiteSettings = Database['public']['Tables']['site_settings']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Get active category from URL or default to "all"
  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Execute all requests in parallel
        const [postsResult, settingsResult, categoriesResult] = await Promise.all([
          supabase
            .from('posts')
            .select(`*, categories:category_id (*)`)
            .order('published_at', { ascending: false }),
          
          supabase
            .from('site_settings')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(),

          supabase
            .from('categories')
            .select('*')
            .order('name_az')
        ]);
        
        if (postsResult.data) setPosts(postsResult.data as unknown as Post[]);
        if (settingsResult.data) setSettings(settingsResult.data);
        if (categoriesResult.data) setCategories(categoriesResult.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete("category");
    } else {
      searchParams.set("category", slug);
    }
    setSearchParams(searchParams);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === "all" || post.categories?.slug === activeCategory;
    const title = post.title_az || "";
    const matchesSearch = title.toLowerCase().includes((searchQuery || "").toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- Dynamic SEO Logic ---
  const activeCategoryData = categories.find(c => c.slug === activeCategory);
  
  const pageTitle = activeCategory === 'all' 
    ? (settings?.hero_title || settings?.site_name || "Sayt.me")
    : `${activeCategoryData?.name_az || 'Marketinq'} Nümunələri və Strategiyaları`;

  const pageDescription = activeCategory === 'all'
    ? (settings?.site_description || "Marketinq nümunələri və strategiyaları")
    : `${activeCategoryData?.name_az} sahəsində ən son tendensiyalar, real biznes nümunələri, brendinq strategiyaları və analizlər.`;

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
        title={pageTitle} 
        description={pageDescription} 
        schema={schemaMarkup}
        favicon={settings?.favicon_url || undefined}
        slug={activeCategory !== 'all' ? `?category=${activeCategory}` : undefined}
      />
      
      <Navbar onSearchChange={setSearchQuery} searchValue={searchQuery} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-20">
        <div className="mb-12 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[120px]">
           {loading ? (
             <div className="flex flex-col items-center gap-4">
               <Skeleton className="h-12 w-3/4 max-w-lg rounded-lg" />
               <Skeleton className="h-6 w-1/2 max-w-md rounded-lg" />
             </div>
           ) : (
             <>
               <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-2 capitalize">
                 {activeCategory === 'all' 
                   ? (settings?.hero_title || settings?.site_name || "Marketinq Nümunələri")
                   : activeCategoryData?.name_az || activeCategory
                 }
               </h1>
               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                 {activeCategory === 'all'
                    ? (settings?.hero_description || settings?.site_description || "Real strategiyalar, uğur hekayələri və brendinq dərsləri.")
                    : `${activeCategoryData?.name_az} haqqında ən faydalı məqalələr və analizlər.`
                 }
               </p>
             </>
           )}
        </div>

        {/* Filter Bar with CLS protection */}
        <div className="min-h-[60px] mb-10">
          {loading ? (
            <div className="flex justify-center gap-3">
               <Skeleton className="h-10 w-24 rounded-xl" />
               <Skeleton className="h-10 w-24 rounded-xl" />
               <Skeleton className="h-10 w-24 rounded-xl" />
               <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          ) : (
            <FilterBar 
              activeCategory={activeCategory} 
              onCategoryChange={handleCategoryChange} 
              categories={categories}
            />
          )}
        </div>
        
        {loading ? (
          /* Skeleton Grid */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
             <Skeleton className="md:col-span-2 md:row-span-2 rounded-3xl" />
             <Skeleton className="md:col-span-1 md:row-span-1 rounded-3xl" />
             <Skeleton className="md:col-span-1 md:row-span-1 rounded-3xl" />
             <Skeleton className="md:col-span-2 md:row-span-1 rounded-3xl" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-muted/20 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold mb-4">
              {posts.length === 0 ? "Hələlik heç bir məqalə yoxdur" : "Axtarışa uyğun nəticə tapılmadı"}
            </h2>
            <p className="text-muted-foreground">
              {posts.length === 0 
                ? "Admin panelindən məqalə əlavə edə bilərsiniz." 
                : "Açar sözləri və ya kateqoriyanı dəyişərək yenidən cəhd edin."}
            </p>
            {activeCategory !== 'all' && (
              <button 
                onClick={() => handleCategoryChange('all')}
                className="mt-4 text-primary hover:underline font-medium"
              >
                Bütün yazılara bax
              </button>
            )}
          </div>
        ) : (
          /* Bento Grid */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px] animate-in fade-in duration-500">
            {filteredPosts.map((post, index) => (
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
                  priority={index < 2} // Prioritize the first two images for LCP
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