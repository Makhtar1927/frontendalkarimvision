import React, { useEffect, useState } from 'react';
import { useProductStore } from '../store/useProductStore';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Filter, Store } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'tech', name: 'Téléphones & Tech' },
  { id: 'computers', name: 'Ordinateurs' },
  { id: 'accessories', name: 'Accessoires' },
  { id: 'perfume', name: 'Parfums de Luxe' },
  { id: 'coffee', name: 'Le Coin Café' }
];

const Shop = () => {
  const { products, fetchProducts, loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, [fetchProducts]);

  // Filtrage global
  const filteredProducts = products
    .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase()))
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

  return (
    <>
      <SEO 
        title="Boutique en Ligne" 
        description="Découvrez tous nos produits d'exception classés par catégories chez BoustaneTech Store : iPhones, parfums de niche et café prestigieux." 
      />
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
        {/* BANNIÈRE HERO DE LA BOUTIQUE */}
        <div 
          className="relative h-[40vh] md:h-[50vh] w-full flex items-center overflow-hidden bg-cover bg-center md:bg-right bg-no-repeat"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dg8ppnqcy/image/upload/v1778876055/Boustanetech8_klrkma.png')` }}
        >
          {/* Overlay: Sombre sur mobile, Dégradé Premium sur desktop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] md:backdrop-blur-none md:bg-transparent md:bg-gradient-to-r md:from-white md:via-white/90 md:to-transparent dark:md:from-bustantech-black dark:md:via-bustantech-black/90 dark:md:to-transparent"></div>
          
          <div className="relative z-10 px-4 w-full max-w-7xl mx-auto flex items-center">
            <div className="max-w-2xl">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-luxury font-bold text-white md:text-bustantech-black dark:text-white mb-4 tracking-wide leading-tight flex items-center gap-4"
              >
                <Store size={40} className="text-bustantech-gold hidden sm:block" />
                Notre Boutique
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="text-gray-200 md:text-gray-700 dark:text-gray-300 text-lg md:text-xl"
              >
                Parcourez tous nos univers et trouvez les meilleurs produits.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          {/* BARRE D'OUTILS ET FILTRES */}
          <div className="flex flex-col lg:flex-row justify-between items-center bg-white dark:bg-bustantech-black p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 gap-4 mb-10">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full focus:outline-none focus:border-bustantech-gold dark:text-white transition-colors"
              />
            </div>

            {/* FILTRE PAR PRIX (Min / Max) */}
            <div className="flex items-center justify-center gap-2 w-full lg:w-auto">
              <input 
                type="number" 
                placeholder="Prix min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 lg:w-32 py-2 px-3 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full focus:outline-none focus:border-bustantech-gold dark:text-white transition-colors"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input 
                type="number" 
                placeholder="Prix max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 lg:w-32 py-2 px-3 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-full focus:outline-none focus:border-bustantech-gold dark:text-white transition-colors"
              />
            </div>

            {/* FILTRE PAR CATÉGORIE */}
            <div className="flex items-center gap-3 w-full lg:w-auto relative">
              <Filter size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
              <select 
                className="w-full lg:w-48 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 dark:text-white py-2 pl-10 pr-4 rounded-full focus:outline-none focus:border-bustantech-gold appearance-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* TRI */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <SlidersHorizontal size={18} className="text-gray-400" />
              <select 
                className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 dark:text-white py-2 px-4 text-sm rounded-full focus:outline-none focus:border-bustantech-gold flex-1 cursor-pointer"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">Prix : Croissant</option>
                <option value="desc">Prix : Décroissant</option>
              </select>
            </div>
          </div>

          {/* CONTENU */}
          {loading ? (
            <div className="text-center py-20 dark:text-white flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-bustantech-gold border-t-transparent rounded-full animate-spin"></div>
              Chargement de la boutique...
            </div>
          ) : (
            <div className="space-y-16">
              {CATEGORIES.filter(c => selectedCategory === '' || c.id === selectedCategory).map(category => {
                const categoryProducts = filteredProducts.filter(p => p.category === category.id).slice(0, 10);

                if (categoryProducts.length === 0) return null;

                return (
                  <div key={category.id} className="relative">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h2 className="text-2xl font-luxury font-bold dark:text-white">{category.name}</h2>
                        <div className="w-12 h-1 bg-bustantech-gold mt-2"></div>
                      </div>
                      <Link to={`/category/${category.id}`} className="text-sm font-bold text-bustantech-gold hover:underline">
                        Voir tout
                      </Link>
                    </div>

                    {/* SCROLL HORIZONTAL LÉTERAL */}
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
                      {categoryProducts.map(product => (
                        <div key={product.id} className="w-[70vw] sm:w-[40vw] md:w-[30vw] lg:w-[22vw] snap-start shrink-0">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {CATEGORIES.filter(c => selectedCategory === '' || c.id === selectedCategory).every(category => 
                filteredProducts.filter(p => p.category === category.id).length === 0
              ) && (
                <div className="text-center py-20 text-gray-500">
                  Aucun produit ne correspond à vos critères.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </>
  );
};

export default Shop;
