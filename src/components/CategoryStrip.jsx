import React from 'react';
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

  // Create two identical lists for seamless loop translation
  const firstList = [...CATEGORIES];
  const secondList = [...CATEGORIES];

  return (
    <section className="bg-white dark:bg-brand-gray-dark border-b border-gray-100 dark:border-zinc-900 py-3 overflow-hidden select-none relative">
      {/* Edge Gradients for Soft Fading effect */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white dark:from-brand-gray-dark to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white dark:from-brand-gray-dark to-transparent z-10 pointer-events-none" />

      {/* Styled Ticker Container */}
      <div className="w-full flex overflow-hidden">
        <div className="flex gap-4 whitespace-nowrap animate-marquee">
          
          {/* First loop of categories */}
          {firstList.map((cat) => (
            <button
              key={`first-${cat.id}`}
              onClick={() => navigate(cat.route)}
              className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-350 hover:text-brand-blue dark:hover:text-brand-blue shadow-xs hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer text-[10px] sm:text-xs font-black uppercase tracking-widest inline-block"
            >
              {cat.name}
            </button>
          ))}

          {/* Second loop of categories (exact duplicate for seamless wrap) */}
          {secondList.map((cat) => (
            <button
              key={`second-${cat.id}`}
              onClick={() => navigate(cat.route)}
              className="px-6 py-2.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-350 hover:text-brand-blue dark:hover:text-brand-blue shadow-xs hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer text-[10px] sm:text-xs font-black uppercase tracking-widest inline-block"
            >
              {cat.name}
            </button>
          ))}

        </div>
      </div>

      {/* Embedded CSS for smooth infinite hardware-accelerated marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default CategoryStrip;
