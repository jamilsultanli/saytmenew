-- Bu skript site_settings cədvəlindəki təkrarları təmizləyir.
-- Ən çox məlumatı olan (dolu) sətri saxlayır, digərlərini silir.

DELETE FROM public.site_settings 
WHERE id NOT IN (
  SELECT id FROM public.site_settings 
  ORDER BY 
    -- Doluluq dərəcəsinə görə xal veririk
    (CASE WHEN site_name IS NOT NULL AND site_name != '' THEN 1 ELSE 0 END) +
    (CASE WHEN hero_title IS NOT NULL AND hero_title != '' THEN 1 ELSE 0 END) +
    (CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 ELSE 0 END) +
    (CASE WHEN footer_text IS NOT NULL AND footer_text != '' THEN 1 ELSE 0 END) DESC,
    -- Əgər xallar bərabərdirsə, ən son yenilənəni götürürük
    updated_at DESC
  LIMIT 1
);