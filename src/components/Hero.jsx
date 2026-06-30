import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from './api';

const STATIC_FALLBACK_SLIDES = [
  {
    id: 1,
    title: "Bienvenue chez Al Karim Vision",
    subtitle: "Lunettes de marque, montres et parfums de qualité — Showroom à Touba.",
    category: "SHOWROOM",
    image: "/boutique-showroom.jpg",
    route: '/shop'
  },
  {
    id: 2,
    title: "Clarté & Style Unique",
    subtitle: "Des centaines de montures Ray-Ban, Gucci, Tom Ford, Prada et bien plus.",
    category: "LUNETTES",
    image: "/boutique-interieur-1.jpg",
    route: '/category/glasses'
  },
  {
    id: 3,
    title: "L'Essence du Luxe",
    subtitle: "Parfums authentiques avec et sans alcool, pour Elle & Lui.",
    category: "PARFUMERIE",
    image: "/boutique-interieur-2.jpg",
    route: '/category/perfume'
  },
  {
    id: 4,
    title: "Service Personnalisé",
    subtitle: "Un accueil chaleureux et des conseils adaptés à vos besoins.",
    category: "VOTRE BOUTIQUE",
    image: "/boutique-owner.jpg",
    route: '/shop'
  }
];

import { getOptimizedImageUrl } from '../utils/cloudinary';

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
      setSlides(STATIC_FALLBACK_SLIDES);
      setLoading(false);
    };

    fetchSlides();
  }, []);

  // Auto-play du slider toutes les 6 secondes
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
  const rawImage = currentSlide.image_url || currentSlide.image;
  const slideImage = getOptimizedImageUrl(rawImage);
  const slideRoute = currentSlide.link_url || currentSlide.route;
  const slideBtnText = currentSlide.button_text || "Découvrir la collection";


  return (
    <div className="relative h-[45vh] sm:h-[65vh] w-full overflow-hidden bg-white dark:bg-brand-gray-dark border-b border-gray-100 dark:border-zinc-800/80">
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
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}
          {/* Overlay avec touche de bleu logo doux pour uniformité */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-brand-blue-light/60 to-transparent dark:from-brand-gray-dark/95 dark:via-brand-blue/10 dark:to-transparent z-10"></div>
 
          <div className="relative z-20 px-4 w-full max-w-7xl mx-auto flex items-center">
            <div className="max-w-xl space-y-3 sm:space-y-4">
              {currentSlide.category && (
                <motion.span 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 uppercase backdrop-blur-md"
                >
                  {currentSlide.category}
                </motion.span>
              )}

              {currentSlide.title && (
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-5xl lg:text-6xl font-sans font-black text-gray-900 dark:text-white leading-tight tracking-tight uppercase"
                >
                  {currentSlide.title}
                </motion.h1>
              )}

              {currentSlide.subtitle && (
                <motion.p 
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs sm:text-base md:text-lg text-gray-650 dark:text-gray-300 max-w-lg font-normal leading-relaxed"
                >
                  {currentSlide.subtitle}
                </motion.p>
              )}

              {slideRoute && (
                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-2 sm:pt-4"
                >
                  <button
                    onClick={() => navigate(slideRoute)}
                    className="group flex items-center justify-center gap-2 sm:gap-3 bg-brand-blue text-white hover:bg-brand-blue-dark px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-lg font-bold text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 shadow-md shadow-brand-blue/15 hover:shadow-lg hover:shadow-brand-blue/30"
                  >
                    {slideBtnText}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Barre de Progression Interactive & Moderne (Style Luxury) */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 sm:bottom-8 right-4 sm:right-12 lg:right-24 flex gap-4 z-20 items-center">
          {slides.map((_, index) => {
            const isActive = current === index;
            return (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                aria-label={`Aller à la diapositive ${index + 1}`}
                className="group flex flex-col items-start gap-1 text-left focus:outline-none cursor-pointer"
              >
                <span className={`text-[9px] font-bold tracking-widest transition-colors duration-300 ${isActive ? 'text-brand-blue font-black' : 'text-gray-400 dark:text-zinc-500 group-hover:text-gray-650 dark:group-hover:text-zinc-300'}`}>
                  0{index + 1}
                </span>
                <div className="w-12 sm:w-16 h-[2px] bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                  {isActive && (
                    <motion.div 
                      key={`progress-${current}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6, ease: "linear" }}
                      className="absolute inset-y-0 left-0 bg-brand-blue"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Hero;