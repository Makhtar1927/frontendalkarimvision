import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Glasses, Sparkles, Watch, Layers, ChevronRight } from 'lucide-react';

const categories = [
  {
    id: 'glasses',
    num: '01',
    name: 'OPTIQUE',
    title: 'Lunettes de Soleil & Vue',
    description: 'Montures de créateurs et verres haute technologie pour sublimer votre regard.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    icon: Glasses,
    route: '/category/glasses',
    themeColor: 'rgba(59, 130, 246, 0.5)' // Brand Blue glow
  },
  {
    id: 'perfume',
    num: '02',
    name: 'PARFUMERIE',
    title: 'Fragrances de Luxe',
    description: 'Une sélection de parfums de niche rares et d\'essences d\'exception.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop',
    icon: Sparkles,
    route: '/category/perfume',
    themeColor: 'rgba(212, 175, 55, 0.5)' // Gold glow
  },
  {
    id: 'watches',
    num: '03',
    name: 'HORLOGERIE',
    title: 'Montres de Prestige',
    description: 'Garde-temps automatiques et quartz issus de grandes manufactures.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
    icon: Watch,
    route: '/category/watches',
    themeColor: 'rgba(139, 92, 246, 0.5)' // Purple glow
  },
  {
    id: 'other',
    num: '04',
    name: 'COLLECTION DIVERS',
    title: 'Articles Variés',
    description: 'Accessoires exclusifs, maroquinerie et sélections lifestyle.',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop',
    icon: Layers,
    route: '/category/other',
    themeColor: 'rgba(236, 72, 153, 0.5)' // Pink glow
  }
];

const CategoryGrids = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-16 bg-white dark:bg-brand-gray-dark border-b border-gray-100 dark:border-zinc-900 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* EDITORIAL HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-1 w-8 bg-brand-blue rounded-full"></span>
              <h3 className="text-brand-blue font-bold tracking-[0.25em] text-xs uppercase">Nos Rayons</h3>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black dark:text-white uppercase tracking-tight leading-none">
              Choisissez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-amber-500">univers</span>
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm leading-relaxed border-l-2 border-gray-150 dark:border-zinc-800 pl-4">
            Al Karim Vision réunit le meilleur de nos différents univers pour une expérience shopping unique et mémorable.
          </p>
        </div>

        {/* ASYMMETRICAL EDITORIAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                role="button"
                tabIndex={0}
                onClick={() => navigate(cat.route)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(cat.route)}
                aria-label={`Découvrir la catégorie ${cat.title}`}
                className="group relative h-[280px] sm:h-[320px] lg:h-[380px] w-full overflow-hidden cursor-pointer rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]"
                style={{
                  '--glow-color': cat.themeColor
                }}
              >
                {/* HUGE WATERMARK NUMBER */}
                <div className="absolute top-4 right-6 text-7xl sm:text-8xl font-black text-gray-250/20 dark:text-zinc-800/20 select-none group-hover:scale-110 group-hover:text-brand-blue/10 transition-all duration-700 font-mono z-0">
                  {cat.num}
                </div>

                {/* BACKGROUND IMAGE CONTAINER */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src={cat.image} 
                    alt={cat.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  />
                  {/* MULTI-LAYER PREMIUM GRADIENT OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:via-black/50 transition-all duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-radial-gradient transition-opacity duration-500 pointer-events-none" 
                       style={{ backgroundImage: `radial-gradient(circle at center, transparent 30%, ${cat.themeColor} 120%)` }} />
                </div>
                
                {/* GLASS CARD INNER CONTENT */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  
                  {/* TOP HEADER: ICON */}
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 group-hover:bg-brand-blue group-hover:border-brand-blue group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center justify-center">
                      <Icon className="text-white w-5 h-5 transition-transform duration-300 group-hover:rotate-12" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* BOTTOM FOOTER: TEXTS */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-brand-blue dark:text-brand-blue-accent tracking-[0.25em] uppercase block">
                        {cat.name}
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight uppercase group-hover:text-brand-blue transition-colors duration-300">
                        {cat.title}
                      </h4>
                    </div>

                    {/* HIDDEN DESCRIPTION (SLIDES UP ON HOVER) */}
                    <div className="h-0 opacity-0 overflow-hidden group-hover:h-auto group-hover:opacity-100 transition-all duration-500 ease-out">
                      <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-medium">
                        {cat.description}
                      </p>
                    </div>

                    {/* ACTION BUTTON LINK */}
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-blue group-hover:text-white transition-colors duration-300 tracking-widest uppercase pt-1">
                      <span>VOIR LA COLLECTION</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* PREMIUM GLOW OUTLINE */}
                <div className="absolute inset-0 border-0 group-hover:border-2 border-brand-blue/30 rounded-2xl transition-all duration-300 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CategoryGrids;