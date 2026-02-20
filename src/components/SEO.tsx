import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  slug?: string;
  type?: "website" | "article";
}

export const SEO = ({ 
  title = "Sayt.me", 
  description = "Ən son yeniliklər və məqalələr.", 
  image = "/placeholder.svg", 
  slug = "", 
  type = "website" 
}: SEOProps) => {
  const siteUrl = window.location.origin;
  const fullUrl = `${siteUrl}${slug ? `/${slug}` : ''}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  const metaTitle = title.includes("Sayt.me") ? title : `${title} | Sayt.me`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{metaTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={metaTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
    </Helmet>
  );
};