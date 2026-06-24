import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Sparkles, Glasses, Flame, Watch } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProductStore } from '../store/useProductStore';

const CATEGORIES_CONFIG = [
  { id: 'all', name: 'Tous les Univers', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'glasses', name: 'Lunettes & Optique', icon: <Glasses className="w-4 h-4" /> },
  { id: 'perfume', name: 'Haute Parfumerie', icon: <Flame className="w-4 h-4" /> },
  { id: 'watches', name: 'Horlogerie', icon: <Watch className="w-4 h-4" /> },
  { id: 'other', name: 'Accessoires & Divers', icon: <Sparkles className="w-4 h-4" /> }
];

const ProductGrid = () => {
  const { products, fetchProducts, loading } = useProductStore();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="text-center py-24 bg-white dark:bg-brand-gray-dark flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm tracking-wide">Chargement du catalogue Al Karim Vision...</p>
      </div>
    );
  }

  // Filtrer les produits pour chaque catégorie
  const productsByCategory = {
    glasses: products.filter(p => p.category === 'glasses'),
    perfume: products.filter(p => p.category === 'perfume'),
    watches: products.filter(p => p.category === 'watches'),
    other: products.filter(p => p.category === 'other')
  };

  const displayedProducts = activeTab === 'all'
    ? products.slice(0, 8)
    : (productsByCategory[activeTab]?.slice(0, 8) || []);

  return (
    <section id="products" className="py-16 md:py-24 px-4 sm:px-6 lg:px-20 bg-gray-50 dark:bg-brand-gray-dark scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* TABS DE FILTRAGE INTERACTIFS */}
        <div className="flex flex-col items-center mb-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-black dark:text-white uppercase tracking-tight">
              Explorer les Collections
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Naviguez facilement à travers nos différents rayons de luxe pour trouver vos coups de cœur.
            </p>
          </div>

          {/* BARRE DE SÉLECTION FLUIDE */}
          <div className="w-full overflow-x-auto flex justify-start md:justify-center py-2 px-1 -mx-4 md:mx-0 no-scrollbar">
            <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 gap-1 sm:gap-2 w-max">
              {CATEGORIES_CONFIG.map(tab => {
                const isActive = activeTab === tab.id;
                // Compter les produits de cette catégorie
                const count = tab.id === 'all' 
                  ? products.length 
                  : (productsByCategory[tab.id]?.length || 0);

                // Ne pas afficher l'onglet si aucun produit
                if (tab.id !== 'all' && count === 0) return null;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-wider transition-all duration-300 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabBg"
                        className="absolute inset-0 bg-brand-blue rounded-xl shadow-lg shadow-brand-blue/15 z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {tab.icon}
                      {tab.name}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CONTENU DE LA GRILLE DES PRODUITS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-12"
          >
            {/* GRILLE UNIFIÉE */}
            {displayedProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                Aucun produit dans cet univers pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {displayedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* BOUTON D'ACTION PRINCIPALE */}
            <div className="flex justify-center pt-4">
              <Link 
                to={activeTab === 'all' ? '/shop' : `/category/${activeTab}`}
                className="group flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white hover:bg-brand-blue hover:text-white dark:hover:bg-brand-blue dark:hover:border-transparent px-8 py-3.5 rounded-lg font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {activeTab === 'all' ? 'Explorer toute la boutique' : `Explorer le rayon ${CATEGORIES_CONFIG.find(c => c.id === activeTab)?.name}`}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};

export default ProductGrid;