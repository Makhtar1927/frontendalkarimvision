import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Filter, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const CATEGORY_INFO = {
  glasses: {
    title: "Lunettes & Optique",
    subtitle: "Des modèles élégants et des verres haute technologie pour sublimer votre regard.",
    image: "/boutique-interieur-1.jpg",
    color: "from-sky-100 to-white dark:from-sky-950/30 dark:to-black"
  },
  perfume: {
    title: "Haute Parfumerie",
    subtitle: "Des fragrances rares et luxueuses pour affirmer votre identité.",
    image: "/boutique-interieur-2.jpg",
    color: "from-sky-55 to-white dark:from-stone-900 dark:to-black"
  },
  watches: {
    title: "Montres de Prestige",
    subtitle: "Gardez le contrôle du temps avec nos pièces horlogères d'exception.",
    image: "/boutique-extra-1.jpg",
    color: "from-indigo-100 to-white dark:from-indigo-950/30 dark:to-black"
  },
  other: {
    title: "Divers & Accessoires",
    subtitle: "Une collection d'articles exclusifs et variés sélectionnés par nos soins.",
    image: "/boutique-extra-2.jpg",
    color: "from-gray-100 to-white dark:from-zinc-900/20 dark:to-black"
  }
};

const SUBCATEGORY_MAP = {
  glasses: [
    { id: '', name: 'Toutes' },
    { id: 'noir_fume', name: 'Noir Fumé' },
    { id: 'photogray', name: 'Photogray' }
  ],
  perfume: [
    { id: '', name: 'Tous' },
    { id: 'avec_alcool', name: 'Avec Alcool' },
    { id: 'sans_alcool', name: 'Sans Alcool' }
  ]
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const { fetchProducts, getProductsByCategory, loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    window.scrollTo(0, 0); // Scroll top on page load
    setSelectedBrand(''); // Réinitialise le filtre marque si on change de catégorie
    setSelectedSubcategory(''); // Réinitialise la sous-catégorie si on change de catégorie
  }, [categoryId, fetchProducts]);

  const rawProducts = getProductsByCategory(categoryId);
  
  // Extraire la liste des marques uniques pour cette catégorie
  const uniqueBrands = Array.from(new Set(rawProducts.map(p => p.brand))).filter(Boolean);
  
  // Filtrage global
  const filteredProducts = rawProducts
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => selectedBrand === '' || p.brand?.toLowerCase() === selectedBrand.toLowerCase())
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

  const info = CATEGORY_INFO[categoryId] || { title: "Collection Exclusive", subtitle: "Découvrez nos articles", image: "", color: "from-gray-100 to-white dark:from-zinc-900 dark:to-black" };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://boustanetech-store.vercel.app/category/${categoryId}`;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://boustanetech-store.vercel.app';

  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${info.title} | Al Karim Vision`,
    "description": info.subtitle,
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
        title={info.title} 
        description={info.subtitle} 
        image={getOptimizedImageUrl(info.image)}
        schema={categorySchema}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
        {/* BANNIÈRE HERO DE LA CATÉGORIE */}
        <div className="relative h-[30vh] md:h-[40vh] w-full flex items-center overflow-hidden">
          {info.image && (
            <img 
              src={getOptimizedImageUrl(info.image)}
              alt={info.title}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center md:object-right"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-brand-blue-light/60 to-transparent dark:from-brand-gray-dark/95 dark:via-brand-blue/10 dark:to-transparent z-10"></div>
          
          <div className="relative z-20 px-4 w-full max-w-7xl mx-auto flex items-center">
            <div className="max-w-2xl">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 uppercase mb-4 backdrop-blur-md"
              >
                Collection
              </motion.span>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-sans font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight uppercase"
              >
                {info.title}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.3 }}
                className="text-gray-650 dark:text-gray-300 text-lg font-normal leading-relaxed"
              >
                {info.subtitle}
              </motion.p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* SIDEBAR FILTERS - DESKTOP (Jumia / Amazon Style) */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-white dark:bg-brand-card-dark p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
                
                {/* Subcategories (if available) */}
                {SUBCATEGORY_MAP[categoryId] && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Sous-Catégories</h3>
                    <div className="space-y-1">
                      {SUBCATEGORY_MAP[categoryId].map((sub) => {
                        const isActive = selectedSubcategory === sub.id;
                        const count = sub.id 
                          ? rawProducts.filter(p => p.subcategory === sub.id).length
                          : rawProducts.length;
                          
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubcategory(sub.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                              isActive 
                                ? 'font-bold bg-brand-blue/5 dark:bg-brand-blue/10 text-brand-blue dark:text-sky-400 border-l-2 border-brand-blue' 
                                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100/50 dark:hover:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            <span>{sub.name}</span>
                            <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Brands Filter (if available) */}
                {uniqueBrands.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Marques</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedBrand('')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                          selectedBrand === '' 
                            ? 'font-bold text-brand-blue dark:text-sky-400' 
                            : 'text-gray-650 dark:text-zinc-500 hover:text-gray-950 dark:hover:text-white'
                        }`}
                      >
                        Toutes les marques
                      </button>
                      {uniqueBrands.map(b => {
                        const isActive = selectedBrand.toLowerCase() === b.toLowerCase();
                        const count = rawProducts.filter(p => p.brand?.toLowerCase() === b.toLowerCase()).length;
                        return (
                          <button
                            key={b}
                            onClick={() => setSelectedBrand(b)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                              isActive 
                                ? 'font-bold text-brand-blue dark:text-sky-400' 
                                : 'text-gray-650 dark:text-zinc-500 hover:text-gray-950 dark:hover:text-white'
                            }`}
                          >
                            <span>{b}</span>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Prix (FCFA)</h3>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full py-1.5 px-3 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-250 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white"
                    />
                    <span className="text-gray-400 text-xs">—</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full py-1.5 px-3 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-255 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white"
                    />
                  </div>
                </div>

                {/* Reset Filters */}
                {(selectedBrand || minPrice || maxPrice || selectedSubcategory) && (
                  <button
                    onClick={() => {
                      setSelectedBrand('');
                      setSelectedSubcategory('');
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            </aside>

            {/* MAIN PRODUCTS AREA */}
            <div className="flex-1 space-y-6">
              
              {/* SEARCH & SORT TOOLBAR */}
              <div className="bg-white dark:bg-brand-card-dark p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center gap-4">
                
                {/* Search input */}
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  <input 
                    type="text" 
                    placeholder="Rechercher dans cette collection..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white"
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

                {/* Mobile trigger and sort selection */}
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                  {/* Mobile Filters Toggle Button */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-900"
                  >
                    <SlidersHorizontal size={14} />
                    Filtrer
                  </button>

                  {/* Sort */}
                  <div className="relative shrink-0 w-1/2 sm:w-auto">
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

              {/* PRODUCTS GRID */}
              {loading ? (
                <div className="text-center py-20 dark:text-white flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                  Préparation de votre collection...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-zinc-400">
                  Aucun produit ne correspond à votre recherche.
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE FILTERS DRAWER (Jumia / Amazon Style) */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white dark:bg-zinc-950 z-50 p-6 flex flex-col shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-zinc-800 mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Filter size={18} />
                  Filtres
                </h2>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-6">
                
                {/* Subcategories (if available) */}
                {SUBCATEGORY_MAP[categoryId] && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Sous-Catégories</h3>
                    <div className="space-y-1">
                      {SUBCATEGORY_MAP[categoryId].map((sub) => {
                        const isActive = selectedSubcategory === sub.id;
                        const count = sub.id 
                          ? rawProducts.filter(p => p.subcategory === sub.id).length
                          : rawProducts.length;
                          
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleCategoryChange(sub.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                              isActive 
                                ? 'font-bold bg-brand-blue/5 dark:bg-brand-blue/10 text-brand-blue dark:text-sky-400 border-l-2 border-brand-blue' 
                                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100/50 dark:hover:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            <span>{sub.name}</span>
                            <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Brands (if available) */}
                {uniqueBrands.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Marques</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedBrand('')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                          selectedBrand === '' 
                            ? 'font-bold text-brand-blue dark:text-sky-400' 
                            : 'text-gray-650 dark:text-zinc-500 hover:text-gray-950 dark:hover:text-white'
                        }`}
                      >
                        Toutes les marques
                      </button>
                      {uniqueBrands.map(b => {
                        const isActive = selectedBrand.toLowerCase() === b.toLowerCase();
                        const count = rawProducts.filter(p => p.brand?.toLowerCase() === b.toLowerCase()).length;
                        return (
                          <button
                            key={b}
                            onClick={() => setSelectedBrand(b)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                              isActive 
                                ? 'font-bold text-brand-blue dark:text-sky-400' 
                                : 'text-gray-650 dark:text-zinc-500 hover:text-gray-950 dark:hover:text-white'
                            }`}
                          >
                            <span>{b}</span>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Prix (FCFA)</h3>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                    />
                    <span className="text-gray-400 text-xs">—</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-zinc-800 mt-6 space-y-3">
                <button
                  onClick={() => {
                    setSelectedBrand('');
                    setSelectedSubcategory('');
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-2.5 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                >
                  Voir les résultats ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CategoryPage;
