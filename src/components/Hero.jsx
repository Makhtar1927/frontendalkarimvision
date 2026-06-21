import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: "Clarté & Style Unique",
    subtitle: "Découvrez notre collection de lunettes de vue et de soleil.",
    category: "LUNETTES",
    color: "from-gray-200 to-white dark:from-zinc-900 dark:to-black",
    image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=1200&auto=format&fit=crop",
    route: '/category/glasses'
  },
  {
    id: 3,
    title: "L'Essence du Luxe",
    subtitle: "Parfums rares et fragrances envoûtantes pour Elle & Lui.",
    category: "PARFUMERIE",
    color: "from-gradient-sky to-white dark:from-stone-900 dark:to-black",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop",
    route: '/category/perfume'
  },
  {
    id: 5,
    title: "Horlogerie de Prestige",
    subtitle: "Gardez le contrôle du temps avec nos montres d'exception.",
    category: "MONTRES",
    color: "from-indigo-100 to-white dark:from-indigo-950/30 dark:to-black",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop",
    route: '/category/watches'
  },
  {
    id: 2,
    title: "Sélection Exclusive",
    subtitle: "Parcourez nos nouveautés, gadgets et articles divers.",
    category: "DIVERS",
    color: "from-sky-100 to-white dark:from-sky-950/30 dark:to-black",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop",
    route: '/category/other'
  }
];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // Auto-play du slider toutes le 5 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-white dark:bg-bustantech-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 flex items-center px-4 sm:px-8 lg:px-20"
        >
          <img 
            src={slides[current].image}
            alt={slides[current].title}
            fetchPriority={current === 0 ? "high" : "auto"}
            loading={current === 0 ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center md:object-right"
          />
          {/* Overlay: Sombre sur mobile (comme avant), Dégradé Premium sur desktop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] md:backdrop-blur-none md:bg-transparent md:bg-gradient-to-r md:from-white md:via-white/90 md:to-transparent dark:md:from-bustantech-black dark:md:via-bustantech-black/90 dark:md:to-transparent z-10"></div>

          <div className="relative max-w-2xl space-y-6 z-20">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 text-bustantech-gold font-bold tracking-[0.2em] text-sm"
            >
              <span className="w-10 h-[2px] bg-bustantech-gold"></span>
              {slides[current].category}
            </motion.div>

            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-luxury font-bold text-white md:text-bustantech-black dark:text-white leading-tight"
            >
              {slides[current].title}
            </motion.h1>

            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-base sm:text-lg md:text-xl text-gray-200 md:text-gray-700 dark:text-gray-300 max-w-xl"
            >
              {slides[current].subtitle}
            </motion.p>

            <motion.button
              onClick={() => navigate(slides[current].route)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center justify-center sm:justify-start gap-3 bg-bustantech-gold text-white w-full sm:w-auto px-8 py-4 rounded-full font-bold shadow-xl hover:bg-bustantech-gold-dark transition-all"
            >
              DÉCOUVRIR LA COLLECTION
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicateurs de Slide */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Aller à la diapositive ${index + 1}`}
            aria-current={current === index ? 'true' : 'false'}
            className={`h-1 transition-all duration-500 ${current === index ? 'w-12 bg-bustantech-gold' : 'w-4 bg-gray-300 dark:bg-gray-700'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;