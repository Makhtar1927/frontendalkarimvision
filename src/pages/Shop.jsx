import React, { useEffect, useState } from 'react';
import { useProductStore } from '../store/useProductStore';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Filter, Store } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'glasses', name: 'Lunettes' },
  { id: 'perfume', name: 'Parfums de Luxe' },
  { id: 'watches', name: 'Montres' },
  { id: 'other', name: 'Divers' }
];

import { getOptimizedImageUrl } from '../utils/cloudinary';

const Shop = () => {
  const { products, fetchProducts, loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    fetchProducts(true);
    window.scrollTo(0, 0);
  }, [fetchProducts]);

  // Réinitialiser la sous-catégorie si on change de catégorie
  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setSelectedSubcategory('');
  };

  // Filtrage global
  const filteredProducts = products
    .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => selectedCategory === '' || p.category === selectedCategory)
    .filter(p => selectedSubcategory === '' || p.subcategory === selectedSubcategory)
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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://boustanetech-store.vercel.app/shop';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://boustanetech-store.vercel.app';

  const shopSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Boutique en Ligne | Al Karim Vision",
    "description": "Parcourez tous nos univers et trouvez les meilleurs produits à Dakar : lunettes de soleil, montres de prestige, parfums de niche et articles divers.",
    "url": currentUrl,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredProducts.slice(0, 12).map((product, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `${currentOrigin}/product/${product.id}`,
        "name": product.name,
        "image": product.image_url,
        "price": product.base_price,
        "priceCurrency": "XOF"
      }))
    }
  };

  return (
    <>
      <SEO 
        title="Boutique en Ligne" 
        description="Découvrez tous nos produits d'exception classés par catégories chez Al Karim Vision : lunettes de marque, montres de luxe, parfums rares et articles divers." 
        schema={shopSchema}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
        {/* BANNIÈRE HERO DE LA BOUTIQUE */}
        <div className="relative h-[40vh] md:h-[50vh] w-full flex items-center overflow-hidden">
          <img 
            src={getOptimizedImageUrl('/boutique-showroom.jpg')}
            alt="Al Karim Vision - Boutique en Ligne"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center md:object-right"
          />
          {/* Overlay: Sombre sur mobile, Dégradé Premium avec touche de bleu logo */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-brand-blue-light/60 to-transparent dark:from-brand-gray-dark/95 dark:via-brand-blue/10 dark:to-transparent z-10"></div>

          
          <div className="relative z-20 px-4 w-full max-w-7xl mx-auto flex items-center">
            <div className="max-w-2xl">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 uppercase mb-4 backdrop-blur-md"
              >
                Boutique Officielle
              </motion.span>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-sans font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight uppercase"
              >
                Notre Boutique
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.3 }}
                className="text-gray-600 dark:text-gray-300 text-lg md:text-xl font-normal leading-relaxed"
              >
                Parcourez l'ensemble de nos collections de prestige.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* BARRE D'OUTILS ET FILTRES */}
          <div className="bg-white dark:bg-brand-card-dark rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm mb-8 overflow-hidden">

            {/* Ligne 1 : Recherche + Tri */}
            <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit, une marque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white transition-colors"
                />
              </div>
              <select 
                className="shrink-0 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 dark:text-white py-2 px-3 rounded-lg focus:outline-none focus:border-brand-blue cursor-pointer"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">Prix ↑</option>
                <option value="desc">Prix ↓</option>
              </select>
            </div>

            {/* Ligne 2 : Filtres catégories en pills */}
            <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleCategoryChange('')}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${selectedCategory === '' ? 'bg-brand-blue text-white' : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:border-brand-blue/40 hover:text-brand-blue'}`}
              >
                Tout
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${selectedCategory === c.id ? 'bg-brand-blue text-white' : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:border-brand-blue/40 hover:text-brand-blue'}`}
                >
                  {c.name}
                </button>
              ))}

              {/* Sous-catégories si disponibles */}
              {(selectedCategory === 'glasses' || selectedCategory === 'perfume') && (
                <>
                  <span className="w-px h-5 bg-gray-200 dark:bg-zinc-700 shrink-0" />
                  {selectedCategory === 'glasses' ? (
                    <>
                      {[{ v: '', l: 'Toutes' }, { v: 'noir_fume', l: 'Noir Fumé' }, { v: 'photogray', l: 'Photogray' }].map(o => (
                        <button key={o.v} onClick={() => setSelectedSubcategory(o.v)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${selectedSubcategory === o.v ? 'bg-gray-800 dark:bg-zinc-200 text-white dark:text-zinc-900' : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:border-gray-400'}`}>
                          {o.l}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[{ v: '', l: 'Tous' }, { v: 'avec_alcool', l: 'Avec Alcool' }, { v: 'sans_alcool', l: 'Sans Alcool' }].map(o => (
                        <button key={o.v} onClick={() => setSelectedSubcategory(o.v)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${selectedSubcategory === o.v ? 'bg-gray-800 dark:bg-zinc-200 text-white dark:text-zinc-900' : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:border-gray-400'}`}>
                          {o.l}
                        </button>
                      ))}
                    </>
                  )}
                </>
              )}

              {/* Filtre prix compact */}
              <span className="w-px h-5 bg-gray-200 dark:bg-zinc-700 shrink-0" />
              <input 
                type="number" placeholder="Min" value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="shrink-0 w-20 py-1.5 px-2 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white"
              />
              <span className="text-gray-400 text-xs shrink-0">—</span>
              <input 
                type="number" placeholder="Max" value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="shrink-0 w-20 py-1.5 px-2 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white"
              />
              <span className="text-[9px] text-gray-400 shrink-0 uppercase font-bold">FCFA</span>
            </div>
          </div>

          {/* CONTENU */}
          {loading ? (
            <div className="text-center py-20 dark:text-white flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
              Chargement de la boutique...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Aucun produit ne correspond à vos critères de recherche.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
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
