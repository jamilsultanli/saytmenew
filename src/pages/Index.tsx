import { BentoCard } from "@/components/BentoCard";
import { FilterBar } from "@/components/FilterBar";
import { FloatingAbout } from "@/components/FloatingAbout";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { getIconForCategory } from "@/utils/icon-mapping";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSiteSettings } from "@/hooks/use-site-settings";

type Post = Database['public']['Tables']['posts']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row']
};

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const activeCategory = searchParams.get("category") || "all";

  // Use the new centralized hook
  const { data: settings } = useSiteSettings();

  // Fetch Categories
  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name_az');
      return data || [];
    }
  });

  // Fetch Posts with Server-Side Filtering
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts', activeCategory, debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`*, categories:category_id!inner(*)`)
        .order('published_at', { ascending: false });

      if (activeCategory !== 'all') {
        // We use !inner join to filter by related table column
        query = query.eq('categories.slug', activeCategory);
      }

      if (debouncedSearch) {
        query = query.ilike('title_az', `%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
      
      return (data as unknown as Post[]) || [];
    },
    staleTime: 1000 * 60 * 2 // Cache for 2 minutes
  });

  const loading = catsLoading || postsLoading;

  const handleCategoryChange = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete("category");
    } else {
      searchParams.set("category", slug);
    }
    setSearchParams(searchParams);
  };

  // --- Dynamic SEO Logic ---
  const activeCategoryData = categories.find(c => c.slug === activeCategory);
  
  const pageTitle = activeCategory === 'all' 
    ? (settings?.hero_title || settings?.site_name || "Sayt.me")
    : `${activeCategoryData?.name_az || 'Marketinq'} Nümunələri və Strategiyaları`;

  const pageDescription = activeCategory === 'all'
    ? (settings?.site_description || "Marketinq nümunələri və strategiyaları")
    : `${activeCategoryData?.name_az} sahəsində ən son tendensiyalar, real biznes nümunələri, brendinq strategiyaları və analizlər.`;

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
             <Skeleton className="md:col-span-2 md:row-span-2 rounded-3xl" />
             <Skeleton className="md:col-span-1 md:row-span-1 rounded-3xl" />
             <Skeleton className="md:col-span-1 md:row-span-1 rounded-3xl" />
             <Skeleton className="md:col-span-2 md:row-span-1 rounded-3xl" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-muted/20 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold mb-4">
              {debouncedSearch ? "Axtarışa uyğun nəticə tapılmadı" : "Hələlik heç bir məqalə yoxdur"}
            </h2>
            <p className="text-muted-foreground">
              {debouncedSearch 
                ? "Açar sözləri və ya kateqoriyanı dəyişərək yenidən cəhd edin." 
                : "Admin panelindən məqalə əlavə edə bilərsiniz."}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px] animate-in fade-in duration-500">
            {posts.map((post, index) => (
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
                  priority={index < 2} 
                />
              </Link>
            ))}
          </div>
        )}
      </main>

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