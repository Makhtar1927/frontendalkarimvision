import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Smartphone, Wind, Coffee, Headphones, Laptop } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: "L'Excellence Mobile",
    subtitle: "Découvrez les derniers smartphones haut de gamme.",
    category: "TÉLÉPHONES",
    color: "from-gray-200 to-white dark:from-zinc-900 dark:to-black",
    image: "https://res.cloudinary.com/dg8ppnqcy/image/upload/v1778875919/Boustanetech3_gstihc.png",
    route: '/category/tech'
  },
  {
    id: 5,
    title: "Puissance & Créativité",
    subtitle: "Ordinateurs portables et machines de pointe.",
    category: "ORDINATEURS",
    color: "from-indigo-100 to-white dark:from-indigo-950/30 dark:to-black",
    image: "https://res.cloudinary.com/dg8ppnqcy/image/upload/v1778875942/Boustanetech9_lathiv.png",
    route: '/category/computers'
  },
  {
    id: 2,
    title: "L'Écosystème Parfait",
    subtitle: "Protèges-écrans, chargeurs, casques et plus pour vos appareils.",
    category: "ACCESSOIRES TECH",
    color: "from-sky-100 to-white dark:from-sky-950/30 dark:to-black",
    image: "https://res.cloudinary.com/dg8ppnqcy/image/upload/v1778876042/Boustanetech7_xnwes1.png",
    route: '/category/accessories'
  },
  {
    id: 3,
    title: "L'Essence du Luxe",
    subtitle: "Parfums rares et fragrances envoûtantes pour Elle & Lui.",
    category: "PARFUMERIE",
    color: "from-bustantech-beige to-white dark:from-stone-900 dark:to-black",
    image: "https://res.cloudinary.com/dg8ppnqcy/image/upload/v1778876028/Boustanetech6_mktyyf.png",
    route: '/category/perfume'
  },
  {
    id: 4,
    title: "Le Réveil des Sens",
    subtitle: "Cafés de spécialité fraîchement torréfiés pour vos matins.",
    category: "COFFEE BAR",
    color: "from-amber-100 to-white dark:from-orange-950/20 dark:to-black",
    image: "https://res.cloudinary.com/dg8ppnqcy/image/upload/v1778876070/Boustanetech4_jvddxx.png",
    route: '/category/coffee'
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