/**
 * Optimizes Supabase Storage image URLs by appending transformation parameters.
 * This helps in serving WebP images and resizing them to the required dimensions.
 */
export const optimizeImage = (url: string | null | undefined, width: number, height?: number, quality = 80) => {
  if (!url) return undefined;
  
  // Only optimize Supabase Storage URLs
  if (!url.includes('supabase.co/storage/v1/object/public')) return url;

  // Check if we already have query params
  const separator = url.includes('?') ? '&' : '?';
  
  // Supabase Image Transformation parameters
  // Note: This relies on Supabase Image Transformations being enabled/available.
  // Even if not, these params are harmlessly ignored by standard storage.
  let newUrl = `${url}${separator}width=${width}&quality=${quality}&format=webp&resize=cover`;
  
  if (height) newUrl += `&height=${height}`;
  
  return newUrl;
};

export const generateSrcSet = (url: string | null | undefined, sizes: number[]) => {
  if (!url) return undefined;
  return sizes.map(size => `${optimizeImage(url, size)} ${size}w`).join(', ');
};