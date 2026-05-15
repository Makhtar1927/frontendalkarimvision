import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Wind, Coffee, ChevronRight, Laptop, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    id: 'tech',
    name: 'TECHNOLOGIE',
    title: 'Téléphones & Smartphones',
    description: 'Les meilleurs téléphones toutes marques confondues.',
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800&auto=format&fit=crop', // Exemple d'iPhone
    icon: <Smartphone className="text-bustantech-gold" />,
    route: '/category/tech'
  },
  {
    id: 'computers',
    name: 'INFORMATIQUE',
    title: 'Ordinateurs & PC',
    description: 'Machines de travail, MacBooks et PC Gamers.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
    icon: <Laptop className="text-bustantech-gold" />,
    route: '/category/computers'
  },
  {
    id: 'accessories',
    name: 'ÉQUIPEMENTS',
    title: 'Accessoires Tech',
    description: 'Complétez votre écosystème technologique.',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop',
    icon: <Headphones className="text-bustantech-gold" />,
    route: '/category/accessories'
  },
  {
    id: 'perfume',
    name: 'PARFUMERIE',
    title: 'Fragrances de Luxe',
    description: 'Une sélection exclusive de parfums de niche.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop', // Exemple de Parfum
    icon: <Wind className="text-bustantech-gold" />,
    route: '/category/perfume'
  },
  {
    id: 'coffee',
    name: 'COFFEE SHOP',
    title: 'Art du Café',
    description: 'Grains d’exception et machines professionnelles.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop', // Exemple de Café
    icon: <Coffee className="text-bustantech-gold" />,
    route: '/category/coffee'
  }
];

const CategoryGrids = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-20 bg-white dark:bg-bustantech-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-4">
          <div className="space-y-2">
            <h3 className="text-bustantech-gold font-bold tracking-widest text-sm">NOS RAYONS</h3>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-luxury font-bold dark:text-white">Choisissez votre univers</h2>
          </div>
          <p className="text-gray-500 max-w-sm text-xs sm:text-sm">
            BoustaneTech Store réunit le meilleur de cinq mondes pour une expérience shopping unique.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              role="button"
              tabIndex={0}
              onClick={() => navigate(cat.route)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(cat.route)}
              aria-label={`Découvrir la catégorie ${cat.title}`}
              className="group relative h-[250px] sm:h-[350px] lg:h-[500px] overflow-hidden cursor-pointer rounded-2xl"
            >
              {/* IMAGE DE FOND AVEC ZOOM */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              
              {/* OVERLAY SOMBRE GRADIENT */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity group-hover:opacity-80" />

              {/* CONTENU TEXTE */}
              <div className="absolute inset-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-end">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                  <div className="p-1 sm:p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    {React.cloneElement(cat.icon, { size: 16, className: "text-bustantech-gold sm:w-6 sm:h-6" })}
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold text-bustantech-gold tracking-widest truncate">{cat.name}</span>
                </div>
                
                <h4 className="text-base sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight">{cat.title}</h4>
                <p className="hidden sm:block text-gray-300 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.description}
                </p>

                <div className="flex items-center gap-1 sm:gap-2 text-white font-bold text-[9px] sm:text-xs tracking-widest group-hover:text-bustantech-gold transition-colors mt-2 sm:mt-0">
                  DÉCOUVRIR <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* BORDURE DORÉE AU SURVOL (Optionnel) */}
              <div className="absolute inset-0 border-0 group-hover:border-[1px] border-bustantech-gold/50 transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrids;