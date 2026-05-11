import Hero from '../components/Hero';
import CategoryGrids from '../components/CategoryGrids';
import ProductGrid from '../components/ProductGrid';
import QuickCategories from '../components/QuickCategories';
import ContactLocation from '../components/ContactLocation';

const Home = () => {
  return (
    <>
      <Hero />
      <CategoryGrids />
      <ProductGrid />
      <QuickCategories />
      <ContactLocation />
    </>
  );
};

export default Home;