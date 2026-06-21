import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'glasses', name: 'Lunettes', route: '/category/glasses' },
  { id: 'perfume', name: 'Parfums', route: '/category/perfume' },
  { id: 'watches', name: 'Montres', route: '/category/watches' },
  { id: 'other', name: 'Divers', route: '/category/other' }
];

// On duplique pour créer l'effet de boucle infinie parfaite
const duplicatedCategories = [...categories, ...categories, ...categories, ...categories];

const QuickCategories = () => {
  return (
    <section className="py-6 bg-white dark:bg-bustantech-black border-t border-b border-gray-100 dark:border-gray-800/50 overflow-hidden">
      <div className="w-full">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">
          Parcourir par univers
        </h3>
        
        {/* Conteneur masquant le débordement */}
        <div className="relative flex overflow-hidden group">
          {/* Bande défilante animée */}
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            className="flex w-max gap-4 hover:[animation-play-state:paused] px-4"
          >
            {duplicatedCategories.map((cat, index) => (
              <Link 
                key={`${cat.id}-${index}`} 
                to={cat.route}
                className="shrink-0 flex items-center justify-center px-8 py-3.5 bg-gray-50 dark:bg-zinc-900/50 hover:bg-bustantech-gold text-gray-700 dark:text-gray-300 hover:text-white rounded-full border border-gray-100 dark:border-gray-800 transition-all duration-300 font-bold uppercase text-xs tracking-widest shadow-sm hover:shadow-md"
              >
                {cat.name}
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default QuickCategories;
