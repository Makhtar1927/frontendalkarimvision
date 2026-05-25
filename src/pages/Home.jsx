import Hero from '../components/Hero';
import CategoryGrids from '../components/CategoryGrids';
import ProductGrid from '../components/ProductGrid';
import QuickCategories from '../components/QuickCategories';
import ContactLocation from '../components/ContactLocation';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <>
      <SEO 
        title="iPhones, Parfumerie & Café de Luxe à Dakar"
        description="Découvrez l'excellence chez BoustaneTech Store : iPhones d'origine garantis, parfumerie fine de niche et torréfaction de café d'exception à Dakar."
        keywords="iPhone Dakar, iPhone original Sénégal, parfum de niche Dakar, café de spécialité, torréfaction prestige, BoustaneTech Store, e-commerce Sénégal"
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