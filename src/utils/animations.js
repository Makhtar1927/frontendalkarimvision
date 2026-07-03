/**
 * Configurations d'animation standardisées pour un rendu fluide et haut de gamme.
 * Inspirées des courbes de transition d'Apple, Stripe et Figma (snappy, organic & premium).
 */

// Courbe de transition principale (Bezier exponentielle ease-out)
export const PREMIUM_EASE = [0.16, 1, 0.3, 1];

// Durées standardisées
export const DURATIONS = {
  snappy: 0.25,
  normal: 0.35,
  smooth: 0.5,
};

// Transitions réutilisables
export const transitions = {
  // Entrées rapides et réactives (menus déroulants, popovers)
  snappy: {
    ease: PREMIUM_EASE,
    duration: DURATIONS.snappy,
  },
  
  // Transitions de page ou de contenu principal
  normal: {
    ease: PREMIUM_EASE,
    duration: DURATIONS.normal,
  },

  // Transitions plus amples (comme les sliders de fonds de Hero)
  smooth: {
    ease: PREMIUM_EASE,
    duration: DURATIONS.smooth,
  },

  // Éléments glissants avec un rebond infime pour un effet physique naturel (ex: Drawer panier, Modal de suivi)
  sheet: {
    type: 'spring',
    stiffness: 350,
    damping: 35,
  },
};

// Variantes prédéfinies
export const fadeUpVariants = {
  hidden: { 
    opacity: 0, 
    y: 12 
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: DURATIONS.normal,
      ease: PREMIUM_EASE,
    }
  })
};

export const fadeInVariants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATIONS.normal,
      ease: PREMIUM_EASE,
    }
  }
};
