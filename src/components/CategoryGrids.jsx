import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    id: 'glasses',
    subtitle: 'L\'art de la vision',
    title: 'Lunettes de Soleil & Vue',
    description: 'Une sélection de montures de créateurs dessinées pour affirmer votre regard tout en protégeant vos yeux avec précision.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    route: '/category/glasses'
  },
  {
    id: 'perfume',
    subtitle: 'L\'expression olfactive',
    title: 'Fragrances de Niche',
    description: 'Des sillages d\'exception et des accords rares, créés par des maîtres parfumeurs pour faire de chaque instant une signature unique.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop',
    route: '/category/perfume'
  },
  {
    id: 'watches',
    subtitle: 'La mesure du temps',
    title: 'Montres de Prestige',
    description: 'Des garde-temps alliant ingénierie de précision et esthétique intemporelle, conçus pour traverser les générations.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
    route: '/category/watches'
  },
  {
    id: 'other',
    subtitle: 'Le sens du détail',
    title: 'Objets de Style & Divers',
    description: 'Une collection d\'accessoires lifestyle et d\'objets choisis avec soin pour accompagner votre quotidien avec élégance.',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop',
    route: '/category/other'
  }
];

const CategoryGrids = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-16 bg-white dark:bg-brand-gray-dark border-b border-gray-100 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto">
        
        {/* EDITORIAL HEADER */}
        <div className="max-w-2xl mb-16 md:mb-24">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 tracking-[0.25em] uppercase block mb-3">
            Nos Collections
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 dark:text-white leading-tight mb-6">
            Découvrez nos différents univers
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
            Al Karim Vision réunit le meilleur de l'optique, de la haute parfumerie et de l'horlogerie de prestige pour vous offrir une expérience d'achat singulière.
          </p>
        </div>

        {/* LOOKBOOK ASYMMETRICAL MOSAIC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 lg:gap-24">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: index % 2 * 0.15 }}
              viewport={{ once: true, margin: "-100px" }}
              role="button"
              tabIndex={0}
              onClick={() => navigate(cat.route)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(cat.route)}
              className="group flex flex-col cursor-pointer w-full text-left"
            >
              {/* Image Frame with Clean Drop Shadow */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-50 dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800/60 transition-all duration-500 group-hover:shadow-md">
                <img 
                  src={cat.image} 
                  alt={cat.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                />
              </div>

              {/* Caption Content */}
              <div className="mt-6 sm:mt-8 space-y-2">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 tracking-[0.2em] uppercase block">
                  {cat.subtitle}
                </span>
                <h4 className="text-xl sm:text-2xl font-serif font-normal text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-brand-blue">
                  {cat.title}
                </h4>
                <p className="text-gray-500 dark:text-zinc-400 text-sm font-light leading-relaxed max-w-xl">
                  {cat.description}
                </p>
                
                {/* Elegant Underlined Link */}
                <div className="pt-2">
                  <span className="inline-block text-xs font-bold text-gray-900 dark:text-white border-b border-black dark:border-white pb-0.5 transition-all duration-300 group-hover:text-brand-blue group-hover:border-brand-blue">
                    Explorer l'univers
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryGrids;