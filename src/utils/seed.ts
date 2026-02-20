import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const seedDatabase = async () => {
  const toastId = toast.loading("Demo məlumatlar yüklənir...");

  try {
    // Check for valid session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error("Session error:", sessionError);
      throw new Error("Sessiya tapılmadı. Zəhmət olmasa səhifəni yeniləyin və yenidən giriş edin.");
    }

    console.log("Starting seed with user:", session.user.id);

    // 1. Insert Categories
    const categories = [
      { name_az: "Sosial Media", slug: "social-media", color_theme: "blue" },
      { name_az: "Brendinq", slug: "branding", color_theme: "pink" },
      { name_az: "Texnologiya", slug: "tech", color_theme: "yellow" },
      { name_az: "Məhsul", slug: "product", color_theme: "blue" },
    ];

    const { data: insertedCategories, error: catError } = await supabase
      .from("categories")
      .upsert(categories, { onConflict: "slug" })
      .select();

    if (catError) {
      console.error("Category seed error details:", catError);
      if (catError.code === "42501") {
        throw new Error("İcazə rədd edildi (RLS Policy). Zəhmət olmasa Supabase SQL Editor-da RLS siyasətlərini yeniləyin.");
      }
      if (catError.message.includes("Could not find") || catError.code === "42P01") {
         throw new Error("Cədvəllər tapılmadı. Zəhmət olmasa əvvəlcə SQL kodunu işlədərək bazanı qurun.");
      }
      throw new Error("Kateqoriya xətası: " + catError.message);
    }

    if (!insertedCategories) throw new Error("Kateqoriyalar yaradılmadı");

    // Map slugs to IDs for easy lookup
    const catMap = insertedCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as Record<string, string>);

    // 2. Insert Posts
    const posts = [
      {
        title_az: "Nike-ın 'Just Do It' Kampaniyası: Bir Əfsanənin Doğuluşu",
        slug: "nike-just-do-it-campaign",
        content_html: `
          <h2>Giriş</h2>
          <p>1988-ci ildə Nike, idman geyimləri bazarında rəqabəti gücləndirmək üçün tarixin ən təsirli şüarlarından birini yaratdı: "Just Do It". Bu kampaniya sadəcə məhsul satmaqla kifayətlənmədi, həm də insanların düşüncə tərzini dəyişdi.</p>
          <h2>Strategiya</h2>
          <p>Nike, peşəkar idmançılardan gündəlik qaçışçılara qədər hər kəsə müraciət etdi. Mesaj aydın idi: Bəhanə gətirmə, sadəcə et.</p>
          <h2>Nəticə</h2>
          <p>Bu kampaniya Nike-ın bazar payını 18%-dən 43%-ə qaldırdı və brendi qlobal bir simvola çevirdi.</p>
        `,
        thumbnail_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
        read_time_az: "5 dəq",
        category_id: catMap["branding"],
        card_size: "hero",
        is_featured: true,
        published_at: new Date().toISOString(),
      },
      {
        title_az: "Spotify Wrapped: Məlumatların Hekayəyə Çevrilməsi",
        slug: "spotify-wrapped-strategy",
        content_html: "<p>Spotify Wrapped hər il istifadəçilərə öz musiqi dinləmə vərdişləri haqqında vizual hesabat təqdim edir. Bu, istifadəçiləri öz nəticələrini sosial mediada paylaşmağa təşviq edərək, brendin pulsuz reklamını təmin edir.</p>",
        thumbnail_url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1974&auto=format&fit=crop",
        read_time_az: "3 dəq",
        category_id: catMap["social-media"],
        card_size: "wide",
        is_featured: false,
        published_at: new Date().toISOString(),
      },
      {
        title_az: "Apple: 'Think Different' Fəlsəfəsi",
        slug: "apple-think-different",
        content_html: "<p>Apple sadəcə texnologiya satmır, o, bir həyat tərzi və status satır. 'Think Different' kampaniyası yaradıcı insanlara və dahilərə hörmət əlaməti olaraq yaradılmışdı.</p>",
        thumbnail_url: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?q=80&w=2070&auto=format&fit=crop",
        read_time_az: "4 dəq",
        category_id: catMap["tech"],
        card_size: "standard",
        is_featured: false,
        published_at: new Date().toISOString(),
      },
      {
        title_az: "Duolingo: Aqressiv Marketinqin Uğuru",
        slug: "duolingo-marketing",
        content_html: "<p>Duolingo-nun bayquş simvolu TikTok-da necə viral oldu? Şirkət ənənəvi korporativ üslubdan imtina edərək, internet mədəniyyətinə uyğun, bəzən 'toksik' bir personaj yaratdı.</p>",
        thumbnail_url: "https://images.unsplash.com/photo-1626244243675-523c915f7209?q=80&w=2070&auto=format&fit=crop",
        read_time_az: "2 dəq",
        category_id: catMap["product"],
        card_size: "square",
        is_featured: false,
        published_at: new Date().toISOString(),
      },
      {
        title_az: "Airbnb: Hekayə Danışaraq Satış Etmək",
        slug: "airbnb-storytelling",
        content_html: "<p>Airbnb istifadəçilərə ev deyil, təcrübə təklif edir. Onların marketinq strategiyası 'aid olmaq' hissi üzərində qurulub.</p>",
        thumbnail_url: "https://images.unsplash.com/photo-1496515053519-96c2e7ccb0a7?q=80&w=2070&auto=format&fit=crop",
        read_time_az: "6 dəq",
        category_id: catMap["branding"],
        card_size: "standard",
        is_featured: false,
        published_at: new Date().toISOString(),
      },
       {
        title_az: "Coca-Cola: Milad Kampaniyaları",
        slug: "coca-cola-christmas",
        content_html: "<p>Şaxta baba obrazını Coca-Cola necə formalaşdırdı? İllərdir davam edən emosional bağ qurma strategiyası.</p>",
        thumbnail_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=2070&auto=format&fit=crop",
        read_time_az: "3 dəq",
        category_id: catMap["branding"],
        card_size: "standard",
        is_featured: false,
        published_at: new Date().toISOString(),
      },
    ];

    const { error: postError } = await supabase
      .from("posts")
      .upsert(posts, { onConflict: "slug" });

    if (postError) {
      console.error("Post seed error details:", postError);
       if (postError.code === "42501") {
        throw new Error("İcazə rədd edildi (RLS Policy).");
      }
      throw new Error("Məqalə xətası: " + postError.message);
    }

    toast.success("Demo məlumatlar uğurla yükləndi!", { id: toastId });
    return true;
  } catch (error: any) {
    console.error(error);
    toast.error(error.message || "Xəta baş verdi", { id: toastId });
    // Important: Propagate the error so Admin component knows about it
    throw error;
  }
};