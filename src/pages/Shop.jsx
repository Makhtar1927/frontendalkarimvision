import React, { useEffect, useState } from 'react';
import { useProductStore } from '../store/useProductStore';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Filter, Store, Glasses, Sparkles, Watch, Grid, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const CATEGORY_ITEMS = [
  { id: '', name: 'Tout', icon: Store },
  { id: 'glasses', name: 'Lunettes', icon: Glasses },
  { id: 'perfume', name: 'Parfums', icon: Sparkles },
  { id: 'watches', name: 'Montres', icon: Watch },
  { id: 'other', name: 'Divers', icon: Grid }
];

const Shop = () => {
  const { products, fetchProducts, loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0);
  }, [fetchProducts]);

  // Réinitialiser la sous-catégorie si on change de catégorie
  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setSelectedSubcategory('');
  };

  // Compter le nombre de produits par catégorie
  const getCategoryCount = (catId) => {
    if (!catId) return products.length;
    return products.filter(p => p.category === catId).length;
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
        <div className="relative h-[35vh] md:h-[45vh] w-full flex items-center overflow-hidden">
          <img 
            src={getOptimizedImageUrl('/boutique-showroom.jpg')}
            alt="Al Karim Vision - Boutique en Ligne"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center md:object-right"
          />
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          
          {/* CATEGORIES GRID SELECTOR - NEW PREMIUM DESIGN */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Filter size={16} className="text-brand-blue" />
                Catégories
              </h2>
              {selectedCategory && (
                <button 
                  onClick={() => handleCategoryChange('')}
                  className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 uppercase tracking-wider"
                >
                  <X size={12} />
                  Réinitialiser
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {CATEGORY_ITEMS.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const IconComponent = cat.icon;
                const count = getCategoryCount(cat.id);
                
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-300 min-h-[90px] shadow-sm ${
                      isActive 
                        ? 'border-brand-blue bg-gradient-to-br from-brand-blue to-blue-700 text-white dark:border-brand-blue' 
                        : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-brand-card-dark text-gray-600 dark:text-zinc-400 hover:border-brand-blue/30 hover:bg-gray-50/50 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeCategoryBg"
                        className="absolute inset-0 bg-gradient-to-br from-brand-blue to-blue-750 z-0"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    <span className="relative z-10 p-2 rounded-lg bg-gray-100/10 dark:bg-zinc-800/10">
                      <IconComponent size={24} className={isActive ? 'text-white' : 'text-brand-blue dark:text-sky-400'} />
                    </span>
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>
                      <span className={`text-[10px] mt-0.5 px-2 py-0.5 rounded-full font-bold transition-colors duration-300 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                      }`}>
                        {count} {count > 1 ? 'produits' : 'produit'}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-brand-card-dark rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-8 overflow-hidden transition-all duration-300">
            {/* Main Row */}
            <div className="flex flex-col md:flex-row items-center gap-4 p-4">
              {/* Search Bar */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit, une marque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white transition-all duration-300"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end">
                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                    showFilters || minPrice || maxPrice || selectedSubcategory
                      ? 'bg-brand-blue/5 border-brand-blue text-brand-blue dark:bg-brand-blue/10 dark:text-sky-400' 
                      : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/80'
                  }`}
                >
                  <SlidersHorizontal size={16} className={`transition-transform duration-300 ${showFilters ? 'rotate-90' : ''}`} />
                  Filtres Avancés
                  {(minPrice || maxPrice || selectedSubcategory) && (
                    <span className="w-2 h-2 rounded-full bg-brand-blue dark:bg-sky-400 animate-pulse" />
                  )}
                </button>

                {/* Sorting Select */}
                <div className="relative shrink-0 w-1/2 md:w-auto">
                  <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select 
                    className="w-full text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 dark:text-white py-2.5 pl-9 pr-8 rounded-lg focus:outline-none focus:border-brand-blue appearance-none cursor-pointer font-bold uppercase tracking-wider"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="asc">Prix : Croissant</option>
                    <option value="desc">Prix : Décroissant</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Expandable Advanced Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 p-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subcategories */}
                    {(selectedCategory === 'glasses' || selectedCategory === 'perfume') && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-widest">Sous-Catégories</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedCategory === 'glasses' ? (
                            <>
                              {[{ v: '', l: 'Toutes' }, { v: 'noir_fume', l: 'Noir Fumé' }, { v: 'photogray', l: 'Photogray' }].map(o => (
                                <button 
                                  key={o.v} 
                                  onClick={() => setSelectedSubcategory(o.v)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                                    selectedSubcategory === o.v 
                                      ? 'bg-brand-blue text-white shadow-sm' 
                                      : 'bg-white dark:bg-zinc-900 text-gray-550 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:border-brand-blue/30 hover:text-brand-blue'
                                  }`}
                                >
                                  {o.l}
                                </button>
                              ))}
                            </>
                          ) : (
                            <>
                              {[{ v: '', l: 'Tous' }, { v: 'avec_alcool', l: 'Avec Alcool' }, { v: 'sans_alcool', l: 'Sans Alcool' }].map(o => (
                                <button 
                                  key={o.v} 
                                  onClick={() => setSelectedSubcategory(o.v)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
                                    selectedSubcategory === o.v 
                                      ? 'bg-brand-blue text-white shadow-sm' 
                                      : 'bg-white dark:bg-zinc-900 text-gray-550 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:border-brand-blue/30 hover:text-brand-blue'
                                  }`}
                                >
                                  {o.l}
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price Range */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-widest">Tranche de prix (FCFA)</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="Prix minimum" 
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full py-2 px-3 text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white"
                        />
                        <span className="text-gray-400 text-xs shrink-0">—</span>
                        <input 
                          type="number" 
                          placeholder="Prix maximum" 
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full py-2 px-3 text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white"
                        />
                        {(minPrice || maxPrice) && (
                          <button
                            onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Réinitialiser les prix"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reset Actions */}
                  {(minPrice || maxPrice || selectedSubcategory) && (
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/60 flex justify-end">
                      <button
                        onClick={() => {
                          setMinPrice('');
                          setMaxPrice('');
                          setSelectedSubcategory('');
                        }}
                        className="text-xs font-bold text-red-500 hover:text-red-650 uppercase tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <X size={12} />
                        Effacer les filtres
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PRODUCTS CONTENT GRID */}
          {loading ? (
            <div className="text-center py-20 dark:text-white flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
              Chargement de la boutique...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-zinc-400">
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
    </>
  );
};

export default Shop;
