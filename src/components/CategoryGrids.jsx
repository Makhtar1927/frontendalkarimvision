import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    id: 'glasses',
    name: 'OPTIQUE',
    title: 'Lunettes de Soleil & Vue',
    description: 'Verres haute technologie et designs iconiques pour tous.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    icon: 'glasses',
    route: '/category/glasses'
  },
  {
    id: 'perfume',
    name: 'PARFUMERIE',
    title: 'Fragrances de Luxe',
    description: 'Une sélection exclusive de parfums de niche et rares.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop',
    icon: 'air',
    route: '/category/perfume'
  },
  {
    id: 'watches',
    name: 'HORLOGERIE',
    title: 'Montres de Prestige',
    description: 'Garde-temps automatiques et quartz de grandes manufactures.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
    icon: 'watch',
    route: '/category/watches'
  },
  {
    id: 'other',
    name: 'COLLECTION DIVERS',
    title: 'Articles Variés',
    description: 'Accessoires lifestyle, nouveautés et coups de cœur du moment.',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop',
    icon: 'auto_awesome',
    route: '/category/other'
  }
];

const CategoryGrids = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-20 bg-white dark:bg-brand-gray-dark border-b border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto">
        {/* EN-TÊTE COMPACT & ÉLÉGANT */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 gap-4">
          <div className="space-y-1">
            <h3 className="text-brand-blue font-bold tracking-[0.2em] text-[10px] sm:text-xs uppercase">NOS RAYONS</h3>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-sans font-black dark:text-white uppercase tracking-tight">Choisissez votre univers</h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm text-xs leading-relaxed">
            Al Karim Vision réunit le meilleur de nos différents univers pour une expérience shopping unique.
          </p>
        </div>

        {/* GRILLE DE CARTES ULTRA-PREMIUM */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              role="button"
              tabIndex={0}
              onClick={() => navigate(cat.route)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(cat.route)}
              aria-label={`Découvrir la catégorie ${cat.title}`}
              className="group relative h-[140px] sm:h-[180px] lg:h-[220px] overflow-hidden cursor-pointer rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* IMAGE DE FOND AVEC ZOOM */}
              <img 
                src={cat.image} 
                alt={cat.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
              />
              
              {/* OVERLAY DEGRADE SOMBRES */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20 group-hover:from-black/90 group-hover:via-black/55 group-hover:to-black/30 transition-all duration-300" />

              {/* CONTENU TEXTE ET ICONE */}
              <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-between z-10">
                {/* ICONE EN HAUT A GAUCHE */}
                <div className="self-start p-1.5 sm:p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 group-hover:bg-brand-blue group-hover:border-transparent transition-all duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[16px] sm:text-[20px] select-none transition-colors duration-300">
                    {cat.icon}
                  </span>
                </div>

                {/* TITRE ET ACTION EN BAS */}
                <div className="space-y-1 sm:space-y-1.5">
                  <span className="text-[8px] sm:text-[9px] font-black text-brand-blue tracking-[0.2em] uppercase">{cat.name}</span>
                  <h4 className="text-xs sm:text-base lg:text-lg font-black text-white leading-tight tracking-tight uppercase group-hover:text-brand-blue transition-colors duration-300">
                    {cat.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-gray-300 group-hover:text-white transition-colors duration-300 tracking-wider">
                    VOIR LA COLLECTION <span className="material-symbols-outlined text-[10px] sm:text-[12px] group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              </div>

              {/* BORDURE LUXE AU SURVOL */}
              <div className="absolute inset-0 border-0 group-hover:border-[1px] border-brand-blue/30 rounded-xl transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrids;