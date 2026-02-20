-- 1. Site Settings cədvəli üçün RLS-i aktivləşdir və İcazələri ver
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Köhnə siyasətləri sil (əgər varsa, xəta verməməsi üçün)
DROP POLICY IF EXISTS "Public Read Access" ON public.site_settings;
DROP POLICY IF EXISTS "Admin Update Access" ON public.site_settings;
DROP POLICY IF EXISTS "Admin Insert Access" ON public.site_settings;

-- Hər kəsə oxumaq icazəsi ver (Logo və Haqqımda məlumatları üçün vacibdir)
CREATE POLICY "Public Read Access" ON public.site_settings
FOR SELECT USING (true);

-- Yalnız daxil olmuş istifadəçilərə (Admin) dəyişiklik etmək icazəsi ver
CREATE POLICY "Admin Update Access" ON public.site_settings
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Insert Access" ON public.site_settings
FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Storage (Şəkillər) İcazələri
-- 'images' qovluğunu public et
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage siyasətlərini yenilə
DROP POLICY IF EXISTS "Public Access Images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Images" ON storage.objects;

-- Hər kəs şəkilləri görə bilsin
CREATE POLICY "Public Access Images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Yalnız admin şəkil yükləyə bilsin
CREATE POLICY "Auth Upload Images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');
CREATE POLICY "Auth Update Images" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'images');