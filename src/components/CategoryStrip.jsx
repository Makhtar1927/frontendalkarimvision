import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Glasses, Wind, Watch, Package, Store } from 'lucide-react';

const CATEGORIES = [
  { id: 'glasses', name: 'Lunettes',  icon: Glasses, route: '/category/glasses' },
  { id: 'perfume', name: 'Parfums',   icon: Wind,    route: '/category/perfume'  },
  { id: 'watches', name: 'Montres',   icon: Watch,   route: '/category/watches'  },
  { id: 'other',   name: 'Divers',    icon: Package, route: '/category/other'    },
  { id: 'shop',    name: 'Tout voir', icon: Store,   route: '/shop'              },
];

const CategoryStrip = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white dark:bg-brand-gray-dark border-b border-gray-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 sm:justify-center sm:gap-2">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(cat.route)}
                className="flex flex-col items-center gap-1.5 min-w-[64px] sm:min-w-[80px] px-3 py-2.5 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-brand-blue/30 dark:hover:border-brand-blue/40 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all duration-200 active:scale-95 shrink-0 cursor-pointer group"
              >
                <Icon size={20} className="text-gray-500 dark:text-zinc-400 group-hover:text-brand-blue transition-colors" strokeWidth={1.5} />
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 dark:text-zinc-400 group-hover:text-brand-blue transition-colors uppercase tracking-wide whitespace-nowrap">
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryStrip;
