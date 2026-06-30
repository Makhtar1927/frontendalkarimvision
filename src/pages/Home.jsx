import Hero from '../components/Hero';
import CategoryStrip from '../components/CategoryStrip';
import ProductGrid from '../components/ProductGrid';
import ContactLocation from '../components/ContactLocation';
import SEO from '../components/SEO';

const Home = () => {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": "https://boustanetech-store.vercel.app/#store",
    "name": "Al Karim Vision",
    "url": "https://boustanetech-store.vercel.app/",
    "logo": "https://boustanetech-store.vercel.app/logo.png",
    "image": "https://boustanetech-store.vercel.app/logo.png",
    "description": "Al Karim Vision - Votre opticien de prestige, haute parfumerie et horlogerie d'exception à Dakar.",
    "telephone": "+221784379462",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Touba Darou Khoudoss, Niary Etage",
      "addressLocality": "Touba",
      "addressCountry": "SN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.8605356",
      "longitude": "-15.8835194"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday"
      ],
      "opens": "09:00",
      "closes": "21:00"
    },
    "sameAs": [
      "https://maps.app.goo.gl/tUo6M6r6uXyS1JbZ8"
    ]
  };

  return (
    <>
      <SEO 
        title="Optique, Parfumerie & Horlogerie de Prestige à Touba"
        description="Découvrez l'excellence chez Al Karim Vision à Touba : Lunettes de vue et de soleil de marque, parfums authentiques et montres d'exception au meilleur prix."
        keywords="optique Touba, lunettes de soleil Sénégal, parfum authentique Touba, montres de marque Sénégal, Al Karim Vision Touba, lunettes de vue Sénégal"
        schema={storeSchema}
      />
      <Hero />
      <CategoryStrip />
      <ProductGrid />
      <ContactLocation />
    </>
  );
};

export default Home;