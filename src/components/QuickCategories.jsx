import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Headphones, Wind, Coffee } from 'lucide-react';

const categories = [
  { id: 'tech', name: 'Téléphones', icon: <Smartphone size={20} />, route: '/category/tech' },
  { id: 'computers', name: 'Ordinateurs', icon: <Laptop size={20} />, route: '/category/computers' },
  { id: 'accessories', name: 'Accessoires', icon: <Headphones size={20} />, route: '/category/accessories' },
  { id: 'perfume', name: 'Parfumerie', icon: <Wind size={20} />, route: '/category/perfume' },
  { id: 'coffee', name: 'Coffee Shop', icon: <Coffee size={20} />, route: '/category/coffee' }
];

// On duplique pour créer l'effet de boucle infinie parfaite
const duplicatedCategories = [...categories, ...categories];

const QuickCategories = () => {
  return (
    <section className="py-6 bg-white dark:bg-bustantech-black border-t border-b border-gray-100 dark:border-gray-800/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-20">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center md:text-left">
          Parcourir par univers
        </h3>
        
        {/* Conteneur masquant le débordement */}
        <div className="relative flex overflow-hidden group">
          {/* Bande défilante animée */}
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
            className="flex w-max gap-3 hover:[animation-play-state:paused]"
          >
            {duplicatedCategories.map((cat, index) => (
              <Link 
                key={`${cat.id}-${index}`} 
                to={cat.route}
                className="shrink-0 flex flex-col items-center justify-center p-2 w-24 h-24 bg-gray-50 dark:bg-zinc-900/50 hover:bg-bustantech-gold/10 dark:hover:bg-bustantech-gold/20 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-bustantech-gold/50 transition-all duration-300"
              >
                {cat.isAll ? (
                  <div className="w-10 h-10 rounded-full bg-bustantech-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold tracking-widest text-[10px] shadow-sm mb-2 hover:scale-110 transition-transform">
                    TOUT
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-black shadow-sm flex items-center justify-center text-gray-500 hover:text-bustantech-gold hover:scale-110 transition-transform mb-2">
                    {cat.icon}
                  </div>
                )}
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 hover:text-bustantech-gold text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default QuickCategories;
