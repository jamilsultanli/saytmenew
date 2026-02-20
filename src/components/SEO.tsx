import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  slug?: string;
  type?: "website" | "article";
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  schema?: object; // JSON-LD structured data
  favicon?: string;
}

export const SEO = ({ 
  title = "Sayt.me", 
  description = "Ən son yeniliklər və məqalələr.", 
  image = "/placeholder.svg", 
  slug = "", 
  type = "website",
  keywords = [],
  author = "Sayt.me",
  publishedTime,
  modifiedTime,
  schema,
  favicon
}: SEOProps) => {
  const siteUrl = window.location.origin;
  const fullUrl = `${siteUrl}${slug ? (slug.startsWith('/') ? slug : `/${slug}`) : ''}`;
  const fullImage = image?.startsWith('http') ? image : `${siteUrl}${image}`;
  
  const metaTitle = title.includes("Sayt.me") ? title : `${title} | Sayt.me`;

  return (
    <Helmet>
      {/* --- Standard Metadata --- */}
      <title>{metaTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />
      {favicon && <link rel="icon" href={favicon} />}

      {/* --- Open Graph / Facebook --- */}
      <meta property="og:locale" content="az_AZ" />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Sayt.me" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* --- Twitter --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* --- JSON-LD Schema Markup (Google Bot üçün) --- */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};