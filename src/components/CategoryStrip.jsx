import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'glasses',
    name: 'Lunettes',
    sub: 'Soleil & Vue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 sm:w-7 sm:h-7">
        <path d="M2 12h3m14 0h3M5 12a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4M9 12a4 4 0 0 1 4-4h0M13 12a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4M17 12a4 4 0 0 1-4-4h0" strokeLinecap="round"/>
        <circle cx="7" cy="12" r="4" strokeLinecap="round"/>
        <circle cx="17" cy="12" r="4" strokeLinecap="round"/>
        <path d="M11 12h2" strokeLinecap="round"/>
      </svg>
    ),
    route: '/category/glasses',
    color: 'from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30',
    iconColor: 'text-sky-600 dark:text-sky-400',
    border: 'hover:border-sky-300 dark:hover:border-sky-700'
  },
  {
    id: 'perfume',
    name: 'Parfums',
    sub: 'Fragrances de Luxe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 sm:w-7 sm:h-7">
        <path d="M9 3h6l1 4H8L9 3z" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="6" y="7" width="12" height="14" rx="3" strokeLinecap="round"/>
        <path d="M12 3v-1M10 2h4" strokeLinecap="round"/>
        <path d="M9 13c0-1.657 1.343-3 3-3s3 1.343 3 3" strokeLinecap="round"/>
      </svg>
    ),
    route: '/category/perfume',
    color: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    border: 'hover:border-purple-300 dark:hover:border-purple-700'
  },
  {
    id: 'watches',
    name: 'Montres',
    sub: 'Prestige & Style',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 sm:w-7 sm:h-7">
        <circle cx="12" cy="12" r="6" strokeLinecap="round"/>
        <path d="M12 9v3l2 2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 3l-1 3M14 3l1 3M10 21l-1-3M14 21l1-3" strokeLinecap="round"/>
      </svg>
    ),
    route: '/category/watches',
    color: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'hover:border-amber-300 dark:hover:border-amber-700'
  },
  {
    id: 'other',
    name: 'Divers',
    sub: 'Accessoires & +',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 sm:w-7 sm:h-7">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    route: '/category/other',
    color: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-700'
  },
  {
    id: 'shop',
    name: 'Tout voir',
    sub: 'Toute la boutique',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 sm:w-7 sm:h-7">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
        <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
      </svg>
    ),
    route: '/shop',
    color: 'from-brand-blue/5 to-brand-blue/10 dark:from-brand-blue/10 dark:to-brand-blue/20',
    iconColor: 'text-brand-blue dark:text-brand-blue-accent',
    border: 'hover:border-brand-blue/40 dark:hover:border-brand-blue/50'
  }
];

const CategoryStrip = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white dark:bg-brand-gray-dark border-b border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Scrollable strip (mobile: scroll horizontal, desktop: flex centré) */}
        <div className="flex items-stretch gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-3 sm:py-4 sm:justify-center">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => navigate(cat.route)}
              className={`flex flex-col items-center justify-center gap-1.5 min-w-[72px] sm:min-w-[90px] px-3 sm:px-4 py-3 rounded-2xl bg-gradient-to-b ${cat.color} border border-gray-100 dark:border-zinc-800 ${cat.border} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 shrink-0 cursor-pointer group`}
            >
              <div className={`${cat.iconColor} transition-transform duration-200 group-hover:scale-110`}>
                {cat.icon}
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs font-black text-gray-800 dark:text-zinc-100 whitespace-nowrap">
                  {cat.name}
                </p>
                <p className="text-[8px] sm:text-[9px] text-gray-400 dark:text-zinc-500 font-medium whitespace-nowrap hidden sm:block">
                  {cat.sub}
                </p>
              </div>
            </motion.button>
          ))}

          {/* Flèche "Voir tout" uniquement mobile */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/shop')}
            className="sm:hidden flex items-center justify-center min-w-[40px] text-gray-400 dark:text-zinc-600 shrink-0"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default CategoryStrip;
