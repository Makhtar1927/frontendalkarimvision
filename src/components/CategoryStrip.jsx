import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'glasses', name: 'Lunettes',  route: '/category/glasses' },
  { id: 'perfume', name: 'Parfums',   route: '/category/perfume'  },
  { id: 'watches', name: 'Montres',   route: '/category/watches'  },
  { id: 'other',   name: 'Divers',    route: '/category/other'    },
  { id: 'shop',    name: 'Tout voir', route: '/shop'              },
];

const CategoryStrip = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white dark:bg-brand-gray-dark border-b border-gray-100 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-4 md:justify-center shrink-0">
          {CATEGORIES.map((cat, i) => {
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(cat.route)}
                className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-zinc-800 hover:border-brand-blue dark:hover:border-brand-blue bg-gray-50/50 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:text-brand-blue dark:hover:text-brand-blue shadow-xs hover:shadow-md transition-all duration-300 active:scale-95 shrink-0 cursor-pointer text-[10px] sm:text-xs font-black uppercase tracking-widest"
              >
                {cat.name}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryStrip;
