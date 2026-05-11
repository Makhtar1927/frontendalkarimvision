import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Filter } from 'lucide-react';
import SEO from '../components/SEO';

const CATEGORY_INFO = {
  tech: {
    title: "Téléphones & Smartphones",
    subtitle: "Découvrez notre sélection de smartphones haut de gamme.",
    bg: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1600&auto=format&fit=crop"
  },
  computers: {
    title: "Ordinateurs & Machines",
    subtitle: "PC Portables, MacBooks et stations de travail performantes.",
    bg: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1600&auto=format&fit=crop"
  },
  accessories: {
    title: "Accessoires Tech",
    subtitle: "Coques, chargeurs, écouteurs et équipements essentiels.",
    bg: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1600&auto=format&fit=crop"
  },
  perfume: {
    title: "Haute Parfumerie",
    subtitle: "Des fragrances rares et luxueuses pour affirmer votre identité.",
    bg: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1600&auto=format&fit=crop"
  },
  coffee: {
    title: "Torréfaction d'Exception",
    subtitle: "Sélection exclusive. Poudre prestige, sachets de 1 KG uniquement.",
    bg: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop"
  }
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const { fetchProducts, getProductsByCategory, loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0); // Scroll top on page load
    setSelectedBrand(''); // Réinitialise le filtre marque si on change de catégorie
  }, [categoryId, fetchProducts]);

  const rawProducts = getProductsByCategory(categoryId);
  
  // Extraire la liste des marques uniques pour cette catégorie
  const uniqueBrands = Array.from(new Set(rawProducts.map(p => p.brand))).filter(Boolean);
  
  // Fonction de filtrage très pro
  const filteredProducts = rawProducts
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => selectedBrand === '' || p.brand?.toLowerCase() === selectedBrand.toLowerCase())
    .filter(p => {
      const price = parseFloat(p.base_price);
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      const priceA = parseFloat(a.base_price);
      const priceB = parseFloat(b.base_price);
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });

  const info = CATEGORY_INFO[categoryId] || { title: "Collection Exclusive", subtitle: "Découvrez nos articles", bg: "" };

  return (
    <>
      <SEO 
        title={info.title} 
        description={info.subtitle} 
        image={info.bg}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      {/* BANNIÈRE HERO DE LA CATÉGORIE */}
      <div className="relative h-[40vh] md:h-[50vh] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${info.bg})` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-luxury font-bold text-white mb-4 tracking-wide"
          >
            {info.title}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto"
          >
            {info.subtitle}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* BARRE D'OUTILS ET FILTRES (Fonctionnalité Moderne) */}
        <div className="flex flex-col lg:flex-row justify-between items-center bg-white dark:bg-bustantech-black p-4 rounded-sm shadow-sm md:shadow-md mb-8 border border-gray-100 dark:border-gray-800 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              aria-label="Rechercher dans cette catégorie"
              type="text" 
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-sm focus:outline-none focus:border-bustantech-gold dark:text-white transition-colors"
            />
          </div>

          {/* FILTRE PAR PRIX (Min / Max) */}
          <div className="flex items-center justify-center gap-2 w-full lg:w-auto">
            <input 
              aria-label="Prix minimum"
              type="number" 
              placeholder="Prix min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 lg:w-32 py-2 px-3 text-base sm:text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-sm focus:outline-none focus:border-bustantech-gold dark:text-white transition-colors"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input 
              aria-label="Prix maximum"
              type="number" 
              placeholder="Prix max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 lg:w-32 py-2 px-3 text-base sm:text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-sm focus:outline-none focus:border-bustantech-gold dark:text-white transition-colors"
            />
          </div>

          {/* FILTRE PAR MARQUE */}
          <div className="flex items-center gap-3 w-full lg:w-auto relative">
            <Filter size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
            <select 
              aria-label="Filtrer par marque"
              className="w-full lg:w-48 text-base sm:text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 dark:text-white py-2 pl-10 pr-4 rounded-sm focus:outline-none focus:border-bustantech-gold appearance-none cursor-pointer"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">Toutes les marques</option>
              {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <SlidersHorizontal size={18} className="text-gray-400" />
            <select 
              aria-label="Trier les produits"
              className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 dark:text-white py-2 px-4 text-base sm:text-sm rounded-sm focus:outline-none focus:border-bustantech-gold flex-1"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Prix : Croissant</option>
              <option value="desc">Prix : Décroissant</option>
            </select>
          </div>
        </div>

        {/* GRILLE DE PRODUITS */}
        {loading ? (
          <div className="text-center py-20 dark:text-white flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-bustantech-gold border-t-transparent rounded-full animate-spin"></div>
            Préparation de votre collection...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Aucun produit ne correspond à votre recherche.</div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
          >
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
      </div>
    </>
  );
};

export default CategoryPage;
