import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, schema, noindex }) => {
  const siteName = "Al Karim Vision";
  const defaultDesc = "L'alliance parfaite entre l'innovation technologique, le luxe de la haute parfumerie et l'art du café de spécialité.";
  const defaultImage = "https://boustanetech-store.vercel.app/Boustanetech.png";
  
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
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={description || defaultDesc} />
      <meta property="twitter:image" content={image || defaultImage} />

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