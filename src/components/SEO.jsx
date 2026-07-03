import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, schema, noindex }) => {
  const siteName = "Al Karim Vision";
  const defaultDesc = "Al Karim Vision à Touba : votre opticien de prestige (lunettes de vue et de soleil de marque), parfumerie haut de gamme et horlogerie de luxe au meilleur prix.";
  // logo-share.png : version optimisée 300x300, ~46KB (WhatsApp exige < 300KB)
  const defaultImage = "https://www.alkarimvision.com/logo-share.png";
  
  // Dé-duplication intelligente du titre pour éviter de répéter le nom de marque
  const finalTitle = title 
    ? (title.includes(siteName) ? title : `${title} | ${siteName}`) 
    : siteName;

  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* Balises de base */}
      <title>{finalTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Lien Canonique */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Directive Noindex pour les pages d'administration ou sécurisées */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="fr_SN" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      {/* Image optimisée 300x300 <50KB pour WhatsApp */}
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:image:secure_url" content={image || defaultImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="300" />
      <meta property="og:image:height" content="300" />
      <meta property="og:image:alt" content={`${finalTitle} - Al Karim Vision`} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      <meta name="twitter:image" content={image || defaultImage} />
      <meta name="twitter:image:alt" content={`${finalTitle} - Al Karim Vision`} />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;