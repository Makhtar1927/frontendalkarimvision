import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Filter } from 'lucide-react';
import SEO from '../components/SEO';

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
    color: "from-sky-50 to-white dark:from-stone-900 dark:to-black"
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
    { id: '', name: 'Tous' },
    { id: 'noir_fume', name: 'Noir Fumé' },
    { id: 'photogray', name: 'Photogray' }
  ],
  perfume: [
    { id: '', name: 'Tous' },
    { id: 'avec_alcool', name: 'Avec Alcool' },
    { id: 'sans_alcool', name: 'Sans Alcool' }
  ]
};

import { getOptimizedImageUrl } from '../utils/cloudinary';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const { fetchProducts, getProductsByCategory, loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    fetchProducts(true);
    window.scrollTo(0, 0); // Scroll top on page load
    setSelectedBrand(''); // Réinitialise le filtre marque si on change de catégorie
    setSelectedSubcategory(''); // Réinitialise la sous-catégorie si on change de catégorie
  }, [categoryId, fetchProducts]);

  const rawProducts = getProductsByCategory(categoryId);
  
  // Extraire la liste des marques uniques pour cette catégorie
  const uniqueBrands = Array.from(new Set(rawProducts.map(p => p.brand))).filter(Boolean);
  
  // Fonction de filtrage très pro
  const filteredProducts = rawProducts
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
      <div className="relative h-[40vh] md:h-[50vh] w-full flex items-center overflow-hidden">
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
              Collection
            </motion.span>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-sans font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight uppercase"
            >
              {info.title}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.3 }}
              className="text-gray-650 dark:text-gray-300 text-lg md:text-xl font-normal leading-relaxed"
            >
              {info.subtitle}
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* FILTRES PAR SOUS-CATÉGORIES */}
        {SUBCATEGORY_MAP[categoryId] && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 p-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-gray-150 dark:border-zinc-800/50 rounded-xl shadow-sm mb-8"
          >
            {SUBCATEGORY_MAP[categoryId].map((sub, index) => {
              const isActive = selectedSubcategory === sub.id;
              const count = sub.id 
                ? rawProducts.filter(p => p.subcategory === sub.id).length
                : rawProducts.length;
                
              return (
                <motion.button
                  key={sub.id}
                  whileHover={{ scale: 1.02, y: -0.5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`
                    px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2
                    ${isActive 
                      ? 'bg-brand-blue text-white shadow-sm' 
                      : 'bg-white/80 dark:bg-zinc-900/85 text-gray-600 dark:text-gray-400 border border-gray-150 dark:border-zinc-800/85 hover:bg-white dark:hover:bg-zinc-800/80 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <span>{sub.name}</span>
                  <span className={`
                    text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors duration-300
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* BARRE D'OUTILS ET FILTRES (Fonctionnalité Moderne) */}
        <div className="flex flex-col lg:flex-row justify-between items-center bg-white dark:bg-brand-card-dark p-4 rounded-xl shadow-sm mb-8 border border-gray-150 dark:border-zinc-800 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              aria-label="Rechercher dans cette catégorie"
              type="text" 
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white transition-colors text-sm"
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
              className="w-1/2 lg:w-32 py-2 px-3 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white transition-colors"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input 
              aria-label="Prix maximum"
              type="number" 
              placeholder="Prix max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 lg:w-32 py-2 px-3 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-brand-blue dark:text-white transition-colors"
            />
          </div>

          {/* FILTRE PAR MARQUE */}
          <div className="flex items-center gap-3 w-full lg:w-auto relative">
            <Filter size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
            <select 
              aria-label="Filtrer par marque"
              className="w-full lg:w-48 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 dark:text-white py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:border-brand-blue appearance-none cursor-pointer"
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
              className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 dark:text-white py-2 px-4 text-sm rounded-lg focus:outline-none focus:border-brand-blue flex-1 cursor-pointer"
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
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
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
