import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from './api';

const STATIC_FALLBACK_SLIDES = [
  {
    id: 1,
    title: "Clarté & Style Unique",
    subtitle: "Découvrez notre collection de lunettes de vue et de soleil.",
    category: "LUNETTES",
    image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=1200&auto=format&fit=crop",
    route: '/category/glasses'
  },
  {
    id: 3,
    title: "L'Essence du Luxe",
    subtitle: "Parfums rares et fragrances envoûtantes pour Elle & Lui.",
    category: "PARFUMERIE",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop",
    route: '/category/perfume'
  },
  {
    id: 5,
    title: "Horlogerie de Prestige",
    subtitle: "Gardez le contrôle du temps avec nos montres d'exception.",
    category: "MONTRES",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop",
    route: '/category/watches'
  },
  {
    id: 2,
    title: "Sélection Exclusive",
    subtitle: "Parcourez nos nouveautés, gadgets et articles divers.",
    category: "DIVERS",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop",
    route: '/category/other'
  }
];

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Charger les slides depuis l'API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await apiFetch('/slides');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setSlides(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Erreur chargement carrousel:", err);
      }
      // Fallback si l'API échoue ou renvoie un tableau vide
      setSlides(STATIC_FALLBACK_SLIDES);
      setLoading(false);
    };

    fetchSlides();
  }, []);

  // Auto-play du slider toutes les 6 secondes (uniquement si nous avons des slides)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  if (loading) {
    return (
      <div className="h-[45vh] sm:h-[60vh] w-full flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[current];
  const slideImage = currentSlide.image_url || currentSlide.image;
  const slideRoute = currentSlide.link_url || currentSlide.route;
  const slideBtnText = currentSlide.button_text || "Découvrir la collection";

  return (
    <div className="relative h-[45vh] sm:h-[60vh] w-full overflow-hidden bg-white dark:bg-brand-gray-dark border-b border-gray-100 dark:border-zinc-800/80">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex items-center px-4 sm:px-12 lg:px-24"
        >
          {slideImage && (
            <img 
              src={slideImage}
              alt={currentSlide.title || "Slide"}
              fetchPriority={current === 0 ? "high" : "auto"}
              loading={current === 0 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center animate-pulse-slow"
            />
          )}
          {/* Overlay corporatif premium : Dégradé doux */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-brand-gray-dark/95 dark:via-brand-gray-dark/80 dark:to-transparent z-10"></div>
 
          <div className="relative max-w-xl space-y-3 sm:space-y-6 z-20">
            {currentSlide.category && (
              <motion.div 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 sm:gap-3 text-brand-blue font-bold tracking-[0.25em] text-[10px] sm:text-xs uppercase"
              >
                <span className="w-6 sm:w-8 h-[2px] bg-brand-blue"></span>
                {currentSlide.category}
              </motion.div>
            )}

            {currentSlide.title && (
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-5xl lg:text-6xl font-sans font-black text-gray-900 dark:text-white leading-tight tracking-tight"
              >
                {currentSlide.title}
              </motion.h1>
            )}

            {currentSlide.subtitle && (
              <motion.p 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-lg font-normal leading-relaxed"
              >
                {currentSlide.subtitle}
              </motion.p>
            )}

            {slideRoute && (
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-1 sm:pt-2 space-y-3 sm:space-y-4"
              >
                <button
                  onClick={() => navigate(slideRoute)}
                  className="group flex items-center justify-center gap-2 sm:gap-3 bg-brand-blue text-white hover:bg-brand-blue-dark px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-lg font-bold text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 shadow-md shadow-brand-blue/15 hover:shadow-lg hover:shadow-brand-blue/30"
                >
                  {slideBtnText}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-gray-600 dark:text-gray-300">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-[10px]">✓</span>
                    Livraison Dakar 24h
                  </div>
                  <span className="w-px h-3 bg-gray-300 dark:bg-zinc-600 hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-gray-600 dark:text-gray-300">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 text-[10px]">★</span>
                    +500 clients satisfaits
                  </div>
                  <span className="w-px h-3 bg-gray-300 dark:bg-zinc-600 hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-gray-600 dark:text-gray-300">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center text-brand-blue text-[10px]">🔒</span>
                    Paiement Wave sécurisé
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicateurs de Slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 sm:bottom-8 left-4 sm:left-12 lg:left-24 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Aller à la diapositive ${index + 1}`}
              aria-current={current === index ? 'true' : 'false'}
              className={`h-1.5 transition-all duration-300 ${current === index ? 'w-8 sm:w-10 bg-brand-blue rounded-full' : 'w-1.5 sm:w-2 bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 rounded-full'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;