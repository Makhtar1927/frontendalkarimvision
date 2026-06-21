import Hero from '../components/Hero';
import CategoryGrids from '../components/CategoryGrids';
import ProductGrid from '../components/ProductGrid';
import QuickCategories from '../components/QuickCategories';
import ContactLocation from '../components/ContactLocation';
import SEO from '../components/SEO';

const Home = () => {
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": "https://boustanetech-store.vercel.app/#store",
    "name": "Al Karim Vision",
    "url": "https://boustanetech-store.vercel.app/",
    "logo": "https://boustanetech-store.vercel.app/logo.jpg",
    "image": "https://boustanetech-store.vercel.app/logo.jpg",
    "description": "Al Karim Vision - Votre opticien de prestige, haute parfumerie et horlogerie d'exception à Dakar.",
    "telephone": "+221774133645",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Pikine Saf Bar",
      "addressLocality": "Dakar",
      "addressCountry": "SN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.7578",
      "longitude": "-17.3944"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
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
        title="iPhones, Parfumerie & Café de Luxe à Dakar"
        description="Découvrez l'excellence chez Al Karim Vision : iPhones d'origine garantis, parfumerie fine de niche et torréfaction de café d'exception à Dakar."
        keywords="iPhone Dakar, iPhone original Sénégal, parfum de niche Dakar, café de spécialité, torréfaction prestige, Al Karim Vision, e-commerce Sénégal"
        schema={storeSchema}
      />
      <Hero />
      <CategoryGrids />
      <ProductGrid />
      <QuickCategories />
      <ContactLocation />
    </>
  );
};

export default Home;